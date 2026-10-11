/* Reusable, smooth 3D models for the city: cars, trees, benches, lamp posts and small props.
   Every model is one merged BufferGeometry with material groups, so it can be drawn as an InstancedMesh
   (or a plain Mesh) with an array of materials in the order given by `slots`. */
import * as T from 'three';
import { mergeBufferGeometries as mergeGeometries, mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/* a list of [geometry, slotIndex] → one geometry with groups sorted by slot */
function merge(parts, slotCount) {
  const bySlot = [];
  for (let s = 0; s < slotCount; s++) {
    const list = parts.filter(p => p[1] === s).map(p => {
      let g = p[0].index ? p[0].toNonIndexed() : p[0];
      ['uv2', 'color', 'skinIndex', 'skinWeight'].forEach(k => g.deleteAttribute && g.getAttribute(k) && g.deleteAttribute(k));
      if (!g.getAttribute('uv')) g.setAttribute('uv', new T.Float32BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
      if (!g.getAttribute('normal')) g.computeVertexNormals();
      return g;
    });
    bySlot.push(list.length ? mergeGeometries(list, false) : null);
  }
  const used = bySlot.map((g, i) => [g, i]).filter(x => x[0]);
  const out = mergeGeometries(used.map(x => x[0]), true);
  out.groups.forEach((gr, k) => { gr.materialIndex = used[k][1]; });
  parts.forEach(p => p[0].dispose());
  bySlot.forEach(g => g && g.dispose());
  return out;
}
const at = (g, x, y, z, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => {
  const m = new T.Matrix4().compose(new T.Vector3(x, y, z), new T.Quaternion().setFromEuler(new T.Euler(rx, ry, rz)), new T.Vector3(sx, sy, sz));
  g.applyMatrix4(m); return g;
};
const lathe = (prof, seg = 16) => new T.LatheGeometry(new T.SplineCurve(prof.map(p => new T.Vector2(Math.max(0.0001, p[0]), p[1]))).getPoints(24), seg);
/* an icosphere pushed in and out by a little noise: a soft, organic blob */
function blob(r, detail, amp, seed) {
  let g = new T.IcosahedronGeometry(1, detail);
  g.deleteAttribute('normal'); g.deleteAttribute('uv');
  g = mergeVertices(g);
  const p = g.attributes.position, v = new T.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const n = Math.sin(v.x * 5.1 + seed) * Math.sin(v.y * 4.3 + seed * 1.7) * Math.sin(v.z * 4.7 + seed * 0.6);
    v.multiplyScalar(r * (1 + amp * n));
    p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  return g;
}

/* ───────── cars ───────── */
/* side profile helper: an extruded (z, y) outline, rounded by the bevel, centred on x */
function sideBody(points, width, bevel, arches) {
  const s = new T.Shape();
  const top = new T.SplineCurve(points.map(p => new T.Vector2(p[0], p[1]))).getPoints(points.length * 6);
  if (arches) {
    // bottom edge from the front back to the rear, rising over each wheel
    const { yb, wr, ra, zs } = arches, pts = top.slice();
    pts.push(new T.Vector2(top[top.length - 1].x, yb));
    zs.slice().sort((a, b) => b - a).forEach(z => {
      const a0 = Math.asin(Math.max(-1, Math.min(1, (yb - wr) / ra)));
      for (let k = 0; k <= 14; k++) { const a = a0 + (k / 14) * (Math.PI - 2 * a0); pts.push(new T.Vector2(z + Math.cos(a) * ra, wr + Math.sin(a) * ra)); }
    });
    pts.push(new T.Vector2(top[0].x, yb));
    s.setFromPoints(pts);
  } else s.setFromPoints(top);
  const g = new T.ExtrudeGeometry(s, { depth: width - bevel * 2, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel * 0.8, bevelSegments: 3, curveSegments: 8 });
  g.translate(0, 0, -(width - bevel * 2) / 2);
  g.rotateY(-Math.PI / 2); // shape x → world z (front), extrusion → world x
  return g;
}
function wheel(r, w) {
  const tire = lathe([[r * 0.62, -w / 2], [r * 0.92, -w / 2], [r, -w * 0.32], [r, w * 0.32], [r * 0.92, w / 2], [r * 0.62, w / 2]], 18);
  tire.rotateZ(Math.PI / 2);
  const rim = new T.CylinderGeometry(r * 0.62, r * 0.62, w * 0.9, 14); rim.rotateZ(Math.PI / 2);
  const hub = new T.CylinderGeometry(r * 0.2, r * 0.24, w * 1.02, 10); hub.rotateZ(Math.PI / 2);
  return { tire, rim, hub };
}
/* slots: 0 paint, 1 glass, 2 trim (black plastic), 3 chrome, 4 headlight, 5 taillight, 6 tire */
export const CAR_SLOTS = 7;
export function carGeometry(kind = 'sedan') {
  const parts = [];
  const K = {
    sedan: { L: 1.25, W: 0.56, belt: 0.3, roof: 0.45, wr: 0.115, wz: 0.39, body: [[-0.62, 0.11], [-0.64, 0.22], [-0.58, 0.3], [-0.38, 0.31], [0.3, 0.31], [0.55, 0.27], [0.635, 0.2], [0.62, 0.11]], cab: [[-0.4, 0.3], [-0.2, 0.445], [0.1, 0.45], [0.33, 0.3]] },
    hatch: { L: 1.08, W: 0.55, belt: 0.3, roof: 0.47, wr: 0.11, wz: 0.33, body: [[-0.52, 0.11], [-0.545, 0.24], [-0.52, 0.31], [0.24, 0.31], [0.47, 0.27], [0.545, 0.2], [0.53, 0.11]], cab: [[-0.5, 0.3], [-0.44, 0.46], [0.06, 0.47], [0.28, 0.3]] },
    suv: { L: 1.3, W: 0.6, belt: 0.36, roof: 0.56, wr: 0.135, wz: 0.4, body: [[-0.63, 0.13], [-0.655, 0.3], [-0.62, 0.37], [0.36, 0.37], [0.6, 0.33], [0.66, 0.24], [0.645, 0.13]], cab: [[-0.6, 0.36], [-0.57, 0.555], [0.14, 0.56], [0.36, 0.36]] },
    bus: { L: 2.4, W: 0.66, belt: 0.36, roof: 0.82, wr: 0.13, wz: 0.82, body: [[-1.2, 0.12], [-1.21, 0.36], [1.2, 0.36], [1.21, 0.12]], cab: [[-1.19, 0.35], [-1.185, 0.78], [1.17, 0.79], [1.2, 0.35]] }
  }[kind === 'taxi' ? 'sedan' : kind];
  const { W, wr, wz } = K;
  // lower body, with soft bevelled edges and cut-outs over the wheels
  const bev = 0.05;
  parts.push([sideBody(K.body, W, bev, { yb: 0.11, wr, ra: wr + 0.03 + bev * 0.8, zs: [-wz, wz] }), 0]);
  const bodyFront = K.body[K.body.length - 1][0] + bev * 0.8, bodyRear = K.body[0][0] - bev * 0.8;
  // greenhouse: glass all round, a painted roof on top and a B-pillar
  const cab = sideBody(K.cab, W - 0.07, 0.035);
  parts.push([cab, 1]);
  const roofZ0 = K.cab[1][0] + 0.02, roofZ1 = K.cab[2][0] - 0.02;
  parts.push([at(new RoundedBoxGeometry(W - 0.05, 0.04, roofZ1 - roofZ0 + 0.08, 2, 0.016), 0, K.roof + 0.03, (roofZ0 + roofZ1) / 2), 0]);
  if (kind !== 'bus') parts.push([at(new T.BoxGeometry(W - 0.055, (K.roof - K.belt) * 0.9, 0.035), 0, (K.roof + K.belt) / 2, (roofZ0 + roofZ1) / 2 - 0.03), 0]);
  else for (let z = -0.9; z <= 0.9; z += 0.3) parts.push([at(new T.BoxGeometry(W - 0.055, 0.4, 0.04), 0, 0.57, z), 0]);
  // wheel arches, bumpers, grille, mirrors, lights
  const front = bodyFront, rear = bodyRear;
  parts.push([at(new RoundedBoxGeometry(W + 0.01, 0.07, 0.08, 2, 0.025), 0, 0.12, front - 0.01), 2]);
  parts.push([at(new RoundedBoxGeometry(W + 0.01, 0.07, 0.08, 2, 0.025), 0, 0.12, rear + 0.01), 2]);
  parts.push([at(new RoundedBoxGeometry(W * 0.36, 0.04, 0.02, 2, 0.01), 0, kind === 'suv' ? 0.24 : 0.17, front - 0.004), 2]);
  [-1, 1].forEach(s => {
    [-wz, wz].forEach(z => { const arch = new T.TorusGeometry(wr + 0.02, 0.018, 6, 16, Math.PI); arch.rotateY(Math.PI / 2); parts.push([at(arch, s * (W / 2 + 0.005), wr + 0.01, z), 2]); });
    if (kind !== 'bus') parts.push([at(new RoundedBoxGeometry(0.05, 0.035, 0.05, 2, 0.012), s * (W / 2 + 0.02), K.belt + 0.02, K.cab[3][0] - 0.05), 0]);
    parts.push([at(new RoundedBoxGeometry(0.11, 0.045, 0.04, 2, 0.016), s * (W / 2 - 0.12), kind === 'suv' ? 0.28 : 0.215, front - 0.012), 4]);
    parts.push([at(new RoundedBoxGeometry(0.12, 0.035, 0.02, 2, 0.008), s * (W / 2 - 0.1), kind === 'suv' ? 0.3 : 0.24, rear - 0.002), 5]);
    // door handle
    if (kind !== 'bus') parts.push([at(new T.BoxGeometry(0.004, 0.012, 0.05), s * (W / 2 + 0.003), K.belt - 0.03, 0.04), 3]);
  });
  parts.push([at(new T.BoxGeometry(W * 0.62, 0.012, 0.012), 0, kind === 'suv' ? 0.3 : 0.24, rear - 0.002), 5]);
  // wheels
  [-1, 1].forEach(s => [-wz, wz].forEach(z => {
    const { tire, rim, hub } = wheel(wr, 0.08);
    parts.push([at(tire, s * (W / 2 - 0.03), wr, z), 6]);
    parts.push([at(rim, s * (W / 2 - 0.025), wr, z), 3]);
    parts.push([at(hub, s * (W / 2 - 0.02), wr, z), 2]);
  }));
  if (kind === 'taxi') parts.push([at(new RoundedBoxGeometry(0.18, 0.06, 0.08, 2, 0.015), 0, K.roof + 0.04, 0), 4]);
  return merge(parts, CAR_SLOTS);
}
export function carMaterials(color, env) {
  const paint = new T.MeshPhysicalMaterial({ color, roughness: 0.32, metalness: 0.35, clearcoat: 1, clearcoatRoughness: 0.08, envMap: env || null, envMapIntensity: 0.9 });
  return [paint].concat(sharedCarMats(env));
}
let SHARED = null;
function sharedCarMats(env) {
  if (SHARED) return SHARED;
  SHARED = [
    new T.MeshPhysicalMaterial({ color: 0x0b1018, roughness: 0.05, metalness: 0.2, clearcoat: 1, envMap: env || null, envMapIntensity: 1.2 }),
    new T.MeshStandardMaterial({ color: 0x15181d, roughness: 0.65 }),
    new T.MeshStandardMaterial({ color: 0xc8ced8, roughness: 0.22, metalness: 1, envMap: env || null, envMapIntensity: 1 }),
    new T.MeshBasicMaterial({ color: 0xf2fbff, toneMapped: false }),
    new T.MeshBasicMaterial({ color: 0xff2a4a, toneMapped: false }),
    new T.MeshStandardMaterial({ color: 0x0e0f12, roughness: 0.9 })
  ];
  return SHARED;
}
export function resetShared() { SHARED = null; }

/* ───────── trees ───────── */
/* slots: 0 bark, 1 leaves */
export const TREE_SLOTS = 2;
export function treeGeometry(kind = 'round', seed = 1) {
  const parts = [];
  if (kind === 'palm') {
    // a gently curved trunk with rings, and drooping fronds
    const pts = [[0, 0], [0.04, 0.6], [0.12, 1.2], [0.24, 1.75]].map(p => new T.Vector3(p[0], p[1], 0));
    const curve = new T.CatmullRomCurve3(pts);
    const trunk = new T.TubeGeometry(curve, 16, 0.06, 8, false);
    const tp = trunk.attributes.position;
    for (let i = 0; i < tp.count; i++) { const y = tp.getY(i), k = 1.25 - 0.45 * (y / 1.8); const c = curve.getPointAt(Math.min(1, Math.max(0, y / 1.8))); tp.setX(i, c.x + (tp.getX(i) - c.x) * k); tp.setZ(i, c.z + (tp.getZ(i) - c.z) * k); }
    trunk.computeVertexNormals();
    parts.push([trunk, 0]);
    const top = curve.getPointAt(1);
    for (let f = 0; f < 8; f++) {
      const a = f / 8 * Math.PI * 2 + seed, len = 0.8 + (f % 3) * 0.12;
      const g = new T.PlaneGeometry(len, 0.32, 10, 2);
      const p = g.attributes.position;
      for (let i = 0; i < p.count; i++) {
        const u = (p.getX(i) + len / 2) / len, w = p.getY(i) * Math.sin(Math.PI * Math.min(1, u * 1.1)) * (1 - u * 0.4);
        p.setXYZ(i, u * len, -0.55 * u * u * len + Math.abs(w) * 0.25, w);
      }
      g.computeVertexNormals();
      parts.push([at(g, top.x, top.y, top.z, 0, a, 0.25), 1]);
    }
    parts.push([at(new T.SphereGeometry(0.09, 10, 8), top.x, top.y - 0.02, top.z), 0]);
    return merge(parts, TREE_SLOTS);
  }
  const trunk = lathe([[0.1, 0], [0.075, 0.12], [0.06, 0.5], [0.05, kind === 'pine' ? 1.6 : 0.95], [0.001, kind === 'pine' ? 1.7 : 1.0]], 9);
  parts.push([trunk, 0]);
  if (kind === 'pine') {
    // stacked soft cones
    for (let k = 0; k < 4; k++) {
      const r = 0.62 - k * 0.13, y = 0.45 + k * 0.38;
      const cone = lathe([[0.001, 0], [r * 0.95, 0.05], [r, 0.12], [r * 0.55, 0.32], [0.001, 0.58]], 14);
      const p = cone.attributes.position;
      for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), a = Math.atan2(x, z), n = 1 + 0.08 * Math.sin(a * 7 + seed + k); p.setX(i, x * n); p.setZ(i, z * n); }
      cone.computeVertexNormals();
      parts.push([at(cone, 0, y, 0, 0, k * 0.7), 1]);
    }
  } else {
    // a rounded crown of a few soft blobs, and two branches
    const blobs = [[0, 1.2, 0, 0.55], [0.32, 1.02, 0.12, 0.38], [-0.3, 1.05, -0.08, 0.4], [0.05, 1.05, -0.3, 0.37], [-0.08, 0.98, 0.32, 0.36], [0.05, 1.5, 0.02, 0.36]];
    blobs.forEach((b, k) => parts.push([at(blob(b[3], 2, 0.12, seed + k * 1.3), b[0], b[1], b[2]), 1]));
    [[0.5, 0.3], [-0.6, -0.7]].forEach(([rz, ry]) => { const br = new T.CylinderGeometry(0.018, 0.035, 0.42, 6); br.translate(0, 0.21, 0); parts.push([at(br, 0, 0.62, 0, 0, ry, rz), 0]); });
  }
  return merge(parts, TREE_SLOTS);
}

/* ───────── street furniture ───────── */
/* bench: slots 0 wood, 1 metal */
export function benchGeometry() {
  const parts = [];
  for (let k = 0; k < 3; k++) parts.push([at(new RoundedBoxGeometry(0.9, 0.035, 0.085, 2, 0.012), 0, 0.22, 0.1 - k * 0.1), 0]);
  for (let k = 0; k < 2; k++) parts.push([at(new RoundedBoxGeometry(0.9, 0.08, 0.03, 2, 0.012), 0, 0.33 + k * 0.1, -0.15 - k * 0.012, -0.18), 0]);
  [-0.38, 0.38].forEach(x => {
    const s = new T.Shape();
    s.moveTo(0.12, 0); s.lineTo(0.1, 0.2); s.lineTo(-0.13, 0.2); s.lineTo(-0.17, 0.5); s.lineTo(-0.2, 0.5); s.lineTo(-0.16, 0.18); s.lineTo(-0.13, 0); s.lineTo(-0.1, 0); s.lineTo(-0.08, 0.17); s.lineTo(0.08, 0.17); s.lineTo(0.09, 0); s.closePath();
    const g = new T.ExtrudeGeometry(s, { depth: 0.03, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.006, bevelSegments: 1 });
    g.translate(0, 0, -0.015); g.rotateY(-Math.PI / 2);
    parts.push([at(g, x, 0, 0), 1]);
  });
  return merge(parts, 2);
}
/* lamp post with a curved arm (metal only; the bulb is drawn separately so it can be coloured) */
export function lampPostGeometry(h = 1.75, arm = 0.42) {
  const parts = [];
  parts.push([lathe([[0.075, 0], [0.07, 0.06], [0.045, 0.1], [0.038, 0.5], [0.03, h], [0.001, h + 0.01]], 10), 0]);
  const curve = new T.CatmullRomCurve3([new T.Vector3(0, h - 0.12, 0), new T.Vector3(0.02, h + 0.06, 0), new T.Vector3(arm * 0.5, h + 0.12, 0), new T.Vector3(arm, h + 0.04, 0)]);
  parts.push([new T.TubeGeometry(curve, 16, 0.018, 6, false), 0]);
  const shade = lathe([[0.001, 0.07], [0.05, 0.065], [0.1, 0.0], [0.09, -0.015]], 14);
  parts.push([at(shade, arm, h - 0.03, 0), 0]);
  parts.push([at(new T.TorusGeometry(0.05, 0.01, 6, 14), 0, 0.12, 0, Math.PI / 2), 0]);
  return merge(parts, 1);
}

/* ───────── district props: smooth versions of the old primitive shapes ───────── */
export function propGeometry(kind) {
  switch (kind) {
    case 'box': return new RoundedBoxGeometry(1, 1, 1, 3, 0.12);
    case 'cyl': { // a barrel with two rims
      const g = lathe([[0.001, -0.5], [0.42, -0.5], [0.46, -0.42], [0.5, 0], [0.46, 0.42], [0.42, 0.5], [0.001, 0.5]], 18);
      g.scale(2, 1, 2); return g;
    }
    case 'cone': { // a soft cypress / topiary
      const g = lathe([[0.001, 0], [0.35, 0.03], [0.5, 0.18], [0.42, 0.55], [0.2, 0.85], [0.001, 1]], 16);
      g.scale(2, 1, 2); g.translate(0, -0.5, 0); return g;
    }
    default: return blob(1, 3, 0.07, 2.3); // a bush
  }
}

/* soft round shadow under cars and people */
export function shadowTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(0,0,0,0.55)'); gr.addColorStop(0.6, 'rgba(0,0,0,0.25)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  return new T.CanvasTexture(c);
}
export { smooth };

