/* Realistic people built from Quaternius "Universal Base Characters" + "Universal Animation Library" (CC0).
   - one rigged body per body type (male / female), tinted to the chosen skin tone
   - height (cm) scales the whole body evenly; weight (kg) moves fat onto the belly, hips, chest and limbs
   - real hairstyles, rebound to the body's skeleton, plus styles reshaped from them (bob, ponytail, curls, …)
   - clothes are shells grown out of the body mesh itself (by bone region), so they bend with every animation;
     the fabric then falls from the widest point (chest, thigh, shoulder) instead of hugging the skin
   - shoes get a real sole; hijab, skirt, glasses, cap and backpack are added on top
   - idle / walk / jog / sprint / talk animations blended by speed
   loadPeople() → Promise of the shared assets; buildPerson(A, look) → { root, animate(dt, speed), wave(), dispose() } */
import * as T from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as SU from 'three/addons/utils/SkeletonUtils.js';
import { mergeBufferGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const BASE = new URL('../assets/3d/people/', import.meta.url).href;
const FABRIC = new URL('../assets/textures/fabric/', import.meta.url).href;
const FILES = ['male', 'female', 'anims', 'hair-simpleparted', 'hair-buzzed', 'hair-buzzedfemale', 'hair-long', 'hair-buns', 'hair-beard'];
const SKIN_AVG = [167 / 255, 116 / 255, 81 / 255];
const HAIR_AVG = 0.56;
const NATIVE = { male: 1.81, female: 1.77 };

let cache = null;
export function loadPeople() {
  if (cache) return cache;
  const L = new GLTFLoader();
  cache = Promise.all(FILES.map(n => L.loadAsync(BASE + n + '.glb'))).then(list => {
    const A = {};
    FILES.forEach((n, i) => { A[n] = list[i]; });
    list.forEach(g => g.scene.traverse(o => {
      if (!o.isMesh) return;
      // the textures are tinted with colours we treat as-is, so read them without sRGB decoding
      const m = o.material; if (m.map) { m.map.encoding = T.LinearEncoding; m.map.needsUpdate = true; }
      m.side = T.FrontSide;
    }));
    A.meta = { male: analyse(A.male), female: analyse(A.female) };
    A.shells = new Map(); A.shapes = new Map(); A.hairs = new Map();
    return A;
  });
  return cache;
}

/* ───────── body analysis: which part of the body each vertex belongs to ───────── */
const comp = (a, i, k) => k === 0 ? a.getX(i) : k === 1 ? a.getY(i) : k === 2 ? a.getZ(i) : a.getW(i);
const REG = { head: 0, neck: 1, chest: 2, waist: 3, pelvis: 4, upperarm: 5, lowerarm: 6, hand: 7, thigh: 8, calf: 9, foot: 10 };
/* how much fat each bone's skin takes on as weight goes up */
const BONE_FAT = { pelvis: 1, spine_01: 1.1, spine_02: 0.8, spine_03: 0.45, neck_01: 0.6, Head: 0.25, clavicle: 0.3, upperarm: 0.7, lowerarm: 0.3, hand: 0.06, thigh: 0.85, calf: 0.35 };
const TORSO = /^(pelvis|spine_0[123])$/;
function analyse(gltf) {
  const scene = gltf.scene; scene.updateMatrixWorld(true);
  let body = null, eyes = null;
  scene.traverse(o => { if (o.isSkinnedMesh) { if (/Superhero/.test(o.material.name)) body = o; else if (/Eye/.test(o.material.name)) eyes = o; } });
  const bones = {}; body.skeleton.bones.forEach(b => { bones[b.name] = b; });
  const bp = n => new T.Vector3().setFromMatrixPosition(bones[n].matrixWorld);
  const g = body.geometry, pos = g.attributes.position, si = g.attributes.skinIndex, sw = g.attributes.skinWeight;
  const n = pos.count, region = new Uint8Array(n), t = new Float32Array(n), side = new Int8Array(n), world = new Float32Array(n * 3);
  const fatW = new Float32Array(n), torsoW = new Float32Array(n);
  const v = new T.Vector3(), seg = (a, b, p) => { const ab = new T.Vector3().subVectors(b, a); return Math.max(0, Math.min(1, new T.Vector3().subVectors(p, a).dot(ab) / ab.lengthSq())); };
  const J = { pelvis: bp('pelvis'), neck: bp('neck_01'), head: bp('Head') };
  ['l', 'r'].forEach(s => { J['sh' + s] = bp('upperarm_' + s); J['el' + s] = bp('lowerarm_' + s); J['wr' + s] = bp('hand_' + s); J['hip' + s] = bp('thigh_' + s); J['kn' + s] = bp('calf_' + s); J['an' + s] = bp('foot_' + s); J['ball' + s] = bp('ball_' + s); });
  const boneFat = body.skeleton.bones.map(b => BONE_FAT[b.name.replace(/_[lr]$/, '')] || 0);
  const boneTorso = body.skeleton.bones.map(b => TORSO.test(b.name) ? 1 : 0);
  for (let i = 0; i < n; i++) {
    let best = 0, bi = 0;
    for (let k = 0; k < 4; k++) {
      const w = comp(sw, i, k), b = comp(si, i, k);
      fatW[i] += w * boneFat[b]; torsoW[i] += w * boneTorso[b];
      if (w > best) { best = w; bi = b; }
    }
    const name = body.skeleton.bones[bi].name;
    v.fromBufferAttribute(pos, i).applyMatrix4(body.bindMatrix); world.set([v.x, v.y, v.z], i * 3);
    const s = /_l$/.test(name) ? 'l' : 'r'; side[i] = s === 'l' ? 1 : -1;
    let r = REG.head, tt = 0;
    if (/^Head/.test(name)) r = REG.head;
    else if (/^neck/.test(name)) r = REG.neck;
    else if (/^(spine_0[23]|clavicle)/.test(name)) r = REG.chest;
    else if (/^spine_01/.test(name)) r = REG.waist;
    else if (/^(pelvis|root)/.test(name)) { r = REG.pelvis; tt = v.y - J.pelvis.y; }
    else if (/^upperarm/.test(name)) { r = REG.upperarm; tt = seg(J['sh' + s], J['el' + s], v); }
    else if (/^lowerarm/.test(name)) { r = REG.lowerarm; tt = seg(J['el' + s], J['wr' + s], v); }
    else if (/^(hand|index|middle|ring|pinky|thumb)/.test(name)) r = REG.hand;
    else if (/^thigh/.test(name)) { r = REG.thigh; tt = seg(J['hip' + s], J['kn' + s], v); }
    else if (/^calf/.test(name)) { r = REG.calf; tt = seg(J['kn' + s], J['an' + s], v); }
    else if (/^(foot|ball)/.test(name)) r = REG.foot;
    region[i] = r; t[i] = tt;
    // on the head only the jaw and cheeks get rounder
    if (r === REG.head || r === REG.neck) fatW[i] *= Math.max(0, Math.min(1, (J.head.y + 0.07 - v.y) / 0.07));
  }
  // the face: head vertices in front of the head bone (left open by the hijab)
  const face = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    if (region[i] !== REG.head) continue;
    const x = world[i * 3] - J.head.x, y = world[i * 3 + 1] - J.head.y, z = world[i * 3 + 2] - J.head.z;
    const ex = x / 0.066, ey = (y - 0.045) / 0.088;
    face[i] = z > 0.035 && ex * ex + ey * ey < 1 ? 1 : 0;
  }
  // measurements for accessories
  const headBox = new T.Box3(), hipBox = new T.Box3(), chestBox = new T.Box3();
  for (let i = 0; i < n; i++) {
    v.set(world[i * 3], world[i * 3 + 1], world[i * 3 + 2]);
    if (region[i] === REG.head) headBox.expandByPoint(v);
    if (region[i] === REG.pelvis) hipBox.expandByPoint(v);
    if (region[i] === REG.chest) chestBox.expandByPoint(v);
  }
  let eyeBox = new T.Box3();
  if (eyes) { const ep = eyes.geometry.attributes.position; for (let i = 0; i < ep.count; i++) eyeBox.expandByPoint(v.fromBufferAttribute(ep, i).applyMatrix4(eyes.bindMatrix)); }
  const weld = new Uint32Array(n), keyOf = new Map();
  for (let i = 0; i < n; i++) { const k = Math.round(pos.getX(i) * 2e4) + ',' + Math.round(pos.getY(i) * 2e4) + ',' + Math.round(pos.getZ(i) * 2e4); if (!keyOf.has(k)) keyOf.set(k, i); weld[i] = keyOf.get(k); }
  const boneIndex = {}; body.skeleton.bones.forEach((b, i) => { boneIndex[b.name] = i; });
  return { region, t, side, face, world, J, headBox, hipBox, chestBox, eyeBox, weld, fatW, torsoW, boneIndex };
}

