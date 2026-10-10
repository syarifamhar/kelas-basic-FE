/* three.js scenes: the hub "world map" (a small neon city), the box-model view and the z-index plate stack.
   Loaded as an ES module; exposes window.UXScenes and fires "uxscenes:ready" on window.
   Every scene returns { el, update?, refresh?, dispose }. */
import * as T from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { Reflector } from 'three/addons/objects/Reflector.js';

const REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const BG = 0x0B0E14;
// sha-labs logo gradient
const CYAN = 0x22D3FF, VIOLET = 0x8B5CFF, MAGENTA = 0xFF3DF0;

/* ───────── small helpers ───────── */
function rng(seed) {
  let a = seed >>> 0;
  return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new T.CanvasTexture(c); t.anisotropy = 4;
  return t;
}
function glowTex() {
  return canvasTex(64, 64, (g, w, h) => {
    const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,.35)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
  });
}
/* A tileable facade: 8×8 windows. Returns { map, emissive } textures. */
function facadeTiles(seed, wall, unlit, litColors, ratio) {
  const r = rng(seed), cells = [];
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) cells.push(r() < ratio ? litColors[Math.floor(r() * litColors.length)] : null);
  const draw = emissive => (g, w, h) => {
    g.fillStyle = emissive ? '#000' : wall; g.fillRect(0, 0, w, h);
    cells.forEach((c, i) => {
      const x = (i % 8) * 16 + 3, y = Math.floor(i / 8) * 16 + 4;
      if (emissive) { if (c) { g.fillStyle = c; g.fillRect(x, y, 10, 9); } }
      else { g.fillStyle = c || unlit; g.fillRect(x, y, 10, 9); }
    });
  };
  const mk = e => { const t = canvasTex(128, 128, draw(e)); t.wrapS = t.wrapT = T.RepeatWrapping; return t; };
  return { map: mk(false), emissive: mk(true) };
}
function signTex(text, color) {
  return canvasTex(256, 96, (g, w, h) => {
    g.fillStyle = 'rgba(8,10,16,.92)';
    g.beginPath(); g.roundRect ? g.roundRect(4, 4, w - 8, h - 8, 18) : g.rect(4, 4, w - 8, h - 8); g.fill();
    g.lineWidth = 6; g.strokeStyle = color; g.shadowColor = color; g.shadowBlur = 18; g.stroke();
    g.font = '700 58px "JetBrains Mono", ui-monospace, monospace'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = '#ffffff'; g.shadowBlur = 24; g.fillText(text, w / 2, h / 2 + 3);
    g.fillStyle = color; g.shadowBlur = 0; g.globalAlpha = .55; g.fillText(text, w / 2, h / 2 + 3);
  });
}

