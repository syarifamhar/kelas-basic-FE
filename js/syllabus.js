/* The syllabus: which district every lesson belongs to, and in which order.
   World → city → district → lesson.
   Pixelia (UI/UX city):   Principia = UI/UX theory, Vectoria = Figma
   Frontera (frontend city): Foundry = HTML · CSS · JS, React, Vue
   Loaded after every lesson file; it reorders window.UX_LESSONS and numbers the lessons 1…n. */
(function () {
  var SYLLABUS = [
    ['theory', ['ux-process', 'ux-personas', 'ux-flows', 'hierarchy', 'gestalt', 'color', 'type', 'spacing', 'fitts-hick', 'affordance', 'a11y', 'motion', 'ux-heuristics']],
    ['figma', ['figma-basics', 'figma-components', 'tokens', 'figma-prototype', 'figma-handoff']],
    ['basics', ['html-structure', 'css-selectors', 'box-model', 'responsive', 'z-index', 'js-dom', 'state']],
    ['react', ['react-components', 'react-props', 'react-state', 'react-effects', 'react-lists']],
    ['vue', ['vue-template', 'vue-reactivity', 'vue-directives', 'vue-model', 'vue-components']]
  ];
  var byId = {};
  window.UX_LESSONS.forEach(function (l) { byId[l.id] = l; });
  var ordered = [];
  SYLLABUS.forEach(function (d) {
    d[1].forEach(function (id) { var l = byId[id]; if (l) { l.level = d[0]; ordered.push(l); } });
  });
  ordered.forEach(function (l, i) { l.n = i + 1; });
  window.UX_LESSONS.length = 0;
  Array.prototype.push.apply(window.UX_LESSONS, ordered);

  // these Foundry lessons end with Figma tips rather than code-project steps
  ['box-model', 'responsive', 'z-index', 'state'].forEach(function (id) { if (byId[id]) byId[id].practice = 'figma'; });

  // the vending machine tells the 3D explainer which state it is in
  if (byId.state && byId.state.js.indexOf('ux.state') < 0) {
    byId.state.js = byId.state.js.replace('function render(){', 'function render(){\n  if (window.ux) ux.state({ status: state.status, credit: state.credit, price: state.price }); // for the 3D view');
  }
})();