/* smooth normals that ignore UV seams (vertices at the same spot share one normal) */
function weldNormals(p, idx, weld, fallback) {
  const n = p.length / 3, acc = new Float32Array(n * 3), out = fallback ? Float32Array.from(fallback) : new Float32Array(n * 3);
  for (let k = 0; k < idx.length; k += 3) {
    const a = idx[k], b = idx[k + 1], c = idx[k + 2];
    const ux = p[b * 3] - p[a * 3], uy = p[b * 3 + 1] - p[a * 3 + 1], uz = p[b * 3 + 2] - p[a * 3 + 2];
    const vx = p[c * 3] - p[a * 3], vy = p[c * 3 + 1] - p[a * 3 + 1], vz = p[c * 3 + 2] - p[a * 3 + 2];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    [a, b, c].forEach(i => { const w = weld[i] * 3; acc[w] += nx; acc[w + 1] += ny; acc[w + 2] += nz; });
  }
  const used = new Uint8Array(n); for (let k = 0; k < idx.length; k++) used[idx[k]] = 1;
  for (let i = 0; i < n; i++) {
    if (!used[i]) continue;
    const w = weld[i] * 3, l = Math.hypot(acc[w], acc[w + 1], acc[w + 2]) || 1;
    out[i * 3] = acc[w] / l; out[i * 3 + 1] = acc[w + 1] / l; out[i * 3 + 2] = acc[w + 2] / l;
  }
  return out;
}

/* ───────── body shape from weight ─────────
   f = 0 is an average build (BMI ≈ 22), negative is lean, 1 is clearly overweight (BMI ≈ 32) */
export function shapeOf(look) {
  const m = (look.height || 170) / 100, bmi = (look.weight || 22 * m * m) / (m * m);
  return Math.round(Math.max(-0.5, Math.min(1.6, (bmi - 22) / 10)) * 10) / 10;
}
const gauss = (u, s) => Math.exp(-(u * u) / (2 * s * s));
function bodyShape(A, key, f) {
  const id = key + f;
  if (A.shapes.has(id)) return A.shapes.get(id);
  const M = A.meta[key], src = bodyMesh(A[key].scene).geometry, P = src.attributes.position, N = src.attributes.normal, n = P.count, J = M.J;
  const fem = key === 'female', pos = new Float32Array(n * 3);
  const yBelly = J.pelvis.y + (fem ? 0.12 : 0.16), yButt = J.pelvis.y - 0.05, yHips = J.pelvis.y + 0.08, yChest = J.neck.y - (fem ? 0.17 : 0.2);
  for (let i = 0; i < n; i++) {
    const x = P.getX(i), y = P.getY(i), z = P.getZ(i);
    let nx = N.getX(i), ny = N.getY(i), nz = N.getZ(i), d;
    if (f > 0) {
      const k = M.fatW[i], tw = M.torsoW[i];
      const belly = tw * gauss(y - yBelly, 0.11) * gauss(x, 0.16) * Math.max(0, nz) ** 2;
      const butt = gauss(y - yButt, 0.09) * Math.max(0, -nz) ** 2 * (fem ? 1.4 : 1);
      const hips = gauss(y - yHips, 0.12) * nx * nx * (fem ? 1.5 : 1) * Math.min(1, tw + M.fatW[i]);
      const chest = tw * gauss(y - yChest, 0.07) * Math.max(0, nz) ** 2 * gauss(Math.abs(x) - 0.09, 0.07);
      d = f * (0.024 * k * (0.75 + 0.25 * nz) + (fem ? 0.05 : 0.075) * belly + 0.03 * butt + 0.022 * hips + (fem ? 0.02 : 0.014) * chest);
      ny -= belly * 0.35; // a full belly sags a little
      const l = Math.hypot(nx, ny, nz) || 1; nx /= l; ny /= l; nz /= l;
    } else d = f * 0.03 * M.fatW[i];
    pos[i * 3] = x + nx * d; pos[i * 3 + 1] = y + ny * d; pos[i * 3 + 2] = z + nz * d;
  }
  // (read through getX: the source normals may be stored quantized)
  const base = new Float32Array(n * 3); for (let i = 0; i < n; i++) { base[i * 3] = N.getX(i); base[i * 3 + 1] = N.getY(i); base[i * 3 + 2] = N.getZ(i); }
  const nor = f ? weldNormals(pos, src.index.array, M.weld, base) : base;
  const res = { pos, nor, posA: new T.BufferAttribute(pos, 3), norA: new T.BufferAttribute(nor, 3) };
  A.shapes.set(id, res);
  return res;
}

/* ───────── clothes: which body vertices a garment covers ───────── */
const LONG_TOPS = { hoodie: 1, jacket: 1, sweater: 1, shirt: 0.62 };
function covers(kind, look, M, i) {
  const r = M.region[i], t = M.t[i];
  switch (kind) {
    case 'top': {
      const sleeve = LONG_TOPS[look.top] || 0;
      if (r === REG.chest || r === REG.waist) return true;
      if (r === REG.neck) return look.top === 'hoodie' || look.top === 'sweater' ? t >= 0 && M.world[i * 3 + 1] < M.J.neck.y + 0.015 : false;
      if (r === REG.pelvis) return t > 0.035;
      if (r === REG.upperarm) return sleeve > 0 || t < 0.5;
      if (r === REG.lowerarm) return sleeve >= 1 ? t < 0.93 : sleeve > 0 ? t < sleeve - 0.25 : false;
      return false;
    }
    case 'bottom': {
      const b = look.bottom;
      if (r === REG.pelvis) return true;
      if (r === REG.waist) return M.world[i * 3 + 1] < M.J.pelvis.y + 0.11;
      if (r === REG.thigh) return b === 'shorts' ? t < 0.62 : b === 'skirt' ? t < 0.2 : true;
      if (r === REG.calf) return b !== 'shorts' && b !== 'skirt' && t < 0.95;
      return false;
    }
    case 'shoes': return look.shoes === 'sandals' ? false : r === REG.foot || (r === REG.calf && t > (look.shoes === 'boots' ? 0.62 : 0.9));
    case 'sole': return look.shoes === 'sandals' && r === REG.foot && M.world[i * 3 + 1] < 0.03;
    case 'hijab': { const ax = Math.min(1, Math.abs(M.world[i * 3]) / 0.2); return (r === REG.head && !M.face[i]) || r === REG.neck || (r === REG.chest && M.world[i * 3 + 1] > M.J.neck.y - 0.24 + 0.16 * ax * ax); }
    default: return false;
  }
}
const OFFSET = { bottom: 0.012, top: 0.014, thickTop: 0.024, shoes: 0.016, sole: 0.006, hijab: 0.034 };

/* how each garment hangs: from where along the limb it starts falling (u0), how much of the gap it fills,
   how fast it may narrow going down (per metre), and an optional tighter cuff at the end */
