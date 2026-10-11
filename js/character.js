/* Procedural human characters with smooth, sculpted shapes and a natural walk / run / idle cycle.
   makeCharacter(T, look, { detail: 'full' | 'low' }) → { group, look, setLook(look), animate(dt, speed), wave(), dispose() }
   The character stands with its feet at y = 0 and is about 1.75 units tall before scaling.

   How it is built, so nothing overlaps:
   - the body is made of lathed (turned) profiles that blend into each other at the joints;
   - the head is a sculpted sphere, and hair, hijab and cap are shells grown from the same head mesh,
     so they always hug the head and fade into the skin at the hairline;
   - long hair is skinned to both the head and the chest, so it never cuts through the shoulders. */
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export const SKIN = ['#FDE7D6', '#F6D2B8', '#EBB894', '#D79F72', '#B97E52', '#94603D', '#6E452B', '#4B2E1E'];
export const HAIR_COLORS = ['#1B1512', '#3B2416', '#6A4024', '#9C5B2E', '#D9A55B', '#E8D7A8', '#9AA3AD', '#E85D9A', '#5B7CFF', '#7EF2C3'];
export const EYE_COLORS = ['#3B2416', '#6A4024', '#7A6A2A', '#3E7A4A', '#3A6EA8', '#6E7F8C'];
export const CLOTH = ['#E6EDF3', '#1A2130', '#2C3E66', '#7EF2C3', '#B9A3FF', '#FFC877', '#7FD4FF', '#FF93B5', '#E04E4E', '#4E7A3A', '#8A5A3A', '#F2E3C6', '#3A3F47', '#E8742E'];
export const OPTIONS = {
  hair: ['short', 'buzz', 'curly', 'long', 'ponytail', 'bun', 'hijab', 'bald'],
  top: ['tshirt', 'hoodie', 'shirt', 'batik', 'jacket', 'sweater'],
  bottom: ['jeans', 'chinos', 'shorts', 'skirt', 'joggers'],
  shoes: ['sneakers', 'boots', 'sandals', 'loafers'],
  build: ['slim', 'regular', 'broad']
};
export const DEFAULT_LOOK = {
  name: '', skin: 2, hair: 'short', hairColor: 0, eyes: 0, height: 1, build: 'regular',
  top: 'hoodie', topColor: 3, bottom: 'jeans', bottomColor: 2, shoes: 'sneakers', shoesColor: 0,
  glasses: false, cap: false, backpack: true
};
export function randomLook(r = Math.random) {
  const pick = a => a[Math.floor(r() * a.length)];
  const top = pick(OPTIONS.top), hair = pick(OPTIONS.hair);
  return {
    name: '', skin: Math.floor(r() * SKIN.length), hair, hairColor: Math.floor(r() * (r() < 0.8 ? 6 : HAIR_COLORS.length)), eyes: Math.floor(r() * EYE_COLORS.length),
    height: 0.94 + r() * 0.12, build: pick(OPTIONS.build), top, topColor: Math.floor(r() * CLOTH.length), bottom: pick(OPTIONS.bottom), bottomColor: Math.floor(r() * CLOTH.length),
    shoes: pick(OPTIONS.shoes), shoesColor: Math.floor(r() * CLOTH.length), glasses: r() < 0.3, cap: hair !== 'hijab' && r() < 0.18, backpack: r() < 0.4
  };
}

/* ───────── math helpers ───────── */
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const damp = (c, t, rate, dt) => c + (t - c) * (1 - Math.exp(-rate * dt));
const mix = (T, a, b, k) => new T.Color(a).lerp(new T.Color(b), k);
const shade = (T, hex, k) => new T.Color(hex).multiplyScalar(k);

/* ───────── head shape: a point on the unit sphere → a sculpted head (cranium, jaw, chin, eye sockets) ───────── */
const HX = 0.1, HY = 0.124, HZ = 0.112;
function headShape(x, y, z, out) {
  let X = x, Y = y, Z = z;
  if (Y < 0) {
    const t = -Y;
    X *= 1 - 0.3 * Math.pow(t, 1.7);
    Z *= Z < 0 ? 1 - 0.42 * Math.pow(t, 1.25) : 1 - 0.08 * t * t;
  }
  if (Z < 0 && Y > -0.45) Z *= 1 + 0.08 * (1 - Math.abs(Y + 0.1));
  if (Z > 0 && Y > 0.1) Z *= 1 - 0.06 * (Y - 0.1);
  if (Z > 0) {
    for (let s = -1; s <= 1; s += 2) {
      const dx = X - s * 0.36, dy = Y - 0.04;
      Z -= 0.05 * Math.exp(-(dx * dx + dy * dy) / 0.016) * Z;
      const cx = X - s * 0.55, cy = Y + 0.16;
      X += s * 0.018 * Math.exp(-(cx * cx + cy * cy) / 0.03);
    }
    Z += 0.014 * Math.exp(-(X * X) / 0.3 - ((Y - 0.2) * (Y - 0.2)) / 0.006);
  }
  return out.set(X * HX, Y * HY, Z * HZ);
}
const headAt = (T, dx, dy, dz) => { const v = new T.Vector3(dx, dy, dz).normalize(); return headShape(v.x, v.y, v.z, v); };
const headNormal = (T, p) => new T.Vector3(p.x / (HX * HX), p.y / (HY * HY), p.z / (HZ * HZ)).normalize();

/* ───────── geometry helpers ───────── */
/* a sphere with merged seams, every vertex moved by fn(unitPoint) */
function sculpt(T, ws, hs, fn) {
  let g = new T.SphereGeometry(1, ws, hs);
  g.deleteAttribute('uv'); g.deleteAttribute('normal');
  g = mergeVertices(g);
  const p = g.attributes.position, dirs = new Float32Array(p.array), v = new T.Vector3();
  for (let i = 0; i < p.count; i++) { v.set(p.getX(i), p.getY(i), p.getZ(i)); fn(v, i); p.setXYZ(i, v.x, v.y, v.z); }
  g.computeVertexNormals();
  return { g, dirs };
}
/* a turned shape from a smooth (spline) profile of [radius, y] points, bottom → top */
function lathe(T, prof, radial, zs = 1, samples = 28, phiStart = 0, phiLen = Math.PI * 2) {
  const pts = new T.SplineCurve(prof.map(p => new T.Vector2(Math.max(p[0], 0.0001), p[1]))).getPoints(samples);
  const g = new T.LatheGeometry(pts, radial, phiStart, phiLen);
  if (zs !== 1) g.scale(1, 1, zs);
  return g;
}
/* a limb: rounded capsule following radii from the joint (y = 0) down to y = -len */
let LIMB_SAMPLES = 18;
function limb(T, len, radii, radial, zs = 0.92) {
  const n = radii.length, prof = [];
  const rb = radii[n - 1], rt = radii[0];
  for (let k = 0; k <= 3; k++) { const a = -Math.PI / 2 + (k / 3) * Math.PI / 2; prof.push([Math.cos(a) * rb, -len + Math.sin(a) * rb * 0.9]); }
  for (let i = n - 2; i >= 1; i--) prof.push([radii[i], -len * i / (n - 1)]);
  for (let k = 0; k <= 3; k++) { const a = (k / 3) * Math.PI / 2; prof.push([Math.cos(a) * rt, Math.sin(a) * rt * 0.9]); }
  return lathe(T, prof, radial, zs, LIMB_SAMPLES);
}
/* a parametric surface; fn(u, v, out) fills a point. wrapU joins the last column to the first */
function sheet(T, nu, nv, fn, wrapU) {
  const pos = [], uv = [], idx = [], cu = wrapU ? nu : nu + 1, v3 = new T.Vector3();
  for (let j = 0; j <= nv; j++) for (let i = 0; i < cu; i++) { fn(i / nu, j / nv, v3); pos.push(v3.x, v3.y, v3.z); uv.push(i / nu, 1 - j / nv); }
  for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) {
    const i1 = wrapU ? (i + 1) % nu : i + 1;
    const a = j * cu + i, b = j * cu + i1, c = (j + 1) * cu + i, d = (j + 1) * cu + i1;
    idx.push(a, c, b, b, c, d);
  }
  const g = new T.BufferGeometry();
  g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new T.Float32BufferAttribute(uv, 2));
  g.setIndex(idx); g.computeVertexNormals();
  return g;
}
/* a tube with a varying radius along a smooth curve, with rounded ends */
function tube(T, points, rFn, tubular = 20, radial = 8, closed = false) {
  const curve = new T.CatmullRomCurve3(points, closed, 'centripetal');
  const fr = curve.computeFrenetFrames(tubular, closed);
  const pos = [], idx = [], rings = closed ? tubular : tubular + 1;
  for (let i = 0; i < rings; i++) {
    const t = i / tubular, P = curve.getPointAt(t), N = fr.normals[i], B = fr.binormals[i], r = rFn(t);
    for (let j = 0; j < radial; j++) { const a = j / radial * Math.PI * 2, c = Math.cos(a), s = Math.sin(a); pos.push(P.x + r * (c * N.x + s * B.x), P.y + r * (c * N.y + s * B.y), P.z + r * (c * N.z + s * B.z)); }
  }
  for (let i = 0; i < tubular; i++) {
    const i1 = closed ? (i + 1) % rings : i + 1;
    for (let j = 0; j < radial; j++) { const j1 = (j + 1) % radial, a = i * radial + j, b = i1 * radial + j, c = i * radial + j1, d = i1 * radial + j1; idx.push(a, b, c, c, b, d); }
  }
  if (!closed) {
    [[0, 0, -1], [tubular, rings - 1, 1]].forEach(([ti, ring, dir]) => {
      const P = curve.getPointAt(ti / tubular), Tg = curve.getTangentAt(ti / tubular), r = rFn(ti / tubular);
      const ci = pos.length / 3; pos.push(P.x + Tg.x * r * 0.6 * dir, P.y + Tg.y * r * 0.6 * dir, P.z + Tg.z * r * 0.6 * dir);
      for (let j = 0; j < radial; j++) { const a = ring * radial + j, b = ring * radial + (j + 1) % radial; dir < 0 ? idx.push(ci, b, a) : idx.push(ci, a, b); }
    });
  }
  const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
  return g;
}
/* a flat ribbon along a curve, lying on a body (the outward side faces away from `axisOut(p)`) */
function ribbon(T, points, width, steps, outward) {
  const curve = new T.CatmullRomCurve3(points, false, 'centripetal');
  return sheet(T, 2, steps, (u, v, o) => {
    const P = curve.getPointAt(v), Tg = curve.getTangentAt(v), N = outward(P), B = new T.Vector3().crossVectors(Tg, N).normalize();
    o.copy(P).addScaledVector(B, (u - 0.5) * width);
  });
}

