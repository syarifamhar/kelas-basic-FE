/* New Foundry lessons (Frontera's HTML · CSS · JS district). js/syllabus.js decides order and numbering. */
(function () {
var NEW = [
{
id:'html-structure', title:'HTML: Structure & Semantics', metaphor:'Rooms of a house',
parable:`A house isn't one big room. There's a porch, a hallway with signs, a living room, a side room and a basement, and everyone knows what each one is for. HTML tags work the same way. <header>, <nav>, <main>, <aside> and <footer> tell the browser, search engines and screen readers what each part of the page is for, not just how it looks.`,
theory:[`HTML describes structure. An element is a pair of tags around content: <p>Hello</p>. Elements nest inside each other like rooms.`,`Semantic tags say what something is: <header>, <nav>, <main>, <article>, <aside>, <footer>, <button>.`,`A page built only from <div>s can look the same, but it means nothing: a screen reader can't jump to the main content.`,`Use one <h1> per page and keep headings in order (h1 → h2 → h3), like chapters in a book.`],
controls:[
 {type:'select',label:'Markup',options:[{label:'Semantic tags',vars:{'--mk':'sem'}},{label:'div soup',vars:{'--mk':'div'}}]},
 {type:'select',label:'Show tag names',options:[{label:'On',vars:{'--tags':'1'}},{label:'Off',vars:{'--tags':'0'}}]}
],
html:`<div id="page"></div>
<p class="lm" id="lm"></p>`,
css:`#page{display:grid;grid-template-columns:1fr 110px;grid-template-areas:"h h" "n n" "m a" "f f";gap:6px;max-width:400px;font-size:13px}
#page>*{position:relative;padding:12px;border-radius:8px;background:var(--raised);border:1px solid var(--line)}
.h{grid-area:h}.n{grid-area:n;display:flex;gap:10px;color:var(--sky)}.m{grid-area:m;min-height:90px}.a{grid-area:a;color:var(--ink2)}.f{grid-area:f;color:var(--ink2);font-size:12px}
.show #page>*::before{content:attr(data-tag);position:absolute;top:-8px;right:8px;padding:0 6px;border-radius:4px;background:var(--tagc);color:#0D1016;font:600 10px 'JetBrains Mono'}
.lm{font:12px 'JetBrains Mono';margin-top:12px}`,
js:`var PARTS = [
  ['header', 'h', '<b>Kopi Senja</b>'],
  ['nav', 'n', '<span>Menu</span><span>Locations</span><span>Contact</span>'],
  ['main', 'm', '<b>Today\\'s special</b><p style="margin:6px 0 0;color:#A9B4C2">Iced palm-sugar latte</p>'],
  ['aside', 'a', 'Open 7am–10pm'],
  ['footer', 'f', '© Kopi Senja']
];
var COLORS = { header: '#FF93B5', nav: '#7FD4FF', main: '#7EF2C3', aside: '#B9A3FF', footer: '#FFC877', div: '#A9B4C2' };
function v(k) { return getComputedStyle(document.documentElement).getPropertyValue(k).trim(); }
function update() {
  var sem = v('--mk') !== 'div';
  document.getElementById('page').innerHTML = PARTS.map(function (p) {
    var tag = sem ? p[0] : 'div';
    return '<' + tag + ' class="' + p[1] + '" data-tag="<' + tag + '>" style="--tagc:' + COLORS[tag] + '">' + p[2] + '</' + tag + '>';
  }).join('');
  document.body.classList.toggle('show', v('--tags') !== '0');
  var n = document.querySelectorAll('header,nav,main,aside,footer').length;
  var lm = document.getElementById('lm');
  lm.textContent = 'Landmarks a screen reader can jump to: ' + n;
  lm.style.color = n ? '#7EF2C3' : '#FF8A8A';
}
window.onVar = update; update();`,
bad:{label:'div soup: it looks fine, but it has no meaning for assistive tech or search engines.',html:`<pre style="margin:0;font:12px/1.7 'JetBrains Mono';color:#A9B4C2">&lt;div class="top"&gt;…&lt;/div&gt;
&lt;div class="menu"&gt;…&lt;/div&gt;
&lt;div class="content"&gt;…&lt;/div&gt;
&lt;div class="btn" onclick="…"&gt;Buy&lt;/div&gt; <span style="color:#FF8A8A">// not a button</span></pre>`},
good:{label:'Semantic tags describe each room, and a real button works with the keyboard.',html:`<pre style="margin:0;font:12px/1.7 'JetBrains Mono';color:#A9B4C2">&lt;header&gt;…&lt;/header&gt;
&lt;nav&gt;…&lt;/nav&gt;
&lt;main&gt;…&lt;/main&gt;
&lt;button&gt;Buy&lt;/button&gt; <span style="color:#7EF2C3">// focusable, announced</span></pre>`},
figma:[`Create index.html in VS Code, type ! and press Tab to get a full HTML skeleton.`,`Sketch your page as boxes on paper first, then name each box with a semantic tag.`,`Open the browser DevTools, Accessibility panel, to see the landmarks a screen reader finds.`],
quiz:[
 {q:`Which tag should wrap the main content of a page?`,options:[`<div id="main">`,`<main>`,`<section class="content">`],answer:1,why:`<main> is a landmark that screen readers can jump to directly.`},
 {q:`Why is <div onclick> worse than <button>?`,options:[`It's slower`,`It can't be reached with Tab or triggered with Enter, and isn't announced as a button`,`It has the wrong color`],answer:1,why:`a real <button> gets keyboard focus, keyboard activation and the right role for free.`}
]},
{
id:'css-selectors', title:'CSS Selectors & the Cascade', metaphor:'School dress code',
parable:`The school announces: everyone wears white. Then the teacher of class 5B says: my class wears blue. Then the coach tells Budi: you wear the red captain's vest. Budi ends up in red, because the most specific instruction wins. CSS works the same way. Many rules can target one element, and the most specific selector wins.`,
theory:[`A selector picks elements: p (all paragraphs), .note (a class), #hero (one id), or combinations like .card .note.`,`When rules clash, specificity decides: an id beats a class, a class beats an element. Count it as (ids, classes, elements).`,`If two rules are equally specific, the one that comes later in the CSS wins.`,`Prefer classes. Ids and !important make rules hard to override later.`],
controls:[
 {type:'range',label:'Rules switched on',var:'--rules',min:1,max:4,step:1,unit:'',value:2}
],
html:`<div class="rules" id="rules"></div>
<div class="card"><p id="hero" class="note">Budi's outfit</p></div>
<p class="why" id="why"></p>`,
css:`.rules{display:grid;gap:6px;margin-bottom:14px;font:12px 'JetBrains Mono'}
.rule{display:flex;justify-content:space-between;gap:10px;padding:7px 10px;border-radius:8px;background:#0D1016;border:1px solid var(--line)}
.rule.off{opacity:.35;text-decoration:line-through}
.rule.win{border-color:var(--wc)}
.rule i{color:var(--ink2);font-style:normal}
.card{padding:16px;border-radius:12px;background:var(--raised);border:1px solid var(--line)}
.card p{margin:0;font:700 22px 'Space Grotesk';transition:color .3s}
.why{font:12px 'JetBrains Mono';color:var(--ink2)}`,
js:`var RULES = [
  { sel: 'p', spec: [0, 0, 1], color: '#E6EDF3', note: 'everyone wears white' },
  { sel: '.note', spec: [0, 1, 0], color: '#7FD4FF', note: 'class 5B wears blue' },
  { sel: '.card .note', spec: [0, 2, 0], color: '#FFC877', note: 'the 5B team wears gold' },
  { sel: '#hero', spec: [1, 0, 0], color: '#FF93B5', note: 'Budi wears the captain\\'s vest' }
];
function update() {
  var n = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--rules')) || 1;
  var css = RULES.slice(0, n).map(function (r) { return r.sel + ' { color: ' + r.color + '; }'; }).join('\\n');
  var style = document.getElementById('dyn') || document.head.appendChild(Object.assign(document.createElement('style'), { id: 'dyn' }));
  style.textContent = css;
  var win = n - 1;
  document.getElementById('rules').innerHTML = RULES.map(function (r, i) {
    return '<div class="rule' + (i >= n ? ' off' : '') + (i === win ? ' win' : '') + '" style="--wc:' + r.color + '"><span style="color:' + r.color + '">' + r.sel + ' { color }</span><i>(' + r.spec.join(',') + ')</i></div>';
  }).join('');
  document.getElementById('why').textContent = 'Winner: ' + RULES[win].sel + ' → ' + RULES[win].note;
}
window.onVar = update; update();`,
bad:{label:'Fighting specificity with ids and !important. The next change gets even harder.',html:`<pre style="margin:0;font:12px/1.7 'JetBrains Mono';color:#A9B4C2">#page #main .card p { color: blue; }
.note { color: red !important; }
<span style="color:#FF8A8A">// an arms race nobody wins</span></pre>`},
good:{label:'Flat, single-class selectors that are easy to override.',html:`<pre style="margin:0;font:12px/1.7 'JetBrains Mono';color:#A9B4C2">.card__title { color: var(--ink); }
.card__title--active { color: var(--mint); }
<span style="color:#7EF2C3">// (0,1,0) everywhere: order decides</span></pre>`},
figma:[`In DevTools, select an element: the Styles panel lists every rule that matches, with the losing ones crossed out.`,`Hover a selector in VS Code to see its specificity, e.g. (0, 2, 0).`,`Name classes after what things are (.card, .card__title), not how they look (.blue-text).`],
quiz:[
 {q:`Which selector wins: .note or p?`,options:[`p`,`.note`,`Whichever is written first`],answer:1,why:`a class (0,1,0) beats an element (0,0,1).`},
 {q:`Two rules have the same specificity. Which one applies?`,options:[`The first one`,`The last one in the CSS`,`Neither`],answer:1,why:`with equal specificity, source order decides: later wins.`}
]},
{
id:'js-dom', title:'JavaScript & the DOM', metaphor:'A puppet show',
parable:`In a puppet show, the puppets don't move on their own. A puppeteer above the stage pulls the strings: lift an arm, turn a head, take a bow. The page (the DOM) is the stage full of puppets, and JavaScript is the puppeteer. It finds an element, then changes its text, style or classes, and listens for the audience to clap.`,
theory:[`The browser turns your HTML into a tree of objects called the DOM. JavaScript can read it and change it.`,`Find elements with document.querySelector('.msg') or document.getElementById('title').`,`Change them: el.textContent = 'Hi', el.classList.add('on'), el.style.color = 'pink'.`,`Listen for events: btn.addEventListener('click', () => { … }) runs your code every time it's clicked.`],
controls:[
 {type:'select',label:'String to pull',options:[{label:'textContent',vars:{'--act':'text'}},{label:'classList',vars:{'--act':'class'}},{label:'style',vars:{'--act':'style'}},{label:'addEventListener',vars:{'--act':'event'}}]}
],
html:`<div class="stage">
  <h2 id="title">The stage</h2>
  <p class="msg">A puppet waits for its strings.</p>
  <button id="wave">Clap</button>
</div>
<pre class="code" id="code"></pre>`,
css:`.stage{display:grid;gap:8px;justify-items:start;padding:18px;border-radius:12px;background:var(--raised);border:1px solid var(--line);max-width:340px}
.stage h2{margin:0;transition:color .3s}
.msg{margin:0;padding:6px 10px;border-radius:8px;transition:all .3s}
.msg.on{background:#7EF2C3;color:#0D1016}
button{padding:8px 14px;border-radius:8px;border:none;background:#FFC877;color:#0D1016;font:600 13px 'IBM Plex Sans';cursor:pointer}
.code{font:12px/1.6 'JetBrains Mono';color:var(--amber);background:#0D1016;padding:10px 12px;border-radius:8px;border:1px solid var(--line);max-width:340px;white-space:pre-wrap}`,
js:`var title = document.getElementById('title');
var msg = document.querySelector('.msg');
var btn = document.getElementById('wave');
var claps = 0;
function onClap() { claps++; msg.textContent = 'The audience clapped ' + claps + ' times!'; }

function reset() {
  title.textContent = 'The stage';
  title.style.color = '';
  msg.classList.remove('on');
  msg.textContent = 'A puppet waits for its strings.';
  btn.removeEventListener('click', onClap);
}
var CODE = {
  text: "title.textContent = 'Hello, audience!';",
  class: "msg.classList.add('on');",
  style: "title.style.color = '#FF93B5';",
  event: "btn.addEventListener('click', () => {\\n  claps++;\\n  msg.textContent = 'Clapped ' + claps + ' times!';\\n});\\n// now press Clap"
};
window.onVar = function (k, v) {
  if (k !== '--act') return;
  reset();
  if (v === 'text') title.textContent = 'Hello, audience!';
  if (v === 'class') msg.classList.add('on');
  if (v === 'style') title.style.color = '#FF93B5';
  if (v === 'event') btn.addEventListener('click', onClap);
  document.getElementById('code').textContent = CODE[v];
};`,
bad:{label:'Inline onclick attributes and innerHTML everywhere: hard to read and easy to break.',html:`<pre style="margin:0;font:12px/1.7 'JetBrains Mono';color:#A9B4C2">&lt;button onclick="document.body.innerHTML += '&lt;p&gt;hi'"&gt;
<span style="color:#FF8A8A">// logic hidden in HTML, wipes listeners</span></pre>`},
good:{label:'Find once, change precisely, listen with addEventListener.',html:`<pre style="margin:0;font:12px/1.7 'JetBrains Mono';color:#A9B4C2">const btn = document.querySelector('#wave');
btn.addEventListener('click', () =&gt; {
  msg.textContent = 'Thanks!';
});</pre>`},
figma:[`Add <script src="main.js" defer></script> to your HTML so the DOM is ready when your code runs.`,`Open the browser Console and try document.querySelector('h1').textContent = 'Hi' on any website.`,`Use textContent for plain text. Only use innerHTML when you control the HTML, never with user input.`],
quiz:[
 {q:`Which line finds the first element with the class "msg"?`,options:[`document.querySelector('.msg')`,`document.msg`,`getClass('msg')`],answer:0,why:`querySelector takes any CSS selector and returns the first match.`},
 {q:`How do you run code every time a button is clicked?`,options:[`btn.addEventListener('click', fn)`,`btn.click = fn()`,`while (clicked) { … }`],answer:0,why:`addEventListener registers a function the browser calls on each click.`}
]}
];
window.UX_LESSONS.push.apply(window.UX_LESSONS, NEW);
})();
