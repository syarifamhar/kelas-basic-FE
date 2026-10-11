/* three.js scenes: the hub "world map" (a small neon city), the box-model view and the z-index plate stack.
   Loaded as an ES module; exposes window.UXScenes and fires "uxscenes:ready" on window.
   Every scene returns { el, update?, refresh?, dispose }. */
import * as T from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { makeCharacter, randomLook, DEFAULT_LOOK, OPTIONS, SKIN, HAIR_COLORS, EYE_COLORS, CLOTH } from './character.js';
import { carGeometry, carMaterials, resetShared, treeGeometry, benchGeometry, lampPostGeometry, propGeometry, shadowTexture, townGeometry, awningGeometry, tierTrim, entranceGeometry } from './models.js';

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
  let DPR = Math.min(o.bloom ? 1.5 : 2, window.devicePixelRatio || 1);
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
  // skip all work while the canvas is scrolled out of view
  let visible = true;
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => { visible = es[0].isIntersecting; }) : null;
  if (io) io.observe(el);
  // if the device struggles, render at a lower resolution (only ever steps down)
  const perf = { t: 0, n: 0, slow: 0 };
  const adapt = ms => {
    perf.t += ms; perf.n++;
    if (perf.t < 2000) return;
    const avg = perf.t / perf.n; perf.t = perf.n = 0;
    if (avg > 26 && DPR > 1) { DPR = Math.max(1, DPR - 0.25); r.setPixelRatio(DPR); size(); }
    else if (avg > 40 && bloom && bloom.enabled !== false && ++perf.slow > 1) bloom.enabled = false;
  };
  const loop = now => {
    raf = requestAnimationFrame(loop);
    const ms = now - last;
    clock.dt = Math.min(0.05, ms / 1000); last = now;
    if (!visible || document.hidden) return;
    clock.t += clock.dt;
    if (ms < 250) adapt(ms);
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
    cancelAnimationFrame(raf); ro.disconnect(); if (io) io.disconnect();
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


/* ───────── hub: a world of cities joined by one highway loop ─────────
   City "uiux" (Pixelia) has the districts Principia (UI/UX theory) and Vectoria (Figma).
   City "frontend" (Frontera) has Foundry (HTML/CSS/JS), React and Vue.
   opts: { lessons:[{id,level,title,n}], levels:[{key,name,color,hex,city,logo?}],
           cities:[{key,name,color}], onOpen(id), doneText, focus:'uiux'|'frontend'|'all' } */
const DISTRICTS = {
  theory: { x: -12.5, z: -3, w: 20, d: 13, monument: true },
  figma: { x: 8.9, z: -3, w: 16, d: 13, monument: true },
  basics: { x: 42.5, z: -3, w: 18, d: 13, monument: true },
  react: { x: 62, z: -3, w: 16, d: 13, monument: true },
  vue: { x: 81.5, z: -3, w: 17, d: 13, monument: true }
};
const CITIES = {
  uiux: { x: -3.5, z: -3.5, w: 44, d: 20, focus: [-3.5, -2], radius: 50 },
  frontend: { x: 61.5, z: -3.5, w: 60, d: 20, focus: [61.5, -2], radius: 60 },
  all: { focus: [29, -4], radius: 138 }
};
const RIVER = { x0: 22, x1: 28 };
/* the highway: one closed loop around everything, bridges over the river on both sides */
const LOOP = [
  [-28, 0, 11], [0, 0, 11], [14, 0, 11], [18.5, 0.35, 11], [21.5, 1.5, 11], [25, 1.9, 11], [28.5, 1.5, 11], [31.5, 0.35, 11], [36, 0, 11], [60, 0, 11], [90, 0, 11],
  [97, 0, 7], [99, 0, -4], [97, 0, -15], [90, 0, -19],
  [60, 0, -19], [36, 0, -19], [31.5, 0.35, -19], [28.5, 1.5, -19], [25, 1.9, -19], [21.5, 1.5, -19], [18.5, 0.35, -19], [14, 0, -19], [0, 0, -19], [-28, 0, -19],
  [-34, 0, -15], [-36, 0, -4], [-34, 0, 7]
];
/* a ring road around each city; side streets cross the city and join the ring and the highway at both ends */
const RINGS = { uiux: [-27.5, 20.3, -15.3, 8.2], frontend: [29.7, 93.3, -15.3, 8.2] };
const STREETS = [-1, 52.6, 71.6];
/* the "core" rectangle that suburbs keep out of (highway + cities) */
const CORE = [-38.5, 101.5, -21.5, 13.5];

function roundedRect(x0, x1, z0, z1, r) {
  const pts = [];
  const corner = (cx, cz, a0) => { for (let k = 0; k <= 3; k++) { const a = a0 + (k / 3) * Math.PI / 2; pts.push(new T.Vector3(cx + Math.cos(a) * r, 0, cz + Math.sin(a) * r)); } };
  corner(x1 - r, z1 - r, 0); corner(x0 + r, z1 - r, Math.PI / 2); corner(x0 + r, z0 + r, Math.PI); corner(x1 - r, z0 + r, Math.PI * 1.5);
  return pts.reverse();
}
/* Lay out n building slots on a grid inside a w×d district, leaving the middle free for a monument. */
function districtSlots(n, w, d, monument) {
  const cand = [];
  const cols = Math.max(2, Math.floor((w - 1.6) / 3.3)), rows = Math.max(2, Math.floor((d - 1.6) / 3.4));
  const gx = (w - 2.8) / (cols - 1), gz = (d - 3.2) / (rows - 1);
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const x = -(w - 2.8) / 2 + c * gx, z = -(d - 3.2) / 2 + r * gz;
    if (monument && Math.abs(x) < 2.9 && z > -2.6) continue; // keep the monument and the plaza in front of it clear
    cand.push([x, z]);
  }
  // spread lessons evenly over the free cells, back rows first
  if (cand.length <= n) return cand.concat(Array.from({ length: n - cand.length }, (_, i) => [(i % 3 - 1) * 3, d / 2 + 2]));
  const out = [], step = cand.length / n, taken = new Set();
  for (let i = 0; i < n; i++) { const k = Math.floor(i * step); taken.add(k); out.push(cand[k]); }
  out.free = cand.filter((_, k) => !taken.has(k)); // empty lots, filled with decorations
  return out;
}