/* ───────── canvas textures ───────── */
const canvas = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); return c; };
function batikTexture(T, base) {
  const t = new T.CanvasTexture(canvas(256, 256, (g) => {
    g.fillStyle = base; g.fillRect(0, 0, 256, 256);
    g.lineCap = 'round';
    for (let k = -256; k < 512; k += 48) {
      g.strokeStyle = 'rgba(28,16,8,.78)'; g.lineWidth = 9; g.beginPath();
      for (let x = 0; x <= 256; x += 4) { const y = k + x + Math.sin(x / 9) * 7; x ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
      g.strokeStyle = 'rgba(255,236,196,.85)'; g.lineWidth = 2.5; g.beginPath();
      for (let x = 0; x <= 256; x += 4) { const y = k + 22 + x + Math.sin(x / 9) * 7; x ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
    }
    g.fillStyle = 'rgba(255,236,196,.9)';
    for (let y = 12; y < 256; y += 48) for (let x = 12; x < 256; x += 48) { g.beginPath(); g.arc(x, y, 3.5, 0, Math.PI * 2); g.fill(); }
  }));
  t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(4, 2); t.anisotropy = 4;
  return t;
}
/* soft fabric weave so plain colours do not look like plastic */
function weaveTexture(T, kind) {
  const t = new T.CanvasTexture(canvas(128, 128, (g, w, h) => {
    g.fillStyle = '#fff'; g.fillRect(0, 0, w, h);
    const img = g.getImageData(0, 0, w, h), d = img.data;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      let v;
      if (kind === 'denim') v = 0.86 + 0.1 * (((x + y) % 4) < 2 ? 1 : 0) + Math.random() * 0.06;
      else if (kind === 'knit') v = 0.82 + 0.16 * Math.abs(Math.sin(x * Math.PI / 4)) + Math.random() * 0.03;
      else v = 0.93 + Math.random() * 0.07;
      const i = (y * w + x) * 4; d[i] = d[i + 1] = d[i + 2] = Math.min(255, v * 255);
    }
    g.putImageData(img, 0, 0);
  }));
  t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(kind === 'knit' ? 6 : 4, kind === 'knit' ? 3 : 4); t.anisotropy = 4;
  return t;
}
/* iris: mapped on a sphere cap, so the canvas top is the pupil and the bottom is the rim */
function irisTexture(T, color) {
  return new T.CanvasTexture(canvas(64, 64, (g, w, h) => {
    const c = new T.Color(color), dark = '#' + c.clone().multiplyScalar(0.45).getHexString(), light = '#' + c.clone().lerp(new T.Color('#ffffff'), 0.35).getHexString();
    const gr = g.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, '#050505'); gr.addColorStop(0.36, '#050505'); gr.addColorStop(0.42, dark); gr.addColorStop(0.62, light); gr.addColorStop(0.85, color); gr.addColorStop(1, '#141414');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.globalAlpha = 0.25; g.strokeStyle = dark;
    for (let x = 0; x < w; x += 3) { g.beginPath(); g.moveTo(x, h * 0.42); g.lineTo(x + 1, h * 0.86); g.stroke(); }
  }));
}