const DRAPE = {
  tshirt: { torso: [0.8, 0.12], sleeve: [0, 0.75, -0.05] },
  hoodie: { torso: [0.9, 0.1, 0.9], sleeve: [0.05, 0.65, 0.08, 0.88] },
  sweater: { torso: [0.75, 0.12, 0.92], sleeve: [0.05, 0.6, 0.1, 0.9] },
  shirt: { torso: [0.7, 0.14], sleeve: [0.02, 0.6, 0.06] },
  batik: { torso: [0.8, 0.12], sleeve: [0, 0.75, -0.05] },
  jacket: { torso: [0.85, 0.06], sleeve: [0.05, 0.6, 0.06, 0.92] },
  jeans: [0.4, 0.55, 0.07], chinos: [0.4, 0.7, 0.05], joggers: [0.35, 0.8, 0.04, 0.88], shorts: [0.22, 0.7, 0]
};
/* fabric falls from the widest point instead of following the body back in: around an axis a→b,
   per angle the radius going down never shrinks faster than `slope`, and the gap is filled by `amount` */
function hang(out, list, a, b, u0, amount, slope, cuff, sideK) {
  if (!list.length) return;
  const d = new T.Vector3().subVectors(b, a), L = d.length(); d.divideScalar(L);
  const ref = Math.abs(d.x) < 0.9 ? new T.Vector3(1, 0, 0) : new T.Vector3(0, 0, 1);
  const e1 = ref.sub(d.clone().multiplyScalar(ref.dot(d))).normalize(), e2 = new T.Vector3().crossVectors(d, e1);
  const nT = 24, nU = 40, R = new Float32Array(nT * nU), info = [];
  list.forEach(i => {
    const rx = out[i * 3] - a.x, ry = out[i * 3 + 1] - a.y, rz = out[i * 3 + 2] - a.z;
    const u = (rx * d.x + ry * d.y + rz * d.z) / L, px = rx * e1.x + ry * e1.y + rz * e1.z, py = rx * e2.x + ry * e2.y + rz * e2.z;
    const r = Math.hypot(px, py), th = Math.atan2(py, px);
    const ti = Math.floor((th + Math.PI) / (Math.PI * 2) * nT) % nT, ui = Math.max(0, Math.min(nU - 1, Math.floor(u * nU)));
    R[ti * nU + ui] = Math.max(R[ti * nU + ui], r);
    info.push([i, u, px, py, r, th]);
  });
  const H = new Float32Array(nT * nU), step = slope * L / nU, start = Math.max(0, Math.floor(u0 * nU));
  for (let ti = 0; ti < nT; ti++) {
    let run = 0;
    for (let ui = 0; ui < nU; ui++) {
      const r = Math.max(R[ti * nU + ui], (R[((ti + 1) % nT) * nU + ui] + R[((ti + nT - 1) % nT) * nU + ui]) * 0.48);
      run = ui < start ? r : Math.max(r, run - step);
      H[ti * nU + ui] = run;
    }
  }
  info.forEach(([i, u, px, py, r, th]) => {
    if (u <= u0 || r < 1e-5) return;
    const ft = (th + Math.PI) / (Math.PI * 2) * nT - 0.5, t0 = (Math.floor(ft) + nT) % nT, t1 = (t0 + 1) % nT, ft0 = ft - Math.floor(ft);
    const ui = Math.max(0, Math.min(nU - 1, Math.floor(u * nU)));
    const target = H[t0 * nU + ui] * (1 - ft0) + H[t1 * nU + ui] * ft0;
    let k = amount * Math.min(1, (u - u0) / 0.08);
    if (sideK) k *= sideK + (1 - sideK) * Math.abs(py / r);
    if (cuff && u > cuff) k *= Math.max(0, 1 - (u - cuff) / (1 - cuff) * 1.4);
    if (target <= r) return;
    const nr = r + (target - r) * k, s = nr / r;
    out[i * 3] = a.x + d.x * u * L + (e1.x * px + e2.x * py) * s;
    out[i * 3 + 1] = a.y + d.y * u * L + (e1.y * px + e2.y * py) * s;
    out[i * 3 + 2] = a.z + d.z * u * L + (e1.z * px + e2.z * py) * s;
  });
}

/* a garment shell: the covered triangles, pushed out along the normals, skinned to the same bones */
function shellGeometry(A, key, kind, look, offset, f) {
  const id = [key, kind, look.top, look.bottom, look.shoes, offset, f].join('|');
  if (A.shells.has(id)) return A.shells.get(id);
  const M = A.meta[key], src = bodyMesh(A[key].scene).geometry, n = src.attributes.position.count, J = M.J;
  const shape = bodyShape(A, key, f), p = shape.pos, nr = shape.nor;
  const on = new Uint8Array(n); for (let i = 0; i < n; i++) on[i] = covers(kind, look, M, i) ? 1 : 0;
  const idx = [], si = src.index.array;
  for (let k = 0; k < si.length; k += 3) if (on[si[k]] && on[si[k + 1]] && on[si[k + 2]]) idx.push(si[k], si[k + 1], si[k + 2]);
  const out = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    let o = offset;
    if (kind === 'hijab' && M.region[i] === REG.chest) o += 0.012;
    if (kind === 'shoes' && M.region[i] === REG.calf) o += 0.004;
    out[i * 3] = p[i * 3] + nr[i * 3] * o; out[i * 3 + 1] = p[i * 3 + 1] + nr[i * 3 + 1] * o; out[i * 3 + 2] = p[i * 3 + 2] + nr[i * 3 + 2] * o;
  }
  smoothShell(out, idx, M.weld, kind === 'shoes' ? 5 : kind === 'sole' ? 2 : kind === 'hijab' ? 10 : 7);
  const verts = Array.from(new Set(idx)), pick = test => verts.filter(test);
  if (kind === 'top' && DRAPE[look.top]) {
    const D = DRAPE[look.top], cb = M.chestBox, zc = (cb.min.z + cb.max.z) / 2;
    const a = new T.Vector3(0, J.neck.y, zc), b = new T.Vector3(0, J.pelvis.y - 0.12, zc), L = a.y - b.y;
    const armpit = (J.neck.y - J.shl.y + 0.13) / L;
    hang(out, pick(i => M.region[i] <= REG.pelvis && M.region[i] >= REG.chest), a, b, armpit, D.torso[0], D.torso[1], D.torso[2], 0.45);
    ['l', 'r'].forEach(s => hang(out, pick(i => (M.region[i] === REG.upperarm || M.region[i] === REG.lowerarm) && M.side[i] === (s === 'l' ? 1 : -1)), J['sh' + s], J['wr' + s], D.sleeve[0], D.sleeve[1], D.sleeve[2], D.sleeve[3]));
  }
  if (kind === 'bottom' && DRAPE[look.bottom]) {
    const D = DRAPE[look.bottom];
    ['l', 'r'].forEach(s => hang(out, pick(i => (M.region[i] === REG.thigh || M.region[i] === REG.calf) && M.side[i] === (s === 'l' ? 1 : -1)), J['hip' + s], J['an' + s], D[0], D[1], D[2], D[3]));
  }
  if (kind === 'shoes') {
    // a rounder toe box: the front of the foot is pushed forward and up a little
    verts.forEach(i => {
      if (M.region[i] !== REG.foot) return;
      const s = M.side[i] > 0 ? 'l' : 'r', ahead = out[i * 3 + 2] - J['ball' + s].z;
      if (ahead > 0) { out[i * 3 + 2] += Math.min(1, ahead / 0.05) * 0.014; out[i * 3 + 1] += Math.min(1, ahead / 0.05) * 0.004; }
    });
  }
  if (kind !== 'shoes' && kind !== 'sole') smoothShell(out, idx, M.weld, 2);
  const g = new T.BufferGeometry();
  g.setAttribute('position', new T.BufferAttribute(out, 3));
  g.setAttribute('normal', new T.BufferAttribute(weldNormals(out, idx, M.weld, nr), 3));
  ['uv', 'skinIndex', 'skinWeight'].forEach(a => g.setAttribute(a, src.attributes[a]));
  g.setIndex(idx);
  const res = { g, on };
  A.shells.set(id, res);
  return res;
}
/* Laplacian smoothing over the shell: irons out muscles so clothes read as fabric.
   weld[i] is a shared id for vertices at the same spot (split by UV seams), so seams stay closed. */