function makeHub(el, opts) {
  const small = (el.clientWidth || 800) < 700 || (navigator.hardwareConcurrency || 8) <= 4;
  let hov = null, busy = false, focusKey = opts.focus || 'all', pick, hover;
  const st = makeStage(el, {
    radius: 50, phi: 0.98, theta: 0.5, auto: 0.0007, fov: 30, ty: 1.5, noLights: true,
    bloom: { strength: 0.8, radius: 0.45, threshold: 0.55 },
    onHover: n => hover(n),
    onClick: n => {
      const b = pick(n);
      if (!b) { if (st.walkTo) st.walkTo(n); return; }
      if (busy) return;
      busy = true; hover(null);
      const u = b.userData;
      st.flyTo(new T.Vector3(u.x, u.top * 0.55, u.z), 12 + u.top * 0.6, 1.08, () => opts.onOpen(u.id));
    }
  });
  const { scene, cam } = st;
  const rand = rng(2048);
  scene.background = new T.Color(BG);
  scene.fog = new T.Fog(BG, 70, 220);

  /* lights: moonlight + logo-colored fills */
  scene.add(new T.HemisphereLight(0x46508a, 0x07080c, 0.55));
  scene.add(new T.AmbientLight(0xffffff, 0.12));
  const moon = new T.DirectionalLight(0xbfd4ff, 0.45); moon.position.set(-10, 30, 18); scene.add(moon);
  const fillC = new T.DirectionalLight(CYAN, 0.25); fillC.position.set(-30, 10, 10); scene.add(fillC);
  const fillM = new T.DirectionalLight(MAGENTA, 0.22); fillM.position.set(30, 10, -10); scene.add(fillM);

  /* shared geometry + textures */
  const G = {
    box: new T.BoxGeometry(1, 1, 1),
    sphere: new T.SphereGeometry(1, 16, 10),
    bulb: new T.SphereGeometry(1, 8, 6),
    cyl: new T.CylinderGeometry(1, 1, 1, 18),
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
  /* smooth models (cars, trees, benches, lamp posts) and a soft environment for paint and glass */
  resetShared();
  const pmrem = new T.PMREMGenerator(st.r), env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  const MODELS = { tree: { round: treeGeometry('round', 1), pine: treeGeometry('pine', 2), palm: treeGeometry('palm', 3) }, bench: benchGeometry(), lamp: lampPostGeometry() };
  const barkMat = new T.MeshStandardMaterial({ color: 0x3f2e22, roughness: 0.9 });
  const leafMats = {};
  const leafMat = tint => leafMats[tint] || (leafMats[tint] = new T.MeshStandardMaterial({ color: 0x1d4a34, emissive: tint, emissiveIntensity: 0.08, roughness: 0.75, side: T.DoubleSide }));
  const shadowMat = new T.MeshBasicMaterial({ map: shadowTexture(), transparent: true, depthWrite: false });
  const addShadow = (parent, w, d, y = 0.012) => { const m = new T.Mesh(G.plane, shadowMat); m.rotation.x = -Math.PI / 2; m.scale.set(w, d, 1); m.position.y = y; parent.add(m); return m; };
  const roadLamps = [];
  const blinkers = [], searchlights = [], spinners = [], smoke = [];
  const dummy = new T.Object3D();
  const poleMat = new T.MeshStandardMaterial({ color: 0x2a3344, roughness: 0.6, metalness: 0.5 });
  const roadMat = new T.MeshStandardMaterial({ color: 0x11151e, roughness: 0.5, metalness: 0.3, side: T.DoubleSide });
  const dashMat = basic(0x3a4862);

  /* camera distance for the focused area; pulled back on narrow screens */
  const fitRadius = (key, w, h) => CITIES[key].radius * Math.max(1, Math.pow(1.7 / (w / h), 0.85));
  st.onResize = (w, h) => {
    if (!st.flight && !busy) st.orb.radius = fitRadius(focusKey, w, h);
  };
  st.onResize(el.clientWidth || 800, el.clientHeight || 500);
  st.orb.R = st.orb.radius;
  st.orb.target.set(CITIES[focusKey].focus[0], 1.5, CITIES[focusKey].focus[1]);

  const floor = new T.Mesh(new T.PlaneGeometry(420, 300), new T.MeshStandardMaterial({ color: 0x0c1017, roughness: 0.4, metalness: 0.4 }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(30, 0, -4); scene.add(floor);
  const grid = new T.GridHelper(360, 180, 0x1c2635, 0x141a24); grid.position.set(30, 0.012, -4); grid.material.transparent = true; grid.material.opacity = 0.45; scene.add(grid);

  /* city pads with a glowing border, and the river between them */
  const cityColor = {};
  opts.cities.forEach(c => { cityColor[c.key] = c.color; });
  ['uiux', 'frontend'].forEach(k => {
    const C = CITIES[k];
    const pad = new T.Mesh(G.box, new T.MeshStandardMaterial({ color: 0x0f141d, roughness: 0.9 })); pad.scale.set(C.w, 0.04, C.d); pad.position.set(C.x, 0.02, C.z); scene.add(pad);
    const e = new T.LineSegments(G.boxE, basic(cityColor[k] || CYAN, { transparent: true, opacity: 0.35 })); e.scale.copy(pad.scale); e.position.copy(pad.position); scene.add(e);
  });
  const waterTex = canvasTex(64, 256, (g, w, h) => {
    g.fillStyle = '#000'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 26; i++) { g.fillStyle = 'rgba(127,212,255,' + (0.15 + rand() * 0.4) + ')'; g.fillRect(rand() * w, rand() * h, 2 + rand() * 10, 1.5); }
  });
  waterTex.wrapS = waterTex.wrapT = T.RepeatWrapping; waterTex.repeat.set(1, 20);
  const water = new T.Mesh(new T.PlaneGeometry(RIVER.x1 - RIVER.x0, 300), new T.MeshStandardMaterial({ color: 0x06202e, emissive: 0x7FD4FF, emissiveMap: waterTex, emissiveIntensity: 0.9, roughness: 0.15, metalness: 0.6 }));
  water.rotation.x = -Math.PI / 2; water.position.set((RIVER.x0 + RIVER.x1) / 2, 0.016, -4); scene.add(water);
  [RIVER.x0, RIVER.x1].forEach(x => { const b = new T.Mesh(G.box, basic(0x7FD4FF, { transparent: true, opacity: 0.5 })); b.scale.set(0.06, 0.04, 300); b.position.set(x, 0.03, -4); scene.add(b); });

  /* a road ribbon along a closed curve; returns sampled points for traffic and lamps */
  function loopRoad(curve, width, samples, rails, lamps) {
    const pts = curve.getSpacedPoints(samples), normals = [], tangents = [], hw = width / 2;
    for (let i = 0; i < samples; i++) { const t = curve.getTangentAt(i / samples); tangents.push(t); normals.push(new T.Vector3(-t.z, 0, t.x).normalize()); }
    const arr = new Float32Array(samples * 6), idx = [];
    for (let i = 0; i < samples; i++) {
      const p = pts[i], n = normals[i];
      arr.set([p.x + n.x * hw, p.y + 0.05, p.z + n.z * hw, p.x - n.x * hw, p.y + 0.05, p.z - n.z * hw], i * 6);
      const a = i * 2, b = ((i + 1) % samples) * 2; idx.push(a, a + 1, b, a + 1, b + 1, b);
    }
    const geo = new T.BufferGeometry(); geo.setAttribute('position', new T.BufferAttribute(arr, 3)); geo.setIndex(idx); geo.computeVertexNormals();
    scene.add(new T.Mesh(geo, roadMat));
    if (rails) rails.forEach(([s, c]) => {
      const a = [];
      for (let i = 0; i <= samples; i++) { const k = i % samples, p = pts[k], n = normals[k]; a.push(p.x + n.x * hw * s, p.y + 0.12, p.z + n.z * hw * s); }
      const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(a, 3));
      scene.add(new T.Line(g, basic(c, { transparent: true, opacity: 0.75 })));
    });
    for (let i = 0; i < samples; i += 4) {
      const p = pts[i], t = tangents[i];
      const d = new T.Mesh(G.box, dashMat); d.scale.set(0.1, 0.02, 0.8); d.position.set(p.x, p.y + 0.07, p.z); d.lookAt(p.x + t.x, p.y + 0.07 + t.y, p.z + t.z); scene.add(d);
      if (p.y > 0.7 && i % 12 === 0) { const pil = new T.Mesh(G.box, poleMat); pil.scale.set(0.5, p.y, 0.5); pil.position.set(p.x, p.y / 2, p.z); scene.add(pil); }
    }
    if (lamps) {
      let center = new T.Vector3(); pts.forEach(p => center.add(p)); center.divideScalar(pts.length);
      for (let i = 0; i < samples; i += lamps) {
        const p = pts[i], n = normals[i];
        const out = p.clone().addScaledVector(n, 1).distanceTo(center) > p.clone().addScaledVector(n, -1).distanceTo(center) ? 1 : -1;
        const lx = p.x + n.x * (hw + 0.45) * out, lz = p.z + n.z * (hw + 0.45) * out, ly = p.y;
        const odd = (i / lamps) % 2, rot = Math.atan2(n.z * out, -n.x * out);
        roadLamps.push([lx, ly, lz, rot, odd ? 0xffd9f6 : 0xc9f4ff, 1.1]);
        addGlow(scene, lx - n.x * 0.46 * out, ly + 0.1, lz - n.z * 0.46 * out, 2.6, odd ? MAGENTA : CYAN, 0.32);
      }
    }
    return { curve, length: curve.getLength(), pts };
  }
  const highway = loopRoad(new T.CatmullRomCurve3(LOOP.map(p => new T.Vector3(p[0], p[1], p[2])), true, 'centripetal'), 2.7, 760, [[1, CYAN], [-1, MAGENTA]], 22);
  const rings = Object.keys(RINGS).map(k => {
    const r = RINGS[k];
    return loopRoad(new T.CatmullRomCurve3(roundedRect(r[0], r[1], r[2], r[3], 2.4), true, 'centripetal'), 1.7, 420, [[1, cityColor[k] || CYAN]], 30);
  });
  // side streets: straight roads from the back highway, across the ring, to the front highway
  STREETS.forEach(x => {
    const r = new T.Mesh(G.box, roadMat); r.scale.set(2.1, 0.06, 28.6); r.position.set(x, 0.045, -4); scene.add(r);
    for (let z = -17; z <= 9; z += 2) { const d = new T.Mesh(G.box, dashMat); d.scale.set(0.1, 0.02, 0.8); d.position.set(x, 0.085, z); scene.add(d); }
  });

  /* many copies of one model, split into map squares; each square has its own bounds,
     so the renderer skips the squares that are off screen (it[0], it[1] are x, z) */
  const chunked = (geo, mats, list, place, height) => {
    const CH = 40, cells = new Map(), out = [];
    if (!geo.boundingSphere) geo.computeBoundingSphere();
    list.forEach(it => { const k = Math.floor(it[0] / CH) + ',' + Math.floor(it[1] / CH); (cells.get(k) || cells.set(k, []).get(k)).push(it); });
    cells.forEach(items => {
      const g = new T.BufferGeometry();
      Object.keys(geo.attributes).forEach(a => g.setAttribute(a, geo.attributes[a]));
      if (geo.index) g.setIndex(geo.index);
      geo.groups.forEach(gr => g.addGroup(gr.start, gr.count, gr.materialIndex));
      const m = new T.InstancedMesh(g, mats, items.length), box = new T.Box3();
      items.forEach((it, i) => { place(it, i, m); dummy.updateMatrix(); m.setMatrixAt(i, dummy.matrix); box.expandByPoint(dummy.position); });
      box.max.y += height || 2;
      g.boundingSphere = box.getBoundingSphere(new T.Sphere()); g.boundingSphere.radius += geo.boundingSphere.radius * 1.8 + 0.5;
      scene.add(m); out.push(m);
    });
    return out;
  };
  /* lamp posts with a curved arm; the bulb sits at the end of the arm and can be coloured */
  const lampPosts = (list, bulbSize) => {
    if (!list.length) return;
    const posts = new T.InstancedMesh(MODELS.lamp, [poleMat], list.length), bulbs = new T.InstancedMesh(G.bulb, new T.MeshBasicMaterial({ toneMapped: false }), list.length), c = new T.Color();
    list.forEach((it, i) => {
      const sc = it[5] || 1;
      dummy.position.set(it[0], it[1], it[2]); dummy.rotation.set(0, it[3], 0); dummy.scale.setScalar(sc); dummy.updateMatrix(); posts.setMatrixAt(i, dummy.matrix);
      dummy.position.set(it[0] + Math.cos(it[3]) * 0.42 * sc, it[1] + 1.69 * sc, it[2] - Math.sin(it[3]) * 0.42 * sc); dummy.rotation.set(0, 0, 0); dummy.scale.set(bulbSize, bulbSize * 0.7, bulbSize); dummy.updateMatrix(); bulbs.setMatrixAt(i, dummy.matrix);
      bulbs.setColorAt(i, c.set(it[4]));
    });
    dummy.scale.setScalar(1); dummy.rotation.set(0, 0, 0);
    posts.frustumCulled = bulbs.frustumCulled = false;
    scene.add(posts); scene.add(bulbs);
  };
  lampPosts(roadLamps, 0.08);

  /* building pieces */
  const pad2 = n => (n < 10 ? '0' : '') + n;
  const FACADE = {
    theory: { wall: '#202723', unlit: '#101512', lit: ['#7EF2C3', '#E6EDF3', '#FFE7B0'], roof: 0x1d2a25 },
    figma: { wall: '#1d1a26', unlit: '#0e0c14', lit: ['#A259FF', '#1ABCFE', '#0ACF83', '#FF7262', '#E6EDF3'], roof: 0x1a1724 },
    basics: { wall: '#2a1d18', unlit: '#140e0b', lit: ['#FF8A4C', '#F7DF1E', '#7FD4FF', '#FFD58A'], roof: 0x2a2220 },
    react: { wall: '#121b26', unlit: '#0a1018', lit: ['#61DAFB', '#B8EEFF', '#E6EDF3'], roof: 0x101823 },
    vue: { wall: '#13201d', unlit: '#0a1311', lit: ['#42B883', '#9BE8C4', '#E6EDF3'], roof: 0x35495E },
    town: { wall: '#1a1f29', unlit: '#0c0f15', lit: ['#FFD58A', '#FFE7B0', '#C9F4FF', '#FFC877'], roof: 0x2a2f3d }
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
  const trimMats = {}, doorMat = new T.MeshBasicMaterial({ color: 0xa88458, toneMapped: false });
  const trimMat = c => trimMats[c] || (trimMats[c] = new T.MeshStandardMaterial({ color: new T.Color(c).multiplyScalar(1.7), roughness: 0.55, metalness: 0.2 }));
  const roundBox = new RoundedBoxGeometry(1, 1, 1, 3, 0.03);
  const boxTier = (g, lv, w, h, d, y, bld, roofColor, ox, oz) => {
    const fm = facade(lv, w, h, bld), rm = roofMat(roofColor);
    const m = new T.Mesh(roundBox, [fm, fm, rm, rm, fm, fm]); m.scale.set(w, h, d); m.position.set(ox || 0, y + h / 2, oz || 0); g.add(m);
    const tr = new T.Mesh(tierTrim(w, h, d, y === 0), trimMat(roofColor)); tr.position.set(ox || 0, y, oz || 0); g.add(tr);
    if (y === 0) { const door = new T.Mesh(entranceGeometry(Math.min(0.55, w * 0.25)), [doorMat, trimMat(roofColor)]); door.position.set(ox || 0, 0, (oz || 0) + d / 2); g.add(door); }
    const e = new T.LineSegments(G.boxE, new T.LineBasicMaterial({ color: bld.hex, transparent: true, opacity: 0.55 })); e.scale.copy(m.scale); e.position.copy(m.position); g.add(e);
    bld.edges.push(e.material);
    return y + h;
  };
  const prism = (w, h, d) => { const s = new T.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(0, h); s.closePath(); const geo = new T.ExtrudeGeometry(s, { depth: d, bevelEnabled: false }); geo.translate(0, 0, -d / 2); return geo; };
  const gable = (g, w, d, h, y, color, edgeHex) => {
    const geo = prism(w, h, d);
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
    const m = new T.Mesh(MODELS.tree[tint === 0x42B883 ? 'pine' : 'round'], [barkMat, leafMat(tint || 0x7EF2C3)]);
    m.position.set(x, 0, z); m.scale.setScalar(s * 1.1); m.rotation.y = rand() * 6; parent.add(m);
    addShadow(m, 1.5, 1.5);
  };
  const billboard = (parent, x, z, tex, ry) => {
    const pole = new T.Mesh(G.box, poleMat); pole.scale.set(0.1, 2.4, 0.1); pole.position.set(x, 1.2, z); parent.add(pole);
    [1, -1].forEach(s => {
      const bb = new T.Mesh(G.plane, new T.MeshBasicMaterial({ map: tex, toneMapped: false })); bb.scale.set(2, 1, 1);
      bb.position.set(x + (ry ? s * 0.06 : 0), 2.7, z + (ry ? 0 : s * 0.06)); bb.rotation.y = (ry || 0) + (s < 0 ? Math.PI : 0); parent.add(bb);
    });
  };
  const boardTex = draw => canvasTex(256, 128, (g, w, h) => { g.fillStyle = '#0b0e14'; g.fillRect(0, 0, w, h); draw(g, w, h); });
  const FIGMA_PATHS = [['#f24e1e', 'M0 9.5A9.5 9.5 0 0 0 9.5 19H19V0H9.5A9.5 9.5 0 0 0 0 9.5z'], ['#ff7262', 'M19 0v19h9.5a9.5 9.5 0 1 0 0-19H19z'], ['#a259ff', 'M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5z'], ['#1abcfe', 'M19 28.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0z'], ['#0acf83', 'M0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5a9.5 9.5 0 1 1-19 0z']];
  const VUE_PATHS = [['#41B883', 'M204.8 0H256L128 220.8L0 0h97.92L128 51.2L157.44 0h47.36Z'], ['#41B883', 'm0 0l128 220.8L256 0h-51.2L128 132.48L50.56 0H0Z'], ['#35495E', 'M50.56 0L128 133.12L204.8 0h-47.36L128 51.2L97.92 0H50.56Z']];
  const drawPaths = (g, paths, x, y, s) => { g.save(); g.translate(x, y); g.scale(s, s); paths.forEach(([c, d]) => { g.fillStyle = c; g.fill(new Path2D(d)); }); g.restore(); };
  const TECH = { html: 0xFF8A4C, css: 0x7FD4FF, js: 0xF7DF1E };
  const techOf = id => (id.indexOf('html') === 0 ? 'html' : (id === 'js-dom' || id === 'state') ? 'js' : 'css');

  /* builders per district theme. Each returns the top height of the building. */
  const BUILD = {
    /* Principia: academy halls with columns and pediments, a dome on some */
    theory(g, l, i, bld) {
      const floors = 1 + (i % 3), w = 2.3, d = 1.9, h = 0.85 * floors + 0.35;
      const base = new T.Mesh(G.box, roofMat(0x2b3530)); base.scale.set(w + 0.4, 0.2, d + 0.5); base.position.y = 0.1; g.add(base);
      let y = boxTier(g, 'theory', w, h, d, 0.2, bld, FACADE.theory.roof);
      const colMat = new T.MeshStandardMaterial({ color: 0xd9e4de, emissive: 0x7EF2C3, emissiveIntensity: 0.12, roughness: 0.5 });
      for (let k = 0; k < 4; k++) { const c = new T.Mesh(G.cyl, colMat); c.scale.set(0.09, h, 0.09); c.position.set(-0.8 + k * 0.53, 0.2 + h / 2, d / 2 + 0.22); g.add(c); }
      if (i % 4 === 3) {
        const dome = new T.Mesh(new T.SphereGeometry(0.85, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), new T.MeshStandardMaterial({ color: 0x2b3a33, emissive: 0x7EF2C3, emissiveIntensity: 0.3, roughness: 0.4 }));
        dome.position.y = y; g.add(dome); y += 0.85;
      } else y = gable(g, w + 0.3, d + 0.5, 0.75, y, 0x26332d, bld.hex);
      sign(g, pad2(l.n), bld.color, y, bld);
      return y;
    },
    /* Vectoria: Figma-colored towers topped with the logo's shapes */
    figma(g, l, i, bld) {
      const pal = [0xF24E1E, 0xFF7262, 0xA259FF, 0x1ABCFE, 0x0ACF83];
      const h = 2.6 + i * 0.75;
      let y = boxTier(g, 'figma', 2, h, 2, 0, bld, FACADE.figma.roof);
      const col = pal[i % pal.length], m = new T.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0.55, roughness: 0.4 });
      const top = i % 2 ? new T.Mesh(new T.SphereGeometry(0.75, 24, 16), m) : new T.Mesh(new T.CylinderGeometry(0.75, 0.75, 0.7, 24, 1, false, 0, Math.PI), m);
      if (i % 2) top.position.y = y + 0.75; else { top.rotation.z = Math.PI / 2; top.rotation.y = Math.PI / 2; top.position.y = y + 0.05; }
      g.add(top); y += i % 2 ? 1.5 : 0.8;
      const ring = new T.Mesh(new T.TorusGeometry(1.25, 0.03, 6, 40), basic(0x0D99FF)); ring.rotation.x = Math.PI / 2; ring.position.y = h * 0.5; g.add(ring);
      bld.spin.push({ m: ring, s: 0.5, axis: 'z' });
      sign(g, pad2(l.n), bld.color, y, bld);
      return y;
    },
    /* Foundry: workshops with sawtooth roofs and a smoking chimney, tinted by HTML / CSS / JS */
    basics(g, l, i, bld) {
      const tech = techOf(l.id), tc = TECH[tech];
      const h = 1.3 + (i % 3) * 0.55;
      let y = boxTier(g, 'basics', 2.6, h, 2.1, 0, bld, FACADE.basics.roof);
      for (let k = 0; k < 3; k++) { const geo = prism(0.86, 0.5, 2.1), m = new T.Mesh(geo, roofMat(0x3a2a24)); m.position.set(-0.86 + k * 0.86, y, 0); g.add(m); }
      const strip = new T.Mesh(G.box, basic(tc)); strip.scale.set(2.62, 0.08, 2.12); strip.position.y = h * 0.62; g.add(strip);
      const ch = new T.Mesh(G.cyl, roofMat(0x4a3a33)); ch.scale.set(0.22, 1.6 + (i % 2) * 0.6, 0.22); ch.position.set(0.9, y + ch.scale.y / 2, -0.55); g.add(ch);
      const band = new T.Mesh(new T.TorusGeometry(0.24, 0.04, 6, 20), basic(tc)); band.rotation.x = Math.PI / 2; band.position.set(0.9, y + ch.scale.y - 0.15, -0.55); g.add(band);
      for (let k = 0; k < 3; k++) {
        const puff = new T.Mesh(G.sphere, new T.MeshBasicMaterial({ color: 0x8a96aa, transparent: true, opacity: 0.25, depthWrite: false }));
        puff.position.set(0.9, y + ch.scale.y, -0.55); g.add(puff);
        smoke.push({ m: puff, base: y + ch.scale.y, k: k / 3, x: 0.9, z: -0.55 });
      }
      y += 0.5;
      sign(g, pad2(l.n), bld.color, y + 0.3, bld);
      return y;
    },
    /* React: towers of stacked "component" modules joined by glowing seams, with an orbit ring on top */
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
    /* Vue: terraced garden towers with green ledges and little bushes */
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

  /* district monuments and decorations (centered on the district) */
  const plazaAt = (top, color, r) => {
    const plaza = new T.Mesh(new T.CylinderGeometry(r, r, 0.05, 48), new T.MeshStandardMaterial({ color: 0x10161f, roughness: 0.4, metalness: 0.5 })); plaza.position.set(0, 0.03, 0); top.add(plaza);
    addGlow(top, 0, 0.07, 0, r * 2.9, color, 0.35);
  };
  const DECOR = {
    /* Principia: a round temple (tholos) with a glowing dome */
    theory(top, D) {
      plazaAt(top, 0x7EF2C3, 2.4);
      const colMat = new T.MeshStandardMaterial({ color: 0xd9e4de, emissive: 0x7EF2C3, emissiveIntensity: 0.18, roughness: 0.5 });
      const base = new T.Mesh(new T.CylinderGeometry(1.9, 2.1, 0.35, 32), roofMat(0x2b3530)); base.position.y = 0.18; top.add(base);
      for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2, c = new T.Mesh(G.cyl, colMat); c.scale.set(0.12, 2.2, 0.12); c.position.set(Math.cos(a) * 1.6, 1.45, Math.sin(a) * 1.6); top.add(c); }
      const roof = new T.Mesh(new T.CylinderGeometry(1.95, 1.95, 0.25, 32), roofMat(0x2b3530)); roof.position.y = 2.68; top.add(roof);
      const dome = new T.Mesh(new T.SphereGeometry(1.7, 28, 12, 0, Math.PI * 2, 0, Math.PI / 2), new T.MeshStandardMaterial({ color: 0x23332c, emissive: 0x7EF2C3, emissiveIntensity: 0.45, roughness: 0.35 })); dome.position.y = 2.8; top.add(dome);
      const orb = new T.Mesh(G.sphere, basic(0x7EF2C3)); orb.scale.setScalar(0.28); orb.position.y = 4.8; top.add(orb);
      spinners.push({ m: orb, s: 0, bob: 4.8 });
      for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2 + 0.3; tree(top, Math.cos(a) * (D.w / 2 - 0.9), Math.sin(a) * (D.d / 2 - 0.9) * 0.2 + (k < 3 ? D.d / 2 - 0.9 : -D.d / 2 + 0.9), 0.7); }
    },
    /* Vectoria: the Figma logo as a standing sculpture */
    figma(top) {
      plazaAt(top, 0xA259FF, 2.4);
      const S = 4.6 / 57, logo = new T.Group();
      const shapes = [
        ['#f24e1e', s => { s.moveTo(19, 57); s.lineTo(9.5, 57); s.absarc(9.5, 47.5, 9.5, Math.PI / 2, Math.PI * 1.5, false); s.lineTo(19, 38); }],
        ['#ff7262', s => { s.moveTo(19, 57); s.lineTo(28.5, 57); s.absarc(28.5, 47.5, 9.5, Math.PI / 2, -Math.PI / 2, true); s.lineTo(19, 38); }],
        ['#a259ff', s => { s.moveTo(19, 38); s.lineTo(9.5, 38); s.absarc(9.5, 28.5, 9.5, Math.PI / 2, Math.PI * 1.5, false); s.lineTo(19, 19); }],
        ['#1abcfe', s => { s.absarc(28.5, 28.5, 9.5, 0, Math.PI * 2, false); }],
        ['#0acf83', s => { s.moveTo(19, 19); s.lineTo(9.5, 19); s.absarc(9.5, 9.5, 9.5, Math.PI / 2, Math.PI, false); s.absarc(9.5, 9.5, 9.5, Math.PI, Math.PI * 2, false); s.lineTo(19, 19); }]
      ];
      shapes.forEach(([c, draw]) => {
        const s = new T.Shape(); draw(s);
        const geo = new T.ExtrudeGeometry(s, { depth: 6, bevelEnabled: true, bevelSize: 0.6, bevelThickness: 0.6, bevelSegments: 2, curveSegments: 24 });
        geo.translate(-19, 0, -3); geo.scale(S, S, S);
        logo.add(new T.Mesh(geo, new T.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 0.55, roughness: 0.35 })));
      });
      logo.position.set(0, 0.9, 0); top.add(logo);
      spinners.push({ m: logo, s: 0.3 });
      const ped = new T.Mesh(new T.CylinderGeometry(0.5, 0.7, 0.9, 6), roofMat(0x221d2e)); ped.position.y = 0.45; top.add(ped);
      billboard(top, -6.4, 5.2, boardTex((g, w, h) => {
        g.strokeStyle = '#A259FF'; g.lineWidth = 5; g.strokeRect(6, 6, w - 12, h - 12);
        drawPaths(g, FIGMA_PATHS, 30, 20, 1.55);
        g.fillStyle = '#E6EDF3'; g.font = '700 34px "Space Grotesk", sans-serif'; g.textBaseline = 'middle'; g.fillText('Figma', 110, h / 2 + 2);
      }));
    },
    /* Foundry: three glowing pillars for HTML, CSS and JS */
    basics(top) {
      plazaAt(top, 0xFF8A4C, 2.4);
      [['html', '</>', -1.1], ['css', '{ }', 0], ['js', 'JS', 1.1]].forEach(([k, txt, x], j) => {
        const h = 2.6 + j * 0.7, c = TECH[k];
        const p = new T.Mesh(G.box, new T.MeshStandardMaterial({ color: 0x1a1512, emissive: c, emissiveIntensity: 0.35, roughness: 0.4 })); p.scale.set(0.85, h, 0.85); p.position.set(x, h / 2, 0); top.add(p);
        const e = new T.LineSegments(G.boxE, basic(c)); e.scale.copy(p.scale); e.position.copy(p.position); top.add(e);
        const sp = new T.Sprite(new T.SpriteMaterial({ map: signTex(txt, '#' + new T.Color(c).getHexString()), toneMapped: false, transparent: true, depthWrite: false }));
        sp.scale.set(1.5, 0.56, 1); sp.position.set(x, h + 0.6, 0); top.add(sp);
      });
      [[-7.4, 5.4], [7.4, 5.4], [-7.4, -5.4], [7.4, -5.4]].forEach(p => { const crate = new T.Mesh(G.box, roofMat(0x3a2a24)); crate.scale.set(0.7, 0.5, 0.7); crate.position.set(p[0], 0.25, p[1]); top.add(crate); });
    },
    /* React: a giant spinning atom over the central plaza */
    react(top) {
      plazaAt(top, 0x61DAFB, 2.4);
      const ped = new T.Mesh(new T.CylinderGeometry(0.35, 0.6, 2.2, 6), new T.MeshStandardMaterial({ color: 0x1a2533, metalness: 0.6, roughness: 0.4 })); ped.position.set(0, 1.1, 0); top.add(ped);
      const atom = new T.Group(); atom.position.set(0, 4.2, 0); top.add(atom);
      const nucleus = new T.Mesh(G.sphere, basic(0x61DAFB)); nucleus.scale.setScalar(0.42); atom.add(nucleus);
      const electrons = [];
      [0, Math.PI / 3, -Math.PI / 3].forEach((rz, k) => {
        const orbit = new T.Group(); orbit.rotation.z = rz; atom.add(orbit);
        const ring = new T.Mesh(new T.TorusGeometry(2, 0.07, 8, 96), basic(0x61DAFB)); ring.scale.set(1, 0.38, 1); orbit.add(ring);
        const e = new T.Mesh(G.sphere, basic(0xE6FBFF)); e.scale.setScalar(0.14); orbit.add(e);
        electrons.push({ e, a: k * 2.1 });
      });
      spinners.push({ m: atom, s: 0.35, electrons });
      billboard(top, 6.9, 0, boardTex((g, w, h) => {
        g.strokeStyle = '#61DAFB'; g.lineWidth = 5; g.strokeRect(6, 6, w - 12, h - 12);
        g.save(); g.translate(58, h / 2); g.strokeStyle = '#61DAFB'; g.lineWidth = 3;
        [0, 60, 120].forEach(a => { g.save(); g.rotate(a * Math.PI / 180); g.beginPath(); g.ellipse(0, 0, 34, 13, 0, 0, Math.PI * 2); g.stroke(); g.restore(); });
        g.fillStyle = '#61DAFB'; g.beginPath(); g.arc(0, 0, 6, 0, Math.PI * 2); g.fill(); g.restore();
        g.fillStyle = '#E6EDF3'; g.font = '700 34px "Space Grotesk", sans-serif'; g.textBaseline = 'middle'; g.fillText('React', 108, h / 2 + 2);
      }), Math.PI / 2);
    },
    /* Vue: the V logo standing in a garden */
    vue(top, D) {
      const lawn = new T.Mesh(new T.CylinderGeometry(2.6, 2.6, 0.05, 48), new T.MeshStandardMaterial({ color: 0x10241b, emissive: 0x42B883, emissiveIntensity: 0.06, roughness: 0.9 })); lawn.position.set(0, 0.03, 0); top.add(lawn);
      addGlow(top, 0, 0.07, 0, 7, 0x42B883, 0.35);
      const S = 3.4 / 256, mk = pts => { const s = new T.Shape(); pts.forEach((p, k) => { const x = (p[0] - 128) * S, y = (220.8 - p[1]) * S; k ? s.lineTo(x, y) : s.moveTo(x, y); }); s.closePath(); return s; };
      const ext = { depth: 0.35, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 1 };
      const outer = new T.Mesh(new T.ExtrudeGeometry(mk([[0, 0], [50.56, 0], [128, 132.48], [204.8, 0], [256, 0], [128, 220.8]]), ext), new T.MeshStandardMaterial({ color: 0x42B883, emissive: 0x42B883, emissiveIntensity: 0.75, roughness: 0.4 }));
      const inner = new T.Mesh(new T.ExtrudeGeometry(mk([[50.56, 0], [97.92, 0], [128, 51.2], [157.44, 0], [204.8, 0], [128, 133.12]]), ext), new T.MeshStandardMaterial({ color: 0x35495E, emissive: 0x35495E, emissiveIntensity: 0.6, roughness: 0.4 }));
      const logo = new T.Group(); [outer, inner].forEach(m => { m.position.z = -0.175; logo.add(m); });
      logo.position.set(0, 1.4, 0); top.add(logo);
      spinners.push({ m: logo, s: 0.3 });
      [[-D.w / 2 + 0.9, 5.2, 0.9], [D.w / 2 - 0.9, 5.2, 0.9], [-D.w / 2 + 0.9, -5.4, 1], [D.w / 2 - 0.9, -5.4, 1]].forEach(p => tree(top, p[0], p[1], p[2], 0x42B883));
      billboard(top, -7.6, 0, boardTex((g, w, h) => {
        g.strokeStyle = '#42B883'; g.lineWidth = 5; g.strokeRect(6, 6, w - 12, h - 12);
        drawPaths(g, VUE_PATHS, 26, (h - 221 * 0.32) / 2, 0.32);
        g.fillStyle = '#E6EDF3'; g.font = '700 34px "Space Grotesk", sans-serif'; g.textBaseline = 'middle'; g.fillText('Vue', 128, h / 2 + 2);
      }), -Math.PI / 2);
    }
  };

  /* ───── street life inside each district: sidewalks, lamps, string lights, benches, people,
     and themed decorations in the empty lots ───── */
  const lampSpots = [], benchSpots = [], bulbSpots = [], studSpots = [], walkers = [], lotSpots = [];
  const APRON = 1.3;
  const LOT = {
    /* Principia: an obelisk in a small garden with benches and a hedge ring */
    theory(top, x, z, k) {
      const ped = new T.Mesh(G.box, roofMat(0x2b3530)); ped.scale.set(0.9, 0.3, 0.9); ped.position.set(x, 0.15, z); top.add(ped);
      const ob = new T.Mesh(new T.CylinderGeometry(0.12, 0.3, 2.4, 4), new T.MeshStandardMaterial({ color: 0xd9e4de, emissive: 0x7EF2C3, emissiveIntensity: 0.15, roughness: 0.5 })); ob.position.set(x, 1.5, z); ob.rotation.y = Math.PI / 4; top.add(ob);
      const tip = new T.Mesh(G.sphere, basic(0x7EF2C3)); tip.scale.setScalar(0.12); tip.position.set(x, 2.8, z); top.add(tip); blinkers.push({ m: tip, phase: k, soft: true });
      const hedge = new T.Mesh(new T.TorusGeometry(1.0, 0.16, 6, 24), new T.MeshStandardMaterial({ color: 0x173a2d, emissive: 0x7EF2C3, emissiveIntensity: 0.12, flatShading: true })); hedge.rotation.x = Math.PI / 2; hedge.position.set(x, 0.12, z); top.add(hedge);
      benchSpots.push([top, x - 1.2, z, Math.PI / 2], [top, x + 1.2, z, -Math.PI / 2]);
    },
    /* Vectoria: Figma's shapes as a slowly turning sculpture */
    figma(top, x, z, k) {
      const pal = [0xF24E1E, 0xA259FF, 0x1ABCFE, 0x0ACF83, 0xFF7262];
      const ped = new T.Mesh(new T.CylinderGeometry(0.7, 0.8, 0.35, 24), roofMat(0x221d2e)); ped.position.set(x, 0.17, z); top.add(ped);
      const g = new T.Group(); g.position.set(x, 0.35, z); top.add(g);
      const mk = (geo, c, px, py, pz) => { const m = new T.Mesh(geo, new T.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 0.5, roughness: 0.35 })); m.position.set(px, py, pz); g.add(m); return m; };
      mk(new T.BoxGeometry(0.7, 0.7, 0.7), pal[k % 5], -0.25, 0.35, 0);
      mk(new T.SphereGeometry(0.38, 20, 14), pal[(k + 2) % 5], 0.3, 0.38, 0.1);
      mk(new T.ConeGeometry(0.32, 0.8, 20), pal[(k + 3) % 5], 0.05, 1.05, -0.05);
      spinners.push({ m: g, s: 0.4 });
      benchSpots.push([top, x, z + 1.3, 0]);
    },
    /* Foundry: a glowing kiln and stacked crates */
    basics(top, x, z, k) {
      const kiln = new T.Mesh(new T.CylinderGeometry(0.75, 0.9, 1.3, 10), roofMat(0x3a2a24)); kiln.position.set(x, 0.65, z); top.add(kiln);
      const mouth = new T.Mesh(G.plane, basic(0xFF8A4C)); mouth.scale.set(0.6, 0.45, 1); mouth.position.set(x, 0.45, z + 0.86); top.add(mouth);
      addGlow(top, x, 0.04, z + 1.2, 2.2, 0xFF8A4C, 0.5);
      for (let c = 0; c < 3; c++) { const cr = new T.Mesh(G.box, roofMat(0x4a3428)); cr.scale.set(0.55, 0.45, 0.55); cr.position.set(x + 1.15, 0.23 + (c === 2 ? 0.45 : 0), z - 0.4 + (c === 1 ? 0.6 : 0)); top.add(cr); }
      for (let p = 0; p < 2; p++) { const puff = new T.Mesh(G.sphere, new T.MeshBasicMaterial({ color: 0x8a96aa, transparent: true, opacity: 0.25, depthWrite: false })); top.add(puff); smoke.push({ m: puff, base: 1.3, k: p / 2, x: x, z: z }); }
    },
    /* React: a hologram cube that keeps re-rendering inside a wireframe */
    react(top, x, z, k) {
      const pad = new T.Mesh(new T.CylinderGeometry(0.8, 0.8, 0.12, 6), roofMat(0x1a2533)); pad.position.set(x, 0.06, z); top.add(pad);
      addGlow(top, x, 0.14, z, 2.6, 0x61DAFB, 0.5);
      const g = new T.Group(); g.position.set(x, 1.3, z); top.add(g);
      const frame = new T.LineSegments(G.boxE, basic(0x61DAFB)); frame.scale.setScalar(1.1); g.add(frame);
      const core = new T.Mesh(G.box, new T.MeshStandardMaterial({ color: 0x61DAFB, emissive: 0x61DAFB, emissiveIntensity: 0.8, transparent: true, opacity: 0.7 })); core.scale.setScalar(0.5); g.add(core);
      spinners.push({ m: g, s: 0.7, bob: 1.3 + 0 });
      g.userData.bobBase = 1.3;
    },
    /* Vue: a fountain with a green glowing jet */
    vue(top, x, z, k) {
      const basin = new T.Mesh(new T.CylinderGeometry(0.95, 1.05, 0.3, 28), roofMat(0x2a3a35)); basin.position.set(x, 0.15, z); top.add(basin);
      const water = new T.Mesh(new T.CylinderGeometry(0.85, 0.85, 0.05, 28), new T.MeshStandardMaterial({ color: 0x0c3a2a, emissive: 0x42B883, emissiveIntensity: 0.7, roughness: 0.1 })); water.position.set(x, 0.3, z); top.add(water);
      const jet = new T.Mesh(new T.CylinderGeometry(0.05, 0.12, 1.0, 10), new T.MeshBasicMaterial({ color: 0x9BE8C4, transparent: true, opacity: 0.7, toneMapped: false })); jet.position.set(x, 0.8, z); top.add(jet);
      const drop = new T.Mesh(G.sphere, basic(0xC9F7E2)); drop.scale.setScalar(0.14); drop.position.set(x, 1.35, z); top.add(drop);
      spinners.push({ m: drop, s: 0, bob: 1.35 });
      for (let f = 0; f < 6; f++) { const a = f / 6 * Math.PI * 2; bulbSpots.push([top, x + Math.cos(a) * 1.25, 0.12, z + Math.sin(a) * 1.25, f % 2 ? 0x42B883 : 0xFFD58A]); }
      benchSpots.push([top, x, z - 1.5, Math.PI]);
    }
  };
  /* sidewalks in front of and behind each district, with lamps, string lights, benches and people */
  /* a glowing pattern on each district's ground */
  const GROUND = {
    theory: (g, w, h) => { g.strokeStyle = 'rgba(126,242,195,.22)'; g.lineWidth = 2; for (let y = 0; y < h; y += 32) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); for (let x = (y / 32) % 2 ? 0 : 24; x < w; x += 48) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 32); g.stroke(); } } },
    figma: (g, w, h) => { g.fillStyle = 'rgba(162,89,255,.55)'; for (let y = 8; y < h; y += 16) for (let x = 8; x < w; x += 16) { g.beginPath(); g.arc(x, y, 1.6, 0, Math.PI * 2); g.fill(); } },
    basics: (g, w, h) => { g.strokeStyle = 'rgba(255,138,76,.22)'; g.lineWidth = 3; for (let y = 0; y < h; y += 64) for (let x = 0; x < w; x += 64) { g.strokeRect(x + 2, y + 2, 60, 60); g.fillStyle = 'rgba(255,138,76,.35)'; [[8, 8], [56, 8], [8, 56], [56, 56]].forEach(p => { g.beginPath(); g.arc(x + p[0], y + p[1], 2.5, 0, Math.PI * 2); g.fill(); }); } },
    react: (g, w, h) => { const r = rng(7); g.strokeStyle = 'rgba(97,218,251,.5)'; g.fillStyle = 'rgba(97,218,251,.8)'; g.lineWidth = 2; for (let i = 0; i < 26; i++) { let x = Math.floor(r() * 16) * 16, y = Math.floor(r() * 16) * 16; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 4; k++) { if (r() < 0.5) x += (r() < 0.5 ? -1 : 1) * 32; else y += (r() < 0.5 ? -1 : 1) * 32; g.lineTo(x, y); } g.stroke(); g.beginPath(); g.arc(x, y, 3.5, 0, Math.PI * 2); g.fill(); } },
    vue: (g, w, h) => { const r = rng(9); for (let i = 0; i < 900; i++) { g.fillStyle = 'rgba(66,184,131,' + (0.12 + r() * 0.3) + ')'; g.fillRect(r() * w, r() * h, 2, 3 + r() * 3); } }
  };
  const propSpots = [];
  const PROPS = {
    theory: r => [['cone', 0.5, 0.95, 0.5, 0x1f5c40], ['sphere', 0.5, 0.4, 0.5, 0x1f5c40]][r < 0.6 ? 0 : 1],
    figma: r => [['box', 0.45, 0.45, 0.45, [0xF24E1E, 0xA259FF, 0x1ABCFE, 0x0ACF83, 0xFF7262][Math.floor(r * 50) % 5]], ['sphere', 0.45, 0.45, 0.45, [0xA259FF, 0x1ABCFE, 0xFF7262][Math.floor(r * 30) % 3]]][r < 0.5 ? 0 : 1],
    basics: r => [['cyl', 0.36, 0.55, 0.36, [0x8a4a2a, 0x2a5a8a, 0x8a7a2a][Math.floor(r * 30) % 3]], ['box', 0.5, 0.4, 0.5, 0x4a3428]][r < 0.6 ? 0 : 1],
    react: r => ['box', 0.16, 0.9, 0.16, 0x1a2a3a],
    vue: r => [['cone', 0.5, 1.0, 0.5, 0x1f6b48], ['sphere', 0.45, 0.35, 0.45, 0x2f8a5f]][r < 0.55 ? 0 : 1]
  };
  function furnish(lv, D, top, free, used) {
    free.forEach((sl, k) => { (LOT[lv.key] || LOT.theory)(top, sl[0], sl[1], k); lotSpots.push([D.x + sl[0], D.z + sl[1]]); });
    // ground pattern
    const gt = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#000'; g.fillRect(0, 0, w, h); (GROUND[lv.key] || GROUND.theory)(g, w, h); });
    gt.wrapS = gt.wrapT = T.RepeatWrapping; gt.repeat.set(D.w / 6, D.d / 6);
    const ground = new T.Mesh(G.plane, new T.MeshBasicMaterial({ map: gt, transparent: true, opacity: 0.85, blending: T.AdditiveBlending, depthWrite: false, toneMapped: false }));
    ground.rotation.x = -Math.PI / 2; ground.scale.set(D.w - 0.1, D.d - 0.1, 1); ground.position.y = 0.006; top.add(ground);
    // small props in the gaps between buildings, the monument and the path
    const taken = used.concat(free).map(p => [p[0], p[1], 1.75]).concat([[0, 0, 2.9]]);
    const placed = [];
    for (let tries = 0; tries < 260 && placed.length < Math.round(D.w * D.d / 9); tries++) {
      const x = (rand() - 0.5) * (D.w - 0.9), z = (rand() - 0.5) * (D.d - 0.9);
      if (Math.abs(x) < 1.0 && z > 1.8) continue;
      if (taken.some(p => Math.hypot(p[0] - x, p[1] - z) < p[2])) continue;
      if (placed.some(p => Math.hypot(p[0] - x, p[1] - z) < 1.0)) continue;
      placed.push([x, z]);
      const pr = (PROPS[lv.key] || PROPS.theory)(rand()), sc = 0.8 + rand() * 0.5;
      propSpots.push([top, x, z, pr[0], pr[1] * sc, pr[2] * sc, pr[3] * sc, pr[4], rand() * Math.PI]);
      if (lv.key === 'react') bulbSpots.push([top, x, pr[2] * sc + 0.05, z, 0x61DAFB]);
      if (lv.key === 'basics' && rand() < 0.3) bulbSpots.push([top, x, pr[2] * sc + 0.05, z, 0xFF8A4C]);
      if (lv.key === 'vue' && rand() < 0.35) bulbSpots.push([top, x, 0.08, z + 0.35, [0xFFD58A, 0xFF93B5, 0xB9A3FF][Math.floor(rand() * 3)]]);
    }
    // a lit path from the front edge to the monument plaza
    const path = new T.Mesh(G.box, new T.MeshStandardMaterial({ color: 0x1b2331, roughness: 0.7 })); path.scale.set(1.3, 0.02, D.d / 2 - 2.2); path.position.set(0, 0.01, D.d / 4 + 1.1); top.add(path);
    for (let z = 2.6; z < D.d / 2 - 0.2; z += 0.7) [-0.75, 0.75].forEach(x => studSpots.push([top, x, z, lv.hex]));
    [1, -1].forEach(side => {
      const zc = side * (D.d / 2 + APRON / 2);
      const apron = new T.Mesh(G.box, new T.MeshStandardMaterial({ color: 0x18202c, roughness: 0.8 })); apron.scale.set(D.w, 0.3, APRON); apron.position.set(D.x, 0.15, D.z + zc); scene.add(apron);
      const edge = new T.Mesh(G.box, basic(lv.hex, { transparent: true, opacity: 0.45 })); edge.scale.set(D.w, 0.03, 0.05); edge.position.set(D.x, 0.31, D.z + zc + side * APRON / 2); scene.add(edge);
      const lamps = [];
      for (let x = -D.w / 2 + 0.8; x <= D.w / 2 - 0.6; x += 2.5) { lamps.push(x); lampSpots.push([D.x + x, D.z + zc + side * 0.42, lv.hex, side]); }
      lamps.forEach((x, i) => { if (i % 2 === 1) benchSpots.push([scene, D.x + x - 1.25, D.z + zc - side * 0.25, side > 0 ? 0 : Math.PI, 0.3]); });
      if (side > 0) for (let i = 0; i < lamps.length - 1; i++) {
        const a = lamps[i], b = lamps[i + 1];
        for (let s = 1; s < 6; s++) { const t = s / 6; bulbSpots.push([scene, D.x + a + (b - a) * t, 1.85 - Math.sin(t * Math.PI) * 0.35, D.z + zc + 0.42, [lv.hex, 0xFFD58A, 0xFF93B5][s % 3]]); }
      }
      const n = Math.max(3, Math.round(D.w / 3.5));
      for (let i = 0; i < n; i++) walkers.push({ x0: D.x - D.w / 2 + 0.4, x1: D.x + D.w / 2 - 0.4, z: D.z + zc + (rand() - 0.5) * 0.5, pos: rand(), dir: rand() < 0.5 ? -1 : 1, speed: 0.025 + rand() * 0.02 });
    });
  }
  /* everything repeated is instanced, so hundreds of lamps and people stay cheap */
  function buildStreetLife() {
    const at = (parent, x, y, z) => { const v = new T.Vector3(x, y, z); if (parent !== scene) parent.localToWorld(v); return v; };
    scene.updateMatrixWorld(true);
    const inst = (geo, mat, list, place) => {
      if (!list.length) return null;
      const m = new T.InstancedMesh(geo, mat, list.length); m.frustumCulled = false;
      list.forEach((it, i) => { place(it, i); dummy.updateMatrix(); m.setMatrixAt(i, dummy.matrix); });
      scene.add(m); return m;
    };
    const lampCol = new T.Color();
    lampPosts(lampSpots.map(it => [it[0], 0.3, it[1], -it[3] * Math.PI / 2, new T.Color(it[2]).lerp(new T.Color(0xffffff), 0.45).getHex(), 0.95]), 0.075);
    const pools = inst(G.plane, new T.MeshBasicMaterial({ map: glow, transparent: true, opacity: 0.4, depthWrite: false, blending: T.AdditiveBlending, toneMapped: false }), lampSpots, it => { dummy.position.set(it[0], 0.33, it[1] + it[3] * 0.4); dummy.rotation.set(-Math.PI / 2, 0, 0); dummy.scale.set(2.4, 2.4, 1); });
    if (pools) lampSpots.forEach((it, i) => pools.setColorAt(i, lampCol.set(it[2])));
    dummy.rotation.set(0, 0, 0);
    const bulbs = inst(G.bulb, new T.MeshBasicMaterial({ toneMapped: false }), bulbSpots, it => { const v = at(it[0], it[1], it[2], it[3]); dummy.position.copy(v); dummy.scale.setScalar(0.065); });
    if (bulbs) bulbSpots.forEach((it, i) => bulbs.setColorAt(i, lampCol.set(it[4])));
    const studs = inst(G.bulb, new T.MeshBasicMaterial({ toneMapped: false }), studSpots, it => { const v = at(it[0], it[1], 0.05, it[2]); dummy.position.copy(v); dummy.scale.setScalar(0.06); });
    if (studs) studSpots.forEach((it, i) => studs.setColorAt(i, lampCol.set(it[3])));
    inst(MODELS.bench, [new T.MeshStandardMaterial({ color: 0x8a5a3a, roughness: 0.7 }), new T.MeshStandardMaterial({ color: 0x2a3344, roughness: 0.4, metalness: 0.6 })], benchSpots, it => { const v = at(it[0], it[1], it[4] || 0, it[2]); dummy.position.copy(v); dummy.rotation.set(0, it[3], 0); dummy.scale.setScalar(1); });
    dummy.rotation.set(0, 0, 0); dummy.scale.setScalar(1);
    // props: [parent, x, z, kind, width, height, depth, color, rotY]; G.sphere/cone/cyl have radius 1, G.box is 1 wide
    ['box', 'cyl', 'cone', 'sphere'].forEach(kind => {
      const list = propSpots.filter(p => p[3] === kind);
      if (!list.length) return;
      const m = inst(propGeometry(kind), new T.MeshStandardMaterial({ color: 0xffffff, roughness: kind === 'box' ? 0.4 : 0.7 }), list, it => {
        const w = kind === 'box' ? it[4] : it[4] / 2, h = kind === 'sphere' ? it[5] / 2 : it[5];
        dummy.position.copy(at(it[0], it[1], kind === 'sphere' ? h : it[5] / 2, it[2]));
        dummy.rotation.set(0, it[8], 0); dummy.scale.set(w, h, kind === 'box' ? it[6] : w);
      });
      if (m) list.forEach((it, i) => m.setColorAt(i, lampCol.set(it[7])));
    });
    dummy.rotation.set(0, 0, 0); dummy.scale.setScalar(1);
    // people: real (low-detail) humans with random looks, spread evenly over the districts
    const max = small ? 8 : 16, every = Math.max(1, Math.ceil(walkers.length / max));
    walkers.forEach((w, i) => {
      if (i % every) return;
      w.ch = makeCharacter(T, randomLook(rand), { detail: 'low' });
      w.ch.group.scale.setScalar(0.5); scene.add(w.ch.group); addShadow(w.ch.group, 0.75, 0.75);
      w.face = w.dir > 0 ? Math.PI / 2 : -Math.PI / 2; w.wait = 0;
    });
    walkers.ready = true;
  }
  function moveWalkers(d) {
    if (!walkers.ready) return;
    const cp = cam.position;
    walkers.forEach(w => {
      if (!w.ch) return;
      // people far from the camera are only a few pixels tall: skip drawing them
      const near = w.ch.group.position.distanceTo(cp) < 30;
      w.ch.group.visible = near;
      // walk, turn around smoothly at the ends, and now and then stop to look around
      let v = 0;
      w.wait -= d;
      if (w.wait <= 0) {
        w.pos += w.dir * w.speed * d * 1.4; v = w.speed * 1.4 * Math.abs(w.x1 - w.x0);
        if (w.pos > 1 || w.pos < 0) { w.pos = Math.min(1, Math.max(0, w.pos)); w.dir *= -1; w.wait = 0.5 + Math.random() * 1.2; }
        else if (Math.random() < d * 0.05) w.wait = 1.5 + Math.random() * 3;
      }
      const want = w.dir > 0 ? Math.PI / 2 : -Math.PI / 2;
      let df = want - w.face; while (df > Math.PI) df -= Math.PI * 2; while (df < -Math.PI) df += Math.PI * 2;
      w.face += df * Math.min(1, d * 4);
      w.ch.group.position.set(w.x0 + (w.x1 - w.x0) * w.pos, 0.3, w.z);
      w.ch.group.rotation.y = w.face;
      if (near) w.ch.animate(d, Math.abs(df) > 0.4 ? 0.25 : v / 1.6);
    });
  }

  /* build every district and its lesson buildings */
  const blds = [], hits = [], labels = [];
  const PF_COLOR = { theory: 0x0f1a16, figma: 0x14111d, basics: 0x1a1411, react: 0x0d151d, vue: 0x0e1915 };
  opts.levels.forEach(lv => {
    const D = DISTRICTS[lv.key]; if (!D) return;
    const pf = new T.Mesh(G.box, new T.MeshStandardMaterial({ color: PF_COLOR[lv.key] || 0x121722, roughness: 0.85 })); pf.scale.set(D.w, 0.6, D.d); pf.position.set(D.x, 0.3, D.z); scene.add(pf);
    const pe = new T.LineSegments(G.boxE, new T.LineBasicMaterial({ color: lv.hex, transparent: true, opacity: 0.6 })); pe.scale.copy(pf.scale); pe.position.copy(pf.position); scene.add(pe);
    const top = new T.Group(); top.position.set(D.x, 0.6, D.z); scene.add(top);
    if (DECOR[lv.key]) DECOR[lv.key](top, D);
    const list = opts.lessons.filter(l => l.level === lv.key);
    const slots = districtSlots(list.length, D.w, D.d, D.monument);
    list.forEach((l, i) => {
      const sl = slots[i];
      const g = new T.Group(); g.position.set(sl[0], 0, sl[1]); top.add(g);
      const bld = { id: l.id, title: l.title, num: pad2(l.n), color: lv.color, hex: lv.hex, facades: [], edges: [], spin: [], done: false, lift: 0, glow: 0 };
      const h = (BUILD[lv.key] || BUILD.theory)(g, l, i, bld);
      // completion beacon: a light pillar + halo, faded in when done
      const pillar = new T.Mesh(G.cyl, basic(lv.hex, { transparent: true, opacity: 0, blending: T.AdditiveBlending, depthWrite: false }));
      pillar.scale.set(0.07, 18, 0.07); pillar.position.y = h + 9; g.add(pillar);
      const halo = addGlow(g, 0, 0.03, 0, 4.2, lv.hex, 0);
      Object.assign(bld, { group: g, pillar, halo, top: h + 1.6, x: D.x + sl[0], z: D.z + sl[1] });
      const hit = new T.Mesh(G.box, new T.MeshBasicMaterial()); hit.visible = false;
      hit.scale.set(2.7, h + 0.2, 2.7); hit.position.set(sl[0], (h + 0.2) / 2, sl[1]); top.add(hit);
      hit.userData = bld; hits.push(hit); blds.push(bld);
    });
    furnish(lv, D, top, slots.free || [], slots);
    const chip = 'padding:4px 8px;background:rgba(13,16,22,.85);border:1px solid #263042;border-radius:6px;display:flex;align-items:center;gap:6px';
    const name = lv.name.toUpperCase().replace(/[&<>]/g, '');
    const div = lv.logo ? st.labelHTML('<span style="width:16px;height:16px;display:inline-flex">' + lv.logo + '</span>' + name, lv.color, chip) : st.label(name, lv.color, chip);
    labels.push({ div, pos: new T.Vector3(D.x, 0.7, D.z + D.d / 2 + 1.5) });
  });
  buildStreetLife();
  /* city name signs floating over each city */
  opts.cities.forEach(c => {
    const C = CITIES[c.key]; if (!C) return;
    const col = '#' + new T.Color(c.color).getHexString();
    const div = st.label(c.name, col, 'padding:6px 12px;background:rgba(11,14,20,.85);border:1px solid ' + col + ';border-radius:8px;font-size:13px;letter-spacing:.14em;box-shadow:0 0 18px ' + col + '33');
    labels.push({ div, pos: new T.Vector3(C.x, 12, C.z - 3) });
  });

  /* ───── the town: houses, shophouses (ruko), apartments and trees, as instanced meshes ───── */
  const town = [];
  const variant = (kind, w, h, d, roof) => ({ geo: townGeometry(kind), w, h, d, roof });
  const VARIANTS = {
    house: variant('house', 1.7, 1.2, 1.6, 'gable'),
    house2: variant('house2', 1.9, 2.0, 1.7, 'gable'),
    ruko: variant('ruko', 2.6, 2.3, 1.8, 'awning'),
    apt: variant('apt', 2.1, 3.8, 2.1, 'flat'),
    tower: variant('tower', 1.9, 6.4, 1.9, 'flat')
  };
  const townTiles = tiles.town;
  const townMat = new T.MeshStandardMaterial({ map: townTiles.normal.map, emissive: 0xffffff, emissiveMap: townTiles.normal.emissive, emissiveIntensity: 0.55, roughness: 0.7, metalness: 0.15 });
  const townRoof = new T.MeshStandardMaterial({ color: 0x2b2f3a, roughness: 0.8 });
  const townTrim = new T.MeshStandardMaterial({ color: 0x353d4d, roughness: 0.6, metalness: 0.15 });
  const warmLight = new T.MeshBasicMaterial({ color: 0x9a7650, toneMapped: false });
  const spots = { house: [], house2: [], ruko: [], apt: [], tower: [] }, treeSpots = [];
  const inCore = (x, z) => x > CORE[0] && x < CORE[1] && z > CORE[2] && z < CORE[3];
  const inRiver = x => x > RIVER.x0 - 1.6 && x < RIVER.x1 + 1.6;
  for (let x = -64; x <= 126; x += 3.3) for (let z = -48; z <= 38; z += 3.4) {
    const jx = x + (rand() - 0.5) * 0.8, jz = z + (rand() - 0.5) * 0.8;
    if (inCore(jx, jz) || inRiver(jx)) continue;
    const dist = Math.max(0, Math.max(CORE[2] - jz, jz - CORE[3], CORE[0] - jx, jx - CORE[1]));
    const r = rand();
    if (r < 0.18) { const k = rand(); treeSpots.push([jx, jz, 0.7 + rand() * 0.6, k < 0.55 ? 'round' : k < 0.82 ? 'pine' : 'palm', rand() * 6]); continue; }
    if (r < 0.26) continue;
    // taller buildings further out, small homes and ruko near the highway
    let kind;
    if (dist < 8) kind = rand() < 0.45 ? 'ruko' : (rand() < 0.6 ? 'house' : 'house2');
    else if (dist < 18) kind = ['house', 'house2', 'ruko', 'apt'][Math.floor(rand() * 4)];
    else kind = rand() < 0.55 ? 'apt' : 'tower';
    spots[kind].push([jx, jz, Math.floor(rand() * 4) * Math.PI / 2]);
  }
  // a row of ruko and houses tucked behind the districts inside each city, facing the ring road
  [[-26, 19.5], [30.5, 92.5]].forEach(([x0, x1]) => {
    for (let x = x0 + 1.4; x < x1 - 1; x += 2.9) {
      if (STREETS.some(s => Math.abs(s - x) < 2.4)) continue;
      spots[rand() < 0.5 ? 'ruko' : 'house'].push([x, -12.5, Math.PI]);
    }
  });
  const tint = new T.Color();
  const TINTS = [0xffffff, 0xd8e6ff, 0xffe9d6, 0xe6ffe9, 0xf1e6ff];
  const AWNING = [0xFF7262, 0x7FD4FF, 0x7EF2C3, 0xFFC877, 0xB9A3FF, 0xFF93B5];
  Object.keys(VARIANTS).forEach(k => {
    const V = VARIANTS[k], list = spots[k]; if (!list.length) return;
    chunked(V.geo, [townMat, townRoof, townTrim, warmLight], list, (s, i, m) => {
      dummy.position.set(s[0], 0, s[1]); dummy.rotation.set(0, s[2], 0); dummy.scale.setScalar(1);
      m.setColorAt(i, tint.set(TINTS[(i + Math.round(s[0])) % TINTS.length]));
    }, V.h).forEach(m => town.push(m));
    if (V.roof === 'awning') {
      chunked(awningGeometry(), new T.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.22, roughness: 0.6 }), list, (s, i, m) => {
        const fx = Math.sin(s[2]) * (V.d / 2), fz = Math.cos(s[2]) * (V.d / 2);
        dummy.position.set(s[0] + fx, 1.07, s[1] + fz); dummy.rotation.set(0, s[2], 0); dummy.scale.set(V.w * 0.9, 1, 1);
        m.setColorAt(i, tint.set(AWNING[(i + Math.round(s[1])) % AWNING.length]));
      }, 2);
      dummy.scale.setScalar(1);
    }
  });
  ['round', 'pine', 'palm'].forEach(kind => {
    const list = treeSpots.filter(t => t[3] === kind); if (!list.length) return;
    chunked(MODELS.tree[kind], [barkMat, leafMat(0x7EF2C3)], list, t => { dummy.position.set(t[0], 0, t[1]); dummy.rotation.set(0, t[4], 0); dummy.scale.setScalar(t[2] * 1.15); }, 2.2);
  });
  if (treeSpots.length) {
    chunked(G.plane, shadowMat, treeSpots, t => { dummy.position.set(t[0], 0.012, t[1]); dummy.rotation.set(-Math.PI / 2, 0, 0); dummy.scale.set(1.7 * t[2], 1.7 * t[2], 1); }, 1.5);
    dummy.rotation.set(0, 0, 0); dummy.scale.setScalar(1);
  }

  /* traffic: cars on the highway, around each city's ring road, and on the side streets */
  const cars = [];
  const carCols = [0xE6EDF3, 0x7FD4FF, 0x2C3E66, 0xFF93B5, 0xb8c2cf, 0xc0392b, 0x7EF2C3, 0x2a2f3a, 0xFFC877, 0xB9A3FF];
  const CAR_KINDS = ['sedan', 'hatch', 'suv', 'sedan', 'taxi', 'hatch', 'suv'];
  const carGeo = {}, paints = {};
  const makeCar = (i, highway) => {
    const kind = highway && i % 8 === 3 ? 'bus' : CAR_KINDS[i % CAR_KINDS.length];
    const col = kind === 'taxi' ? 0xF7C948 : kind === 'bus' ? 0x7FD4FF : carCols[i % carCols.length];
    const c = new T.Group();
    const body = new T.Mesh(carGeo[kind] || (carGeo[kind] = carGeometry(kind)), paints[col] || (paints[col] = carMaterials(col, env)));
    c.add(body); c.userData.body = body;
    addShadow(c, kind === 'bus' ? 0.95 : 0.85, kind === 'bus' ? 2.9 : 1.6, 0.01);
    if (!small) { const beam = addGlow(c, 0, 0.05, kind === 'bus' ? 2.2 : 1.55, 1.8, 0xcfefff, 0.22); beam.scale.set(1.1, 2.2, 1); }
    scene.add(c); return c;
  };
  let ci = 0;
  const addLoopCars = (road, n, lane, speed) => {
    for (let i = 0; i < n; i++) {
      const c = makeCar(ci++, road === highway), body = c.userData.body, dir = i % 2 ? -1 : 1;
      c.userData = { body, road, dir, speed: speed + rand() * 2.2, u: (i + rand() * 0.5) / n, lane: dir > 0 ? lane : -lane, h: 0, roll: 0 };
      cars.push(c);
    }
  };
  addLoopCars(highway, small ? 9 : 14, 0.62, 3.4);
  rings.forEach(r => addLoopCars(r, small ? 4 : 7, 0.4, 2.4));
  STREETS.forEach((x, k) => {
    [1, -1].forEach(dir => {
      const c = makeCar(ci++);
      c.userData = { body: c.userData.body, street: true, dir, speed: 2.2 + rand(), pos: rand() * 26 - 17, lane: x + (dir > 0 ? 0.5 : -0.5), min: -18.5, max: 10.5 };
      cars.push(c);
    });
  });
  const tmpP = new T.Vector3(), tmpT = new T.Vector3();

  /* drones: blinking lights circling each city, one per city carrying a spotlight */
  const drones = [];
  [[-3.5, 18, 11, 0.16, 0xFF3DF0], [-3.5, 12, 13, -0.22, 0x22D3FF], [61.5, 22, 10, 0.14, 0x61DAFB], [61.5, 14, 12.5, -0.2, 0x42B883], [61.5, 8, 9, 0.24, 0xFF8A4C]].forEach((d, k) => {
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
  const N = small ? 300 : 800, pos = new Float32Array(N * 3), col = new Float32Array(N * 3), vel = new Float32Array(N);
  const pal = [new T.Color(CYAN), new T.Color(VIOLET), new T.Color(MAGENTA)];
  for (let i = 0; i < N; i++) {
    pos[i * 3] = -50 + rand() * 170; pos[i * 3 + 1] = rand() * 22; pos[i * 3 + 2] = -4 + (rand() - 0.5) * 60;
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
      if (s.bob) s.m.position.y = s.bob + Math.sin(t * 1.4) * 0.18;
      if (s.electrons) s.electrons.forEach(e => { e.a += d * 2.2; e.e.position.set(Math.cos(e.a) * 2, Math.sin(e.a) * 0.76, 0); });
    });
    smoke.forEach(s => { const k = (t * 0.25 * speed + s.k) % 1; s.m.position.set(s.x + k * 0.4, s.base + k * 1.6, s.z); s.m.scale.setScalar(0.12 + k * 0.3); s.m.material.opacity = 0.3 * (1 - k); });
    blinkers.forEach(k => { const on = Math.sin(t * (k.soft ? 1.6 : 3) + k.phase); k.m.visible = k.soft ? true : on > -0.2; if (k.soft) k.m.scale.setScalar(0.05 + (on + 1) * 0.012); });
    waterTex.offset.y -= d * 0.08;
    moveWalkers(d);
    guides.forEach((g, i) => {
      let df = g.faceT - g.face; while (df > Math.PI) df -= Math.PI * 2; while (df < -Math.PI) df += Math.PI * 2;
      g.face += df * Math.min(1, dt * 5); g.ch.group.rotation.y = g.face;
      g.ch.animate(dt, Math.abs(df) > 0.3 ? 0.2 : 0); g.mark.position.y = 1.6 + Math.sin(t * 3 + i) * 0.1;
    });
    if (quest) { beacon.position.set(quest.x, quest.top + 2.6 + Math.sin(t * 4) * 0.25, quest.z); beacon.rotation.y += dt * 2; beaconRing.scale.setScalar(1 + Math.sin(t * 3) * 0.06); }
    if (ex) exploreTick(dt, t);
    cars.forEach(c => {
      const u = c.userData;
      if (u.road) {
        u.u = (u.u + u.dir * u.speed * d / u.road.length + 1) % 1;
        u.road.curve.getPointAt(u.u, tmpP); u.road.curve.getTangentAt(u.u, tmpT);
        const nx = -tmpT.z, nz = tmpT.x, len = Math.hypot(nx, nz) || 1;
        c.position.set(tmpP.x + nx / len * u.lane, tmpP.y + 0.05, tmpP.z + nz / len * u.lane);
        c.lookAt(c.position.x + tmpT.x * u.dir, c.position.y + tmpT.y * u.dir, c.position.z + tmpT.z * u.dir);
        // lean into the bends a little
        const h = Math.atan2(tmpT.x * u.dir, tmpT.z * u.dir); let dh = h - u.h; while (dh > Math.PI) dh -= Math.PI * 2; while (dh < -Math.PI) dh += Math.PI * 2; u.h = h;
        if (d > 0) { u.roll += (Math.max(-0.07, Math.min(0.07, -dh / d * 0.05)) - u.roll) * Math.min(1, d * 4); u.body.rotation.z = u.roll; }
      } else {
        u.pos += u.dir * u.speed * d;
        if (u.pos > u.max) u.pos = u.min; if (u.pos < u.min) u.pos = u.max;
        c.position.set(u.lane, 0.075, u.pos); c.rotation.set(0, u.dir > 0 ? 0 : Math.PI, 0);
      }
    });
    drones.forEach(dr => { dr.a += dr.s * d; dr.g.position.set(dr.cx + Math.cos(dr.a) * dr.r, dr.y + Math.sin(t * 1.3 + dr.r) * 0.3, -3 + Math.sin(dr.a) * dr.r * 0.55); dr.g.rotation.y += d; });
    searchlights.forEach(s => { s.beam.rotation.z = Math.sin(t * 0.5 + s.k * 2) * 0.45; s.beam.rotation.x = Math.cos(t * 0.37 + s.k) * 0.35; });
    const p = pgeo.attributes.position.array;
    for (let i = 0; i < N; i++) { p[i * 3 + 1] += vel[i] * d; p[i * 3] += Math.sin(t + i) * 0.002 * speed; if (p[i * 3 + 1] > 22) p[i * 3 + 1] = 0; }
    pgeo.attributes.position.needsUpdate = true;
    labels.forEach(lb => {
      const q = st.project(lb.pos);
      lb.div.style.display = q.behind ? 'none' : '';
      lb.div.style.transform = 'translate(' + q.x + 'px,' + q.y + 'px) translate(-50%,0)';
    });
    if (hov) { const u = hov.userData, q = st.project(new T.Vector3(u.x, u.top + u.lift + 0.3, u.z)); tip.style.transform = 'translate(' + q.x + 'px,' + q.y + 'px) translate(-50%,-110%)'; }
  };
  /* ───────── explore mode: walk your own character around the world ─────────
     st.explore({ look, pos, minimap, bigmap, onNear, onLocation, onGuide, onMove }) · st.leaveExplore()
     st.setLook(look) · st.setQuest(lessonId) · st.setJoystick(x, y) · st.interact() · st.zoom(delta) · st.showBigMap(on) */
  const OBST = new Map(), CELL = 4;
  const addObst = (x, z, r) => { const k = Math.floor(x / CELL) + ',' + Math.floor(z / CELL); (OBST.get(k) || OBST.set(k, []).get(k)).push([x, z, r]); };
  const MONUMENT_R = { theory: 2.25, figma: 1.5, basics: 1.8, react: 0.9, vue: 1.9 };
  blds.forEach(b => addObst(b.x, b.z, 1.3));
  opts.levels.forEach(lv => { const D = DISTRICTS[lv.key]; if (D) addObst(D.x, D.z, MONUMENT_R[lv.key] || 1.5); });
  lotSpots.forEach(p => addObst(p[0], p[1], 1.15));
  const TOWN_R = { house: 1.0, house2: 1.1, ruko: 1.45, apt: 1.3, tower: 1.2 };
  Object.keys(spots).forEach(k => spots[k].forEach(p => addObst(p[0], p[1], TOWN_R[k] || 1.1)));
  treeSpots.forEach(p => addObst(p[0], p[1], 0.3));
  const hitsObstacle = (x, z, r) => {
    const cx = Math.floor(x / CELL), cz = Math.floor(z / CELL);
    for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) {
      const list = OBST.get((cx + i) + ',' + (cz + j)); if (!list) continue;
      for (const o of list) if ((o[0] - x) * (o[0] - x) + (o[1] - z) * (o[1] - z) < (o[2] + r) * (o[2] + r)) return true;
    }
    return false;
  };
  const onBridge = z => Math.abs(z - 11) < 1.25 || Math.abs(z + 19) < 1.25;
  const blocked = (x, z) => x < -62 || x > 126 || z < -48 || z > 38 || (x > RIVER.x0 - 0.2 && x < RIVER.x1 + 0.2 && !onBridge(z)) || hitsObstacle(x, z, 0.28);
  const hwPts = highway.pts;
  function groundY(x, z) {
    for (const lv of opts.levels) {
      const D = DISTRICTS[lv.key]; if (!D || Math.abs(x - D.x) > D.w / 2) continue;
      const dz = Math.abs(z - D.z);
      if (dz <= D.d / 2) return 0.6;
      if (dz <= D.d / 2 + APRON) return 0.3;
    }
    if (x > 17 && x < 33 && onBridge(z)) { let best = 1e9, y = 0; for (const p of hwPts) { const d2 = (p.x - x) * (p.x - x) + (p.z - z) * (p.z - z); if (d2 < best) { best = d2; y = p.y; } } return y + 0.05; }
    return 0.02;
  }
  function whereIs(x, z) {
    let district = null, city = null;
    opts.levels.forEach(lv => { const D = DISTRICTS[lv.key]; if (D && Math.abs(x - D.x) <= D.w / 2 && Math.abs(z - D.z) <= D.d / 2 + APRON) district = lv.key; });
    ['uiux', 'frontend'].forEach(k => { const C = CITIES[k]; if (Math.abs(x - C.x) <= C.w / 2 + 3 && Math.abs(z - C.z) <= C.d / 2 + 3) city = k; });
    if (district) city = (opts.levels.filter(l => l.key === district)[0] || {}).province || city;
    return { city, district };
  }

  /* guides: one friendly NPC at the entrance of each district */
  const guides = [];
  opts.levels.forEach((lv, i) => {
    const D = DISTRICTS[lv.key]; if (!D) return;
    const look = Object.assign(randomLook(rng(500 + i)), { topColor: CLOTH.indexOf(lv.color.toUpperCase()) >= 0 ? CLOTH.indexOf(lv.color.toUpperCase()) : 3, glasses: true, backpack: false, cap: false });
    const c = makeCharacter(T, look, { detail: 'low' });
    c.group.scale.setScalar(0.5); c.group.position.set(D.x + 1.5, 0.3, D.z + D.d / 2 + 0.65); c.group.rotation.y = 0;
    scene.add(c.group); addShadow(c.group, 0.75, 0.75);
    const mark = new T.Sprite(new T.SpriteMaterial({ map: signTex('!', lv.color), toneMapped: false, transparent: true, depthWrite: false }));
    mark.scale.set(0.9, 0.34, 1); mark.position.set(D.x + 1.5, 1.6, D.z + D.d / 2 + 0.65); scene.add(mark);
    addObst(D.x + 1.5, D.z + D.d / 2 + 0.65, 0.3);
    guides.push({ key: lv.key, ch: c, mark, x: D.x + 1.5, z: D.z + D.d / 2 + 0.65, color: lv.color, face: 0, faceT: 0 });
  });

  /* quest beacon: a bouncing arrow over the building of the current mission */
  const beacon = new T.Group(); beacon.visible = false; scene.add(beacon);
  const arrowM = new T.Mesh(new T.ConeGeometry(0.45, 0.9, 4), basic(0xFFC877)); arrowM.rotation.x = Math.PI; beacon.add(arrowM);
  const beaconRing = new T.Mesh(new T.TorusGeometry(1.7, 0.05, 8, 48), basic(0xFFC877, { transparent: true, opacity: 0.8 })); beaconRing.rotation.x = Math.PI / 2; scene.add(beaconRing); beaconRing.visible = false;
  let questId = null, quest = null;
  st.setQuest = id => {
    questId = id; quest = blds.filter(b => b.id === id)[0] || null;
    beacon.visible = beaconRing.visible = !!quest;
    if (quest) beaconRing.position.set(quest.x, 0.65, quest.z);
  };

  /* the player */
  let ex = null;
  const keys = {};
  const typing = e => /input|textarea|select/i.test((e.target && e.target.tagName) || '');
  const onKey = down => e => {
    if (!ex || typing(e)) return;
    const k = e.key.toLowerCase();
    if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'shift'].indexOf(k) >= 0) { keys[k] = down; if (k.indexOf('arrow') === 0) e.preventDefault(); }
    if (down && (k === 'e' || k === 'enter')) { e.preventDefault(); st.interact(); }
    if (down && k === 'm' && ex.opts.onToggleMap) ex.opts.onToggleMap();
  };
  const kd = onKey(true), ku = onKey(false);
  st.explore = o => {
    if (ex) st.leaveExplore();
    const ch = makeCharacter(T, o.look);
    ch.group.scale.setScalar(0.5); scene.add(ch.group); addShadow(ch.group, 0.8, 0.8);
    const light = new T.PointLight(0xfff1dd, 1.4, 7, 1.6); scene.add(light);
    const ring = new T.Mesh(new T.RingGeometry(0.3, 0.38, 32), basic(0x7EF2C3, { transparent: true, opacity: 0.8, side: T.DoubleSide })); ring.rotation.x = -Math.PI / 2; scene.add(ring);
    const p = o.pos && !blocked(o.pos[0], o.pos[1]) ? o.pos : [-12.5, 4.9];
    ex = { opts: o, ch, light, ring, x: p[0], z: p[1], y: groundY(p[0], p[1]), face: o.pos && o.pos[2] != null ? o.pos[2] : Math.PI, speed: 0, joy: [0, 0], target: null, near: null, where: {}, saveT: 1.5, mapT: 1, R: 9, bigmap: false };
    ch.group.position.set(ex.x, ex.y, ex.z);
    st.orb.auto = 0;
    window.addEventListener('keydown', kd); window.addEventListener('keyup', ku);
    st.flyTo(new T.Vector3(ex.x, ex.y + 0.8, ex.z), ex.R, 1.12, () => {}, 0, 900);
    ch.wave();
  };
  const savePos = () => { if (ex && ex.opts.onMove) ex.opts.onMove([+ex.x.toFixed(2), +ex.z.toFixed(2), +ex.face.toFixed(2)]); };
  st.leaveExplore = () => {
    if (!ex) return;
    savePos();
    window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku);
    scene.remove(ex.ch.group); scene.remove(ex.light); scene.remove(ex.ring); ex.ch.dispose(); ex.ring.geometry.dispose(); ex.ring.material.dispose();
    ex = null; Object.keys(keys).forEach(k => { keys[k] = false; });
    st.orb.auto = REDUCED ? 0 : 0.0007;
    st.focus(focusKey);
  };
  st.setLook = l => { if (ex) ex.ch.setLook(l); };
  st.setJoystick = (x, y) => { if (ex) { ex.joy = [x, y]; if (x || y) ex.target = null; } };
  st.zoom = dz => { if (ex) ex.R = Math.max(4.5, Math.min(24, ex.R + dz)); };
  st.showBigMap = on => { if (ex) ex.bigmap = on; };
  st.interact = () => {
    if (!ex || !ex.near || busy) return;
    const n = ex.near;
    if (n.type === 'lesson') {
      const b = blds.filter(x => x.id === n.id)[0]; busy = true;
      st.flyTo(new T.Vector3(b.x, b.top * 0.55, b.z), 9 + b.top * 0.4, 1.05, () => opts.onOpen(b.id));
    } else if (n.type === 'guide') {
      const g = guides.filter(x => x.key === n.key)[0];
      g.ch.wave(); g.faceT = Math.atan2(ex.x - g.x, ex.z - g.z);
      if (ex.opts.onGuide) ex.opts.onGuide(n.key);
    }
  };
  el.addEventListener('wheel', e => { if (!ex) return; e.preventDefault(); st.zoom(e.deltaY * 0.01); }, { passive: false });

  /* tap or click on the ground to walk there */
  const groundRay = new T.Raycaster(), groundPlane = new T.Plane(new T.Vector3(0, 1, 0), -0.3), hitP = new T.Vector3();
  st.walkTo = n => { if (!ex) return false; groundRay.setFromCamera(n, cam); if (groundRay.ray.intersectPlane(groundPlane, hitP)) { ex.target = [hitP.x, hitP.z]; return true; } return false; };

  function exploreTick(dt, t) {
    const e = ex;
    // input → a direction relative to the camera
    let ix = (keys.d || keys.arrowright ? 1 : 0) - (keys.a || keys.arrowleft ? 1 : 0) + e.joy[0];
    let iy = (keys.w || keys.arrowup ? 1 : 0) - (keys.s || keys.arrowdown ? 1 : 0) - e.joy[1];
    const th = st.orb.theta, fx = -Math.sin(th), fz = -Math.cos(th), rx = -fz, rz = fx;
    let mx = fx * iy + rx * ix, mz = fz * iy + rz * ix;
    if (e.target && !ix && !iy) { mx = e.target[0] - e.x; mz = e.target[1] - e.z; if (Math.hypot(mx, mz) < 0.25) e.target = null; }
    const len = Math.hypot(mx, mz);
    const run = keys.shift || Math.hypot(e.joy[0], e.joy[1]) > 0.92;
    const want = len > 0.05 ? (run ? 4.6 : 2.3) : 0;
    e.speed += (want - e.speed) * Math.min(1, dt * 10);
    if (len > 0.05) {
      mx /= len; mz /= len;
      const step = e.speed * dt, nx = e.x + mx * step, nz = e.z + mz * step;
      if (!blocked(nx, nz)) { e.x = nx; e.z = nz; }
      else if (!blocked(nx, e.z)) e.x = nx;
      else if (!blocked(e.x, nz)) e.z = nz;
      else e.target = null;
      const face = Math.atan2(mx, mz); let df = face - e.face; while (df > Math.PI) df -= Math.PI * 2; while (df < -Math.PI) df += Math.PI * 2;
      e.face += df * Math.min(1, dt * 12);
    }
    e.y += (groundY(e.x, e.z) - e.y) * Math.min(1, dt * 12);
    e.ch.group.position.set(e.x, e.y, e.z); e.ch.group.rotation.y = e.face;
    e.ch.animate(dt, e.speed / 2.3);
    e.light.position.set(e.x, e.y + 2.2, e.z + 0.4); e.ring.position.set(e.x, e.y + 0.03, e.z);
    if (!st.flight && !busy) { st.orb.target.lerp(tmpP.set(e.x, e.y + 0.75, e.z), Math.min(1, dt * 6)); st.orb.radius = e.R; }
    // what is close enough to interact with?
    let near = null, best = 1e9;
    blds.forEach(b => { const d = Math.hypot(b.x - e.x, b.z - e.z) - 1.3; if (d < 1.3 && d < best) { best = d; near = { type: 'lesson', id: b.id }; } });
    guides.forEach(g => { const d = Math.hypot(g.x - e.x, g.z - e.z); if (d < 1.6 && d - 0.3 < best) { best = d - 0.3; near = { type: 'guide', key: g.key }; } });
    const nk = near ? near.type + near.id + near.key : '', ok = e.near ? e.near.type + e.near.id + e.near.key : '';
    if (nk !== ok) { e.near = near; if (e.opts.onNear) e.opts.onNear(near); }
    const w = whereIs(e.x, e.z);
    if (w.city !== e.where.city || w.district !== e.where.district) { e.where = w; if (e.opts.onLocation) e.opts.onLocation(w.city, w.district); }
    e.saveT += dt; if (e.saveT > 1.5 && e.opts.onMove) { e.saveT = 0; e.opts.onMove([+e.x.toFixed(2), +e.z.toFixed(2), +e.face.toFixed(2)]); }
    e.mapT += dt; if (e.mapT > 0.08) { e.mapT = 0; if (e.opts.minimap) drawMap(e.opts.minimap, e.x, e.z, 3.2, false); if (e.bigmap && e.opts.bigmap) drawMap(e.opts.bigmap, 31, -4, 0, true); }
  }

  /* the map: north-up, roads, river, districts, lesson buildings, guides, the mission and you */
  const roadLines = [highway.pts.filter((_, i) => i % 6 === 0)].concat(rings.map(r => r.pts.filter((_, i) => i % 6 === 0)));
  function drawMap(cv, cx, cz, scale, big) {
    const g = cv.getContext('2d'), W = cv.width, H = cv.height;
    if (big) scale = Math.min(W / 150, H / 70);
    const X = x => W / 2 + (x - cx) * scale, Y = z => H / 2 + (z - cz) * scale, dpr = W / (cv.clientWidth || W);
    g.clearRect(0, 0, W, H); g.fillStyle = '#0b0e14'; g.fillRect(0, 0, W, H);
    g.fillStyle = '#0f3047'; g.fillRect(X(RIVER.x0), 0, (RIVER.x1 - RIVER.x0) * scale, H);
    ['uiux', 'frontend'].forEach(k => { const C = CITIES[k]; g.fillStyle = '#121a26'; g.fillRect(X(C.x - C.w / 2), Y(C.z - C.d / 2), C.w * scale, C.d * scale); });
    g.strokeStyle = '#36435c'; g.lineCap = 'round'; g.lineJoin = 'round';
    roadLines.forEach((pts, i) => { g.lineWidth = Math.max(1.5 * dpr, (i ? 1.6 : 2.6) * scale); g.beginPath(); pts.forEach((p, k) => k ? g.lineTo(X(p.x), Y(p.z)) : g.moveTo(X(p.x), Y(p.z))); g.closePath(); g.stroke(); });
    g.lineWidth = Math.max(1.2 * dpr, 2 * scale); STREETS.forEach(x => { g.beginPath(); g.moveTo(X(x), Y(-19)); g.lineTo(X(x), Y(11)); g.stroke(); });
    opts.levels.forEach(lv => {
      const D = DISTRICTS[lv.key]; if (!D) return;
      g.fillStyle = lv.color + '33'; g.strokeStyle = lv.color; g.lineWidth = 1.5 * dpr;
      g.fillRect(X(D.x - D.w / 2), Y(D.z - D.d / 2), D.w * scale, D.d * scale); g.strokeRect(X(D.x - D.w / 2), Y(D.z - D.d / 2), D.w * scale, D.d * scale);
      if (big) { g.fillStyle = lv.color; g.font = '600 ' + Math.round(11 * dpr) + 'px "JetBrains Mono", monospace'; g.textAlign = 'center'; g.fillText(lv.name.toUpperCase(), X(D.x), Y(D.z + D.d / 2) + 16 * dpr); }
    });
    if (big) opts.cities.forEach(c => { const C = CITIES[c.key]; g.fillStyle = '#E6EDF3'; g.font = '700 ' + Math.round(13 * dpr) + 'px "Space Grotesk", sans-serif'; g.textAlign = 'center'; g.fillText(c.name, X(C.x), Y(C.z - C.d / 2) - 8 * dpr); });
    blds.forEach(b => { g.beginPath(); g.arc(X(b.x), Y(b.z), Math.max(2.2 * dpr, 0.9 * scale), 0, Math.PI * 2); if (b.done) { g.fillStyle = b.color; g.fill(); } else { g.strokeStyle = b.color; g.lineWidth = 1.4 * dpr; g.stroke(); } });
    guides.forEach(gd => { g.fillStyle = '#FFC877'; g.beginPath(); g.arc(X(gd.x), Y(gd.z), 3.2 * dpr, 0, Math.PI * 2); g.fill(); g.fillStyle = '#0b0e14'; g.font = '700 ' + Math.round(8 * dpr) + 'px sans-serif'; g.textAlign = 'center'; g.fillText('!', X(gd.x), Y(gd.z) + 3 * dpr); });
    if (quest) { const pulse = 4 + Math.sin(performance.now() / 200) * 1.5; g.strokeStyle = '#FFC877'; g.lineWidth = 2 * dpr; g.beginPath(); g.arc(X(quest.x), Y(quest.z), (pulse + 3) * dpr, 0, Math.PI * 2); g.stroke(); }
    if (ex) {
      const px = X(ex.x), py = Y(ex.z);
      if (quest && !big) { // an arrow on the edge pointing to the mission when it is off the minimap
        const qx = X(quest.x), qy = Y(quest.z);
        if (qx < 0 || qy < 0 || qx > W || qy > H) { const a = Math.atan2(qy - py, qx - px), r = Math.min(W, H) / 2 - 10 * dpr; g.fillStyle = '#FFC877'; g.save(); g.translate(W / 2 + Math.cos(a) * r, H / 2 + Math.sin(a) * r); g.rotate(a); g.beginPath(); g.moveTo(7 * dpr, 0); g.lineTo(-5 * dpr, -5 * dpr); g.lineTo(-5 * dpr, 5 * dpr); g.fill(); g.restore(); }
      }
      g.save(); g.translate(px, py); g.rotate(-ex.face + Math.PI);
      g.fillStyle = '#7EF2C3'; g.strokeStyle = '#0b0e14'; g.lineWidth = 1.5 * dpr;
      g.beginPath(); g.moveTo(0, -8 * dpr); g.lineTo(6 * dpr, 6 * dpr); g.lineTo(0, 3 * dpr); g.lineTo(-6 * dpr, 6 * dpr); g.closePath(); g.fill(); g.stroke(); g.restore();
    }
  }
  st.drawBigMap = cv => drawMap(cv, 31, -4, 0, true);
  const baseDispose = st.dispose;
  st.dispose = () => {
    if (ex) { savePos(); window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku); ex.ch.dispose(); ex = null; }
    walkers.forEach(w => w.ch && w.ch.dispose()); guides.forEach(g => g.ch.dispose());
    baseDispose(); env.dispose(); pmrem.dispose();
  };

  st.refresh = done => blds.forEach(b => {
    b.done = done.indexOf(b.id) >= 0;
    b.facades.forEach(f => { const want = b.done ? f.doneMap : f.normalMap; if (f.m.emissiveMap !== want) { f.m.emissiveMap = want; f.m.needsUpdate = true; } });
  });
  /* fly the camera to a city ('uiux', 'frontend') or the whole map ('all') */
  st.focus = key => {
    if (!CITIES[key] || busy) return;
    focusKey = key;
    const C = CITIES[key];
    st.flyTo(new T.Vector3(C.focus[0], 1.5, C.focus[1]), fitRadius(key, el.clientWidth || 800, el.clientHeight || 500), key === 'all' ? 0.9 : 0.98, () => {}, 0, 1300);
  };
  return st;
}

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