/* ───────── town buildings ─────────
   slots: 0 facade (windows texture), 1 roof, 2 trim (cornices, balconies, parapets), 3 warm light (doors, shop windows) */
export const TOWN_SLOTS = 4;
const wallPlane = (w, h, x, y, z, ry) => {
  const g = new T.PlaneGeometry(w, h); const uv = g.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w / 2.2, uv.getY(i) * h / 2.2);
  return at(g, x, y, z, 0, ry, 0);
};
function walls(parts, w, h, d, y0 = 0) {
  parts.push([wallPlane(w, h, 0, y0 + h / 2, d / 2, 0), 0]);
  parts.push([wallPlane(w, h, 0, y0 + h / 2, -d / 2, Math.PI), 0]);
  parts.push([wallPlane(d, h, w / 2, y0 + h / 2, 0, Math.PI / 2), 0]);
  parts.push([wallPlane(d, h, -w / 2, y0 + h / 2, 0, -Math.PI / 2), 0]);
}
const slab = (w, h, d, x, y, z, r = 0.02) => at(new RoundedBoxGeometry(w, h, d, 2, Math.min(r, h / 2.1, w / 2.1, d / 2.1)), x, y, z);
function parapet(parts, w, d, y, t = 0.08, hgt = 0.16) {
  parts.push([slab(w + 0.06, hgt, t, 0, y + hgt / 2, d / 2 - t / 2 + 0.03), 2]);
  parts.push([slab(w + 0.06, hgt, t, 0, y + hgt / 2, -d / 2 + t / 2 - 0.03), 2]);
  parts.push([slab(t, hgt, d, w / 2 - t / 2 + 0.03, y + hgt / 2, 0), 2]);
  parts.push([slab(t, hgt, d, -w / 2 + t / 2 - 0.03, y + hgt / 2, 0), 2]);
  parts.push([at(new T.PlaneGeometry(w, d), 0, y + 0.01, 0, -Math.PI / 2), 1]);
}
function gableRoof(parts, w, d, y, rise) {
  const half = d / 2 + 0.16, len = Math.hypot(half, rise), ang = Math.atan2(rise, half), drop = rise * 0.16 / half;
  [-1, 1].forEach(s => parts.push([at(new RoundedBoxGeometry(w + 0.3, 0.07, len, 2, 0.025), 0, y + rise / 2 - drop, s * half / 2, s * ang), 1]));
  // the triangular gable ends
  const tri = new T.Shape(); tri.moveTo(-d / 2, 0); tri.lineTo(d / 2, 0); tri.lineTo(0, rise - drop - 0.04); tri.closePath();
  [-1, 1].forEach(s => parts.push([at(new T.ShapeGeometry(tri), s * w / 2, y, 0, 0, s * Math.PI / 2), 2]));
  parts.push([at(new T.CylinderGeometry(0.045, 0.045, w + 0.32, 8), 0, y + rise - drop + 0.03, 0, 0, 0, Math.PI / 2), 1]);
}
export function townGeometry(kind) {
  const parts = [];
  if (kind === 'house' || kind === 'house2') {
    const w = kind === 'house' ? 1.7 : 1.9, h = kind === 'house' ? 1.2 : 2.0, d = kind === 'house' ? 1.6 : 1.7;
    parts.push([slab(w + 0.1, 0.12, d + 0.1, 0, 0.06, 0, 0.03), 2]);
    walls(parts, w, h, d);
    if (kind === 'house2') parts.push([slab(w + 0.08, 0.06, d + 0.08, 0, 1.0, 0, 0.02), 2]);
    gableRoof(parts, w, d, h, 0.62);
    parts.push([slab(0.2, 0.55, 0.2, w * 0.28, h + 0.45, -d * 0.18, 0.02), 2]);
    parts.push([at(new T.PlaneGeometry(0.34, 0.56), -w * 0.22, 0.4, d / 2 + 0.016), 3]);
    parts.push([slab(0.55, 0.04, 0.32, -w * 0.22, 0.74, d / 2 + 0.16, 0.015), 2]);
    parts.push([slab(0.5, 0.06, 0.2, -w * 0.22, 0.03, d / 2 + 0.1, 0.02), 2]);
    if (kind === 'house2') { parts.push([slab(w * 0.55, 0.05, 0.32, w * 0.15, 1.05, d / 2 + 0.16, 0.015), 2]); parts.push([slab(w * 0.55, 0.22, 0.03, w * 0.15, 1.18, d / 2 + 0.31, 0.01), 2]); }
    return merge(parts, TOWN_SLOTS);
  }
  if (kind === 'ruko') {
    const w = 2.6, h = 2.3, d = 1.8;
    walls(parts, w, h, d);
    parts.push([at(new T.PlaneGeometry(w * 0.86, 0.72), 0, 0.5, d / 2 + 0.016), 3]);
    for (let k = 0; k < 3; k++) parts.push([slab(0.06, 0.95, 0.06, -w * 0.43 + k * w * 0.43, 0.48, d / 2 + 0.03, 0.01), 2]);
    parts.push([slab(w + 0.06, 0.08, d + 0.06, 0, 1.12, 0, 0.02), 2]);
    parts.push([slab(w * 0.9, 0.04, 0.26, 0, 1.75, d / 2 + 0.13, 0.012), 2]);
    parts.push([slab(w * 0.9, 0.16, 0.025, 0, 1.85, d / 2 + 0.255, 0.008), 2]);
    parapet(parts, w, d, h, 0.08, 0.22);
    parts.push([slab(w * 0.7, 0.3, 0.05, 0, h + 0.33, d / 2 - 0.02, 0.015), 2]);
    return merge(parts, TOWN_SLOTS);
  }
  if (kind === 'apt') {
    const w = 2.1, h = 3.8, d = 2.1;
    parts.push([slab(w + 0.12, 0.16, d + 0.12, 0, 0.08, 0, 0.03), 2]);
    walls(parts, w, h, d);
    for (let y = 0.95; y < h - 0.4; y += 0.95) {
      parts.push([slab(w * 0.62, 0.05, 0.32, 0, y, d / 2 + 0.16, 0.015), 2]);
      parts.push([slab(w * 0.62, 0.2, 0.025, 0, y + 0.12, d / 2 + 0.31, 0.008), 2]);
      parts.push([slab(w + 0.04, 0.035, d + 0.04, 0, y - 0.02, 0, 0.01), 2]);
    }
    parts.push([at(new T.PlaneGeometry(0.5, 0.62), 0, 0.45, d / 2 + 0.016), 3]);
    parapet(parts, w, d, h);
    parts.push([at(new T.CylinderGeometry(0.22, 0.22, 0.42, 14), -w * 0.22, h + 0.38, -d * 0.2), 2]);
    parts.push([slab(0.32, 0.2, 0.26, w * 0.24, h + 0.11, d * 0.18, 0.03), 2]);
    return merge(parts, TOWN_SLOTS);
  }
  // tower
  const w = 1.9, h = 6.4, d = 1.9;
  parts.push([slab(w + 0.14, 0.2, d + 0.14, 0, 0.1, 0, 0.04), 2]);
  walls(parts, w, h, d);
  for (let y = 1.2; y < h - 0.3; y += 1.2) parts.push([slab(w + 0.05, 0.05, d + 0.05, 0, y, 0, 0.012), 2]);
  parts.push([at(new T.PlaneGeometry(0.7, 0.72), 0, 0.52, d / 2 + 0.016), 3]);
  parts.push([slab(1.1, 0.05, 0.45, 0, 0.98, d / 2 + 0.22, 0.015), 2]);
  parapet(parts, w, d, h, 0.1, 0.2);
  walls(parts, w * 0.62, 0.7, d * 0.62, h);
  parts.push([slab(w * 0.66, 0.08, d * 0.66, 0, h + 0.74, 0, 0.02), 2]);
  parts.push([at(new T.CylinderGeometry(0.025, 0.04, 1.1, 6), 0, h + 1.3, 0), 2]);
  return merge(parts, TOWN_SLOTS);
}
/* a sloped shop awning (coloured per instance) */
export function awningGeometry() {
  const g = new RoundedBoxGeometry(1, 0.05, 0.6, 2, 0.02);
  g.translate(0, 0, 0.3); g.rotateX(0.32);
  const v = new T.PlaneGeometry(1, 0.12); v.translate(0, -0.06, 0); at(v, 0, -0.18, 0.57);
  return merge([[g, 0], [v, 0]], 1);
}
/* trim pieces for one building tier: plinth, floor bands and a cornice, merged */
export function tierTrim(w, h, d, base) {
  const parts = [];
  if (base) parts.push([slab(w + 0.14, 0.14, d + 0.14, 0, 0.07, 0, 0.035), 0]);
  for (let y = 1.05; y < h - 0.4; y += 1.05) parts.push([slab(w + 0.05, 0.045, d + 0.05, 0, y, 0, 0.012), 0]);
  parts.push([slab(w + 0.16, 0.09, d + 0.16, 0, h - 0.02, 0, 0.03), 0]);
  return merge(parts, 1);
}
/* a lit entrance: a door and a small canopy (slot 0 light, slot 1 trim) */
export function entranceGeometry(wd = 0.5) {
  return merge([[at(new T.PlaneGeometry(wd, 0.62), 0, 0.33, 0.02), 0], [slab(wd + 0.36, 0.05, 0.36, 0, 0.72, 0.18, 0.015), 1], [slab(wd + 0.2, 0.06, 0.24, 0, 0.03, 0.12, 0.02), 1]], 2);
}
