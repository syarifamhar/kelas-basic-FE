/* three.js scenes: the hub "world map", the box-model view and the z-index plate stack.
   Every scene returns { el, update?, refresh?, dispose }. */
(function () {
  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function makeStage(el, o) {
    var T = window.THREE;
    var r = new T.WebGLRenderer({ antialias: true, alpha: true });
    r.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    var cv = r.domElement;
    cv.style.cssText = 'position:absolute;inset:0;display:block;width:100%;height:100%;touch-action:pan-y;cursor:grab';
    el.appendChild(cv);
    var scene = new T.Scene(), cam = new T.PerspectiveCamera(o.fov || 35, 1, 0.1, 400);
    scene.add(new T.AmbientLight(0xffffff, 0.5));
    var dl = new T.DirectionalLight(0xffffff, 0.85); dl.position.set(12, 24, 10); scene.add(dl);
    var rim = new T.DirectionalLight(0xB9A3FF, 0.35); rim.position.set(-14, 8, -10); scene.add(rim);
    var orb = { theta: o.theta != null ? o.theta : 0.7, phi: o.phi != null ? o.phi : 1, radius: o.radius || 20, R: o.radius || 20, target: new T.Vector3(0, o.ty || 0, 0), auto: REDUCED ? 0 : (o.auto || 0) };
    var W = 1, H = 1;
    var size = function () { W = el.clientWidth || 600; H = el.clientHeight || 400; r.setSize(W, H, false); cam.aspect = W / H; cam.updateProjectionMatrix(); };
    size();
    var ro = new ResizeObserver(size); ro.observe(el);
    var drag = null, ndc = new T.Vector2();
    var st = { T: T, r: r, scene: scene, cam: cam, orb: orb, el: el, cv: cv, tick: null, hoverCursor: null };
    var setN = function (e) { var b = cv.getBoundingClientRect(); ndc.set(((e.clientX - b.left) / b.width) * 2 - 1, -((e.clientY - b.top) / b.height) * 2 + 1); };
    var down = function (e) { drag = { x: e.clientX, y: e.clientY, m: 0 }; try { cv.setPointerCapture(e.pointerId); } catch (er) {} cv.style.cursor = 'grabbing'; };
    var move = function (e) {
      setN(e);
      if (drag) {
        var dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag.x = e.clientX; drag.y = e.clientY; drag.m += Math.abs(dx) + Math.abs(dy);
        orb.theta -= dx * 0.008; orb.phi = Math.min(1.45, Math.max(0.35, orb.phi - dy * 0.006));
      } else if (o.onHover) o.onHover(ndc);
    };
    var up = function (e) { if (drag && drag.m < 6 && o.onClick) { setN(e); o.onClick(ndc); } drag = null; cv.style.cursor = st.hoverCursor || 'grab'; };
    var leave = function () { if (o.onHover && !drag) o.onHover(null); };
    cv.addEventListener('pointerdown', down); cv.addEventListener('pointermove', move); cv.addEventListener('pointerup', up); cv.addEventListener('pointerleave', leave);
    var raf = 0;
    var loop = function () {
      raf = requestAnimationFrame(loop);
      if (!drag) orb.theta += orb.auto;
      orb.R += (orb.radius - orb.R) * 0.08;
      var sp = Math.sin(orb.phi);
      cam.position.set(orb.target.x + orb.R * sp * Math.sin(orb.theta), orb.target.y + orb.R * Math.cos(orb.phi), orb.target.z + orb.R * sp * Math.cos(orb.theta));
      cam.lookAt(orb.target);
      if (st.tick) st.tick();
      r.render(scene, cam);
    };
    raf = requestAnimationFrame(loop);
    st.project = function (v) { var p = v.clone().project(cam); return { x: (p.x * 0.5 + 0.5) * W, y: (-p.y * 0.5 + 0.5) * H }; };
    st.label = function (text, color, extra) {
      var d = document.createElement('div');
      d.style.cssText = 'position:absolute;left:0;top:0;pointer-events:none;white-space:nowrap;font:600 12px "JetBrains Mono",monospace;letter-spacing:.1em;color:' + color + ';' + (extra || '');
      d.textContent = text; el.appendChild(d); return d;
    };
    st.dispose = function () {
      cancelAnimationFrame(raf); ro.disconnect();
      scene.traverse(function (ob) { if (ob.geometry) ob.geometry.dispose(); if (ob.material) (Array.isArray(ob.material) ? ob.material : [ob.material]).forEach(function (m) { m.dispose(); }); });
      r.dispose(); el.innerHTML = '';
    };
    return st;
  }

  /* opts: { lessons:[{id,level,title,n}], levels:[{key,name,color,hex}], onOpen(id), doneText } */
  function makeHub(el, opts) {
    var ls = opts.lessons, hov = null, pick, hover;
    var st = makeStage(el, {
      radius: 44, phi: 0.98, theta: 0.5, auto: 0.0012, fov: 30, ty: 1,
      onHover: function (n) { hover(n); },
      onClick: function (n) { var b = pick(n); if (b) opts.onOpen(b.userData.id); }
    });
    var T = st.T, scene = st.scene, cam = st.cam;
    scene.fog = new T.Fog(0x0D1016, 50, 100);
    scene.add(new T.GridHelper(160, 80, 0x1c2635, 0x141a24));
    var ray = new T.Raycaster(), blds = [], labels = [];
    var box = new T.BoxGeometry(1, 1, 1), boxE = new T.EdgesGeometry(box);
    var slots = [[-3.4, -2.3], [0, -2.6], [3.4, -2.3], [-1.8, 2], [1.8, 2]];
    var road = new T.Mesh(new T.BoxGeometry(46, 0.08, 1.6), new T.MeshStandardMaterial({ color: 0x161c27 }));
    road.position.set(0, 0.04, 0); scene.add(road);
    for (var i = -11; i <= 11; i++) { var d = new T.Mesh(new T.BoxGeometry(0.9, 0.1, 0.12), new T.MeshBasicMaterial({ color: 0x3a4862 })); d.position.set(i * 2, 0.06, 0); scene.add(d); }
    opts.levels.forEach(function (lv, li) {
      var cx = (li - 1) * 15, cz = li === 1 ? -2.5 : 1.5;
      var pf = new T.Mesh(new T.BoxGeometry(12, 0.6, 10), new T.MeshStandardMaterial({ color: 0x121722, roughness: 0.9 }));
      pf.position.set(cx, 0.3, cz); scene.add(pf);
      var pe = new T.LineSegments(new T.EdgesGeometry(pf.geometry), new T.LineBasicMaterial({ color: lv.hex, transparent: true, opacity: 0.55 }));
      pe.position.copy(pf.position); scene.add(pe);
      ls.filter(function (l) { return l.level === lv.key; }).forEach(function (l, i) {
        var sl = slots[i] || [((i - 5) % 3 - 1) * 3.4, 4.2];
        var h = 1.6 + i * 0.75 + li * 1.0;
        var m = new T.Mesh(box, new T.MeshStandardMaterial({ color: 0x1A2130, emissive: lv.hex, emissiveIntensity: 0.05, roughness: 0.55, metalness: 0.15 }));
        m.scale.set(2.2, h, 2.2); m.position.set(cx + sl[0], 0.6 + h / 2, cz + sl[1]);
        m.add(new T.LineSegments(boxE, new T.LineBasicMaterial({ color: lv.hex })));
        m.userData = { id: l.id, title: l.title, num: (l.n < 10 ? '0' : '') + l.n, color: lv.color, h: h, cur: h, done: false };
        scene.add(m); blds.push(m);
      });
      labels.push({ div: st.label(lv.name.toUpperCase(), lv.color, 'padding:4px 8px;background:rgba(13,16,22,.8);border:1px solid #263042;border-radius:6px'), pos: new T.Vector3(cx, 0.7, cz + 5.4) });
    });
    var tip = st.label('', '#E6EDF3', 'display:none;letter-spacing:0;padding:8px 12px;background:#1A2130;border:1px solid #263042;border-radius:8px;font:500 13px "IBM Plex Sans",sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.4)');
    var tipNum = document.createElement('span'), tipTitle = document.createElement('span');
    tipNum.style.cssText = 'font:600 11px "JetBrains Mono",monospace';
    tip.appendChild(tipNum); tip.appendChild(document.createElement('br')); tip.appendChild(tipTitle);
    pick = function (n) { if (!n) return null; ray.setFromCamera(n, cam); var hit = ray.intersectObjects(blds, false)[0]; return hit ? hit.object : null; };
    hover = function (n) {
      var b = pick(n);
      if (b !== hov) {
        hov = b; st.hoverCursor = b ? 'pointer' : 'grab'; st.cv.style.cursor = st.hoverCursor;
        if (b) {
          var u = b.userData;
          tipNum.style.color = u.color; tipNum.textContent = u.num + (u.done ? ' · ' + opts.doneText : '');
          tipTitle.textContent = u.title; tip.style.display = 'block';
        } else tip.style.display = 'none';
      }
    };
    st.tick = function () {
      blds.forEach(function (b) {
        var u = b.userData, th = u.h * (b === hov ? 1.15 : 1);
        u.cur += (th - u.cur) * 0.15; b.scale.y = u.cur; b.position.y = 0.6 + u.cur / 2;
        var te = u.done ? 0.65 : (b === hov ? 0.3 : 0.05);
        b.material.emissiveIntensity += (te - b.material.emissiveIntensity) * 0.12;
      });
      labels.forEach(function (lb) { var p = st.project(lb.pos); lb.div.style.transform = 'translate(' + p.x + 'px,' + p.y + 'px) translate(-50%,0)'; });
      if (hov) { var p = st.project(new T.Vector3(hov.position.x, hov.position.y + hov.scale.y / 2 + 0.3, hov.position.z)); tip.style.transform = 'translate(' + p.x + 'px,' + p.y + 'px) translate(-50%,-110%)'; }
    };
    st.refresh = function (done) { blds.forEach(function (b) { b.userData.done = done.indexOf(b.userData.id) >= 0; }); };
    return st;
  }

  function makeBox(el) {
    var st = makeStage(el, { radius: 10, phi: 1.05, theta: 0.75, auto: 0.003, fov: 35 });
    var T = st.T, scene = st.scene;
    var g = new T.GridHelper(40, 40, 0x1c2635, 0x141a24); g.position.y = -3.5; scene.add(g);
    var geo = new T.BoxGeometry(1, 1, 1), eg = new T.EdgesGeometry(geo);
    var content = new T.Mesh(geo, new T.MeshStandardMaterial({ color: 0x7EF2C3, roughness: 0.5 }));
    var padM = new T.Mesh(geo, new T.MeshStandardMaterial({ color: 0xB9A3FF, transparent: true, opacity: 0.22, depthWrite: false }));
    padM.add(new T.LineSegments(eg, new T.LineBasicMaterial({ color: 0xB9A3FF, transparent: true, opacity: 0.6 })));
    var bor = new T.Mesh(geo, new T.MeshStandardMaterial({ color: 0xFFC877, transparent: true, opacity: 0.16, depthWrite: false, side: T.DoubleSide }));
    bor.add(new T.LineSegments(eg, new T.LineBasicMaterial({ color: 0xFFC877 })));
    var mar = new T.LineSegments(eg, new T.LineDashedMaterial({ color: 0x7FD4FF, dashSize: 0.04, gapSize: 0.03 }));
    mar.computeLineDistances();
    [content, padM, bor, mar].forEach(function (m) { scene.add(m); });
    var tgt = { c: 3, p: 3.8, b: 4, m: 4.8 }, cur = Object.assign({}, tgt);
    st.update = function (vs) {
      var s = 1 / 40, w = parseFloat(vs['--w']) || 140, p = parseFloat(vs['--pad']) || 0, b = parseFloat(vs['--bw']) || 0, m = parseFloat(vs['--m']) || 0;
      var cw = Math.max(vs['--bs'] === 'border-box' ? w - 2 * p - 2 * b : w, 6);
      tgt.c = cw * s; tgt.p = tgt.c + 2 * p * s; tgt.b = tgt.p + 2 * b * s; tgt.m = tgt.b + 2 * m * s;
      st.orb.radius = tgt.m * 2.3 + 3;
    };
    st.tick = function () {
      ['c', 'p', 'b', 'm'].forEach(function (k) { cur[k] += (tgt[k] - cur[k]) * 0.12; });
      var yc = cur.c * 0.6, zc = cur.c * 0.8;
      var set = function (o, x) { var add = x - cur.c; o.scale.set(x, yc + add, zc + add); };
      set(content, cur.c); set(padM, cur.p); set(bor, cur.b); set(mar, cur.m);
    };
    return st;
  }

  function stackOrder(vs) {
    var za = +vs['--za'] || 0, zb = +vs['--zb'] || 0, zc = +vs['--zc'] || 0, t = vs['--trayz'];
    var srt = function (a) { return a.sort(function (x, y) { return x[1] - y[1] || x[2] - y[2]; }).map(function (x) { return x[0]; }); };
    if (t == null || t === 'auto') return srt([['A', za, 0], ['B', zb, 1], ['C', zc, 2]]);
    var inner = srt([['A', za, 0], ['B', zb, 1]]);
    return (+t > zc) ? ['C'].concat(inner) : inner.concat(['C']);
  }

  function makeStack(el) {
    var st = makeStage(el, { radius: 11, phi: 1.0, theta: 0.6, auto: 0.002, fov: 35, ty: 1 });
    var T = st.T, scene = st.scene;
    var g = new T.GridHelper(40, 40, 0x1c2635, 0x141a24); g.position.y = -0.2; scene.add(g);
    var cols = { A: 0x7EF2C3, B: 0xB9A3FF, C: 0xFFC877 }, css = { A: '#7EF2C3', B: '#B9A3FF', C: '#FFC877' };
    var off = { A: [-1.3, -0.5], B: [0, 0.2], C: [1.3, 0.9] };
    var plates = {}, labels = {};
    ['A', 'B', 'C'].forEach(function (k) {
      var m = new T.Mesh(new T.CylinderGeometry(1.7, 1.5, 0.22, 56), new T.MeshStandardMaterial({ color: cols[k], roughness: 0.35 }));
      m.position.set(off[k][0], 0.35, off[k][1]); m.userData.y = 0.35; scene.add(m); plates[k] = m;
      labels[k] = st.label(k, css[k], 'padding:2px 7px;background:rgba(13,16,22,.85);border:1px solid ' + css[k] + ';border-radius:5px');
    });
    var tray = new T.Mesh(new T.BoxGeometry(5, 0.08, 3.8), new T.MeshStandardMaterial({ color: 0x7FD4FF, transparent: true, opacity: 0.16, depthWrite: false }));
    tray.add(new T.LineSegments(new T.EdgesGeometry(tray.geometry), new T.LineBasicMaterial({ color: 0x7FD4FF })));
    tray.position.set(-0.65, 0.05, -0.15); tray.userData.y = 0.05; scene.add(tray);
    st.update = function (vs) {
      stackOrder(vs).forEach(function (k, i) { plates[k].userData.y = 0.35 + i * 0.8; });
      tray.visible = vs['--trayz'] !== 'auto';
      tray.userData.y = Math.min(plates.A.userData.y, plates.B.userData.y) - 0.28;
    };
    st.tick = function () {
      Object.keys(plates).forEach(function (k) {
        var p = plates[k]; p.position.y += (p.userData.y - p.position.y) * 0.12;
        var s = st.project(new T.Vector3(p.position.x + 1.9, p.position.y, p.position.z));
        labels[k].style.transform = 'translate(' + s.x + 'px,' + s.y + 'px) translate(0,-50%)';
      });
      tray.position.y += (tray.userData.y - tray.position.y) * 0.12;
    };
    return st;
  }

  window.UXScenes = { makeHub: makeHub, makeBox: makeBox, makeStack: makeStack };
})();