/* ───────── explain scene: a declarative 3D explainer ─────────
   opts.build(vars, ctx) returns { items:[…], cam?:{ r, ty, phi } } and is called again whenever the
   controls change (or every frame when opts.live). The engine keeps one object per item id and
   animates it to its new position, size, rotation, color and opacity.
   item: { id, shape:'box'|'cyl'|'sphere'|'cone'|'torus'|'oct'|'hex'|'pyr'|'text'|'line',
           p:[x,y,z], s:[x,y,z], r:[x,y,z], c:'#hex', e:emissive, o:opacity, flat:bool (unlit, true color),
           edges:bool|'#hex', label:'text', lc:'#hex', ly:offset, glow:bool, snap:bool,
           text (shape 'text'), size (text height), pts:[[x,y,z],…] (shape 'line') }
   ctx: { data (last ux.state from the playground), t (seconds), tr(en, id), lang } */
function makeExplain(el, opts) {
  const st = makeStage(el, { radius: 14, phi: 1.05, theta: 0.55, auto: opts.live ? 0.0006 : 0.0014, fov: 35, ty: 1 });
  const { scene } = st;
  const grid = new T.GridHelper(48, 48, 0x1c2635, 0x141a24); grid.position.y = -0.01; scene.add(grid);
  const GEO = {
    box: new T.BoxGeometry(1, 1, 1),
    cyl: new T.CylinderGeometry(0.5, 0.5, 1, 36),
    hex: new T.CylinderGeometry(0.5, 0.5, 1, 6),
    sphere: new T.SphereGeometry(0.5, 28, 18),
    cone: new T.ConeGeometry(0.5, 1, 28),
    pyr: new T.ConeGeometry(0.5, 1, 4),
    torus: new T.TorusGeometry(0.5, 0.06, 12, 56),
    oct: new T.OctahedronGeometry(0.5)
  };
  GEO.pyr.rotateY(Math.PI / 4);
  const EDGES = {};
  const edgesOf = shape => EDGES[shape] || (EDGES[shape] = new T.EdgesGeometry(GEO[shape], 20));
  const glow = glowTex();
  const items = new Map();
  let vars = {}, data = null, built = { items: [] }, camSet = false;
  const ctx = { data: null, t: 0, lang: document.documentElement.lang || 'en' };
  ctx.tr = (en, id) => (ctx.lang === 'id' && id != null ? id : en);

  const textTex = (text, color, font) => {
    const c = document.createElement('canvas'), g = c.getContext('2d');
    const f = font || '700 44px "Space Grotesk", sans-serif';
    g.font = f; const w = Math.min(1024, Math.ceil(g.measureText(text).width) + 24);
    c.width = w; c.height = 64; g.font = f; g.textBaseline = 'middle'; g.textAlign = 'center';
    g.shadowColor = '#000'; g.shadowBlur = 10; g.fillStyle = color; g.fillText(text, w / 2, 34);
    const tex = new T.CanvasTexture(c); tex.anisotropy = 4;
    return { tex, aspect: w / 64 };
  };
  const makeSprite = (text, color, h, mono) => {
    const { tex, aspect } = textTex(text, color, mono ? '600 38px "JetBrains Mono", monospace' : null);
    const sp = new T.Sprite(new T.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
    sp.userData = { aspect, h }; sp.scale.set(h * aspect, h, 1); return sp;
  };
  const setSpriteText = (sp, text, color, h, mono) => {
    sp.material.map.dispose();
    const { tex, aspect } = textTex(text, color, mono ? '600 38px "JetBrains Mono", monospace' : null);
    sp.material.map = tex; sp.material.needsUpdate = true; sp.userData.aspect = aspect; sp.userData.h = h;
  };

  function create(spec) {
    const o = { spec, shape: spec.shape || 'box', cur: { p: new T.Vector3(), s: new T.Vector3(0.01, 0.01, 0.01), r: new T.Vector3(), o: 0, e: 0 }, color: new T.Color(spec.c || '#7FD4FF') };
    if (o.shape === 'text') {
      o.obj = makeSprite(spec.text || '', spec.c || '#E6EDF3', spec.size || 0.5, spec.mono);
      o.key = (spec.text || '') + '|' + (spec.c || '') + '|' + (spec.size || 0.5);
      scene.add(o.obj);
    } else if (o.shape === 'line') {
      const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(new Float32Array(64 * 3), 3));
      o.obj = new T.Line(g, new T.LineBasicMaterial({ color: o.color, transparent: true, opacity: 0 }));
      o.obj.frustumCulled = false; scene.add(o.obj);
    } else {
      const mat = spec.flat ? new T.MeshBasicMaterial({ color: o.color, transparent: true, opacity: 0 })
        : new T.MeshStandardMaterial({ color: o.color, emissive: o.color.clone(), emissiveIntensity: 0, roughness: 0.42, metalness: 0.15, transparent: true, opacity: 0 });
      o.obj = new T.Mesh(GEO[o.shape] || GEO.box, mat);
      if (spec.edges) { o.edges = new T.LineSegments(edgesOf(GEO[o.shape] ? o.shape : 'box'), new T.LineBasicMaterial({ color: spec.edges === true ? o.color : new T.Color(spec.edges), transparent: true, opacity: 0 })); o.obj.add(o.edges); }
      scene.add(o.obj);
    }
    if (spec.glow) { o.halo = new T.Sprite(new T.SpriteMaterial({ map: glow, color: o.color, transparent: true, opacity: 0, blending: T.AdditiveBlending, depthWrite: false })); scene.add(o.halo); }
    if (spec.snap) { o.cur.p.fromArray(spec.p || [0, 0, 0]); o.cur.s.fromArray(spec.s || [1, 1, 1]); o.cur.r.fromArray(spec.r || [0, 0, 0]); o.cur.o = spec.o ?? 1; }
    else o.cur.p.fromArray(spec.p || [0, 0, 0]);
    items.set(spec.id, o);
    return o;
  }
  function drop(o) {
    [o.obj, o.halo, o.label].forEach(x => { if (!x) return; scene.remove(x); if (x.material) { if (x.material.map && x.material.map !== glow) x.material.map.dispose(); x.material.dispose(); } if (x.geometry && x.isLine) x.geometry.dispose(); });
    if (o.edges) o.edges.material.dispose();
    items.delete(o.spec.id);
  }
  function apply(list) {
    const seen = new Set();
    list.forEach(spec => {
      if (!spec || spec.id == null) return;
      seen.add(spec.id);
      let o = items.get(spec.id);
      if (o && (o.shape !== (spec.shape || 'box') || !!o.spec.flat !== !!spec.flat || !!o.edges !== !!spec.edges)) { drop(o); o = null; }
      if (!o) o = create(spec);
      o.dying = false; o.spec = spec;
      o.color.set(spec.c || '#7FD4FF');
      if (o.shape === 'text') {
        const key = (spec.text || '') + '|' + (spec.c || '') + '|' + (spec.size || 0.5);
        if (key !== o.key) { setSpriteText(o.obj, spec.text || '', spec.c || '#E6EDF3', spec.size || 0.5, spec.mono); o.key = key; }
      }
      if (spec.label) {
        const key = spec.label + '|' + (spec.lc || '#E6EDF3');
        if (!o.label) { o.label = makeSprite(spec.label, spec.lc || '#E6EDF3', spec.lh || 0.42, spec.lmono); scene.add(o.label); }
        else if (o.labelKey !== key) setSpriteText(o.label, spec.label, spec.lc || '#E6EDF3', spec.lh || 0.42, spec.lmono);
        o.labelKey = key;
      } else if (o.label) { scene.remove(o.label); o.label.material.map.dispose(); o.label.material.dispose(); o.label = null; }
    });
    items.forEach(o => { if (!seen.has(o.spec.id)) o.dying = true; });
    if (built.cam) {
      if (built.cam.r) st.orb.radius = built.cam.r;
      if (built.cam.phi && !camSet) st.orb.phi = built.cam.phi;
      camSet = true;
    }
  }
  function rebuild() {
    ctx.data = data; ctx.lang = document.documentElement.lang || 'en';
    try { built = opts.build(vars, ctx) || { items: [] }; } catch (e) { built = { items: [] }; console.warn('explainer', e); }
    apply(built.items || []);
  }
  st.update = vs => { vars = vs || {}; rebuild(); };
  st.message = m => { if (m && m.type === 'state') { data = m.data; rebuild(); } };

  const tv = new T.Vector3(), ts = new T.Vector3(), tr = new T.Vector3();
  st.tick = ({ t, dt }) => {
    ctx.t = t;
    if (opts.live) rebuild();
    const k = Math.min(1, dt * 9);
    if (built.cam && built.cam.ty != null) st.orb.target.y += (built.cam.ty - st.orb.target.y) * k * 0.5;
    items.forEach(o => {
      const s = o.spec, snap = s.snap;
      const want = o.dying ? 0 : (s.o ?? 1);
      const kk = snap && !o.dying ? 1 : k;
      if (o.shape === 'line') {
        const arr = o.obj.geometry.attributes.position.array, pts = s.pts || [];
        pts.slice(0, 64).forEach((p, i) => arr.set(p, i * 3));
        o.obj.geometry.setDrawRange(0, Math.min(64, pts.length)); o.obj.geometry.attributes.position.needsUpdate = true;
        o.cur.o += (want - o.cur.o) * k; o.obj.material.opacity = o.cur.o; o.obj.material.color.lerp(o.color, k);
        if (o.dying && o.cur.o < 0.02) drop(o);
        return;
      }
      tv.fromArray(s.p || [0, 0, 0]); ts.fromArray(s.s || [1, 1, 1]); tr.fromArray(s.r || [0, 0, 0]);
      if (o.dying) ts.multiplyScalar(0.01);
      o.cur.p.lerp(tv, kk); o.cur.s.lerp(ts, kk); o.cur.r.lerp(tr, kk); o.cur.o += (want - o.cur.o) * kk;
      o.cur.e += ((s.e ?? 0.25) - o.cur.e) * kk;
      if (o.shape === 'text') {
        o.obj.position.copy(o.cur.p);
        const h = o.obj.userData.h * (o.cur.s.x / Math.max(0.01, (s.s || [1])[0] || 1));
        o.obj.scale.set(h * o.obj.userData.aspect, h, 1);
        o.obj.material.opacity = o.cur.o;
      } else {
        o.obj.position.copy(o.cur.p); o.obj.scale.copy(o.cur.s); o.obj.rotation.set(o.cur.r.x, o.cur.r.y, o.cur.r.z);
        const m = o.obj.material;
        m.color.lerp(o.color, kk); m.opacity = o.cur.o; m.depthWrite = o.cur.o > 0.95;
        if (m.emissive) { m.emissive.copy(m.color); m.emissiveIntensity = o.cur.e; }
        if (o.edges) o.edges.material.opacity = Math.min(1, o.cur.o * 1.2);
      }
      if (o.halo) { o.halo.position.copy(o.cur.p); o.halo.scale.setScalar(Math.max(o.cur.s.x, o.cur.s.y) * 2.6); o.halo.material.color.copy(o.color); o.halo.material.opacity = o.cur.o * 0.55; }
      if (o.label) {
        const top = o.shape === 'text' ? 0.4 : o.cur.s.y / 2;
        o.label.position.set(o.cur.p.x, o.cur.p.y + top + 0.32 + (s.ly || 0), o.cur.p.z);
        const h = o.label.userData.h; o.label.scale.set(h * o.label.userData.aspect, h, 1);
        o.label.material.opacity = o.cur.o;
      }
      if (o.dying && o.cur.o < 0.02) drop(o);
    });
  };
  const baseDispose = st.dispose;
  st.dispose = () => { baseDispose(); Object.values(GEO).forEach(g => g.dispose()); Object.values(EDGES).forEach(g => g.dispose()); glow.dispose(); };
  rebuild();
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




/* ───────── character creator: a turntable with studio lights ───────── */
function makeCreator(el, look) {
  const st = makeStage(el, { radius: 4.6, phi: 1.32, theta: 0.0, auto: 0, fov: 30, ty: 0.95, noLights: true });
  const { scene, r } = st;
  // studio lighting: a soft room reflection, a warm key light with a soft shadow, cool rim and fill
  const pmrem = new T.PMREMGenerator(r), env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = env;
  r.shadowMap.enabled = true; r.shadowMap.type = T.PCFSoftShadowMap;
  scene.add(new T.HemisphereLight(0xbfd4ff, 0x1a1420, 0.35));
  const key = new T.DirectionalLight(0xfff4e8, 0.85); key.position.set(1.6, 4, 2.6); scene.add(key);
  key.castShadow = true; key.shadow.mapSize.set(1024, 1024); key.shadow.radius = 4; key.shadow.bias = -0.0005;
  Object.assign(key.shadow.camera, { left: -1.2, right: 1.2, top: 2.2, bottom: -0.4, near: 0.5, far: 9 });
  const rim = new T.DirectionalLight(0xB9A3FF, 0.55); rim.position.set(-3, 2.4, -3); scene.add(rim);
  const fill = new T.DirectionalLight(0x7EF2C3, 0.18); fill.position.set(-3, 1, 2); scene.add(fill);
  const ped = new T.Mesh(new T.CylinderGeometry(0.75, 0.82, 0.12, 64), new T.MeshStandardMaterial({ color: 0x1A2130, roughness: 0.35, metalness: 0.3 })); ped.position.y = -0.06; ped.receiveShadow = true; scene.add(ped);
  const ring = new T.Mesh(new T.TorusGeometry(0.78, 0.012, 8, 96), new T.MeshBasicMaterial({ color: 0x7EF2C3, toneMapped: false })); ring.rotation.x = Math.PI / 2; ring.position.y = 0.0; scene.add(ring);
  const ch = makeCharacter(T, look); ch.group.scale.setScalar(1); scene.add(ch.group);
  const shade = () => ch.group.traverse(o => { if (o.isMesh) o.castShadow = true; });
  shade();
  let spin = 0.35, view = 'full';
  st.tick = ({ dt }) => { ch.animate(dt, 0); if (!st.flight) ch.group.rotation.y += spin * dt * 0.3; };
  st.setLook = l => { ch.setLook(l); shade(); };
  st.wave = () => ch.wave();
  st.view = v => {
    view = v;
    const face = v === 'face', h = (ch.look.height || 1);
    st.flyTo(new T.Vector3(0, face ? 1.66 * h : 0.95, 0), face ? 1.1 : 4.6, face ? 1.5 : 1.32, () => {}, 0, 600);
  };
  st.spin = on => { spin = on ? 0.35 : 0; if (!on) ch.group.rotation.y = 0; };
  const base = st.dispose; st.dispose = () => { ch.dispose(); base(); env.dispose(); pmrem.dispose(); };
  return st;
}

window.UXScenes = { makeHub, makeFlow, makeExplain, makeBox, makeStack, makeCreator, characterOptions: { OPTIONS, SKIN, HAIR_COLORS, EYE_COLORS, CLOTH, DEFAULT_LOOK, randomLook } };
window.dispatchEvent(new Event('uxscenes:ready'));