/* ───────── stage: renderer, camera orbit, input, optional bloom + flights ───────── */
function makeStage(el, o) {
  const r = new T.WebGLRenderer({ antialias: true, alpha: !o.bloom, powerPreference: 'high-performance' });
  const DPR = Math.min(o.bloom ? 1.75 : 2, window.devicePixelRatio || 1);
  r.setPixelRatio(DPR);
  const cv = r.domElement;
  cv.style.cssText = 'position:absolute;inset:0;display:block;width:100%;height:100%;touch-action:pan-y;cursor:grab';
  el.appendChild(cv);
  const scene = new T.Scene(), cam = new T.PerspectiveCamera(o.fov || 35, 1, 0.1, 400);
  if (!o.noLights) {
    scene.add(new T.AmbientLight(0xffffff, 0.5));
    const dl = new T.DirectionalLight(0xffffff, 0.85); dl.position.set(12, 24, 10); scene.add(dl);
    const rim = new T.DirectionalLight(0xB9A3FF, 0.35); rim.position.set(-14, 8, -10); scene.add(rim);
  }
  const orb = { theta: o.theta ?? 0.7, phi: o.phi ?? 1, radius: o.radius || 20, R: o.radius || 20, target: new T.Vector3(0, o.ty || 0, 0), auto: REDUCED ? 0 : (o.auto || 0) };
  let composer = null, bloom = null;
  if (o.bloom) {
    composer = new EffectComposer(r);
    composer.addPass(new RenderPass(scene, cam));
    bloom = new UnrealBloomPass(new T.Vector2(256, 256), o.bloom.strength, o.bloom.radius, o.bloom.threshold);
    composer.addPass(bloom);
  }
  let W = 1, H = 1;
  const st = { T, r, scene, cam, orb, el, cv, tick: null, hoverCursor: null, flight: null, onResize: null };
  const size = () => {
    W = el.clientWidth || 600; H = el.clientHeight || 400;
    r.setSize(W, H, false); cam.aspect = W / H; cam.updateProjectionMatrix();
    if (composer) { composer.setPixelRatio(DPR); composer.setSize(W, H); }
    if (st.onResize) st.onResize(W, H);
  };
  size();
  const ro = new ResizeObserver(size); ro.observe(el);
  let drag = null; const ndc = new T.Vector2();
  const setN = e => { const b = cv.getBoundingClientRect(); ndc.set(((e.clientX - b.left) / b.width) * 2 - 1, -((e.clientY - b.top) / b.height) * 2 + 1); };
  const down = e => { if (st.flight) return; drag = { x: e.clientX, y: e.clientY, m: 0 }; try { cv.setPointerCapture(e.pointerId); } catch (er) {} cv.style.cursor = 'grabbing'; };
  const move = e => {
    setN(e);
    if (drag) {
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag.x = e.clientX; drag.y = e.clientY; drag.m += Math.abs(dx) + Math.abs(dy);
      orb.theta -= dx * 0.008; orb.phi = Math.min(1.45, Math.max(0.35, orb.phi - dy * 0.006));
    } else if (o.onHover && !st.flight) o.onHover(ndc);
  };
  const up = e => { if (drag && drag.m < 6 && o.onClick) { setN(e); o.onClick(ndc); } drag = null; cv.style.cursor = st.hoverCursor || 'grab'; };
  const leave = () => { if (o.onHover && !drag) o.onHover(null); };
  cv.addEventListener('pointerdown', down); cv.addEventListener('pointermove', move); cv.addEventListener('pointerup', up); cv.addEventListener('pointerleave', leave);

  /* Smoothly move the camera to look at `to` from `radius` away, then call done(). */
  st.flyTo = (to, radius, phi, done) => {
    if (REDUCED) { done(); return; }
    st.flight = { t0: performance.now(), dur: 900, fromT: orb.target.clone(), toT: to.clone(), fromR: orb.R, toR: radius, fromP: orb.phi, toP: phi, fromTh: orb.theta, done };
    drag = null; cv.style.cursor = 'default';
  };
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  let raf = 0, last = performance.now();
  const clock = { t: 0, dt: 0 };
  const loop = now => {
    raf = requestAnimationFrame(loop);
    clock.dt = Math.min(0.05, (now - last) / 1000); last = now; clock.t += clock.dt;
    const f = st.flight;
    if (f) {
      const k = Math.min(1, (now - f.t0) / f.dur), e = ease(k);
      orb.target.lerpVectors(f.fromT, f.toT, e);
      orb.R = orb.radius = f.fromR + (f.toR - f.fromR) * e;
      orb.phi = f.fromP + (f.toP - f.fromP) * e;
      orb.theta = f.fromTh + 0.35 * e;
      if (k >= 1) { st.flight = null; f.done(); }
    } else {
      if (!drag) orb.theta += orb.auto;
      orb.R += (orb.radius - orb.R) * 0.08;
    }
    const sp = Math.sin(orb.phi);
    cam.position.set(orb.target.x + orb.R * sp * Math.sin(orb.theta), orb.target.y + orb.R * Math.cos(orb.phi), orb.target.z + orb.R * sp * Math.cos(orb.theta));
    cam.lookAt(orb.target);
    if (st.tick) st.tick(clock);
    if (composer) composer.render(); else r.render(scene, cam);
  };
  raf = requestAnimationFrame(loop);
  st.project = v => { const p = v.clone().project(cam); return { x: (p.x * 0.5 + 0.5) * W, y: (-p.y * 0.5 + 0.5) * H, behind: p.z > 1 }; };
  st.label = (text, color, extra) => {
    const d = document.createElement('div');
    d.style.cssText = 'position:absolute;left:0;top:0;pointer-events:none;white-space:nowrap;font:600 12px "JetBrains Mono",monospace;letter-spacing:.1em;color:' + color + ';' + (extra || '');
    d.textContent = text; el.appendChild(d); return d;
  };
  st.dispose = () => {
    cancelAnimationFrame(raf); ro.disconnect();
    const seen = new Set();
    const free = x => { if (x && !seen.has(x)) { seen.add(x); x.dispose(); } };
    scene.traverse(ob => {
      free(ob.geometry);
      (Array.isArray(ob.material) ? ob.material : [ob.material]).forEach(m => {
        if (!m) return;
        ['map', 'emissiveMap', 'alphaMap'].forEach(k => free(m[k]));
        if (m.uniforms && m.uniforms.tDiffuse) free(m.uniforms.tDiffuse.value);
        free(m);
      });
      if (ob.getRenderTarget) free(ob.getRenderTarget());
    });
    if (composer) { composer.renderTarget1.dispose(); composer.renderTarget2.dispose(); bloom.dispose(); }
    r.dispose(); el.innerHTML = '';
  };
  return st;
}

/* ───────── hub: a neon city with three districts ─────────
   opts: { lessons:[{id,level,title,n}], levels:[{key,name,color,hex}], onOpen(id), doneText } */
