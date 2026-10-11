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
  st.flyTo = (to, radius, phi, done, spin = 0.35, dur = 900) => {
    if (REDUCED) { orb.target.copy(to); orb.R = orb.radius = radius; orb.phi = phi; done(); return; }
    st.flight = { t0: performance.now(), dur, fromT: orb.target.clone(), toT: to.clone(), fromR: orb.R, toR: radius, fromP: orb.phi, toP: phi, fromTh: orb.theta, spin, done };
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
      orb.theta = f.fromTh + f.spin * e;
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
  /* same, but with trusted markup (used for city logos) */
  st.labelHTML = (html, color, extra) => { const d = st.label('', color, extra); d.innerHTML = html; return d; };
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


/* ───────── hub: a world of provinces joined by one highway loop ─────────
   Province "uiux" (Pixelia) has three districts; province "frontend" (Frontera) has React City and Vue City.
   opts: { lessons:[{id,level,title,n}], levels:[{key,name,color,hex,province,logo?}],
           provinces:[{key,name,color}], onOpen(id), doneText, focus:'uiux'|'frontend'|'all' } */
const DISTRICTS = {
  beginner: { x: -15, z: 1.5, w: 12, d: 10 },
  intermediate: { x: 0, z: -2.5, w: 12, d: 10 },
  advanced: { x: 15, z: 1.5, w: 12, d: 10 },
  react: { x: 61, z: -2, w: 16, d: 13 },
  vue: { x: 83, z: -2, w: 16, d: 13 }
};
const PROVINCES = {
  uiux: { x: 0, z: -3.5, w: 50, d: 22, focus: [0, -1], radius: 46 },
  frontend: { x: 72, z: -3.5, w: 48, d: 22, focus: [72, -2], radius: 46 },
  all: { focus: [38, -3], radius: 122 }
};
const RIVER = { x0: 37, x1: 44 };
/* the highway: one closed loop, bridges over the river on both sides */
const LOOP = [
  [-26, 0, 10], [0, 0, 10], [24, 0, 10], [30, 0.35, 10], [34, 1.5, 10], [40.5, 1.9, 10], [47, 1.5, 10], [51, 0.35, 10], [57, 0, 10], [80, 0, 10], [98, 0, 10],
  [104, 0, 6], [106, 0, -3.5], [104, 0, -13], [98, 0, -17],
  [80, 0, -17], [57, 0, -17], [51, 0.35, -17], [47, 1.5, -17], [40.5, 1.9, -17], [34, 1.5, -17], [30, 0.35, -17], [24, 0, -17], [0, 0, -17], [-26, 0, -17],
  [-32, 0, -13], [-34, 0, -3.5], [-32, 0, 6]
];
/* side streets cross each province from the front highway to the back one, so nothing dead-ends */
const STREETS = [-7.5, 7.5, 72];

function makeHub(el, opts) {
  const small = (el.clientWidth || 800) < 700 || (navigator.hardwareConcurrency || 8) <= 4;
  let hov = null, busy = false, focusKey = opts.focus || 'all', pick, hover;
  const st = makeStage(el, {
    radius: 46, phi: 0.98, theta: 0.5, auto: 0.0008, fov: 30, ty: 1.5, noLights: true,
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
  scene.fog = new T.Fog(BG, 60, 190);

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
  const blinkers = [], searchlights = [], spinners = [];
  const poleMat = new T.MeshStandardMaterial({ color: 0x2a3344, roughness: 0.6, metalness: 0.5 });

  /* ground: mirror (desktop) under a dark, slightly see-through floor */
  let mirror = null;
  if (!small) {
    mirror = new Reflector(new T.PlaneGeometry(400, 260), { textureWidth: 1024, textureHeight: 1024, color: 0x5a5f70, multisample: 0 });
    mirror.rotation.x = -Math.PI / 2; mirror.position.set(36, -0.01, 0); scene.add(mirror);
  }
  /* camera distance for the focused area; pulled back on narrow screens */
  const fitRadius = (key, w, h) => PROVINCES[key].radius * Math.max(1, Math.pow(1.7 / (w / h), 0.85));
  st.onResize = (w, h) => {
    if (mirror) mirror.getRenderTarget().setSize(Math.round(w * 0.6), Math.round(h * 0.6));
    if (!st.flight && !busy) st.orb.radius = fitRadius(focusKey, w, h);
  };
  st.onResize(el.clientWidth || 800, el.clientHeight || 500);
  st.orb.R = st.orb.radius;
  st.orb.target.set(PROVINCES[focusKey].focus[0], 1.5, PROVINCES[focusKey].focus[1]);

  const floor = new T.Mesh(new T.PlaneGeometry(400, 260), new T.MeshStandardMaterial({ color: 0x0c1017, roughness: 0.35, metalness: 0.4, transparent: !small, opacity: small ? 1 : 0.8 }));
  floor.rotation.x = -Math.PI / 2; floor.position.x = 36; scene.add(floor);
  const grid = new T.GridHelper(320, 160, 0x1c2635, 0x141a24); grid.position.set(36, 0.012, 0); grid.material.transparent = true; grid.material.opacity = 0.5; scene.add(grid);

  /* province pads with a glowing border, and the river between them */
  const provColor = {};
  opts.provinces.forEach(p => { provColor[p.key] = p.color; });
  Object.keys(PROVINCES).filter(k => k !== 'all').forEach(k => {
    const P = PROVINCES[k];
    const pad = new T.Mesh(G.box, new T.MeshStandardMaterial({ color: 0x0f141d, roughness: 0.9 })); pad.scale.set(P.w, 0.04, P.d); pad.position.set(P.x, 0.02, P.z); scene.add(pad);
    const e = new T.LineSegments(G.boxE, basic(provColor[k] || CYAN, { transparent: true, opacity: 0.35 })); e.scale.copy(pad.scale); e.position.copy(pad.position); scene.add(e);
  });
  const waterTex = canvasTex(64, 256, (g, w, h) => {
    g.fillStyle = '#000'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 26; i++) { g.fillStyle = 'rgba(127,212,255,' + (0.15 + rand() * 0.4) + ')'; g.fillRect(rand() * w, rand() * h, 2 + rand() * 10, 1.5); }
  });
  waterTex.wrapS = waterTex.wrapT = T.RepeatWrapping; waterTex.repeat.set(1, 18);
  const water = new T.Mesh(new T.PlaneGeometry(RIVER.x1 - RIVER.x0, 260), new T.MeshStandardMaterial({ color: 0x06202e, emissive: 0x7FD4FF, emissiveMap: waterTex, emissiveIntensity: 0.9, roughness: 0.15, metalness: 0.6 }));
  water.rotation.x = -Math.PI / 2; water.position.set((RIVER.x0 + RIVER.x1) / 2, 0.016, 0); scene.add(water);
  [RIVER.x0, RIVER.x1].forEach(x => { const b = new T.Mesh(G.box, basic(0x7FD4FF, { transparent: true, opacity: 0.5 })); b.scale.set(0.06, 0.04, 260); b.position.set(x, 0.03, 0); scene.add(b); });

  /* the highway loop: a ribbon along a closed curve */
  const curve = new T.CatmullRomCurve3(LOOP.map(p => new T.Vector3(p[0], p[1], p[2])), true, 'centripetal');
  const SAMPLES = 640, HW = 1.35, pts = curve.getSpacedPoints(SAMPLES), normals = [], tangents = [];
  const center = new T.Vector3(36, 0, -3.5);
  for (let i = 0; i < SAMPLES; i++) {
    const t = curve.getTangentAt(i / SAMPLES); tangents.push(t);
    normals.push(new T.Vector3(-t.z, 0, t.x).normalize());
  }
  const ribbon = new Float32Array(SAMPLES * 2 * 3), idx = [];
  for (let i = 0; i < SAMPLES; i++) {
    const p = pts[i], n = normals[i];
    ribbon.set([p.x + n.x * HW, p.y + 0.05, p.z + n.z * HW, p.x - n.x * HW, p.y + 0.05, p.z - n.z * HW], i * 6);
    const a = i * 2, b = ((i + 1) % SAMPLES) * 2;
    idx.push(a, a + 1, b, a + 1, b + 1, b);
  }
  const rgeo = new T.BufferGeometry(); rgeo.setAttribute('position', new T.BufferAttribute(ribbon, 3)); rgeo.setIndex(idx); rgeo.computeVertexNormals();
  scene.add(new T.Mesh(rgeo, new T.MeshStandardMaterial({ color: 0x11151e, roughness: 0.5, metalness: 0.3, side: T.DoubleSide })));
  // glowing guard rails in the logo colors
  [[1, CYAN], [-1, MAGENTA]].forEach(([s, c]) => {
    const arr = [];
    for (let i = 0; i <= SAMPLES; i++) { const k = i % SAMPLES, p = pts[k], n = normals[k]; arr.push(p.x + n.x * HW * s, p.y + 0.12, p.z + n.z * HW * s); }
    const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(arr, 3));
    scene.add(new T.Line(g, basic(c, { transparent: true, opacity: 0.75 })));
  });
  // lane dashes, bridge pillars and lamps
  const dashMat = basic(0x3a4862);
  for (let i = 0; i < SAMPLES; i += 4) {
    const p = pts[i], t = tangents[i];
    const d = new T.Mesh(G.box, dashMat); d.scale.set(0.1, 0.02, 0.8); d.position.set(p.x, p.y + 0.07, p.z);
    d.lookAt(p.x + t.x, p.y + 0.07 + t.y, p.z + t.z); scene.add(d);
    if (p.y > 0.7 && i % 12 === 0) {
      const pil = new T.Mesh(G.box, poleMat); pil.scale.set(0.5, p.y, 0.5); pil.position.set(p.x, p.y / 2, p.z); scene.add(pil);
    }
  }
  for (let i = 0; i < SAMPLES; i += 20) {
    const p = pts[i], n = normals[i];
    const out = p.clone().addScaledVector(n, 1).distanceTo(center) > p.clone().addScaledVector(n, -1).distanceTo(center) ? 1 : -1;
    const lx = p.x + n.x * (HW + 0.45) * out, lz = p.z + n.z * (HW + 0.45) * out, ly = p.y;
    const pole = new T.Mesh(G.cyl, poleMat); pole.scale.set(0.05, 1.9, 0.05); pole.position.set(lx, ly + 0.95, lz); scene.add(pole);
    const col = (i / 20) % 2 ? 0xffd9f6 : 0xc9f4ff;
    const bulb = new T.Mesh(G.sphere, basic(col)); bulb.scale.setScalar(0.09); bulb.position.set(lx - n.x * 0.4 * out, ly + 1.82, lz - n.z * 0.4 * out); scene.add(bulb);
    addGlow(scene, bulb.position.x, ly + 0.1, bulb.position.z, 2.6, (i / 20) % 2 ? MAGENTA : CYAN, 0.32);
  }
  // side streets: straight roads from the front highway to the back one
  const roadMat = new T.MeshStandardMaterial({ color: 0x11151e, roughness: 0.5, metalness: 0.3 });
  STREETS.forEach(x => {
    const r = new T.Mesh(G.box, roadMat); r.scale.set(2.2, 0.06, 24.6); r.position.set(x, 0.04, -3.5); scene.add(r);
    for (let z = -15; z <= 8; z += 2) { const d = new T.Mesh(G.box, dashMat); d.scale.set(0.1, 0.02, 0.8); d.position.set(x, 0.08, z); scene.add(d); }
  });

  /* building pieces */
  const pad2 = n => (n < 10 ? '0' : '') + n;
  const FACADE = {
    beginner: { wall: '#2a2723', unlit: '#14161c', lit: ['#FFD58A', '#FFC877', '#FFE7B0'], roof: 0x3a2f2a },
    intermediate: { wall: '#1b2232', unlit: '#0e131d', lit: ['#DCD3FF', '#B9A3FF', '#E6EDF3', '#9FD8FF'], roof: 0x1a1f2c },
    advanced: { wall: '#151926', unlit: '#0b0e16', lit: ['#FFC877', '#FF93B5', '#7FD4FF', '#FFFFFF'], roof: 0x141824 },
    react: { wall: '#121b26', unlit: '#0a1018', lit: ['#61DAFB', '#B8EEFF', '#E6EDF3'], roof: 0x101823 },
    vue: { wall: '#13201d', unlit: '#0a1311', lit: ['#42B883', '#9BE8C4', '#E6EDF3'], roof: 0x35495E }
  };
  const tiles = {};
  Object.keys(FACADE).forEach((k, i) => {
    const f = FACADE[k];
    tiles[k] = { normal: facadeTiles(11 + i, f.wall, f.unlit, f.lit, 0.32), done: facadeTiles(11 + i, f.wall, f.unlit, f.lit, 0.82) };
  });
  const facade = (lv, w, h, bld) => {
    const set = tiles[lv], rep = tx => { const c = tx.clone(); c.needsUpdate = true; c.repeat.set(Math.max(1, w / 2.2), Math.max(1, h / 2.2)); return c; };
    const m = new T.MeshStandardMaterial({ map: rep(set.normal.map), emissive: 0xffffff, emissiveMap: rep(set.normal.emissive), emissiveIntensity: 0.9, roughness: 0.65, metalness: 0.2 });
    bld.facades.push({ m, normalMap: m.emissiveMap, doneMap: rep(set.done.emissive) });
    return m;
  };
  const roofMat = c => new T.MeshStandardMaterial({ color: c, roughness: 0.8, metalness: 0.1 });
  const boxTier = (g, lv, w, h, d, y, bld, roofColor, ox, oz) => {
    const fm = facade(lv, w, h, bld), rm = roofMat(roofColor);
    const m = new T.Mesh(G.box, [fm, fm, rm, rm, fm, fm]); m.scale.set(w, h, d); m.position.set(ox || 0, y + h / 2, oz || 0); g.add(m);
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
  const tree = (parent, x, z, s, tint) => {
    const trunk = new T.Mesh(G.cyl, new T.MeshStandardMaterial({ color: 0x3a2c22, roughness: 0.9 })); trunk.scale.set(0.07 * s, 0.5 * s, 0.07 * s); trunk.position.set(x, 0.6 + 0.25 * s, z); parent.add(trunk);
    const leaves = new T.Mesh(G.cone, new T.MeshStandardMaterial({ color: 0x173a2d, emissive: tint || 0x7EF2C3, emissiveIntensity: 0.12, roughness: 0.8, flatShading: true }));
    leaves.scale.set(0.42 * s, 1.0 * s, 0.42 * s); leaves.position.set(x, 0.6 + 0.5 * s + 0.45 * s, z); parent.add(leaves);
  };
  const billboard = (parent, x, z, tex, ry) => {
    const pole = new T.Mesh(G.box, poleMat); pole.scale.set(0.1, 2.4, 0.1); pole.position.set(x, 1.2, z); parent.add(pole);
    [1, -1].forEach(s => {
      const bb = new T.Mesh(G.plane, new T.MeshBasicMaterial({ map: tex, toneMapped: false })); bb.scale.set(2, 1, 1);
      bb.position.set(x, 2.7, z + s * 0.06); bb.rotation.y = (ry || 0) + (s < 0 ? Math.PI : 0); parent.add(bb);
    });
  };
  const logoBoardTex = draw => canvasTex(256, 128, (g, w, h) => {
    g.fillStyle = '#0b0e14'; g.fillRect(0, 0, w, h);
    draw(g, w, h);
  });

  /* builders per district theme. Each returns the top height of the building. */
  const BUILD = {
    /* kampung: warm houses with gable roofs, chimneys and lantern strings */
    beginner(g, l, i, bld) {
      const floors = 1 + (i % 3), h = 0.9 * floors + 0.3;
      let y = boxTier(g, 'beginner', 2.2, h, 2.0, 0, bld, FACADE.beginner.roof);
      y = gable(g, 2.6, 2.3, 1.0, y, 0x4a3328, bld.hex);
      if (i % 2 === 0) { const ch = new T.Mesh(G.box, roofMat(0x3b302b)); ch.scale.set(0.25, 0.6, 0.25); ch.position.set(0.6, y - 0.5, -0.4); g.add(ch); }
      const door = new T.Mesh(G.plane, basic(0xFFD58A)); door.scale.set(0.35, 0.6, 1); door.position.set(0, 0.3, 1.011); g.add(door);
      sign(g, pad2(l.n), bld.color, y, bld);
      return y;
    },
    /* kota: setback towers with water tanks, rooftop units and antennas */
    intermediate(g, l, i, bld) {
      const H = 3.2 + i * 0.7;
      let y = boxTier(g, 'intermediate', 2.2, H * 0.55, 2.2, 0, bld, FACADE.intermediate.roof);
      y = boxTier(g, 'intermediate', 1.75, H * 0.3, 1.75, y, bld, FACADE.intermediate.roof);
      y = boxTier(g, 'intermediate', 1.25, H * 0.15, 1.25, y, bld, FACADE.intermediate.roof);
      const tank = new T.Mesh(G.cyl, new T.MeshStandardMaterial({ color: 0x2b3142, roughness: 0.6 })); tank.scale.set(0.28, 0.45, 0.28); tank.position.set(-0.3, y + 0.23, 0.2); g.add(tank);
      const ac = new T.Mesh(G.box, new T.MeshStandardMaterial({ color: 0x3a4256 })); ac.scale.set(0.35, 0.2, 0.3); ac.position.set(0.35, y + 0.1, -0.25); g.add(ac);
      if (i % 2 === 1) antenna(g, 0.35, y, 0.3, 1.2, 0xFF5A6E);
      sign(g, pad2(l.n), bld.color, y + (i % 2 ? 1.2 : 0.5), bld);
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
      sign(g, pad2(l.n), bld.color, H + 2.2 + (i % 2) * 0.8, bld);
      return H + 1.4;
    },
    /* React City: towers of stacked "component" modules, each joined by a glowing seam, with an orbit ring on top */
    react(g, l, i, bld) {
      const mods = 3 + (i % 3);
      let y = 0;
      for (let k = 0; k < mods; k++) {
        const w = 2.2 - k * 0.22, h = 0.85 + ((i + k) % 2) * 0.35, ox = (k % 2 ? 0.12 : -0.12) * (i % 2 ? 1 : -1);
        y = boxTier(g, 'react', w, h, w, y, bld, FACADE.react.roof, ox, 0);
        if (k < mods - 1) { const seam = new T.Mesh(G.box, basic(0x61DAFB, { transparent: true, opacity: 0.9 })); seam.scale.set(w - 0.3, 0.06, w - 0.3); seam.position.set(ox, y + 0.03, 0); g.add(seam); y += 0.06; }
      }
      const orbit = new T.Mesh(new T.TorusGeometry(0.75, 0.03, 6, 48), basic(0x61DAFB));
      orbit.scale.set(1, 0.4, 1); orbit.position.y = y + 0.55; orbit.rotation.z = 0.5 * (i % 2 ? 1 : -1); g.add(orbit);
      const dot = new T.Mesh(G.sphere, basic(0xE6FBFF)); dot.scale.setScalar(0.1); dot.position.y = y + 0.55; g.add(dot);
      bld.spin.push({ m: orbit, s: 0.6, axis: 'y' });
      sign(g, pad2(l.n), bld.color, y + 1.1, bld);
      return y + 0.9;
    },
    /* Vue City: terraced garden towers with green ledges and little bushes */
    vue(g, l, i, bld) {
      const tiers = 3 + (i % 2);
      let y = 0;
      for (let k = 0; k < tiers; k++) {
        const r = 1.2 - k * 0.16, h = 0.95 + (i % 3) * 0.2;
        const fm = facade('vue', Math.PI * 2 * r, h, bld);
        const body = new T.Mesh(new T.CylinderGeometry(r, r, h, 8, 1), [fm, roofMat(0x1f3b33), roofMat(0x1f3b33)]);
        body.position.y = y + h / 2; g.add(body);
        const e = new T.LineSegments(new T.EdgesGeometry(body.geometry), new T.LineBasicMaterial({ color: bld.hex, transparent: true, opacity: 0.5 })); e.position.copy(body.position); g.add(e); bld.edges.push(e.material);
        y += h;
        const ledge = new T.Mesh(new T.TorusGeometry(r - 0.05, 0.05, 6, 32), basic(0x42B883)); ledge.rotation.x = Math.PI / 2; ledge.position.y = y; g.add(ledge);
        for (let b = 0; b < 5; b++) {
          const a = (b / 5) * Math.PI * 2 + k, bush = new T.Mesh(G.sphere, new T.MeshStandardMaterial({ color: 0x1f5c40, emissive: 0x42B883, emissiveIntensity: 0.25, flatShading: true }));
          bush.scale.setScalar(0.13 + rand() * 0.06); bush.position.set(Math.cos(a) * (r - 0.3), y + 0.1, Math.sin(a) * (r - 0.3)); g.add(bush);
        }
      }
      antenna(g, 0, y, 0, 0.9, 0x42B883);
      sign(g, pad2(l.n), bld.color, y + 0.9, bld);
      return y + 0.9;
    }
  };

  /* district decorations */
  const DECOR = {
    beginner(top) {
      const path = new T.MeshStandardMaterial({ color: 0x2a2620, roughness: 0.95 });
      [[0, 0, 10.5, 0.7], [0, 0, 0.7, 8.5]].forEach(p => { const m = new T.Mesh(G.box, path); m.scale.set(p[2], 0.02, p[3]); m.position.set(p[0], 0.01, p[1]); top.add(m); });
      [[-5, -4.2, 1], [5.1, -4.1, 1.1], [-5.2, 3.8, 0.9], [5.2, 4, 1], [-4.6, 0.2, 0.8], [4.7, 0.1, 0.85], [0, 4.3, 0.7], [-2.5, 4.4, 0.75], [2.6, 4.4, 0.75]].forEach(t => tree(top, t[0], t[1], t[2]));
      const lanterns = [[-5, 3.8], [-1.8, 4.3], [1.8, 4.3], [5.2, 4]];
      for (let k = 0; k < lanterns.length - 1; k++) {
        const a = lanterns[k], b = lanterns[k + 1];
        for (let s = 1; s < 6; s++) {
          const t = s / 6, bulb = new T.Mesh(G.sphere, basic([0xFFD58A, 0xFF93B5, 0x7EF2C3][s % 3])); bulb.scale.setScalar(0.06);
          bulb.position.set(a[0] + (b[0] - a[0]) * t, 1.25 - Math.sin(t * Math.PI) * 0.3, a[1] + (b[1] - a[1]) * t); top.add(bulb);
          blinkers.push({ m: bulb, phase: rand() * 6, soft: true });
        }
      }
      addGlow(top, 0, 0.03, 0, 9, 0xFFC877, 0.12);
    },
    intermediate(top) {
      const line = basic(0x2a3144);
      for (let k = -2; k <= 2; k++) { const m = new T.Mesh(G.box, line); m.scale.set(11, 0.015, 0.03); m.position.set(0, 0.01, k * 2.2); top.add(m); }
      [[-5.2, 4.2], [5.2, 4.2], [-5.2, -4.3], [5.2, -4.3]].forEach(p => tree(top, p[0], p[1], 0.7));
      billboard(top, -5.3, 0.6, logoBoardTex((g, w, h) => {
        const gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, '#22D3FF'); gr.addColorStop(0.5, '#8B5CFF'); gr.addColorStop(1, '#FF3DF0');
        g.strokeStyle = gr; g.lineWidth = 8; g.strokeRect(6, 6, w - 12, h - 12);
        g.fillStyle = gr; g.font = '700 46px "Space Grotesk", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('sha-labs', w / 2, h / 2 + 2);
      }));
    },
    advanced(top) {
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
    },
    /* React City: a giant spinning atom over the central plaza */
    react(top) {
      const plaza = new T.Mesh(new T.CylinderGeometry(2.4, 2.4, 0.05, 48), new T.MeshStandardMaterial({ color: 0x0d1a24, roughness: 0.4, metalness: 0.5 })); plaza.position.set(0, 0.03, 0.2); top.add(plaza);
      addGlow(top, 0, 0.07, 0.2, 7, 0x61DAFB, 0.35);
      const ped = new T.Mesh(new T.CylinderGeometry(0.35, 0.6, 2.2, 6), new T.MeshStandardMaterial({ color: 0x1a2533, metalness: 0.6, roughness: 0.4 })); ped.position.set(0, 1.1, 0.2); top.add(ped);
      const atom = new T.Group(); atom.position.set(0, 4.2, 0.2); top.add(atom);
      const nucleus = new T.Mesh(G.sphere, basic(0x61DAFB)); nucleus.scale.setScalar(0.42); atom.add(nucleus);
      const electrons = [];
      [0, Math.PI / 3, -Math.PI / 3].forEach((rz, k) => {
        const orbit = new T.Group(); orbit.rotation.z = rz; atom.add(orbit);
        const ring = new T.Mesh(new T.TorusGeometry(2, 0.07, 8, 96), basic(0x61DAFB)); ring.scale.set(1, 0.38, 1); orbit.add(ring);
        const e = new T.Mesh(G.sphere, basic(0xE6FBFF)); e.scale.setScalar(0.14); orbit.add(e);
        electrons.push({ e, a: k * 2.1 });
      });
      spinners.push({ m: atom, s: 0.35, axis: 'y', electrons });
      [[-6.6, 5.4], [6.6, 5.4], [-6.8, -5.6], [6.8, -5.6]].forEach(p => { const lp = new T.Mesh(G.cyl, poleMat); lp.scale.set(0.05, 1.6, 0.05); lp.position.set(p[0], 0.8, p[1]); top.add(lp); const b = new T.Mesh(G.sphere, basic(0x61DAFB)); b.scale.setScalar(0.1); b.position.set(p[0], 1.65, p[1]); top.add(b); });
      billboard(top, 7.2, 0, logoBoardTex((g, w, h) => {
        g.strokeStyle = '#61DAFB'; g.lineWidth = 5; g.strokeRect(6, 6, w - 12, h - 12);
        g.save(); g.translate(58, h / 2); g.strokeStyle = '#61DAFB'; g.lineWidth = 3;
        [0, 60, 120].forEach(a => { g.save(); g.rotate(a * Math.PI / 180); g.beginPath(); g.ellipse(0, 0, 34, 13, 0, 0, Math.PI * 2); g.stroke(); g.restore(); });
        g.fillStyle = '#61DAFB'; g.beginPath(); g.arc(0, 0, 6, 0, Math.PI * 2); g.fill(); g.restore();
        g.fillStyle = '#E6EDF3'; g.font = '700 34px "Space Grotesk", sans-serif'; g.textBaseline = 'middle'; g.fillText('React', 108, h / 2 + 2);
      }), Math.PI / 2);
    },
    /* Vue City: the V logo standing in a garden */
    vue(top) {
      const lawn = new T.Mesh(new T.CylinderGeometry(2.6, 2.6, 0.05, 48), new T.MeshStandardMaterial({ color: 0x10241b, emissive: 0x42B883, emissiveIntensity: 0.06, roughness: 0.9 })); lawn.position.set(0, 0.03, 0.2); top.add(lawn);
      addGlow(top, 0, 0.07, 0.2, 7, 0x42B883, 0.35);
      const S = 3.4 / 256, mk = pts => { const s = new T.Shape(); pts.forEach((p, k) => { const x = (p[0] - 128) * S, y = (220.8 - p[1]) * S; k ? s.lineTo(x, y) : s.moveTo(x, y); }); s.closePath(); return s; };
      const ext = { depth: 0.35, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 1 };
      const outer = new T.Mesh(new T.ExtrudeGeometry(mk([[0, 0], [50.56, 0], [128, 132.48], [204.8, 0], [256, 0], [128, 220.8]]), ext), new T.MeshStandardMaterial({ color: 0x42B883, emissive: 0x42B883, emissiveIntensity: 0.75, roughness: 0.4 }));
      const inner = new T.Mesh(new T.ExtrudeGeometry(mk([[50.56, 0], [97.92, 0], [128, 51.2], [157.44, 0], [204.8, 0], [128, 133.12]]), ext), new T.MeshStandardMaterial({ color: 0x35495E, emissive: 0x35495E, emissiveIntensity: 0.6, roughness: 0.4 }));
      const logo = new T.Group(); [outer, inner].forEach(m => { m.position.z = -0.175; logo.add(m); });
      logo.position.set(0, 1.4, 0.2); top.add(logo);
      spinners.push({ m: logo, s: 0.3, axis: 'y' });
      [[-6.6, 5.2, 0.9], [6.6, 5.2, 0.9], [-6.8, -5.6, 1], [6.8, -5.6, 1], [-2.8, 5.6, 0.7], [2.8, 5.6, 0.7], [0, -6, 0.8]].forEach(p => tree(top, p[0], p[1], p[2], 0x42B883));
      billboard(top, -7.2, 0, logoBoardTex((g, w, h) => {
        g.strokeStyle = '#42B883'; g.lineWidth = 5; g.strokeRect(6, 6, w - 12, h - 12);
        const s = 0.32, ox = 26, oy = (h - 221 * s) / 2, poly = (pts, c) => { g.fillStyle = c; g.beginPath(); pts.forEach((p, k) => k ? g.lineTo(ox + p[0] * s, oy + p[1] * s) : g.moveTo(ox + p[0] * s, oy + p[1] * s)); g.closePath(); g.fill(); };
        poly([[0, 0], [50.56, 0], [128, 132.48], [204.8, 0], [256, 0], [128, 220.8]], '#42B883');
        poly([[50.56, 0], [97.92, 0], [128, 51.2], [157.44, 0], [204.8, 0], [128, 133.12]], '#35495E');
        g.fillStyle = '#E6EDF3'; g.font = '700 34px "Space Grotesk", sans-serif'; g.textBaseline = 'middle'; g.fillText('Vue', 128, h / 2 + 2);
      }), -Math.PI / 2);
    }
  };

  /* build every district and its lesson buildings */
  const blds = [], hits = [], labels = [];
  const SLOTS = {
    small: [[-3.4, -2.3], [0, -2.6], [3.4, -2.3], [-1.8, 2], [1.8, 2]],
    city: [[-5.2, -3.8], [0, -4.4], [5.2, -3.8], [-4.4, 3.4], [4.4, 3.4]]
  };
  const PF_COLOR = { beginner: 0x101a17, intermediate: 0x121722, advanced: 0x0f111b, react: 0x0d151d, vue: 0x0e1915 };
  opts.levels.forEach(lv => {
    const D = DISTRICTS[lv.key]; if (!D) return;
    const pf = new T.Mesh(G.box, new T.MeshStandardMaterial({ color: PF_COLOR[lv.key] || 0x121722, roughness: 0.85 })); pf.scale.set(D.w, 0.6, D.d); pf.position.set(D.x, 0.3, D.z); scene.add(pf);
    const pe = new T.LineSegments(G.boxE, new T.LineBasicMaterial({ color: lv.hex, transparent: true, opacity: 0.6 })); pe.scale.copy(pf.scale); pe.position.copy(pf.position); scene.add(pe);
    const top = new T.Group(); top.position.set(D.x, 0.6, D.z); scene.add(top);
    if (DECOR[lv.key]) DECOR[lv.key](top);
    const slots = D.w > 12 ? SLOTS.city : SLOTS.small;
    opts.lessons.filter(l => l.level === lv.key).forEach((l, i) => {
      const sl = slots[i] || [((i - 5) % 3 - 1) * 3.4, 4.2];
      const g = new T.Group(); g.position.set(sl[0], 0, sl[1]); top.add(g);
      const bld = { id: l.id, title: l.title, num: pad2(l.n), color: lv.color, hex: lv.hex, facades: [], edges: [], spin: [], done: false, lift: 0, glow: 0 };
      const h = (BUILD[lv.key] || BUILD.intermediate)(g, l, i, bld);
      // completion beacon: a light pillar + halo, faded in when done
      const pillar = new T.Mesh(G.cyl, basic(lv.hex, { transparent: true, opacity: 0, blending: T.AdditiveBlending, depthWrite: false }));
      pillar.scale.set(0.07, 18, 0.07); pillar.position.y = h + 9; g.add(pillar);
      const halo = addGlow(g, 0, 0.03, 0, 4.2, lv.hex, 0);
      Object.assign(bld, { group: g, pillar, halo, top: h + 1.6, x: D.x + sl[0], z: D.z + sl[1] });
      const hit = new T.Mesh(G.box, new T.MeshBasicMaterial()); hit.visible = false;
      hit.scale.set(2.6, h + 0.2, 2.6); hit.position.set(sl[0], (h + 0.2) / 2, sl[1]); top.add(hit);
      hit.userData = bld; hits.push(hit); blds.push(bld);
    });
    const chip = 'padding:4px 8px;background:rgba(13,16,22,.85);border:1px solid #263042;border-radius:6px;display:flex;align-items:center;gap:6px';
    const name = lv.name.toUpperCase().replace(/[&<>]/g, '');
    const div = lv.logo ? st.labelHTML('<span style="width:16px;height:16px;display:inline-flex">' + lv.logo + '</span>' + name, lv.color, chip) : st.label(name, lv.color, chip);
    labels.push({ div, pos: new T.Vector3(D.x, 0.7, D.z + D.d / 2 + 0.4) });
  });
  /* province name signs */
  opts.provinces.forEach(p => {
    const P = PROVINCES[p.key]; if (!P) return;
    const c = '#' + new T.Color(p.color).getHexString();
    const div = st.label(p.name, c, 'padding:6px 12px;background:rgba(11,14,20,.85);border:1px solid ' + c + ';border-radius:8px;font-size:13px;letter-spacing:.14em;box-shadow:0 0 18px ' + c + '33');
    labels.push({ div, pos: new T.Vector3(P.x, 11, P.z - 3), province: true });
  });

  /* traffic: cars on the loop (both directions) and on the side streets */
  const cars = [];
  const carCols = [0x7FD4FF, 0xB9A3FF, 0xFF93B5, 0x7EF2C3, 0xFFC877, 0xE6EDF3, 0x61DAFB, 0x42B883];
  const makeCar = i => {
    const c = new T.Group();
    const body = new T.Mesh(G.box, new T.MeshStandardMaterial({ color: carCols[i % carCols.length], roughness: 0.35, metalness: 0.5 })); body.scale.set(0.48, 0.28, 0.95); body.position.y = 0.24; c.add(body);
    const cabin = new T.Mesh(G.box, new T.MeshStandardMaterial({ color: 0x0d1018, roughness: 0.2, metalness: 0.7 })); cabin.scale.set(0.42, 0.22, 0.5); cabin.position.set(0, 0.48, -0.05); c.add(cabin);
    const head = basic(0xffffff), tail = basic(0xff2a4a);
    [-0.15, 0.15].forEach(x => {
      const h1 = new T.Mesh(G.box, head); h1.scale.set(0.1, 0.07, 0.04); h1.position.set(x, 0.26, 0.48); c.add(h1);
      const t1 = new T.Mesh(G.box, tail); t1.scale.set(0.1, 0.07, 0.04); t1.position.set(x, 0.26, -0.48); c.add(t1);
    });
    const beam = addGlow(c, 0, 0.05, 1.3, 1.8, 0xcfefff, 0.25); beam.scale.set(1.1, 2.2, 1);
    scene.add(c); return c;
  };
  const LOOP_LEN = curve.getLength();
  for (let i = 0; i < (small ? 10 : 16); i++) {
    const c = makeCar(i), dir = i % 2 ? -1 : 1;
    c.userData = { loop: true, dir, speed: 3.2 + rand() * 2.6, u: rand(), lane: dir > 0 ? 0.62 : -0.62 };
    cars.push(c);
  }
  STREETS.forEach((x, k) => {
    const c = makeCar(k + 2), dir = k % 2 ? -1 : 1;
    c.userData = { loop: false, dir, speed: 2.4, pos: rand() * 22 - 15, lane: x + (dir > 0 ? 0.5 : -0.5), min: -15.5, max: 8.5 };
    cars.push(c);
  });
  const tmpP = new T.Vector3(), tmpT = new T.Vector3();

  /* drones: blinking lights circling each province, one carrying a spotlight */
  const drones = [];
  [[0, 16, 10.5, 0.16, 0xFF3DF0], [0, 11, 12.5, -0.22, 0x22D3FF], [72, 15, 10, 0.18, 0x61DAFB], [72, 10, 12, -0.2, 0x42B883]].forEach((d, k) => {
    const g = new T.Group();
    const body = new T.Mesh(G.box, new T.MeshStandardMaterial({ color: 0x232a3a, metalness: 0.6, roughness: 0.4 })); body.scale.set(0.5, 0.12, 0.5); g.add(body);
    [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(p => { const r = new T.Mesh(G.cyl, new T.MeshBasicMaterial({ color: 0x8aa0c0, transparent: true, opacity: 0.35 })); r.scale.set(0.2, 0.01, 0.2); r.position.set(p[0] * 0.33, 0.08, p[1] * 0.33); g.add(r); });
    const led = new T.Mesh(G.sphere, basic(d[4])); led.scale.setScalar(0.07); led.position.y = -0.1; g.add(led);
    blinkers.push({ m: led, phase: k * 2 });
    if (k === 0 || k === 2) {
      const col = k ? 0x61DAFB : MAGENTA;
      const spot = new T.SpotLight(col, 2.2, 30, 0.32, 0.6, 1.2); g.add(spot); g.add(spot.target); spot.target.position.set(0, -10, 0);
      const coneGeo = new T.ConeGeometry(2.6, 10, 24, 1, true); coneGeo.translate(0, -5, 0);
      g.add(new T.Mesh(coneGeo, new T.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.07, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide, toneMapped: false })));
    }
    scene.add(g); drones.push({ g, cx: d[0], r: d[1], y: d[2], s: d[3], a: k * 2.1 });
  });

  /* floating particles in the logo colors */
  const N = small ? 260 : 700, pos = new Float32Array(N * 3), col = new Float32Array(N * 3), vel = new Float32Array(N);
  const pal = [new T.Color(CYAN), new T.Color(VIOLET), new T.Color(MAGENTA)];
  for (let i = 0; i < N; i++) {
    pos[i * 3] = -40 + rand() * 150; pos[i * 3 + 1] = rand() * 20; pos[i * 3 + 2] = (rand() - 0.5) * 50;
    const c = pal[i % 3]; col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; vel[i] = 0.15 + rand() * 0.45;
  }
  const pgeo = new T.BufferGeometry(); pgeo.setAttribute('position', new T.BufferAttribute(pos, 3)); pgeo.setAttribute('color', new T.BufferAttribute(col, 3));
  scene.add(new T.Points(pgeo, new T.PointsMaterial({ size: 0.22, map: glow, vertexColors: true, transparent: true, opacity: 0.8, depthWrite: false, blending: T.AdditiveBlending, toneMapped: false })));

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
      b.spin.forEach(s => { if (s.axis === 'y') s.m.rotation.y += s.s * d; else s.m.rotation.z += s.s * d; });
      if (b.sign) { const k = 1 + (isH ? 0.18 : 0) + b.glow * Math.sin(t * 3 + b.x) * 0.04; b.sign.scale.set(2 * k, 0.75 * k, 1); }
    });
    spinners.forEach(s => {
      s.m.rotation.y += s.s * d;
      if (s.electrons) s.electrons.forEach(e => { e.a += d * 2.2; e.e.position.set(Math.cos(e.a) * 2, Math.sin(e.a) * 0.76, 0); });
    });
    blinkers.forEach(k => { const on = Math.sin(t * (k.soft ? 1.6 : 3) + k.phase); k.m.visible = k.soft ? true : on > -0.2; if (k.soft) k.m.scale.setScalar(0.05 + (on + 1) * 0.012); });
    waterTex.offset.y -= d * 0.08;
    cars.forEach(c => {
      const u = c.userData;
      if (u.loop) {
        u.u = (u.u + u.dir * u.speed * d / LOOP_LEN + 1) % 1;
        curve.getPointAt(u.u, tmpP); curve.getTangentAt(u.u, tmpT);
        const nx = -tmpT.z, nz = tmpT.x, len = Math.hypot(nx, nz) || 1;
        c.position.set(tmpP.x + nx / len * u.lane, tmpP.y + 0.06, tmpP.z + nz / len * u.lane);
        c.lookAt(c.position.x + tmpT.x * u.dir, c.position.y + tmpT.y * u.dir, c.position.z + tmpT.z * u.dir);
      } else {
        u.pos += u.dir * u.speed * d;
        if (u.pos > u.max) u.pos = u.min; if (u.pos < u.min) u.pos = u.max;
        c.position.set(u.lane, 0.08, u.pos); c.rotation.set(0, u.dir > 0 ? 0 : Math.PI, 0);
      }
    });
    drones.forEach(dr => { dr.a += dr.s * d; dr.g.position.set(dr.cx + Math.cos(dr.a) * dr.r, dr.y + Math.sin(t * 1.3 + dr.r) * 0.3, -3 + Math.sin(dr.a) * dr.r * 0.55); dr.g.rotation.y += d; });
    searchlights.forEach(s => { s.beam.rotation.z = Math.sin(t * 0.5 + s.k * 2) * 0.45; s.beam.rotation.x = Math.cos(t * 0.37 + s.k) * 0.35; });
    const p = pgeo.attributes.position.array;
    for (let i = 0; i < N; i++) { p[i * 3 + 1] += vel[i] * d; p[i * 3] += Math.sin(t + i) * 0.002 * speed; if (p[i * 3 + 1] > 20) p[i * 3 + 1] = 0; }
    pgeo.attributes.position.needsUpdate = true;
    labels.forEach(lb => {
      const q = st.project(lb.pos);
      lb.div.style.display = q.behind ? 'none' : '';
      lb.div.style.transform = 'translate(' + q.x + 'px,' + q.y + 'px) translate(-50%,0)';
    });
    if (hov) { const u = hov.userData, q = st.project(new T.Vector3(u.x, u.top + u.lift + 0.3, u.z)); tip.style.transform = 'translate(' + q.x + 'px,' + q.y + 'px) translate(-50%,-110%)'; }
  };
  st.refresh = done => blds.forEach(b => {
    b.done = done.indexOf(b.id) >= 0;
    b.facades.forEach(f => { const want = b.done ? f.doneMap : f.normalMap; if (f.m.emissiveMap !== want) { f.m.emissiveMap = want; f.m.needsUpdate = true; } });
  });
  /* fly the camera to a province ('uiux', 'frontend') or the whole map ('all') */
  st.focus = key => {
    if (!PROVINCES[key] || busy) return;
    focusKey = key;
    const P = PROVINCES[key];
    st.flyTo(new T.Vector3(P.focus[0], 1.5, P.focus[1]), fitRadius(key, el.clientWidth || 800, el.clientHeight || 500), key === 'all' ? 0.9 : 0.98, () => {}, 0, 1300);
  };
  return st;
}

