/* Frontera, the frontend province: React City and Vue City.
   Same lesson shape as lessons.js, plus:
   - runtime: 'react' | 'vue'  → the playground loads that library (React code is JSX, compiled by Babel)
   - scene: 'flow' + flow: [...] → the 3D view shows the component tree; the playground talks to it with
     ux.render(id), ux.flow(from, to, kind) and ux.tree(nodes)
   - useControl(name, fallback) (React) / controlRef(name, fallback) (Vue) read the controls on the left.
   Text in `figma` is the "try it in a real project" list for these lessons. */
(function () {
var FLOW_LEGEND_REACT = [{c:'#61DAFB',t:'Component'},{c:'#FFC877',t:'State'},{c:'#7FD4FF',t:'Props flowing down'},{c:'#FF93B5',t:'Events going up'}];
var FLOW_LEGEND_VUE = [{c:'#42B883',t:'Component / template'},{c:'#FFC877',t:'Reactive data'},{c:'#7FD4FF',t:'Data flowing down'},{c:'#FF93B5',t:'Events going up'}];

var FRONTEND = [
/* ───────────── REACT CITY ───────────── */
{
id:'react-components', level:'react', runtime:'react', scene:'flow', title:'Components & JSX', metaphor:'LEGO bricks',
legend:FLOW_LEGEND_REACT,
flow:[{id:'App',label:'App'},{id:'Window',label:'ProductCard',sub:'Window',parent:'App'},{id:'Door',label:'ProductCard',sub:'Door',parent:'App'},{id:'Roof',label:'ProductCard',sub:'Roof',parent:'App'}],
parable:`Nobody builds a LEGO castle out of one giant piece. You snap small bricks together: a window brick, a door brick, a tower brick. Make a brick once and you can use it a hundred times. React apps are built the same way. Small pieces called components snap together into a whole page.`,
theory:[`A component is a JavaScript function that returns UI. Its name starts with a capital letter: function ProductCard() { … }.`,`JSX lets you write HTML-like tags inside JavaScript. {Curly braces} drop a JavaScript value into the markup.`,`Use a component like a tag: <ProductCard />. Write it once, use it as many times as you like.`,`Components nest inside each other and form a tree, with App at the top. That tree is what the 3D view shows.`],
controls:[
 {type:'range',label:'How many cards',var:'--count',min:1,max:6,step:1,unit:'',value:3},
 {type:'select',label:'Brick color',options:[{label:'React blue',vars:{'--brick':'#61DAFB'}},{label:'Mint',vars:{'--brick':'#7EF2C3'}},{label:'Amber',vars:{'--brick':'#FFC877'}}]},
 {type:'select',label:'Card style',options:[{label:'Outline',vars:{'--card-bg':'transparent'}},{label:'Filled',vars:{'--card-bg':'#1A2130'}}]}
],
html:`<div id="root"></div>`,
css:`main{display:grid;gap:14px}
h2{margin:0;font-size:20px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:10px}
.card{padding:14px;border-radius:12px;border:1px solid var(--line);background:var(--card-bg);display:grid;gap:6px;animation:pop .35s cubic-bezier(.2,.8,.2,1)}
.thumb{height:46px;border-radius:8px;background:var(--brick);background-image:radial-gradient(circle at 25% 50%,rgba(0,0,0,.25) 0 7px,transparent 8px),radial-gradient(circle at 75% 50%,rgba(0,0,0,.25) 0 7px,transparent 8px)}
.card h3{margin:0;font-size:15px}
.card p{margin:0;font:12px 'JetBrains Mono';color:var(--ink2)}
@keyframes pop{from{transform:scale(.9);opacity:0}}`,
js:`const { useEffect } = React;

// A component is a function that returns UI (JSX).
function ProductCard({ name, price }) {
  useEffect(() => ux.render(name)); // flash this brick in the 3D view
  return (
    <div className="card">
      <div className="thumb"></div>
      <h3>{name}</h3>
      <p>{price} coins</p>
    </div>
  );
}

const BRICKS = [
  { id: 'window', name: 'Window', price: 2 },
  { id: 'door', name: 'Door', price: 3 },
  { id: 'roof', name: 'Roof', price: 4 },
  { id: 'tower', name: 'Tower', price: 6 },
  { id: 'gate', name: 'Gate', price: 5 },
  { id: 'flag', name: 'Flag', price: 1 }
];

function App() {
  // useControl reads the controls on the left (a playground helper, not part of React)
  const count = Number(useControl('--count', 3));
  const items = BRICKS.slice(0, count);

  useEffect(() => {
    ux.tree([{ id: 'App', label: 'App' }].concat(
      items.map(b => ({ id: b.name, label: 'ProductCard', sub: b.name, parent: 'App' }))
    ));
  }, [count]);

  return (
    <main>
      <h2>Brick shop</h2>
      <div className="grid">
        {items.map(b => <ProductCard key={b.id} name={b.name} price={b.price} />)}
      </div>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);`,
bad:{label:'One giant App with copy-pasted markup. Fix a typo and you have to fix it everywhere.',html:`<pre style="margin:0;font:12px/1.6 'JetBrains Mono';color:#A9B4C2">function App() {
  return (&lt;div&gt;
    &lt;div className="card"&gt;&lt;h3&gt;Window&lt;/h3&gt;…&lt;/div&gt;
    &lt;div className="card"&gt;&lt;h3&gt;Door&lt;/h3&gt;…&lt;/div&gt;
    &lt;div className="crad"&gt;&lt;h3&gt;Roof&lt;/h3&gt;…&lt;/div&gt;
  &lt;/div&gt;);
} <span style="color:#FF8A8A">// spot the typo?</span></pre>`},
good:{label:'One small component, reused with different data.',html:`<pre style="margin:0;font:12px/1.6 'JetBrains Mono';color:#A9B4C2">function Card({ name }) {
  return &lt;div className="card"&gt;{name}&lt;/div&gt;;
}

&lt;Card name="Window" /&gt;
&lt;Card name="Door" /&gt;
&lt;Card name="Roof" /&gt; <span style="color:#7EF2C3">// one brick, many uses</span></pre>`},
figma:[`Start a project: npm create vite@latest my-app -- --template react, then npm install and npm run dev.`,`Move ProductCard into its own file, src/ProductCard.jsx, export it, and import it in App.jsx.`,`Install React Developer Tools in your browser. Its Components tab shows the same tree as the 3D view.`],
quiz:[
 {q:`Which name works for a React component?`,options:[`productCard`,`ProductCard`,`product-card`],answer:1,why:`components must start with a capital letter. Lowercase tags are treated as plain HTML elements.`},
 {q:`What do {curly braces} do inside JSX?`,options:[`Insert a JavaScript value into the markup`,`Create a CSS class`,`Comment out code`],answer:0,why:`braces switch from markup back to JavaScript, so {name} prints the value of name.`}
]},
{
id:'react-props', level:'react', runtime:'react', scene:'flow', title:'Props', metaphor:'Ordering coffee',
legend:FLOW_LEGEND_REACT,
flow:[{id:'App',label:'App'},{id:'You',label:'Coffee',sub:'You',parent:'App'},{id:'Friend',label:'Coffee',sub:'Friend',parent:'App'}],
parable:`At a coffee shop, every barista follows the same latte recipe. What changes is your order slip: large, less sugar, oat milk. The recipe is the component and the slip is its props. Same recipe, different cups. And the barista never rewrites the slip you handed over.`,
theory:[`Props are a component's inputs. You pass them like HTML attributes: <Coffee size="L" sugar={1} />.`,`The component receives them as one object: function Coffee({ size, sugar }) { … }.`,`Props flow one way, from parent down to child. The child reads them but never changes them.`,`Anything can be a prop: strings, numbers, arrays, functions, even other elements (children).`],
controls:[
 {type:'select',label:'Size',options:[{label:'S',vars:{'--size':'S'}},{label:'M',vars:{'--size':'M'}},{label:'L',vars:{'--size':'L'}}],default:1},
 {type:'range',label:'Sugar',var:'--sugar',min:0,max:3,step:1,unit:'',value:1},
 {type:'select',label:'Milk',options:[{label:'Regular',vars:{'--milk':'regular'}},{label:'Oat',vars:{'--milk':'oat'}},{label:'None',vars:{'--milk':'none'}}]}
],
html:`<div id="root"></div>`,
css:`main{display:grid;gap:18px}
.slip{font:12px/1.6 'JetBrains Mono';color:var(--sky);background:#0D1016;border:1px solid var(--line);padding:10px 12px;border-radius:8px}
.row{display:flex;gap:32px;align-items:flex-end;flex-wrap:wrap}
.cup{margin:0;display:grid;gap:10px;justify-items:center}
.glass{width:84px;border:3px solid #E6EDF3;border-top:none;border-radius:0 0 18px 18px;background:#6b4226;position:relative;overflow:hidden;transition:height .35s cubic-bezier(.2,.8,.2,1)}
.milk{position:absolute;left:0;right:0;top:0;height:38%;transition:all .35s}
.milk.regular{background:#f3e3cf}.milk.oat{background:#e6cf8f}.milk.none{height:0}
figcaption{display:grid;justify-items:center;gap:2px;font-size:13px}
figcaption span{font:11px 'JetBrains Mono';color:var(--ink2)}`,
js:`const { useEffect } = React;

// The recipe is the same for every cup. Props are the order slip.
function Coffee({ owner, size, sugar, milk }) {
  useEffect(() => ux.render(owner));
  const height = { S: 70, M: 95, L: 120 }[size];
  return (
    <figure className="cup">
      <div className="glass" style={{ height: height }}>
        <div className={'milk ' + milk}></div>
      </div>
      <figcaption>
        <b>{owner}</b>
        <span>{size} · sugar {sugar} · {milk}</span>
      </figcaption>
    </figure>
  );
}

function App() {
  const size = useControl('--size', 'M');
  const sugar = Number(useControl('--sugar', 1));
  const milk = useControl('--milk', 'regular');

  // every time the slip changes, a new prop flows from App down to your cup
  useEffect(() => ux.flow('App', 'You', 'prop'), [size, sugar, milk]);

  return (
    <main>
      <code className="slip">{'<Coffee size="' + size + '" sugar={' + sugar + '} milk="' + milk + '" />'}</code>
      <div className="row">
        <Coffee owner="You" size={size} sugar={sugar} milk={milk} />
        <Coffee owner="Friend" size="S" sugar={0} milk="oat" />
      </div>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);`,
bad:{label:'The child changes its own props. React ignores it, and the parent never finds out.',html:`<pre style="margin:0;font:12px/1.6 'JetBrains Mono';color:#A9B4C2">function Coffee(props) {
  props.size = 'L';   <span style="color:#FF8A8A">// rewriting the slip</span>
  return &lt;Cup size={props.size} /&gt;;
}</pre>`},
good:{label:'The parent owns the value and passes a new prop when it changes.',html:`<pre style="margin:0;font:12px/1.6 'JetBrains Mono';color:#A9B4C2">function App() {
  const [size, setSize] = useState('M');
  return &lt;Coffee size={size} onUpsize={() =&gt; setSize('L')} /&gt;;
} <span style="color:#7EF2C3">// data down, requests up</span></pre>`},
figma:[`In VS Code, hover over a component to see which props it expects.`,`Give props default values right in the signature: function Coffee({ size = 'M' }).`,`Use the children prop to wrap content: <Card><h2>Hi</h2></Card>, then render {children} inside Card.`],
quiz:[
 {q:`A child component wants a different value for a prop it received. What should happen?`,options:[`Change it directly: props.size = 'L'`,`Ask the parent, which owns the value, to pass a new prop`,`Reload the page`],answer:1,why:`props are read-only. The parent owns the data and sends a new value down.`},
 {q:`How do you pass the number 2 as a prop?`,options:[`sugar="2"`,`sugar={2}`,`sugar=2`],answer:1,why:`curly braces pass a real number. Quotes pass the text "2".`}
]},
{
id:'react-state', level:'react', runtime:'react', scene:'flow', title:'State with useState', metaphor:'The stadium scoreboard',
legend:FLOW_LEGEND_REACT,
flow:[{id:'App',label:'App'},{id:'score',label:'score',sub:'useState',parent:'App',kind:'state'},{id:'Scoreboard',label:'Scoreboard',parent:'App'},{id:'btnHome',label:'button',sub:'Home goal',parent:'App',kind:'dom'},{id:'btnAway',label:'button',sub:'Away goal',parent:'App',kind:'dom'}],
parable:`When a goal is scored, nobody climbs up to repaint the stadium scoreboard. The operator changes one number and the board redraws itself. State in React is that number. You change it with a setter, and React redraws every part of the screen that uses it.`,
theory:[`useState gives you a value and a setter: const [score, setScore] = useState(0).`,`Calling the setter re-renders the component with the new value. Changing a normal variable doesn't update the screen.`,`State belongs to the component that declares it. Pass it down as props if children need it.`,`Don't modify state in place. Give the setter a new value: setScore(score + 1), or setScore(s => s + 1).`],
controls:[
 {type:'range',label:'Points per goal',var:'--step',min:1,max:3,step:1,unit:'',value:1},
 {type:'select',label:'Keep the score in',options:[{label:'useState',vars:{'--mode':'state'}},{label:'a plain variable',vars:{'--mode':'plain'}}]}
],
html:`<div id="root"></div>`,
css:`main{display:grid;gap:16px;max-width:360px}
.board{display:flex;align-items:center;justify-content:center;gap:18px;padding:18px;border-radius:14px;background:#0D1016;border:2px solid #61DAFB;box-shadow:0 0 24px rgba(97,218,251,.18)}
.board div{display:grid;justify-items:center}
.board small{font:11px 'JetBrains Mono';color:var(--ink2)}
.board b{font:700 44px 'JetBrains Mono';color:#FFC877}
.board span{font:700 30px 'JetBrains Mono';color:var(--ink2)}
.btns{display:flex;gap:8px}
button{flex:1;padding:10px;border-radius:8px;border:1px solid var(--line);background:var(--raised);color:var(--ink);font:600 13px 'IBM Plex Sans';cursor:pointer}
#note{margin:0;font:12px 'JetBrains Mono';color:var(--ink2);min-height:1.5em}`,
js:`const { useState, useEffect } = React;

let plainGoals = 0; // a normal variable: React does not watch it

function Scoreboard({ home, away }) {
  useEffect(() => ux.render('Scoreboard'));
  return (
    <div className="board">
      <div><small>HOME</small><b>{home}</b></div>
      <span>:</span>
      <div><small>AWAY</small><b>{away}</b></div>
    </div>
  );
}

function App() {
  const [home, setHome] = useState(0);
  const [away, setAway] = useState(0);
  const step = Number(useControl('--step', 1));
  const mode = useControl('--mode', 'state');

  function goal(team) {
    ux.flow(team === 'home' ? 'btnHome' : 'btnAway', 'score', 'emit');
    if (mode === 'plain') {
      plainGoals += step; // the variable changes... but nothing re-renders
      document.getElementById('note').textContent = 'plainGoals = ' + plainGoals + ', but the board did not redraw';
      return;
    }
    ux.flow('score', 'Scoreboard', 'state');
    if (team === 'home') setHome(h => h + step);
    else setAway(a => a + step);
  }

  return (
    <main>
      <Scoreboard home={mode === 'plain' ? plainGoals : home} away={away} />
      <div className="btns">
        <button onClick={() => goal('home')}>Home goal +{step}</button>
        <button onClick={() => goal('away')}>Away goal +{step}</button>
      </div>
      <p id="note"></p>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);`,
bad:{label:'A plain variable or a mutated array. The data changes, the screen does not.',html:`<pre style="margin:0;font:12px/1.6 'JetBrains Mono';color:#A9B4C2">let score = 0;
score++;            <span style="color:#FF8A8A">// screen stays at 0</span>

goals.push(newGoal);
setGoals(goals);    <span style="color:#FF8A8A">// same array, no re-render</span></pre>`},
good:{label:'useState plus a new value each time. React re-renders what uses it.',html:`<pre style="margin:0;font:12px/1.6 'JetBrains Mono';color:#A9B4C2">const [score, setScore] = useState(0);
setScore(s =&gt; s + 1);

setGoals([...goals, newGoal]); <span style="color:#7EF2C3">// new array</span></pre>`},
figma:[`In React Developer Tools, select a component to see its state live and even edit it.`,`Keep state as low in the tree as possible: only in the component that needs it.`,`When two siblings need the same state, move it up to their parent and pass it down as props ("lifting state up").`],
quiz:[
 {q:`You do score = score + 1 on a normal variable. What happens on screen?`,options:[`It updates`,`Nothing: React only re-renders when state changes through a setter`,`The page reloads`],answer:1,why:`React doesn't watch plain variables. The setter is what triggers a re-render.`},
 {q:`What's the safest way to add 1 based on the previous score?`,options:[`setScore(s => s + 1)`,`score++`,`setScore(score++)`],answer:0,why:`the updater function always gets the latest value, even with several updates in a row.`}
]},
{
id:'react-effects', level:'react', runtime:'react', scene:'flow', title:'Side effects with useEffect', metaphor:'Motion-sensor lights',
legend:[{c:'#61DAFB',t:'Component'},{c:'#B9A3FF',t:'Effect'},{c:'#7FD4FF',t:'Effect runs'},{c:'#FF93B5',t:'Cleanup'}],
flow:[{id:'App',label:'App'},{id:'Sensor',label:'Sensor',parent:'App'},{id:'light',label:'useEffect',sub:'light',parent:'Sensor',kind:'effect'}],
parable:`A motion-sensor light runs by itself. Someone walks in and the light turns on. They leave and it switches off. Nobody flips it by hand. useEffect is that sensor: you tell React what to watch, what to do when it changes, and how to clean up afterwards.`,
theory:[`Rendering should only describe the UI. Work that touches the outside world (timers, fetching data, the page title) goes in useEffect.`,`The dependency array decides when it runs: [] once after the first render, [room] whenever room changes, no array after every render.`,`Return a cleanup function to undo the effect: stop a timer, close a connection.`,`If an effect uses a value, list it in the dependencies. Otherwise it keeps reading an old value.`],
controls:[
 {type:'select',label:'Dependencies',options:[{label:'[room]',vars:{'--deps':'room'}},{label:'[]',vars:{'--deps':'once'}},{label:'none',vars:{'--deps':'every'}}]},
 {type:'select',label:'Room',options:[{label:'Kitchen',vars:{'--room':'Kitchen'}},{label:'Garden',vars:{'--room':'Garden'}},{label:'Garage',vars:{'--room':'Garage'}}]}
],
html:`<div id="root"></div>`,
css:`main{display:grid;gap:14px;max-width:380px}
.slip{font:12px 'JetBrains Mono';color:var(--sky);background:#0D1016;border:1px solid var(--line);padding:10px 12px;border-radius:8px}
.room{display:grid;gap:10px;justify-items:start;padding:16px;border-radius:12px;background:var(--raised);border:1px solid var(--line)}
.room p{margin:0}
.lamp{width:34px;height:34px;border-radius:50%;background:#2a3144;transition:background .2s,box-shadow .2s}
.lamp.on{background:#FFC877;box-shadow:0 0 22px #FFC877}
.lamp.flash{animation:flash .5s}
@keyframes flash{50%{transform:scale(1.25)}}
button{padding:9px 14px;border-radius:8px;border:1px solid var(--line);background:#131821;color:var(--ink);font:500 13px 'IBM Plex Sans';cursor:pointer}
#log{margin:0;font:12px/1.6 'JetBrains Mono';color:var(--ink2);max-height:130px;overflow:auto;background:#0D1016;padding:10px;border-radius:8px}`,
js:`const { useState, useEffect } = React;

function log(msg) {
  const el = document.getElementById('log');
  el.textContent = '› ' + msg + '\\n' + el.textContent;
}

function Sensor({ room, deps }) {
  const [waves, setWaves] = useState(0);

  // the effect turns the light on and returns a cleanup that turns it off
  function lightOn() {
    const lamp = document.querySelector('.lamp');
    lamp.classList.add('on');
    lamp.classList.remove('flash'); void lamp.offsetWidth; lamp.classList.add('flash');
    log('effect: light ON in ' + room);
    ux.flow('Sensor', 'light', 'prop');
    return () => {
      lamp.classList.remove('on');
      log('cleanup: light OFF in ' + room);
      ux.flow('light', 'Sensor', 'emit');
    };
  }

  // the dependency list comes from the control on the left
  const list = deps === 'room' ? [room] : deps === 'once' ? [] : undefined;
  useEffect(lightOn, list);
  useEffect(() => ux.render('Sensor'));

  return (
    <div className="room">
      <div className="lamp"></div>
      <p>{room} · waved {waves} times</p>
      <button onClick={() => setWaves(w => w + 1)}>Wave hand (re-render)</button>
    </div>
  );
}

function App() {
  const deps = useControl('--deps', 'room');
  const room = useControl('--room', 'Kitchen');
  const shown = deps === 'room' ? ', [room]' : deps === 'once' ? ', []' : '';
  return (
    <main>
      <code className="slip">{'useEffect(lightOn' + shown + ')'}</code>
      {/* key={deps}: changing the mode mounts a fresh Sensor */}
      <Sensor key={deps} room={room} deps={deps} />
      <pre id="log"></pre>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);`,
bad:{label:'An interval with no cleanup. Each re-render starts another timer that never stops.',html:`<pre style="margin:0;font:12px/1.6 'JetBrains Mono';color:#A9B4C2">useEffect(() =&gt; {
  setInterval(tick, 1000);
});  <span style="color:#FF8A8A">// no deps, no cleanup: timers pile up</span></pre>`},
good:{label:'Run once, and clean up when the component leaves.',html:`<pre style="margin:0;font:12px/1.6 'JetBrains Mono';color:#A9B4C2">useEffect(() =&gt; {
  const id = setInterval(tick, 1000);
  return () =&gt; clearInterval(id);
}, []);  <span style="color:#7EF2C3">// on, then off</span></pre>`},
figma:[`Fetch data in an effect: useEffect(() => { fetch(url).then(r => r.json()).then(setData) }, [url]).`,`Turn on the eslint-plugin-react-hooks rule. It warns when a dependency is missing.`,`In development, React runs effects twice on purpose (Strict Mode). If that breaks something, your cleanup is missing.`],
quiz:[
 {q:`useEffect(fn, []) runs…`,options:[`after every render`,`once, after the first render`,`never`],answer:1,why:`an empty dependency list means nothing can change it, so it only runs after mounting.`},
 {q:`Your effect starts a timer. Where do you stop it?`,options:[`In a cleanup function returned from the effect`,`In the JSX`,`You can't`],answer:0,why:`React calls the cleanup before the effect re-runs and when the component unmounts.`}
]},
{
id:'react-lists', level:'react', runtime:'react', scene:'flow', title:'Lists & keys', metaphor:'Name tags in class',
legend:[{c:'#61DAFB',t:'Component (one per key)'},{c:'#FFC877',t:'State'},{c:'#7FD4FF',t:'Moves with its key'},{c:'#FF93B5',t:'Re-rendered in place'}],
flow:[{id:'List',label:'StudentList'},{id:'s1',label:'Row',sub:'key=s1 · Ayu',parent:'List'},{id:'s2',label:'Row',sub:'key=s2 · Budi',parent:'List'},{id:'s3',label:'Row',sub:'key=s3 · Citra',parent:'List'},{id:'s4',label:'Row',sub:'key=s4 · Dimas',parent:'List'}],
parable:`A teacher knows students by their name tags, not by which chair they sit in. If students swap chairs and the teacher only remembers "the kid in chair 2", homework goes back to the wrong person. React keys are name tags. With a stable key, React knows which item moved, and each item keeps its own state.`,
theory:[`Render a list with map: students.map(s => <Row key={s.id} … />).`,`A key must be unique among its siblings and must not change over time. An id from your data is perfect.`,`Using the array index as the key breaks when items are shuffled, inserted or removed: state sticks to the position, not the item.`,`Keys are only for React. They are not passed to your component as a prop.`],
controls:[
 {type:'select',label:'Key',options:[{label:'key={student.id}',vars:{'--key':'id'}},{label:'key={index}',vars:{'--key':'index'}}]}
],
html:`<div id="root"></div>`,
css:`main{display:grid;gap:12px;max-width:400px}
.btns{display:flex;gap:8px;flex-wrap:wrap}
button{padding:8px 12px;border-radius:8px;border:1px solid var(--line);background:var(--raised);color:var(--ink);font:500 13px 'IBM Plex Sans';cursor:pointer}
ul{list-style:none;margin:0;padding:0;display:grid;gap:6px}
li{display:grid;grid-template-columns:64px 1fr auto;gap:8px;align-items:center;padding:8px 10px;border-radius:10px;background:var(--raised);border:1px solid var(--line)}
li.bad{border-color:#FF8A8A}
li input{min-width:0;padding:6px 8px;border-radius:6px;border:1px solid #33405a;background:#0D1016;color:var(--ink);font:13px 'IBM Plex Sans'}
li span{font:12px 'JetBrains Mono'}
li.ok span{color:#7EF2C3}li.bad span{color:#FF8A8A}`,
js:`const { useState, useEffect } = React;

// Each row remembers its own note (local state, created once per row)
function Row({ name, tag }) {
  const [note, setNote] = useState(name + "'s homework");
  useEffect(() => ux.render(tag));
  const ok = note.startsWith(name);
  return (
    <li className={ok ? 'ok' : 'bad'}>
      <b>{name}</b>
      <input value={note} onChange={e => setNote(e.target.value)} />
      <span>{ok ? 'ok' : 'wrong owner'}</span>
    </li>
  );
}

const START = [
  { id: 's1', name: 'Ayu' }, { id: 's2', name: 'Budi' },
  { id: 's3', name: 'Citra' }, { id: 's4', name: 'Dimas' }
];
const NEWCOMERS = ['Eka', 'Fajar', 'Gita', 'Hana'];

function App() {
  const [students, setStudents] = useState(START);
  const keyMode = useControl('--key', 'id');
  const keyOf = (s, i) => (keyMode === 'id' ? s.id : 'i' + i);

  useEffect(() => {
    ux.tree([{ id: 'List', label: 'StudentList' }].concat(students.map((s, i) => (
      { id: keyOf(s, i), label: 'Row', sub: 'key=' + keyOf(s, i) + ' · ' + s.name, parent: 'List' }
    ))));
  });

  const shuffle = () => setStudents(list => list.slice().sort(() => Math.random() - 0.5));
  const addTop = () => setStudents(list => {
    const name = NEWCOMERS[list.length % NEWCOMERS.length];
    return [{ id: 'n' + Date.now(), name: name }].concat(list);
  });

  return (
    <main>
      <div className="btns">
        <button onClick={shuffle}>Shuffle seats</button>
        <button onClick={addTop}>New student on top</button>
        <button onClick={() => setStudents(START)}>Reset</button>
      </div>
      <ul>
        {students.map((s, i) => <Row key={keyOf(s, i)} tag={keyOf(s, i)} name={s.name} />)}
      </ul>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);`,
bad:{label:'Index as key: after a shuffle, state stays with the seat instead of the student.',html:`<pre style="margin:0;font:12px/1.6 'JetBrains Mono';color:#A9B4C2">students.map((s, i) =&gt;
  &lt;Row key={i} name={s.name} /&gt;  <span style="color:#FF8A8A">// chair number</span>
)</pre>`},
good:{label:'A stable id from the data: the name tag travels with the student.',html:`<pre style="margin:0;font:12px/1.6 'JetBrains Mono';color:#A9B4C2">students.map(s =&gt;
  &lt;Row key={s.id} name={s.name} /&gt;  <span style="color:#7EF2C3">// name tag</span>
)</pre>`},
figma:[`Open the browser console: React warns "Each child in a list should have a unique key prop" when a key is missing.`,`If your data has no id, add one when you create the item (crypto.randomUUID()), not while rendering.`,`Try it: shuffle with key={index}, then switch to key={student.id} and shuffle again.`],
quiz:[
 {q:`Which key is best for a list of products from an API?`,options:[`The array index`,`product.id`,`Math.random()`],answer:1,why:`an id is unique and stays the same across renders. Random keys change every render, so React rebuilds every row.`},
 {q:`You shuffle a list that uses index keys, and the typed text stays in the wrong rows. Why?`,options:[`React matched rows by position, so state stayed with the position`,`CSS bug`,`The inputs are broken`],answer:0,why:`with index keys, "row 0" is still row 0 after the shuffle, so its state stays put while the names move.`}
]},
/* ───────────── VUE CITY ───────────── */
{
id:'vue-template', level:'vue', runtime:'vue', scene:'flow', title:'Templates & interpolation', metaphor:'A fill-in-the-blank invitation',
legend:FLOW_LEGEND_VUE,
flow:[{id:'data',label:'data',sub:'guest · date · rsvp',kind:'state'},{id:'template',label:'template',parent:'data'},{id:'dom',label:'DOM',sub:'what you see',parent:'template',kind:'dom'}],
parable:`A wedding invitation is printed once with blanks: "Dear ____, you're invited on ____." Fill in a guest's name and the card is ready. A Vue template is that printed card. The {{ blanks }} are filled from your data, and when the data changes, the card updates itself.`,
theory:[`A Vue app mounts on an element: createApp({ … }).mount('#app').`,`{{ Double braces }} print a value from your data into the HTML.`,`Directives are attributes that start with v-. Shorthands: :href="…" binds an attribute, @click="…" listens to an event.`,`The template stays readable HTML. When the data changes, Vue updates only the parts of the page that changed.`],
controls:[
 {type:'select',label:'Guest',options:[{label:'Dewi',vars:{'--guest':'Dewi'}},{label:'Budi',vars:{'--guest':'Budi'}},{label:'Alexandra',vars:{'--guest':'Alexandra'}}]},
 {type:'select',label:'Date',options:[{label:'Sat 12 Oct',vars:{'--date':'Sat 12 Oct'}},{label:'Sun 3 Nov',vars:{'--date':'Sun 3 Nov'}}]},
 {type:'select',label:'Card color',options:[{label:'Vue green',vars:{'--accent':'#42B883'}},{label:'Lilac',vars:{'--accent':'#B9A3FF'}},{label:'Pink',vars:{'--accent':'#FF93B5'}}]}
],
html:`<div id="app" v-cloak>
  <article class="invite">
    <p class="small">You're invited</p>
    <h2>Dear {{ guest }},</h2>
    <p>Join us on <b>{{ date }}</b> at {{ place }}.</p>
    <p class="small">{{ guest.length }} letters in your name · {{ rsvp ? 'RSVP sent' : 'not answered yet' }}</p>
    <div class="row">
      <button @click="rsvp = !rsvp">{{ rsvp ? 'Undo RSVP' : 'RSVP' }}</button>
      <a :href="mapLink" target="_blank">Open map</a>
    </div>
  </article>
</div>`,
css:`[v-cloak]{display:none}
.invite{max-width:340px;padding:22px;border-radius:14px;background:var(--raised);border:2px solid var(--accent);display:grid;gap:8px;transition:border-color .3s}
.invite h2{margin:0;font-size:24px;color:var(--accent);transition:color .3s}
.invite p{margin:0}
.small{font:12px 'JetBrains Mono';color:var(--ink2)}
.row{display:flex;gap:12px;align-items:center;margin-top:6px}
button{padding:8px 14px;border-radius:8px;border:none;background:var(--accent);color:#0D1016;font:600 13px 'IBM Plex Sans';cursor:pointer}
a{color:var(--sky);font-size:13px}`,
js:`const { createApp, ref, computed, onUpdated } = Vue;

createApp({
  setup() {
    // controlRef reads the controls on the left (a playground helper, not part of Vue)
    const guest = controlRef('--guest', 'Dewi');
    const date = controlRef('--date', 'Sat 12 Oct');
    const place = ref('Taman Sari, Yogyakarta');
    const rsvp = ref(false);
    const mapLink = computed(() => 'https://maps.google.com/?q=' + encodeURIComponent(place.value));

    // every time the template re-renders, light up the 3D view
    onUpdated(() => { ux.flow('data', 'template', 'prop'); ux.render('dom'); });

    // whatever setup() returns can be used in the template
    return { guest, date, place, rsvp, mapLink };
  }
}).mount('#app');`,
bad:{label:'Building HTML by gluing strings. Hard to read, and easy to break or make unsafe.',html:`<pre style="margin:0;font:12px/1.6 'JetBrains Mono';color:#A9B4C2">el.innerHTML = '&lt;h2&gt;Dear ' + name +
  ',&lt;/h2&gt;&lt;p&gt;Join us on ' + date + '&lt;/p&gt;';
<span style="color:#FF8A8A">// redo it by hand on every change</span></pre>`},
good:{label:'A template with blanks. Vue fills them in and keeps them up to date.',html:`<pre style="margin:0;font:12px/1.6 'JetBrains Mono';color:#A9B4C2">&lt;h2&gt;Dear {{ name }},&lt;/h2&gt;
&lt;p&gt;Join us on {{ date }}&lt;/p&gt;
<span style="color:#7EF2C3">&lt;!-- change name, the card updates --&gt;</span></pre>`},
figma:[`Start a project: npm create vue@latest, then npm install and npm run dev.`,`Open src/App.vue. The <template> block is the HTML you wrote here, and <script setup> holds the data.`,`Install Vue Devtools in your browser to see and edit your data while the app runs.`],
quiz:[
 {q:`What does {{ guest }} do in a Vue template?`,options:[`Prints the value of guest and keeps it updated`,`Creates a variable`,`Adds a comment`],answer:0,why:`interpolation shows the current value, and Vue re-renders it whenever guest changes.`},
 {q:`What does :href="mapLink" mean?`,options:[`The text "mapLink" becomes the link`,`The href attribute gets the value of mapLink from your data`,`It disables the link`],answer:1,why:`the colon is short for v-bind: the attribute value is a JavaScript expression.`}
]},
{
id:'vue-reactivity', level:'vue', runtime:'vue', scene:'flow', title:'Reactivity: ref & computed', metaphor:'Spreadsheet cells',
legend:[{c:'#FFC877',t:'ref (a cell you edit)'},{c:'#B9A3FF',t:'computed (a formula)'},{c:'#42B883',t:'Template'},{c:'#7FD4FF',t:'Change spreading'}],
flow:[{id:'price',label:'price',sub:'ref',kind:'state'},{id:'qty',label:'qty',sub:'ref',kind:'state'},{id:'tax',label:'tax',sub:'ref',kind:'state'},{id:'subtotal',label:'subtotal',sub:'computed',parent:['price','qty'],kind:'computed'},{id:'total',label:'total',sub:'computed',parent:['subtotal','tax'],kind:'computed'},{id:'template',label:'template',parent:'total'}],
parable:`In a spreadsheet, you type a new price into one cell and the total at the bottom changes instantly. Nobody recalculates by hand. The total cell holds a formula that remembers which cells it reads. Vue's reactivity works the same way: ref() is a cell, computed() is a formula.`,
theory:[`ref(0) makes a reactive value. In JavaScript you read and write it with .value. In the template, Vue unwraps it for you.`,`computed(() => …) is a formula. It remembers the refs it reads and recalculates only when one of them changes.`,`Don't store what you can calculate. Keep price and qty, and compute the total.`,`watch() runs code when a value changes, for side effects like saving or logging.`],
controls:[
 {type:'range',label:'B1 · price',var:'--price',min:5,max:30,step:1,unit:'',value:12},
 {type:'range',label:'B3 · tax %',var:'--tax',min:0,max:20,step:1,unit:'',value:10}
],
html:`<div id="app" v-cloak>
  <table class="sheet">
    <tr><th></th><th>A</th><th>B</th></tr>
    <tr><td>1</td><td>price</td><td>{{ price }}</td></tr>
    <tr><td>2</td><td>qty</td><td><button @click="qty > 0 && qty--">−</button> {{ qty }} <button @click="qty++">+</button></td></tr>
    <tr><td>3</td><td>tax %</td><td>{{ tax }}</td></tr>
    <tr class="f"><td>4</td><td>subtotal <i>= B1 × B2</i></td><td>{{ subtotal }}</td></tr>
    <tr class="f"><td>5</td><td>total <i>= B4 + tax</i></td><td>{{ total.toFixed(2) }}</td></tr>
  </table>
  <p class="note">Change B1, B2 or B3 and watch B4 and B5 follow.</p>
</div>`,
css:`[v-cloak]{display:none}
.sheet{border-collapse:collapse;font:13px 'JetBrains Mono';min-width:300px}
.sheet th,.sheet td{border:1px solid var(--line);padding:7px 10px;text-align:left}
.sheet th,.sheet td:first-child{background:#0D1016;color:var(--ink2);font-weight:400}
.sheet tr.f td:nth-child(3){color:#B9A3FF;font-weight:600}
.sheet i{color:var(--ink2);font-style:normal;font-size:11px}
.sheet button{width:22px;height:22px;border-radius:5px;border:1px solid var(--line);background:var(--raised);color:var(--ink);cursor:pointer}
.note{font:12px 'JetBrains Mono';color:var(--ink2)}`,
js:`const { createApp, ref, computed, watch } = Vue;

createApp({
  setup() {
    const price = controlRef('--price', 12); // cells filled from the sliders
    const tax = controlRef('--tax', 10);
    const qty = ref(2);                      // a cell you edit with the buttons

    // computed = a formula cell. It re-runs only when a cell it reads changes.
    const subtotal = computed(() => Number(price.value) * qty.value);
    const total = computed(() => subtotal.value * (1 + Number(tax.value) / 100));

    // watch = "when this changes, also do something" (here: light up the 3D view)
    watch(price, () => ux.flow('price', 'subtotal', 'state'));
    watch(qty, () => ux.flow('qty', 'subtotal', 'state'));
    watch(tax, () => ux.flow('tax', 'total', 'state'));
    watch(subtotal, () => ux.flow('subtotal', 'total', 'state'));
    watch(total, () => { ux.flow('total', 'template', 'state'); ux.render('template'); });

    return { price, qty, tax, subtotal, total };
  }
}).mount('#app');`,
bad:{label:'Storing the total separately. Forget to update it once and it is wrong.',html:`<pre style="margin:0;font:12px/1.6 'JetBrains Mono';color:#A9B4C2">const qty = ref(2);
const total = ref(24);
qty.value++;   <span style="color:#FF8A8A">// total is still 24</span></pre>`},
good:{label:'A computed formula. It can never be out of date.',html:`<pre style="margin:0;font:12px/1.6 'JetBrains Mono';color:#A9B4C2">const qty = ref(2);
const total = computed(() =&gt; price.value * qty.value);
qty.value++;   <span style="color:#7EF2C3">// total follows</span></pre>`},
figma:[`In a .vue file, write the same code inside <script setup>. Everything you declare is available in the template.`,`Use reactive({ … }) when you want a whole object to be reactive, like a form.`,`In Vue Devtools, computed values are listed separately, so you can see what each formula returns.`],
quiz:[
 {q:`In JavaScript, how do you change a ref named count?`,options:[`count = 5`,`count.value = 5`,`setCount(5)`],answer:1,why:`a ref is a box. You read and write what's inside through .value.`},
 {q:`When does a computed value recalculate?`,options:[`Every second`,`Only when one of the reactive values it reads changes`,`Never`],answer:1,why:`computed tracks its dependencies and caches the result until one of them changes.`}
]},
{
id:'vue-directives', level:'vue', runtime:'vue', scene:'flow', title:'v-if, v-show & v-for', metaphor:'Stage lights',
legend:[{c:'#42B883',t:'In the DOM'},{c:'#5d6a80',t:'Hidden by v-show (still there)'},{c:'#FFC877',t:'Data'},{c:'#7FD4FF',t:'Created'}],
flow:[{id:'stage',label:'Stage'},{id:'Rama',label:'ActorCard',sub:'Rama',parent:'stage'},{id:'Sinta',label:'ActorCard',sub:'Sinta',parent:'stage'},{id:'Hanoman',label:'ActorCard',sub:'Hanoman',parent:'stage'}],
parable:`There are two ways to hide an actor in a theater. Turn off their spotlight, and they still stand on stage in the dark, ready to appear instantly. Or send them backstage, and they have to walk all the way back. v-show turns off the light (display:none). v-if sends the element backstage, removing it from the page.`,
theory:[`v-if adds or removes the element from the DOM. Use it for things that rarely change.`,`v-show keeps the element and only toggles display:none. Use it for things that toggle often.`,`v-for repeats an element for each item: <li v-for="item in items" :key="item.id">.`,`Always give v-for items a stable :key, just like in React.`],
controls:[
 {type:'range',label:'Actors (v-for)',var:'--n',min:1,max:5,step:1,unit:'',value:3},
 {type:'select',label:'Hide with',options:[{label:'v-show',vars:{'--hide':'show'}},{label:'v-if',vars:{'--hide':'if'}}]}
],
html:`<div id="app" v-cloak>
  <div class="bar">
    <button @click="lights = !lights">{{ lights ? 'Lights off' : 'Lights on' }}</button>
    <code>{{ mode === 'if' ? 'v-if' : 'v-show' }}="lights"</code>
  </div>
  <div class="stage">
    <div v-if="mode === 'if'">
      <div class="cast" v-if="lights">
        <actor-card v-for="a in cast" :key="a" :name="a"></actor-card>
      </div>
    </div>
    <div v-else>
      <div class="cast" v-show="lights">
        <actor-card v-for="a in cast" :key="a" :name="a"></actor-card>
      </div>
    </div>
  </div>
  <p class="stats">actors created so far: {{ created }} · in the DOM now: {{ inDom }}</p>
</div>`,
css:`[v-cloak]{display:none}
.bar{display:flex;gap:10px;align-items:center;margin-bottom:12px}
.bar code{font:12px 'JetBrains Mono';color:var(--sky)}
button{padding:8px 14px;border-radius:8px;border:none;background:#42B883;color:#0D1016;font:600 13px 'IBM Plex Sans';cursor:pointer}
.stage{min-height:120px;padding:14px;border-radius:12px;background:radial-gradient(ellipse at 50% 0,#2a3144,#0D1016 70%);border:1px solid var(--line)}
.cast{display:flex;gap:10px;flex-wrap:wrap}
.actor{display:grid;justify-items:center;gap:6px;font:12px 'JetBrains Mono';animation:in .4s cubic-bezier(.2,.8,.2,1)}
.head{width:30px;height:30px;border-radius:50%;background:#FFC877;box-shadow:0 18px 0 -4px #42B883}
@keyframes in{from{transform:translateY(10px);opacity:0}}
.stats{font:12px 'JetBrains Mono';color:var(--ink2)}`,
js:`const { createApp, ref, computed, watchEffect, onMounted, onUpdated, nextTick } = Vue;

const NAMES = ['Rama', 'Sinta', 'Hanoman', 'Rahwana', 'Laksmana'];
const created = ref(0);

// A small component. onMounted runs each time a new copy is created.
const ActorCard = {
  props: ['name'],
  template: '<div class="actor"><div class="head"></div>{{ name }}</div>',
  setup(props) {
    onMounted(() => { created.value++; ux.render(props.name); });
  }
};

createApp({
  components: { ActorCard },
  setup() {
    const n = controlRef('--n', 3);
    const mode = controlRef('--hide', 'show');
    const lights = ref(true);
    const cast = computed(() => NAMES.slice(0, Number(n.value)));
    const inDom = ref(0);
    const count = () => nextTick(() => { inDom.value = document.querySelectorAll('.actor').length; });
    onMounted(count); onUpdated(count);

    // draw the tree: v-if removes nodes, v-show keeps them as ghosts
    watchEffect(() => {
      const gone = mode.value === 'if' && !lights.value;
      ux.tree([{ id: 'stage', label: 'Stage' }].concat(gone ? [] : cast.value.map(a => (
        { id: a, label: 'ActorCard', sub: a, parent: 'stage', ghost: !lights.value }
      ))));
    });

    return { lights, mode, cast, created, inDom };
  }
}).mount('#app');`,
bad:{label:'v-if and v-for on the same element. It is confusing which one runs first.',html:`<pre style="margin:0;font:12px/1.6 'JetBrains Mono';color:#A9B4C2">&lt;li v-for="a in actors" v-if="a.onStage"&gt;
  {{ a.name }}
&lt;/li&gt;  <span style="color:#FF8A8A">&lt;!-- two jobs, one tag --&gt;</span></pre>`},
good:{label:'Filter in a computed list, then loop over it with a key.',html:`<pre style="margin:0;font:12px/1.6 'JetBrains Mono';color:#A9B4C2">const onStage = computed(() =&gt;
  actors.value.filter(a =&gt; a.onStage));

&lt;li v-for="a in onStage" :key="a.id"&gt;</pre>`},
figma:[`Use v-else and v-else-if right after a v-if to show one of several options.`,`Wrap several elements in <template v-if="…"> to toggle them together without an extra div.`,`Open the Elements panel in DevTools and toggle the lights: v-show elements stay, v-if elements disappear.`],
quiz:[
 {q:`A dropdown opens and closes many times a minute. Which fits best?`,options:[`v-show`,`v-if`,`Neither`],answer:0,why:`v-show only flips display, which is cheaper than creating and destroying elements again and again.`},
 {q:`What does v-for need on every item?`,options:[`A class`,`A unique :key`,`An id attribute`],answer:1,why:`the key lets Vue track each item when the list changes, just like React keys.`}
]},
{
id:'vue-model', level:'vue', runtime:'vue', scene:'flow', title:'v-model & forms', metaphor:'A walkie-talkie',
legend:[{c:'#FFC877',t:'Data (ref)'},{c:'#5d6a80',t:'Input element'},{c:'#7FD4FF',t:'Data → input'},{c:'#FF93B5',t:'Input → data'}],
flow:[{id:'data',label:'data',sub:'name · role · available',kind:'state'},{id:'input',label:'inputs',sub:'v-model',parent:'data',kind:'dom'},{id:'preview',label:'preview card',parent:'data'}],
parable:`A walkie-talkie works both ways. You talk and the other side hears you. They talk and you hear them. v-model links an input and your data the same way: type in the box and the data changes; change the data and the box updates.`,
theory:[`v-model on an input keeps the input and a ref in sync, in both directions.`,`It's shorthand for :value plus @input: the value goes in, and an event comes back out.`,`It works on text inputs, checkboxes, radios and selects. Modifiers like v-model.trim and v-model.number clean up the value.`,`Use @submit.prevent on a form so the page doesn't reload when it's sent.`],
controls:[
 {type:'select',label:'Fill the data from code',options:[{label:'Empty',vars:{'--preset':'empty'}},{label:'Sample',vars:{'--preset':'sample'}}]}
],
html:`<div id="app" v-cloak>
  <div class="wrap">
    <form class="form" @submit.prevent="sent = true">
      <label>Name <input v-model.trim="name" placeholder="Your name"></label>
      <label>Role
        <select v-model="role">
          <option>Student</option><option>Designer</option><option>Frontend dev</option>
        </select>
      </label>
      <label class="check"><input type="checkbox" v-model="available"> Open to work</label>
      <button>Send</button>
    </form>
    <div class="card">
      <small>live preview</small>
      <h3>{{ name || 'Your name' }}</h3>
      <p>{{ role }} · {{ available ? 'open to work' : 'busy' }}</p>
      <p v-if="sent" class="sent">Sent!</p>
    </div>
  </div>
</div>`,
css:`[v-cloak]{display:none}
.wrap{display:flex;gap:16px;flex-wrap:wrap;align-items:flex-start}
.form{display:grid;gap:10px;min-width:200px}
label{display:grid;gap:4px;font-size:13px;color:var(--ink2)}
label.check{display:flex;align-items:center;gap:8px}
input,select{padding:8px 10px;border-radius:8px;border:1px solid #33405a;background:#0D1016;color:var(--ink);font:14px 'IBM Plex Sans'}
input:focus,select:focus{outline:2px solid #42B883;outline-offset:1px}
button{padding:9px;border-radius:8px;border:none;background:#42B883;color:#0D1016;font:600 13px 'IBM Plex Sans';cursor:pointer}
.card{flex:1;min-width:180px;padding:16px;border-radius:12px;background:var(--raised);border:1px solid #42B883}
.card small{font:11px 'JetBrains Mono';color:var(--ink2)}
.card h3{margin:6px 0 4px}
.card p{margin:0;font-size:13px}
.sent{color:#42B883;margin-top:8px !important}`,
js:`const { createApp, ref, watch } = Vue;

createApp({
  setup() {
    const name = ref('');
    const role = ref('Student');
    const available = ref(true);
    const sent = ref(false);

    // data → input: when code changes the refs, the inputs update by themselves
    const preset = controlRef('--preset', 'empty');
    watch(preset, p => {
      if (p === 'sample') { name.value = 'Sinta'; role.value = 'Frontend dev'; available.value = false; }
      else { name.value = ''; role.value = 'Student'; available.value = true; }
      ux.flow('data', 'input', 'prop');
    });

    // input → data: typing in the box changes the ref
    watch([name, role, available], () => {
      sent.value = false;
      ux.flow('input', 'data', 'emit');
      ux.flow('data', 'preview', 'prop');
      ux.render('preview');
    });

    return { name, role, available, sent };
  }
}).mount('#app');`,
bad:{label:'Reading and writing the input by hand. Easy to forget one direction.',html:`<pre style="margin:0;font:12px/1.6 'JetBrains Mono';color:#A9B4C2">input.addEventListener('input', e =&gt; {
  state.name = e.target.value;
});
<span style="color:#FF8A8A">// ...and when state.name changes in code?</span></pre>`},
good:{label:'v-model keeps both sides in sync.',html:`<pre style="margin:0;font:12px/1.6 'JetBrains Mono';color:#A9B4C2">&lt;input v-model.trim="name"&gt;
<span style="color:#7EF2C3">&lt;!-- type → name changes
     name changes → input shows it --&gt;</span></pre>`},
figma:[`Group form fields in one reactive({ name: '', role: '' }) object and bind each with v-model="form.name".`,`Use v-model.number on number inputs so you get a number instead of a string.`,`For validation, add computed errors (const nameError = computed(() => …)) and show them under each field.`],
quiz:[
 {q:`What does v-model do?`,options:[`Keeps an input and a ref in sync in both directions`,`Only reads the input once`,`Styles the input`],answer:0,why:`it binds the value into the input and listens for changes coming back out.`},
 {q:`Why add .prevent to @submit on a form?`,options:[`To stop the browser from reloading the page`,`To make the form faster`,`To hide the button`],answer:0,why:`.prevent calls event.preventDefault(), so you handle the submit in JavaScript.`}
]},
{
id:'vue-components', level:'vue', runtime:'vue', scene:'flow', title:'Components, props & emits', metaphor:'Waiter and kitchen',
legend:[{c:'#42B883',t:'Component'},{c:'#FFC877',t:'Data'},{c:'#7FD4FF',t:'Props going down'},{c:'#FF93B5',t:'Emits coming up'}],
flow:[{id:'App',label:'App',sub:'counts orders'},{id:'table1',label:'TableOrder',sub:'table 1',parent:'App'},{id:'table2',label:'TableOrder',sub:'table 2',parent:'App'}],
parable:`In a restaurant, the waiter carries your order down to the kitchen on a ticket. When the dish is ready, the kitchen rings a bell. The kitchen never walks out to your table to change your order. Vue components talk the same way: props go down like order tickets, events come up like the bell.`,
theory:[`A component is an object with a template and setup(). Register it under components: { … } and use it as a tag.`,`Props carry data down from parent to child. Declare them: props: { tableNo: Number }.`,`emit('served') sends an event up. The parent listens with @served="…".`,`Props down, events up: every piece stays simple, and you can always tell who changed what.`],
controls:[
 {type:'range',label:'Tables',var:'--tables',min:1,max:4,step:1,unit:'',value:2},
 {type:'select',label:'Kitchen speed (prop)',options:[{label:'Fast',vars:{'--speed':'700'}},{label:'Slow',vars:{'--speed':'1800'}}]}
],
html:`<div id="app" v-cloak>
  <p class="status">orders cooking: {{ cooking }} · dishes served: {{ served }}</p>
  <div class="tables">
    <table-order v-for="n in tables" :key="n" :table-no="n" :speed="speed"
      @ordered="onOrdered" @served="onServed"></table-order>
  </div>
</div>

<template id="table-tpl">
  <div class="table" :class="state">
    <b>Table {{ tableNo }}</b>
    <span>{{ label }}</span>
    <button @click="order" :disabled="state === 'cooking'">Order nasi goreng</button>
  </div>
</template>`,
css:`[v-cloak]{display:none}
.status{font:12px 'JetBrains Mono';color:var(--ink2);margin:0 0 12px}
.tables{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px}
.table{display:grid;gap:6px;padding:14px;border-radius:12px;background:var(--raised);border:1px solid var(--line);transition:border-color .2s}
.table.cooking{border-color:#FFC877}.table.done{border-color:#42B883}
.table span{font:12px 'JetBrains Mono';color:var(--ink2)}
button{padding:8px;border-radius:8px;border:none;background:#42B883;color:#0D1016;font:600 12px 'IBM Plex Sans';cursor:pointer}
button:disabled{opacity:.4;cursor:wait}`,
js:`const { createApp, ref, computed, watch } = Vue;

// Child component: gets props from the parent, rings the bell with emit
const TableOrder = {
  template: '#table-tpl',
  props: { tableNo: Number, speed: Number },
  emits: ['ordered', 'served'],
  setup(props, { emit }) {
    const state = ref('idle');
    const label = computed(() => ({ idle: 'waiting', cooking: 'cooking...', done: 'served' })[state.value]);
    function order() {
      state.value = 'cooking';
      emit('ordered', props.tableNo);
      setTimeout(() => {
        state.value = 'done';
        emit('served', props.tableNo); // the bell: tell the parent
      }, props.speed);
    }
    return { state, label, order };
  }
};

createApp({
  components: { TableOrder },
  setup() {
    const tablesRaw = controlRef('--tables', 2);
    const speedRaw = controlRef('--speed', 700);
    const tables = computed(() => Number(tablesRaw.value));
    const speed = computed(() => Number(speedRaw.value));
    const cooking = ref(0), served = ref(0);

    function onOrdered(no) { cooking.value++; ux.flow('table' + no, 'App', 'emit'); }
    function onServed(no) { cooking.value--; served.value++; ux.flow('table' + no, 'App', 'emit'); ux.render('App'); }

    // draw the tree, and show the speed prop travelling down when it changes
    watch(tables, n => ux.tree([{ id: 'App', label: 'App', sub: 'counts orders' }].concat(
      Array.from({ length: n }, (_, i) => ({ id: 'table' + (i + 1), label: 'TableOrder', sub: 'table ' + (i + 1), parent: 'App' }))
    )), { immediate: true });
    watch(speed, () => { for (let i = 1; i <= tables.value; i++) ux.flow('App', 'table' + i, 'prop'); });

    return { tables, speed, cooking, served, onOrdered, onServed };
  }
}).mount('#app');`,
bad:{label:'The child reaches up and changes the parent data directly. Nobody can tell who changed it.',html:`<pre style="margin:0;font:12px/1.6 'JetBrains Mono';color:#A9B4C2">// inside TableOrder
props.order.status = 'served'; <span style="color:#FF8A8A">// mutating a prop</span>
$parent.served++;              <span style="color:#FF8A8A">// reaching up</span></pre>`},
good:{label:'Props down, events up. The parent decides what to change.',html:`<pre style="margin:0;font:12px/1.6 'JetBrains Mono';color:#A9B4C2">// child
emit('served', tableNo)
// parent
&lt;table-order @served="onServed" /&gt; <span style="color:#7EF2C3">// the bell</span></pre>`},
figma:[`In a .vue file, use defineProps({ tableNo: Number }) and const emit = defineEmits(['served']) inside <script setup>.`,`Name events as past-tense actions (served, saved, closed) so the parent reads like a story.`,`Vue Devtools has a Timeline tab that lists every emitted event as it happens.`],
quiz:[
 {q:`A child needs to tell its parent a dish is ready. What should it use?`,options:[`emit('served')`,`Change the parent's data directly`,`A global variable`],answer:0,why:`events go up. The parent listens with @served and decides what to do.`},
 {q:`How does data get from a parent to a child component?`,options:[`Through props`,`Through emit`,`Through CSS`],answer:0,why:`props carry data down. Emits carry messages up.`}
]}
];

window.UX_LESSONS.push.apply(window.UX_LESSONS, FRONTEND);
window.UX_LESSONS.forEach(function (l, i) { l.n = i + 1; });
})();
