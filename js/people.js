/* Realistic people built from Quaternius "Universal Base Characters" + "Universal Animation Library" (CC0).
   - one rigged body per body type (male / female), tinted to the chosen skin tone
   - real hairstyles, rebound to the body's skeleton
   - clothes are shells grown out of the body mesh itself (by bone region), so they bend with every animation
   - hijab, skirt, glasses, cap and backpack are added on top
   - idle / walk / jog / sprint / talk animations blended by speed
   loadPeople() → Promise of the shared assets; buildPerson(A, look) → { root, animate(dt, speed), wave(), dispose() } */
import * as T from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as SU from 'three/addons/utils/SkeletonUtils.js';

const BASE = new URL('../assets/3d/people/', import.meta.url).href;
const FILES = ['male', 'female', 'anims', 'hair-simpleparted', 'hair-buzzed', 'hair-buzzedfemale', 'hair-long', 'hair-buns', 'hair-beard'];
const SKIN_AVG = [167 / 255, 116 / 255, 81 / 255];
const HAIR_AVG = 0.56;
const HEIGHT = 1.81;

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
    A.shells = new Map();
    return A;
  });
  return cache;
}

/* ───────── body analysis: which part of the body each vertex belongs to ───────── */
const comp = (a, i, k) => k === 0 ? a.getX(i) : k === 1 ? a.getY(i) : k === 2 ? a.getZ(i) : a.getW(i);
const REG = { head: 0, neck: 1, chest: 2, waist: 3, pelvis: 4, upperarm: 5, lowerarm: 6, hand: 7, thigh: 8, calf: 9, foot: 10 };
function analyse(gltf) {
  const scene = gltf.scene; scene.updateMatrixWorld(true);
  let body = null, eyes = null;
  scene.traverse(o => { if (o.isSkinnedMesh) { if (/Superhero/.test(o.material.name)) body = o; else if (/Eye/.test(o.material.name)) eyes = o; } });
  const bones = {}; body.skeleton.bones.forEach(b => { bones[b.name] = b; });
  const bp = n => new T.Vector3().setFromMatrixPosition(bones[n].matrixWorld);
  const g = body.geometry, pos = g.attributes.position, nor = g.attributes.normal, si = g.attributes.skinIndex, sw = g.attributes.skinWeight;
  const n = pos.count, region = new Uint8Array(n), t = new Float32Array(n), side = new Int8Array(n), world = new Float32Array(n * 3);
  const v = new T.Vector3(), seg = (a, b, p) => { const ab = new T.Vector3().subVectors(b, a); return Math.max(0, Math.min(1, new T.Vector3().subVectors(p, a).dot(ab) / ab.lengthSq())); };
  const J = { pelvis: bp('pelvis'), neck: bp('neck_01'), head: bp('Head') };
  ['l', 'r'].forEach(s => { J['sh' + s] = bp('upperarm_' + s); J['el' + s] = bp('lowerarm_' + s); J['wr' + s] = bp('hand_' + s); J['hip' + s] = bp('thigh_' + s); J['kn' + s] = bp('calf_' + s); J['an' + s] = bp('foot_' + s); });
  for (let i = 0; i < n; i++) {
    let best = 0, bi = 0;
    for (let k = 0; k < 4; k++) { const w = comp(sw, i, k); if (w > best) { best = w; bi = comp(si, i, k); } }
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
  return { region, t, side, face, world, J, headBox, hipBox, chestBox, eyeBox, nor, weld };
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
      if (r === REG.calf) return b !== 'shorts' && b !== 'skirt' && t < 0.93;
      return false;
    }
    case 'shoes': return look.shoes === 'sandals' ? false : r === REG.foot || (r === REG.calf && t > (look.shoes === 'boots' ? 0.62 : 0.9));
    case 'sole': return look.shoes === 'sandals' && r === REG.foot && M.world[i * 3 + 1] < 0.03;
    case 'hijab': { const ax = Math.min(1, Math.abs(M.world[i * 3]) / 0.2); return (r === REG.head && !M.face[i]) || r === REG.neck || (r === REG.chest && M.world[i * 3 + 1] > M.J.neck.y - 0.24 + 0.16 * ax * ax); }
    default: return false;
  }
}
const OFFSET = { bottom: 0.01, top: 0.016, thickTop: 0.026, shoes: 0.014, sole: 0.006, hijab: 0.034 };