/* ───────── flow scene: a 3D component tree for the frontend lessons ─────────
   opts: { nodes:[{id,label,sub?,parent?(id or [ids]),kind?,ghost?}], color }
   kind: 'comp' (default) | 'state' | 'computed' | 'effect' | 'dom'
   messages: {type:'tree',nodes} · {type:'render',id} · {type:'flow',from,to,kind:'prop'|'emit'|'state'} */
function makeFlow(el, opts) {
  const st = makeStage(el, { radius: 13, phi: 1.12, theta: 0.32, auto: 0.0012, fov: 35, ty: 0 });
  const { scene } = st;
  const accent = new T.Color(opts.color || '#61DAFB');
  const KIND = {
    comp: { color: accent.getHex() },
    state: { color: 0xFFC877 },
    computed: { color: 0xB9A3FF },
    effect: { color: 0xB9A3FF },
    dom: { color: 0x8a96aa }
  };
  const FLOW = { prop: 0x7FD4FF, emit: 0xFF93B5, state: 0xFFC877 };
  const geos = {
    comp: new T.BoxGeometry(1.9, 0.8, 0.8),
    state: new T.OctahedronGeometry(0.5),
    computed: new T.DodecahedronGeometry(0.46),
    effect: new T.TorusGeometry(0.42, 0.12, 10, 32),
    dom: new T.BoxGeometry(1.7, 0.2, 0.9),
    orb: new T.SphereGeometry(0.13, 12, 8)
  };
  const glow = glowTex();
  const grid = new T.GridHelper(60, 60, 0x1c2635, 0x141a24); scene.add(grid);
  const linesGeo = new T.BufferGeometry(); linesGeo.setAttribute('position', new T.BufferAttribute(new Float32Array(400 * 6), 3));
  const lines = new T.LineSegments(linesGeo, new T.LineBasicMaterial({ color: 0x46557a, transparent: true, opacity: 0.9 }));
  lines.frustumCulled = false; scene.add(lines);

  const nodes = new Map(), orbs = [];
  const labelTex = (label, sub, color) => canvasTex(512, 128, (g, w, h) => {
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = '700 50px "Space Grotesk", sans-serif'; g.fillStyle = '#E6EDF3'; g.shadowColor = '#000'; g.shadowBlur = 8;
    g.fillText(label, w / 2, sub ? 40 : h / 2);
    if (sub) { g.font = '600 38px "JetBrains Mono", monospace'; g.fillStyle = color; g.fillText(sub, w / 2, 98, w - 8); }
  });
  function makeNode(n) {
    const kind = KIND[n.kind] ? n.kind : 'comp', col = KIND[kind].color;
    const mat = new T.MeshStandardMaterial({ color: kind === 'comp' ? 0x1A2130 : col, emissive: col, emissiveIntensity: kind === 'comp' ? 0.25 : 0.5, roughness: 0.45, metalness: 0.2, transparent: true });
    const mesh = new T.Mesh(geos[kind], mat);
    const edges = kind === 'comp' || kind === 'dom' ? new T.LineSegments(new T.EdgesGeometry(geos[kind]), new T.LineBasicMaterial({ color: col, transparent: true })) : null;
    if (edges) mesh.add(edges);
    const sprite = new T.Sprite(new T.SpriteMaterial({ map: labelTex(n.label, n.sub, '#' + new T.Color(col).getHexString()), transparent: true, depthWrite: false }));
    sprite.scale.set(3.6, 0.9, 1);
    const halo = new T.Sprite(new T.SpriteMaterial({ map: glow, color: col, transparent: true, opacity: 0, blending: T.AdditiveBlending, depthWrite: false }));
    halo.scale.setScalar(2.4);
    const g = new T.Group(); g.add(mesh); g.add(sprite); g.add(halo); sprite.position.y = kind === 'dom' ? -0.6 : -0.9;
    g.scale.setScalar(0.01); scene.add(g);
    return { id: n.id, kind, g, mesh, edges, sprite, halo, mat, label: n.label, sub: n.sub, parents: [], target: new T.Vector3(), s: 0, flash: 0.8, dying: false, ghost: !!n.ghost };
  }
  function setNodes(list) {
    const seen = new Set();
    list.forEach(n => {
      seen.add(n.id);
      let node = nodes.get(n.id);
      if (!node || node.dying) { if (node) dropNode(node); node = makeNode(n); nodes.set(n.id, node); }
      else if (node.label !== n.label || node.sub !== n.sub) {
        node.sprite.material.map.dispose();
        node.sprite.material.map = labelTex(n.label, n.sub, '#' + new T.Color(KIND[node.kind].color).getHexString());
        node.label = n.label; node.sub = n.sub; node.flash = 1; node.relabel = 1;
      }
      node.parents = n.parent == null ? [] : [].concat(n.parent);
      node.ghost = !!n.ghost;
    });
    nodes.forEach(node => { if (!seen.has(node.id)) node.dying = true; });
    layout();
  }
  function dropNode(node) {
    scene.remove(node.g);
    node.sprite.material.map.dispose(); node.sprite.material.dispose(); node.halo.material.dispose(); node.mat.dispose();
    if (node.edges) { node.edges.geometry.dispose(); node.edges.material.dispose(); }
    nodes.delete(node.id);
  }
  function layout() {
    const live = [...nodes.values()].filter(n => !n.dying);
    const depth = new Map();
    const dOf = (n, guard) => {
      if (depth.has(n.id)) return depth.get(n.id);
      if (guard > 20) return 0;
      const ps = n.parents.map(id => nodes.get(id)).filter(p => p && !p.dying);
      const d = ps.length ? Math.max(...ps.map(p => dOf(p, guard + 1))) + 1 : 0;
      depth.set(n.id, d); return d;
    };
    live.forEach(n => dOf(n, 0));
    const rows = [];
    live.forEach(n => { const d = depth.get(n.id); (rows[d] = rows[d] || []).push(n); });
    const maxD = rows.length - 1;
    let widest = 1;
    rows.forEach((row, d) => {
      const gap = row.length > 5 ? 2.5 : 3.1;
      widest = Math.max(widest, row.length * gap);
      row.forEach((n, i) => n.target.set((i - (row.length - 1) / 2) * gap, (maxD / 2 - d) * 2.6 + 0.4, 0));
    });
    st.orb.radius = Math.max(11, widest * 1.0 + 5, rows.length * 3.6 + 4);
    grid.position.y = -(maxD / 2) * 2.6 - 1.6;
  }
  function spawnOrb(from, to, kind) {
    const a = nodes.get(from), b = nodes.get(to);
    if (!a || !b || a.dying || b.dying) return;
    const col = FLOW[kind] || FLOW.prop;
    const m = new T.Mesh(geos.orb, new T.MeshBasicMaterial({ color: col, toneMapped: false }));
    const h = new T.Sprite(new T.SpriteMaterial({ map: glow, color: col, transparent: true, opacity: 0.9, blending: T.AdditiveBlending, depthWrite: false }));
    h.scale.setScalar(1.1); m.add(h); scene.add(m);
    orbs.push({ m, h, a, b, t: 0 });
  }
  st.message = msg => {
    if (!msg) return;
    if (msg.type === 'tree' && Array.isArray(msg.nodes)) setNodes(msg.nodes);
    else if (msg.type === 'render') { const n = nodes.get(msg.id); if (n) n.flash = 1; }
    else if (msg.type === 'flow') spawnOrb(msg.from, msg.to, msg.kind);
  };
  st.update = () => {};

  const posArr = linesGeo.attributes.position.array;
  st.tick = ({ dt }) => {
    let k = 0;
    nodes.forEach(n => {
      const want = n.dying ? 0 : 1;
      n.s += (want - n.s) * 0.14;
      n.g.position.lerp(n.target, 0.12);
      n.flash = Math.max(0, n.flash - dt * 1.6);
      const pulse = 1 + n.flash * 0.18;
      n.g.scale.setScalar(Math.max(0.01, n.s * pulse));
      const op = n.ghost ? 0.22 : 1;
      n.mat.opacity += (op - n.mat.opacity) * 0.15; n.sprite.material.opacity = n.mat.opacity;
      if (n.edges) n.edges.material.opacity = n.mat.opacity;
      n.mat.emissiveIntensity = (n.kind === 'comp' ? 0.25 : 0.5) + n.flash * 1.4;
      n.halo.material.opacity = n.flash * 0.8;
      if (n.kind === 'effect') n.mesh.rotation.y += dt * 1.5;
      if (n.kind === 'state' || n.kind === 'computed') n.mesh.rotation.y += dt * 0.8;
      if (n.dying && n.s < 0.03) dropNode(n);
    });
    nodes.forEach(n => n.parents.forEach(pid => {
      const p = nodes.get(pid); if (!p || k >= 400) return;
      posArr.set([p.g.position.x, p.g.position.y - 0.45 * p.s, p.g.position.z, n.g.position.x, n.g.position.y + 0.45 * n.s, n.g.position.z], k * 6); k++;
    }));
    linesGeo.setDrawRange(0, k * 2); linesGeo.attributes.position.needsUpdate = true;
    for (let i = orbs.length - 1; i >= 0; i--) {
      const o = orbs[i]; o.t += dt / 0.75;
      const e = Math.min(1, o.t);
      o.m.position.lerpVectors(o.a.g.position, o.b.g.position, e); o.m.position.z += Math.sin(e * Math.PI) * 0.8;
      if (o.t >= 1) { o.b.flash = 1; scene.remove(o.m); o.m.material.dispose(); o.h.material.dispose(); orbs.splice(i, 1); }
    }
  };
  setNodes(opts.nodes || []);
  nodes.forEach(n => { n.g.position.copy(n.target); });
  st.orb.R = st.orb.radius;
  const baseDispose = st.dispose;
  st.dispose = () => { baseDispose(); Object.values(geos).forEach(g => g.dispose()); glow.dispose(); };
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


window.UXScenes = { makeHub, makeFlow, makeBox, makeStack };
window.dispatchEvent(new Event('uxscenes:ready'));