function smoothShell(out, idx, weld, iterations) {
  const groups = new Map();
  for (let k = 0; k < idx.length; k++) { const i = idx[k], w = weld[i]; if (!groups.has(w)) groups.set(w, { verts: [], nb: new Set(), p: [0, 0, 0] }); }
  for (let k = 0; k < idx.length; k += 3) {
    const a = weld[idx[k]], b = weld[idx[k + 1]], c = weld[idx[k + 2]];
    groups.get(a).nb.add(b).add(c); groups.get(b).nb.add(a).add(c); groups.get(c).nb.add(a).add(b);
  }
  const seen = new Set();
  for (let k = 0; k < idx.length; k++) { const i = idx[k]; if (seen.has(i)) continue; seen.add(i); groups.get(weld[i]).verts.push(i); }
  groups.forEach(gr => { const i = gr.verts[0]; gr.p = [out[i * 3], out[i * 3 + 1], out[i * 3 + 2]]; gr.nbl = Array.from(gr.nb); });
  const list = Array.from(groups.values());
  for (let it = 0; it < iterations; it++) {
    const next = list.map(gr => {
      let x = 0, y = 0, z = 0; gr.nbl.forEach(w => { const q = groups.get(w).p; x += q[0]; y += q[1]; z += q[2]; });
      const n = gr.nbl.length || 1, k = 0.5;
      return [gr.p[0] + (x / n - gr.p[0]) * k, gr.p[1] + (y / n - gr.p[1]) * k, gr.p[2] + (z / n - gr.p[2]) * k];
    });
    list.forEach((gr, j) => { gr.p = next[j]; });
  }
  list.forEach(gr => gr.verts.forEach(i => { out[i * 3] = gr.p[0]; out[i * 3 + 1] = gr.p[1]; out[i * 3 + 2] = gr.p[2]; }));
}
const bodyMesh = scene => { let b = null; scene.traverse(o => { if (o.isSkinnedMesh && /Superhero/.test(o.material.name)) b = o; }); return b; };

/* a shoe sole: the outline of the foot grown a little and extruded,
   skinned to the foot bone at the heel and the ball bone at the toes so it bends when walking */
function soleGeometry(A, key, f, side, thick, grow) {
  const id = ['sole', key, f, side, thick, grow].join('|');
  if (A.shells.has(id)) return A.shells.get(id);
  const M = A.meta[key], p = bodyShape(A, key, f).pos, sd = side === 'l' ? 1 : -1, pts = [];
  for (let i = 0; i < M.region.length; i++) if (M.region[i] === REG.foot && M.side[i] === sd && p[i * 3 + 1] < 0.07) pts.push([p[i * 3], p[i * 3 + 2]]);
  const cx = pts.reduce((s, q) => s + q[0], 0) / pts.length, cz = pts.reduce((s, q) => s + q[1], 0) / pts.length, N = 40, ring = [];
  // the outline: for each direction the furthest foot point (a support function), smoothed
  for (let k = 0; k < N; k++) {
    const a = k / N * Math.PI * 2, dx = Math.cos(a), dz = Math.sin(a);
    let best = 0; pts.forEach(q => { const along = (q[0] - cx) * dx + (q[1] - cz) * dz; if (along > best) best = along; });
    ring.push([dx, dz, best]);
  }
  const sm = ring.map((r, k) => [r[0], r[1], (ring[(k + N - 1) % N][2] + r[2] * 2 + ring[(k + 1) % N][2]) / 4 + grow]);
  const y0 = -0.012 - thick * 0.35, y1 = y0 + thick, pos = [], tri = [];
  const layers = [[0.9, y0], [1, y0 + thick * 0.35], [0.97, y1]];
  sm.forEach(r => layers.forEach(([k, y]) => pos.push(cx + r[0] * r[2] * k, y, cz + r[1] * r[2] * k)));
  const at = (k, l) => (k % N) * 3 + l;
  // angles grow from +x towards +z, so (k, k+1, up) faces outward when wound this way
  for (let k = 0; k < N; k++) for (let l = 0; l < 2; l++) tri.push(at(k, l), at(k, l + 1), at(k + 1, l + 1), at(k, l), at(k + 1, l + 1), at(k + 1, l));
  const cb = pos.length / 3; pos.push(cx, y0, cz); const ct = pos.length / 3; pos.push(cx, y1, cz);
  for (let k = 0; k < N; k++) { tri.push(cb, at(k, 0), at(k + 1, 0)); tri.push(ct, at(k + 1, 2), at(k, 2)); }
  const g = new T.BufferGeometry().setAttribute('position', new T.Float32BufferAttribute(pos, 3)).setIndex(tri);
  g.computeVertexNormals();
  const nv = pos.length / 3, sIdx = new Uint16Array(nv * 4), sW = new Float32Array(nv * 4), bz = M.J['ball' + side].z;
  for (let i = 0; i < nv; i++) {
    const k = Math.max(0, Math.min(1, (pos[i * 3 + 2] - bz + 0.02) / 0.04));
    sIdx[i * 4] = M.boneIndex['foot_' + side]; sIdx[i * 4 + 1] = M.boneIndex['ball_' + side]; sW[i * 4] = 1 - k; sW[i * 4 + 1] = k;
  }
  g.setAttribute('skinIndex', new T.BufferAttribute(sIdx, 4)); g.setAttribute('skinWeight', new T.BufferAttribute(sW, 4));
  A.shells.set(id, g);
  return g;
}

/* ───────── hairstyles ─────────
   five real hair meshes (base); some reshaped around the head (mode), some with extra pieces
   modelled here (piece): ponytail, braid, bun, mohawk, curls */
