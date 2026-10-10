/* ux.lab · by sha-labs — hub + lesson views, playground engine, quiz and progress. */
(function () {
  var t = I18N.t;
  var FONTS = '<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;600&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">';
  var BASE = ':root{--bg:#0D1016;--surface:#131821;--raised:#1A2130;--line:#263042;--ink:#E6EDF3;--ink2:#A9B4C2;--mint:#7EF2C3;--lilac:#B9A3FF;--amber:#FFC877;--pink:#FF93B5;--sky:#7FD4FF}*{box-sizing:border-box}html{color-scheme:dark}body{margin:0;padding:20px;background:#131821;color:#E6EDF3;font:15px/1.5 "IBM Plex Sans",system-ui,sans-serif}h1,h2,h3,h4{font-family:"Space Grotesk",sans-serif}';
  var LEVELS = [
    { key: 'beginner', color: '#7EF2C3', hex: 0x7EF2C3 },
    { key: 'intermediate', color: '#B9A3FF', hex: 0xB9A3FF },
    { key: 'advanced', color: '#FFC877', hex: 0xFFC877 }
  ];
  var LESSONS = window.UX_LESSONS;
  var DONE_KEY = 'uxlab.done';

  var pad = function (n) { return (n < 10 ? '0' : '') + n; };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var levelName = function (key) { return t('level.' + key); };
  var levelOf = function (key) { return LEVELS.filter(function (x) { return x.key === key; })[0]; };
  function buildDoc(html, css, js) {
    return '<!doctype html><html><head><meta charset="utf-8">' + FONTS + '<style>' + BASE + (css || '') + '</style></head><body>' + (html || '') + '<scr' + 'ipt>' + (js || '') + '</scr' + 'ipt></body></html>';
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
      legend: (l.legend || []).map(function (g, i) { return { c: g.c, t: (tr.legend && tr.legend[i]) || g.t }; }),
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
  var hub = null, sc = null, lastVars = {}, debounce = 0;

  var app = document.getElementById('app');
  var progressEl = document.getElementById('progress');

  function cur() { return S.view === 'lesson' ? LESSONS.filter(function (l) { return l.id === S.lessonId; })[0] : null; }
  function isDone(id) { return S.done.indexOf(id) >= 0; }
  function saveDone(done) {
    S.done = done;
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
    return { ctrl: ctrl, code: code, doc: buildDoc(code.html, code.css, code.js), tab: 'html' };
  }

  /* scenes.js is an ES module, so it may finish loading after this script runs */
  function whenScenes(fn) {
    if (window.UXScenes) fn();
    else window.addEventListener('uxscenes:ready', fn, { once: true });
  }

  function disposeScenes() {
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
    } else {
      S.view = 'hub'; S.lessonId = null;
      renderHub();
    }
    window.scrollTo(0, 0);
  }
  function open(id) { location.hash = '#/lesson/' + id; }
  function goHub() { location.hash = '#/'; }

  /* ───────── hub ───────── */
  function renderHub() {
    disposeScenes();
    var stat = function (k) {
      var a = LESSONS.filter(function (l) { return l.level === k; });
      return a.filter(function (l) { return isDone(l.id); }).length + '/' + a.length;
    };
    var chips = LEVELS.map(function (lv) {
      return '<div class="chip"><span class="sq" style="background:' + lv.color + '"></span><span>' + esc(levelName(lv.key)) + '</span><span class="muted">' + stat(lv.key) + '</span></div>';
    }).join('');
    var cols = LEVELS.map(function (lv) {
      var rows = LESSONS.filter(function (l) { return l.level === lv.key; }).map(function (l) {
        var x = loc(l), d = isDone(l.id);
        return '<button class="row-btn" data-open="' + l.id + '">' +
          '<span class="row-num">' + pad(l.n) + '</span>' +
          '<span class="row-txt"><span class="row-title">' + esc(x.title) + '</span><span class="row-meta">' + esc(x.metaphor) + '</span></span>' +
          '<span class="row-status' + (d ? ' done' : '') + '">' + t(d ? 'hub.status.done' : 'hub.status.start') + '</span></button>';
      }).join('');
      return '<div class="level-col" style="--lv:' + lv.color + '"><div class="col-head"><h2>' + esc(levelName(lv.key)) + '</h2><span>' + t('hub.done', { x: stat(lv.key) }) + '</span></div>' + rows + '</div>';
    }).join('');

    app.innerHTML =
      '<main class="main" data-screen-label="World map">' +
        '<section class="hero">' +
          '<span class="kicker">' + esc(t('hub.kicker')) + '</span>' +
          '<h1>' + esc(t('hub.title')) + '</h1>' +
          '<p>' + esc(t('hub.lede')) + '</p>' +
        '</section>' +
        '<section class="world"><div class="world-canvas" id="hub3d"></div>' +
          '<div class="world-legend">' + chips + '</div>' +
          '<div class="world-hint">' + esc(t('hub.hint')) + '</div>' +
        '</section>' +
        '<section class="levels">' + cols + '</section>' +
      '</main>';

    whenScenes(function () {
      var el = document.getElementById('hub3d');
      if (!el || hub || S.view !== 'hub') return;
      hub = UXScenes.makeHub(document.getElementById('hub3d'), {
        lessons: LESSONS.map(function (l) { return { id: l.id, level: l.level, n: l.n, title: loc(l).title }; }),
        levels: LEVELS.map(function (lv) { return Object.assign({ name: levelName(lv.key) }, lv); }),
        onOpen: open,
        doneText: t('hub.tip.done')
      });
      hub.refresh(S.done);
    });
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
    var scene = l.scene ? '<div class="scene3d"><div class="bar">' + esc(t('lesson.3d')) + '</div><div class="stage" id="scene3d"></div>' +
      '<div class="legend">' + x.legend.map(function (g) { return '<span><i style="background:' + g.c + '"></i>' + esc(g.t) + '</span>'; }).join('') + '</div></div>' : '';

    app.innerHTML =
      '<main class="main lesson" data-screen-label="Lesson" style="--lv:' + lv.color + '">' +
        '<div class="crumb"><button type="button" data-act="hub">' + esc(t('lesson.back')) + '</button><span>/</span><span style="color:var(--lv)">' + esc(levelName(l.level)) + '</span><span>/</span><span>' + esc(t('lesson.crumb', { n: pad(l.n) })) + '</span></div>' +
        '<section class="title-block"><div class="title-meta"><span class="level-chip">' + esc(levelName(l.level)) + '</span>' +
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
          '<div class="card"><div class="figma-head"><span class="figma-badge">F</span><span class="label" style="color:var(--lilac)">' + esc(t('lesson.figma')) + '</span></div>' + list(x.figma, 'figma') + '</div>' +
          '<div class="card quiz" id="quiz">' + quizHTML(l, x) + '</div>' +
        '</section>' +
        '<section class="lesson-foot">' +
          (prev ? '<button type="button" class="btn-step" data-open="' + prev.id + '">← ' + esc(loc(prev).title) + '</button>' : '<span></span>') +
          '<button type="button" class="btn-done" id="doneBtn" data-act="done"></button>' +
          (next ? '<button type="button" class="btn-step next" data-open="' + next.id + '">' + esc(loc(next).title) + ' →</button>' : '<span></span>') +
        '</section>' +
      '</main>';

    renderDoneBtn();
    lastVars = {};
    loadFrame();
    document.getElementById('good').srcdoc = buildDoc(l.good.html, '', '');
    document.getElementById('bad').srcdoc = buildDoc(l.bad.html, '', '');
    if (l.scene) whenScenes(function () {
      var el = document.getElementById('scene3d');
      if (!el || sc || cur() !== l) return;
      sc = l.scene === 'box' ? UXScenes.makeBox(el) : UXScenes.makeStack(el);
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
    var el = e.target.closest('[data-open],[data-act],[data-sel],[data-q],[data-tab]');
    if (!el || !app.contains(el)) return;
    var l = cur();
    if (el.hasAttribute('data-open')) return open(el.getAttribute('data-open'));
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
      renderQuiz();
      var all = l.quiz.every(function (q, k) { return S.quiz[k] === q.answer; });
      if (all && !isDone(l.id)) saveDone(S.done.concat([l.id]));
      return;
    }
    if (el.hasAttribute('data-tab')) { S.tab = el.getAttribute('data-tab'); renderEditor(); return; }
    switch (el.getAttribute('data-act')) {
      case 'hub': e.preventDefault(); return goHub();
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
        S.doc = buildDoc(S.code.html, S.code.css, S.code.js);
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
    } else renderHub();
  });

  window.addEventListener('hashchange', route);
  I18N.apply(document);
  renderProgress();
  route();
})();
