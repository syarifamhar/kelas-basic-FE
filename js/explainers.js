/* 3D explainers for every lesson that doesn't have its own scene.
   Each entry: { legend: [[color, en, id], …], live?: true, build(v, ctx) → { items, cam } }
   v = the lesson's CSS variables (from the controls), ctx = { tr(en, id), t, data } (see makeExplain in scenes.js). */
(function () {
  var num = function (v, k, d) { var x = parseFloat(v[k]); return isNaN(x) ? d : x; };
  var str = function (v, k, d) { return v[k] == null || String(v[k]).trim() === '' ? d : String(v[k]).trim(); };
  var clamp = function (x, a, b) { return Math.max(a, Math.min(b, x)); };
  function hsl(h, s, l) {
    s /= 100; l /= 100;
    var k = function (n) { return (n + h / 30) % 12; }, a = s * Math.min(l, 1 - l);
    var f = function (n) { return l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1))); };
    return [f(0), f(8), f(4)];
  }
  function lum(c) { var m = c.map(function (v) { return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2]; }
  function hex(c) { return '#' + c.map(function (v) { var s = Math.round(clamp(v, 0, 1) * 255).toString(16); return s.length < 2 ? '0' + s : s; }).join(''); }
  /* cubic-bezier(x1,y1,x2,y2) → progress at time x */
  function bezier(easing) {
    if (!easing || easing === 'linear') return function (x) { return x; };
    var m = String(easing).match(/-?\d*\.?\d+/g); if (!m || m.length < 4) return function (x) { return x; };
    var p = m.map(Number), cx = 3 * p[0], bx = 3 * (p[2] - p[0]) - cx, ax = 1 - cx - bx, cy = 3 * p[1], by = 3 * (p[3] - p[1]) - cy, ay = 1 - cy - by;
    var sx = function (t) { return ((ax * t + bx) * t + cx) * t; }, sy = function (t) { return ((ay * t + by) * t + cy) * t; };
    return function (x) { var t = x; for (var i = 0; i < 8; i++) { var d = (3 * ax * t + 2 * bx) * t + cx; if (Math.abs(d) < 1e-6) break; t -= (sx(t) - x) / d; } return sy(clamp(t, 0, 1)); };
  }
  var GREY = '#5d6a80', MINT = '#7EF2C3', LILAC = '#B9A3FF', AMBER = '#FFC877', PINK = '#FF93B5', SKY = '#7FD4FF', RED = '#FF8A8A', INK = '#E6EDF3';
  /* a little person: body + head */
  function person(items, id, x, y, z, c, o, label, lc) {
    items.push({ id: id + ':b', shape: 'cyl', p: [x, y + 0.65, z], s: [0.7, 1.3, 0.7], c: c, e: 0.35, o: o });
    items.push({ id: id + ':h', shape: 'sphere', p: [x, y + 1.62, z], s: [0.62, 0.62, 0.62], c: c, e: 0.45, o: o, label: label, lc: lc || c });
  }
  function arrow(items, id, a, b, c, o) {
    var dx = b[0] - a[0], dz = b[2] - a[2], dy = b[1] - a[1], len = Math.hypot(dx, dy, dz) || 1;
    items.push({ id: id + ':l', shape: 'line', pts: [a, b], c: c, o: o == null ? 0.9 : o });
    items.push({ id: id + ':h', shape: 'cone', p: [b[0] - dx / len * 0.25, b[1] - dy / len * 0.25, b[2] - dz / len * 0.25], s: [0.32, 0.5, 0.32], r: [0, Math.atan2(-dz, dx), -Math.PI / 2 + Math.atan2(dy, Math.hypot(dx, dz))], c: c, e: 0.6, o: o == null ? 1 : o });
  }

  var X = {};

  /* ───────────── PRINCIPIA · UI/UX theory ───────────── */
  X['ux-process'] = {
    legend: [[MINT, 'Current stage', 'Tahap sekarang'], [SKY, 'Next step', 'Langkah berikutnya'], [PINK, 'Iterate: go back and improve', 'Iterasi: kembali dan perbaiki']],
    build: function (v, x) {
      var cur = clamp(Math.round(num(v, '--stage', 0)), 0, 4), it = [], R = 4.4;
      var names = [['Empathize', 'Empati'], ['Define', 'Definisi'], ['Ideate', 'Ide'], ['Prototype', 'Prototipe'], ['Test', 'Uji']];
      var cols = [MINT, SKY, LILAC, AMBER, PINK], pos = [];
      for (var i = 0; i < 5; i++) {
        var a = -Math.PI / 2 - 0.4 + i * (Math.PI * 2 / 5), px = Math.cos(a) * R, pz = Math.sin(a) * R, on = i === cur, h = on ? 1.1 : 0.35;
        pos.push([px, h, pz]);
        it.push({ id: 'st' + i, shape: 'cyl', p: [px, h / 2, pz], s: [2.2, h, 2.2], c: cols[i], e: on ? 0.9 : 0.12, o: on ? 1 : 0.55, edges: true, label: (i + 1) + ' · ' + x.tr(names[i][0], names[i][1]), lc: cols[i], lh: on ? 0.55 : 0.4 });
      }
      for (var j = 0; j < 4; j++) { var p = pos[j], q = pos[j + 1]; arrow(it, 'ar' + j, [p[0] + (q[0] - p[0]) * 0.28, 0.5, p[2] + (q[2] - p[2]) * 0.28], [p[0] + (q[0] - p[0]) * 0.72, 0.5, p[2] + (q[2] - p[2]) * 0.72], j === cur ? SKY : GREY, j === cur ? 1 : 0.5); }
      arrow(it, 'loop', [pos[4][0] * 0.5, 0.9, pos[4][2] * 0.5], [pos[2][0] * 0.45, 0.9, pos[2][2] * 0.45], PINK, cur === 4 ? 1 : 0.35);
      it.push({ id: 'loopL', shape: 'text', text: x.tr('iterate', 'iterasi'), c: PINK, size: 0.4, p: [(pos[4][0] + pos[2][0]) * 0.25, 1.4, (pos[4][2] + pos[2][2]) * 0.25], o: cur === 4 ? 1 : 0.4 });
      it.push({ id: 'token', shape: 'sphere', p: [pos[cur][0], pos[cur][1] + 0.55, pos[cur][2]], s: [0.6, 0.6, 0.6], c: '#ffffff', e: 1.2, glow: true });
      return { items: it, cam: { r: 13.5, ty: 0.4, phi: 0.78 } };
    }
  };
  X['ux-personas'] = {
    legend: [[MINT, 'Goals', 'Tujuan'], [PINK, 'Frustrations', 'Frustrasi'], [AMBER, 'The persona you design for', 'Persona yang kamu rancang'], [GREY, 'You (not the user)', 'Kamu (bukan pengguna)']],
    build: function (v, x) {
      var p = clamp(Math.round(num(v, '--p', 0)), 0, 2), self = str(v, '--fit', 'persona') === 'self', it = [];
      var P = [
        { n: 'Sari, 20', c: SKY, g: [['cheap meals', 'makan hemat'], ['order between classes', 'pesan di sela kuliah']], f: [['tight budget', 'uang pas-pasan'], ['slow queues', 'antre lama']] },
        { n: 'Andi, 34', c: LILAC, g: [['lunch in 5 min', 'makan siang 5 menit'], ['reorder favorites', 'pesan ulang favorit']], f: [['too many steps', 'langkah terlalu banyak'], ['meetings run late', 'rapat molor']] },
        { n: 'Ratna, 68', c: AMBER, g: [['order for grandkids', 'pesan untuk cucu'], ['read the menu easily', 'menu mudah dibaca']], f: [['small text', 'teks kecil'], ['confusing icons', 'ikon membingungkan']] }
      ];
      P.forEach(function (q, i) {
        var on = i === p, px = (i - p) * 3.6, pz = on ? 0.8 : -1.2, ph = on ? 0.8 : 0.3;
        it.push({ id: 'ped' + i, shape: 'cyl', p: [px, ph / 2, pz], s: [1.6, ph, 1.6], c: on ? q.c : '#263042', e: on ? 0.4 : 0.05, edges: q.c });
        person(it, 'pp' + i, px, ph, pz, q.c, on ? 1 : 0.35, q.n, q.c);
      });
      var sel = P[p], cx = 0;
      sel.g.forEach(function (g, k) { it.push({ id: 'g' + k, shape: 'box', p: [cx - 2.2, 2.6 + k * 1.0, 0.8], s: [0.55, 0.55, 0.55], r: [0.4, 0.6, 0], c: MINT, e: 0.7, label: x.tr(g[0], g[1]), lc: MINT, lh: 0.34 }); });
      sel.f.forEach(function (f, k) { it.push({ id: 'f' + k, shape: 'sphere', p: [cx + 2.2, 2.6 + k * 1.0, 0.8], s: [0.55, 0.55, 0.55], c: PINK, e: 0.7, label: x.tr(f[0], f[1]), lc: PINK, lh: 0.34 }); });
      if (self) {
        person(it, 'me', -2.6, 0, 4.0, GREY, 1, x.tr('you', 'kamu'), INK);
        it.push({ id: 'link', shape: 'line', pts: [[-2.6, 1.4, 4.0], [cx, 1.4, 0.8]], c: RED });
        it.push({ id: 'note', shape: 'text', text: x.tr('you ≠ your user', 'kamu ≠ penggunamu'), c: RED, size: 0.5, p: [cx / 2, 2.6, 2.6] });
      } else {
        it.push({ id: 'ui', shape: 'box', p: [cx, 0.9, 4.2], s: [2.4, 1.6, 0.15], c: sel.c, e: 0.5, edges: true, label: x.tr('design that fits', 'desain yang pas'), lc: sel.c });
        it.push({ id: 'link', shape: 'line', pts: [[cx, 1.4, 1.2], [cx, 1.2, 4.1]], c: MINT });
      }
      return { items: it, cam: { r: 15, ty: 1.4 } };
    }
  };
  X['ux-flows'] = {
    legend: [[SKY, 'Users still in the flow', 'Pengguna yang masih bertahan'], [PINK, 'Detour step (sign-up, verify)', 'Langkah memutar (daftar, verifikasi)'], [AMBER, 'Reached the goal', 'Sampai tujuan']],
    build: function (v, x) {
      var long = str(v, '--flow', 'long') === 'long', drop = num(v, '--drop', 15) / 100, it = [];
      var steps = long ? [['Cart', 'Keranjang'], ['Sign up', 'Daftar', 1], ['Verify email', 'Verifikasi', 1], ['Address', 'Alamat'], ['Payment', 'Bayar'], ['Review', 'Tinjau'], ['Done', 'Selesai']]
        : [['Cart', 'Keranjang'], ['Address', 'Alamat'], ['Payment', 'Bayar'], ['Done', 'Selesai']];
      var n = steps.length, gap = 2.3, users = 1000;
      steps.forEach(function (s, i) {
        var u = Math.round(1000 * Math.pow(1 - drop, i)), h = 0.3 + u / 1000 * 5, px = (i - (n - 1) / 2) * gap, last = i === n - 1;
        it.push({ id: 'stone' + i, shape: 'box', p: [px, 0.1, 0], s: [1.8, 0.2, 1.8], c: s[2] ? PINK : '#263042', e: 0.2, edges: s[2] ? PINK : SKY, label: x.tr(s[0], s[1]), lc: s[2] ? PINK : INK, ly: -0.5 });
        it.push({ id: 'bar' + i, shape: 'cyl', p: [px, 0.2 + h / 2, 0], s: [1.1, h, 1.1], c: last ? AMBER : (s[2] ? PINK : SKY), e: 0.55, o: 0.9, label: String(u), lc: last ? AMBER : INK, lmono: true });
        if (i < n - 1) arrow(it, 'a' + i, [px + 0.95, 0.3, 0], [px + gap - 0.95, 0.3, 0], GREY, 0.7);
        users = u;
      });
      it.push({ id: 'trophy', shape: 'oct', p: [((n - 1) / 2) * gap, 0.2 + (0.3 + users / 1000 * 5) + 1, 0], s: [0.8, 0.8, 0.8], c: AMBER, e: 1, glow: true });
      it.push({ id: 'cap', shape: 'text', text: x.tr(users + ' of 1000 finish', users + ' dari 1000 selesai'), c: AMBER, size: 0.55, p: [0, 6.8, 0] });
      return { items: it, cam: { r: 6 + n * 2.1, ty: 2.4 } };
    }
  };
  X.hierarchy = {
    legend: [[AMBER, 'Focal point: the tallest tower', 'Titik fokus: menara tertinggi'], [SKY, 'Visual weight (size, color, contrast)', 'Bobot visual (ukuran, warna, kontras)'], [GREY, 'Quiet elements', 'Elemen yang tenang']],
    build: function (v, x) {
      var title = num(v, '--title', 16), amber = /ffc877/i.test(str(v, '--price', '')), solid = /7ef2c3/i.test(str(v, '--btn', ''));
      var els = [
        { id: 'tag', n: ['Tag', 'Label'], w: 0.7 },
        { id: 'title', n: ['Title', 'Judul'], w: title / 16 * 1.25 },
        { id: 'price', n: ['Price', 'Harga'], w: amber ? 1.9 : 1.0 },
        { id: 'desc', n: ['Description', 'Deskripsi'], w: 0.9 },
        { id: 'btn', n: ['Button', 'Tombol'], w: solid ? 2.3 : 0.8 }
      ];
      var max = Math.max.apply(null, els.map(function (e) { return e.w; })), it = [];
      var tops = els.filter(function (e) { return e.w > max - 0.25; }).length;
      els.forEach(function (e, i) {
        var h = e.w * 1.6, top = e.w === max, px = (i - 2) * 1.9;
        it.push({ id: e.id, shape: 'box', p: [px, h / 2, 0], s: [1.3, h, 1.3], c: top ? AMBER : (e.w > 1.1 ? SKY : GREY), e: top ? 0.8 : 0.25, edges: true, label: x.tr(e.n[0], e.n[1]), lc: top ? AMBER : INK });
        if (top) it.push({ id: 'crown', shape: 'oct', p: [px, h + 1.0, 0], s: [0.55, 0.55, 0.55], c: AMBER, e: 1.2, glow: true });
      });
      it.push({ id: 'cap', shape: 'text', text: tops > 1 ? x.tr('two things shout: no clear focus', 'dua elemen berteriak: tidak ada fokus') : x.tr('one clear focal point', 'satu titik fokus yang jelas'), c: tops > 1 ? RED : MINT, size: 0.5, p: [0, max * 1.6 + 2.2, 0] });
      return { items: it, cam: { r: 15, ty: 2 } };
    }
  };
  X.gestalt = {
    legend: [[MINT, 'Read as one group', 'Terbaca sebagai satu kelompok'], [GREY, 'No grouping cue', 'Tidak ada petunjuk kelompok'], ['#3a4862', 'Common region (tray)', 'Wilayah bersama (nampan)']],
    build: function (v, x) {
      var inG = num(v, '--in', 16) / 16, between = num(v, '--between', 16) / 16, region = str(v, '--region', 'transparent') !== 'transparent';
      var map = { '#263042': GREY, '#1f4a3c': MINT, '#3a2f66': LILAC, '#5a4520': AMBER };
      var cols = [1, 2, 3].map(function (k) { return map[str(v, '--c' + k, '#263042').toLowerCase()] || GREY; });
      var chip = 0.9, gw = 3 * chip + 2 * inG * 0.9, total = 3 * gw + 2 * between * 1.1, it = [], x0 = -total / 2;
      var grouped = region || between >= inG * 1.8;
      var names = [['forks', 'garpu'], ['spoons', 'sendok'], ['knives', 'pisau']];
      for (var g = 0; g < 3; g++) {
        var gx = x0 + g * (gw + between * 1.1);
        for (var k = 0; k < 3; k++) it.push({ id: 'c' + g + k, shape: 'box', p: [gx + chip / 2 + k * (chip + inG * 0.9), 0.35, 0], s: [chip, 0.5, chip], c: cols[g], e: cols[g] === GREY ? 0.1 : 0.45, edges: true });
        if (region) it.push({ id: 'tray' + g, shape: 'box', p: [gx + gw / 2, 0.04, 0], s: [gw + 0.6, 0.08, chip + 0.8], c: '#3a4862', e: 0.2, edges: SKY });
        it.push({ id: 'lab' + g, shape: 'text', text: grouped ? x.tr(names[g][0], names[g][1]) : '?', c: grouped ? MINT : GREY, size: 0.42, p: [gx + gw / 2, 1.35, 0] });
      }
      it.push({ id: 'cap', shape: 'text', text: grouped ? x.tr('3 groups: the eye sorts them instantly', '3 kelompok: mata langsung memilahnya') : x.tr('one long row: no groups yet', 'satu baris panjang: belum ada kelompok'), c: grouped ? MINT : AMBER, size: 0.48, p: [0, 2.6, 0] });
      return { items: it, cam: { r: Math.max(12, total * 1.2 + 4), ty: 0.8 } };
    }
  };
  X.color = {
    legend: [[MINT, 'Passes AA (4.5:1)', 'Lolos AA (4.5:1)'], [AMBER, 'Large text only (3:1)', 'Hanya teks besar (3:1)'], [RED, 'Fails', 'Gagal']],
    build: function (v, x) {
      var hue = num(v, '--hue', 150), bg = hsl(hue, 45, num(v, '--bgL', 40)), fg = hsl(hue, 30, num(v, '--fgL', 62));
      var a = lum(fg), b = lum(bg), ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05), h = ratio / 21 * 7;
      var c = ratio >= 4.5 ? MINT : ratio >= 3 ? AMBER : RED, it = [];
      it.push({ id: 'sign', shape: 'box', p: [-3, 1.9, 0], s: [4.6, 2.8, 0.15], c: hex(bg), flat: true, edges: '#3a4862' });
      it.push({ id: 'txt', shape: 'box', p: [-3, 2.3, 0.1], s: [3.2, 0.7, 0.06], c: hex(fg), flat: true });
      it.push({ id: 'txt2', shape: 'box', p: [-3.4, 1.4, 0.1], s: [2.4, 0.3, 0.06], c: hex(fg), flat: true });
      it.push({ id: 'post', shape: 'cyl', p: [-3, 0.25, 0], s: [0.15, 0.5, 0.15], c: GREY });
      it.push({ id: 'bar', shape: 'cyl', p: [2.6, h / 2, 0], s: [0.9, h, 0.9], c: c, e: 0.7 });
      it.push({ id: 'ratio', shape: 'text', text: ratio.toFixed(2) + ':1', c: c, size: 0.75, mono: true, p: [2.6, 3.4, 0] });
      [[3, 'AA large'], [4.5, 'AA'], [7, 'AAA']].forEach(function (t, i) {
        var y = t[0] / 21 * 7;
        it.push({ id: 'ring' + i, shape: 'torus', p: [2.6, y, 0], s: [1.7, 1.7, 1.7], r: [Math.PI / 2, 0, 0], c: ratio >= t[0] ? MINT : GREY, e: 0.6 });
        it.push({ id: 'rl' + i, shape: 'text', text: t[1] + ' ' + t[0], c: ratio >= t[0] ? MINT : GREY, size: 0.36, mono: true, p: [4.5, y, 0] });
      });
      return { items: it, cam: { r: 14, ty: 1.8 } };
    }
  };
  X.type = {
    legend: [[LILAC, 'Each step = base × ratio', 'Setiap anak tangga = dasar × rasio'], [MINT, 'Comfortable line length (45–75ch)', 'Panjang baris nyaman (45–75ch)'], [RED, 'Too short or too long', 'Terlalu pendek atau terlalu panjang']],
    build: function (v, x) {
      var base = num(v, '--base', 16), r = num(v, '--r', 1.25), lh = num(v, '--lh', 1.5), measure = num(v, '--measure', 60), it = [];
      var steps = [[-1, 'small'], [0, 'body'], [1, ''], [2, 'h2'], [3, ''], [4, 'h1']];
      steps.forEach(function (s, i) {
        var px = base * Math.pow(r, s[0]), h = px / 16, used = s[1] !== '';
        it.push({ id: 's' + i, shape: 'box', p: [(i - 2.5) * 1.5, h / 2, 0], s: [1.3, h, 1.3], c: used ? LILAC : '#3a4862', e: used ? 0.5 : 0.1, edges: true, label: Math.round(px) + 'px' + (s[1] ? ' ' + s[1] : ''), lc: used ? INK : GREY, lmono: true });
      });
      for (var k = 0; k < 3; k++) it.push({ id: 'ln' + k, shape: 'box', p: [-1.5, 0.15 + k * lh * 0.35, 2.4], s: [Math.min(9, measure / 9), 0.1, 0.5], c: measure >= 45 && measure <= 75 ? MINT : RED, e: 0.5, o: 0.9 });
      it.push({ id: 'cap', shape: 'text', text: x.tr('line height ', 'line height ') + lh.toFixed(2) + ' · ' + measure + 'ch', c: measure >= 45 && measure <= 75 ? MINT : RED, size: 0.42, mono: true, p: [-1.5, 1.4, 2.4] });
      return { items: it, cam: { r: 16, ty: 2.2 } };
    }
  };
  X.spacing = {
    legend: [[MINT, 'On the grid', 'Sesuai grid'], [RED, 'Off the grid', 'Keluar grid'], [SKY, 'Grid studs (base unit)', 'Tonjolan grid (satuan dasar)']],
    build: function (v, x) {
      var u = num(v, '--u', 8), grid = str(v, '--grid', 'none') !== 'none';
      var val = function (k) { var s = str(v, k, '8px'); if (s.indexOf('calc') >= 0) { var m = s.match(/\*\s*([\d.]+)/); return u * (m ? +m[1] : 1); } return parseFloat(s) || 0; };
      var a = val('--a'), b = val('--b'), c = val('--c'), d = val('--d'), S = 1 / 8, it = [];
      var ok = function (px) { return px % 4 === 0; };
      var studs = 0;
      for (var gx = -5; gx <= 5; gx += u * S) for (var gz = -4; gz <= 4; gz += u * S) { if (studs++ > 160) break; it.push({ id: 'stud' + studs, shape: 'cyl', p: [gx, 0.05, gz], s: [0.22, 0.1, 0.22], c: SKY, e: 0.3, o: grid ? 0.8 : 0.18 }); }
      var z = -3.2 + d * S, blocks = [['title', 0.5, ['Title', 'Judul']], ['text', 0.35, ['Text', 'Teks']], ['row', 0.6], ['row2', 0.6], ['row3', 0.6], ['btn', 0.6, ['Button', 'Tombol']]];
      var gaps = [c, c + a, c + a * 2, c + a * 2, c + b];
      it.push({ id: 'card', shape: 'box', p: [0, 0.12, 0], s: [8, 0.12, 7], c: '#1A2130', e: 0.1, edges: '#3a4862' });
      blocks.forEach(function (bk, i) {
        var w = bk[0] === 'btn' ? 2 : 8 - 2 * d * S;
        it.push({ id: bk[0], shape: 'box', p: [bk[0] === 'btn' ? -4 + d * S + 1 : 0, 0.35, z + bk[1] / 2], s: [w, 0.25, bk[1]], c: bk[0] === 'btn' ? MINT : '#3a4862', e: 0.3, edges: true, label: bk[2] ? x.tr(bk[2][0], bk[2][1]) : null, lc: INK, lh: 0.32 });
        z += bk[1];
        if (i < gaps.length) { var g = gaps[i]; it.push({ id: 'gap' + i, shape: 'sphere', p: [4.4, 0.4, z + g * S / 2], s: [0.28, 0.28, 0.28], c: ok(g) ? MINT : RED, e: 0.8, label: g + 'px', lc: ok(g) ? MINT : RED, lh: 0.3, lmono: true }); z += g * S; }
      });
      var bad = [a, b, c, d].filter(function (p) { return !ok(p); }).length;
      it.push({ id: 'cap', shape: 'text', text: bad ? x.tr(bad + ' gaps off the grid', bad + ' jarak keluar grid') : x.tr('everything snaps to ' + u + 'px', 'semua pas di kelipatan ' + u + 'px'), c: bad ? RED : MINT, size: 0.5, p: [0, 2.2, 0] });
      return { items: it, cam: { r: 14, ty: 0.4 } };
    }
  };
  X['fitts-hick'] = {
    legend: [[AMBER, 'Target (bigger, closer = faster)', 'Target (makin besar & dekat = makin cepat)'], [PINK, 'Effort to hit it (Fitts)', 'Usaha mengenainya (Fitts)'], [LILAC, 'Time to decide (Hick)', 'Waktu memutuskan (Hick)']],
    build: function (v, x) {
      var size = num(v, '--size', 28), dist = num(v, '--dist', 260), n = clamp(Math.round(num(v, '--n', 16)), 1, 24), it = [];
      var W = size / 32, D = dist / 40, id = Math.log2(2 * dist / size + 1), hk = Math.log2(n + 1);
      it.push({ id: 'lane', shape: 'box', p: [-4.2, 0.02, 0], s: [8.4, 0.04, 2.6], c: '#1A2130', edges: '#3a4862' });
      it.push({ id: 'start', shape: 'cyl', p: [-8, 0.15, 0], s: [0.6, 0.3, 0.6], c: SKY, e: 0.6, label: x.tr('start', 'mulai'), lc: SKY });
      it.push({ id: 'target', shape: 'cyl', p: [-8 + 0.5 + D, 0.2, 0], s: [W, 0.4, W], c: AMBER, e: 0.8, glow: true, label: size + 'px', lc: AMBER, lmono: true });
      it.push({ id: 'path', shape: 'line', pts: [[-8, 0.4, 0], [-8 + 0.5 + D, 0.4, 0]], c: AMBER, o: 0.7 });
      it.push({ id: 'fitts', shape: 'box', p: [-4.2, id * 0.45, -2.4], s: [0.9, id * 0.9, 0.9], c: PINK, e: 0.6, label: x.tr('effort ', 'usaha ') + id.toFixed(1), lc: PINK, lmono: true });
      var cols = Math.ceil(Math.sqrt(n));
      for (var i = 0; i < 24; i++) {
        if (i >= n) continue;
        var cx = 2.2 + (i % cols) * 0.75, cz = -1.2 + Math.floor(i / cols) * 0.75;
        it.push({ id: 'door' + i, shape: 'box', p: [cx, 0.35, cz], s: [0.55, 0.7, 0.1], c: i === 0 ? MINT : '#3a4862', e: i === 0 ? 0.8 : 0.15, edges: i === 0 ? MINT : GREY });
      }
      it.push({ id: 'hick', shape: 'box', p: [2.2 + cols * 0.75 + 0.8, hk * 0.45, 0], s: [0.9, hk * 0.9, 0.9], c: LILAC, e: 0.6, label: n + x.tr(' choices', ' pilihan'), lc: LILAC, lmono: true });
      return { items: it, cam: { r: 17, ty: 1.4 } };
    }
  };
  X.affordance = {
    live: true,
    legend: [[MINT, 'Looks pressable (signifier)', 'Terlihat bisa ditekan (signifier)'], [AMBER, 'Feedback: it heard you', 'Feedback: tombol merespons'], [GREY, 'No clue, no answer', 'Tanpa petunjuk, tanpa jawaban']],
    build: function (v, x) {
      var bg = str(v, '--btn-bg', 'transparent'), bd = str(v, '--btn-bd', 'transparent'), fb = num(v, '--fb', 0), it = [];
      var level = bg !== 'transparent' ? 2 : bd !== 'transparent' ? 1 : 0, ph = (x.t % 2.4) / 2.4, pressed = ph > 0.1 && ph < 0.25;
      var depth = level === 2 ? 0.6 : 0.12, dip = fb >= 1 && pressed ? depth * 0.6 : 0;
      if (level === 2) it.push({ id: 'base', shape: 'box', p: [0, 0.1, 0], s: [3.4, 0.2, 1.6], c: '#2f7d61', e: 0.2 });
      it.push({ id: 'btn', shape: 'box', p: [0, 0.2 + depth / 2 - dip, 0], s: [3.2, depth, 1.4], c: level === 2 ? MINT : level === 1 ? '#0D1016' : '#1A2130', e: level === 2 ? 0.6 : 0.1, o: level === 0 ? 0.4 : 1, edges: level === 1 ? MINT : level === 2 ? true : false, snap: true,
        label: [x.tr('plain text: is it a button?', 'teks biasa: ini tombol?'), x.tr('outlined: probably clickable', 'garis tepi: sepertinya bisa diklik'), x.tr('raised: obviously pressable', 'timbul: jelas bisa ditekan')][level], lc: level ? MINT : GREY });
      it.push({ id: 'finger', shape: 'cone', p: [0.6, pressed ? 1.2 : 2.2, 0.3], s: [0.35, 0.8, 0.35], r: [Math.PI, 0, 0], c: INK, e: 0.3, snap: true });
      if (fb >= 1) it.push({ id: 'ring', shape: 'torus', p: [0, 0.35, 0], s: [pressed ? 4.4 : 3.6, pressed ? 4.4 : 3.6, 3.6], r: [Math.PI / 2, 0, 0], c: AMBER, e: 1, o: pressed ? 1 : 0.25, snap: true });
      if (fb >= 2) for (var i = 0; i < 6; i++) { var lit = Math.floor(ph * 8) >= i; it.push({ id: 'floor' + i, shape: 'box', p: [3, 0.3 + i * 0.45, -0.4], s: [0.5, 0.35, 0.5], c: lit ? MINT : '#263042', e: lit ? 0.8 : 0.05, snap: true }); }
      if (fb >= 2) it.push({ id: 'fl', shape: 'text', text: x.tr('elevator coming', 'lift datang'), c: MINT, size: 0.38, p: [3, 3.4, -0.4] });
      if (fb === 0) it.push({ id: 'q', shape: 'text', text: x.tr('...did it work?', '...berhasil nggak?'), c: GREY, size: 0.5, p: [0, 2.6, 0] });
      return { items: it, cam: { r: 11, ty: 1.2 } };
    }
  };
  X.a11y = {
    live: true,
    legend: [[MINT, 'Real labels that stay visible', 'Label asli yang tetap terlihat'], [AMBER, 'Focus ring (keyboard position)', 'Focus ring (posisi keyboard)'], [GREY, 'Placeholder only: fades away', 'Hanya placeholder: menghilang']],
    build: function (v, x) {
      var labels = str(v, '--label', 'none') !== 'none', ring = str(v, '--ring', 'none') !== 'none', filter = str(v, '--filter', 'none'), it = [];
      var o = filter.indexOf('blur') >= 0 ? 0.45 : 1, gray = filter.indexOf('grayscale') >= 0;
      var col = function (c) { return gray ? '#9aa3ad' : c; };
      var focus = Math.floor(x.t / 1.3) % 3;
      [['email', ['Email', 'Email'], 1.6, '#0D1016'], ['pass', ['Password', 'Kata sandi'], 0, '#0D1016'], ['btn', ['Sign in', 'Masuk'], -1.6, MINT]].forEach(function (f, i) {
        it.push({ id: f[0], shape: 'box', p: [0, 0.3, -f[2]], s: [4.4, 0.3, 1.0], c: col(f[3]), e: f[0] === 'btn' ? 0.5 : 0.1, o: o, edges: '#3a4862' });
        if (f[0] !== 'btn') {
          if (labels) it.push({ id: f[0] + 'L', shape: 'text', text: x.tr(f[1][0], f[1][1]), c: col(MINT), size: 0.38, p: [-1.4, 0.85, -f[2] - 0.55], o: o });
          else it.push({ id: f[0] + 'P', shape: 'text', text: x.tr(f[1][0] + ' (placeholder)', f[1][1] + ' (placeholder)'), c: GREY, size: 0.32, p: [0, 0.55, -f[2]], o: 0.35 * o });
        }
        if (ring && i === focus) it.push({ id: 'ring', shape: 'box', p: [0, 0.3, -f[2]], s: [4.9, 0.45, 1.45], c: col(AMBER), e: 1, o: 0.35, edges: col(AMBER), snap: false });
      });
      if (!ring) it.push({ id: 'lost', shape: 'text', text: x.tr('Tab... where am I?', 'Tab... aku di mana?'), c: RED, size: 0.45, p: [0, 2.2, 0] });
      else it.push({ id: 'kb', shape: 'text', text: x.tr('Tab moves the amber ring', 'Tab memindahkan ring amber'), c: AMBER, size: 0.4, p: [0, 2.2, 0] });
      return { items: it, cam: { r: 10, ty: 0.6 } };
    }
  };
  X.motion = {
    live: true,
    legend: [[MINT, 'The moving element', 'Elemen yang bergerak'], [LILAC, 'Easing curve: progress over time', 'Kurva easing: progres terhadap waktu'], [AMBER, 'Now', 'Sekarang']],
    build: function (v, x) {
      var dur = Math.max(0.05, num(v, '--dur', 400) / 1000), ease = bezier(str(v, '--ease', 'linear')), it = [];
      var period = dur * 2 + 1.2, ph = x.t % period, k, back = false;
      if (ph < dur) k = ph / dur; else if (ph < dur + 0.6) k = 1; else if (ph < dur * 2 + 0.6) { k = 1 - (ph - dur - 0.6) / dur; back = true; } else k = 0;
      var p = back ? 1 - ease(1 - k) : ease(k);
      it.push({ id: 'track', shape: 'box', p: [0, 0.05, 2.2], s: [9, 0.1, 1.2], c: '#1A2130', edges: '#3a4862' });
      it.push({ id: 'ball', shape: 'box', p: [-4 + p * 8, 0.45, 2.2], s: [0.8, 0.7, 0.8], c: MINT, e: 0.8, glow: true, snap: true });
      for (var i = 0; i <= 20; i++) { var t = i / 20, y = ease(t); it.push({ id: 'dot' + i, shape: 'sphere', p: [-4 + t * 8, 0.3 + y * 4, -1.2], s: [0.18, 0.18, 0.18], c: LILAC, e: 0.6, snap: true }); }
      var tk = back ? 1 - k : k;
      it.push({ id: 'now', shape: 'sphere', p: [-4 + tk * 8, 0.3 + ease(tk) * 4, -1.2], s: [0.42, 0.42, 0.42], c: AMBER, e: 1.2, glow: true, snap: true });
      it.push({ id: 'ax', shape: 'line', pts: [[-4, 0.3, -1.2], [4.4, 0.3, -1.2]], c: GREY });
      it.push({ id: 'ay', shape: 'line', pts: [[-4, 0.3, -1.2], [-4, 4.6, -1.2]], c: GREY });
      it.push({ id: 'lx', shape: 'text', text: x.tr('time', 'waktu') + ' · ' + Math.round(dur * 1000) + 'ms', c: GREY, size: 0.32, mono: true, p: [3.4, 0.0, -1.2] });
      it.push({ id: 'ly', shape: 'text', text: x.tr('progress', 'progres'), c: GREY, size: 0.32, mono: true, p: [-4.6, 4.8, -1.2] });
      return { items: it, cam: { r: 13, ty: 1.8 } };
    }
  };
  X['ux-heuristics'] = {
    legend: [[MINT, 'Heuristic passes', 'Heuristik lolos'], [RED, 'Problem found', 'Masalah ditemukan'], [AMBER, 'The app under review', 'Aplikasi yang diperiksa']],
    build: function (v, x) {
      var fixes = clamp(Math.round(num(v, '--fixes', 0)), 0, 5), it = [];
      var H = [['Status', 'Status'], ['Real words', 'Kata nyata'], ['Undo', 'Undo'], ['Consistency', 'Konsistensi'], ['Prevent errors', 'Cegah error'], ['Recognize', 'Kenali'], ['Shortcuts', 'Pintasan'], ['Minimal', 'Minimalis'], ['Error help', 'Bantuan error'], ['Help docs', 'Dokumentasi']];
      var broken = [0, 1, 2, 4, 5], pass = 10;
      H.forEach(function (h, i) {
        var a = i / 10 * Math.PI * 2, px = Math.cos(a) * 5, pz = Math.sin(a) * 4, bi = broken.indexOf(i), ok = bi < 0 || bi < fixes;
        if (!ok) pass--;
        it.push({ id: 'post' + i, shape: 'cyl', p: [px, 0.8, pz], s: [0.12, 1.6, 0.12], c: GREY });
        it.push({ id: 'lamp' + i, shape: 'sphere', p: [px, 1.8, pz], s: [0.55, 0.55, 0.55], c: ok ? MINT : RED, e: 1, glow: !ok, label: x.tr(h[0], h[1]), lc: ok ? INK : RED, lh: 0.32 });
      });
      it.push({ id: 'app', shape: 'box', p: [0, 1.2, 0], s: [2, 2.4, 2], c: '#1A2130', e: 0.2, edges: AMBER });
      it.push({ id: 'score', shape: 'text', text: pass + '/10', c: pass === 10 ? MINT : AMBER, size: 0.8, mono: true, p: [0, 3.2, 0] });
      return { items: it, cam: { r: 15, ty: 1.4 } };
    }
  };

  /* ───────────── VECTORIA · Figma ───────────── */
  var FIG = '#0D99FF';
  X['figma-basics'] = {
    legend: [[FIG, 'Selected layer', 'Layer terpilih'], [LILAC, 'Frame (the container)', 'Frame (wadahnya)'], [GREY, 'Other layers in the stack', 'Layer lain di tumpukan']],
    build: function (v, x) {
      var ex = num(v, '--ex', 4) / 10, sel = str(v, '--sel', 'card'), it = [];
      var L = [['bg', ['Frame', 'Frame'], [0, 0], [7, 4.6], '#1A2130'], ['card', ['Card', 'Kartu'], [0, 0], [4.8, 3.4], '#263042'], ['img', ['Image', 'Gambar'], [0, -0.6], [4, 1.3], '#B9A3FF'], ['title', ['Title', 'Judul'], [-0.6, 0.6], [2.6, 0.4], '#E6EDF3'], ['btn', ['Button', 'Tombol'], [-1, 1.3], [1.6, 0.5], '#7EF2C3']];
      L.forEach(function (l, i) {
        var on = l[0] === sel, y = 0.1 + i * (0.08 + ex * 1.1);
        it.push({ id: l[0], shape: 'box', p: [l[2][0], y, l[2][1]], s: [l[3][0], 0.06, l[3][1]], c: l[4], e: on ? 0.5 : 0.15, o: on ? 0.95 : 0.6, edges: on ? FIG : (i === 0 ? LILAC : '#3a4862'), label: x.tr(l[1][0], l[1][1]), lc: on ? FIG : GREY, lh: on ? 0.42 : 0.32 });
      });
      it.push({ id: 'cap', shape: 'text', text: x.tr('top of the Layers list = top of the stack', 'paling atas di daftar Layers = paling depan'), c: INK, size: 0.38, p: [0, 0.6 + 4 * (0.08 + ex * 1.1) + 1.2, 0] });
      return { items: it, cam: { r: 13, ty: 1 + ex * 2 } };
    }
  };
  X['figma-components'] = {
    legend: [[LILAC, 'Auto layout frame', 'Frame auto layout'], [AMBER, 'Main component ◆', 'Main component ◆'], [MINT, 'Instances ◇ follow the main', 'Instance ◇ mengikuti main']],
    build: function (v, x) {
      var row = str(v, '--dir', 'row') === 'row', gap = num(v, '--gap', 12) / 12 * 0.5, pad = num(v, '--pad', 16) / 16 * 0.5, fill = str(v, '--fill', '0 0 auto').indexOf('1 1') === 0, main = str(v, '--main', MINT), it = [];
      var n = 3, w = 1.6, d = 0.6, fw = row ? (fill ? 8 : n * w + (n - 1) * gap + 2 * pad) : (fill ? 5 : w + 2 * pad), fd = row ? d + 2 * pad : n * d + (n - 1) * gap + 2 * pad;
      var iw = row ? (fill ? (fw - 2 * pad - (n - 1) * gap) / n : w) : (fill ? fw - 2 * pad : w);
      it.push({ id: 'frame', shape: 'box', p: [1, 0.05, 0], s: [fw, 0.1, fd], c: '#2C2547', o: 0.6, edges: LILAC, label: 'auto layout', lc: LILAC, ly: 0.2 });
      for (var i = 0; i < n; i++) {
        var px = row ? 1 - fw / 2 + pad + iw / 2 + i * (iw + gap) : 1, pz = row ? 0 : -fd / 2 + pad + d / 2 + i * (d + gap);
        it.push({ id: 'inst' + i, shape: 'box', p: [px, 0.35, pz], s: [iw, 0.5, d], c: main, e: 0.55, edges: true, label: i === 0 ? '◇ instance' : null, lc: main });
        it.push({ id: 'ln' + i, shape: 'line', pts: [[-5.5, 1.6, 0], [px, 0.6, pz]], c: main, o: 0.5 });
      }
      it.push({ id: 'main', shape: 'oct', p: [-5.5, 1.6, 0], s: [1.1, 1.1, 1.1], c: main, e: 0.9, glow: true, label: '◆ main', lc: AMBER });
      it.push({ id: 'ped', shape: 'cyl', p: [-5.5, 0.5, 0], s: [1, 1, 1], c: '#1A2130', edges: AMBER });
      return { items: it, cam: { r: 14, ty: 0.8 } };
    }
  };
  X.tokens = {
    legend: [[AMBER, 'Token jars (variables)', 'Toples token (variable)'], [SKY, 'Where each token is used', 'Tempat token dipakai'], [MINT, 'Components update together', 'Komponen ikut berubah bersama']],
    build: function (v, x) {
      var bg = str(v, '--t-bg', '#131821'), sf = str(v, '--t-surface', '#1A2130'), ink = str(v, '--t-ink', INK), ac = str(v, '--t-accent', MINT), rad = num(v, '--t-radius', 10), sp = num(v, '--t-space', 8) / 8 * 0.35, it = [];
      it.push({ id: 'shelf', shape: 'box', p: [-3.6, 1.2, 0], s: [1.4, 0.15, 6], c: '#3a2f2a' });
      [['accent', ac], ['surface', sf], ['ink', ink], ['bg', bg]].forEach(function (j, i) {
        var z = -2.2 + i * 1.5;
        it.push({ id: 'jar' + i, shape: 'cyl', p: [-3.6, 1.85, z], s: [0.9, 1.2, 0.9], c: j[1], flat: true, edges: '#E6EDF3', label: 'color-' + j[0], lc: AMBER, lmono: true, lh: 0.3 });
      });
      it.push({ id: 'bgP', shape: 'box', p: [2.6, 0.05, 0], s: [6, 0.1, 5], c: bg, flat: true, edges: '#3a4862' });
      it.push({ id: 'card', shape: 'box', p: [2.6, 0.25, 0], s: [4.4, 0.25, 3.4], c: sf, flat: true, edges: true, label: 'radius ' + rad + 'px · space ' + num(v, '--t-space', 8) + 'px', lc: INK, lmono: true, lh: 0.3, ly: 0.4 });
      it.push({ id: 'ttl', shape: 'box', p: [1.7, 0.42, -1.1 + sp], s: [2.2, 0.08, 0.35], c: ink, flat: true });
      it.push({ id: 'b1', shape: 'box', p: [1.3, 0.45, 0.9], s: [1.4, 0.2, 0.6], c: ac, flat: true });
      it.push({ id: 'b2', shape: 'box', p: [2.9 + sp, 0.45, 0.9], s: [1.4, 0.2, 0.6], c: sf, flat: true, edges: ink });
      it.push({ id: 'l1', shape: 'line', pts: [[-3.1, 1.9, -2.2], [1.3, 0.6, 0.9]], c: SKY, o: 0.6 });
      it.push({ id: 'l2', shape: 'line', pts: [[-3.1, 1.9, -0.7], [2.6, 0.4, 0]], c: SKY, o: 0.6 });
      it.push({ id: 'l3', shape: 'line', pts: [[-3.1, 1.9, 0.8], [1.7, 0.5, -1.1]], c: SKY, o: 0.6 });
      it.push({ id: 'l4', shape: 'line', pts: [[-3.1, 1.9, 2.3], [2.6, 0.1, 2.4]], c: SKY, o: 0.6 });
      return { items: it, cam: { r: 14, ty: 1 } };
    }
  };
  X['figma-prototype'] = {
    live: true,
    legend: [[FIG, 'Connection (interaction)', 'Koneksi (interaksi)'], [MINT, 'Layer with the same name on both screens', 'Layer bernama sama di kedua layar'], [AMBER, 'Trigger', 'Pemicu']],
    build: function (v, x) {
      var trig = str(v, '--trig', 'click'), anim = str(v, '--anim', 'smart'), dur = Math.max(0.1, num(v, '--dur', 300) / 1000), it = [];
      var P = dur + 2.2, ph = x.t % P, before = 1.0, k = clamp((ph - before) / dur, 0, 1), e = 1 - Math.pow(1 - k, 3);
      it.push({ id: 'A', shape: 'box', p: [-3.2, 2.2, 0], s: [2.6, 4.4, 0.15], c: '#131821', edges: '#3a4862', label: x.tr('Screen A · list', 'Layar A · daftar'), lc: GREY, ly: 0.1 });
      it.push({ id: 'B', shape: 'box', p: [3.2, 2.2, 0], s: [2.6, 4.4, 0.15], c: '#131821', edges: '#3a4862', label: x.tr('Screen B · detail', 'Layar B · detail'), lc: GREY, ly: 0.1 });
      arrow(it, 'conn', [-1.6, 3.4, 0.2], [1.6, 3.4, 0.2], FIG, 1);
      it.push({ id: 'trig', shape: 'text', text: trig === 'delay' ? x.tr('After delay', 'Setelah jeda') : x.tr('On click', 'Saat diklik'), c: AMBER, size: 0.4, p: [0, 3.95, 0.2] });
      var a = { p: [-3.2, 3.1, 0.15], s: [2.0, 0.8, 0.1] }, b = { p: [3.2, 2.6, 0.15], s: [2.3, 2.2, 0.1] };
      if (anim === 'smart') {
        var lp = function (i) { return a.p[i] + (b.p[i] - a.p[i]) * e; }, ls = function (i) { return a.s[i] + (b.s[i] - a.s[i]) * e; };
        it.push({ id: 'card', shape: 'box', p: [lp(0), lp(1), lp(2) + Math.sin(e * Math.PI) * 0.8], s: [ls(0), ls(1), ls(2)], c: MINT, e: 0.7, glow: true, snap: true, label: 'Card', lc: MINT });
        it.push({ id: 'cardB', shape: 'box', p: b.p, s: b.s, c: MINT, o: 0, snap: true });
      } else {
        var oa = anim === 'dissolve' ? 1 - k : (k > 0 ? 0 : 1), ob = anim === 'dissolve' ? k : (k > 0 ? 1 : 0);
        it.push({ id: 'card', shape: 'box', p: a.p, s: a.s, c: MINT, e: 0.7, o: oa, snap: true, label: 'Card', lc: MINT });
        it.push({ id: 'cardB', shape: 'box', p: b.p, s: b.s, c: MINT, e: 0.7, o: ob, snap: true });
      }
      if (trig === 'click') it.push({ id: 'tap', shape: 'sphere', p: [-3.2, 3.1, 0.6], s: [0.4, 0.4, 0.4], c: AMBER, e: 1, o: ph > before - 0.4 && ph < before ? 1 : 0, snap: true, glow: true });
      else it.push({ id: 'clock', shape: 'torus', p: [-3.2, 4.9, 0.2], s: [0.8, 0.8, 0.8], r: [0, 0, -Math.min(1, ph / before) * Math.PI * 2], c: AMBER, e: 0.8, snap: true });
      return { items: it, cam: { r: 16, ty: 2.4, phi: 1.25 } };
    }
  };
  X['figma-handoff'] = {
    legend: [[RED, 'Redlines: measurements', 'Redline: ukuran'], [AMBER, 'Annotations', 'Anotasi'], [SKY, 'Specs a developer reads', 'Spesifikasi yang dibaca developer']],
    build: function (v, x) {
      var insp = str(v, '--insp', 'space'), ann = str(v, '--ann', '0') === '1', it = [];
      it.push({ id: 'card', shape: 'box', p: [0, 0.1, 0], s: [5.4, 0.2, 3.6], c: '#1A2130', edges: '#3a4862' });
      it.push({ id: 'ttl', shape: 'box', p: [-0.7, 0.25, -0.9], s: [3.4, 0.1, 0.5], c: INK, e: 0.2 });
      it.push({ id: 'txt', shape: 'box', p: [-0.4, 0.25, 0.0], s: [4.0, 0.08, 0.3], c: GREY });
      it.push({ id: 'btn', shape: 'box', p: [-1.4, 0.3, 1.0], s: [2, 0.2, 0.7], c: MINT, e: 0.4 });
      if (insp === 'space') {
        [['m1', [-2.7, 0.5, -0.9], [-2.4, 0.5, -0.9], '16'], ['m2', [-0.7, 0.5, -1.8], [-0.7, 0.5, -1.15], '16'], ['m3', [-1.4, 0.5, 0.15], [-1.4, 0.5, 0.65], '24'], ['m4', [1.3, 0.5, -0.9], [2.7, 0.5, -0.9], '24']].forEach(function (m) {
          it.push({ id: m[0], shape: 'line', pts: [m[1], m[2]], c: RED });
          it.push({ id: m[0] + 't', shape: 'text', text: m[3], c: RED, size: 0.36, mono: true, p: [(m[1][0] + m[2][0]) / 2, 0.85, (m[1][2] + m[2][2]) / 2] });
        });
      } else if (insp === 'color') {
        [['surface', '#1A2130', -2], ['action', MINT, 0], ['ink', INK, 2]].forEach(function (c, i) {
          it.push({ id: 'sw' + i, shape: 'cyl', p: [c[2], 1.6, -2.8], s: [1, 0.5, 1], c: c[1], flat: true, edges: true, label: 'color/' + c[0], lc: SKY, lmono: true, lh: 0.3 });
        });
      } else {
        it.push({ id: 'ty1', shape: 'text', text: 'Title · Space Grotesk 700 · 20/28', c: SKY, size: 0.36, mono: true, p: [0, 1.6, -0.9] });
        it.push({ id: 'ty2', shape: 'text', text: 'Body · IBM Plex Sans 400 · 14/20', c: SKY, size: 0.32, mono: true, p: [0, 1.1, 0] });
        it.push({ id: 'ty3', shape: 'text', text: 'Button · 600 · 14', c: SKY, size: 0.32, mono: true, p: [-1.4, 0.9, 1.0] });
      }
      if (ann) {
        it.push({ id: 'note', shape: 'box', p: [2.6, 1.3, 1.4], s: [2.2, 1.2, 0.06], r: [-0.3, -0.3, 0], c: AMBER, e: 0.4, label: x.tr('spinner while saving', 'spinner saat menyimpan'), lc: AMBER, lh: 0.32 });
        it.push({ id: 'noteL', shape: 'line', pts: [[1.6, 1.0, 1.3], [-0.6, 0.4, 1.0]], c: AMBER });
      }
      return { items: it, cam: { r: 10, ty: 0.8 } };
    }
  };

  /* ───────────── FOUNDRY · HTML, CSS, JS ───────────── */
  X['html-structure'] = {
    legend: [[MINT, '<main>: the main content', '<main>: konten utama'], [PINK, '<header> and <nav>', '<header> dan <nav>'], [GREY, '<div>: means nothing', '<div>: tidak bermakna']],
    build: function (v, x) {
      var sem = str(v, '--mk', 'sem') === 'sem', it = [];
      var P = [['footer', [0, 0.25, 0], [7, 0.5, 5], AMBER], ['main', [-0.9, 1.8, 0], [4.6, 2.6, 4.4], MINT], ['aside', [2.4, 1.4, 0], [1.8, 1.8, 4.4], LILAC], ['header', [0, 3.6, 0], [7.2, 1.0, 5.2], PINK], ['nav', [0, 3.6, 2.75], [4.2, 0.45, 0.15], SKY]];
      P.forEach(function (p) {
        var c = sem ? p[3] : '#5d6a80';
        it.push({ id: p[0], shape: p[0] === 'header' ? 'pyr' : 'box', p: p[1], s: p[0] === 'header' ? [7.6, 1.2, 6.2] : p[2], c: c, e: sem ? 0.35 : 0.08, o: p[0] === 'main' || p[0] === 'aside' ? 0.85 : 1, edges: true, label: '<' + (sem ? p[0] : 'div') + '>', lc: c, lmono: true, ly: p[0] === 'header' ? 0.2 : 0 });
      });
      it.push({ id: 'cap', shape: 'text', text: sem ? x.tr('screen reader landmarks: 5', 'landmark untuk screen reader: 5') : x.tr('screen reader landmarks: 0', 'landmark untuk screen reader: 0'), c: sem ? MINT : RED, size: 0.48, p: [0, 5.6, 0] });
      return { items: it, cam: { r: 14, ty: 2.2 } };
    }
  };
  X['css-selectors'] = {
    legend: [[PINK, 'Winning rule (most specific)', 'Aturan pemenang (paling spesifik)'], [GREY, 'Rule switched off', 'Aturan dimatikan'], [SKY, 'Specificity = height', 'Spesifisitas = tinggi']],
    build: function (v, x) {
      var n = clamp(Math.round(num(v, '--rules', 2)), 1, 4), it = [];
      var R = [['p', '(0,0,1)', 1, '#E6EDF3'], ['.note', '(0,1,0)', 10, SKY], ['.card .note', '(0,2,0)', 20, AMBER], ['#hero', '(1,0,0)', 100, PINK]];
      var win = n - 1;
      R.forEach(function (r, i) {
        var on = i < n, h = 0.5 + Math.log10(r[2]) * 1.6 + (i === 2 ? 0.3 : 0), px = (i - 1.5) * 2.2, w = on && i === win;
        it.push({ id: 'r' + i, shape: 'box', p: [px, h / 2, -2.2], s: [1.2, h, 1.2], c: on ? r[3] : '#263042', e: w ? 0.9 : 0.25, o: on ? 1 : 0.35, edges: true, glow: w, label: r[0] + ' ' + r[1], lc: on ? r[3] : GREY, lmono: true, lh: 0.32 });
        if (w) it.push({ id: 'beam', shape: 'line', pts: [[px, h, -2.2], [0, 1.0, 2]], c: r[3] });
      });
      it.push({ id: 'p', shape: 'box', p: [0, 0.5, 2], s: [3.2, 1, 1], c: R[win][3], e: 0.6, edges: true, label: '<p id="hero" class="note">', lc: INK, lmono: true, lh: 0.32 });
      return { items: it, cam: { r: 13, ty: 1.4 } };
    }
  };
  X.responsive = {
    legend: [[MINT, 'Fits in the room', 'Muat di ruangan'], [RED, 'Sticks out (overflow)', 'Keluar ruangan (overflow)'], [SKY, 'The room (container width)', 'Ruangan (lebar container)']],
    build: function (v, x) {
      var room = num(v, '--room', 480), gap = num(v, '--gap', 12), cols = str(v, '--cols', 'none'), wrap = str(v, '--wrap', 'nowrap'), it = [];
      var S = 1 / 40, W = room - 28, names = [['Sofa', 'Sofa'], ['Table', 'Meja'], ['Lamp', 'Lampu'], ['Shelf', 'Rak'], ['Chair', 'Kursi'], ['Plant', 'Tanaman']];
      var boxes = [];
      if (cols.indexOf('auto-fit') >= 0) { var c = Math.max(1, Math.floor((W + gap) / (110 + gap))), w = (W - (c - 1) * gap) / c; for (var i = 0; i < 6; i++) boxes.push([(i % c) * (w + gap), Math.floor(i / c), w]); }
      else if (wrap === 'wrap') { var per = Math.max(1, Math.floor((W + gap) / (120 + gap))), rows = Math.ceil(6 / per); for (var j = 0; j < 6; j++) { var row = Math.floor(j / per), inRow = row === rows - 1 ? 6 - row * per : per, ww = (W - (inRow - 1) * gap) / inRow; boxes.push([(j - row * per) * (ww + gap), row, ww]); } }
      else for (var k = 0; k < 6; k++) boxes.push([k * (140 + gap), 0, 140]);
      var rows2 = boxes.reduce(function (m, b) { return Math.max(m, b[1] + 1); }, 1), depth = rows2 * 1.8 + 0.6, left = -room * S / 2;
      it.push({ id: 'room', shape: 'box', p: [0, 0.05, 0], s: [room * S, 0.1, depth], c: '#121a26', edges: SKY, label: room + 'px', lc: SKY, lmono: true, ly: 0.2 });
      boxes.forEach(function (b, i) {
        var x0 = left + 14 * S + b[0] * S, out = b[0] + b[2] > W + 1;
        it.push({ id: 'f' + i, shape: 'box', p: [x0 + b[2] * S / 2, 0.45, -depth / 2 + 1.1 + b[1] * 1.8], s: [b[2] * S, 0.7, 1.4], c: out ? RED : (i % 2 ? MINT : LILAC), e: 0.4, edges: true, label: x.tr(names[i][0], names[i][1]), lc: out ? RED : INK, lh: 0.3 });
      });
      var right = boxes.reduce(function (m, b) { return Math.max(m, b[0] + b[2]); }, room);
      return { items: it, cam: { r: Math.max(12, Math.max(room, right * 2 - room) * S * 1.05 + 4), ty: 0.6 } };
    }
  };
  X['js-dom'] = {
    legend: [[AMBER, 'JavaScript (the puppeteer)', 'JavaScript (dalangnya)'], [SKY, 'DOM elements (the puppets)', 'Elemen DOM (wayangnya)'], [PINK, 'Event coming back up', 'Event yang naik kembali']],
    build: function (v, x) {
      var act = str(v, '--act', 'text'), it = [];
      var N = [['document', [0, 4.2, 0]], ['body', [0, 2.8, 0]], ['h2', [-2.8, 1.2, 0]], ['p', [0, 1.2, 0]], ['button', [2.8, 1.2, 0]]];
      var target = { text: 'h2', class: 'p', style: 'h2', event: 'button' }[act] || 'h2';
      N.forEach(function (n) {
        var hit = n[0] === target, c = SKY;
        var label = n[0] === 'h2' ? (act === 'text' ? '<h2> "Hello!"' : '<h2 id="title">') : n[0] === 'p' ? (act === 'class' ? '<p class="msg on">' : '<p class="msg">') : n[0] === 'button' ? '<button>' : n[0];
        if (hit && act === 'style') c = PINK; else if (hit && act === 'class') c = MINT;
        it.push({ id: n[0], shape: 'box', p: n[1], s: [2.2, 0.7, 0.8], c: hit ? c : '#263042', e: hit ? 0.7 : 0.2, edges: c, glow: hit, label: label, lc: hit ? c : INK, lmono: true, lh: 0.3 });
      });
      [['document', 'body'], ['body', 'h2'], ['body', 'p'], ['body', 'button']].forEach(function (e, i) {
        var a = N.filter(function (n) { return n[0] === e[0]; })[0][1], b = N.filter(function (n) { return n[0] === e[1]; })[0][1];
        it.push({ id: 'e' + i, shape: 'line', pts: [[a[0], a[1] - 0.35, 0], [b[0], b[1] + 0.35, 0]], c: '#46557a' });
      });
      it.push({ id: 'js', shape: 'oct', p: [-4.6, 5.2, 1.4], s: [1, 1, 1], c: AMBER, e: 0.9, glow: true, label: 'JavaScript', lc: AMBER });
      var tp = N.filter(function (n) { return n[0] === target; })[0][1];
      it.push({ id: 'string', shape: 'line', pts: act === 'event' ? [[tp[0], tp[1] + 0.35, 0], [-4.6, 5.2, 1.4]] : [[-4.6, 5.2, 1.4], [tp[0], tp[1] + 0.35, 0]], c: act === 'event' ? PINK : AMBER });
      var code = { text: "title.textContent = 'Hello!'", class: "msg.classList.add('on')", style: "title.style.color = 'pink'", event: "btn.addEventListener('click', …)" }[act];
      it.push({ id: 'code', shape: 'text', text: code, c: act === 'event' ? PINK : AMBER, size: 0.38, mono: true, p: [0, 6.2, 0] });
      return { items: it, cam: { r: 14, ty: 2.8 } };
    }
  };
  X.state = {
    legend: [[MINT, 'Current state', 'State saat ini'], [AMBER, 'Credit (coins)', 'Saldo (koin)'], [GREY, 'Other states', 'State lainnya']],
    build: function (v, x) {
      var d = x.data || {}, status = d.status || 'idle', credit = d.credit || 0, price = d.price || num(v, '--price', 150), it = [];
      var S = [['idle', [-3.4, 0, 1.6]], ['paying', [3.4, 0, 1.6]], ['dispensing', [0, 0, -3]]];
      S.forEach(function (s) {
        var on = s[0] === status, h = on ? 1 : 0.35;
        it.push({ id: s[0], shape: 'cyl', p: [s[1][0], h / 2, s[1][2]], s: [2.4, h, 2.4], c: on ? MINT : '#263042', e: on ? 0.8 : 0.1, edges: on ? MINT : GREY, glow: on, label: s[0], lc: on ? MINT : GREY, lmono: true });
      });
      arrow(it, 'a1', [-2, 0.5, 1.6], [2, 0.5, 1.6], status === 'paying' ? AMBER : GREY);
      arrow(it, 'a2', [2.6, 0.5, 0.4], [0.9, 0.5, -2.1], status === 'dispensing' ? AMBER : GREY);
      arrow(it, 'a3', [-0.9, 0.5, -2.1], [-2.6, 0.5, 0.4], GREY);
      it.push({ id: 'l1', shape: 'text', text: x.tr('insert coin', 'masukkan koin'), c: GREY, size: 0.32, p: [0, 1.1, 2.1] });
      it.push({ id: 'l2', shape: 'text', text: x.tr('pick snack', 'pilih camilan'), c: GREY, size: 0.32, p: [2.6, 1.1, -1.2] });
      it.push({ id: 'l3', shape: 'text', text: x.tr('done', 'selesai'), c: GREY, size: 0.32, p: [-2.6, 1.1, -1.2] });
      var coins = Math.min(16, Math.round(credit / 25));
      for (var i = 0; i < 16; i++) { if (i >= coins) continue; it.push({ id: 'coin' + i, shape: 'cyl', p: [5.8, 0.1 + i * 0.16, -1.2], s: [0.8, 0.12, 0.8], c: AMBER, e: 0.6 }); }
      var py = 0.1 + Math.round(price / 25) * 0.16;
      it.push({ id: 'price', shape: 'torus', p: [5.8, py, -1.2], s: [1.4, 1.4, 1.4], r: [Math.PI / 2, 0, 0], c: credit >= price ? MINT : PINK, e: 0.9, label: x.tr('price ', 'harga ') + '$' + (price / 100).toFixed(2), lc: credit >= price ? MINT : PINK, lmono: true, lh: 0.3 });
      return { items: it, cam: { r: 14, ty: 0.8 } };
    }
  };

  window.UX_EXPLAIN = X;
})();