const HAIR_STYLES = {
  short: { base: 'hair-simpleparted' }, buzz: { base: 'hair-buzzed' }, slick: { base: 'hair-buzzed', extra: 'hair-simpleparted', mode: 'slick' },
  undercut: { base: 'hair-buzzed', extra: 'hair-simpleparted', mode: 'undercut' }, quiff: { base: 'hair-simpleparted', mode: 'quiff' },
  curly: { base: 'hair-buzzed', mode: 'curls', piece: 'curls' }, afro: { base: 'hair-buzzed', mode: 'afro', piece: 'afro' }, mohawk: { base: 'hair-buzzed', mode: 'shave', piece: 'mohawk' },
  manbun: { base: 'hair-buzzed', extra: 'hair-simpleparted', mode: 'slick', piece: 'manbun' }, long: { base: 'hair-long' },
  bob: { base: 'hair-long', mode: 'bob' }, ponytail: { base: 'hair-buzzedfemale', mode: 'fluff', piece: 'ponytail' }, bun: { base: 'hair-buns' },
  topknot: { base: 'hair-buzzedfemale', mode: 'fluff', piece: 'topknot' }, wavy: { base: 'hair-long', mode: 'wavy' },
  braid: { base: 'hair-buzzedfemale', mode: 'fluff', piece: 'braid' }, pixie: { base: 'hair-buzzedfemale', mode: 'pixie' }, curls: { base: 'hair-long', mode: 'curlslong' }
};
export const HAIR_FOR = {
  male: ['short', 'buzz', 'slick', 'undercut', 'quiff', 'curly', 'afro', 'mohawk', 'manbun', 'long', 'bald'],
  female: ['long', 'bob', 'ponytail', 'bun', 'topknot', 'wavy', 'braid', 'pixie', 'curls', 'afro', 'hijab', 'bald']
};
const noise3 = (x, y, z, f) => Math.sin(x * f + Math.sin(y * f * 1.3)) * Math.sin(y * f * 1.1 + Math.sin(z * f)) * Math.sin(z * f * 0.9 + x * f * 0.7);
const headFrame = M => { const hb = M.headBox; return { hb, c: hb.getCenter(new T.Vector3()), hs: hb.getSize(new T.Vector3()), top: hb.max.y }; };
/* reshaping one of the real hair meshes */
function hairGeometry(A, key, file, mode, src) {
  if (!mode) return src;
  const id = [key, file, mode, src.uuid].join('|');
  if (A.hairs.has(id)) return A.hairs.get(id);
  const { hb, c, hs, top } = headFrame(A.meta[key]);
  const g = src.clone(), P = g.attributes.position, n = P.count, v = new T.Vector3();
  const mouth = hb.min.y + 0.05;
  for (let i = 0; i < n; i++) {
    v.fromBufferAttribute(P, i);
    const dx = v.x - c.x, dy = v.y - c.y, dz = v.z - c.z;
    if (mode === 'undercut') {
      // the long top only; sides and back sink into the skull, so the buzzed base shows there
      const side = Math.max(0, Math.min(1, (top - 0.06 - v.y) / 0.03)) * Math.min(1, (Math.abs(dx) + Math.max(0, -dz)) / 0.06);
      v.set(c.x + dx * (1 - 0.14 * side), v.y - 0.01 * side, c.z + dz * (1 - 0.14 * side));
    } else if (mode === 'quiff') {
      const front = Math.max(0, Math.min(1, (dz + 0.01) / (hs.z * 0.45))) * Math.max(0, (v.y - (top - 0.1)) / 0.1);
      v.y += front * 0.05; v.z += front * 0.025;
    } else if (mode === 'slick') {
      // combed back flat
      const up = Math.max(0, dy) / (hs.y / 2);
      v.set(c.x + dx * 0.99, c.y + dy * (1 - 0.035 * up), c.z + dz * 0.99 - 0.01 * up);
    } else if (mode === 'shave') {
      v.set(c.x + dx * 0.985, v.y, c.z + dz * 0.985);
    } else if (mode === 'fluff') {
      const up = Math.max(0, dy) / hs.y; v.set(c.x + dx * (1 + 0.04 * up), c.y + dy * (1 + 0.05 * up), c.z + dz * (1 + 0.03 * up));
    } else if (mode === 'bob') {
      // cut level with the mouth, the ends curving in under the jaw
      if (v.y < mouth + 0.05) { const k = Math.min(1, (mouth + 0.05 - v.y) / 0.22); v.y = mouth + 0.05 - k * 0.07; const w = 1 + 0.14 * Math.sin(k * Math.PI * 0.9); v.x = c.x + dx * w; v.z = c.z + dz * w; }
    } else if (mode === 'curls' || mode === 'afro') {
      // the buzz cap blown up into curls: little at the hairline, most on top and at the back
      const afro = mode === 'afro', up = Math.max(0, Math.min(1, (v.y - (c.y - 0.03)) / (top - c.y + 0.03)));
      const k = 1 + (afro ? 0.42 : 0.16) * (0.25 + 0.75 * up) * (dz < 0 ? 1.1 : 1) + noise3(v.x, v.y, v.z, afro ? 70 : 110) * (afro ? 0.07 : 0.05);
      v.set(c.x + dx * k, c.y + dy * k + (afro ? 0.03 : 0.008) * up, c.z + dz * k);
    } else if (mode === 'curlslong') {
      const below = Math.max(0, c.y + 0.04 - v.y) / 0.25, up = Math.max(0, dy) / hs.y, k = 1 + 0.08 * up + 0.3 * below + noise3(v.x, v.y, v.z, 90) * 0.06 * (0.4 + below);
      v.x = c.x + dx * k + Math.sin(v.y * 110) * 0.012 * below; v.z = c.z + dz * k + Math.cos(v.y * 110) * 0.012 * below; v.y += 0.006 * up;
    } else if (mode === 'pixie') {
      const up = Math.max(0, dy) / hs.y, k = 1 + 0.22 * up + noise3(v.x, v.y, v.z, 150) * 0.035;
      v.set(c.x + dx * k, c.y + dy * (k + 0.08 * up), c.z + dz * k + (dz > 0 && dy > 0 ? 0.035 * up : 0));
    } else if (mode === 'wavy') {
      const below = Math.max(0, c.y + 0.03 - v.y) / 0.25, k = 1 + 0.22 * below;
      v.x = c.x + dx * k + Math.sin(v.y * 55) * 0.022 * below; v.z = c.z + dz * k + Math.cos(v.y * 55) * 0.016 * below;
    }
    P.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  A.hairs.set(id, g);
  return g;
}
/* strand textures for the modelled pieces: streaks along u (tubes) or v (buns, spikes) */
const strandCache = {};
function strands(kind) {
  if (strandCache[kind]) return strandCache[kind];
  const c = document.createElement('canvas'); c.width = 128; c.height = 128;
  const g = c.getContext('2d'), img = g.createImageData(128, 128), d = img.data, rows = [];
  for (let k = 0; k < 128; k++) rows.push(0.42 + Math.random() * 0.28);
  for (let y = 0; y < 128; y++) for (let x = 0; x < 128; x++) {
    let v;
    v = rows[kind === 'u' ? y : x] + (Math.random() - 0.5) * 0.05;
    const i = (y * 128 + x) * 4; d[i] = d[i + 1] = d[i + 2] = Math.max(0, Math.min(255, v * 255)); d[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  const t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping;
  if (kind === 'u') t.repeat.set(1, 2); else t.repeat.set(3, 1);
  return (strandCache[kind] = t);
}
/* a tube along a curve with a radius profile (ponytail, braid) */
function tube(points, radius, segs, wobble) {
  const curve = new T.CatmullRomCurve3(points), g = new T.TubeGeometry(curve, segs, 1, 10, false), P = g.attributes.position, p = new T.Vector3();
  for (let i = 0; i <= segs; i++) {
    const t = i / segs, ctr = curve.getPointAt(t), r = radius(t);
    for (let j = 0; j <= 10; j++) { const k = i * 11 + j; p.fromBufferAttribute(P, k).sub(ctr).multiplyScalar(r).add(ctr); if (wobble) p.x += wobble(t); P.setXYZ(k, p.x, p.y, p.z); }
  }
  g.computeVertexNormals();
  return g;
}
const pointsOn = (c, list) => list.map(q => new T.Vector3(c.x + q[0], c.y + q[1], c.z + q[2]));
function hairPiece(A, key, kind) {
  const id = key + kind;
  if (A.hairs.has(id)) return A.hairs.get(id);
  const M = A.meta[key], { c, hs, top } = headFrame(M), BI = M.boneIndex;
  let g, tex = 'u', tail = 0;
  if (kind === 'ponytail' || kind === 'braid') {
    const tie = new T.Vector3(c.x, c.y + 0.035, c.z - hs.z * 0.47);
    const pts = pointsOn(tie, kind === 'ponytail' ? [[0, 0.01, 0.02], [0, -0.03, -0.05], [0, -0.13, -0.075], [0, -0.25, -0.06], [0, -0.34, -0.045]] : [[0, 0.01, 0.02], [0, -0.04, -0.04], [0, -0.15, -0.055], [0, -0.3, -0.045], [0, -0.42, -0.03]]);
    const braid = kind === 'braid';
    g = tube(pts, t => (braid ? 0.018 * (0.72 + 0.4 * Math.abs(Math.sin(t * Math.PI * 11))) : 0.012 + 0.03 * Math.sin(Math.PI * Math.min(1, 0.15 + t * 1.15))) * (t > 0.85 ? Math.max(0.25, (1 - t) / 0.15) : 1) * (t < 0.06 ? 0.6 + t * 6 : 1), 48, braid ? t => Math.sin(t * Math.PI * 11) * 0.005 : null);
    const tieG = new T.TorusGeometry(0.017, 0.006, 6, 16); tieG.translate(tie.x, tie.y, tie.z - 0.012);
    tieG.deleteAttribute('uv'); g.deleteAttribute('uv');
    g = mergeBufferGeometries([g, tieG]); tail = 1;
  } else if (kind === 'manbun' || kind === 'topknot') {
    const r = kind === 'manbun' ? 0.038 : 0.05, at = kind === 'manbun' ? new T.Vector3(c.x, c.y + hs.y * 0.3, c.z - hs.z * 0.42) : new T.Vector3(c.x, top + 0.025, c.z - 0.035);
    g = new T.SphereGeometry(r, 24, 16); const P = g.attributes.position, v = new T.Vector3();
    for (let i = 0; i < P.count; i++) { v.fromBufferAttribute(P, i); const a = Math.atan2(v.z, v.x); v.multiplyScalar(1 + 0.08 * Math.sin(a * 5 + v.y * 80)); v.y *= 0.82; P.setXYZ(i, v.x + at.x, v.y + at.y, v.z + at.z); }
    g.computeVertexNormals(); tex = 'v';
  } else if (kind === 'curls' || kind === 'afro') {
    // little ringlets scattered over the blown-up cap
    const file = key === 'female' ? 'hair-buzzedfemale' : 'hair-buzzed';
    let cap = null; A[file].scene.traverse(o => { if (o.isSkinnedMesh && !cap) cap = o.geometry; });
    const P = hairGeometry(A, key, file, kind, cap).attributes.position, parts = [], rnd = (k => () => (k = (k * 16807) % 2147483647) / 2147483647)(7);
    const big = kind === 'afro' ? 1.15 : 0.85;
    for (let i = 0; i < P.count; i += 2) {
      const x = P.getX(i), y = P.getY(i), z = P.getZ(i);
      if (y < c.y - 0.03 || (z > c.z + 0.04 && y < c.y + 0.05)) continue;
      const b = new T.IcosahedronGeometry((0.011 + rnd() * 0.008) * big, 1); b.deleteAttribute('uv');
      b.scale(1, 0.8 + rnd() * 0.4, 1); b.translate(x + (rnd() - 0.5) * 0.008, y + (rnd() - 0.5) * 0.008, z + (rnd() - 0.5) * 0.008); parts.push(b);
    }
    g = mergeBufferGeometries(parts); tex = 'v';
  } else if (kind === 'mohawk') {
    const parts = [];
    for (let k = 0; k < 9; k++) {
      const a = -0.45 + k * 0.32, dir = new T.Vector3(0, Math.cos(a), -Math.sin(a)), r = 1 / Math.hypot(dir.y / (hs.y * 0.5), dir.z / (hs.z * 0.5));
      const cone = new T.ConeGeometry(0.02, 0.06 - Math.abs(k - 3) * 0.004, 7); cone.deleteAttribute('uv');
      cone.translate(0, 0.02, 0); cone.applyQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(0, 1, 0), dir.clone().add(new T.Vector3(0, 0, -0.35)).normalize()));
      cone.translate(c.x, c.y + dir.y * r * 0.94, c.z + dir.z * r * 0.94); parts.push(cone);
    }
    g = mergeBufferGeometries(parts); tex = 'v';
  }
  if (!g.attributes.uv) {
    // simple cylindrical mapping so the strands still show
    const P = g.attributes.position, uv = new Float32Array(P.count * 2);
    for (let i = 0; i < P.count; i++) { uv[i * 2] = Math.atan2(P.getX(i) - c.x, P.getZ(i) - c.z) / Math.PI; uv[i * 2 + 1] = P.getY(i) * 4; }
    g.setAttribute('uv', new T.BufferAttribute(uv, 2));
  }
  // skinned to the head; a tail hanging below it follows the neck and upper back
  const P = g.attributes.position, sIdx = new Uint16Array(P.count * 4), sW = new Float32Array(P.count * 4);
  for (let i = 0; i < P.count; i++) {
    const below = tail ? Math.max(0, Math.min(1, (c.y - 0.02 - P.getY(i)) / 0.25)) * tail : 0;
    sIdx.set([BI.Head, BI.spine_03, BI.neck_01, 0], i * 4); sW.set([1 - below, below * 0.6, below * 0.4, 0], i * 4);
  }
  g.setAttribute('skinIndex', new T.BufferAttribute(sIdx, 4)); g.setAttribute('skinWeight', new T.BufferAttribute(sW, 4));
  const res = { g, tex };
  A.hairs.set(id, res);
  return res;
}

/* ───────── fabric textures (Poly Haven, CC0): greyscale so any colour can be chosen ───────── */
const texCache = new Map();
const texLoader = new T.TextureLoader();
function fabricMaps(name) {
  if (texCache.has(name)) return texCache.get(name);
  const load = f => { const t = texLoader.load(FABRIC + f + '.jpg'); t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(8, 8); t.anisotropy = 4; return t; };
  const res = { map: load(name), normalMap: load(name + '_nor') };
  texCache.set(name, res);
  return res;
}
/* batik: a hand-drawn parang pattern */
function batik(base) {
  const id = 'batik' + base;
  if (texCache.has(id)) return texCache.get(id);
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = base; g.fillRect(0, 0, 256, 256); g.lineCap = 'round';
  for (let k = -256; k < 512; k += 48) {
    g.strokeStyle = 'rgba(28,16,8,.78)'; g.lineWidth = 9; g.beginPath();
    for (let x = 0; x <= 256; x += 4) { const y = k + x + Math.sin(x / 9) * 7; x ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
    g.strokeStyle = 'rgba(255,236,196,.85)'; g.lineWidth = 2.5; g.beginPath();
    for (let x = 0; x <= 256; x += 4) { const y = k + 22 + x + Math.sin(x / 9) * 7; x ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
  }
  const t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(6, 6); t.anisotropy = 4;
  texCache.set(id, t);
  return t;
}
/* eyes: the iris of the eye texture recoloured */
function eyeTexture(A, color) {
  const id = 'eye' + color;
  if (texCache.has(id)) return texCache.get(id);
  let src = null; A.male.scene.traverse(o => { if (o.isMesh && /Eye/.test(o.material.name)) src = o.material.map; });
  const img = src.image, c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
  const g = c.getContext('2d'); g.drawImage(img, 0, 0);
  const d = g.getImageData(0, 0, c.width, c.height), px = d.data, tc = new T.Color(color);
  for (let i = 0; i < px.length; i += 4) {
    const r = px[i], gg = px[i + 1], b = px[i + 2], mx = Math.max(r, gg, b), mn = Math.min(r, gg, b);
    if (mx > 0 && (mx - mn) / mx > 0.25) { const l = (r + gg + b) / 3 / 120; px[i] = Math.min(255, tc.r * 255 * l); px[i + 1] = Math.min(255, tc.g * 255 * l); px[i + 2] = Math.min(255, tc.b * 255 * l); }
  }
  g.putImageData(d, 0, 0);
  const t = new T.CanvasTexture(c); t.flipY = src.flipY; texCache.set(id, t);
  return t;
}
const TOP_FABRIC = { tshirt: 'jersey', hoodie: 'melange', shirt: 'poplin', batik: 'poplin', jacket: 'suede', sweater: 'knit' };
const BOTTOM_FABRIC = { jeans: 'denim', chinos: 'poplin', shorts: 'poplin', skirt: 'poplin', joggers: 'melange' };
/* shoes: upper fabric, roughness, sole thickness, sole colour */
const SHOE = { sneakers: ['sneaker', 0.55, 0.028, '#F1EFEA'], boots: ['leather', 0.5, 0.032, '#2A211B'], loafers: ['leather', 0.32, 0.014, '#3A2A20'], sandals: ['leather', 0.6, 0.018, '#4A3426'] };

/* ───────── a person ───────── */
export function buildPerson(A, look, colors) {
  const key = look.body === 'female' ? 'female' : 'male', M = A.meta[key], f = shapeOf(look);
  const root = SU.clone(A[key].scene);
  const holder = new T.Group(); holder.add(root);
  const cm = look.height > 3 ? look.height : 175 * (look.height || 1);
  const s = cm / 100 / NATIVE[key];
  root.scale.setScalar(s);
  const sole = SHOE[look.shoes] || SHOE.sneakers;
  root.position.y = (0.012 + sole[2] * 0.35) * s; // stand on the soles
  const owned = [];
  const own = x => { owned.push(x); return x; };
  let body = null, eyes = null, brows = null;
  root.traverse(o => { if (o.isSkinnedMesh) { if (/Superhero/.test(o.material.name)) body = o; else if (/Eye/.test(o.material.name)) eyes = o; else brows = o; } });
  const bones = {}; body.skeleton.bones.forEach(b => { bones[b.name] = b; });
  const skinC = new T.Color(colors.skin), hairC = new T.Color(colors.hair);
  // skin
  body.material = own(body.material.clone());
  body.material.color.setRGB(skinC.r / SKIN_AVG[0] * 0.8, skinC.g / SKIN_AVG[1] * 0.8, skinC.b / SKIN_AVG[2] * 0.8);
  body.material.roughness = 0.6;
  if (brows) { brows.material = own(brows.material.clone()); brows.material.color.copy(hairC).multiplyScalar(0.75 / HAIR_AVG); if (look.hair === 'hijab' || look.hair === 'bald') brows.material.color.set('#3a2a20').multiplyScalar(1 / HAIR_AVG); }
  if (eyes) { eyes.material = own(eyes.material.clone()); eyes.material.map = eyeTexture(A, colors.eyes); }
  const parent = body.parent;
  const skinned = (geo, mat) => { const m = new T.SkinnedMesh(geo, mat); m.bind(body.skeleton, body.bindMatrix); m.frustumCulled = false; parent.add(m); return m; };
  const cloth = (color, fab, extra) => {
    const maps = fab ? fabricMaps(fab) : {};
    return own(new T.MeshStandardMaterial(Object.assign({ color, map: maps.map || null, normalMap: maps.normalMap || null, normalScale: new T.Vector2(0.7, 0.7), roughness: 0.88, metalness: 0, side: T.DoubleSide }, extra || {})));
  };
  // clothes
  const covered = new Uint8Array(body.geometry.attributes.position.count);
  const wear = (kind, offset, mat) => { const sh = shellGeometry(A, key, kind, look, offset, f); for (let i = 0; i < covered.length; i++) if (sh.on[i]) covered[i] = 1; return skinned(sh.g, mat); };
  const bottomOff = OFFSET.bottom + (look.bottom === 'joggers' ? 0.004 : 0);
  wear('bottom', bottomOff, cloth(colors.bottom, BOTTOM_FABRIC[look.bottom] || 'poplin'));
  const thick = look.top === 'hoodie' || look.top === 'sweater' || look.top === 'jacket';
  const topMat = cloth(look.top === 'batik' ? '#ffffff' : colors.top, TOP_FABRIC[look.top] || 'jersey', look.top === 'jacket' ? { roughness: 0.7 } : null);
  if (look.top === 'batik') topMat.map = batik(colors.top);
  wear('top', bottomOff + (thick ? OFFSET.thickTop : OFFSET.top), topMat);
  const shoeMat = cloth(colors.shoes, sole[0], { roughness: sole[1], side: T.FrontSide });
  if (look.shoes === 'sandals') wear('sole', OFFSET.sole, shoeMat);
  else wear('shoes', OFFSET.shoes + (look.shoes === 'boots' ? 0.004 : 0), shoeMat);
  const soleMat = own(new T.MeshStandardMaterial({ color: sole[3], roughness: 0.8 }));
  ['l', 'r'].forEach(sd => skinned(soleGeometry(A, key, f, sd, sole[2], look.shoes === 'sandals' ? 0.004 : 0.007), soleMat));
  if (look.hair === 'hijab') wear('hijab', OFFSET.hijab + (thick ? 0.012 : 0), cloth(colors.hair, 'jersey', { roughness: 0.9 }));
  // the body itself: reshaped for the weight, and triangles that are fully under clothes dropped
  const src = body.geometry, si = src.index.array, keep = [], W = M.weld, shape = bodyShape(A, key, f);
  // only drop skin well inside the clothes: erode the covered area by two rings so hems never show a gap
  let deep = new Uint8Array(covered.length); for (let i = 0; i < covered.length; i++) deep[W[i]] = deep[W[i]] || covered[i];
  for (let ring = 0; ring < 2; ring++) {
    const next = deep.slice();
    for (let k = 0; k < si.length; k += 3) { const a = W[si[k]], b = W[si[k + 1]], c = W[si[k + 2]]; if (!(deep[a] && deep[b] && deep[c])) { next[a] = next[b] = next[c] = 0; } }
    deep = next;
  }
  for (let k = 0; k < si.length; k += 3) if (!(deep[W[si[k]]] && deep[W[si[k + 1]]] && deep[W[si[k + 2]]])) keep.push(si[k], si[k + 1], si[k + 2]);
  const bg = own(new T.BufferGeometry()); Object.keys(src.attributes).forEach(a => bg.setAttribute(a, src.attributes[a]));
  bg.setAttribute('position', shape.posA); bg.setAttribute('normal', shape.norA); bg.setIndex(keep);
  body.geometry = bg;
  // hair
  const hairMat = look.hair !== 'hijab' ? own(new T.MeshStandardMaterial({ roughness: 0.55, side: T.DoubleSide })) : null;
  const addHair = (file, mode) => {
    A[file].scene.traverse(o => {
      if (!o.isSkinnedMesh) return;
      if (!hairMat.map) { hairMat.map = o.material.map; hairMat.normalMap = o.material.normalMap; hairMat.color.copy(hairC).multiplyScalar(1 / HAIR_AVG); }
      const m = new T.SkinnedMesh(hairGeometry(A, key, file, mode, o.geometry), hairMat); m.frustumCulled = false;
      m.bind(new T.Skeleton(o.skeleton.bones.map(b => bones[b.name] || bones.Head), o.skeleton.boneInverses), o.bindMatrix);
      parent.add(m);
    });
  };
  let hs = HAIR_STYLES[look.hair] || null;
  if (hs && hs.base === 'hair-buzzed' && key === 'female') hs = Object.assign({}, hs, { base: 'hair-buzzedfemale' });
  // under a cap only close-cropped or long hair, so nothing pokes through it
  if (look.cap && hs && ['long', 'bob', 'ponytail', 'braid', 'wavy'].indexOf(look.hair) < 0) hs = { base: key === 'female' ? 'hair-buzzedfemale' : 'hair-buzzed' };
  if (look.cap && hs && hs.piece !== 'ponytail' && hs.piece !== 'braid') hs = Object.assign({}, hs, { piece: null });
  if (hs) {
    if (hs.extra) { addHair(hs.base); addHair(hs.extra, hs.mode); } else addHair(hs.base, hs.mode);
    if (hs.piece) {
      const pc = hairPiece(A, key, hs.piece);
      skinned(pc.g, own(new T.MeshStandardMaterial({ map: strands(pc.tex), color: hairMat.color.clone(), roughness: 0.6, normalScale: new T.Vector2(0.5, 0.5) })));
    }
  }
  if (look.beard && key === 'male') addHair('hair-beard');
  // accessories, placed in rest pose and parented to a bone so they follow it
  root.updateMatrixWorld(true);
  const attach = (boneName, obj, worldPos) => {
    const bone = bones[boneName], inv = new T.Matrix4().copy(bone.matrixWorld).invert();
    const m = new T.Matrix4().makeTranslation(worldPos.x, worldPos.y, worldPos.z).premultiply(inv);
    m.decompose(obj.position, obj.quaternion, obj.scale);
    const ws = new T.Vector3(); bone.getWorldScale(ws); obj.scale.set(s / ws.x, s / ws.y, s / ws.z);
    bone.add(obj); return obj;
  };
  const toRoot = p => p.clone().applyMatrix4(root.matrixWorld);
  const hb = M.headBox, hc = hb.getCenter(new T.Vector3()), hsz = hb.getSize(new T.Vector3()), fat = Math.max(0, f);
  if (look.glasses && !M.eyeBox.isEmpty()) {
    const ec = M.eyeBox.getCenter(new T.Vector3()), ew = M.eyeBox.max.x - M.eyeBox.min.x;
    const fr = own(new T.MeshStandardMaterial({ color: 0x1b1b1f, roughness: 0.3, metalness: 0.3 })), gl = new T.Group();
    [-1, 1].forEach(sd => {
      const ring = new T.Mesh(own(new T.TorusGeometry(ew * 0.27, 0.0026, 6, 24)), fr); ring.position.set(sd * ew * 0.3, 0, 0); ring.scale.y = 0.8; gl.add(ring);
      const arm = new T.Mesh(own(new T.BoxGeometry(0.003, 0.003, hsz.z * 0.55)), fr); arm.position.set(sd * ew * 0.56, 0.004, -hsz.z * 0.27); gl.add(arm);
    });
    const br = new T.Mesh(own(new T.BoxGeometry(ew * 0.1, 0.003, 0.003)), fr); gl.add(br);
    attach('Head', gl, toRoot(new T.Vector3(ec.x, ec.y + 0.002, M.eyeBox.max.z + 0.016)));
  }
  if (look.cap && look.hair !== 'hijab') {
    const cmat = own(new T.MeshStandardMaterial({ color: colors.cap, roughness: 0.75 })), cap = new T.Group();
    const dome = new T.Mesh(own(new T.SphereGeometry(1, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.5)), cmat);
    dome.scale.set(hsz.x * 0.6, hsz.y * 0.44, hsz.z * 0.62); cap.add(dome);
    const brim = new T.Mesh(own(new T.CylinderGeometry(hsz.x * 0.42, hsz.x * 0.42, 0.008, 24, 1, false, -Math.PI / 2, Math.PI)), cmat);
    brim.position.set(0, 0.004, hsz.z * 0.42); brim.scale.z = 1.2; cap.add(brim);
    attach('Head', cap, toRoot(new T.Vector3(hc.x, hc.y + hsz.y * 0.14, hc.z + 0.004)));
  }
  if (look.backpack) {
    const bm = own(new T.MeshStandardMaterial({ color: 0x2C3E66, roughness: 0.7 })), bag = new T.Group(), cb = M.chestBox;
    const main = new T.Mesh(own(new T.BoxGeometry(0.28, 0.36, 0.13)), bm); bag.add(main);
    const pocket = new T.Mesh(own(new T.BoxGeometry(0.2, 0.13, 0.05)), own(new T.MeshStandardMaterial({ color: 0x7EF2C3, roughness: 0.6 }))); pocket.position.set(0, -0.08, -0.08); bag.add(pocket);
    attach('spine_03', bag, toRoot(new T.Vector3(0, (cb.min.y + cb.max.y) / 2 - 0.04, cb.min.z - 0.1 - fat * 0.02)));
  }
  if (look.bottom === 'skirt') {
    // an A-line skirt, skinned to the pelvis with a little of each thigh towards the hem, so it sways with the legs
    const hb2 = M.hipBox, hw = (hb2.max.x - hb2.min.x) / 2 * (1 + fat * 0.22), hd = (hb2.max.z - hb2.min.z) / 2 * (1 + fat * 0.3);
    const top = M.J.pelvis.y + 0.06, cx = (hb2.min.x + hb2.max.x) / 2, cz = (hb2.min.z + hb2.max.z) / 2 + 0.005;
    const prof = [[hw * 1.06, 0.01], [hw * 1.4, -0.1], [hw * 1.56, -0.3], [hw * 1.74, -0.47]].map(p => new T.Vector2(p[0], p[1]));
    const g = own(new T.LatheGeometry(new T.SplineCurve(prof).getPoints(14), 40)), P = g.attributes.position, nv = P.count;
    const sIdx = new Uint16Array(nv * 4), sW = new Float32Array(nv * 4), BI = M.boneIndex;
    for (let i = 0; i < nv; i++) {
      const x = P.getX(i), y = P.getY(i), z = P.getZ(i) * (hd / hw) * 1.25;
      P.setXYZ(i, cx + x, top + y, cz + z);
      const k = Math.min(1, -y / 0.45) ** 1.5 * 0.4, wl = Math.max(0, Math.min(1, 0.5 + x / (hw * 1.4)));
      sIdx.set([BI.pelvis, BI.thigh_l, BI.thigh_r, 0], i * 4); sW.set([1 - k, k * wl, k * (1 - wl), 0], i * 4);
    }
    g.setAttribute('skinIndex', new T.BufferAttribute(sIdx, 4)); g.setAttribute('skinWeight', new T.BufferAttribute(sW, 4));
    g.computeVertexNormals();
    skinned(g, cloth(colors.bottom, 'poplin', { side: T.DoubleSide }));
  }
  /* girth: the base bodies are athletic, so an average build is a bit narrower; lean is narrower still,
     heavy a little wider (the fat itself is in the mesh). Bones run along their local Y axis, so only
     X and Z are scaled and the body never gets shorter. Each bone's scale is relative to its parent's. */
  const g0 = key === 'female' ? 0.96 : 0.9, lean = Math.min(0, f), heavy = Math.max(0, f);
  const girth = {
    spine_01: 0.97 + lean * 0.16 + heavy * 0.05, spine_02: g0 + lean * 0.2 + heavy * 0.05, spine_03: g0 + lean * 0.18 + heavy * 0.04,
    neck_01: 1 + lean * 0.12 + heavy * 0.08, Head: 1, clavicle_l: 1, clavicle_r: 1
  };
  ['l', 'r'].forEach(sd => {
    girth['upperarm_' + sd] = g0 * 0.97 + lean * 0.3 + heavy * 0.05; girth['lowerarm_' + sd] = 0.96 + lean * 0.16 + heavy * 0.04; girth['hand_' + sd] = 1;
    girth['thigh_' + sd] = Math.min(1, g0 + 0.04) + lean * 0.26 + heavy * 0.04; girth['calf_' + sd] = 0.97 + lean * 0.14 + heavy * 0.05; girth['foot_' + sd] = 1;
  });
  const worldG = b => { while (b && b.isBone) { if (girth[b.name] != null) return girth[b.name]; b = b.parent; } return 1; };
  Object.keys(girth).forEach(name => { const b = bones[name]; if (!b) return; const k = girth[name] / worldG(b.parent); b.scale.set(k, 1, k); });
  holder.traverse(o => { if (o.isMesh) { o.frustumCulled = false; (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { if (owned.indexOf(m) >= 0) m.envMapIntensity = 0.45; }); } });

  /* animations, blended by speed: 0 idle · 1 walk · 1.6 jog · 2 sprint */
  const mixer = new T.AnimationMixer(root);
  const clip = name => A.anims.animations.find(a => a.name === name);
  const acts = {};
  [['idle', 'Idle_Loop'], ['walk', 'Walk_Loop'], ['jog', 'Jog_Fwd_Loop'], ['sprint', 'Sprint_Loop'], ['talk', 'Idle_Talking_Loop'], ['greet', 'Interact']].forEach(([k, n]) => {
    const c = clip(n); if (!c) return;
    const a = mixer.clipAction(c); a.play(); a.setEffectiveWeight(k === 'idle' ? 1 : 0); acts[k] = a;
  });
  mixer.update(Math.random() * 2);
  let sp = 0, talk = 0, talkT = 0;
  return {
    root: holder,
    animate(dt, speed = 0) {
      sp += (Math.min(2, Math.max(0, speed)) - sp) * (1 - Math.exp(-6 * dt));
      talkT = Math.max(0, talkT - dt); talk += ((talkT > 0 ? 1 : 0) - talk) * (1 - Math.exp(-5 * dt));
      const still = Math.max(0, 1 - sp / 0.6);
      // standing: a relaxed mix of the idle and the talking idle; greeting plays over it
      const w = { idle: still * 0.45 * (1 - talk), talk: still * 0.55 * (1 - talk), greet: still * talk, walk: 0, jog: 0, sprint: 0 };
      if (sp < 1) w.walk = Math.min(1, sp / 0.6);
      else if (sp < 1.5) { w.walk = 1 - (sp - 1) / 0.5; w.jog = (sp - 1) / 0.5; }
      else { w.jog = Math.max(0, 1 - (sp - 1.5) / 0.5); w.sprint = Math.min(1, (sp - 1.5) / 0.5); }
      const sum = Object.values(w).reduce((a, b) => a + b, 0) || 1;
      Object.keys(acts).forEach(k => acts[k].setEffectiveWeight((w[k] || 0) / sum));
      if (acts.walk) acts.walk.timeScale = 0.9 + 0.6 * Math.min(1, sp);
      if (acts.jog) acts.jog.timeScale = 0.9 + 0.3 * Math.max(0, sp - 1);
      mixer.update(dt);
    },
    wave() { talkT = 2; if (acts.greet) acts.greet.reset().play(); },
    talking(on) { talkT = on ? 1e9 : 0; },
    dispose() { mixer.stopAllAction(); owned.forEach(x => x.dispose && x.dispose()); }
  };
}