function makeHub(el, opts) {
  const small = (el.clientWidth || 800) < 700 || (navigator.hardwareConcurrency || 8) <= 4;
  let hov = null, busy = false, pick, hover;
  const st = makeStage(el, {
    radius: 46, phi: 0.98, theta: 0.5, auto: 0.0010, fov: 30, ty: 1.5, noLights: true,
    bloom: { strength: 0.8, radius: 0.45, threshold: 0.55 },
    onHover: n => hover(n),
    onClick: n => {
      const b = pick(n); if (!b || busy) return;
      busy = true; hover(null);
      const u = b.userData;
      st.flyTo(new T.Vector3(u.x, u.top * 0.55, u.z), 12 + u.top * 0.6, 1.08, () => opts.onOpen(u.id));
    }
  });
  const { scene, cam } = st;
  const rand = rng(2048);
  scene.background = new T.Color(BG);
  scene.fog = new T.Fog(BG, 48, 105);

  /* lights: moonlight + logo-colored fills */
  scene.add(new T.HemisphereLight(0x46508a, 0x07080c, 0.55));
  scene.add(new T.AmbientLight(0xffffff, 0.12));
  const moon = new T.DirectionalLight(0xbfd4ff, 0.45); moon.position.set(-10, 30, 18); scene.add(moon);
  const fillC = new T.DirectionalLight(CYAN, 0.25); fillC.position.set(-30, 10, 10); scene.add(fillC);
  const fillM = new T.DirectionalLight(MAGENTA, 0.22); fillM.position.set(30, 10, -10); scene.add(fillM);

  /* shared geometry + textures */
  const G = {
    box: new T.BoxGeometry(1, 1, 1),
    sphere: new T.SphereGeometry(1, 12, 8),
    cyl: new T.CylinderGeometry(1, 1, 1, 10),
    cone: new T.ConeGeometry(1, 1, 7),
    plane: new T.PlaneGeometry(1, 1)
  };
  G.boxE = new T.EdgesGeometry(G.box);
  const glow = glowTex();
  const basic = (color, extra) => new T.MeshBasicMaterial(Object.assign({ color, toneMapped: false }, extra || {}));
  const addGlow = (parent, x, y, z, s, color, opacity) => {
    const m = new T.Mesh(G.plane, new T.MeshBasicMaterial({ map: glow, color, transparent: true, opacity: opacity ?? 0.6, depthWrite: false, blending: T.AdditiveBlending, toneMapped: false }));
    m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); m.scale.set(s, s, 1); parent.add(m); return m;
  };
  const blinkers = [], searchlights = [];

  /* ground: mirror (desktop) under a dark, slightly see-through floor */
  let mirror = null;
  if (!small) {
    mirror = new Reflector(new T.PlaneGeometry(220, 220), { textureWidth: 1024, textureHeight: 1024, color: 0x5a5f70, multisample: 0 });
    mirror.rotation.x = -Math.PI / 2; mirror.position.y = -0.01; scene.add(mirror);
  }
  /* pull the camera back on narrow screens so all three districts fit */
  st.onResize = (w, h) => {
    if (mirror) mirror.getRenderTarget().setSize(Math.round(w * 0.6), Math.round(h * 0.6));
    if (!st.flight && !busy) st.orb.radius = 46 * Math.max(1, Math.pow(1.7 / (w / h), 0.85));
  };
  st.onResize(el.clientWidth || 800, el.clientHeight || 500);
  st.orb.R = st.orb.radius;
  const floor = new T.Mesh(new T.PlaneGeometry(220, 220), new T.MeshStandardMaterial({ color: 0x0c1017, roughness: 0.35, metalness: 0.4, transparent: !small, opacity: small ? 1 : 0.8 }));
  floor.rotation.x = -Math.PI / 2; scene.add(floor);
  const grid = new T.GridHelper(160, 80, 0x1c2635, 0x141a24); grid.position.y = 0.012; grid.material.transparent = true; grid.material.opacity = 0.55; scene.add(grid);

  /* roads: a main avenue in front + two cross streets */
  const ROAD_Z = 8.6;
  const roadMat = new T.MeshStandardMaterial({ color: 0x11151e, roughness: 0.5, metalness: 0.3 });
  const road = (w, d, x, z) => { const m = new T.Mesh(G.box, roadMat); m.scale.set(w, 0.06, d); m.position.set(x, 0.03, z); scene.add(m); };
  road(70, 2.8, 0, ROAD_Z); road(2.4, 22, -7.5, -1.5); road(2.4, 22, 7.5, -1.5);
  const dash = basic(0x3a4862);
  for (let x = -34; x <= 34; x += 2) { const d = new T.Mesh(G.box, dash); d.scale.set(0.9, 0.02, 0.1); d.position.set(x, 0.07, ROAD_Z); scene.add(d); }
  const curb = basic(CYAN, { transparent: true, opacity: 0.55 });
  [-1, 1].forEach(s => { const c = new T.Mesh(G.box, curb); c.scale.set(70, 0.03, 0.06); c.position.set(0, 0.07, ROAD_Z + s * 1.4); scene.add(c); });

  /* street lamps along the avenue */
  const poleMat = new T.MeshStandardMaterial({ color: 0x2a3344, roughness: 0.6, metalness: 0.5 });
  for (let x = -30; x <= 30; x += 6) {
    [-1, 1].forEach((s, si) => {
      const lx = x + si * 3, lz = ROAD_Z + s * 1.9;
      const p = new T.Mesh(G.cyl, poleMat); p.scale.set(0.05, 1.9, 0.05); p.position.set(lx, 0.95, lz); scene.add(p);
      const arm = new T.Mesh(G.box, poleMat); arm.scale.set(0.05, 0.05, 0.5); arm.position.set(lx, 1.88, lz - s * 0.22); scene.add(arm);
      const col = si ? 0xffd9f6 : 0xc9f4ff;
      const bulb = new T.Mesh(G.sphere, basic(col)); bulb.scale.setScalar(0.09); bulb.position.set(lx, 1.82, lz - s * 0.45); scene.add(bulb);
      addGlow(scene, lx, 0.08, lz - s * 0.45, 2.6, si ? MAGENTA : CYAN, 0.35);
    });
  }

  /* building pieces */
  const pad = n => (n < 10 ? '0' : '') + n;
  const FACADE = {
    beginner: { wall: '#2a2723', unlit: '#14161c', lit: ['#FFD58A', '#FFC877', '#FFE7B0'], roof: 0x3a2f2a },
    intermediate: { wall: '#1b2232', unlit: '#0e131d', lit: ['#DCD3FF', '#B9A3FF', '#E6EDF3', '#9FD8FF'], roof: 0x1a1f2c },
    advanced: { wall: '#151926', unlit: '#0b0e16', lit: ['#FFC877', '#FF93B5', '#7FD4FF', '#FFFFFF'], roof: 0x141824 }
  };
  const tiles = {};
  Object.keys(FACADE).forEach((k, i) => {
    const f = FACADE[k];
    tiles[k] = { normal: facadeTiles(11 + i, f.wall, f.unlit, f.lit, 0.32), done: facadeTiles(11 + i, f.wall, f.unlit, f.lit, 0.82) };
  });
  /* a facade material whose windows tile at a fixed size, for a w×h surface */
  const facade = (lv, w, h, bld) => {
    const set = tiles[lv], rep = (tx) => { const c = tx.clone(); c.needsUpdate = true; c.repeat.set(Math.max(1, w / 2.2), Math.max(1, h / 2.2)); return c; };
    const m = new T.MeshStandardMaterial({ map: rep(set.normal.map), emissive: 0xffffff, emissiveMap: rep(set.normal.emissive), emissiveIntensity: 0.9, roughness: 0.65, metalness: 0.2 });
    const doneMap = rep(set.done.emissive);
    bld.facades.push({ m, normalMap: m.emissiveMap, doneMap });
    return m;
  };
  const roofMat = c => new T.MeshStandardMaterial({ color: c, roughness: 0.8, metalness: 0.1 });
  const boxTier = (g, lv, w, h, d, y, bld, roofColor) => {
    const fm = facade(lv, w, h, bld), rm = roofMat(roofColor);
    const m = new T.Mesh(G.box, [fm, fm, rm, rm, fm, fm]); m.scale.set(w, h, d); m.position.y = y + h / 2; g.add(m);
    const e = new T.LineSegments(G.boxE, new T.LineBasicMaterial({ color: bld.hex, transparent: true, opacity: 0.55 })); e.scale.copy(m.scale); e.position.copy(m.position); g.add(e);
    bld.edges.push(e.material);
    return y + h;
  };
  const gable = (g, w, d, h, y, color, edgeHex) => {
    const s = new T.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(0, h); s.closePath();
    const geo = new T.ExtrudeGeometry(s, { depth: d, bevelEnabled: false }); geo.translate(0, 0, -d / 2);
    const m = new T.Mesh(geo, roofMat(color)); m.position.y = y; g.add(m);
    const e = new T.LineSegments(new T.EdgesGeometry(geo), new T.LineBasicMaterial({ color: edgeHex, transparent: true, opacity: 0.7 })); e.position.y = y; g.add(e);
    return y + h;
  };
  /* neon number sign floating over the roof; a sprite, so it always faces the camera */
  const sign = (g, num, color, y, bld) => {
    const sp = new T.Sprite(new T.SpriteMaterial({ map: signTex(num, color), toneMapped: false, transparent: true, depthWrite: false }));
    sp.scale.set(2, 0.75, 1); sp.position.y = y + 0.9; g.add(sp);
    bld.sign = sp;
  };
  const antenna = (g, x, y, z, h, color) => {
    const a = new T.Mesh(G.cyl, poleMat); a.scale.set(0.035, h, 0.035); a.position.set(x, y + h / 2, z); g.add(a);
    const tip = new T.Mesh(G.sphere, basic(color)); tip.scale.setScalar(0.08); tip.position.set(x, y + h, z); g.add(tip);
    blinkers.push({ m: tip, phase: rand() * 6 });
  };
  const tree = (parent, x, z, s) => {
    const trunk = new T.Mesh(G.cyl, new T.MeshStandardMaterial({ color: 0x3a2c22, roughness: 0.9 })); trunk.scale.set(0.07 * s, 0.5 * s, 0.07 * s); trunk.position.set(x, 0.6 + 0.25 * s, z); parent.add(trunk);
    const leaves = new T.Mesh(G.cone, new T.MeshStandardMaterial({ color: 0x173a2d, emissive: 0x7EF2C3, emissiveIntensity: 0.12, roughness: 0.8, flatShading: true }));
    leaves.scale.set(0.42 * s, 1.0 * s, 0.42 * s); leaves.position.set(x, 0.6 + 0.5 * s + 0.45 * s, z); parent.add(leaves);
  };

  /* builders per district theme. Each returns the top height of the building. */
  const BUILD = {
    /* kampung: warm houses with gable roofs, chimneys and lantern strings */
    beginner(g, l, i, bld) {
      const floors = 1 + (i % 3), h = 0.9 * floors + 0.3;
      let y = boxTier(g, 'beginner', 2.2, h, 2.0, 0, bld, FACADE.beginner.roof);
      y = gable(g, 2.6, 2.3, 1.0, y, 0x4a3328, bld.hex);
      if (i % 2 === 0) { const ch = new T.Mesh(G.box, roofMat(0x3b302b)); ch.scale.set(0.25, 0.6, 0.25); ch.position.set(0.6, y - 0.5, -0.4); g.add(ch); }
      const door = new T.Mesh(G.plane, basic(0xFFD58A)); door.scale.set(0.35, 0.6, 1); door.position.set(0, 0.3, 1.011); g.add(door);
      sign(g, pad(l.n), bld.color, y, bld);
      return y;
    },
    /* kota: setback towers with water tanks, rooftop units and a billboard */
    intermediate(g, l, i, bld) {
      const H = 3.2 + i * 0.7;
      let y = boxTier(g, 'intermediate', 2.2, H * 0.55, 2.2, 0, bld, FACADE.intermediate.roof);
      y = boxTier(g, 'intermediate', 1.75, H * 0.3, 1.75, y, bld, FACADE.intermediate.roof);
      y = boxTier(g, 'intermediate', 1.25, H * 0.15, 1.25, y, bld, FACADE.intermediate.roof);
      const tank = new T.Mesh(G.cyl, new T.MeshStandardMaterial({ color: 0x2b3142, roughness: 0.6 })); tank.scale.set(0.28, 0.45, 0.28); tank.position.set(-0.3, y + 0.23, 0.2); g.add(tank);
      const ac = new T.Mesh(G.box, new T.MeshStandardMaterial({ color: 0x3a4256 })); ac.scale.set(0.35, 0.2, 0.3); ac.position.set(0.35, y + 0.1, -0.25); g.add(ac);
      if (i % 2 === 1) antenna(g, 0.35, y, 0.3, 1.2, 0xFF5A6E);
      sign(g, pad(l.n), bld.color, y + (i % 2 ? 1.2 : 0.5), bld);
      return y;
    },
    /* pusat kota futuristik: tapered hex towers, holo rings and spires */
    advanced(g, l, i, bld) {
      const H = 5.4 + i * 0.95, rb = 1.0, rt = 0.66;
      const fm = facade('advanced', Math.PI * 2 * rb, H, bld);
      const body = new T.Mesh(new T.CylinderGeometry(rt, rb, H, 6, 1), [fm, roofMat(FACADE.advanced.roof), roofMat(FACADE.advanced.roof)]);
      body.position.y = H / 2; g.add(body);
      const e = new T.LineSegments(new T.EdgesGeometry(body.geometry), new T.LineBasicMaterial({ color: bld.hex, transparent: true, opacity: 0.6 })); e.position.copy(body.position); g.add(e); bld.edges.push(e.material);
      const ringMat = basic(i % 2 ? 0xFF93B5 : bld.hex, { transparent: true, opacity: 0.85 });
      [0.45, 0.75].forEach((k, ri) => {
        const ring = new T.Mesh(new T.TorusGeometry(0.9 + (1 - k) * 0.4, 0.025, 6, 48), ringMat);
        ring.rotation.x = Math.PI / 2; ring.position.y = H * k; g.add(ring);
        bld.spin.push({ m: ring, s: (ri ? -1 : 1) * (0.3 + rand() * 0.3) });
      });
      antenna(g, 0, H, 0, 1.4 + (i % 2) * 0.8, 0xFF5A6E);
      sign(g, pad(l.n), bld.color, H + 2.2 + (i % 2) * 0.8, bld);
      return H + 1.4;
    }
  };

  /* districts */
  const blds = [], hits = [], labels = [];
  const slots = [[-3.4, -2.3], [0, -2.6], [3.4, -2.3], [-1.8, 2], [1.8, 2]];
  opts.levels.forEach((lv, li) => {
    const cx = (li - 1) * 15, cz = li === 1 ? -2.5 : 1.5;
    const pfColor = [0x101a17, 0x121722, 0x0f111b][li];
    const pf = new T.Mesh(G.box, new T.MeshStandardMaterial({ color: pfColor, roughness: 0.85 })); pf.scale.set(12, 0.6, 10); pf.position.set(cx, 0.3, cz); scene.add(pf);
    const pe = new T.LineSegments(G.boxE, new T.LineBasicMaterial({ color: lv.hex, transparent: true, opacity: 0.6 })); pe.scale.copy(pf.scale); pe.position.copy(pf.position); scene.add(pe);
    const top = new T.Group(); top.position.set(cx, 0.6, cz); scene.add(top);

    if (lv.key === 'beginner') {
      // footpaths, trees and a string of warm lanterns
      const path = new T.MeshStandardMaterial({ color: 0x2a2620, roughness: 0.95 });
      [[0, 0, 10.5, 0.7], [0, 0, 0.7, 8.5]].forEach(p => { const m = new T.Mesh(G.box, path); m.scale.set(p[2], 0.02, p[3]); m.position.set(p[0], 0.01, p[1]); top.add(m); });
      [[-5, -4.2, 1], [5.1, -4.1, 1.1], [-5.2, 3.8, 0.9], [5.2, 4, 1], [-4.6, 0.2, 0.8], [4.7, 0.1, 0.85], [0, 4.3, 0.7], [-2.5, 4.4, 0.75], [2.6, 4.4, 0.75]].forEach(t => tree(top, t[0], t[1], t[2]));
      const lanterns = [[-5, 3.8], [-1.8, 4.3], [1.8, 4.3], [5.2, 4]];
      for (let k = 0; k < lanterns.length - 1; k++) {
        const a = lanterns[k], b = lanterns[k + 1];
        for (let s = 1; s < 6; s++) {
          const t = s / 6, x = a[0] + (b[0] - a[0]) * t, z = a[1] + (b[1] - a[1]) * t, y = 1.25 - Math.sin(t * Math.PI) * 0.3;
          const bulb = new T.Mesh(G.sphere, basic([0xFFD58A, 0xFF93B5, 0x7EF2C3][s % 3])); bulb.scale.setScalar(0.06); bulb.position.set(x, y, z); top.add(bulb);
          blinkers.push({ m: bulb, phase: rand() * 6, soft: true });
        }
      }
      addGlow(top, 0, 0.03, 0, 9, 0xFFC877, 0.12);
    } else if (lv.key === 'intermediate') {
      // sidewalk lines, planters and a lilac billboard
      const line = basic(0x2a3144);
      for (let k = -2; k <= 2; k++) { const m = new T.Mesh(G.box, line); m.scale.set(11, 0.015, 0.03); m.position.set(0, 0.01, k * 2.2); top.add(m); }
      [[-5.2, 4.2], [5.2, 4.2], [-5.2, -4.3], [5.2, -4.3]].forEach(p => tree(top, p[0], p[1], 0.7));
      const bbTex = canvasTex(256, 128, (g, w, h) => {
        const gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, '#22D3FF'); gr.addColorStop(0.5, '#8B5CFF'); gr.addColorStop(1, '#FF3DF0');
        g.fillStyle = '#0b0e14'; g.fillRect(0, 0, w, h); g.strokeStyle = gr; g.lineWidth = 8; g.strokeRect(6, 6, w - 12, h - 12);
        g.fillStyle = gr; g.font = '700 46px "Space Grotesk", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('sha-labs', w / 2, h / 2 + 2);
      });
      const bbPole = new T.Mesh(G.box, poleMat); bbPole.scale.set(0.1, 2.4, 0.1); bbPole.position.set(-5.3, 1.2, 0.6); top.add(bbPole);
      [1, -1].forEach(s => { const bb = new T.Mesh(G.plane, new T.MeshBasicMaterial({ map: bbTex, toneMapped: false })); bb.scale.set(2, 1, 1); bb.position.set(-5.3, 2.7, 0.6 + s * 0.06); if (s < 0) bb.rotation.y = Math.PI; top.add(bb); });
    } else {
      // glowing tile grid and sweeping searchlights
      const gridTex = canvasTex(256, 256, (g, w, h) => {
        g.fillStyle = '#000'; g.fillRect(0, 0, w, h); g.strokeStyle = '#FFC877'; g.globalAlpha = 0.5; g.lineWidth = 2;
        for (let k = 0; k <= 8; k++) { g.beginPath(); g.moveTo(k * 32, 0); g.lineTo(k * 32, h); g.moveTo(0, k * 32); g.lineTo(w, k * 32); g.stroke(); }
      });
      const tilesM = new T.Mesh(G.plane, new T.MeshBasicMaterial({ map: gridTex, transparent: true, opacity: 0.35, blending: T.AdditiveBlending, depthWrite: false, toneMapped: false }));
      tilesM.rotation.x = -Math.PI / 2; tilesM.scale.set(11.6, 9.6, 1); tilesM.position.y = 0.012; top.add(tilesM);
      const beamGeo = new T.ConeGeometry(0.8, 22, 24, 1, true); beamGeo.translate(0, -11, 0); beamGeo.rotateX(Math.PI);
      [[-5.4, 4.4, 0xFFC877], [5.4, 4.4, 0xFF93B5]].forEach((p, k) => {
        const base = new T.Group(); base.position.set(p[0], 0, p[1]); top.add(base);
        const lamp = new T.Mesh(G.cyl, poleMat); lamp.scale.set(0.25, 0.3, 0.25); lamp.position.y = 0.15; base.add(lamp);
        const beam = new T.Mesh(beamGeo, new T.MeshBasicMaterial({ color: p[2], transparent: true, opacity: 0.05, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide, toneMapped: false }));
        beam.position.y = 0.3; base.add(beam);
        searchlights.push({ beam, k });
      });
    }

    opts.lessons.filter(l => l.level === lv.key).forEach((l, i) => {
      const sl = slots[i] || [((i - 5) % 3 - 1) * 3.4, 4.2];
      const g = new T.Group(); g.position.set(sl[0], 0, sl[1]); top.add(g);
      const bld = { id: l.id, title: l.title, num: pad(l.n), color: lv.color, hex: lv.hex, facades: [], edges: [], spin: [], done: false, lift: 0, glow: 0 };
      const h = BUILD[lv.key](g, l, i, bld);
      // completion beacon: a light pillar + halo, faded in when done
      const pillar = new T.Mesh(G.cyl, basic(lv.hex, { transparent: true, opacity: 0, blending: T.AdditiveBlending, depthWrite: false }));
      pillar.scale.set(0.07, 18, 0.07); pillar.position.y = h + 9; g.add(pillar);
      const halo = addGlow(g, 0, 0.03, 0, 4.2, lv.hex, 0);
      Object.assign(bld, { group: g, pillar, halo, top: h + 1.6, x: cx + sl[0], z: cz + sl[1] });
      const hit = new T.Mesh(G.box, new T.MeshBasicMaterial()); hit.visible = false;
      hit.scale.set(2.6, h + 0.2, 2.6); hit.position.set(sl[0], (h + 0.2) / 2, sl[1]); top.add(hit);
      hit.userData = bld; hits.push(hit); blds.push(bld);
    });
    labels.push({ div: st.label(lv.name.toUpperCase(), lv.color, 'padding:4px 8px;background:rgba(13,16,22,.8);border:1px solid #263042;border-radius:6px'), pos: new T.Vector3(cx, 0.7, cz + 5.4) });
  });

  /* cars on the avenue and the cross streets */
  const cars = [];
  const carCols = [0x7FD4FF, 0xB9A3FF, 0xFF93B5, 0x7EF2C3, 0xFFC877, 0xE6EDF3];
  const makeCar = (i) => {
    const c = new T.Group();
    const body = new T.Mesh(G.box, new T.MeshStandardMaterial({ color: carCols[i % carCols.length], roughness: 0.35, metalness: 0.5 })); body.scale.set(0.95, 0.28, 0.48); body.position.y = 0.24; c.add(body);
    const cabin = new T.Mesh(G.box, new T.MeshStandardMaterial({ color: 0x0d1018, roughness: 0.2, metalness: 0.7 })); cabin.scale.set(0.5, 0.22, 0.42); cabin.position.set(-0.05, 0.48, 0); c.add(cabin);
    const head = basic(0xffffff), tail = basic(0xff2a4a);
    [-0.15, 0.15].forEach(z => {
      const h1 = new T.Mesh(G.box, head); h1.scale.set(0.04, 0.07, 0.1); h1.position.set(0.48, 0.26, z); c.add(h1);
      const t1 = new T.Mesh(G.box, tail); t1.scale.set(0.04, 0.07, 0.1); t1.position.set(-0.48, 0.26, z); c.add(t1);
    });
    const beam = addGlow(c, 1.3, 0.05, 0, 1.8, 0xcfefff, 0.25); beam.scale.set(2.2, 1.1, 1);
    scene.add(c); return c;
  };
  for (let i = 0; i < 8; i++) {
    const dir = i % 2 ? -1 : 1, c = makeCar(i);
    c.userData = { axis: 'x', dir, speed: 3 + rand() * 2.5, pos: -32 + rand() * 64, lane: ROAD_Z + (dir > 0 ? 0.65 : -0.65) };
    if (dir < 0) c.rotation.y = Math.PI; cars.push(c);
  }
  [-7.5, 7.5].forEach((x, k) => {
    const c = makeCar(k + 3), dir = k ? -1 : 1;
    c.userData = { axis: 'z', dir, speed: 2.2, pos: rand() * 18 - 12, lane: x + (dir > 0 ? 0.55 : -0.55), min: -12, max: 7 };
    c.rotation.y = dir > 0 ? -Math.PI / 2 : Math.PI / 2; cars.push(c);
  });

  /* drones: blinking lights circling the city, one carrying a spotlight */
  const drones = [];
  [[16, 10.5, 0.16, 0xFF3DF0], [11, 12.5, -0.22, 0x22D3FF], [21, 9, 0.12, 0xFFC877]].forEach((d, k) => {
    const g = new T.Group();
    const body = new T.Mesh(G.box, new T.MeshStandardMaterial({ color: 0x232a3a, metalness: 0.6, roughness: 0.4 })); body.scale.set(0.5, 0.12, 0.5); g.add(body);
    [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(p => { const r = new T.Mesh(G.cyl, new T.MeshBasicMaterial({ color: 0x8aa0c0, transparent: true, opacity: 0.35 })); r.scale.set(0.2, 0.01, 0.2); r.position.set(p[0] * 0.33, 0.08, p[1] * 0.33); g.add(r); });
    const led = new T.Mesh(G.sphere, basic(d[3])); led.scale.setScalar(0.07); led.position.y = -0.1; g.add(led);
    blinkers.push({ m: led, phase: k * 2 });
    if (k === 0) {
      const spot = new T.SpotLight(MAGENTA, 2.2, 30, 0.32, 0.6, 1.2); spot.position.set(0, 0, 0); g.add(spot); g.add(spot.target);
      spot.target.position.set(0, -10, 0);
      const coneGeo = new T.ConeGeometry(2.6, 10, 24, 1, true); coneGeo.translate(0, -5, 0);
      const cone = new T.Mesh(coneGeo, new T.MeshBasicMaterial({ color: MAGENTA, transparent: true, opacity: 0.07, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide, toneMapped: false })); g.add(cone);
    }
    scene.add(g); drones.push({ g, r: d[0], y: d[1], s: d[2], a: k * 2.1 });
  });

  /* floating particles in the logo colors */
  const N = small ? 220 : 520, pos = new Float32Array(N * 3), col = new Float32Array(N * 3), vel = new Float32Array(N);
  const pal = [new T.Color(CYAN), new T.Color(VIOLET), new T.Color(MAGENTA)];
  for (let i = 0; i < N; i++) {
    pos[i * 3] = (rand() - 0.5) * 70; pos[i * 3 + 1] = rand() * 20; pos[i * 3 + 2] = (rand() - 0.5) * 44;
    const c = pal[i % 3]; col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; vel[i] = 0.15 + rand() * 0.45;
  }
  const pgeo = new T.BufferGeometry(); pgeo.setAttribute('position', new T.BufferAttribute(pos, 3)); pgeo.setAttribute('color', new T.BufferAttribute(col, 3));
  const points = new T.Points(pgeo, new T.PointsMaterial({ size: 0.22, map: glow, vertexColors: true, transparent: true, opacity: 0.8, depthWrite: false, blending: T.AdditiveBlending, toneMapped: false }));
  scene.add(points);

  /* hover tooltip */
  const tip = st.label('', '#E6EDF3', 'display:none;letter-spacing:0;padding:8px 12px;background:#1A2130;border:1px solid #263042;border-radius:8px;font:500 13px "IBM Plex Sans",sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.4)');
  const tipNum = document.createElement('span'), tipTitle = document.createElement('span');
  tipNum.style.cssText = 'font:600 11px "JetBrains Mono",monospace';
  tip.appendChild(tipNum); tip.appendChild(document.createElement('br')); tip.appendChild(tipTitle);
  const ray = new T.Raycaster();
  pick = n => { if (!n) return null; ray.setFromCamera(n, cam); const hit = ray.intersectObjects(hits, false)[0]; return hit ? hit.object : null; };
  hover = n => {
    const b = pick(n);
    if (b !== hov) {
      hov = b; st.hoverCursor = b ? 'pointer' : 'grab'; st.cv.style.cursor = st.hoverCursor;
      if (b) {
        const u = b.userData;
        tipNum.style.color = u.color; tipNum.textContent = u.num + (u.done ? ' · ' + opts.doneText : '');
        tipTitle.textContent = u.title; tip.style.display = 'block';
      } else tip.style.display = 'none';
    }
  };

  const speed = REDUCED ? 0 : 1;
  st.tick = ({ t, dt }) => {
    const d = dt * speed;
    blds.forEach(b => {
      const isH = hov && hov.userData === b;
      b.lift += ((isH ? 0.35 : 0) - b.lift) * 0.15; b.group.position.y = b.lift;
      b.glow += ((b.done ? 1 : 0) - b.glow) * 0.06;
      const ei = 0.42 + b.glow * 1.1 + (isH ? 0.5 : 0);
      b.facades.forEach(f => { f.m.emissiveIntensity = ei; });
      b.edges.forEach(m => { m.opacity = 0.45 + b.glow * 0.5 + (isH ? 0.3 : 0); });
      b.pillar.material.opacity = b.glow * (0.32 + Math.sin(t * 2 + b.x) * 0.08);
      b.halo.material.opacity = b.glow * 0.45 + (isH ? 0.25 : 0);
      b.spin.forEach(s => { s.m.rotation.z += s.s * d; });
      if (b.sign) { const k = 1 + (isH ? 0.18 : 0) + b.glow * Math.sin(t * 3 + b.x) * 0.04; b.sign.scale.set(2 * k, 0.75 * k, 1); }
    });
    blinkers.forEach(k => { const on = Math.sin(t * (k.soft ? 1.6 : 3) + k.phase); k.m.visible = k.soft ? true : on > -0.2; if (k.soft) k.m.scale.setScalar(0.05 + (on + 1) * 0.012); });
    cars.forEach(c => {
      const u = c.userData; u.pos += u.dir * u.speed * d;
      if (u.axis === 'x') { if (u.pos > 34) u.pos = -34; if (u.pos < -34) u.pos = 34; c.position.set(u.pos, 0.06, u.lane); }
      else { if (u.pos > u.max) u.pos = u.min; if (u.pos < u.min) u.pos = u.max; c.position.set(u.lane, 0.06, u.pos); }
    });
    drones.forEach(dr => { dr.a += dr.s * d; dr.g.position.set(Math.cos(dr.a) * dr.r, dr.y + Math.sin(t * 1.3 + dr.r) * 0.3, Math.sin(dr.a) * dr.r * 0.55); dr.g.rotation.y += d; });
    searchlights.forEach(s => { s.beam.rotation.z = Math.sin(t * 0.5 + s.k * 2) * 0.45; s.beam.rotation.x = Math.cos(t * 0.37 + s.k) * 0.35; });
    const p = pgeo.attributes.position.array;
    for (let i = 0; i < N; i++) { p[i * 3 + 1] += vel[i] * d; p[i * 3] += Math.sin(t + i) * 0.002 * speed; if (p[i * 3 + 1] > 20) p[i * 3 + 1] = 0; }
    pgeo.attributes.position.needsUpdate = true;
    labels.forEach(lb => { const q = st.project(lb.pos); lb.div.style.transform = 'translate(' + q.x + 'px,' + q.y + 'px) translate(-50%,0)'; });
    if (hov) { const u = hov.userData, q = st.project(new T.Vector3(u.x, u.top + u.lift + 0.3, u.z)); tip.style.transform = 'translate(' + q.x + 'px,' + q.y + 'px) translate(-50%,-110%)'; }
  };
  st.refresh = done => blds.forEach(b => {
    b.done = done.indexOf(b.id) >= 0;
    b.facades.forEach(f => { const want = b.done ? f.doneMap : f.normalMap; if (f.m.emissiveMap !== want) { f.m.emissiveMap = want; f.m.needsUpdate = true; } });
  });
  return st;
}

