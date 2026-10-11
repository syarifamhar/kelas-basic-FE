/* Gamification: XP, levels, badges, the saved character and toasts.
   Everything is stored in localStorage on this device. */
(function () {
  var t = I18N.t;
  var KEYS = { game: 'uxlab.game', avatar: 'uxlab.avatar', pos: 'uxlab.pos', exploring: 'uxlab.exploring', quest: 'uxlab.quest' };
  var XP_PER_LEVEL = 250;
  var REWARD = { lesson: 100, quiz: 10, visit: 25, talk: 15 };
  var DISTRICTS = ['theory', 'figma', 'basics', 'react', 'vue'];

  var read = function (k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
  var write = function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };

  var state = Object.assign({ xp: 0, rewarded: {}, quiz: {}, visited: {}, talked: {}, badges: [] }, read(KEYS.game, {}));
  var save = function () { write(KEYS.game, state); renderPill(); };

  var level = function (xp) { return Math.floor((xp == null ? state.xp : xp) / XP_PER_LEVEL) + 1; };
  var title = function (lv) { var best = 1; [1, 2, 4, 6, 9, 13].forEach(function (k) { if (lv >= k) best = k; }); return t('game.title.' + best); };
  var progress = function () { return (state.xp % XP_PER_LEVEL) / XP_PER_LEVEL; };

  /* toasts in the bottom-centre of the screen */
  var box = document.createElement('div'); box.className = 'toasts'; box.setAttribute('role', 'status'); box.setAttribute('aria-live', 'polite');
  document.body.appendChild(box);
  function toast(text, kind) {
    var el = document.createElement('div'); el.className = 'toast ' + (kind || '');
    el.textContent = text; box.appendChild(el);
    setTimeout(function () { el.classList.add('out'); }, 2600);
    setTimeout(function () { el.remove(); }, 3100);
  }

  /* badges are recomputed from the game state and the list of finished lessons */
  var BADGES = [
    { id: 'first', glyph: '★', test: function (c) { return c.done.length > 0; } },
    { id: 'theory', glyph: '◆', color: '#7EF2C3', test: function (c) { return c.allDone('theory'); } },
    { id: 'figma', glyph: '◆', color: '#A259FF', test: function (c) { return c.allDone('figma'); } },
    { id: 'basics', glyph: '◆', color: '#FF8A4C', test: function (c) { return c.allDone('basics'); } },
    { id: 'react', glyph: '◆', color: '#61DAFB', test: function (c) { return c.allDone('react'); } },
    { id: 'vue', glyph: '◆', color: '#42B883', test: function (c) { return c.allDone('vue'); } },
    { id: 'explorer', glyph: '⌖', test: function () { return DISTRICTS.every(function (d) { return state.visited[d]; }); } },
    { id: 'social', glyph: '☺', test: function () { return DISTRICTS.every(function (d) { return state.talked[d]; }); } }
  ];
  var ctxFor = function (done) {
    return {
      done: done,
      allDone: function (d) {
        var list = window.UX_LESSONS.filter(function (l) { return l.level === d; });
        return list.length > 0 && list.every(function (l) { return done.indexOf(l.id) >= 0; });
      }
    };
  };
  function checkBadges(done) {
    var c = ctxFor(done || []);
    BADGES.forEach(function (b) {
      if (state.badges.indexOf(b.id) < 0 && b.test(c)) {
        state.badges.push(b.id);
        toast(t('game.badge', { b: t('badge.' + b.id) }), 'badge');
      }
    });
    save();
  }

  function addXP(n, reason) {
    var before = level();
    state.xp += n;
    toast(t('game.xpGain', { n: n, r: t('game.r.' + reason) }), 'xp');
    var after = level();
    if (after > before) setTimeout(function () { toast(t('game.levelUp', { n: after, t: title(after) }), 'level'); }, 700);
    save();
  }

  /* header pill: level + XP */
  function renderPill() {
    var el = document.getElementById('xpPill');
    if (!el) {
      var p = document.getElementById('progress'); if (!p) return;
      el = document.createElement('span'); el.id = 'xpPill'; el.className = 'xp-pill';
      p.parentNode.insertBefore(el, p.nextSibling);
    }
    el.innerHTML = '<b>' + t('game.level', { n: level() }) + '</b> · ' + t('game.xp', { n: state.xp });
    el.title = title(level());
  }
  renderPill();
  I18N.onChange(renderPill);

  window.UXGame = {
    KEYS: KEYS, BADGES: BADGES, DISTRICTS: DISTRICTS,
    get state() { return state; },
    level: level, title: title, progress: progress, toast: toast,
    lessonDone: function (id, done) { if (!state.rewarded[id]) { state.rewarded[id] = 1; addXP(REWARD.lesson, 'lesson'); } checkBadges(done); },
    quizRight: function (id, qi) { var k = id + ':' + qi; if (!state.quiz[k]) { state.quiz[k] = 1; addXP(REWARD.quiz, 'quiz'); } },
    visit: function (d, done) { if (d && !state.visited[d]) { state.visited[d] = 1; addXP(REWARD.visit, 'visit'); checkBadges(done); } },
    talk: function (d, done) { if (d && !state.talked[d]) { state.talked[d] = 1; addXP(REWARD.talk, 'talk'); checkBadges(done); } },
    checkBadges: checkBadges,
    avatar: function () { return read(KEYS.avatar, null); },
    setAvatar: function (look) { write(KEYS.avatar, look); },
    pos: function () { return read(KEYS.pos, null); },
    setPos: function (p) { write(KEYS.pos, p); },
    exploring: function () { return read(KEYS.exploring, false); },
    setExploring: function (on) { write(KEYS.exploring, !!on); },
    quest: function () { return read(KEYS.quest, null); },
    setQuest: function (id) { write(KEYS.quest, id); }
  };
})();