/* ───────── the character ───────── */
export function makeCharacter(T, lookIn, opts = {}) {
  const low = opts.detail === 'low';
  const group = new T.Group();
  let look = Object.assign({}, DEFAULT_LOOK, lookIn || {});
  let P = null;
  const A = { phase: 0, sp: 0, blink: 3, lid: 0, wave: 0, waveT: 0, t: Math.random() * 10, look: [0, 0], lookT: [0, 0], lookTimer: 1, tailV: 0, tail: 0 };
  const owned = [];
  const geo = g => { owned.push(g); return g; };
  const seg = n => (low ? Math.max(6, Math.round(n * 0.45)) : n);

  function build() {
    if (P) group.remove(P.root);
    owned.splice(0).forEach(x => x.dispose());
    const rig = {};
    const mats = {};
    const mat = (key, make) => mats[key] || (mats[key] = (owned.push(make()), owned[owned.length - 1]));
    const std = (color, o = {}) => { const q = Object.assign({ color, roughness: 0.7, metalness: 0 }, o); ['sheen', 'sheenRoughness', 'sheenColor', 'clearcoat'].forEach(k => delete q[k]); return new T.MeshStandardMaterial(q); };
    const phys = (color, o = {}) => low ? std(color, o) : new T.MeshPhysicalMaterial(Object.assign({ color, roughness: 0.75, metalness: 0 }, o));
    const tex = t => { owned.push(t); return t; };
    const mesh = (g, m, parent, x = 0, y = 0, z = 0) => { const o = new T.Mesh(g, m); o.position.set(x, y, z); parent.add(o); return o; };

    const skinC = SKIN[look.skin] || SKIN[2], hairC = HAIR_COLORS[look.hairColor] || HAIR_COLORS[0];
    const topC = CLOTH[look.topColor] || CLOTH[3], botC = CLOTH[look.bottomColor] || CLOTH[2], shoeC = CLOTH[look.shoesColor] || CLOTH[0];
    const w = look.build === 'slim' ? 0.9 : look.build === 'broad' ? 1.12 : 1;
    const wl = 1 + (w - 1) * 0.6;
    const R = seg(28);
    LIMB_SAMPLES = low ? 8 : 18;

    const mSkin = mat('skin', () => phys(skinC, { roughness: 0.58, sheen: 0.12, sheenRoughness: 0.6, sheenColor: new T.Color('#7a2a20') }));
    const mHeadSkin = mat('headskin', () => phys('#ffffff', { roughness: 0.56, sheen: 0.12, sheenRoughness: 0.6, sheenColor: new T.Color('#7a2a20'), vertexColors: true }));
    const mHair = mat('hair', () => phys(hairC, { roughness: 0.5, sheen: 0.6, sheenRoughness: 0.35, sheenColor: shade(T, hairC, 1.5), polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
    const mHairDS = mat('hairds', () => { const m = mHair.clone(); m.side = T.DoubleSide; return m; });
    const mHairShell = mat('hairshell', () => { const m = mHair.clone(); m.transparent = true; m.vertexColors = true; return m; });
    const knit = look.top === 'sweater';
    const topMap = look.top === 'batik' ? tex(batikTexture(T, topC)) : low ? null : tex(weaveTexture(T, knit ? 'knit' : 'cloth'));
    const mTop = mat('top', () => phys(look.top === 'batik' ? '#ffffff' : topC, { map: topMap, roughness: 0.86, sheen: 0.25, sheenRoughness: 0.8, sheenColor: shade(T, topC, 1.1) }));
    const mTopDS = mat('topds', () => { const m = mTop.clone(); m.side = T.DoubleSide; return m; });
    const mTrim = mat('trim', () => phys(shade(T, look.top === 'batik' ? '#3a2614' : topC, look.top === 'batik' ? 1 : 0.78), { roughness: 0.86, sheen: 0.2, sheenRoughness: 0.8, sheenColor: shade(T, topC, 0.9), side: T.DoubleSide }));
    const botMap = low ? null : tex(weaveTexture(T, look.bottom === 'jeans' ? 'denim' : 'cloth'));
    const mBot = mat('bot', () => phys(botC, { map: botMap, roughness: 0.88, sheen: 0.2, sheenRoughness: 0.8, sheenColor: shade(T, botC, 1.1) }));
    const mBotDS = mat('botds', () => { const m = mBot.clone(); m.side = T.DoubleSide; return m; });
    const mBotTrim = mat('bottrim', () => phys(shade(T, botC, 0.78), { roughness: 0.9, side: T.DoubleSide }));
    const mShoe = mat('shoe', () => phys(shoeC, { roughness: look.shoes === 'loafers' ? 0.32 : 0.6, clearcoat: look.shoes === 'loafers' ? 0.6 : 0 }));
    const mSole = mat('sole', () => std(look.shoes === 'sneakers' ? '#F4F4F2' : look.shoes === 'boots' ? '#2a211b' : '#3a2a20', { roughness: 0.8 }));
    const mDark = mat('dark', () => std('#1f1a17', { roughness: 0.6 }));
    const mWhite = mat('white', () => std('#F4F2EE', { roughness: 0.6 }));

    const root = new T.Group(); root.scale.setScalar(look.height || 1); group.add(root); rig.root = root;

    /* ── pelvis and legs ── */
    const pelvis = new T.Bone(); pelvis.position.y = 0.94; root.add(pelvis); rig.pelvis = pelvis;
    const skirt = look.bottom === 'skirt', shorts = look.bottom === 'shorts';
    const pelvisProf = [[0, -0.012], [0.08, -0.01], [0.132, 0.0], [0.157, 0.025], [0.161, 0.06], [0.153, 0.12], [0.147, 0.16], [0, 0.17]].map(p => [p[0] * w, p[1]]);
    mesh(geo(lathe(T, pelvisProf, R, 0.62)), skirt ? mSkin : mBot, pelvis);
    const pants = !skirt && !shorts;
    const legs = [-1, 1].map(s => {
      const hip = new T.Group(); hip.position.set(s * 0.086 * w, -0.02, 0); pelvis.add(hip);
      const thighR = pants ? [0.09, 0.083, 0.075, 0.068, 0.061, 0.057].map(r => r * wl) : [0.079, 0.076, 0.068, 0.06, 0.052, 0.047].map(r => r * wl);
      mesh(geo(limb(T, 0.42, thighR, R)), pants ? mBot : mSkin, hip);
      if (shorts) {
        const sh = mesh(geo(lathe(T, [[0.092 * wl, -0.25], [0.089 * wl, -0.16], [0.088 * wl, -0.06], [0.086 * wl, 0.04]], R, 0.94, 8)), mBotDS, hip);
        sh.rotation.z = -s * 0.03;
        const hem = mesh(geo(new T.TorusGeometry(0.091 * wl, 0.005, 5, R)), mBotTrim, hip, 0, -0.25, 0); hem.rotation.x = Math.PI / 2; hem.scale.y = 0.94;
      }
      const knee = new T.Group(); knee.position.y = -0.42; hip.add(knee);
      const jeans = look.bottom === 'jeans', jog = look.bottom === 'joggers';
      const shinR = pants ? (jeans ? [0.057, 0.058, 0.056, 0.054, 0.052, 0.051] : jog ? [0.058, 0.06, 0.056, 0.05, 0.043, 0.04] : [0.057, 0.057, 0.054, 0.05, 0.047, 0.046]) : [0.047, 0.053, 0.05, 0.043, 0.036, 0.032];
      mesh(geo(limb(T, 0.43, shinR.map(r => r * wl), R)), pants ? mBot : mSkin, knee);
      if (pants) {
        const cuffR = shinR[shinR.length - 1] * wl + 0.002;
        const cuff = mesh(geo(new T.TorusGeometry(cuffR, jog ? 0.012 : 0.006, 6, R)), jog ? mBotTrim : mBot, knee, 0, -0.41, 0); cuff.rotation.x = Math.PI / 2; cuff.scale.set(1, 0.92, jog ? 1.6 : 1);
      }
      const ankle = new T.Group(); ankle.position.y = -0.43; knee.add(ankle);
      buildFoot(ankle, s);
      return { hip, knee, ankle };
    });
    rig.legs = legs;
    if (skirt) {
      const sk = mesh(geo(sheet(T, seg(48), 10, (u, v, o) => {
        const a = u * Math.PI * 2, y = 0.08 - v * 0.42, r = (0.15 + 0.15 * Math.pow(v, 1.1)) * w;
        const fold = 1 + 0.045 * Math.sin(a * 11) * v;
        o.set(Math.sin(a) * r * fold, y, Math.cos(a) * r * (0.64 + 0.18 * v) * fold);
      }, true)), mBotDS, pelvis);
      rig.skirt = sk;
    }

    /* ── torso ── */
    const spine = new T.Bone(); spine.position.y = 0.12; pelvis.add(spine); rig.spine = spine;
    const TORSO = [[0, -0.088], [0.12, -0.085], [0.168, -0.066], [0.165, -0.03], [0.157, 0.02], [0.156, 0.08], [0.163, 0.15], [0.172, 0.22], [0.174, 0.28], [0.165, 0.335], [0.135, 0.375], [0.095, 0.405], [0.062, 0.428], [0.05, 0.44], [0, 0.445]];
    const torsoCurve = new T.SplineCurve(TORSO.map(p => new T.Vector2(p[0] * w, p[1])));
    const ZS = 0.62;
    const jacket = look.top === 'jacket';
    mesh(geo(lathe(T, TORSO.map(p => [p[0] * w, p[1]]), R, ZS, low ? 14 : 30)), jacket ? mat('tee', () => phys('#E9ECEF', { roughness: 0.85 })) : mTop, spine);
    // hem of the top
    const hemR = 0.168 * w;
    const hem = mesh(geo(new T.TorusGeometry(hemR, low ? 0.006 : 0.008, 6, R * 2)), knit || look.top === 'hoodie' ? mTrim : mTop, spine, 0, -0.07, 0); hem.rotation.x = Math.PI / 2; hem.scale.set(1, ZS, 1);
    // a point on the torso surface (t along the profile, a = angle from the front)
    const onTorso = (t, a, off = 0, o = new T.Vector3()) => { const p = torsoCurve.getPoint(t); const r = p.x + off; return o.set(Math.sin(a) * r, p.y, Math.cos(a) * r * ZS + Math.cos(a) * off * (1 - ZS)); };
    if (jacket) {
      // open jacket over a light tee
      const shell = sheet(T, seg(40), 22, (u, v, o) => {
        const t = 0.06 + v * 0.83, gap = 0.2 - 0.12 * v;
        const a = gap + u * (Math.PI * 2 - gap * 2);
        onTorso(t, a, 0.008 + 0.006 * (1 - v), o);
      });
      mesh(geo(shell), mTopDS, spine);
      // lapels
      [-1, 1].forEach(s => {
        mesh(geo(sheet(T, 4, 10, (u, v, o) => {
          const t = 0.5 + v * 0.38, gap = 0.2 - 0.12 * ((t - 0.06) / 0.83);
          const a = s * (gap + u * (0.12 + 0.32 * v));
          onTorso(t, a, 0.016, o);
        })), mTrim, spine);
      });
      mesh(geo(lathe(T, [[0.064, 0.41], [0.068, 0.43], [0.07, 0.455]], R, 0.9, 4, Math.PI * 0.55, Math.PI * 0.9)), mTrim, spine);
    }
    if (look.top === 'hoodie') {
      // hood resting on the shoulders, pocket and drawstrings
      const hp = [];
      for (let k = 0; k <= 8; k++) { const a = -Math.PI * 0.62 + (k / 8) * Math.PI * 1.24; hp.push(new T.Vector3(Math.sin(a) * 0.1 * w, 0.418 + 0.02 * Math.cos(a), -Math.cos(a) * 0.074 - 0.012)); }
      const hood = mesh(geo(tube(T, hp, t => 0.018 + 0.03 * Math.sin(Math.PI * t), seg(28), seg(12))), mTrim, spine); hood.scale.set(1, 0.85, 1);
      mesh(geo(sheet(T, 10, 4, (u, v, o) => onTorso(0.16 + v * 0.17, (u - 0.5) * 1.1 * (1 - 0.15 * v), 0.006, o))), mTrim, spine);
      if (!low) [-1, 1].forEach(s => {
        const a = onTorso(0.86, s * 0.12, 0.004), b = onTorso(0.62, s * 0.14, 0.008);
        mesh(geo(tube(T, [a, a.clone().lerp(b, 0.5).add(new T.Vector3(0, 0, 0.006)), b], () => 0.0032, 10, 5)), mWhite, spine);
        mesh(geo(new T.CylinderGeometry(0.0045, 0.0045, 0.016, 6)), mWhite, spine, b.x, b.y - 0.006, b.z);
      });
    }
    if (look.top === 'tshirt' || knit) {
      const neck = mesh(geo(new T.TorusGeometry(0.058, knit ? 0.011 : 0.007, 6, R)), knit ? mTrim : mTop, spine, 0, 0.425, 0.008); neck.rotation.x = Math.PI / 2 - 0.3; neck.scale.set(1, 0.85, 1);
    }
    if (look.top === 'shirt' || look.top === 'batik') {
      // collar band, two collar points, placket and buttons
      mesh(geo(lathe(T, [[0.054, 0.415], [0.056, 0.44], [0.058, 0.455]], R, 0.92, 4)), mTrim, spine);
      [-1, 1].forEach(s => mesh(geo(sheet(T, 5, 5, (u, v, o) => {
        const a = s * (0.12 + u * 0.75), t = 0.9 - v * 0.08 - u * 0.03;
        onTorso(t, a, 0.012 + (1 - v) * 0.01, o); o.y += 0.012 * (1 - v);
      })), mTrim, spine));
      if (!low) for (let b = 0; b < 4; b++) {
        const p = onTorso(0.78 - b * 0.17, 0, 0.003);
        const btn = mesh(geo(new T.CylinderGeometry(0.0062, 0.0062, 0.003, 10)), mWhite, spine, p.x, p.y, p.z); btn.rotation.x = Math.PI / 2;
      }
    }
    if (look.backpack) {
      const mBag = mat('bag', () => phys('#2C3E66', { roughness: 0.7, sheen: 0.4, sheenRoughness: 0.7 })), mBag2 = mat('bag2', () => phys('#7EF2C3', { roughness: 0.6 }));
      const bz = -0.118 * w * 1.04 - (look.hair === 'long' ? 0.1 : 0.062);
      mesh(geo(new RoundedBoxGeometry(0.27 * w, 0.34, 0.12, low ? 2 : 4, 0.045)), mBag, spine, 0, 0.19, bz);
      mesh(geo(new RoundedBoxGeometry(0.2 * w, 0.13, 0.05, low ? 2 : 3, 0.022)), mBag2, spine, 0, 0.1, bz - 0.073);
      if (!low) mesh(geo(new T.TorusGeometry(0.1 * w, 0.0035, 4, 24, Math.PI)), mDark, spine, 0, 0.27, bz - 0.061);
      [-1, 1].forEach(s => {
        const pts = [new T.Vector3(s * 0.075 * w, 0.33, bz + 0.06), new T.Vector3(s * 0.095 * w, 0.405, -0.02), new T.Vector3(s * 0.1 * w, 0.37, 0.08), new T.Vector3(s * 0.105 * w, 0.24, 0.115 * w), new T.Vector3(s * 0.12 * w, 0.08, 0.105 * w), new T.Vector3(s * 0.135 * w, 0.03, 0.02)];
        mesh(geo(ribbon(T, pts, 0.038, seg(24), p => new T.Vector3(p.x * 0.6, smooth(0.33, 0.41, p.y) * 1.2, p.z).normalize())), mat('strap', () => std('#1A2130', { roughness: 0.7, side: T.DoubleSide })), spine);
      });
    }

    /* ── arms ── */
    const sleeve = { tshirt: 'short', batik: 'short', shirt: 'rolled', hoodie: 'long', jacket: 'long', sweater: 'long' }[look.top] || 'long';
    rig.arms = [-1, 1].map(s => {
      const sh = new T.Group(); sh.position.set(s * 0.162 * w, 0.33, -0.005); spine.add(sh);
      mesh(geo(sculpt(T, seg(20), seg(14), v => v.set(v.x * 0.054 * wl, v.y * 0.05, v.z * 0.052)).g), mTop, sh, s * 0.002, -0.004, 0);
      const longS = sleeve === 'long', rolled = sleeve === 'rolled';
      mesh(geo(limb(T, 0.29, (longS || rolled ? [0.055, 0.053, 0.05, 0.047, 0.045] : [0.05, 0.048, 0.044, 0.04, 0.037]).map(r => r * wl), R)), longS || rolled ? mTop : mSkin, sh);
      if (sleeve === 'short') {
        mesh(geo(lathe(T, [[0.064 * wl, -0.15], [0.062 * wl, -0.08], [0.06 * wl, 0.0], [0.05 * wl, 0.05]], R, 0.94, 8)), mTopDS, sh);
        const sm = mesh(geo(new T.TorusGeometry(0.064 * wl, 0.0045, 5, R)), mTrim, sh, 0, -0.15, 0); sm.rotation.x = Math.PI / 2; sm.scale.y = 0.94;
      }
      const elbow = new T.Group(); elbow.position.y = -0.29; sh.add(elbow);
      mesh(geo(limb(T, 0.25, (longS ? [0.046, 0.047, 0.044, 0.041, 0.039] : [0.037, 0.04, 0.035, 0.03, 0.027]).map(r => r * wl), R)), longS ? mTop : mSkin, elbow);
      if (rolled) { const roll = mesh(geo(new T.TorusGeometry(0.047 * wl, 0.012, 6, R)), mTrim, elbow, 0, -0.012, 0); roll.rotation.x = Math.PI / 2; }
      if (longS) { const cuff = mesh(geo(new T.TorusGeometry(0.037 * wl, 0.009, 6, R)), mTrim, elbow, 0, -0.245, 0); cuff.rotation.x = Math.PI / 2; }
      const wrist = new T.Group(); wrist.position.y = -0.25; elbow.add(wrist);
      buildHand(wrist, s);
      return { sh, elbow, wrist, s };
    });

    /* ── neck and head ── */
    const neck = new T.Bone(); neck.position.set(0, 0.4, 0.004); spine.add(neck); rig.neck = neck;
    mesh(geo(limb(T, 0.2, [0.044, 0.043, 0.044, 0.047], R, 0.95)), mSkin, neck, 0, 0.17, 0);
    const head = new T.Bone(); head.position.set(0, 0.17, 0.012); neck.add(head); rig.head = head;
    buildHead(head, spine);

    /* hands: palm, four fingers and a thumb (a mitten when far away) */
    function buildHand(wrist, s) {
      const palm = sculpt(T, seg(16), seg(12), v => {
        const k = v.y < 0 ? 1 - 0.18 * -v.y : 1;
        v.set(v.x * 0.017 * k, v.y * 0.046, v.z * 0.04 * k);
      }).g;
      mesh(geo(palm), mSkin, wrist, 0, -0.045, 0.002);
      if (low) {
        mesh(geo(limb(T, 0.04, [0.014, 0.014, 0.012], 8, 2.2)), mSkin, wrist, 0, -0.075, 0.004);
      } else {
        for (let f = 0; f < 4; f++) {
          const fz = 0.026 - f * 0.0165, len = [0.05, 0.055, 0.052, 0.042][f];
          const fg = new T.Group(); fg.position.set(-s * 0.002, -0.084, fz); wrist.add(fg); fg.rotation.x = 0.05 * (f - 1.5); fg.rotation.z = -s * 0.42;
          mesh(geo(limb(T, len * 0.55, [0.0094, 0.009, 0.0086], 8, 1)), mSkin, fg);
          const tip = new T.Group(); tip.position.y = -len * 0.55; fg.add(tip); tip.rotation.z = -s * 0.55;
          mesh(geo(limb(T, len * 0.45, [0.0086, 0.0081, 0.0074], 8, 1)), mSkin, tip);
        }
      }
      const th = new T.Group(); th.position.set(-s * 0.004, -0.03, 0.03); wrist.add(th); th.rotation.set(-0.5, 0, -s * 0.35);
      mesh(geo(limb(T, 0.045, [0.011, 0.0105, 0.0095, 0.0085], low ? 6 : 8, 1)), mSkin, th);
    }

    /* feet: a sculpted shoe on a bevelled sole, or a bare foot in a sandal */
    function buildFoot(ankle, s) {
      ankle.scale.setScalar(1.08);
      const kind = look.shoes, sandal = kind === 'sandals', boot = kind === 'boots';
      const soleH = kind === 'sneakers' ? 0.028 : kind === 'loafers' ? 0.014 : boot ? 0.03 : 0.018;
      const shape = new T.Shape();
      const outline = [[0, -0.062], [0.032, -0.055], [0.042, -0.02], [0.041, 0.05], [0.049, 0.12], [0.044, 0.17], [0.022, 0.198], [-0.006, 0.2], [-0.03, 0.188], [-0.043, 0.14], [-0.042, 0.06], [-0.036, -0.02], [-0.028, -0.055]];
      const op = outline.map(p => new T.Vector2(-s * p[0] * (sandal ? 0.98 : 1.06), p[1]));
      shape.setFromPoints(new T.SplineCurve([...op, op[0]]).getPoints(48));
      const sg = new T.ExtrudeGeometry(shape, { depth: soleH * 0.5, bevelEnabled: true, bevelThickness: soleH * 0.25, bevelSize: 0.005, bevelSegments: low ? 1 : 3, curveSegments: low ? 12 : 32 });
      sg.rotateX(Math.PI / 2);
      const footY = -0.07, top = footY + soleH;
      mesh(geo(sg), sandal ? mShoe : mSole, ankle, 0, top - soleH * 0.25, 0);
      if (boot) mesh(geo(new RoundedBoxGeometry(0.07, 0.022, 0.06, 2, 0.008)), mSole, ankle, 0, footY - 0.008, -0.028);
      if (sandal) {
        const foot = sculpt(T, seg(24), seg(16), v => {
          const z = v.z;
          let y = v.y < 0 ? v.y * 0.15 : v.y * (1 - 0.6 * smooth(-0.2, 1, z));
          v.set(v.x * 0.036, y * 0.036, z * 0.1);
        }).g;
        mesh(geo(foot), mSkin, ankle, -s * 0.002, top + 0.002, 0.065);
        if (!low) for (let k = 0; k < 5; k++) mesh(geo(new T.SphereGeometry(0.009 - k * 0.0009, 8, 6)), mSkin, ankle, -s * (0.024 - k * 0.012) * 0.95, top + 0.008, 0.172 - k * k * 0.0012);
        [[0.12, 0.012], [0.05, 0.022]].forEach(([z, h]) => { const st = mesh(geo(new T.TorusGeometry(0.038, 0.006, 5, 16, Math.PI)), mShoe, ankle, 0, top + 0.004, z); st.scale.set(1.05, h / 0.03 + 0.5, 1); });
        return;
      }
      const upper = sculpt(T, seg(28), seg(18), v => {
        const z = v.z;
        let y = v.y < 0 ? v.y * 0.1 : Math.pow(v.y, 0.8) * (1 - 0.58 * smooth(-0.35, 0.95, z));
        const xs = 1 - 0.1 * smooth(0.5, 1, Math.abs(z));
        v.set(v.x * 0.049 * xs, y * (kind === 'loafers' ? 0.046 : 0.058), z * 0.13);
      }).g;
      mesh(geo(upper), mShoe, ankle, -s * 0.002, top - 0.002, 0.068);
      // the opening around the ankle
      const coll = mesh(geo(new T.TorusGeometry(0.037, kind === 'loafers' ? 0.004 : 0.008, 6, 20)), kind === 'sneakers' ? mWhite : mDark, ankle, 0, top + (kind === 'loafers' ? 0.034 : 0.05), -0.012); coll.rotation.x = Math.PI / 2 - 0.25; coll.scale.set(1, 1.15, 1);
      if (boot) mesh(geo(lathe(T, [[0.05, top + 0.03], [0.053, 0.05], [0.054, 0.1], [0.056, 0.13]], R, 1.08, 6)), mShoe, ankle, 0, 0, -0.004);
      if (kind === 'sneakers' && !low) {
        for (let k = 0; k < 4; k++) { const z = 0.02 + k * 0.022, y = top + 0.054 - k * 0.006; const l = mesh(geo(new T.CylinderGeometry(0.0028, 0.0028, 0.04, 5)), mWhite, ankle, 0, y, z); l.rotation.z = Math.PI / 2; l.rotation.x = 0.3; }
        const sp = [-0.02, 0.03, 0.08, 0.13].map((z, k) => new T.Vector3(-s * (0.0475 - k * 0.002), top + 0.016 + Math.sin(k) * 0.008, z));
        mesh(geo(tube(T, sp, t => 0.0035 * (1 - t * 0.5), 16, 5)), mat('swoosh', () => std(new T.Color(shoeC).getHSL({}).l > 0.6 ? '#1A2130' : '#F4F4F2', { roughness: 0.5 })), ankle);
      }
      if (kind === 'loafers' && !low) { const sad = mesh(geo(new T.TorusGeometry(0.036, 0.004, 5, 16, Math.PI)), mDark, ankle, 0, top + 0.028, 0.075); sad.rotation.x = -0.35; }
    }

    /* head, face, hair */
    function buildHead(head, spine) {
      const { g: hg, dirs } = sculpt(T, low ? 28 : 112, low ? 20 : 84, v => headShape(v.x, v.y, v.z, v));
      // vertex colours: blush on the cheeks, soft shadow in the eye sockets and under the jaw
      const sc = new T.Color(skinC), blush = new T.Color('#E26F6A'), col = [], c = new T.Color();
      for (let i = 0; i < dirs.length / 3; i++) {
        const x = dirs[i * 3], y = dirs[i * 3 + 1], z = dirs[i * 3 + 2];
        c.copy(sc);
        if (z > 0) {
          let b = 0, d = 1;
          for (let s = -1; s <= 1; s += 2) {
            const bx = x - s * 0.5, by = y + 0.28; b += Math.exp(-(bx * bx + by * by) / 0.035);
            const ex = x - s * 0.36, ey = y - 0.06; d -= 0.1 * Math.exp(-(ex * ex + ey * ey) / 0.02);
          }
          c.lerp(blush, Math.min(0.2, b * 0.2)).multiplyScalar(d);
        }
        if (y < -0.6) c.multiplyScalar(1 - 0.12 * smooth(-0.6, -1, y));
        col.push(c.r, c.g, c.b);
      }
      hg.setAttribute('color', new T.Float32BufferAttribute(col, 3));
      mesh(geo(hg), mHeadSkin, head);
      const hn = hg.attributes.normal, hpos = hg.attributes.position;

      /* ears */
      [-1, 1].forEach(s => {
        const p = headAt(T, s, -0.02, -0.06);
        const ear = mesh(geo(sculpt(T, seg(14), seg(12), v => { v.set(v.x * 0.012, v.y * 0.028, v.z * 0.02); }).g), mSkin, head, p.x - s * 0.002, p.y, p.z - 0.004);
        ear.rotation.y = s * 0.35;
        if (!low) { const inner = mesh(geo(new T.TorusGeometry(0.012, 0.0035, 5, 12)), mat('skindark', () => phys(shade(T, skinC, 0.82), { roughness: 0.6 })), head, p.x + s * 0.0065, p.y, p.z - 0.004); inner.rotation.y = s * (Math.PI / 2 - 0.35); inner.scale.set(0.7, 1.4, 1); }
      });

      /* eyes with lids, lashes and an iris that can look around */
      rig.eyes = [];
      const eyeR = 0.0165;
      const mSclera = mat('sclera', () => std('#F5F2EC', { roughness: 0.25 }));
      const mIris = mat('iris', () => std('#ffffff', { map: tex(irisTexture(T, EYE_COLORS[look.eyes] || EYE_COLORS[0])), roughness: 0.12 }));
      const mLid = mat('lid', () => phys(shade(T, skinC, 0.95), { roughness: 0.55, side: T.DoubleSide }));
      [-1, 1].forEach(s => {
        const p = headAt(T, s * 0.36, 0.05, 0.93), n = headNormal(T, p);
        const eye = new T.Group(); eye.position.copy(p).addScaledVector(n, -eyeR * 0.62); head.add(eye);
        mesh(geo(new T.SphereGeometry(eyeR, seg(20), seg(16))), mSclera, eye);
        const ball = new T.Group(); eye.add(ball);
        if (low) {
          mesh(geo(new T.SphereGeometry(eyeR * 0.62, 8, 6)), mDark, ball, 0, 0, eyeR * 0.5).scale.z = 0.6;
        } else {
          const iris = mesh(geo(new T.SphereGeometry(eyeR * 1.012, 24, 10, 0, Math.PI * 2, 0, 0.78)), mIris, ball); iris.rotation.x = Math.PI / 2;
          mesh(geo(new T.SphereGeometry(eyeR * 0.13, 8, 6)), mat('glint', () => new T.MeshBasicMaterial({ color: '#ffffff' })), ball, eyeR * 0.32, eyeR * 0.36, eyeR * 0.94);
        }
        // upper and lower lids (skin shells slightly larger than the eye); the upper lid rotates to blink
        const lidR = eyeR * 1.14;
        const up = new T.Group(); eye.add(up);
        mesh(geo(new T.SphereGeometry(lidR, seg(20), seg(10), 0, Math.PI * 2, 0, Math.PI / 2)), mLid, up);
        if (!low) {
          const lash = mesh(geo(new T.TorusGeometry(lidR * 1.01, 0.0013, 4, 20, Math.PI)), mat('lash', () => std('#141010', { roughness: 0.6 })), up); lash.rotation.x = Math.PI / 2;
        }
        const lo = new T.Group(); eye.add(lo); lo.rotation.x = 2.5;
        mesh(geo(new T.SphereGeometry(lidR * 0.99, seg(20), seg(6), 0, Math.PI * 2, 0, 0.8)), mLid, lo);
        rig.eyes.push({ eye, ball, up });
      });
      /* brows */
      const browC = look.hair === 'hijab' || look.hair === 'bald' ? '#2b1e17' : shade(T, hairC, 0.75);
      const mBrow = mat('brow', () => std(browC, { roughness: 0.7 }));
      [-1, 1].forEach(s => {
        const pts = [[0.15, 0.22], [0.33, 0.255], [0.52, 0.215]].map(([x, y]) => { const q = headAt(T, s * x, y, 0.92); return q.addScaledVector(headNormal(T, q), 0.003); });
        mesh(geo(tube(T, pts, t => (0.0046 - 0.0024 * t) * (low ? 1.3 : 1), seg(14), low ? 4 : 6)), mBrow, head);
      });
      /* nose */
      const tip = headAt(T, 0, -0.26, 1).add(new T.Vector3(0, 0, 0.017));
      const root2 = headAt(T, 0, 0.08, 1);
      mesh(geo(tube(T, [root2.clone().add(new T.Vector3(0, 0, -0.004)), root2.clone().lerp(tip, 0.55).add(new T.Vector3(0, 0, 0.005)), tip.clone().add(new T.Vector3(0, 0.006, -0.004))], t => 0.0085 + 0.002 * t, seg(12), seg(10))), mSkin, head);
      mesh(geo(new T.SphereGeometry(0.0088, seg(14), seg(10))), mSkin, head, tip.x, tip.y - 0.002, tip.z - 0.006).scale.set(1.1, 0.85, 0.9);
      [-1, 1].forEach(s => mesh(geo(new T.SphereGeometry(0.0056, seg(12), seg(8))), mSkin, head, s * 0.0092, tip.y - 0.005, tip.z - 0.014).scale.set(1, 0.8, 1));
      /* lips: a soft smile */
      const mLip = mat('lip', () => phys(mix(T, skinC, '#A9453F', 0.5), { roughness: 0.6 }));
      const lipPts = (y, depth, curve) => [-0.3, -0.15, 0, 0.15, 0.3].map(x => { const q = headAt(T, x, y + curve * x * x, 1); return q.addScaledVector(headNormal(T, q), depth); });
      mesh(geo(tube(T, lipPts(-0.52, 0.0005, 0.5), t => 0.0028 + 0.0028 * Math.sin(Math.PI * t), seg(16), 6)), mLip, head);
      mesh(geo(tube(T, lipPts(-0.585, 0.0005, 0.35), t => 0.003 + 0.0038 * Math.sin(Math.PI * t), seg(16), 6)), mLip, head);
      if (!low) mesh(geo(tube(T, lipPts(-0.55, 0.0012, 0.42), t => 0.0009 + 0.0007 * Math.sin(Math.PI * t), 14, 4)), mat('mouth', () => std('#5a2422', { roughness: 0.6 })), head);

      /* hair, hijab and cap are shells grown out of the head mesh */
      const style = look.hair, cap = look.cap && style !== 'hijab';
      const capS = d => d[1] + 0.22 * d[2] - 0.26;
      const CAP_T = 0.013;
      const scalp = d => {
        const a = Math.abs(Math.atan2(d[0], d[2])) / Math.PI;
        const hl = a < 0.28 ? 0.46 - (a / 0.28) * 0.24 : a < 0.55 ? 0.22 - ((a - 0.28) / 0.27) * 0.1 : 0.12 - ((a - 0.55) / 0.45) * 0.7;
        return d[1] - hl;
      };
      const curls = d => 0.5 + 0.5 * Math.sin(d[0] * 21 + 1.3) * Math.sin(d[1] * 19 + 0.4) * Math.sin(d[2] * 23 + 2.1);
      const STYLES = {
        short: { s: scalp, ramp: 0.06, th: d => (0.006 + 0.024 * smooth(0.05, 0.85, d[1]) + 0.012 * smooth(0.2, 0.7, d[2]) * smooth(0.35, 0.75, d[1]) * (0.7 + 0.3 * d[0])) * (1 - 0.45 * Math.exp(-((d[0] + 0.28) ** 2) / 0.003) * smooth(0.3, 0.8, d[1]) * smooth(-0.3, 0.3, d[2])) },
        buzz: { s: d => scalp(d) + 0.02, ramp: 0.04, th: () => 0.0045 },
        curly: { s: d => scalp(d) + 0.04, ramp: 0.1, th: d => 0.026 + 0.022 * smooth(-0.4, 0.8, d[1]) + (low ? 0.008 : 0.018 * curls(d)) },
        long: { s: d => scalp(d) + 0.02, ramp: 0.07, th: d => (0.01 + 0.014 * smooth(-0.2, 0.9, d[1])) * (1 - 0.5 * Math.exp(-((d[0] - 0.22) ** 2) / 0.002) * smooth(0.4, 0.85, d[1]) * smooth(-0.2, 0.3, d[2])) },
        ponytail: { s: d => scalp(d) + 0.02, ramp: 0.06, th: d => 0.007 + 0.006 * smooth(0, 1, d[1]) },
        bun: { s: d => scalp(d) + 0.02, ramp: 0.06, th: d => 0.007 + 0.006 * smooth(0, 1, d[1]) },
        hijab: { s: d => { const fx = d[0] / 0.66, fy = (d[1] + 0.12) / 0.8; return d[2] > 0 ? (Math.sqrt(fx * fx + fy * fy) - 1) * 0.6 : 1; }, ramp: 0.03, th: () => 0.019 }
      };
      const shell = (spec, m, extra) => {
        const n = hpos.count, pos = new Float32Array(n * 3), ok = new Uint8Array(n), d = [0, 0, 0], fade = spec.fade || 0, alpha = fade ? new Float32Array(n * 4) : null;
        for (let i = 0; i < n; i++) {
          d[0] = dirs[i * 3]; d[1] = dirs[i * 3 + 1]; d[2] = dirs[i * 3 + 2];
          const sv = spec.s(d); ok[i] = sv > -fade ? 1 : 0;
          if (alpha) { const st = 0.84 + 0.16 * (0.5 + 0.5 * Math.sin(Math.atan2(d[0], d[2]) * 70 + Math.sin(d[1] * 9) * 2.5)) * (0.75 + 0.25 * Math.sin(d[1] * 40 + d[0] * 13)); alpha[i * 4] = alpha[i * 4 + 1] = alpha[i * 4 + 2] = st; alpha[i * 4 + 3] = smooth(-fade, fade * 0.3, sv); }
          let off = 0.0012 + spec.th(d) * smooth(0, spec.ramp, sv);
          if (extra) off = extra(d, off);
          pos[i * 3] = hpos.getX(i) + hn.getX(i) * off; pos[i * 3 + 1] = hpos.getY(i) + hn.getY(i) * off; pos[i * 3 + 2] = hpos.getZ(i) + hn.getZ(i) * off;
        }
        const src = hg.index.array, idx = [];
        for (let k = 0; k < src.length; k += 3) if (ok[src[k]] && ok[src[k + 1]] && ok[src[k + 2]]) idx.push(src[k], src[k + 1], src[k + 2]);
        const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
        if (alpha) g.setAttribute('color', new T.BufferAttribute(alpha, 4));
        return mesh(geo(g), m, head);
      };
      const underCap = (d, off) => cap && capS(d) > -0.03 ? Math.min(off, CAP_T - 0.005) : off;
      if (STYLES[style] && style !== 'hijab') shell(Object.assign({ fade: low ? 0.1 : 0.075 }, STYLES[style]), mHairShell, underCap);
      if (style === 'long') buildLongHair(head, spine);
      if (style === 'ponytail') {
        const base = headAt(T, 0, cap ? 0.02 : 0.18, -1); const bn = headNormal(T, base); base.addScaledVector(bn, 0.012);
        const tie = mesh(geo(new T.TorusGeometry(0.016, 0.006, 6, 16)), mat('tie', () => std('#FF93B5', { roughness: 0.5 })), head, base.x, base.y, base.z); tie.quaternion.setFromUnitVectors(new T.Vector3(0, 0, 1), bn);
        const tail = new T.Group(); tail.position.copy(base); head.add(tail); rig.tail = tail;
        const pts = [[0, 0, 0], [0, -0.01, -0.035], [0, -0.07, -0.06], [0, -0.15, -0.055], [0, -0.22, -0.04]].map(p => new T.Vector3(...p));
        mesh(geo(tube(T, pts, t => 0.017 + 0.012 * Math.sin(Math.PI * Math.min(1, t * 1.6)) - 0.024 * t * t, seg(24), seg(12))), mHair, tail);
      }
      if (style === 'bun') {
        const at = headAt(T, 0, cap ? 0.05 : 0.72, cap ? -1 : -0.7); const bn = headNormal(T, at); at.addScaledVector(bn, 0.028);
        const bun = sculpt(T, seg(24), seg(18), v => { const k = 1 + 0.08 * Math.sin(Math.atan2(v.x, v.z) * 3 + v.y * 4); v.multiplyScalar(0.034 * k); }).g;
        const b = mesh(geo(bun), mHair, head, at.x, at.y, at.z); b.scale.set(1.1, 0.9, 1);
        const tie = mesh(geo(new T.TorusGeometry(0.026, 0.005, 6, 18)), mat('tie', () => std('#FFC877', { roughness: 0.5 })), head, at.x - bn.x * 0.02, at.y - bn.y * 0.02, at.z - bn.z * 0.02);
        tie.quaternion.setFromUnitVectors(new T.Vector3(0, 0, 1), bn);
      }
      if (style === 'hijab') {
        const mH = mat('hijab', () => phys(hairC, { roughness: 0.85, sheen: 0.8, sheenRoughness: 0.6, sheenColor: shade(T, hairC, 1.4), side: T.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
        shell(STYLES.hijab, mH);
        // rolled edge around the face
        const edge = [];
        for (let k = 0; k <= 40; k++) {
          const a = -Math.PI * 0.08 + (k / 40) * Math.PI * 1.16;
          const dx = 0.66 * Math.cos(a), dy = -0.12 + 0.8 * Math.sin(a), dz = Math.sqrt(Math.max(0, 1 - dx * dx - dy * dy));
          const q = headAt(T, dx, dy, dz); edge.push(q.addScaledVector(headNormal(T, q), 0.012));
        }
        mesh(geo(tube(T, edge, () => 0.0085, seg(60), seg(8))), mH, head);
        // drape over the neck and shoulders, with soft folds
        const tor = torsoCurve.getPoints(120);
        const torsoR = y => { for (let i = 1; i < tor.length; i++) if (tor[i].y >= y) { const a = tor[i - 1], b = tor[i]; return a.x + (b.x - a.x) * ((y - a.y) / Math.max(1e-5, b.y - a.y)); } return 0.05; };
        mesh(geo(sheet(T, seg(72), 16, (u, v, o) => {
          const a = u * Math.PI * 2, c = Math.cos(a), sn = Math.sin(a), side = sn * sn;
          const y = 0.5 - v * (0.27 + 0.12 * c * c + 0.02 * Math.max(0, c));
          const tr = torsoR(Math.min(0.44, Math.max(0.28, y))), k = smooth(0.5, 0.405, y);
          const arm = 0.052 * side * smooth(0.43, 0.36, y);
          const fold = 1 + 0.05 * Math.sin(a * 8 + 1) * Math.pow(v, 1.5);
          const rx = (0.084 + (tr + 0.02 + arm - 0.084) * k) * fold * (1 + (w - 1) * k * 0.5), rz = (0.078 + (tr * ZS + 0.026 - 0.078) * k) * fold;
          o.set(sn * rx, y, c * rz + 0.008);
        }, true)), mH, spine);
      }
      if (cap) {
        const mCap = mat('cap', () => phys(CLOTH[(look.topColor + 5) % CLOTH.length], { roughness: 0.75, sheen: 0.5, sheenRoughness: 0.7, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 }));
        shell({ s: capS, ramp: 0.004, th: () => CAP_T }, mCap);
        // band along the edge, a button and a curved brim
        const capEdge = (a, off) => {
          let lo = -1, hi = 1;
          for (let it = 0; it < 20; it++) { const y = (lo + hi) / 2, c = Math.sqrt(1 - y * y); (y + 0.22 * c * Math.cos(a) - 0.26 > 0) ? (hi = y) : (lo = y); }
          const y = (lo + hi) / 2, c = Math.sqrt(1 - y * y);
          const q = headAt(T, Math.sin(a) * c, y, Math.cos(a) * c); return q.addScaledVector(headNormal(T, q), off);
        };
        const edge = []; for (let k = 0; k < 48; k++) edge.push(capEdge((k / 48) * Math.PI * 2, CAP_T - 0.002));
        mesh(geo(tube(T, edge, () => 0.0042, 48, 6, true)), mCap, head);
        const topP = headAt(T, 0, 1, 0.12); mesh(geo(new T.SphereGeometry(0.008, 8, 6)), mCap, head, topP.x, topP.y + CAP_T + 0.002, topP.z);
        const brim = sheet(T, seg(20), 4, (u, v, o) => {
          const a = (u - 0.5) * Math.PI * 0.9, e = capEdge(a, CAP_T - 0.002), len = 0.088 * Math.cos(a * 1.1) * v;
          o.set(e.x + Math.sin(a) * len * 0.6, e.y - 0.004 - len * 0.18 - 0.012 * v * v, e.z + Math.cos(a) * len);
        });
        mesh(geo(brim), mat('capds', () => { const m = mCap.clone(); m.side = T.DoubleSide; m.polygonOffset = false; return m; }), head);
      }
      if (look.glasses) {
        const mFrame = mat('frame', () => std('#1b1b1f', { roughness: 0.3, metalness: 0.2 }));
        const mLens = mat('lens', () => new T.MeshPhysicalMaterial({ color: '#cfe8ff', transparent: true, opacity: 0.18, roughness: 0.05, metalness: 0, depthWrite: false }));
        [-1, 1].forEach(s => {
          const c = headAt(T, s * 0.36, 0.04, 0.93); c.z += 0.016;
          const ring = [];
          for (let k = 0; k < 24; k++) { const a = k / 24 * Math.PI * 2, rx = 0.024, ry = 0.018, sq = 0.35; const cx = Math.cos(a), sy = Math.sin(a); ring.push(new T.Vector3(c.x + rx * Math.sign(cx) * Math.pow(Math.abs(cx), 1 - sq), c.y + ry * Math.sign(sy) * Math.pow(Math.abs(sy), 1 - sq), c.z - 0.004 * Math.abs(cx))); }
          mesh(geo(tube(T, ring, () => 0.0021, 48, 6, true)), mFrame, head);
          const lens = new T.Shape(); lens.setFromPoints(ring.map(p => new T.Vector2(p.x - c.x, p.y - c.y)));
          mesh(geo(new T.ShapeGeometry(lens, 12)), mLens, head, c.x, c.y, c.z - 0.002);
          const tp = [new T.Vector3(c.x + s * 0.024, c.y + 0.006, c.z - 0.002)];
          [[0.86, 0.1, 0.5], [0.99, 0.06, 0.05], [0.97, 0.0, -0.25]].forEach(([x, y, z]) => { const q = headAt(T, s * x, y, z); tp.push(q.addScaledVector(headNormal(T, q), 0.004 + (cap ? 0 : 0.002))); });
          mesh(geo(tube(T, tp, () => 0.0018, 20, 5)), mFrame, head);
        });
        const c0 = headAt(T, 0.36, 0.04, 0.93), bx = c0.x - 0.023, bz = c0.z + 0.014;
        mesh(geo(tube(T, [new T.Vector3(-bx, c0.y + 0.006, bz), new T.Vector3(0, c0.y + 0.01, bz + 0.004), new T.Vector3(bx, c0.y + 0.006, bz)], () => 0.0019, 10, 5)), mFrame, head);
      }
    }

    /* long hair: a curtain that hugs the head, then falls behind the shoulders; skinned to head and chest */
    function buildLongHair(head, spine) {
      const nu = seg(36), nv = seg(22), out = [], skinIdx = [], skinW = [];
      const hm = new T.Matrix4().compose(head.position.clone().add(rig.neck.position), new T.Quaternion(), new T.Vector3(1, 1, 1));
      const sp = new T.Vector3();
      const g = sheet(T, nu, nv, (u, v, o) => {
        const phi0 = 0.36 * Math.PI, a = phi0 + u * (Math.PI * 2 - 2 * phi0);
        const yTop = 0.45, yBot = -0.36 - 0.03 * Math.sin(u * 17) - 0.04 * Math.sin(u * Math.PI);
        const yu = yTop + (yBot / HY - yTop) * v;
        const yLocal = yu * HY;
        let rx = 0, rz = 0;
        for (let k = 0; k <= 12; k++) {
          const yy = yTop - (yTop - Math.max(-0.95, yu)) * (k / 12);
          const c = Math.sqrt(Math.max(0, 1 - yy * yy));
          const q = headAt(T, Math.sin(a) * c, yy, Math.cos(a) * c);
          rx = Math.max(rx, Math.abs(q.x)); rz = Math.max(rz, Math.abs(q.z));
        }
        const th = 0.016;
        let x = Math.sin(a) * (rx + th), z = Math.cos(a) * (rz + th), y = yLocal;
        // below the jaw: spread out and move behind the shoulders
        const k = smooth(-0.1, -0.22, yLocal);
        const back = (look.backpack ? -0.152 : -0.135) - 0.02 * (1 - Math.abs(Math.sin(a)));
        x = x * (1 + 0.85 * k); z = z + (Math.min(z, back) - z) * k;
        z = Math.min(z, z * (1 - k) + back * k);
        o.set(x, y, z);
      });
      // skin weights: the top follows the head, the bottom follows the chest
      const pos = g.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const y = pos.getY(i), wHead = 1 - smooth(-0.06, -0.2, y);
        skinIdx.push(1, 0, 0, 0); skinW.push(wHead, 1 - wHead, 0, 0);
        sp.set(pos.getX(i), y, pos.getZ(i)).applyMatrix4(hm);
        pos.setXYZ(i, sp.x, sp.y, sp.z);
      }
      g.setAttribute('skinIndex', new T.Uint16BufferAttribute(skinIdx, 4));
      g.setAttribute('skinWeight', new T.Float32BufferAttribute(skinW, 4));
      g.computeVertexNormals();
      const m = new T.SkinnedMesh(geo(g), mHairDS); m.frustumCulled = false;
      spine.add(m);
      rig.bindHair = () => { const sk = new T.Skeleton([spine, head]); owned.push(sk); m.bind(sk, m.matrixWorld); };
      out.push(m);
    }

    P = rig;
    group.updateWorldMatrix(true, true);
    if (P.bindHair) P.bindHair();
  }

  build();
  return {
    group,
    get look() { return look; },
    setLook(l) { look = Object.assign({}, DEFAULT_LOOK, l || {}); build(); },
    wave() { A.waveT = 2.4; },
    /* speed: 0 idle, ~1 walk, ~2 run */
    animate(dt, speed = 0) {
      if (!P || dt <= 0) return;
      A.t += dt;
      A.sp = damp(A.sp, Math.min(2, Math.max(0, speed)), 6, dt);
      const s = A.sp, walk = Math.min(1, s), run = smooth(1, 1.9, s);
      const cadence = 1.75 + 0.85 * run;
      if (s > 0.02) A.phase += dt * Math.PI * 2 * cadence;
      else A.phase = damp(A.phase, Math.round(A.phase / Math.PI) * Math.PI, 4, dt);
      const p = A.phase, amp = walk * (0.5 + 0.38 * run);
      const k = 1 - Math.exp(-14 * dt);
      const to = (o, key, v) => { o[key] += (v - o[key]) * k; };

      /* legs: knee bends while the leg swings forward, the foot stays roughly level */
      P.legs.forEach((l, i) => {
        const q = p + (i ? Math.PI : 0), fwd = Math.sin(q), swing = Math.max(0, Math.cos(q));
        const hipX = -fwd * amp - run * 0.25 * swing;
        const knee = amp * (0.12 + (1.05 + run * 0.9) * Math.pow(swing, 1.4));
        to(l.hip.rotation, 'x', hipX);
        to(l.knee.rotation, 'x', knee);
        to(l.ankle.rotation, 'x', -(hipX + knee) * 0.75 + amp * 0.25 * Math.max(0, -Math.cos(q)) * (fwd > 0 ? 0 : 1));
        to(l.hip.rotation, 'z', (i ? 1 : -1) * 0.015 * (1 - walk));
      });
      /* pelvis and spine: bob, sway, twist, lean */
      const breathe = Math.sin(A.t * 1.6);
      const idleSway = Math.sin(A.t * 0.55) * (1 - walk);
      P.pelvis.position.y = 0.94 - amp * 0.045 * Math.abs(Math.sin(p)) + amp * 0.012 + idleSway * 0.003;
      P.pelvis.position.x = Math.cos(p) * 0.012 * walk + idleSway * 0.008;
      to(P.pelvis.rotation, 'y', Math.sin(p) * 0.14 * amp);
      to(P.pelvis.rotation, 'z', Math.cos(p) * 0.035 * walk + idleSway * 0.015);
      to(P.spine.rotation, 'y', -Math.sin(p) * 0.22 * amp);
      to(P.spine.rotation, 'x', 0.05 * walk + 0.16 * run + breathe * 0.008 * (1 - walk));
      to(P.spine.rotation, 'z', -Math.cos(p) * 0.03 * walk - idleSway * 0.012);
      P.spine.scale.set(1 + breathe * 0.006, 1, 1 + breathe * 0.01);
      if (P.skirt) { const f = 1 + 0.12 * amp * Math.abs(Math.sin(p)); P.skirt.scale.set(f, 1, f); }

      /* arms: swing against the legs; the waving arm lifts with an eased weight */
      A.waveT = Math.max(0, A.waveT - dt);
      A.wave = damp(A.wave, A.waveT > 0.25 ? 1 : 0, 7, dt);
      P.arms.forEach((a, i) => {
        const q = p + (i ? 0 : Math.PI), fwd = Math.sin(q);
        let shX = -fwd * amp * 0.9 + 0.05 * run, shZ = a.s * (0.11 + 0.02 * breathe * (1 - walk) + 0.06 * run);
        let elX = -(0.18 + 0.3 * walk * Math.max(0, fwd) + 1.1 * run), elZ = 0, wrZ = 0;
        if (a.s < 0 && A.wave > 0.001) {
          const wv = A.wave, osc = Math.sin(A.t * 13);
          shX = shX * (1 - wv) - 0.2 * wv; shZ = shZ * (1 - wv) + a.s * 1.95 * wv;
          elX = elX * (1 - wv) - 0.15 * wv; elZ = a.s * (1.1 + 0.38 * osc) * wv; wrZ = a.s * 0.25 * osc * wv;
        }
        to(a.sh.rotation, 'x', shX); to(a.sh.rotation, 'z', shZ);
        to(a.elbow.rotation, 'x', elX); to(a.elbow.rotation, 'z', elZ);
        to(a.wrist.rotation, 'z', wrZ + a.s * 0.05); to(a.wrist.rotation, 'x', -0.1 * walk);
      });

      /* head: keeps level while walking, looks around while idle; eyes lead the head */
      A.lookTimer -= dt;
      if (A.lookTimer < 0) { A.lookTimer = 1.8 + Math.random() * 3.5; A.lookT = walk > 0.5 ? [0, 0] : [(Math.random() - 0.5) * 0.7, (Math.random() - 0.4) * 0.22]; }
      A.look[0] = damp(A.look[0], A.lookT[0], 3, dt); A.look[1] = damp(A.look[1], A.lookT[1], 3, dt);
      to(P.neck.rotation, 'y', A.look[0] * 0.45 + Math.sin(p) * 0.08 * amp);
      to(P.head.rotation, 'y', A.look[0] * 0.55);
      to(P.head.rotation, 'x', -A.look[1] - 0.05 * walk - 0.12 * run);
      P.eyes.forEach(e => { e.ball.rotation.y = damp(e.ball.rotation.y, (A.lookT[0] - A.look[0]) * 0.8, 10, dt); e.ball.rotation.x = damp(e.ball.rotation.x, -(A.lookT[1] - A.look[1]) * 0.8, 10, dt); });
      /* blink: the upper lid sweeps down and back up */
      A.blink -= dt;
      if (A.blink < 0) { A.blink = 2.2 + Math.random() * 3.5; A.lid = 1; }
      A.lid = Math.max(0, A.lid - dt * 7);
      const lidA = -0.36 + (A.lid > 0 ? Math.sin((1 - A.lid) * Math.PI) * 1.5 : 0);
      P.eyes.forEach(e => { e.up.rotation.x = lidA; });
      /* ponytail: a damped spring that reacts to the walk */
      if (P.tail) {
        const target = Math.sin(p) * 0.18 * amp;
        A.tailV += ((target - A.tail) * 60 - A.tailV * 8) * dt; A.tail += A.tailV * dt;
        P.tail.rotation.z = A.tail; P.tail.rotation.x = 0.1 * run + Math.abs(Math.sin(p)) * 0.08 * amp;
      }
    },
    dispose() { owned.splice(0).forEach(x => x.dispose()); }
  };
}