/* ───────── lesson scenes ───────── */
function makeBox(el) {
  const st = makeStage(el, { radius: 10, phi: 1.05, theta: 0.75, auto: 0.003, fov: 35 });
  const { scene } = st;
  const g = new T.GridHelper(40, 40, 0x1c2635, 0x141a24); g.position.y = -3.5; scene.add(g);
  const geo = new T.BoxGeometry(1, 1, 1), eg = new T.EdgesGeometry(geo);
  const content = new T.Mesh(geo, new T.MeshStandardMaterial({ color: 0x7EF2C3, roughness: 0.5 }));
  const padM = new T.Mesh(geo, new T.MeshStandardMaterial({ color: 0xB9A3FF, transparent: true, opacity: 0.22, depthWrite: false }));
  padM.add(new T.LineSegments(eg, new T.LineBasicMaterial({ color: 0xB9A3FF, transparent: true, opacity: 0.6 })));
  const bor = new T.Mesh(geo, new T.MeshStandardMaterial({ color: 0xFFC877, transparent: true, opacity: 0.16, depthWrite: false, side: T.DoubleSide }));
  bor.add(new T.LineSegments(eg, new T.LineBasicMaterial({ color: 0xFFC877 })));
  const mar = new T.LineSegments(eg, new T.LineDashedMaterial({ color: 0x7FD4FF, dashSize: 0.04, gapSize: 0.03 }));
  mar.computeLineDistances();
  [content, padM, bor, mar].forEach(m => scene.add(m));
  const tgt = { c: 3, p: 3.8, b: 4, m: 4.8 }, cur = Object.assign({}, tgt);
  st.update = vs => {
    const s = 1 / 40, w = parseFloat(vs['--w']) || 140, p = parseFloat(vs['--pad']) || 0, b = parseFloat(vs['--bw']) || 0, m = parseFloat(vs['--m']) || 0;
    const cw = Math.max(vs['--bs'] === 'border-box' ? w - 2 * p - 2 * b : w, 6);
    tgt.c = cw * s; tgt.p = tgt.c + 2 * p * s; tgt.b = tgt.p + 2 * b * s; tgt.m = tgt.b + 2 * m * s;
    st.orb.radius = tgt.m * 2.3 + 3;
  };
  st.tick = () => {
    ['c', 'p', 'b', 'm'].forEach(k => { cur[k] += (tgt[k] - cur[k]) * 0.12; });
    const yc = cur.c * 0.6, zc = cur.c * 0.8;
    const set = (o, x) => { const add = x - cur.c; o.scale.set(x, yc + add, zc + add); };
    set(content, cur.c); set(padM, cur.p); set(bor, cur.b); set(mar, cur.m);
  };
  return st;
}