/* a garment shell: the covered triangles, pushed out along the normals, skinned to the same bones */
function shellGeometry(A, key, kind, look, offset) {
  const id = [key, kind, look.top, look.bottom, look.shoes, offset].join('|');
  if (A.shells.has(id)) return A.shells.get(id);
  const M = A.meta[key], src = bodyMesh(A[key].scene).geometry, n = src.attributes.position.count;
  const on = new Uint8Array(n); for (let i = 0; i < n; i++) on[i] = covers(kind, look, M, i) ? 1 : 0;
  const idx = [], si = src.index.array;
  for (let k = 0; k < si.length; k += 3) if (on[si[k]] && on[si[k + 1]] && on[si[k + 2]]) idx.push(si[k], si[k + 1], si[k + 2]);
  const p = src.attributes.position, nr = src.attributes.normal, out = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    let o = offset;
    if (kind === 'hijab' && M.region[i] === REG.chest) o += 0.012;
    if (kind === 'bottom' && look.bottom === 'joggers' && M.region[i] === REG.calf) o += 0.004 * (1 - Math.abs(M.t[i] - 0.5) * 2);
    out[i * 3] = p.getX(i) + nr.getX(i) * o; out[i * 3 + 1] = p.getY(i) + nr.getY(i) * o; out[i * 3 + 2] = p.getZ(i) + nr.getZ(i) * o;
  }
  smoothShell(out, idx, M.weld, kind === 'shoes' || kind === 'sole' ? 2 : kind === 'hijab' ? 10 : 7);
  const g = new T.BufferGeometry();
  g.setAttribute('position', new T.BufferAttribute(out, 3));
  ['normal', 'uv', 'skinIndex', 'skinWeight'].forEach(a => g.setAttribute(a, src.attributes[a]));
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

