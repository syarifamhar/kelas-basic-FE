/* A procedural, stylized human made from three.js primitives, with a walk cycle.
   makeCharacter(T, look, { detail: 'full' | 'low' }) → { group, look, setLook(look), animate(dt, speed), wave(), dispose() }
   The character stands with its feet at y = 0 and is about 1.8 units tall before scaling. */

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

/* a little canvas pattern for the batik shirt (parang-style diagonal waves + dots) */
function batikTexture(T, base) {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = base; g.fillRect(0, 0, 128, 128);
  g.strokeStyle = 'rgba(30,18,10,.75)'; g.lineWidth = 6;
  for (let k = -128; k < 256; k += 32) { g.beginPath(); for (let x = 0; x <= 128; x += 4) { const y = k + x + Math.sin(x / 8) * 6; x ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); }
  g.strokeStyle = 'rgba(255,235,190,.8)'; g.lineWidth = 2;
  for (let k = -128; k < 256; k += 32) { g.beginPath(); for (let x = 0; x <= 128; x += 4) { const y = k + 16 + x + Math.sin(x / 8) * 6; x ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); }
  g.fillStyle = 'rgba(255,235,190,.9)';
  for (let y = 8; y < 128; y += 32) for (let x = 8; x < 128; x += 32) { g.beginPath(); g.arc(x, y, 2.5, 0, Math.PI * 2); g.fill(); }
  const t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(2, 2);
  return t;
}
const shade = (T, hex, k) => new T.Color(hex).multiplyScalar(k);