function stackOrder(vs) {
  const za = +vs['--za'] || 0, zb = +vs['--zb'] || 0, zc = +vs['--zc'] || 0, t = vs['--trayz'];
  const srt = a => a.sort((x, y) => x[1] - y[1] || x[2] - y[2]).map(x => x[0]);
  if (t == null || t === 'auto') return srt([['A', za, 0], ['B', zb, 1], ['C', zc, 2]]);
  const inner = srt([['A', za, 0], ['B', zb, 1]]);
  return (+t > zc) ? ['C'].concat(inner) : inner.concat(['C']);
}

function makeStack(el) {
  const st = makeStage(el, { radius: 11, phi: 1.0, theta: 0.6, auto: 0.002, fov: 35, ty: 1 });
  const { scene } = st;
  const g = new T.GridHelper(40, 40, 0x1c2635, 0x141a24); g.position.y = -0.2; scene.add(g);
  const cols = { A: 0x7EF2C3, B: 0xB9A3FF, C: 0xFFC877 }, css = { A: '#7EF2C3', B: '#B9A3FF', C: '#FFC877' };
  const off = { A: [-1.3, -0.5], B: [0, 0.2], C: [1.3, 0.9] };
  const plates = {}, labels = {};
  ['A', 'B', 'C'].forEach(k => {
    const m = new T.Mesh(new T.CylinderGeometry(1.7, 1.5, 0.22, 56), new T.MeshStandardMaterial({ color: cols[k], roughness: 0.35 }));
    m.position.set(off[k][0], 0.35, off[k][1]); m.userData.y = 0.35; scene.add(m); plates[k] = m;
    labels[k] = st.label(k, css[k], 'padding:2px 7px;background:rgba(13,16,22,.85);border:1px solid ' + css[k] + ';border-radius:5px');
  });
  const tray = new T.Mesh(new T.BoxGeometry(5, 0.08, 3.8), new T.MeshStandardMaterial({ color: 0x7FD4FF, transparent: true, opacity: 0.16, depthWrite: false }));
  tray.add(new T.LineSegments(new T.EdgesGeometry(tray.geometry), new T.LineBasicMaterial({ color: 0x7FD4FF })));
  tray.position.set(-0.65, 0.05, -0.15); tray.userData.y = 0.05; scene.add(tray);
  st.update = vs => {
    stackOrder(vs).forEach((k, i) => { plates[k].userData.y = 0.35 + i * 0.8; });
    tray.visible = vs['--trayz'] !== 'auto';
    tray.userData.y = Math.min(plates.A.userData.y, plates.B.userData.y) - 0.28;
  };
  st.tick = () => {
    Object.keys(plates).forEach(k => {
      const p = plates[k]; p.position.y += (p.userData.y - p.position.y) * 0.12;
      const s = st.project(new T.Vector3(p.position.x + 1.9, p.position.y, p.position.z));
      labels[k].style.transform = 'translate(' + s.x + 'px,' + s.y + 'px) translate(0,-50%)';
    });
    tray.position.y += (tray.userData.y - tray.position.y) * 0.12;
  };
  return st;
}

window.UXScenes = { makeHub, makeBox, makeStack };
window.dispatchEvent(new Event('uxscenes:ready'));
