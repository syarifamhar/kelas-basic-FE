/* New Pixelia lessons: UX theory (Principia) and Figma (Vectoria). Same shape as lessons.js.
   js/syllabus.js decides the final order, district and numbering. */
(function () {
var NEW = [
/* ───────────── PRINCIPIA · UX ───────────── */
{
id:'ux-process', title:'The UX Process', metaphor:'A visit to the doctor',
parable:`A good doctor doesn't hand you pills the moment you walk in. First they listen and ask questions, then they name the problem, consider a few treatments, try one, and check whether you got better. Design works the same way: understand people first, define the problem, explore ideas, build something small, and test it.`,
theory:[`Empathize: learn about the people you design for. Watch, listen and ask before you draw anything.`,`Define: turn what you learned into one clear problem statement: who struggles with what, and why.`,`Ideate and prototype: sketch many ideas, then build a quick, cheap version of the best ones.`,`Test: put the prototype in front of real users. What you learn sends you back to an earlier step, and the loop repeats.`],
controls:[
 {type:'select',label:'Stage',options:[{label:'1 Empathize',vars:{'--stage':'0'}},{label:'2 Define',vars:{'--stage':'1'}},{label:'3 Ideate',vars:{'--stage':'2'}},{label:'4 Prototype',vars:{'--stage':'3'}},{label:'5 Test',vars:{'--stage':'4'}}]}
],
html:`<div class="steps" id="steps"></div>
<article class="card">
  <small id="k"></small>
  <h3 id="h"></h3>
  <p id="d"></p>
  <div class="ex"><b>Canteen app example</b><p id="e"></p></div>
  <p class="out" id="o"></p>
</article>`,
css:`.steps{display:flex;gap:6px;margin-bottom:14px}
.steps span{flex:1;height:8px;border-radius:99px;background:var(--line);transition:background .3s}
.steps span.done{background:#3a6b5a}.steps span.on{background:var(--mint)}
.card{display:grid;gap:8px;max-width:380px;padding:18px;border-radius:12px;background:var(--raised);border:1px solid var(--line)}
.card small{font:12px 'JetBrains Mono';color:var(--mint)}
.card h3{margin:0;font-size:22px}
.card p{margin:0}
.ex{padding:12px;border-radius:10px;background:#0D1016;border:1px solid var(--line);font-size:14px}
.ex p{color:var(--ink2);margin-top:4px}
.out{font:12px 'JetBrains Mono';color:var(--amber)}`,
js:`var STAGES = [
  { n: 'Empathize', d: 'Watch and interview the people you design for.', e: 'You spend lunch in the canteen. Students wait 12 minutes and some give up.', o: 'Output: interview notes, observations' },
  { n: 'Define', d: 'Write one clear problem statement.', e: '"Students with a 30-minute break need food fast, because the queue eats their time."', o: 'Output: a problem statement' },
  { n: 'Ideate', d: 'Sketch many solutions, then pick a few.', e: 'Pre-order in an app, a second cashier, a grab-and-go shelf, a queue timer screen.', o: 'Output: sketches and a shortlist' },
  { n: 'Prototype', d: 'Build a quick, cheap version to try.', e: 'A clickable Figma prototype: pick a meal, pay, get a pickup number.', o: 'Output: a clickable prototype' },
  { n: 'Test', d: 'Watch real users try it and note where they struggle.', e: '3 of 5 students missed the pickup number. Back to Ideate to make it bigger.', o: 'Output: findings, the next iteration' }
];
function update() {
  var i = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--stage')) || 0, s = STAGES[i];
  document.getElementById('steps').innerHTML = STAGES.map(function (_, k) {
    return '<span class="' + (k < i ? 'done' : k === i ? 'on' : '') + '"></span>';
  }).join('');
  document.getElementById('k').textContent = 'STAGE ' + (i + 1) + ' OF 5';
  document.getElementById('h').textContent = s.n;
  document.getElementById('d').textContent = s.d;
  document.getElementById('e').textContent = s.e;
  document.getElementById('o').textContent = s.o;
}
window.onVar = update; update();`,
bad:{label:'Jumping straight to pixels: a beautiful app that solves the wrong problem.',html:`<pre style="margin:0;font:12px/1.8 'JetBrains Mono';color:#A9B4C2">idea → Figma → ship
<span style="color:#FF8A8A">// nobody asked a single user</span>
<span style="color:#FF8A8A">// "why is nobody using it?"</span></pre>`},
good:{label:'Understand first, build small, test, and loop back.',html:`<pre style="margin:0;font:12px/1.8 'JetBrains Mono';color:#A9B4C2">empathize → define → ideate
     ↑                    ↓
   test  ←  prototype  ←──┘
<span style="color:#7EF2C3">// every loop gets closer</span></pre>`},
figma:[`Create a FigJam board with five columns, one per stage, and keep every note and sketch there.`,`Pin your problem statement as a big sticky note at the top so every idea is checked against it.`,`Link the Figma prototype in the Test column and write the findings right next to it.`],
quiz:[
 {q:`What should you do before sketching solutions?`,options:[`Pick the colors`,`Understand the users and their problem`,`Write the code`],answer:1,why:`empathize and define first, otherwise you might solve the wrong problem.`},
 {q:`Testing shows users can't find the pickup number. What now?`,options:[`Ship it anyway`,`Go back, improve the design, and test again`,`Delete the app`],answer:1,why:`the process is a loop: test results send you back to earlier steps.`}
]},
{
id:'ux-personas', title:'Users, Research & Personas', metaphor:'Cooking for guests',
parable:`Before cooking for guests, a good host asks: is anyone vegetarian? Allergic to peanuts? Not a fan of spicy food? Cooking only what you like is how you end up with a full plate nobody touches. In design, research is asking those questions, and a persona is the guest list you keep in front of you while you cook.`,
theory:[`You are not your user. Your own taste is a guess until real people confirm it.`,`Research methods: interviews tell you why, surveys tell you how many, analytics show what people actually do.`,`A persona is a short profile of a typical user, built from research: goals, frustrations and context.`,`Use personas to make decisions: "Would Ratna, who is 68 and reads with glasses, find this button?"`],
controls:[
 {type:'select',label:'Persona',options:[{label:'Sari, student',vars:{'--p':'0'}},{label:'Andi, office worker',vars:{'--p':'1'}},{label:'Ratna, retiree',vars:{'--p':'2'}}]},
 {type:'select',label:'Design for',options:[{label:'The persona',vars:{'--fit':'persona'}},{label:'Yourself',vars:{'--fit':'self'}}]}
],
html:`<div class="wrap">
  <article class="persona">
    <div class="who"><div class="avatar" id="av"></div><div><h3 id="name"></h3><small id="ctx"></small></div></div>
    <b>Goals</b><ul id="goals"></ul>
    <b>Frustrations</b><ul id="pains" class="pains"></ul>
  </article>
  <div class="ui">
    <small>Order screen</small>
    <div class="item" id="item">Nasi goreng · Rp 18.000</div>
    <button id="cta">Order</button>
    <p class="verdict" id="verdict"></p>
  </div>
</div>`,
css:`.wrap{display:flex;gap:14px;flex-wrap:wrap;align-items:flex-start}
.persona{flex:1;min-width:200px;display:grid;gap:6px;padding:16px;border-radius:12px;background:var(--raised);border:1px solid var(--line);font-size:14px}
.who{display:flex;gap:10px;align-items:center}
.avatar{width:42px;height:42px;border-radius:50%;background:var(--accent,#7FD4FF)}
.persona h3{margin:0}
.persona small{color:var(--ink2);font:12px 'JetBrains Mono'}
ul{margin:0 0 6px;padding-left:18px;color:#7EF2C3}
ul.pains{color:#FF93B5}
.ui{min-width:180px;display:grid;gap:8px;padding:14px;border-radius:12px;background:#0D1016;border:1px solid var(--line)}
.ui small{font:11px 'JetBrains Mono';color:var(--ink2)}
.item{font-size:var(--fs,12px);transition:font-size .3s}
.ui button{padding:var(--bp,6px 10px);border-radius:8px;border:none;background:#7EF2C3;color:#0D1016;font:600 var(--fs,12px) 'IBM Plex Sans';cursor:pointer;transition:all .3s}
.verdict{margin:0;font:12px 'JetBrains Mono'}`,
js:`var P = [
  { n: 'Sari, 20', c: 'Student · phone, one hand, on the go', color: '#7FD4FF', g: ['Cheap meals', 'Order between classes'], f: ['Tight budget', 'Slow queues'], fix: { fs: '14px', bp: '10px 14px', item: 'Nasi goreng · Rp 18.000 · student deal -20%', cta: 'Order now, pick up in 5 min' } },
  { n: 'Andi, 34', c: 'Office worker · laptop and phone', color: '#B9A3FF', g: ['Lunch in under 5 minutes', 'Reorder favorites'], f: ['Too many steps', 'Meetings run late'], fix: { fs: '14px', bp: '10px 14px', item: 'Your usual: Nasi goreng · Rp 18.000', cta: 'Reorder in one tap' } },
  { n: 'Ratna, 68', c: 'Retiree · tablet at home, reading glasses', color: '#FFC877', g: ['Order for the grandchildren', 'Read the menu easily'], f: ['Small text', 'Confusing icons'], fix: { fs: '20px', bp: '14px 18px', item: 'Nasi goreng · Rp 18.000', cta: 'Order this meal' } }
];
function v(k) { return getComputedStyle(document.documentElement).getPropertyValue(k).trim(); }
function update() {
  var p = P[parseInt(v('--p')) || 0], fit = v('--fit') === 'persona', root = document.documentElement.style;
  document.getElementById('name').textContent = p.n;
  document.getElementById('ctx').textContent = p.c;
  document.getElementById('av').style.background = p.color;
  document.getElementById('goals').innerHTML = p.g.map(function (x) { return '<li>' + x + '</li>'; }).join('');
  document.getElementById('pains').innerHTML = p.f.map(function (x) { return '<li>' + x + '</li>'; }).join('');
  root.setProperty('--fs', fit ? p.fix.fs : '12px');
  root.setProperty('--bp', fit ? p.fix.bp : '6px 10px');
  document.getElementById('item').textContent = fit ? p.fix.item : 'Nasi goreng · Rp 18.000';
  document.getElementById('cta').textContent = fit ? p.fix.cta : 'Order';
  var verdict = document.getElementById('verdict');
  verdict.textContent = fit ? 'Fits ' + p.n.split(',')[0] + ': built from their goals' : 'Built for your own taste. Does it work for ' + p.n.split(',')[0] + '?';
  verdict.style.color = fit ? '#7EF2C3' : '#FF8A8A';
}
window.onVar = update; update();`,
bad:{label:'"I would like it this way" is one opinion, not research.',html:`<pre style="margin:0;font:12px/1.8 'JetBrains Mono';color:#A9B4C2">Target user: everyone
Research: "I asked my friend"
<span style="color:#FF8A8A">// a design for nobody in particular</span></pre>`},
good:{label:'A persona built from interviews, kept next to the design.',html:`<pre style="margin:0;font:12px/1.8 'JetBrains Mono';color:#A9B4C2">Ratna, 68 · tablet · reading glasses
Goal: order for grandchildren
Pain: small text, unclear icons
<span style="color:#7EF2C3">→ 20px text, words beside icons</span></pre>`},
figma:[`Make a persona card component in Figma: photo, name, quote, goals, frustrations, context.`,`Place the persona cards on the same page as your screens so they're visible while you design.`,`Add a FigJam board with interview quotes as sticky notes, then group them into themes (affinity mapping).`],
quiz:[
 {q:`Which method tells you WHY people behave a certain way?`,options:[`Analytics`,`Interviews`,`A/B tests`],answer:1,why:`interviews let people explain their reasons. Analytics show what happens, not why.`},
 {q:`Where should a persona come from?`,options:[`Your imagination`,`Real research about real users`,`A stock photo`],answer:1,why:`personas summarize what research found. Made-up personas just repeat your own assumptions.`}
]},
{
id:'ux-flows', title:'User Flows & Funnels', metaphor:'Desire paths in the park',
parable:`Parks often have a neat paved path curving around the lawn, and a muddy shortcut straight across the grass. People walk where it's easiest. That muddy line, a "desire path", shows the route people actually want. A user flow maps every step people take to reach a goal, so you can pave the shortcut instead of fighting it.`,
theory:[`A user flow is the sequence of screens and decisions someone goes through to finish one task.`,`Every extra step loses some people. Fewer, clearer steps mean more people reach the goal.`,`Map the happy path first, then the branches: errors, logged-out users, an empty cart.`,`Information architecture is how content is grouped and labeled, so people can guess where things live.`],
controls:[
 {type:'select',label:'Checkout flow',options:[{label:'Forced sign-up',vars:{'--flow':'long'}},{label:'Guest checkout',vars:{'--flow':'short'}}]},
 {type:'range',label:'People lost per step (%)',var:'--drop',min:5,max:30,step:1,unit:'',value:15}
],
html:`<div class="flow" id="flow"></div>
<p class="sum" id="sum"></p>`,
css:`.flow{display:flex;flex-wrap:wrap;gap:6px;align-items:flex-end}
.step{display:grid;gap:6px;justify-items:center;width:72px}
.bar{width:44px;border-radius:6px 6px 0 0;background:var(--sky);transition:height .35s cubic-bezier(.2,.8,.2,1)}
.step.detour .bar{background:var(--pink)}
.step.goal .bar{background:var(--amber)}
.step b{font:600 11px 'JetBrains Mono'}
.step small{font-size:11px;color:var(--ink2);text-align:center;line-height:1.2}
.sum{font:13px 'JetBrains Mono';color:var(--amber);margin-top:14px}`,
js:`var LONG = [['Cart'], ['Sign up', 1], ['Verify email', 1], ['Address'], ['Payment'], ['Review'], ['Done']];
var SHORT = [['Cart'], ['Address'], ['Payment'], ['Done']];
function v(k) { return getComputedStyle(document.documentElement).getPropertyValue(k).trim(); }
function update() {
  var steps = v('--flow') === 'short' ? SHORT : LONG, drop = (parseFloat(v('--drop')) || 15) / 100, left = 1000;
  document.getElementById('flow').innerHTML = steps.map(function (s, i) {
    left = Math.round(1000 * Math.pow(1 - drop, i));
    var cls = 'step' + (s[1] ? ' detour' : '') + (i === steps.length - 1 ? ' goal' : '');
    return '<div class="' + cls + '"><b>' + left + '</b><div class="bar" style="height:' + (left / 1000 * 140 + 6) + 'px"></div><small>' + s[0] + '</small></div>';
  }).join('');
  document.getElementById('sum').textContent = left + ' of 1000 shoppers finish in ' + (steps.length - 1) + ' steps';
}
window.onVar = update; update();`,
bad:{label:'Every extra screen is a door where people leave.',html:`<pre style="margin:0;font:12px/1.8 'JetBrains Mono';color:#A9B4C2">Cart → Sign up → Verify email
  → Address → Payment → Review → Done
<span style="color:#FF8A8A">// 6 steps: ~380 of 1000 left</span></pre>`},
good:{label:'Pave the desire path: let people check out as a guest.',html:`<pre style="margin:0;font:12px/1.8 'JetBrains Mono';color:#A9B4C2">Cart → Address → Payment → Done
<span style="color:#7EF2C3">// 3 steps: ~610 of 1000 finish</span>
<span style="color:#7EF2C3">// offer an account after the order</span></pre>`},
figma:[`Draw the flow in FigJam with shapes: rectangles for screens, diamonds for decisions, arrows for actions.`,`Name every frame after its step ("02 Address") so the flow and the screens match.`,`Use Figma's Prototype view to click through the flow yourself and count the taps.`],
quiz:[
 {q:`Each step loses 15% of people. What does removing two steps do?`,options:[`Nothing`,`More people reach the goal`,`Fewer people reach the goal`],answer:1,why:`fewer places to drop off means more people finish.`},
 {q:`What is a "happy path"?`,options:[`The route where everything goes right`,`A path with nice colors`,`The error screens`],answer:0,why:`map the ideal route first, then design for the branches where things go wrong.`}
]},
{
id:'ux-heuristics', title:'Usability Heuristics & Testing', metaphor:'The building inspector',
parable:`Before people move into a new building, an inspector walks through with a checklist: are the exits marked, do the stairs have railings, can you find the light switches? They don't need the architect's plans to spot problems. Usability heuristics are that checklist for interfaces, and a usability test is watching real tenants try to live there.`,
theory:[`Jakob Nielsen's 10 heuristics are rules of thumb, such as: show system status, speak the user's language, let people undo, prevent errors.`,`A heuristic review is quick and cheap: walk through the screens and note every rule that's broken.`,`A usability test means watching about 5 real users try real tasks. Stay quiet and take notes.`,`Rank problems by how often and how badly they hurt, then fix the worst first.`],
controls:[
 {type:'range',label:'Fixes applied',var:'--fixes',min:0,max:5,step:1,unit:'',value:0}
],
html:`<div class="wrap">
  <div class="app" id="app"></div>
  <ul class="check" id="check"></ul>
</div>`,
css:`.wrap{display:flex;gap:14px;flex-wrap:wrap;align-items:flex-start}
.app{width:220px;display:grid;gap:8px;padding:14px;border-radius:14px;background:var(--raised);border:1px solid var(--line);font-size:13px}
.photos{display:grid;grid-template-columns:repeat(3,1fr);gap:4px}
.photos i{height:40px;border-radius:6px;background:#3a4862}
.photos i.sel{outline:2px solid var(--sky)}
.row{display:flex;gap:6px}
.row button{flex:1;padding:7px;border-radius:7px;border:1px solid var(--line);background:#0D1016;color:var(--ink);font:12px 'IBM Plex Sans'}
.row button.danger{border-color:#FF8A8A;color:#FF8A8A}
.msg{font:11px 'JetBrains Mono';padding:6px 8px;border-radius:6px;background:#0D1016}
.check{list-style:none;margin:0;padding:0;display:grid;gap:6px;font-size:13px;flex:1;min-width:180px}
.check li{display:grid;grid-template-columns:20px 1fr;gap:6px}
.check li.ok{color:#7EF2C3}.check li.no{color:#FF8A8A}`,
js:`var RULES = [
  ['Show system status', 'Nothing tells you it is deleting', 'Shows "Deleting 3 photos..." with progress'],
  ['Speak the user\\'s language', 'Error says "ERR_0x45"', 'Says "No internet. Try again."'],
  ['Let people undo', 'Deleted forever, no way back', 'Undo for 10 seconds'],
  ['Prevent errors', 'Delete sits next to Share', 'Delete asks to confirm first'],
  ['Recognition over recall', 'Icon-only buttons', 'Buttons have words']
];
function update() {
  var f = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--fixes')) || 0;
  var on = function (i) { return i < f; };
  document.getElementById('app').innerHTML =
    '<b>My photos</b><div class="photos"><i class="sel"></i><i class="sel"></i><i class="sel"></i><i></i><i></i><i></i></div>' +
    '<div class="row"><button>' + (on(4) ? 'Share' : '⇪') + '</button><button class="danger">' + (on(4) ? 'Delete' : '✕') + '</button></div>' +
    (on(3) ? '<div class="msg" style="color:#FFC877">Delete 3 photos? [Cancel] [Delete]</div>' : '') +
    '<div class="msg" style="color:' + (on(1) ? '#E6EDF3' : '#FF8A8A') + '">' + (on(1) ? 'No internet. Try again.' : 'ERR_0x45') + '</div>' +
    (on(0) ? '<div class="msg" style="color:#7FD4FF">Deleting 3 photos... 2/3</div>' : '') +
    (on(2) ? '<div class="msg" style="color:#7EF2C3">Deleted. [Undo]</div>' : '');
  document.getElementById('check').innerHTML = RULES.map(function (r, i) {
    return '<li class="' + (on(i) ? 'ok' : 'no') + '"><span>' + (on(i) ? '✓' : '✕') + '</span><span><b>' + r[0] + '</b><br>' + (on(i) ? r[2] : r[1]) + '</span></li>';
  }).join('');
}
window.onVar = update; update();`,
bad:{label:'Shipping without anyone checking: problems users find the hard way.',html:`<pre style="margin:0;font:12px/1.8 'JetBrains Mono';color:#A9B4C2">[✕] [⇪]   ERR_0x45
<span style="color:#FF8A8A">// what does ✕ do? did it work?</span>
<span style="color:#FF8A8A">// can I get my photos back?</span></pre>`},
good:{label:'A quick checklist pass plus 5 real users finds most problems.',html:`<pre style="margin:0;font:12px/1.8 'JetBrains Mono';color:#A9B4C2">[Share] [Delete]
"Delete 3 photos?"  [Cancel] [Delete]
"Deleted."  [Undo]
<span style="color:#7EF2C3">// status, words, undo, confirm</span></pre>`},
figma:[`Duplicate your screens to a "Review" page and add a red sticky note for every broken heuristic.`,`Run a test with the Figma prototype link on a phone. Ask users to think aloud while you take notes.`,`Collect findings in FigJam, tag each with a severity (1 to 3), and fix the 3s first.`],
quiz:[
 {q:`A user deletes a file by mistake and can't get it back. Which heuristic is broken?`,options:[`User control and freedom (undo)`,`Aesthetic design`,`Help documentation`],answer:0,why:`people need an emergency exit: undo or cancel.`},
 {q:`How many users does a quick usability test usually need to find most big problems?`,options:[`1`,`About 5`,`500`],answer:1,why:`around 5 users already reveal most major issues. Test, fix, then test again.`}
]},
/* ───────────── VECTORIA · Figma ───────────── */
{
id:'figma-basics', title:'Frames, Layers & Shapes', metaphor:'Stacked glass sheets',
parable:`Old-school animators drew on clear plastic sheets: the background on one, the character on another, the speech bubble on top. Stack them and you see one picture; lift one and you change just that part. A Figma file works the same way. Every frame holds a stack of layers, and the order of the stack decides what's in front.`,
theory:[`A frame is a container, like a screen or an artboard. Start a design by drawing a frame (press F) in a phone or desktop size.`,`Everything inside is a layer: shapes, text, images and other frames. In the Layers panel, higher in the list means in front.`,`Group layers (Ctrl/Cmd+G) to move them together, and nest frames to build sections with their own layout.`,`Name your layers. "Frame 482" tells nobody anything; "Card / Product" tells everyone.`],
controls:[
 {type:'range',label:'Explode layers',var:'--ex',min:0,max:10,step:1,unit:'',value:4},
 {type:'select',label:'Selected layer',options:[{label:'Frame',vars:{'--sel':'bg'}},{label:'Card',vars:{'--sel':'card'}},{label:'Image',vars:{'--sel':'img'}},{label:'Title',vars:{'--sel':'title'}},{label:'Button',vars:{'--sel':'btn'}}],default:1}
],
html:`<div class="fig">
  <ul class="layers" id="layers"></ul>
  <div class="canvas"><div class="stack" id="stack">
    <div class="l bg" data-k="bg"><span class="tag">Frame</span>
      <div class="l card" data-k="card">
        <div class="l img" data-k="img"></div>
        <div class="l title" data-k="title">Sourdough Loaf</div>
        <div class="l btn" data-k="btn">Add to basket</div>
      </div>
    </div>
  </div></div>
</div>`,
css:`.fig{display:flex;gap:12px;flex-wrap:wrap}
.layers{list-style:none;margin:0;padding:8px;min-width:130px;border-radius:10px;background:#0D1016;border:1px solid var(--line);font:12px 'JetBrains Mono'}
.layers li{padding:5px 8px;border-radius:6px;color:var(--ink2)}
.layers li.on{background:#0D99FF;color:#fff}
.canvas{flex:1;min-width:220px;perspective:700px;padding:20px 10px}
.stack{transform-style:preserve-3d;transform:rotateX(calc(var(--ex) * 5deg)) rotateZ(calc(var(--ex) * -3deg));transition:transform .4s cubic-bezier(.2,.8,.2,1)}
.l{position:relative;transform-style:preserve-3d;transition:transform .4s cubic-bezier(.2,.8,.2,1),outline-color .2s;outline:2px solid transparent}
.bg{padding:16px;border-radius:10px;background:#1A2130}
.card{display:grid;gap:8px;padding:12px;border-radius:10px;background:#263042;transform:translateZ(calc(var(--ex) * 6px))}
.img{height:56px;border-radius:8px;background:#B9A3FF;transform:translateZ(calc(var(--ex) * 6px))}
.title{font:700 15px 'Space Grotesk';transform:translateZ(calc(var(--ex) * 9px))}
.btn{justify-self:start;padding:6px 12px;border-radius:7px;background:#7EF2C3;color:#0D1016;font:600 12px 'IBM Plex Sans';transform:translateZ(calc(var(--ex) * 12px))}
.l.on{outline-color:#0D99FF}
.tag{position:absolute;top:-18px;left:0;font:11px 'JetBrains Mono';color:#B9A3FF}`,
js:`var NAMES = { bg: 'Frame · Product', card: 'Card', img: 'Image', title: 'Title', btn: 'Button' };
var ORDER = ['bg', 'card', 'img', 'title', 'btn'];
function update() {
  var sel = getComputedStyle(document.documentElement).getPropertyValue('--sel').trim() || 'card';
  document.getElementById('layers').innerHTML = ORDER.map(function (k, i) {
    var indent = i === 0 ? 0 : i === 1 ? 1 : 2;
    return '<li class="' + (k === sel ? 'on' : '') + '" style="padding-left:' + (8 + indent * 12) + 'px">' + (i < 2 ? '▾ # ' : '') + NAMES[k] + '</li>';
  }).join('');
  document.querySelectorAll('.l').forEach(function (el) { el.classList.toggle('on', el.dataset.k === sel); });
}
window.onVar = update; update();`,
bad:{label:'Loose shapes on the canvas with default names. Impossible to find anything.',html:`<pre style="margin:0;font:12px/1.8 'JetBrains Mono';color:#A9B4C2">Rectangle 12
Rectangle 13
Text
Text
Group 7
<span style="color:#FF8A8A">// which one is the button?</span></pre>`},
good:{label:'Everything lives in a named frame, nested by meaning.',html:`<pre style="margin:0;font:12px/1.8 'JetBrains Mono';color:#A9B4C2"># Product page
  # Card / Product
      Image
      Title
      Button / Primary
<span style="color:#7EF2C3">// readable by anyone on the team</span></pre>`},
figma:[`Press F and pick a preset like iPhone 15 or Desktop on the right to create a frame.`,`Double-click a layer name in the Layers panel to rename it. Use slashes to group names: "Card / Product".`,`Press Ctrl/Cmd + ] or [ to move the selected layer up or down the stack.`],
quiz:[
 {q:`In the Layers panel, a layer higher in the list is…`,options:[`behind the others`,`in front of the others`,`hidden`],answer:1,why:`the list is the stack: top of the list is drawn on top.`},
 {q:`What is the best container for a screen design?`,options:[`A group`,`A frame`,`A rectangle`],answer:1,why:`frames can be sized to a device, clip content and have their own layout. Groups can't.`}
]},
{
id:'figma-prototype', title:'Prototyping & Smart Animate', metaphor:'A flipbook',
parable:`Flip through a flipbook and the drawings come alive, because each page is only slightly different from the last. Figma prototypes work the same way. You connect screens with arrows, and Smart Animate finds layers with the same name on both screens and slides them smoothly from one page to the next.`,
theory:[`In the Prototype tab, drag a connection from a layer to another frame. That's an interaction.`,`Each interaction has a trigger (On click, While hovering, After delay) and an action (Navigate to, Open overlay, Back).`,`The animation decides how the switch looks: Instant, Dissolve, Move in, or Smart Animate.`,`Smart Animate matches layers with the same name across frames and animates the difference in position, size, color and opacity.`],
controls:[
 {type:'select',label:'Trigger',options:[{label:'On click',vars:{'--trig':'click'}},{label:'After delay',vars:{'--trig':'delay'}}]},
 {type:'select',label:'Animation',options:[{label:'Instant',vars:{'--anim':'instant'}},{label:'Dissolve',vars:{'--anim':'dissolve'}},{label:'Smart Animate',vars:{'--anim':'smart'}}],default:2},
 {type:'range',label:'Duration',var:'--dur',min:100,max:800,step:50,unit:'ms',value:300}
],
html:`<div class="phone" id="phone">
  <div class="screen a" id="A">
    <small>Bakery</small>
    <div class="card" id="cardA"><div class="pic"></div><b>Sourdough</b></div>
    <div class="ghost"></div><div class="ghost"></div>
  </div>
  <div class="screen b" id="B">
    <small>← Back</small>
    <div class="card big" id="cardB"><div class="pic"></div><b>Sourdough</b></div>
    <p>Slow-fermented for 36 hours.</p>
  </div>
</div>
<p class="hint" id="hint"></p>`,
css:`.phone{position:relative;width:200px;height:300px;border-radius:24px;border:3px solid #3a4862;background:#0D1016;overflow:hidden}
.screen{position:absolute;inset:0;padding:16px;display:grid;align-content:start;gap:10px;transition:opacity var(--dur) ease}
.screen small{font:11px 'JetBrains Mono';color:var(--ink2)}
.b{opacity:0;pointer-events:none}
.card{display:grid;gap:6px;padding:8px;border-radius:10px;background:#1A2130;cursor:pointer;transform-origin:top left}
.pic{height:44px;border-radius:7px;background:#7EF2C3}
.card.big .pic{height:120px}
.ghost{height:60px;border-radius:10px;background:#141a24}
.screen p{margin:0;font-size:13px;color:var(--ink2)}
.hint{font:12px 'JetBrains Mono';color:var(--amber)}`,
js:`function v(k) { return getComputedStyle(document.documentElement).getPropertyValue(k).trim(); }
var A = document.getElementById('A'), B = document.getElementById('B'), timer = 0, onB = false;
function show(toB) {
  var anim = v('--anim'), dur = parseInt(v('--dur')) || 300;
  var from = document.getElementById(toB ? 'cardA' : 'cardB').getBoundingClientRect();
  A.style.transition = B.style.transition = anim === 'dissolve' ? 'opacity ' + dur + 'ms ease' : 'none';
  A.style.opacity = toB ? 0 : 1; B.style.opacity = toB ? 1 : 0;
  A.style.pointerEvents = toB ? 'none' : 'auto'; B.style.pointerEvents = toB ? 'auto' : 'none';
  if (anim === 'smart') {
    // match the layer named "card" on both screens and animate the difference (FLIP)
    var el = document.getElementById(toB ? 'cardB' : 'cardA'), to = el.getBoundingClientRect();
    el.animate([{ transform: 'translate(' + (from.left - to.left) + 'px,' + (from.top - to.top) + 'px) scale(' + from.width / to.width + ',' + from.height / to.height + ')' }, { transform: 'none' }],
      { duration: dur, easing: 'cubic-bezier(.2,.8,.2,1)' });
  }
  onB = toB;
}
function arm() {
  clearTimeout(timer); show(false);
  var delay = v('--trig') === 'delay';
  document.getElementById('hint').textContent = delay ? 'After delay: switches by itself in 1s' : 'On click: tap the card';
  if (delay) timer = setTimeout(function loop() { show(!onB); timer = setTimeout(loop, 1600); }, 1000);
}
document.getElementById('cardA').onclick = function () { if (v('--trig') === 'click') show(true); };
document.getElementById('cardB').onclick = B.querySelector('small').onclick = function () { if (v('--trig') === 'click') show(false); };
window.onVar = function (k) { if (k !== '--dur') arm(); };
arm();`,
bad:{label:'Frames with different layer names: Smart Animate can only cross-fade them.',html:`<pre style="margin:0;font:12px/1.8 'JetBrains Mono';color:#A9B4C2">Screen A: "Rectangle 4"
Screen B: "Hero image"
<span style="color:#FF8A8A">// no match → no smooth motion</span></pre>`},
good:{label:'Same name on both screens: Smart Animate moves it smoothly.',html:`<pre style="margin:0;font:12px/1.8 'JetBrains Mono';color:#A9B4C2">Screen A: "Card / Sourdough"
Screen B: "Card / Sourdough"
<span style="color:#7EF2C3">// matched → it glides and grows</span></pre>`},
figma:[`Switch to the Prototype tab (Shift+E), select a layer and drag the blue handle onto another frame.`,`In the interaction panel, set the trigger, set Animation to Smart Animate, and try Ease out at 300ms.`,`Press the Play button (top right) to test it, or open the prototype on your phone in the Figma app.`],
quiz:[
 {q:`Smart Animate decides which layers to animate by…`,options:[`their color`,`matching layer names across the two frames`,`random choice`],answer:1,why:`layers with the same name (and hierarchy) on both frames are animated from one state to the other.`},
 {q:`Which trigger runs without the user doing anything?`,options:[`On click`,`While hovering`,`After delay`],answer:2,why:`After delay fires on its own, which is useful for splash screens and loading states.`}
]},
{
id:'figma-handoff', title:'Dev Mode & Handoff', metaphor:"An architect's blueprint",
parable:`Builders don't guess the size of a window from a pretty painting of a house. They work from a blueprint with every measurement written on it. Dev Mode turns your Figma design into that blueprint: developers click any layer and read its size, spacing, colors and fonts, and even copy ready-made code.`,
theory:[`Dev Mode (Shift+D) is a view for developers. Click a layer to see its measurements, styles and CSS.`,`Hold Alt/Option and hover over another layer to measure the distance between them.`,`Use variables and styles with good names, so developers see "color/action" instead of a random hex.`,`Mark frames as "Ready for dev" and add annotations for behavior a picture can't show, like loading or errors.`],
controls:[
 {type:'select',label:'Inspect',options:[{label:'Spacing',vars:{'--insp':'space'}},{label:'Color',vars:{'--insp':'color'}},{label:'Type',vars:{'--insp':'type'}}]},
 {type:'select',label:'Annotations',options:[{label:'Off',vars:{'--ann':'0'}},{label:'On',vars:{'--ann':'1'}}]}
],
html:`<div class="wrap">
  <div class="design">
    <div class="card" id="card">
      <h3>Weekly digest</h3>
      <p>Get one calm email every Monday.</p>
      <button>Subscribe</button>
      <div class="note" id="note">Shows a spinner while saving</div>
    </div>
  </div>
  <aside class="dev">
    <small>Dev Mode</small>
    <pre id="spec"></pre>
  </aside>
</div>`,
css:`.wrap{display:flex;gap:12px;flex-wrap:wrap;align-items:flex-start}
.design{position:relative;padding:20px;border-radius:12px;background:#0D1016;border:1px solid var(--line)}
.card{position:relative;display:grid;gap:8px;width:220px;padding:16px;border-radius:12px;background:#1A2130}
.card h3{margin:0;font:700 20px/28px 'Space Grotesk'}
.card p{margin:0;font:400 14px/20px 'IBM Plex Sans';color:var(--ink2)}
.card button{justify-self:start;margin-top:8px;padding:8px 14px;border-radius:8px;border:none;background:#7EF2C3;color:#0D1016;font:600 14px 'IBM Plex Sans'}
.space .card{outline:1px dashed #FF8A8A;box-shadow:inset 0 0 0 16px rgba(255,138,138,.12)}
.color .card h3,.color .card button{outline:2px solid #0D99FF}
.type .card h3,.type .card p{outline:1px dashed #7FD4FF}
.note{display:none;position:absolute;right:-14px;bottom:-18px;padding:6px 8px;border-radius:6px;background:#FFC877;color:#0D1016;font:600 11px 'IBM Plex Sans';transform:rotate(-3deg)}
.ann .note{display:block}
.dev{flex:1;min-width:180px;padding:12px;border-radius:12px;background:#0D1016;border:1px solid var(--line)}
.dev small{font:11px 'JetBrains Mono';color:#0D99FF}
.dev pre{margin:8px 0 0;font:12px/1.6 'JetBrains Mono';color:var(--ink2);white-space:pre-wrap}`,
js:`var SPECS = {
  space: '.card {\\n  padding: 16px;     /* space/16 */\\n  gap: 8px;          /* space/8 */\\n  border-radius: 12px;\\n}\\nbutton { margin-top: 8px; }',
  color: '.card   { background: var(--color-surface); } /* #1A2130 */\\nh3      { color: var(--color-ink); }        /* #E6EDF3 */\\nbutton  { background: var(--color-action); } /* #7EF2C3 */',
  type: 'h3 {\\n  font: 700 20px/28px "Space Grotesk";\\n}\\np {\\n  font: 400 14px/20px "IBM Plex Sans";\\n}'
};
function v(k) { return getComputedStyle(document.documentElement).getPropertyValue(k).trim(); }
function update() {
  var insp = v('--insp') || 'space';
  document.body.className = insp + (v('--ann') === '1' ? ' ann' : '');
  document.getElementById('spec').textContent = SPECS[insp];
}
window.onVar = update; update();`,
bad:{label:'Sending a screenshot. The developer has to guess every number.',html:`<pre style="margin:0;font:12px/1.8 'JetBrains Mono';color:#A9B4C2">final_FINAL_v3.png
"make it look like this"
<span style="color:#FF8A8A">// padding 15? 16? 18? which green?</span></pre>`},
good:{label:'A Dev Mode link with named variables and annotations.',html:`<pre style="margin:0;font:12px/1.8 'JetBrains Mono';color:#A9B4C2">padding: space/16
background: color/action
note: "spinner while saving"
<span style="color:#7EF2C3">// no guessing, no back-and-forth</span></pre>`},
figma:[`Toggle Dev Mode with Shift+D, select a layer and read the Inspect panel on the right.`,`Right-click a frame and choose "Mark as ready for dev" so developers know it's final.`,`Add annotations with the Annotate tool in Dev Mode for states like loading, empty and error.`],
quiz:[
 {q:`A developer needs the exact gap between two layers. What should they do in Dev Mode?`,options:[`Guess from the picture`,`Select one layer and hold Alt/Option while hovering the other`,`Take a screenshot`],answer:1,why:`Alt/Option shows the measured distance between the selection and the hovered layer.`},
 {q:`Why name colors as variables like color/action?`,options:[`It looks fancy`,`Developers can use the same token in code, and changes stay in sync`,`Figma requires it`],answer:1,why:`shared names mean design and code talk about the same thing.`}
]}
];
window.UX_LESSONS.push.apply(window.UX_LESSONS, NEW);
})();
