/* ux.lab · by sha-labs — hub + lesson views, playground engine, quiz and progress. */
(function () {
  var t = I18N.t;
  var FONTS = '<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;600&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">';
  var BASE = ':root{--bg:#0D1016;--surface:#131821;--raised:#1A2130;--line:#263042;--ink:#E6EDF3;--ink2:#A9B4C2;--mint:#7EF2C3;--lilac:#B9A3FF;--amber:#FFC877;--pink:#FF93B5;--sky:#7FD4FF}*{box-sizing:border-box}html{color-scheme:dark}body{margin:0;padding:20px;background:#131821;color:#E6EDF3;font:15px/1.5 "IBM Plex Sans",system-ui,sans-serif}h1,h2,h3,h4{font-family:"Space Grotesk",sans-serif}';
  var LOGOS = {
    react: '<svg viewBox="-11.5 -10.23 23 20.46" width="100%" height="100%" aria-hidden="true"><circle r="2.05" fill="#61DAFB"/><g stroke="#61DAFB" stroke-width="1" fill="none"><ellipse rx="11" ry="4.2"/><ellipse rx="11" ry="4.2" transform="rotate(60)"/><ellipse rx="11" ry="4.2" transform="rotate(120)"/></g></svg>',
    vue: '<svg viewBox="0 0 256 221" width="100%" height="100%" aria-hidden="true"><path fill="#41B883" d="M204.8 0H256L128 220.8L0 0h97.92L128 51.2L157.44 0h47.36Z"/><path fill="#41B883" d="m0 0l128 220.8L256 0h-51.2L128 132.48L50.56 0H0Z"/><path fill="#35495E" d="M50.56 0L128 133.12L204.8 0h-47.36L128 51.2L97.92 0H50.56Z"/></svg>',
    figma: '<svg viewBox="0 0 38 57" width="100%" height="100%" aria-hidden="true"><path fill="#1abcfe" d="M19 28.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0z"/><path fill="#0acf83" d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5a9.5 9.5 0 1 1-19 0z"/><path fill="#ff7262" d="M19 0v19h9.5a9.5 9.5 0 1 0 0-19H19z"/><path fill="#f24e1e" d="M0 9.5A9.5 9.5 0 0 0 9.5 19H19V0H9.5A9.5 9.5 0 0 0 0 9.5z"/><path fill="#a259ff" d="M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5z"/></svg>',
    basics: '<svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden="true" fill="none" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6 2 12l6 6" stroke="#FF8A4C"/><path d="m14 4-4 16" stroke="#7FD4FF"/><path d="m16 6 6 6-6 6" stroke="#F7DF1E"/></svg>',
    theory: '<svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden="true" fill="none" stroke="#7EF2C3" stroke-width="2" stroke-linecap="round"><path d="M3 9h18L12 3z"/><path d="M5 9v9M9.5 9v9M14.5 9v9M19 9v9M3 21h18"/></svg>'
  };
  /* cities on the world map, and the districts inside them (world → city → district → lesson).
     The order of lessons inside each district comes from js/syllabus.js. */
  var PROVINCES = [
    { key: 'uiux', color: '#7EF2C3', hex: 0x7EF2C3 },
    { key: 'frontend', color: '#61DAFB', hex: 0x61DAFB }
  ];
  var LEVELS = [
    { key: 'theory', province: 'uiux', color: '#7EF2C3', hex: 0x7EF2C3, logo: LOGOS.theory },
    { key: 'figma', province: 'uiux', color: '#A259FF', hex: 0xA259FF, logo: LOGOS.figma },
    { key: 'basics', province: 'frontend', color: '#FF8A4C', hex: 0xFF8A4C, logo: LOGOS.basics },
    { key: 'react', province: 'frontend', color: '#61DAFB', hex: 0x61DAFB, logo: LOGOS.react },
    { key: 'vue', province: 'frontend', color: '#42B883', hex: 0x42B883, logo: LOGOS.vue }
  ];
  /* React and Vue playgrounds load the library from a CDN and get a few helpers:
     ux.render / ux.flow / ux.tree talk to the 3D view, useControl / controlRef read the controls. */
  var CDN = {
    react: ['https://unpkg.com/react@18.3.1/umd/react.development.js', 'https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js', 'https://unpkg.com/@babel/standalone@7.25.6/babel.min.js'],
    vue: ['https://unpkg.com/vue@3.4.38/dist/vue.global.js']
  };
  var HELPER = "(function(){var vals={},subs=[];" +
    "function post(m){m.uxlab=1;try{parent.postMessage(m,'*')}catch(e){}}" +
    "function css(k){return getComputedStyle(document.documentElement).getPropertyValue(k).trim()}" +
    "var stuck=false;function show(msg,keep){if(stuck)return;if(keep)stuck=true;var d=document.getElementById('ux-err');if(!d){d=document.createElement('pre');d.id='ux-err';d.style.cssText='position:fixed;left:12px;right:12px;bottom:12px;margin:0;padding:10px 12px;border-radius:8px;background:#2a1418;border:1px solid #FF8A8A;color:#FF8A8A;font:12px/1.5 JetBrains Mono,monospace;white-space:pre-wrap;z-index:99';(document.body||document.documentElement).appendChild(d)}d.textContent='\u26A0 '+msg}" +
    "window.addEventListener('error',function(e){show(e.message||'Error')});" +
    "window.onVar=function(k,v){vals[k]=String(v).trim();subs.slice().forEach(function(f){f(k)})};" +
    "window.ux={get:function(k,fb){var v=vals[k]!=null?vals[k]:css(k);return v===''||v==null?fb:v}," +
    "subscribe:function(f){subs.push(f);return function(){var i=subs.indexOf(f);if(i>=0)subs.splice(i,1)}}," +
    "render:function(id){post({type:'render',id:String(id)})}," +
    "flow:function(a,b,kind){post({type:'flow',from:String(a),to:String(b),kind:kind||'prop'})}," +
    "tree:function(n){post({type:'tree',nodes:n})},state:function(d){post({type:'state',data:d})},show:show};})();";
  var RUNTIME_HELPER = {
    react: "if(!window.React||!window.ReactDOM||!window.Babel){ux.show('Could not load React. This playground needs an internet connection.',1)}" +
      "function useControl(k,fb){var s=React.useState(function(){return ux.get(k,fb)}),set=s[1];React.useEffect(function(){return ux.subscribe(function(){set(ux.get(k,fb))})},[]);return s[0]}",
    vue: "if(!window.Vue){ux.show('Could not load Vue. This playground needs an internet connection.',1)}" +
      "function controlRef(k,fb){var r=Vue.ref(ux.get(k,fb));ux.subscribe(function(){r.value=ux.get(k,fb)});return r}"
  };
  var LESSONS = window.UX_LESSONS;
  var EXPLAIN = window.UX_EXPLAIN || {};
  /* every lesson gets a 3D view: its own scene, or a declarative explainer from js/explainers.js */
  var sceneOf = function (l) { return l.scene || (EXPLAIN[l.id] ? 'explain' : null); };
  var DONE_KEY = 'uxlab.done';

  var pad = function (n) { return (n < 10 ? '0' : '') + n; };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var levelName = function (key) { return t('level.' + key); };
  var levelOf = function (key) { return LEVELS.filter(function (x) { return x.key === key; })[0]; };
  var provOf = function (key) { return PROVINCES.filter(function (x) { return x.key === key; })[0]; };
  var FOCUS_KEY = 'uxlab.focus';
  var getFocus = function () { try { var f = localStorage.getItem(FOCUS_KEY); if (f === 'uiux' || f === 'frontend' || f === 'all') return f; } catch (e) {} return 'all'; };
  var setFocus = function (f) { try { localStorage.setItem(FOCUS_KEY, f); } catch (e) {} };
  var tag = function (attrs, body) { return '<scr' + 'ipt' + (attrs ? ' ' + attrs : '') + '>' + (body || '') + '</scr' + 'ipt>'; };
  function buildDoc(html, css, js, runtime) {
    var head = tag('', HELPER), code = tag('', js);
    if (runtime && CDN[runtime]) {
      head = CDN[runtime].map(function (src) { return tag('src="' + src + '"'); }).join('') + tag('', HELPER + RUNTIME_HELPER[runtime]);
      if (runtime === 'react') code = tag('type="text/babel" data-presets="react"', js);
    }
    return '<!doctype html><html><head><meta charset="utf-8">' + FONTS + '<style>' + BASE + (css || '') + '</style>' + head + '</head><body>' + (html || '') + code + '</body></html>';
  }

  /* Lesson text in the current language (falls back to English). */
  function loc(l) {
    var tr = (I18N.lang === 'id' && window.UX_LESSONS_ID && window.UX_LESSONS_ID[l.id]) || {};
    var pickArr = function (a, b) { return a && a.length === b.length ? a : b; };
    return {
      title: tr.title || l.title,
      metaphor: tr.metaphor || l.metaphor,
      parable: tr.parable || l.parable,
      theory: pickArr(tr.theory, l.theory),
      figma: pickArr(tr.figma, l.figma),
      good: tr.good || l.good.label,
      bad: tr.bad || l.bad.label,
      legend: l.legend ? l.legend.map(function (g, i) { return { c: g.c, t: (tr.legend && tr.legend[i]) || g.t }; })
        : ((EXPLAIN[l.id] && EXPLAIN[l.id].legend) || []).map(function (g) { return { c: g[0], t: I18N.lang === 'id' ? g[2] : g[1] }; }),
      controls: (l.controls || []).map(function (c, i) {
        var o = (tr.controls && tr.controls[i]) || {};
        return {
          label: o.label || c.label,
          options: (c.options || []).map(function (op, oi) { return (o.options && o.options[oi]) || op.label; })
        };
      }),
      quiz: (l.quiz || []).map(function (q, i) {
        var o = (tr.quiz && tr.quiz[i]) || {};
        return { q: o.q || q.q, options: pickArr(o.options, q.options), why: o.why || q.why, answer: q.answer };
      })
    };
  }

  /* ───────── state ───────── */
  var S = { view: 'hub', lessonId: null, ctrl: {}, code: { html: '', css: '', js: '' }, doc: '', tab: 'html', showCode: false, quiz: {}, done: [] };
  try { S.done = JSON.parse(localStorage.getItem(DONE_KEY) || '[]'); } catch (e) { S.done = []; }
  var hub = null, sc = null, lastVars = {}, debounce = 0, lastTree = null, lastState = null;

  var app = document.getElementById('app');
  var progressEl = document.getElementById('progress');

  function cur() { return S.view === 'lesson' ? LESSONS.filter(function (l) { return l.id === S.lessonId; })[0] : null; }
  function isDone(id) { return S.done.indexOf(id) >= 0; }
  function saveDone(done) {
    var added = done.filter(function (id) { return S.done.indexOf(id) < 0; });
    S.done = done;
    added.forEach(function (id) { UXGame.lessonDone(id, done); });
    try { localStorage.setItem(DONE_KEY, JSON.stringify(done)); } catch (e) {}
    renderProgress();
    if (hub) hub.refresh(done);
    renderDoneBtn();
  }
  function renderProgress() { progressEl.textContent = t('nav.progress', { d: S.done.length, t: LESSONS.length }); }

  function lessonState(l) {
    var ctrl = {};
    (l.controls || []).forEach(function (c, i) { ctrl[i] = c.type === 'range' ? c.value : (c.default || 0); });
    var code = { html: l.html || '', css: l.css || '', js: l.js || '' };
    return { ctrl: ctrl, code: code, doc: buildDoc(code.html, code.css, code.js, l.runtime), tab: 'html' };
  }

  /* scenes.js is an ES module, so it may finish loading after this script runs */
  function whenScenes(fn) {
    if (window.UXScenes) fn();
    else window.addEventListener('uxscenes:ready', fn, { once: true });
  }

  function disposeScenes() {
    if (EX.on) { EX.on = false; document.body.classList.remove('is-exploring'); }
    if (hub) { hub.dispose(); hub = null; }
    if (sc) { sc.dispose(); sc = null; }
  }

  /* ───────── routing ───────── */
  function route() {
    var m = location.hash.match(/^#\/lesson\/([\w-]+)/);
    var l = m && LESSONS.filter(function (x) { return x.id === m[1]; })[0];
    clearTimeout(debounce);
    if (l) {
      Object.assign(S, lessonState(l), { view: 'lesson', lessonId: l.id, quiz: {} });
      renderLesson();
    } else if (/^#\/create/.test(location.hash)) {
      S.view = 'create'; S.lessonId = null; CR = null;
      renderCreator();
    } else {
      S.view = 'hub'; S.lessonId = null;
      renderHub();
    }
    window.scrollTo(0, 0);
  }
  function open(id) { location.hash = '#/lesson/' + id; }
  function goHub() { location.hash = '#/'; }

  /* ───────── character creator ───────── */
  var CR = null;
  var CR_ROWS = [
    ['body', [['body', 'seg', 'body'], ['skin', 'swatch', 'SKIN'], ['height', 'range'], ['build', 'seg', 'build']]],
    ['face', [['eyes', 'swatch', 'EYE_COLORS'], ['hair', 'seg', 'hair'], ['hairColor', 'swatch', 'HAIR_COLORS']]],
    ['outfit', [['top', 'seg', 'top'], ['topColor', 'swatch', 'CLOTH'], ['bottom', 'seg', 'bottom'], ['bottomColor', 'swatch', 'CLOTH'], ['shoes', 'seg', 'shoes'], ['shoesColor', 'swatch', 'CLOTH']]],
    ['extra', [['beard', 'toggle'], ['glasses', 'toggle'], ['cap', 'toggle'], ['backpack', 'toggle']]]
  ];
  function creatorPanel() {
    var O = UXScenes.characterOptions, look = CR.look;
    return '<label class="cr-name"><span>' + esc(t('cr.name')) + '</span><input id="crName" maxlength="18" autocomplete="off" placeholder="' + esc(t('cr.namePh')) + '" value="' + esc(look.name || '') + '"></label>' +
      CR_ROWS.map(function (g) {
        return '<div class="cr-group"><span class="label muted">' + esc(t('cr.' + g[0])) + '</span>' + g[1].map(function (r) {
          var k = r[0], kind = r[1], val = look[k], body = '';
          if (kind === 'swatch') body = '<div class="cr-sw" role="group" aria-label="' + esc(t('cr.' + k)) + '">' + O[r[2]].map(function (c, i) {
            return '<button type="button" data-ck="' + k + '" data-cv="' + i + '" class="' + (val === i ? 'is-on' : '') + '" aria-pressed="' + (val === i) + '" style="--c:' + c + '" title="' + c + '"></button>';
          }).join('') + '</div>';
          else if (kind === 'seg') body = '<div class="seg">' + O.OPTIONS[r[2]].map(function (o) {
            return '<button type="button" data-ck="' + k + '" data-cv="' + o + '" class="' + (val === o ? 'is-on' : '') + '" aria-pressed="' + (val === o) + '">' + esc(t('opt.' + o)) + '</button>';
          }).join('') + '</div>';
          else if (kind === 'range') body = '<input type="range" id="crHeight" min="0.9" max="1.1" step="0.01" value="' + (look.height || 1) + '" aria-label="' + esc(t('cr.height')) + '">';
          else body = '<button type="button" class="cr-toggle' + (val ? ' is-on' : '') + '" data-ck="' + k + '" data-cv="toggle" aria-pressed="' + !!val + '"><i></i></button>';
          return '<div class="cr-row cr-' + kind + '"><span>' + esc(t(k === 'body' ? 'cr.bodyType' : 'cr.' + k)) + '</span>' + body + '</div>';
        }).join('') + '</div>';
      }).join('');
  }
  function renderCreator() {
    disposeScenes();
    app.innerHTML = '<main class="main creator" data-screen-label="Character creator">' +
      '<section class="hero"><span class="kicker">' + esc(t('cr.kicker')) + '</span><h1>' + esc(t('cr.title')) + '</h1><p>' + esc(t('cr.lede')) + '</p></section>' +
      '<section class="cr-grid">' +
        '<div class="cr-stage"><div id="cr3d"></div><div class="cr-tools">' +
          '<button type="button" class="btn-code" data-cr="random">' + esc(t('cr.random')) + '</button>' +
          '<button type="button" class="btn-code" data-cr="face">' + esc(t('cr.viewFace')) + '</button>' +
          '<button type="button" class="btn-code" data-cr="full">' + esc(t('cr.viewFull')) + '</button>' +
          '<button type="button" class="btn-code" data-cr="spin">' + esc(t('cr.spin')) + '</button></div></div>' +
        '<div class="cr-panel" id="crPanel"></div>' +
      '</section>' +
      '<div class="cr-actions"><button type="button" class="btn-step" data-cr="cancel">' + esc(t('cr.cancel')) + '</button><button type="button" class="btn-done is-done" data-cr="save">' + esc(t('cr.save')) + '</button></div>' +
    '</main>';
    whenScenes(function () {
      if (S.view !== 'create') return;
      var O = UXScenes.characterOptions;
      if (!CR) CR = { look: Object.assign({}, O.DEFAULT_LOOK, UXGame.avatar() || {}), spin: true };
      document.getElementById('crPanel').innerHTML = creatorPanel();
      sc = UXScenes.makeCreator(document.getElementById('cr3d'), CR.look);
    });
  }
  function creatorSet(k, v) {
    if (v === 'toggle') CR.look[k] = !CR.look[k];
    else CR.look[k] = /^\d+$/.test(v) ? +v : v;
    if (k === 'hair' && v === 'hijab') CR.look.cap = false;
    if (sc && sc.setLook) sc.setLook(CR.look);
    var keep = document.getElementById('crPanel').scrollTop;
    document.getElementById('crPanel').innerHTML = creatorPanel();
    document.getElementById('crPanel').scrollTop = keep;
  }

  /* ───────── explore mode HUD ───────── */
  var EX = { on: false, near: null, where: {} };
  function hudHTML() {
    return '<div class="hud" id="hud" hidden>' +
      '<div class="hud-player"><button type="button" class="hud-ava" data-hud="badges" id="hudAva"></button><div class="hud-who"><b id="hudName"></b><small id="hudLevel"></small><div class="xpbar"><i id="hudXp"></i></div></div></div>' +
      '<button type="button" class="hud-quest" data-hud="quest" id="hudQuest"></button>' +
      '<div class="hud-loc" id="hudLoc"></div>' +
      '<canvas class="hud-mini" id="hudMini" aria-label="' + esc(t('game.map')) + '"></canvas>' +
      '<button type="button" class="hud-prompt" data-hud="interact" id="hudPrompt" hidden></button>' +
      '<div class="hud-joy" id="hudJoy" aria-hidden="true"><i></i></div>' +
      '<div class="hud-btns"><button type="button" data-hud="interact" aria-label="E">E</button><button type="button" data-hud="map" aria-label="' + esc(t('game.map')) + '">M</button><button type="button" data-hud="edit" aria-label="' + esc(t('game.edit')) + '">✎</button><button type="button" data-hud="exit" aria-label="' + esc(t('game.exit')) + '">✕</button></div>' +
      '<p class="hud-help"><span class="k">' + esc(t('game.help')) + '</span><span class="tc">' + esc(t('game.helpTouch')) + '</span></p>' +
      '<div class="hud-dialog" id="hudDialog" hidden></div>' +
      '<div class="hud-big" id="hudBig" hidden><canvas id="hudBigCanvas"></canvas><button type="button" class="btn-code" data-hud="map">' + esc(t('game.close')) + '</button></div>' +
    '</div>';
  }
  function questLesson() {
    var q = UXGame.quest(), l = q && LESSONS.filter(function (x) { return x.id === q; })[0];
    if (l && !isDone(l.id)) return l;
    return LESSONS.filter(function (x) { return !isDone(x.id); })[0] || null;
  }
  function renderHud() {
    if (!EX.on) return;
    var look = UXGame.avatar() || {}, O = UXScenes.characterOptions, lv = UXGame.level();
    var ava = document.getElementById('hudAva');
    ava.textContent = (look.name || '?').trim().charAt(0).toUpperCase() || '?';
    ava.style.background = O.CLOTH[look.topColor] || '#7EF2C3';
    ava.title = t('game.badges') + ' · ' + UXGame.state.badges.length + '/' + UXGame.BADGES.length;
    document.getElementById('hudName').textContent = look.name || t('cr.namePh');
    document.getElementById('hudLevel').textContent = t('game.level', { n: lv }) + ' · ' + UXGame.title(lv) + ' · ' + t('game.xp', { n: UXGame.state.xp });
    document.getElementById('hudXp').style.width = Math.round(UXGame.progress() * 100) + '%';
    var q = questLesson(), qb = document.getElementById('hudQuest');
    qb.innerHTML = '<span>' + esc(t('game.quest')) + '</span>' + (q ? esc(pad(q.n) + ' · ' + loc(q).title) : esc(t('game.questDone')));
    if (hub && hub.setQuest) hub.setQuest(q ? q.id : null);
  }
  function setLoc(city, district) {
    EX.where = { city: city, district: district };
    var el = document.getElementById('hudLoc'); if (!el) return;
    el.textContent = district ? t('prov.' + city + '.name') + ' · ' + levelName(district) : city ? t('prov.' + city + '.name') + ' · ' + t('prov.' + city + '.kind') : t('game.where.out');
    var lv = district && levelOf(district); el.style.color = lv ? lv.color : '';
    if (district) { UXGame.visit(district, S.done); renderHud(); }
  }
  function setNear(n) {
    EX.near = n;
    var p = document.getElementById('hudPrompt'); if (!p) return;
    if (!n) { p.hidden = true; return; }
    if (n.type === 'lesson') { var l = LESSONS.filter(function (x) { return x.id === n.id; })[0]; p.textContent = t('game.enter', { n: pad(l.n), t: loc(l).title }) + (isDone(l.id) ? ' ✓' : ''); }
    else p.textContent = t('game.talk', { n: t('guide.' + n.key + '.name') });
    p.hidden = false;
  }
  function showDialog(html) { var d = document.getElementById('hudDialog'); d.innerHTML = html; d.hidden = false; var b = d.querySelector('button'); if (b) b.focus(); }
  function closeDialog() { var d = document.getElementById('hudDialog'); if (d && !d.hidden) { d.hidden = true; return true; } return false; }
  function guideDialog(key) {
    UXGame.talk(key, S.done); renderHud();
    var lv = levelOf(key), next = LESSONS.filter(function (l) { return l.level === key && !isDone(l.id); })[0];
    showDialog('<div class="dlg" style="--lv:' + lv.color + '"><span class="label" style="color:var(--lv)">' + esc(levelName(key)) + '</span><h3>' + esc(t('guide.' + key + '.name')) + '</h3>' +
      '<p>' + esc(t('guide.' + key + '.line')) + '</p>' +
      '<p class="muted">' + esc(next ? t('game.guide.next', { n: pad(next.n), t: loc(next).title }) : t('game.guide.done')) + '</p>' +
      '<div class="dlg-btns">' + (next ? '<button type="button" class="btn-done is-done" data-hud="go:' + next.id + '">' + esc(t('game.guide.go')) + '</button><button type="button" class="btn-step" data-hud="open:' + next.id + '">' + esc(t('game.guide.open')) + '</button>' : '') +
      '<button type="button" class="btn-step" data-hud="close">' + esc(t('game.close')) + '</button></div></div>');
  }
  function badgesDialog() {
    var have = UXGame.state.badges;
    showDialog('<div class="dlg"><span class="label" style="color:var(--amber)">' + esc(t('game.badges')) + ' · ' + have.length + '/' + UXGame.BADGES.length + '</span>' +
      '<ul class="badges">' + UXGame.BADGES.map(function (b) {
        var on = have.indexOf(b.id) >= 0;
        return '<li class="' + (on ? 'on' : '') + '" style="--bc:' + (b.color || '#FFC877') + '"><i>' + b.glyph + '</i><b>' + esc(t('badge.' + b.id)) + '</b><small>' + esc(t('badge.' + b.id + 'D')) + '</small></li>';
      }).join('') + '</ul><div class="dlg-btns"><button type="button" class="btn-step" data-hud="close">' + esc(t('game.close')) + '</button></div></div>');
  }
  function startExplore() {
    var look = UXGame.avatar();
    if (!look) { UXGame.setExploring(true); location.hash = '#/create'; return; }
    if (!hub || !hub.explore) return;
    EX.on = true; UXGame.setExploring(true);
    var w = app.querySelector('.world'); w.classList.add('exploring'); document.body.classList.add('is-exploring');
    document.getElementById('hud').hidden = false;
    var mini = document.getElementById('hudMini'), dpr = Math.min(2, window.devicePixelRatio || 1);
    mini.width = mini.clientWidth * dpr; mini.height = mini.clientHeight * dpr;
    hub.explore({
      look: look, pos: UXGame.pos(), minimap: mini, bigmap: document.getElementById('hudBigCanvas'),
      onNear: setNear, onLocation: setLoc, onGuide: guideDialog, onMove: UXGame.setPos,
      onToggleMap: toggleBigMap
    });
    renderHud();
  }
  function stopExplore() {
    EX.on = false; UXGame.setExploring(false);
    var w = app.querySelector('.world'); if (w) w.classList.remove('exploring');
    document.body.classList.remove('is-exploring');
    var h = document.getElementById('hud'); if (h) h.hidden = true;
    if (hub && hub.leaveExplore) hub.leaveExplore();
  }
  function toggleBigMap() {
    var b = document.getElementById('hudBig'); if (!b) return;
    b.hidden = !b.hidden;
    if (!b.hidden) { var c = document.getElementById('hudBigCanvas'), dpr = Math.min(2, window.devicePixelRatio || 1); c.width = c.clientWidth * dpr; c.height = c.clientHeight * dpr; }
    if (hub) hub.showBigMap(!b.hidden);
  }
  function hudAction(a) {
    if (a === 'interact') { if (hub) hub.interact(); return; }
    if (a === 'map') return toggleBigMap();
    if (a === 'exit') return stopExplore();
    if (a === 'edit') { location.hash = '#/create'; return; }
    if (a === 'badges') return badgesDialog();
    if (a === 'close') return closeDialog();
    if (a === 'quest') { var q = questLesson(); if (q) { UXGame.setQuest(q.id); renderHud(); UXGame.toast(t('game.questSet')); } return; }
    var m = a.match(/^(go|open):(.+)$/);
    if (m && m[1] === 'go') { UXGame.setQuest(m[2]); closeDialog(); renderHud(); UXGame.toast(t('game.questSet')); }
    if (m && m[1] === 'open') { closeDialog(); open(m[2]); }
  }
  /* on-screen joystick (touch and mouse) */
  var joy = null;
  document.addEventListener('pointerdown', function (e) {
    var j = e.target.closest && e.target.closest('#hudJoy'); if (!j) return;
    e.preventDefault(); joy = { el: j, id: e.pointerId, r: j.getBoundingClientRect() }; j.setPointerCapture(e.pointerId); moveJoy(e);
  });
  function moveJoy(e) {
    if (!joy || e.pointerId !== joy.id) return;
    var r = joy.r, cx = r.left + r.width / 2, cy = r.top + r.height / 2, rad = r.width / 2;
    var dx = (e.clientX - cx) / rad, dy = (e.clientY - cy) / rad, len = Math.hypot(dx, dy);
    if (len > 1) { dx /= len; dy /= len; }
    joy.el.firstChild.style.transform = 'translate(' + dx * rad * 0.6 + 'px,' + dy * rad * 0.6 + 'px)';
    if (hub) hub.setJoystick(dx, dy);
  }
  document.addEventListener('pointermove', moveJoy);
  document.addEventListener('pointerup', function (e) {
    if (!joy || e.pointerId !== joy.id) return;
    joy.el.firstChild.style.transform = ''; joy = null; if (hub) hub.setJoystick(0, 0);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (EX.on) { if (!closeDialog()) { var b = document.getElementById('hudBig'); if (b && !b.hidden) toggleBigMap(); else stopExplore(); } }
  });

  /* ───────── hub ───────── */
  function stat(k) {
    var a = LESSONS.filter(function (l) { return l.level === k || (l.level && levelOf(l.level) && levelOf(l.level).province === k); });
    return a.filter(function (l) { return isDone(l.id); }).length + '/' + a.length;
  }
  function logoHTML(lv, size) {
    return lv.logo ? '<span class="city-logo" style="width:' + size + 'px;height:' + size + 'px">' + lv.logo + '</span>' : '';
  }
  function renderHub() {
    disposeScenes();
    var focus = getFocus();
    var chips = LEVELS.map(function (lv) {
      return '<div class="chip" data-prov="' + lv.province + '"><span class="sq" style="background:' + lv.color + '"></span>' + logoHTML(lv, 14) +
        '<span>' + esc(levelName(lv.key)) + '</span><span class="muted">' + stat(lv.key) + '</span></div>';
    }).join('');
    var switcher = ['uiux', 'frontend', 'all'].map(function (k) {
      return '<button type="button" data-focus="' + k + '" class="' + (k === focus ? 'is-on' : '') + '" aria-pressed="' + (k === focus) + '">' +
        esc(k === 'all' ? t('hub.focus.all') : t('prov.' + k + '.name')) + '</button>';
    }).join('');
    var provinces = PROVINCES.map(function (p) {
      var levels = LEVELS.filter(function (lv) { return lv.province === p.key; });
      var cols = levels.map(function (lv) {
        var rows = LESSONS.filter(function (l) { return l.level === lv.key; }).map(function (l) {
          var x = loc(l), d = isDone(l.id);
          return '<button class="row-btn" data-open="' + l.id + '">' +
            '<span class="row-num">' + pad(l.n) + '</span>' +
            '<span class="row-txt"><span class="row-title">' + esc(x.title) + '</span><span class="row-meta">' + esc(x.metaphor) + '</span></span>' +
            '<span class="row-status' + (d ? ' done' : '') + '">' + t(d ? 'hub.status.done' : 'hub.status.start') + '</span></button>';
        }).join('');
        return '<div class="level-col" style="--lv:' + lv.color + '"><div class="col-head"><h2>' + logoHTML(lv, 22) + '<span>' + esc(levelName(lv.key)) + '<small>' + esc(t('level.' + lv.key + '.sub')) + '</small></span></h2><span>' + t('hub.done', { x: stat(lv.key) }) + '</span></div>' + rows + '</div>';
      }).join('');
      return '<section class="province" id="prov-' + p.key + '" style="--pv:' + p.color + '">' +
        '<div class="prov-head"><div><span class="kicker" style="color:var(--pv)">' + esc(t('prov.' + p.key + '.kind')) + '</span>' +
          '<h2>' + esc(t('prov.' + p.key + '.name')) + '</h2><p>' + esc(t('prov.' + p.key + '.desc')) + '</p></div>' +
          '<span class="prov-count">' + t('hub.done', { x: stat(p.key) }) + '</span></div>' +
        '<div class="levels' + (levels.length === 2 ? ' two' : ' three') + '">' + cols + '</div></section>';
    }).join('');

    app.innerHTML =
      '<main class="main" data-screen-label="World map">' +
        '<section class="hero">' +
          '<span class="kicker">' + esc(t('hub.kicker')) + '</span>' +
          '<h1>' + esc(t('hub.title')) + '</h1>' +
          '<p>' + esc(t('hub.lede')) + '</p>' +
        '</section>' +
        '<section class="world" data-focus="' + focus + '"><div class="world-canvas" id="hub3d"></div>' +
          '<div class="world-legend">' + chips + '</div>' +
          '<div class="world-switch" role="group" aria-label="' + esc(t('hub.focus.label')) + '">' + switcher + '</div>' +
          '<div class="world-hint">' + esc(t('hub.hint')) + '</div>' +
          '<div class="world-play"><button type="button" class="btn-play" data-act="explore">' + esc(t('game.explore')) + '</button>' +
            (UXGame.avatar() ? '<button type="button" class="btn-code" data-act="editchar">' + esc(t('game.edit')) + '</button>' : '') + '</div>' +
          hudHTML() +
        '</section>' +
        provinces +
      '</main>';

    whenScenes(function () {
      var el = document.getElementById('hub3d');
      if (!el || hub || S.view !== 'hub') return;
      hub = UXScenes.makeHub(el, {
        lessons: LESSONS.map(function (l) { return { id: l.id, level: l.level, n: l.n, title: loc(l).title }; }),
        levels: LEVELS.map(function (lv) { return Object.assign({ name: levelName(lv.key) }, lv); }),
        cities: PROVINCES.map(function (p) { return { key: p.key, color: p.hex, name: (t('prov.' + p.key + '.name') + ' · ' + t('prov.' + p.key + '.kind')).toUpperCase() }; }),
        onOpen: open,
        doneText: t('hub.tip.done'),
        focus: focus
      });
      hub.refresh(S.done);
      if (UXGame.exploring() && UXGame.avatar()) startExplore();
    });
  }
  function focusWorld(k) {
    setFocus(k);
    var w = app.querySelector('.world'); if (w) w.setAttribute('data-focus', k);
    app.querySelectorAll('[data-focus]').forEach(function (b) { if (b.tagName === 'BUTTON') { b.classList.toggle('is-on', b.getAttribute('data-focus') === k); b.setAttribute('aria-pressed', b.getAttribute('data-focus') === k); } });
    if (hub) hub.focus(k);
  }

  /* ───────── lesson ───────── */
  function vars() {
    var l = cur(), out = {}; if (!l) return out;
    (l.controls || []).forEach(function (c, i) {
      var v = S.ctrl[i];
      if (c.type === 'range') out[c['var']] = v + (c.unit || '');
      else Object.assign(out, (c.options[v] || c.options[0]).vars);
    });
    return out;
  }
  function applyVars(force) {
    var vs = vars(), f = document.getElementById('frame'), last = force ? {} : lastVars;
    try {
      var d = f && f.contentDocument;
      if (d && d.documentElement) {
        Object.keys(vs).forEach(function (k) { d.documentElement.style.setProperty(k, vs[k]); });
        var w = f.contentWindow;
        if (w && typeof w.onVar === 'function') Object.keys(vs).forEach(function (k) { if (last[k] !== vs[k]) { try { w.onVar(k, vs[k]); } catch (e) {} } });
      }
    } catch (e) {}
    lastVars = vs;
    if (sc) sc.update(vs);
  }
  function loadFrame() {
    var f = document.getElementById('frame'); if (!f) return;
    f.onload = function () { applyVars(true); };
    f.srcdoc = S.doc;
  }

  function controlHTML(c, i, lc) {
    var v = S.ctrl[i];
    if (c.type === 'range') {
      return '<div class="ctrl"><div class="ctrl-head"><span>' + esc(lc.label) + '</span><span id="cv' + i + '">' + esc(v + (c.unit || '')) + '</span></div>' +
        '<input type="range" data-range="' + i + '" min="' + c.min + '" max="' + c.max + '" step="' + (c.step || 1) + '" value="' + v + '" aria-label="' + esc(lc.label) + '"></div>';
    }
    var sel = c.options[v] ? v : 0;
    return '<div class="ctrl"><div class="ctrl-head"><span>' + esc(lc.label) + '</span><span id="cv' + i + '">' + esc(lc.options[sel]) + '</span></div>' +
      '<div class="seg" role="group" aria-label="' + esc(lc.label) + '">' + c.options.map(function (o, oi) {
        return '<button type="button" data-sel="' + i + '" data-opt="' + oi + '" class="' + (oi === sel ? 'is-on' : '') + '" aria-pressed="' + (oi === sel) + '">' + esc(lc.options[oi]) + '</button>';
      }).join('') + '</div></div>';
  }

  function quizHTML(l, x) {
    var correct = 0;
    var qs = x.quiz.map(function (q, qi) {
      var pick = S.quiz[qi], answered = pick != null, right = pick === q.answer;
      if (right) correct++;
      var opts = q.options.map(function (txt, oi) {
        var cls = 'opt';
        if (answered && oi === pick) cls += right ? ' right' : ' wrong';
        else if (answered && !right && oi === q.answer) cls += ' answer';
        return '<button type="button" class="' + cls + '" data-q="' + qi + '" data-o="' + oi + '"><span>' + 'ABCD'[oi] + '</span><span>' + esc(txt) + '</span></button>';
      }).join('');
      var fb = answered ? '<p class="fb" style="color:' + (right ? 'var(--mint)' : 'var(--danger)') + '">' +
        esc((right ? t('lesson.correct') : t('lesson.wrong', { x: 'ABCD'[q.answer] })) + q.why) + '</p>' : '';
      return '<div class="q"><p>' + (qi + 1) + '. ' + esc(q.q) + '</p><div class="opts">' + opts + '</div>' + fb + '</div>';
    }).join('');
    return '<div class="quiz-head"><span class="label" style="color:var(--amber)">' + esc(t('lesson.quiz')) + '</span><span class="mono muted" style="font-size:12px">' + t('lesson.score', { n: correct, t: x.quiz.length }) + '</span></div>' + qs;
  }

  function editorHTML() {
    return '<div class="tabs">' + ['html', 'css', 'js'].map(function (k) {
      return '<button type="button" class="tab' + (S.tab === k ? ' is-on' : '') + '" data-tab="' + k + '">' + k.toUpperCase() + '</button>';
    }).join('') + '<span class="spacer"></span><span class="note">' + esc(t('lesson.autorun')) + '</span>' +
      '<button type="button" class="btn-reset" data-act="reset">' + esc(t('lesson.reset')) + '</button></div>' +
      '<textarea id="code" spellcheck="false" aria-label="' + S.tab.toUpperCase() + '">' + esc(S.code[S.tab] || '') + '</textarea>';
  }

  function renderLesson() {
    disposeScenes();
    var l = cur(); if (!l) return;
    var x = loc(l), lv = levelOf(l.level), idx = LESSONS.indexOf(l), prev = LESSONS[idx - 1], next = LESSONS[idx + 1];
    var list = function (arr, cls) {
      return '<ol class="olist ' + (cls || '') + '">' + arr.map(function (s, i) { return '<li><span>' + pad(i + 1) + '</span><span>' + esc(s) + '</span></li>'; }).join('') + '</ol>';
    };
    var figmaTips = l.practice === 'figma' || lv.province === 'uiux';
    var practice = figmaTips
      ? '<span class="figma-badge logo">' + LOGOS.figma + '</span><span class="label" style="color:var(--lilac)">' + esc(t('lesson.figma')) + '</span>'
      : '<span class="figma-badge logo">' + lv.logo + '</span><span class="label" style="color:var(--lv)">' + esc(t('lesson.practice')) + '</span>';
    var kind = sceneOf(l);
    var scene = kind ? '<div class="scene3d"><div class="bar">' + esc(t(kind === 'flow' ? 'lesson.3dflow' : kind === 'explain' ? 'lesson.3dexplain' : 'lesson.3d')) + '</div><div class="stage" id="scene3d"></div>' +
      '<div class="legend">' + x.legend.map(function (g) { return '<span><i style="background:' + g.c + '"></i>' + esc(g.t) + '</span>'; }).join('') + '</div></div>' : '';

    app.innerHTML =
      '<main class="main lesson" data-screen-label="Lesson" style="--lv:' + lv.color + '">' +
        '<div class="crumb"><button type="button" data-act="hub">' + esc(t('lesson.back')) + '</button><span>/</span><span>' + esc(t('prov.' + lv.province + '.name')) + '</span><span>/</span><span style="color:var(--lv)">' + esc(levelName(l.level)) + '</span><span>/</span><span>' + esc(t('lesson.crumb', { n: pad(l.n) })) + '</span></div>' +
        '<section class="title-block"><div class="title-meta"><span class="level-chip">' + logoHTML(lv, 14) + esc(levelName(l.level)) + '</span>' +
          '<span class="mono muted" style="font-size:12px">' + esc(t('lesson.kicker', { n: pad(l.n), m: x.metaphor })) + '</span></div>' +
          '<h1>' + esc(x.title) + '</h1></section>' +
        '<section class="grid-fit story">' +
          '<div class="card"><span class="label" style="color:var(--lv)">' + esc(t('lesson.parable')) + '</span><p class="parable">' + esc(x.parable) + '</p></div>' +
          '<div class="card"><span class="label" style="color:var(--lv)">' + esc(t('lesson.theory')) + '</span>' + list(x.theory) + '</div>' +
        '</section>' +
        '<section class="pg">' +
          '<div class="pg-head"><h2 class="h2">' + esc(t('lesson.playground')) + '</h2><button type="button" class="btn-code" data-act="code" aria-expanded="' + S.showCode + '">' + esc(t(S.showCode ? 'lesson.code.hide' : 'lesson.code.show')) + '</button></div>' +
          '<div class="pg-grid">' +
            '<div class="controls"><span class="label muted">' + esc(t('lesson.controls')) + '</span>' + (l.controls || []).map(function (c, i) { return controlHTML(c, i, x.controls[i]); }).join('') + '</div>' +
            '<div class="preview"><div class="bar"><span class="dot" style="background:var(--pink)"></span><span class="dot" style="background:var(--amber)"></span><span class="dot" style="background:var(--mint)"></span><span style="margin-left:8px">' + esc(t('lesson.preview')) + '</span></div>' +
              '<iframe id="frame" title="' + esc(t('frame.preview')) + '"></iframe></div>' +
            scene +
          '</div>' +
          '<div class="editor" id="editor"' + (S.showCode ? '' : ' hidden') + '>' + editorHTML() + '</div>' +
        '</section>' +
        '<section class="pg"><h2 class="h2">' + esc(t('lesson.avoidDo')) + '</h2><div class="ad">' +
          '<div class="ad-card bad"><div class="ad-head">' + esc(t('lesson.avoid')) + '</div><iframe id="bad" title="' + esc(t('frame.bad')) + '"></iframe><p>' + esc(x.bad) + '</p></div>' +
          '<div class="ad-card good"><div class="ad-head">' + esc(t('lesson.do')) + '</div><iframe id="good" title="' + esc(t('frame.good')) + '"></iframe><p>' + esc(x.good) + '</p></div>' +
        '</div></section>' +
        '<section class="grid-fit fq">' +
          '<div class="card"><div class="figma-head">' + practice + '</div>' + list(x.figma, 'figma') + '</div>' +
          '<div class="card quiz" id="quiz">' + quizHTML(l, x) + '</div>' +
        '</section>' +
        '<section class="lesson-foot">' +
          (prev ? '<button type="button" class="btn-step" data-open="' + prev.id + '">← ' + esc(loc(prev).title) + '</button>' : '<span></span>') +
          '<button type="button" class="btn-done" id="doneBtn" data-act="done"></button>' +
          (next ? '<button type="button" class="btn-step next" data-open="' + next.id + '">' + esc(loc(next).title) + ' →</button>' : '<span></span>') +
        '</section>' +
      '</main>';

    renderDoneBtn();
    lastVars = {}; lastTree = null; lastState = null;
    setFocus(lv.province);
    loadFrame();
    document.getElementById('good').srcdoc = buildDoc(l.good.html, '', '');
    document.getElementById('bad').srcdoc = buildDoc(l.bad.html, '', '');
    if (kind) whenScenes(function () {
      var el = document.getElementById('scene3d');
      if (!el || sc || cur() !== l) return;
      if (kind === 'flow') {
        sc = UXScenes.makeFlow(el, { nodes: l.flow || [], color: lv.color });
        if (lastTree) sc.message(lastTree);
      } else if (kind === 'explain') {
        sc = UXScenes.makeExplain(el, { build: EXPLAIN[l.id].build, live: !!EXPLAIN[l.id].live });
        if (lastState) sc.message(lastState);
      } else sc = kind === 'box' ? UXScenes.makeBox(el) : UXScenes.makeStack(el);
      sc.update(vars());
    });
  }

  function renderDoneBtn() {
    var b = document.getElementById('doneBtn'), l = cur(); if (!b || !l) return;
    var d = isDone(l.id);
    b.classList.toggle('is-done', d);
    b.textContent = t(d ? 'lesson.completed' : 'lesson.mark');
    b.setAttribute('aria-pressed', d ? 'true' : 'false');
  }
  function renderQuiz() { var q = document.getElementById('quiz'), l = cur(); if (q && l) q.innerHTML = quizHTML(l, loc(l)); }
  function renderEditor() { var e = document.getElementById('editor'); if (e) e.innerHTML = editorHTML(); }

  /* ───────── events ───────── */
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-open],[data-act],[data-sel],[data-q],[data-tab],button[data-focus],[data-hud],[data-ck],[data-cr]');
    if (!el || !app.contains(el)) return;
    var l = cur();
    if (el.hasAttribute('data-hud')) return hudAction(el.getAttribute('data-hud'));
    if (el.hasAttribute('data-ck')) return creatorSet(el.getAttribute('data-ck'), el.getAttribute('data-cv'));
    if (el.hasAttribute('data-cr')) {
      var a = el.getAttribute('data-cr');
      if (a === 'random') { var nm = CR.look.name; CR.look = Object.assign(UXScenes.characterOptions.randomLook(), { name: nm }); sc.setLook(CR.look); sc.wave(); document.getElementById('crPanel').innerHTML = creatorPanel(); }
      if (a === 'face' || a === 'full') sc.view(a);
      if (a === 'spin') { CR.spin = !CR.spin; sc.spin(CR.spin); }
      if (a === 'cancel') goHub();
      if (a === 'save') { CR.look.name = (document.getElementById('crName').value || '').trim() || t('cr.namePh'); UXGame.setAvatar(CR.look); UXGame.setExploring(true); goHub(); }
      return;
    }
    if (el.hasAttribute('data-open')) return open(el.getAttribute('data-open'));
    if (el.hasAttribute('data-focus')) return focusWorld(el.getAttribute('data-focus'));
    if (el.hasAttribute('data-sel')) {
      var i = +el.getAttribute('data-sel'), oi = +el.getAttribute('data-opt');
      S.ctrl[i] = oi;
      el.parentNode.querySelectorAll('button').forEach(function (b, bi) { b.classList.toggle('is-on', bi === oi); b.setAttribute('aria-pressed', bi === oi); });
      document.getElementById('cv' + i).textContent = loc(l).controls[i].options[oi];
      return applyVars();
    }
    if (el.hasAttribute('data-q')) {
      var qi = +el.getAttribute('data-q');
      S.quiz[qi] = +el.getAttribute('data-o');
      if (S.quiz[qi] === l.quiz[qi].answer) UXGame.quizRight(l.id, qi);
      renderQuiz();
      var all = l.quiz.every(function (q, k) { return S.quiz[k] === q.answer; });
      if (all && !isDone(l.id)) saveDone(S.done.concat([l.id]));
      return;
    }
    if (el.hasAttribute('data-tab')) { S.tab = el.getAttribute('data-tab'); renderEditor(); return; }
    switch (el.getAttribute('data-act')) {
      case 'hub': e.preventDefault(); return goHub();
      case 'explore': return startExplore();
      case 'editchar': location.hash = '#/create'; return;
      case 'code':
        S.showCode = !S.showCode;
        document.getElementById('editor').hidden = !S.showCode;
        el.textContent = t(S.showCode ? 'lesson.code.hide' : 'lesson.code.show');
        el.setAttribute('aria-expanded', S.showCode);
        return;
      case 'reset':
        clearTimeout(debounce);
        Object.assign(S, lessonState(l), { tab: S.tab });
        return renderLesson();
      case 'done':
        return saveDone(isDone(l.id) ? S.done.filter(function (x) { return x !== l.id; }) : S.done.concat([l.id]));
    }
  });

  document.addEventListener('input', function (e) {
    var el = e.target;
    if (el.id === 'crHeight' && CR) { CR.look.height = parseFloat(el.value); if (sc && sc.setLook) sc.setLook(CR.look); return; }
    if (el.id === 'crName' && CR) { CR.look.name = el.value; return; }
    if (el.hasAttribute && el.hasAttribute('data-range')) {
      var i = +el.getAttribute('data-range'), c = cur().controls[i], v = parseFloat(el.value);
      S.ctrl[i] = v;
      document.getElementById('cv' + i).textContent = v + (c.unit || '');
      return applyVars();
    }
    if (el.id === 'code') {
      S.code[S.tab] = el.value;
      clearTimeout(debounce);
      debounce = setTimeout(function () {
        S.doc = buildDoc(S.code.html, S.code.css, S.code.js, cur() && cur().runtime);
        lastVars = {};
        loadFrame();
      }, 450);
    }
  });

  /* Tab key inserts two spaces in the code editor (Esc then Tab still leaves it). */
  var escaped = false;
  document.addEventListener('keydown', function (e) {
    if (e.target.id !== 'code') return;
    if (e.key === 'Escape') { escaped = true; return; }
    if (e.key === 'Tab' && !e.shiftKey && !escaped) {
      e.preventDefault();
      var ta = e.target, s = ta.selectionStart;
      ta.setRangeText('  ', s, ta.selectionEnd, 'end');
      ta.dispatchEvent(new Event('input', { bubbles: true }));
    }
    escaped = false;
  });

  document.getElementById('brand').addEventListener('click', goHub);
  document.getElementById('navHub').addEventListener('click', goHub);

  I18N.onChange(function () {
    renderProgress();
    if (S.view === 'lesson') {
      // keep controls, code and quiz answers; just redraw in the new language
      renderLesson();
    } else if (S.view === 'create') { var keep = CR; renderCreator(); CR = keep; }
    else renderHub();
  });

  /* the React/Vue playgrounds post ux.render / ux.flow / ux.tree messages for the 3D view */
  window.addEventListener('message', function (e) {
    var f = document.getElementById('frame'), d = e.data;
    if (!f || e.source !== f.contentWindow || !d || !d.uxlab) return;
    if (d.type === 'tree') lastTree = d;
    if (d.type === 'state') lastState = d;
    if (sc && sc.message) sc.message(d);
  });

  window.addEventListener('hashchange', route);
  I18N.apply(document);
  renderProgress();
  route();
})();
