/* Language switching (ID / ENG).
   - I18N.t(key, vars) returns the UI string for the current language.
   - I18N.apply(root) fills every [data-i18n] element (and [data-i18n-title], [data-i18n-aria]).
   - I18N.switcher() returns the flag toggle markup; clicks on [data-lang] are handled globally.
   - I18N.onChange(fn) runs fn whenever the language changes. */
(function () {
  var KEY = 'uxlab.lang';

  var STR = {
    en: {
      'brand.sub': 'UI/UX learning lab',
      'nav.world': 'World map',
      'nav.ds': 'Design system',
      'nav.progress': '{d}/{t} complete',
      'lang.label': 'Language',
      'level.beginner': 'Beginner',
      'level.intermediate': 'Intermediate',
      'level.advanced': 'Advanced',
      'hub.kicker': '// AN INTERACTIVE FIELD GUIDE TO UI/UX',
      'hub.title': 'Interface theory you can poke, drag and break.',
      'hub.lede': '15 lessons, each starting from an everyday story (shipping packages, cutlery drawers, vending machines) and ending in a live playground. Edit the HTML, CSS and JS yourself, then learn the Figma way to do it.',
      'hub.hint': 'drag to orbit · click a building to enter · lit = completed',
      'hub.done': '{x} done',
      'hub.status.done': '✓ done',
      'hub.status.start': 'start →',
      'hub.tip.done': 'DONE',
      'lesson.back': '← world map',
      'lesson.crumb': 'lesson {n}',
      'lesson.kicker': 'LESSON {n} · {m}',
      'lesson.parable': '// THE PARABLE',
      'lesson.theory': '// THE THEORY',
      'lesson.playground': 'Playground',
      'lesson.code.show': '‹/› view & edit source',
      'lesson.code.hide': '‹/› hide source',
      'lesson.controls': 'CONTROLS',
      'lesson.preview': 'live preview',
      'lesson.3d': '3D view · drag to orbit',
      'lesson.autorun': 'edits re-run automatically',
      'lesson.reset': 'reset',
      'lesson.avoidDo': 'Avoid vs. do',
      'lesson.avoid': '✕ AVOID',
      'lesson.do': '✓ DO',
      'lesson.figma': '// DO IT IN FIGMA',
      'lesson.quiz': '// MINI QUIZ',
      'lesson.score': '{n}/{t} correct',
      'lesson.correct': 'Correct: ',
      'lesson.wrong': 'Not quite. The answer is {x}: ',
      'lesson.mark': 'Mark lesson complete',
      'lesson.completed': '✓ Completed',
      'frame.preview': 'Playground preview',
      'frame.bad': 'Bad example',
      'frame.good': 'Good example',
      'footer.made': 'Made with care by',
      'footer.ds': 'Night Shift design system',

      'ds.crumb': '/ design system',
      'ds.nav.color': 'color', 'ds.nav.type': 'type', 'ds.nav.space': 'space',
      'ds.nav.components': 'components', 'ds.nav.motion': 'motion', 'ds.nav.tokens': 'tokens',
      'ds.back': '← back to the lab',
      'ds.title': 'A design system for late-night tinkerers.',
      'ds.lede': 'It feels like your favorite code editor at 2am: deep, low-glare surfaces, soft neon used only where it means something, and monospace wherever a machine is talking.',
      'ds.p1': '01 calm by default', 'ds.p1d': 'Neutrals do 90% of the work. Neon is a signal, not decoration.',
      'ds.p2': '02 mono for machines', 'ds.p2d': 'Labels, values and code use mono. Humans get Plex Sans.',
      'ds.p3': '03 snap to 4', 'ds.p3d': 'Every space, size and radius is a multiple of 4.',
      'ds.color.k': '01 / COLOR', 'ds.color.h': 'Surfaces & ink',
      'ds.sw.page': 'page', 'ds.sw.cards': 'cards', 'ds.sw.popovers': 'popovers', 'ds.sw.borders': 'borders', 'ds.sw.secondary': 'secondary', 'ds.sw.text': 'text',
      'ds.accents': 'Soft neon accents',
      'ds.ac.mint': 'Primary action, success, Beginner', 'ds.ac.lilac': 'Figma, selection, Intermediate',
      'ds.ac.amber': 'Focus ring, warning, Advanced', 'ds.ac.sky': 'Info, links in code, guides',
      'ds.ac.pink': 'Playful highlights, reset', 'ds.ac.danger': 'Errors, "avoid" examples',
      'ds.aa': 'Every accent passes AA (≥ 4.5:1) as text on --bg and --surface. Text on an accent fill is always --bg.',
      'ds.type.k': '02 / TYPE', 'ds.type.h': 'Three voices',
      'ds.f1': 'display · headings · 500 / 700', 'ds.f2': 'body · UI · 400 / 500 / 600', 'ds.f3': 'code · labels · values · 400 / 600',
      'ds.s.display': 'Poke it.', 'ds.s.h1': 'The box model', 'ds.s.h2': 'Playground', 'ds.s.h3': 'Do it in Figma',
      'ds.s.body': 'When you ship a mug, there\'s the mug itself, bubble wrap around it, and the cardboard box.',
      'ds.s.small': 'Supporting copy, captions and hints.',
      'ds.scale': 'Scale: base 16 × 1.25 (major third), rounded. Body line height 1.6, headings 1.0–1.15. Measure ≤ 70ch.',
      'ds.space.k': '03 / SPACE & SHAPE', 'ds.space.h': 'Snap to the grid',
      'ds.el.flat': 'flat · border', 'ds.el.raised': 'raised · shadow', 'ds.el.active': 'active · glow',
      'ds.comp.k': '04 / COMPONENTS', 'ds.comp.h': 'Buttons, inputs, cards',
      'ds.buttons': 'BUTTONS', 'ds.b.run': 'Run lesson', 'ds.b.secondary': 'Secondary', 'ds.b.ghost': 'Ghost', 'ds.b.reset': 'Reset', 'ds.b.disabled': 'Disabled',
      'ds.b.on': 'on', 'ds.b.off': 'off',
      'ds.inputs': 'INPUTS', 'ds.i.name': 'Project name', 'ds.i.focus': 'Focus state', 'ds.i.typing': 'typing…', 'ds.i.error': 'Error state', 'ds.i.errmsg': '⚠ Must be 8+ characters',
      'ds.card.title': 'The CSS Box Model', 'ds.card.meta': 'Shipping a package',
      'ds.card.parable': 'Curb cuts were built for wheelchairs, and now everyone uses them.',
      'ds.tip': 'ⓘ TIP', 'ds.tip.t': 'Press Tab to move through the form.',
      'ds.careful': '⚠ CAREFUL', 'ds.careful.t': 'z-index can\'t escape its stacking context.',
      'ds.motion.k': '05 / MOTION', 'ds.motion.h': 'Ease out, never slam', 'ds.play': '▶ play curves',
      'ds.linear': 'progress & spinners only',
      'ds.m.fast': 'hover, press, toggles', 'ds.m.base': 'menus, tabs, cards', 'ds.m.slow': 'drawers, page, 3D camera',
      'ds.tokens.k': '06 / TOKENS', 'ds.tokens.h': 'Copy the variables', 'ds.copy': 'copy CSS', 'ds.copied': '✓ copied'
    },
    id: {
      'brand.sub': 'lab belajar UI/UX',
      'nav.world': 'Peta dunia',
      'nav.ds': 'Design system',
      'nav.progress': '{d}/{t} selesai',
      'lang.label': 'Bahasa',
      'level.beginner': 'Pemula',
      'level.intermediate': 'Menengah',
      'level.advanced': 'Mahir',
      'hub.kicker': '// PANDUAN INTERAKTIF UI/UX',
      'hub.title': 'Teori antarmuka yang bisa kamu colek, geser, dan bongkar.',
      'hub.lede': '15 pelajaran, masing-masing dimulai dari cerita sehari-hari (mengirim paket, laci sendok garpu, mesin penjual otomatis) dan diakhiri dengan playground interaktif. Edit sendiri HTML, CSS, dan JS-nya, lalu pelajari cara melakukannya di Figma.',
      'hub.hint': 'seret untuk memutar · klik gedung untuk masuk · menyala = selesai',
      'hub.done': '{x} selesai',
      'hub.status.done': '✓ selesai',
      'hub.status.start': 'mulai →',
      'hub.tip.done': 'SELESAI',
      'lesson.back': '← peta dunia',
      'lesson.crumb': 'pelajaran {n}',
      'lesson.kicker': 'PELAJARAN {n} · {m}',
      'lesson.parable': '// PERUMPAMAAN',
      'lesson.theory': '// TEORI',
      'lesson.playground': 'Playground',
      'lesson.code.show': '‹/› lihat & edit kode',
      'lesson.code.hide': '‹/› sembunyikan kode',
      'lesson.controls': 'KONTROL',
      'lesson.preview': 'pratinjau langsung',
      'lesson.3d': 'tampilan 3D · seret untuk memutar',
      'lesson.autorun': 'perubahan langsung dijalankan',
      'lesson.reset': 'reset',
      'lesson.avoidDo': 'Hindari vs. lakukan',
      'lesson.avoid': '✕ HINDARI',
      'lesson.do': '✓ LAKUKAN',
      'lesson.figma': '// LAKUKAN DI FIGMA',
      'lesson.quiz': '// KUIS MINI',
      'lesson.score': '{n}/{t} benar',
      'lesson.correct': 'Benar: ',
      'lesson.wrong': 'Belum tepat. Jawabannya {x}: ',
      'lesson.mark': 'Tandai pelajaran selesai',
      'lesson.completed': '✓ Selesai',
      'frame.preview': 'Pratinjau playground',
      'frame.bad': 'Contoh buruk',
      'frame.good': 'Contoh baik',
      'footer.made': 'Dibuat dengan sepenuh hati oleh',
      'footer.ds': 'Design system Night Shift',

      'ds.crumb': '/ design system',
      'ds.nav.color': 'warna', 'ds.nav.type': 'tipografi', 'ds.nav.space': 'spasi',
      'ds.nav.components': 'komponen', 'ds.nav.motion': 'gerak', 'ds.nav.tokens': 'token',
      'ds.back': '← kembali ke lab',
      'ds.title': 'Design system untuk para pengoprek larut malam.',
      'ds.lede': 'Rasanya seperti code editor favoritmu jam 2 pagi: permukaan gelap yang tidak menyilaukan, neon lembut yang hanya dipakai saat punya arti, dan font monospace di mana pun mesin sedang berbicara.',
      'ds.p1': '01 tenang secara default', 'ds.p1d': 'Warna netral mengerjakan 90% tugas. Neon adalah sinyal, bukan hiasan.',
      'ds.p2': '02 mono untuk mesin', 'ds.p2d': 'Label, nilai, dan kode memakai mono. Manusia mendapat Plex Sans.',
      'ds.p3': '03 kelipatan 4', 'ds.p3d': 'Setiap spasi, ukuran, dan radius adalah kelipatan 4.',
      'ds.color.k': '01 / WARNA', 'ds.color.h': 'Permukaan & tinta',
      'ds.sw.page': 'halaman', 'ds.sw.cards': 'kartu', 'ds.sw.popovers': 'popover', 'ds.sw.borders': 'border', 'ds.sw.secondary': 'sekunder', 'ds.sw.text': 'teks',
      'ds.accents': 'Aksen neon lembut',
      'ds.ac.mint': 'Aksi utama, sukses, Pemula', 'ds.ac.lilac': 'Figma, seleksi, Menengah',
      'ds.ac.amber': 'Focus ring, peringatan, Mahir', 'ds.ac.sky': 'Info, link di kode, garis bantu',
      'ds.ac.pink': 'Sorotan playful, reset', 'ds.ac.danger': 'Error, contoh "hindari"',
      'ds.aa': 'Setiap aksen lolos AA (≥ 4.5:1) sebagai teks di atas --bg dan --surface. Teks di atas isian aksen selalu --bg.',
      'ds.type.k': '02 / TIPOGRAFI', 'ds.type.h': 'Tiga suara',
      'ds.f1': 'display · heading · 500 / 700', 'ds.f2': 'teks isi · UI · 400 / 500 / 600', 'ds.f3': 'kode · label · nilai · 400 / 600',
      'ds.s.display': 'Colek saja.', 'ds.s.h1': 'Box model', 'ds.s.h2': 'Playground', 'ds.s.h3': 'Lakukan di Figma',
      'ds.s.body': 'Saat kamu mengirim mug, ada mug itu sendiri, bubble wrap yang membungkusnya, dan kardusnya.',
      'ds.s.small': 'Teks pendukung, keterangan, dan petunjuk.',
      'ds.scale': 'Skala: dasar 16 × 1.25 (major third), dibulatkan. Line height teks isi 1.6, heading 1.0–1.15. Panjang baris ≤ 70ch.',
      'ds.space.k': '03 / SPASI & BENTUK', 'ds.space.h': 'Patuhi grid',
      'ds.el.flat': 'datar · border', 'ds.el.raised': 'timbul · bayangan', 'ds.el.active': 'aktif · glow',
      'ds.comp.k': '04 / KOMPONEN', 'ds.comp.h': 'Tombol, input, kartu',
      'ds.buttons': 'TOMBOL', 'ds.b.run': 'Mulai pelajaran', 'ds.b.secondary': 'Sekunder', 'ds.b.ghost': 'Ghost', 'ds.b.reset': 'Reset', 'ds.b.disabled': 'Nonaktif',
      'ds.b.on': 'nyala', 'ds.b.off': 'mati',
      'ds.inputs': 'INPUT', 'ds.i.name': 'Nama proyek', 'ds.i.focus': 'State fokus', 'ds.i.typing': 'mengetik…', 'ds.i.error': 'State error', 'ds.i.errmsg': '⚠ Minimal 8 karakter',
      'ds.card.title': 'CSS Box Model', 'ds.card.meta': 'Mengirim paket',
      'ds.card.parable': 'Ramp trotoar dibuat untuk kursi roda, dan sekarang semua orang memakainya.',
      'ds.tip': 'ⓘ TIPS', 'ds.tip.t': 'Tekan Tab untuk berpindah antar isian form.',
      'ds.careful': '⚠ HATI-HATI', 'ds.careful.t': 'z-index tidak bisa keluar dari stacking context-nya.',
      'ds.motion.k': '05 / GERAK', 'ds.motion.h': 'Melambat, jangan membanting', 'ds.play': '▶ putar kurva',
      'ds.linear': 'hanya untuk progress & spinner',
      'ds.m.fast': 'hover, tekan, toggle', 'ds.m.base': 'menu, tab, kartu', 'ds.m.slow': 'drawer, halaman, kamera 3D',
      'ds.tokens.k': '06 / TOKEN', 'ds.tokens.h': 'Salin variabelnya', 'ds.copy': 'salin CSS', 'ds.copied': '✓ tersalin'
    }
  };

  function flagID() {
    return '<svg class="flag" viewBox="0 0 30 20" aria-hidden="true"><rect width="30" height="10" fill="#E70011"/><rect y="10" width="30" height="10" fill="#FFFFFF"/></svg>';
  }
  function flagUS() {
    var s = '<svg class="flag" viewBox="0 0 38 20" aria-hidden="true"><rect width="38" height="20" fill="#FFFFFF"/>';
    for (var i = 0; i < 13; i += 2) s += '<rect y="' + (i * 20 / 13).toFixed(3) + '" width="38" height="' + (20 / 13).toFixed(3) + '" fill="#B22234"/>';
    s += '<rect width="15.2" height="10.77" fill="#3C3B6E"/>';
    for (var r = 0; r < 5; r++) for (var c = 0; c < 6; c++) {
      if (r % 2 && c === 5) continue;
      s += '<circle cx="' + (1.4 + c * 2.5 + (r % 2) * 1.25).toFixed(2) + '" cy="' + (1.2 + r * 2.1).toFixed(2) + '" r=".55" fill="#FFFFFF"/>';
    }
    return s + '</svg>';
  }

  var listeners = [];
  var lang = 'id';
  try { var saved = localStorage.getItem(KEY); if (saved === 'en' || saved === 'id') lang = saved; } catch (e) {}

  var I18N = {
    get lang() { return lang; },
    t: function (key, vars) {
      var s = (STR[lang] && STR[lang][key]);
      if (s == null) s = STR.en[key];
      if (s == null) return key;
      if (vars) Object.keys(vars).forEach(function (k) { s = s.split('{' + k + '}').join(vars[k]); });
      return s;
    },
    set: function (next) {
      if (next !== 'en' && next !== 'id') return;
      if (next === lang) return;
      lang = next;
      try { localStorage.setItem(KEY, lang); } catch (e) {}
      document.documentElement.lang = lang;
      I18N.apply(document);
      listeners.forEach(function (fn) { fn(lang); });
    },
    onChange: function (fn) { listeners.push(fn); },
    apply: function (root) {
      (root || document).querySelectorAll('[data-i18n]').forEach(function (el) { el.textContent = I18N.t(el.getAttribute('data-i18n')); });
      (root || document).querySelectorAll('[data-i18n-title]').forEach(function (el) { el.title = I18N.t(el.getAttribute('data-i18n-title')); });
      (root || document).querySelectorAll('[data-i18n-aria]').forEach(function (el) { el.setAttribute('aria-label', I18N.t(el.getAttribute('data-i18n-aria'))); });
      (root || document).querySelectorAll('.lang [data-lang]').forEach(function (b) {
        var on = b.getAttribute('data-lang') === lang;
        b.classList.toggle('is-on', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
    },
    switcher: function () {
      return '<div class="lang" role="group" data-i18n-aria="lang.label" aria-label="' + I18N.t('lang.label') + '">' +
        '<button type="button" data-lang="id" title="Bahasa Indonesia">' + flagID() + '<span>ID</span></button>' +
        '<button type="button" data-lang="en" title="English">' + flagUS() + '<span>ENG</span></button>' +
        '</div>';
    }
  };

  document.documentElement.lang = lang;
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.lang [data-lang]');
    if (b) I18N.set(b.getAttribute('data-lang'));
  });

  window.I18N = I18N;
})();