/* ───────── fabric textures ───────── */
const texCache = new Map();
function fabric(kind, base) {
  const id = kind + base;
  if (texCache.has(id)) return texCache.get(id);
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = kind === 'batik' ? base : '#ffffff'; g.fillRect(0, 0, 256, 256);
  if (kind === 'batik') {
    g.lineCap = 'round';
    for (let k = -256; k < 512; k += 48) {
      g.strokeStyle = 'rgba(28,16,8,.78)'; g.lineWidth = 9; g.beginPath();
      for (let x = 0; x <= 256; x += 4) { const y = k + x + Math.sin(x / 9) * 7; x ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
      g.strokeStyle = 'rgba(255,236,196,.85)'; g.lineWidth = 2.5; g.beginPath();
      for (let x = 0; x <= 256; x += 4) { const y = k + 22 + x + Math.sin(x / 9) * 7; x ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
    }
  } else {
    const img = g.getImageData(0, 0, 256, 256), d = img.data;
    for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) {
      let v;
      if (kind === 'denim') v = 0.84 + 0.12 * (((x + y) % 4) < 2 ? 1 : 0) + Math.random() * 0.06;
      else if (kind === 'knit') v = 0.8 + 0.18 * Math.abs(Math.sin(x * Math.PI / 4)) + Math.random() * 0.03;
      else v = 0.92 + Math.random() * 0.08;
      const i = (y * 256 + x) * 4; d[i] = d[i + 1] = d[i + 2] = Math.min(255, v * 255);
    }
    g.putImageData(img, 0, 0);
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

/* ───────── a person ───────── */
const mul = (hex, k) => new T.Color(hex).multiplyScalar(k);
export function buildPerson(A, look, colors) {
  const key = look.body === 'female' ? 'female' : 'male', M = A.meta[key];
  const root = SU.clone(A[key].scene);
  const holder = new T.Group(); holder.add(root);
  const s = (look.height || 1) * 1.75 / HEIGHT;
  root.scale.setScalar(s);
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
  const cloth = (color, kind, extra) => own(new T.MeshStandardMaterial(Object.assign({ color, map: kind ? fabric(kind, color) : null, roughness: 0.85, metalness: 0, side: T.DoubleSide }, extra || {})));
  // clothes
  const covered = new Uint8Array(body.geometry.attributes.position.count);
  const wear = (kind, offset, mat) => { const sh = shellGeometry(A, key, kind, look, offset); for (let i = 0; i < covered.length; i++) if (sh.on[i]) covered[i] = 1; return skinned(sh.g, mat); };
  const bottomOff = OFFSET.bottom + (look.bottom === 'joggers' ? 0.004 : 0);
  wear('bottom', bottomOff, cloth(colors.bottom, look.bottom === 'jeans' ? 'denim' : 'cloth'));
  const thick = look.top === 'hoodie' || look.top === 'sweater' || look.top === 'jacket';
  const topMat = look.top === 'batik' ? cloth('#ffffff', 'batik') : cloth(colors.top, look.top === 'sweater' ? 'knit' : 'cloth', look.top === 'jacket' ? { roughness: 0.55 } : null);
  if (look.top === 'batik') topMat.map = fabric('batik', colors.top);
  wear('top', bottomOff + (thick ? OFFSET.thickTop : OFFSET.top), topMat);
  if (look.shoes === 'sandals') wear('sole', OFFSET.sole, cloth(colors.shoes, null, { roughness: 0.7 }));
  else wear('shoes', OFFSET.shoes, cloth(colors.shoes, null, { roughness: look.shoes === 'loafers' ? 0.35 : 0.6 }));
  if (look.hair === 'hijab') wear('hijab', OFFSET.hijab + (thick ? 0.012 : 0), cloth(colors.hair, 'cloth', { roughness: 0.9 }));
  // hide body triangles that are fully under clothes (no poke-through, less to draw)
  const src = body.geometry, si = src.index.array, keep = [], W = M.weld;
  // only drop skin well inside the clothes: erode the covered area by two rings so hems never show a gap
  let deep = new Uint8Array(covered.length); for (let i = 0; i < covered.length; i++) deep[W[i]] = deep[W[i]] || covered[i];
  for (let ring = 0; ring < 2; ring++) {
    const next = deep.slice();
    for (let k = 0; k < si.length; k += 3) { const a = W[si[k]], b = W[si[k + 1]], c = W[si[k + 2]]; if (!(deep[a] && deep[b] && deep[c])) { next[a] = next[b] = next[c] = 0; } }
    deep = next;
  }
  for (let k = 0; k < si.length; k += 3) if (!(deep[W[si[k]]] && deep[W[si[k + 1]]] && deep[W[si[k + 2]]])) keep.push(si[k], si[k + 1], si[k + 2]);
  const bg = own(new T.BufferGeometry()); Object.keys(src.attributes).forEach(a => bg.setAttribute(a, src.attributes[a])); bg.setIndex(keep);
  body.geometry = bg;
  // hair
  const HAIR = { short: 'hair-simpleparted', buzz: key === 'female' ? 'hair-buzzedfemale' : 'hair-buzzed', long: 'hair-long', bun: 'hair-buns' };
  const hairMat = look.hair !== 'hijab' ? own(new T.MeshStandardMaterial({ roughness: 0.55 })) : null;
  const addHair = file => {
    A[file].scene.traverse(o => {
      if (!o.isSkinnedMesh) return;
      if (!hairMat.map) { hairMat.map = o.material.map; hairMat.normalMap = o.material.normalMap; hairMat.color.copy(hairC).multiplyScalar(1 / HAIR_AVG); }
      const m = new T.SkinnedMesh(o.geometry, hairMat); m.frustumCulled = false;
      m.bind(new T.Skeleton(o.skeleton.bones.map(b => bones[b.name] || bones.Head), o.skeleton.boneInverses), o.bindMatrix);
      parent.add(m);
    });
  };
  // under a cap only short (buzzed) or long hair, so nothing pokes through it
  const hairFile = look.cap && look.hair !== 'long' && look.hair !== 'bald' && look.hair !== 'hijab' ? HAIR.buzz : HAIR[look.hair];
  if (hairFile) addHair(hairFile);
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
  const hb = M.headBox, hc = hb.getCenter(new T.Vector3()), hs = hb.getSize(new T.Vector3());
  if (look.glasses && !M.eyeBox.isEmpty()) {
    const ec = M.eyeBox.getCenter(new T.Vector3()), ew = M.eyeBox.max.x - M.eyeBox.min.x;
    const fr = own(new T.MeshStandardMaterial({ color: 0x1b1b1f, roughness: 0.3, metalness: 0.3 })), gl = new T.Group();
    [-1, 1].forEach(sd => {
      const ring = new T.Mesh(own(new T.TorusGeometry(ew * 0.27, 0.0026, 6, 24)), fr); ring.position.set(sd * ew * 0.3, 0, 0); ring.scale.y = 0.8; gl.add(ring);
      const arm = new T.Mesh(own(new T.BoxGeometry(0.003, 0.003, hs.z * 0.55)), fr); arm.position.set(sd * ew * 0.56, 0.004, -hs.z * 0.27); gl.add(arm);
    });
    const br = new T.Mesh(own(new T.BoxGeometry(ew * 0.1, 0.003, 0.003)), fr); gl.add(br);
    attach('Head', gl, toRoot(new T.Vector3(ec.x, ec.y + 0.002, M.eyeBox.max.z + 0.016)));
  }
  if (look.cap && look.hair !== 'hijab') {
    const cm = own(new T.MeshStandardMaterial({ color: colors.cap, roughness: 0.75 })), cap = new T.Group();
    const dome = new T.Mesh(own(new T.SphereGeometry(1, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.5)), cm);
    dome.scale.set(hs.x * 0.6, hs.y * 0.44, hs.z * 0.62); cap.add(dome);
    const brim = new T.Mesh(own(new T.CylinderGeometry(hs.x * 0.42, hs.x * 0.42, 0.008, 24, 1, false, -Math.PI / 2, Math.PI)), cm);
    brim.position.set(0, 0.004, hs.z * 0.42); brim.scale.z = 1.2; cap.add(brim);
    attach('Head', cap, toRoot(new T.Vector3(hc.x, hc.y + hs.y * 0.14, hc.z + 0.004)));
  }
  if (look.backpack) {
    const bm = own(new T.MeshStandardMaterial({ color: 0x2C3E66, roughness: 0.7 })), bag = new T.Group(), cb = M.chestBox;
    const main = new T.Mesh(own(new T.BoxGeometry(0.28, 0.36, 0.13)), bm); bag.add(main);
    const pocket = new T.Mesh(own(new T.BoxGeometry(0.2, 0.13, 0.05)), own(new T.MeshStandardMaterial({ color: 0x7EF2C3, roughness: 0.6 }))); pocket.position.set(0, -0.08, -0.08); bag.add(pocket);
    attach('spine_03', bag, toRoot(new T.Vector3(0, (cb.min.y + cb.max.y) / 2 - 0.04, cb.min.z - 0.085)));
  }
  if (look.bottom === 'skirt') {
    const hb2 = M.hipBox, hw = (hb2.max.x - hb2.min.x) / 2, hd = (hb2.max.z - hb2.min.z) / 2;
    const prof = [[hw * 1.04, 0.04], [hw * 1.1, -0.06], [hw * 1.35, -0.25], [hw * 1.55, -0.42]].map(p => new T.Vector2(p[0], p[1]));
    const sk = new T.Mesh(own(new T.LatheGeometry(new T.SplineCurve(prof).getPoints(12), 32)), cloth(colors.bottom, 'cloth', { side: T.DoubleSide }));
    sk.scale.z = (hd / hw) * 1.12;
    attach('pelvis', sk, toRoot(new T.Vector3((hb2.min.x + hb2.max.x) / 2, M.J.pelvis.y + 0.02, (hb2.min.z + hb2.max.z) / 2)));
  }
  // the base bodies are athletic; ordinary builds thin the torso and limbs (children are counter-scaled)
  const k = { slim: 0.82, regular: 0.9, broad: 1 }[look.build] || 0.9, kf = key === 'female' ? Math.min(1, k + 0.06) : k;
  const thin = (name, f, undo) => { const b = bones[name]; if (!b) return; b.scale.set(1, f, f); (undo || []).forEach(c => { const cb = bones[c]; if (cb) cb.scale.set(1, 1 / f, 1 / f); }); };
  thin('spine_02', kf, ['spine_03']); thin('spine_03', kf, ['neck_01', 'clavicle_l', 'clavicle_r']);
  ['l', 'r'].forEach(sd => { thin('upperarm_' + sd, kf * 0.97, ['lowerarm_' + sd]); thin('thigh_' + sd, Math.min(1, kf + 0.04), ['calf_' + sd]); });
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