export function makeCharacter(T, lookIn, opts = {}) {
  const low = opts.detail === 'low';
  const group = new T.Group();
  let look = Object.assign({}, DEFAULT_LOOK, lookIn || {});
  let parts = null, phase = 0, blink = 0, waveT = 0, breathe = Math.random() * 6;
  const owned = [];
  const geo = g => { owned.push(g); return g; };
  const mat = (color, extra) => { const m = new T.MeshStandardMaterial(Object.assign({ color, roughness: 0.62, metalness: 0.02 }, extra || {})); owned.push(m); return m; };
  const mesh = (g, m, parent, x, y, z) => { const o = new T.Mesh(g, m); o.position.set(x || 0, y || 0, z || 0); o.castShadow = false; parent.add(o); return o; };
  const seg = n => (low ? Math.max(6, n >> 1) : n);

  function build() {
    if (parts) { group.remove(parts.root); }
    owned.splice(0).forEach(x => x.dispose());
    const P = {};
    const skin = SKIN[look.skin] || SKIN[2], hairC = HAIR_COLORS[look.hairColor] || HAIR_COLORS[0];
    const topC = CLOTH[look.topColor] || CLOTH[3], botC = CLOTH[look.bottomColor] || CLOTH[2], shoeC = CLOTH[look.shoesColor] || CLOTH[0];
    const wide = look.build === 'slim' ? 0.88 : look.build === 'broad' ? 1.14 : 1;
    const mSkin = mat(skin), mSkinDark = mat(shade(T, skin, 0.86)), mHair = mat(hairC, { roughness: 0.75 });
    const mTop = look.top === 'batik' ? mat('#ffffff', { map: batikTexture(T, topC) }) : mat(topC);
    const mTopDark = mat(shade(T, topC, 0.78)), mBot = mat(botC, { roughness: 0.8 }), mBotDark = mat(shade(T, botC, 0.8));
    const mShoe = mat(shoeC, { roughness: 0.5 }), mSole = mat(look.shoes === 'boots' ? '#2a211b' : '#F2F2F2', { roughness: 0.7 });
    if (look.top === 'batik') owned.push(mTop.map);

    const root = new T.Group(); P.root = root; group.add(root);
    root.scale.setScalar(look.height || 1);
    // ── hips & legs ──
    const hips = new T.Group(); hips.position.y = 0.92; root.add(hips); P.hips = hips;
    const pelvis = mesh(geo(new T.CylinderGeometry(0.165 * wide, 0.15 * wide, 0.2, seg(18))), mBot, hips, 0, 0.02, 0); pelvis.scale.z = 0.72;
    const belt = mesh(geo(new T.CylinderGeometry(0.168 * wide, 0.168 * wide, 0.035, seg(18))), mat('#2a211b'), hips, 0, 0.11, 0); belt.scale.z = 0.73;
    const long = look.bottom === 'jeans' || look.bottom === 'chinos' || look.bottom === 'joggers';
    const legs = [-1, 1].map(s => {
      const hip = new T.Group(); hip.position.set(s * 0.085 * wide, -0.04, 0); hips.add(hip);
      const thighM = look.bottom === 'skirt' ? mSkin : mBot;
      const thigh = mesh(geo(new T.CylinderGeometry(0.072 * wide, 0.06, 0.42, seg(14))), thighM, hip, 0, -0.21, 0);
      const knee = new T.Group(); knee.position.y = -0.42; hip.add(knee);
      mesh(geo(new T.SphereGeometry(0.06, seg(12), seg(8))), long ? mBot : mSkin, knee, 0, 0, 0);
      const shinM = long ? mBot : mSkin;
      const shin = mesh(geo(new T.CylinderGeometry(0.058, 0.046, 0.4, seg(14))), shinM, knee, 0, -0.2, 0);
      if (look.bottom === 'shorts') { const hem = mesh(geo(new T.CylinderGeometry(0.078 * wide, 0.078 * wide, 0.2, seg(14))), mBot, hip, 0, -0.1, 0); hem.scale.z = 1.02; }
      if (look.bottom === 'joggers') mesh(geo(new T.CylinderGeometry(0.052, 0.052, 0.05, seg(12))), mBotDark, knee, 0, -0.37, 0);
      if (look.bottom === 'jeans' && !low) mesh(geo(new T.BoxGeometry(0.006, 0.4, 0.006)), mBotDark, knee, s * 0.056, -0.2, 0);
      // feet / shoes
      const ankle = new T.Group(); ankle.position.y = -0.4; knee.add(ankle);
      if (look.shoes === 'sandals') {
        mesh(geo(new T.BoxGeometry(0.1, 0.06, 0.2)), mSkin, ankle, 0, -0.035, 0.035);
        mesh(geo(new T.BoxGeometry(0.11, 0.025, 0.22)), mShoe, ankle, 0, -0.075, 0.035);
        mesh(geo(new T.BoxGeometry(0.105, 0.02, 0.03)), mShoe, ankle, 0, -0.02, 0.07);
      } else {
        const boot = look.shoes === 'boots';
        const upper = mesh(geo(new T.BoxGeometry(0.11, boot ? 0.16 : 0.08, 0.22)), mShoe, ankle, 0, boot ? 0.0 : -0.04, 0.035);
        const toe = mesh(geo(new T.SphereGeometry(0.056, seg(12), seg(8))), mShoe, ankle, 0, -0.045, 0.14); toe.scale.set(1, 0.7, 0.9);
        mesh(geo(new T.BoxGeometry(0.12, 0.03, 0.25)), look.shoes === 'loafers' ? mat('#2a211b') : mSole, ankle, 0, -0.085, 0.04);
        if (look.shoes === 'sneakers' && !low) { mesh(geo(new T.BoxGeometry(0.004, 0.03, 0.08)), mSole, ankle, s * 0.056, -0.04, 0.03); mesh(geo(new T.BoxGeometry(0.06, 0.012, 0.012)), mSole, ankle, 0, -0.0, 0.11); }
        if (boot) mesh(geo(new T.CylinderGeometry(0.06, 0.06, 0.03, seg(12))), mat('#2a211b'), ankle, 0, 0.08, 0);
      }
      return { hip, knee, ankle };
    });
    P.legs = legs;
    if (look.bottom === 'skirt') { const sk = mesh(geo(new T.CylinderGeometry(0.16 * wide, 0.27 * wide, 0.36, seg(20), 1, true)), mat(botC, { side: T.DoubleSide, roughness: 0.8 }), hips, 0, -0.14, 0); sk.scale.z = 0.85; }

    // ── torso ──
    const torso = new T.Group(); torso.position.y = 0.92; root.add(torso); P.torso = torso;
    const chest = mesh(geo(new T.CylinderGeometry(0.2 * wide, 0.16 * wide, 0.5, seg(20))), mTop, torso, 0, 0.27, 0); chest.scale.z = 0.66;
    const shoulders = mesh(geo(new T.SphereGeometry(0.2 * wide, seg(20), seg(10), 0, Math.PI * 2, 0, Math.PI / 2)), mTop, torso, 0, 0.5, 0); shoulders.scale.set(1, 0.32, 0.66);
    if (look.top === 'hoodie') {
      const hood = mesh(geo(new T.TorusGeometry(0.12, 0.05, seg(10), seg(20))), mTopDark, torso, 0, 0.55, -0.06); hood.rotation.x = Math.PI / 2.4;
      mesh(geo(new T.BoxGeometry(0.2 * wide, 0.11, 0.02)), mTopDark, torso, 0, 0.12, 0.11 * wide * 0.66 + 0.005);
      if (!low) [-1, 1].forEach(s => mesh(geo(new T.CylinderGeometry(0.006, 0.006, 0.14, 6)), mat('#F2F2F2'), torso, s * 0.035, 0.42, 0.14));
    }
    if (look.top === 'shirt' || look.top === 'batik') {
      [-1, 1].forEach(s => { const col = mesh(geo(new T.BoxGeometry(0.08, 0.02, 0.05)), look.top === 'batik' ? mTopDark : mat(shade(T, topC, 1.12)), torso, s * 0.045, 0.54, 0.075); col.rotation.set(-0.3, 0, s * 0.5); });
      if (!low) for (let b = 0; b < 4; b++) mesh(geo(new T.SphereGeometry(0.009, 6, 4)), mat('#F2F2F2'), torso, 0, 0.46 - b * 0.11, 0.135);
    }
    if (look.top === 'jacket') {
      mesh(geo(new T.BoxGeometry(0.1, 0.46, 0.02)), mat('#F2F2F2'), torso, 0, 0.27, 0.118);
      [-1, 1].forEach(s => { const lap = mesh(geo(new T.BoxGeometry(0.05, 0.2, 0.015)), mTopDark, torso, s * 0.06, 0.42, 0.125); lap.rotation.z = s * 0.25; });
    }
    if (look.top === 'sweater') mesh(geo(new T.TorusGeometry(0.07, 0.022, 8, seg(18))), mTopDark, torso, 0, 0.53, 0.0).rotation.x = Math.PI / 2;
    // hem of the top over the waist
    const hem = mesh(geo(new T.CylinderGeometry(0.176 * wide, 0.178 * wide, 0.05, seg(18))), mTopDark, torso, 0, 0.035, 0); hem.scale.z = 0.74;
    if (look.backpack) {
      const bag = mesh(geo(new T.BoxGeometry(0.24 * wide, 0.3, 0.12)), mat('#2C3E66'), torso, 0, 0.3, -0.16);
      mesh(geo(new T.BoxGeometry(0.2 * wide, 0.12, 0.04)), mat('#7EF2C3'), torso, 0, 0.2, -0.235);
      [-1, 1].forEach(s => { const strap = mesh(geo(new T.BoxGeometry(0.024, 0.2, 0.014)), mat('#1A2130'), torso, s * 0.1 * wide, 0.42, 0.122); strap.rotation.x = -0.18; });
    }
    // ── arms ──
    const sleeveLen = { tshirt: 0.16, hoodie: 1, shirt: 0.7, batik: 0.16, jacket: 1, sweater: 1 }[look.top] ?? 1;
    const arms = [-1, 1].map(s => {
      const sh = new T.Group(); sh.position.set(s * 0.21 * wide, 0.47, 0); torso.add(sh);
      mesh(geo(new T.SphereGeometry(0.066, seg(12), seg(8))), mTop, sh, 0, 0, 0);
      const upperM = sleeveLen >= 0.3 ? mTop : mSkin;
      mesh(geo(new T.CylinderGeometry(0.052, 0.045, 0.3, seg(12))), upperM, sh, 0, -0.15, 0);
      if (sleeveLen < 0.3) mesh(geo(new T.CylinderGeometry(0.064, 0.06, sleeveLen, seg(12))), mTop, sh, 0, -sleeveLen / 2, 0);
      const elbow = new T.Group(); elbow.position.y = -0.3; sh.add(elbow);
      mesh(geo(new T.SphereGeometry(0.046, seg(10), seg(8))), sleeveLen >= 0.7 ? mTop : mSkin, elbow, 0, 0, 0);
      const foreM = sleeveLen >= 1 ? mTop : mSkin;
      mesh(geo(new T.CylinderGeometry(0.044, 0.036, 0.27, seg(12))), foreM, elbow, 0, -0.135, 0);
      if (sleeveLen >= 1) mesh(geo(new T.CylinderGeometry(0.04, 0.04, 0.035, seg(12))), mTopDark, elbow, 0, -0.26, 0);
      if (sleeveLen === 0.7) mesh(geo(new T.CylinderGeometry(0.05, 0.05, 0.05, seg(12))), mTopDark, elbow, 0, -0.03, 0);
      const hand = mesh(geo(new T.SphereGeometry(0.048, seg(12), seg(8))), mSkin, elbow, 0, -0.31, 0.005); hand.scale.set(0.85, 1.15, 0.7);
      if (!low) { const th = mesh(geo(new T.SphereGeometry(0.018, 8, 6)), mSkin, elbow, -s * 0.03, -0.29, 0.03); th.scale.set(1, 1.6, 1); }
      return { sh, elbow };
    });
    P.arms = arms;

    // ── neck & head ──
    mesh(geo(new T.CylinderGeometry(0.05, 0.055, 0.1, seg(12))), mSkin, torso, 0, 0.58, 0);
    const head = new T.Group(); head.position.y = 0.75; torso.add(head); P.head = head;
    // one egg-shaped head: full at the cranium, tapering to a soft chin
    const headGeo = geo(new T.SphereGeometry(0.15, seg(32), seg(24)));
    const hp = headGeo.attributes.position;
    for (let i = 0; i < hp.count; i++) {
      const y = hp.getY(i);
      if (y < 0) { const k = 1 - 0.2 * Math.pow(-y / 0.15, 1.6); hp.setX(i, hp.getX(i) * k); hp.setZ(i, hp.getZ(i) * (k * 0.5 + 0.5) + (-y / 0.15) * 0.012); }
    }
    headGeo.computeVertexNormals();
    const skull = mesh(headGeo, mSkin, head, 0, 0, 0); skull.scale.set(0.95, 1.1, 1);
    [-1, 1].forEach(s => { const ear = mesh(geo(new T.SphereGeometry(0.03, seg(10), seg(8))), mSkinDark, head, s * 0.138, -0.005, -0.005); ear.scale.set(0.5, 1, 0.8); });
    P.eyes = [];
    if (!low) {
      const white = mat('#FFFFFF', { roughness: 0.3 }), iris = mat(EYE_COLORS[look.eyes] || EYE_COLORS[0], { roughness: 0.25 }), pupil = mat('#0b0b0b', { roughness: 0.2 });
      [-1, 1].forEach(s => {
        const eye = new T.Group(); eye.position.set(s * 0.052, 0.012, 0.128); head.add(eye);
        const w = mesh(geo(new T.SphereGeometry(0.026, 16, 12)), white, eye, 0, 0, 0); w.scale.set(1.15, 1, 0.6);
        mesh(geo(new T.SphereGeometry(0.016, 14, 10)), iris, eye, 0, 0, 0.011).scale.set(1, 1, 0.5);
        mesh(geo(new T.SphereGeometry(0.008, 10, 8)), pupil, eye, 0, 0, 0.017).scale.set(1, 1, 0.5);
        mesh(geo(new T.SphereGeometry(0.004, 6, 4)), white, eye, 0.006, 0.006, 0.021);
        P.eyes.push(eye);
        const brow = mesh(geo(new T.BoxGeometry(0.045, 0.009, 0.01)), look.hair === 'hijab' ? mat('#2a1d16') : mHair, head, s * 0.054, 0.052, 0.135); brow.rotation.z = -s * 0.12;
        const cheek = mesh(geo(new T.SphereGeometry(0.02, 10, 8)), mat('#FF9A8A', { transparent: true, opacity: 0.35 }), head, s * 0.075, -0.035, 0.118); cheek.scale.set(1, 0.6, 0.4);
      });
      const nose = mesh(geo(new T.SphereGeometry(0.018, 12, 10)), mSkinDark, head, 0, -0.022, 0.148); nose.scale.set(0.9, 1.2, 1);
      const mouth = mesh(geo(new T.TorusGeometry(0.026, 0.006, 6, 16, Math.PI)), mat('#9C3F3F'), head, 0, -0.072, 0.128); mouth.rotation.z = Math.PI;
    } else {
      [-1, 1].forEach(s => mesh(geo(new T.SphereGeometry(0.014, 6, 4)), mat('#111'), head, s * 0.05, 0.01, 0.135));
    }
    // ── hair ──
    const capGeo = (r, thetaLen, phiStart = 0, phiLen = Math.PI * 2) => geo(new T.SphereGeometry(r, seg(28), seg(14), phiStart, phiLen, 0, thetaLen));
    const hairStyle = look.cap && look.hair !== 'hijab' && look.hair !== 'bun' && look.hair !== 'curly' ? (look.hair === 'bald' ? 'bald' : 'buzz') : look.hair;
    if (hairStyle === 'short') {
      mesh(capGeo(0.158, Math.PI * 0.56), mHair, head, 0, 0.012, -0.004).scale.set(0.96, 1.08, 1.04);
      const fringe = mesh(geo(new T.SphereGeometry(0.1, seg(16), seg(8), 0, Math.PI * 2, 0, Math.PI / 2)), mHair, head, 0.02, 0.085, 0.07); fringe.scale.set(1.25, 0.5, 0.75); fringe.rotation.z = -0.2;
      [-1, 1].forEach(s => mesh(geo(new T.BoxGeometry(0.02, 0.06, 0.05)), mHair, head, s * 0.142, 0.03, 0.04));
    } else if (hairStyle === 'buzz') {
      mesh(capGeo(0.153, Math.PI * 0.5), mHair, head, 0, 0.01, -0.004).scale.set(0.96, 1.08, 1.03);
    } else if (hairStyle === 'curly') {
      const curls = low ? 9 : 22;
      for (let i = 0; i < curls; i++) {
        const a = (i / curls) * Math.PI * 2 * 2.3, t = 0.15 + (i / curls) * 0.95;
        const x = Math.cos(a) * Math.sin(t) * 0.16, y = Math.cos(t) * 0.16 + 0.03, z = Math.sin(a) * Math.sin(t) * 0.16 - 0.015;
        if (z > 0.09 && y < 0.07) continue;
        mesh(geo(new T.SphereGeometry(0.058, seg(10), seg(8))), mHair, head, x, y, z);
      }
      mesh(capGeo(0.16, Math.PI * 0.55), mHair, head, 0, 0.015, -0.006).scale.set(1, 1.1, 1.04);
    } else if (hairStyle === 'long' || hairStyle === 'ponytail' || hairStyle === 'bun') {
      mesh(capGeo(0.16, Math.PI * 0.58), mHair, head, 0, 0.012, -0.006).scale.set(0.98, 1.08, 1.05);
      const part = mesh(geo(new T.SphereGeometry(0.09, seg(14), seg(8), 0, Math.PI * 2, 0, Math.PI / 2)), mHair, head, -0.04, 0.09, 0.075); part.scale.set(1.2, 0.45, 0.7); part.rotation.z = 0.35;
      if (hairStyle === 'long') {
        const back = mesh(geo(new T.CylinderGeometry(0.15, 0.17, 0.42, seg(18), 1, true, Math.PI * 0.5, Math.PI)), mat(hairC, { side: T.DoubleSide, roughness: 0.75 }), head, 0, -0.17, -0.02); back.rotation.y = Math.PI;
        [-1, 1].forEach(s => { const lock = mesh(geo(new T.CylinderGeometry(0.03, 0.022, 0.34, seg(8))), mHair, head, s * 0.13, -0.14, 0.05); lock.rotation.z = s * 0.08; });
      } else if (hairStyle === 'ponytail') {
        mesh(geo(new T.SphereGeometry(0.03, 10, 8)), mat('#FF93B5'), head, 0, 0.04, -0.16);
        const tail = mesh(geo(new T.ConeGeometry(0.055, 0.32, seg(12))), mHair, head, 0, -0.1, -0.2); tail.rotation.x = Math.PI + 0.35;
        P.tail = tail;
      } else {
        mesh(geo(new T.SphereGeometry(0.075, seg(16), seg(12))), mHair, head, 0, 0.15, -0.08);
        mesh(geo(new T.TorusGeometry(0.06, 0.012, 8, 20)), mat('#FFC877'), head, 0, 0.12, -0.06).rotation.x = Math.PI / 2.6;
      }
    } else if (hairStyle === 'hijab') {
      const mH = mat(hairC, { roughness: 0.85, side: T.DoubleSide });
      const open = Math.PI * 0.62;
      mesh(geo(new T.SphereGeometry(0.172, seg(28), seg(16), Math.PI / 2 + open / 2, Math.PI * 2 - open, 0, Math.PI * 0.86)), mH, head, 0, 0.0, -0.005).scale.set(1, 1.1, 1.04);
      mesh(geo(new T.SphereGeometry(0.168, seg(24), seg(10), 0, Math.PI * 2, 0, Math.PI * 0.32)), mH, head, 0, 0.012, 0).scale.set(1, 1.1, 1.04);
      const drape = mesh(geo(new T.CylinderGeometry(0.13, 0.27 * wide, 0.26, seg(24), 1, true)), mH, head, 0, -0.24, -0.01); drape.scale.z = 0.8;
      const band = mesh(geo(new T.TorusGeometry(0.15, 0.012, 6, seg(28), Math.PI * 1.1)), mat(shade(T, hairC, 0.8)), head, 0, 0.0, 0.0); band.rotation.set(0, -Math.PI * 0.05, Math.PI * 0.95); band.position.z = 0.03;
    }
    if (look.cap && look.hair !== 'hijab') {
      const capM = mat(CLOTH[look.shoesColor] || '#E04E4E');
      mesh(capGeo(0.164, Math.PI * 0.45), capM, head, 0, 0.03, -0.004).scale.set(1, 1.05, 1.04);
      const brim = mesh(geo(new T.CylinderGeometry(0.1, 0.1, 0.012, seg(20), 1, false, -Math.PI / 2, Math.PI)), capM, head, 0, 0.065, 0.13); brim.scale.set(1.1, 1, 1);
      mesh(geo(new T.SphereGeometry(0.014, 8, 6)), capM, head, 0, 0.19, 0);
    }
    if (look.glasses) {
      const frame = mat('#1A1A1A', { roughness: 0.3 }), lens = mat('#7FD4FF', { transparent: true, opacity: 0.18, roughness: 0.05 });
      [-1, 1].forEach(s => {
        mesh(geo(new T.TorusGeometry(0.033, 0.006, 8, 24)), frame, head, s * 0.053, 0.012, 0.152);
        mesh(geo(new T.CircleGeometry(0.031, 20)), lens, head, s * 0.053, 0.012, 0.151);
        const arm = mesh(geo(new T.BoxGeometry(0.006, 0.006, 0.13)), frame, head, s * 0.088, 0.016, 0.09); arm.rotation.y = s * 0.12;
      });
      mesh(geo(new T.BoxGeometry(0.035, 0.006, 0.006)), frame, head, 0, 0.018, 0.155);
    }
    parts = P;
  }

  build();
  return {
    group,
    get look() { return look; },
    setLook(l) { look = Object.assign({}, DEFAULT_LOOK, l || {}); build(); },
    wave() { waveT = 1.8; },
    /* speed: 0 idle, ~1 walk, ~2 run */
    animate(dt, speed = 0) {
      const P = parts; if (!P) return;
      breathe += dt;
      const s = Math.min(2, speed);
      phase += dt * (5.5 + s * 3.2) * (s > 0.05 ? 1 : 0);
      const sw = Math.sin(phase), amp = Math.min(1, s) * 0.62 + Math.max(0, s - 1) * 0.2;
      const blend = (a, b, k) => a + (b - a) * k;
      P.legs.forEach((l, i) => {
        const q = i ? -sw : sw;
        l.hip.rotation.x = blend(l.hip.rotation.x, q * amp, 0.3);
        l.knee.rotation.x = blend(l.knee.rotation.x, Math.max(0, -q) * amp * 1.3, 0.3);
        l.ankle.rotation.x = blend(l.ankle.rotation.x, -Math.max(0, q) * amp * 0.4, 0.3);
      });
      P.arms.forEach((a, i) => {
        const q = i ? sw : -sw;
        // arms hang slightly away from the body; the right arm can wave
        let target = q * amp * 0.85, side = (i ? 1 : -1) * 0.08;
        if (i === 1 && waveT > 0) { target = -2.7; side = 0.35; }
        a.sh.rotation.x = blend(a.sh.rotation.x, target, 0.25);
        a.sh.rotation.z = blend(a.sh.rotation.z, side, 0.2);
        a.elbow.rotation.x = blend(a.elbow.rotation.x, i === 1 && waveT > 0 ? -0.4 + Math.sin(breathe * 14) * 0.5 : -0.25 - Math.abs(q) * amp * 0.5, 0.25);
      });
      waveT = Math.max(0, waveT - dt);
      const bob = Math.abs(Math.cos(phase)) * 0.035 * Math.min(1, s);
      P.root.position.y = bob;
      P.torso.rotation.y = sw * 0.08 * amp; P.hips.rotation.y = -sw * 0.06 * amp;
      P.torso.rotation.x = s > 1.2 ? 0.12 : 0;
      P.torso.scale.y = 1 + Math.sin(breathe * 2) * 0.008;
      P.head.rotation.y = Math.sin(breathe * 0.4) * 0.12 * (1 - Math.min(1, s));
      if (P.tail) P.tail.rotation.z = Math.sin(phase) * 0.15 * amp;
      blink -= dt; if (blink < -0.12) blink = 2 + Math.random() * 3;
      P.eyes.forEach(e => { e.scale.y = blink < 0 ? 0.15 : 1; });
    },
    dispose() { owned.splice(0).forEach(x => x.dispose()); }
  };
}
