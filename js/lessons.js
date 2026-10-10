window.UX_LESSONS = [
/* ───────────── BEGINNER ───────────── */
{
id:'hierarchy', level:'beginner', title:'Visual Hierarchy', metaphor:'The grocery shelf',
parable:`In a grocery store, the brand that pays the most sits at eye level, the big red SALE sign is the first thing you notice, and the dusty tins live on the bottom shelf. Nobody reads every label. Eyes jump to the biggest, brightest, closest thing first. A screen works the same way.`,
theory:[`Size and weight signal importance: bigger and bolder gets read first.`,`Contrast and color pull the eye, so save your loudest color for the one thing that matters.`,`Position matters too. People scan top-left first (F and Z patterns).`,`Aim for one clear focal point per view. If everything shouts, nothing gets heard.`],
controls:[
 {type:'range',label:'Title size',var:'--title',min:14,max:44,step:1,unit:'px',value:16},
 {type:'select',label:'Price color',options:[{label:'Muted',vars:{'--price':'#A9B4C2'}},{label:'Amber',vars:{'--price':'#FFC877'}}]},
 {type:'select',label:'Button',options:[{label:'Ghost',vars:{'--btn':'transparent','--btntext':'#A9B4C2','--btnbd':'#263042'}},{label:'Solid',vars:{'--btn':'#7EF2C3','--btntext':'#0D1016','--btnbd':'#7EF2C3'}}]}
],
html:`<div class="card">
  <span class="tag">Fresh today</span>
  <h2>Sourdough Loaf</h2>
  <p class="price">$6.50</p>
  <p class="desc">Slow-fermented for 36 hours, baked this morning.</p>
  <button>Add to basket</button>
</div>`,
css:`.card{max-width:320px;padding:24px;border:1px solid var(--line);border-radius:14px;background:var(--raised);display:grid;gap:8px}
.tag{font:12px 'JetBrains Mono';color:var(--ink2)}
h2{margin:0;font-size:var(--title);line-height:1.15;transition:font-size .2s}
.price{margin:0;font-size:16px;font-weight:600;color:var(--price)}
.desc{margin:0;color:var(--ink2);font-size:15px}
button{justify-self:start;margin-top:8px;padding:10px 16px;border-radius:8px;border:1px solid var(--btnbd);background:var(--btn);color:var(--btntext);font:600 14px 'IBM Plex Sans';cursor:pointer}`,
js:``,
bad:{label:'Everything is the same volume, so the eye has nowhere to land.',html:`<div style="display:grid;gap:6px;font-size:15px;color:#A9B4C2;max-width:280px"><div>Fresh today</div><div>Sourdough Loaf</div><div>$6.50</div><div>Slow-fermented 36 hours.</div><div style="border:1px solid #263042;padding:6px 10px;width:max-content">Add to basket</div></div>`},
good:{label:'One focal point (the name), then the price, then the action.',html:`<div style="display:grid;gap:6px;max-width:280px"><div style="font:12px 'JetBrains Mono';color:#A9B4C2">Fresh today</div><div style="font:700 26px/1.1 'Space Grotesk'">Sourdough Loaf</div><div style="font-weight:700;color:#FFC877">$6.50</div><div style="color:#A9B4C2;font-size:14px">Slow-fermented 36 hours.</div><div style="background:#7EF2C3;color:#0D1016;font-weight:600;padding:8px 14px;border-radius:8px;width:max-content;margin-top:4px">Add to basket</div></div>`},
figma:[`Create text styles by role (Display, Title, Body, Caption) in the right panel under Text → Style (+).`,`Squint test: add a Layer blur of about 6–8 to the frame and see what still stands out.`,`Give only the primary action a filled color. Make secondary buttons outline or ghost variants.`],
quiz:[
 {q:`You blur your screen until it's fuzzy. What should still stand out?`,options:[`Every element, equally`,`The one thing the user should notice or do`,`The footer links`],answer:1,why:`a blurred screen shows the real hierarchy. The primary focal point should survive.`},
 {q:`Which of these is NOT a hierarchy tool?`,options:[`Size`,`Contrast`,`Position`,`Number of fonts loaded`],answer:3,why:`size, contrast and position direct attention. Loading more fonts doesn't.`}
]},
{
id:'gestalt', level:'beginner', title:'Gestalt Grouping', metaphor:'The cutlery drawer',
parable:`Open a messy kitchen drawer and you get forks, spoons and the egg whisk all jumbled together. Now open one with a cutlery tray: forks together, spoons together, each in its own compartment. You didn't read a single label, yet you found the spoon instantly. Your brain groups things that are close together, look alike, or share a box.`,
theory:[`Proximity: things close together read as one group.`,`Similarity: the same color or shape reads as the same kind of thing.`,`Common region: a shared background or border creates a group.`,`The gap between groups must be clearly bigger than the gap inside a group.`],
controls:[
 {type:'range',label:'Space inside groups',var:'--in',min:2,max:32,step:2,unit:'px',value:16},
 {type:'range',label:'Space between groups',var:'--between',min:2,max:48,step:2,unit:'px',value:16},
 {type:'select',label:'Similarity (color)',options:[{label:'Off',vars:{'--c1':'#263042','--c2':'#263042','--c3':'#263042'}},{label:'On',vars:{'--c1':'#1F4A3C','--c2':'#3A2F66','--c3':'#5A4520'}}]},
 {type:'select',label:'Common region (tray)',options:[{label:'Off',vars:{'--region':'transparent','--pad':'0px'}},{label:'On',vars:{'--region':'#1A2130','--pad':'12px'}}]}
],
html:`<div class="drawer">
  <div class="group g1"><span class="chip">Dinner fork</span><span class="chip">Salad fork</span><span class="chip">Fish fork</span></div>
  <div class="group g2"><span class="chip">Soup spoon</span><span class="chip">Teaspoon</span><span class="chip">Dessert spoon</span></div>
  <div class="group g3"><span class="chip">Butter knife</span><span class="chip">Steak knife</span><span class="chip">Bread knife</span></div>
</div>`,
css:`.drawer{display:flex;flex-direction:column;gap:var(--between);transition:gap .2s}
.group{display:flex;flex-wrap:wrap;gap:var(--in);padding:var(--pad);background:var(--region);border-radius:12px;transition:all .25s}
.chip{padding:8px 12px;border-radius:8px;font:13px 'JetBrains Mono';transition:background .25s}
.g1 .chip{background:var(--c1)}.g2 .chip{background:var(--c2)}.g3 .chip{background:var(--c3)}`,
js:``,
bad:{label:'The label floats halfway between fields. Which input is "Email"?',html:`<div style="display:grid;gap:14px;max-width:260px;font-size:13px;color:#A9B4C2"><div>Name</div><div style="height:34px;border:1px solid #33405a;border-radius:6px"></div><div>Email</div><div style="height:34px;border:1px solid #33405a;border-radius:6px"></div></div>`},
good:{label:'Labels hug their fields, and a bigger gap separates the pairs.',html:`<div style="display:grid;gap:20px;max-width:260px;font-size:13px;color:#A9B4C2"><div style="display:grid;gap:4px"><div>Name</div><div style="height:34px;border:1px solid #33405a;border-radius:6px"></div></div><div style="display:grid;gap:4px"><div>Email</div><div style="height:34px;border:1px solid #33405a;border-radius:6px"></div></div></div>`},
figma:[`Wrap related layers in a frame with Auto layout. Keep the gap inside small (8) and the space between frames larger (24+).`,`Add a fill to the parent frame to create a "common region" card.`,`Select several items and drag the Tidy up handle to even out the spacing.`],
quiz:[
 {q:`A label sits exactly halfway between two inputs. Which principle breaks?`,options:[`Proximity: users can't tell which input it belongs to`,`Similarity`,`Closure`],answer:0,why:`the label is equally close to both inputs, so proximity can't group it with either.`},
 {q:`What's the quickest way to show 3 buttons form one toolbar?`,options:[`Give them random colors`,`Put them close together on a shared background`,`Make them different sizes`],answer:1,why:`proximity plus a common region groups them instantly.`}
]},
{
id:'color', level:'beginner', title:'Color & Contrast', metaphor:'Road signs',
parable:`Road signs are designed to be read at 100 km/h in the rain: white on deep green, black on yellow. Nobody paints a stop sign light pink on white. Text on a screen is a road sign too. If the contrast is low, people miss their exit.`,
theory:[`Contrast ratio runs from 1:1 (invisible) to 21:1 (black on white).`,`WCAG AA asks for 4.5:1 on body text and 3:1 on large text and UI parts.`,`Never rely on color alone. Add an icon, a label or a pattern.`,`Keep the palette small: neutrals, one accent, and a few semantic colors.`],
controls:[
 {type:'range',label:'Text lightness',var:'--fgL',min:0,max:100,step:1,unit:'',value:62},
 {type:'range',label:'Sign lightness',var:'--bgL',min:0,max:100,step:1,unit:'',value:40},
 {type:'range',label:'Hue',var:'--hue',min:0,max:360,step:1,unit:'',value:150}
],
html:`<div class="sign">
  <div class="big">EXIT 24</div>
  <p>Downtown · Harbor · Airport</p>
</div>
<div class="meter">
  <span id="ratio">–</span>
  <span id="aa" class="badge">AA 4.5</span>
  <span id="large" class="badge">AA Large 3</span>
  <span id="aaa" class="badge">AAA 7</span>
</div>`,
css:`.sign{background:hsl(var(--hue) 45% calc(var(--bgL) * 1%));color:hsl(var(--hue) 30% calc(var(--fgL) * 1%));padding:28px;border-radius:12px;max-width:380px}
.big{font:700 40px 'Space Grotesk'}
p{margin:6px 0 0;font-size:15px}
.meter{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:16px;font-family:'JetBrains Mono'}
#ratio{font-size:22px;font-weight:600;margin-right:8px}
.badge{padding:4px 10px;border-radius:99px;border:1px solid var(--line);font-size:12px}
.pass{background:#7EF2C3;color:#0D1016;border-color:#7EF2C3}
.fail{color:#FF8A8A;border-color:#5a2a2a;text-decoration:line-through}`,
js:`function lum(c){var m=c.match(/[\\d.]+/g).map(Number).slice(0,3).map(function(v){v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4)});return 0.2126*m[0]+0.7152*m[1]+0.0722*m[2]}
function update(){
  var cs=getComputedStyle(document.querySelector('.sign'));
  var a=lum(cs.color), b=lum(cs.backgroundColor);
  var r=(Math.max(a,b)+0.05)/(Math.min(a,b)+0.05);
  document.getElementById('ratio').textContent=r.toFixed(2)+':1';
  [['aa',4.5],['large',3],['aaa',7]].forEach(function(p){
    document.getElementById(p[0]).className='badge '+(r>=p[1]?'pass':'fail');
  });
}
window.onVar=update; update();`,
bad:{label:'Low-contrast text, and the error is shown only by a red border.',html:`<div style="display:grid;gap:8px;max-width:260px"><div style="color:#3A4558;font-size:14px">Card number</div><div style="height:36px;border:1px solid #6b3a3a;border-radius:6px"></div><div style="color:#3A4558;font-size:12px">Payment details are stored securely.</div></div>`},
good:{label:'Readable text, and the error has words and an icon, not just color.',html:`<div style="display:grid;gap:8px;max-width:260px"><div style="color:#E6EDF3;font-size:14px">Card number</div><div style="height:36px;border:2px solid #FF8A8A;border-radius:6px"></div><div style="color:#FF8A8A;font-size:13px">⚠ Card number is 16 digits</div></div>`},
figma:[`Use a contrast plugin (Stark, Contrast) and select text plus its background to read the ratio.`,`Build color styles or variables as ramps (ink/100 to ink/900) so you pick tested pairs instead of guessing.`,`Run a color-blindness simulation plugin before handoff.`],
quiz:[
 {q:`What's the minimum WCAG AA contrast for normal body text?`,options:[`3:1`,`4.5:1`,`7:1`,`21:1`],answer:1,why:`AA asks for 4.5:1 on body text, 3:1 on large text, and 7:1 for AAA.`},
 {q:`A form error is shown only by turning the border red. What's wrong?`,options:[`Nothing`,`Color-blind users may miss it, so add text or an icon`,`Red is too bright`],answer:1,why:`color must never be the only signal.`}
]},
{
id:'type', level:'beginner', title:'Typography & Type Scale', metaphor:'The restaurant menu',
parable:`A good restaurant menu has a clear rhythm: big section names (Starters, Mains), medium dish names, small descriptions, and prices that line up. If every line were the same size, you'd read the whole menu just to find dessert. A type scale is the menu's rhythm.`,
theory:[`Pick a base size (16px on the web) and a ratio such as 1.25. Multiply up for each heading level.`,`Body line height of 1.4–1.6 is comfortable. Headings can be tighter.`,`Keep lines to 45–75 characters (the "measure").`,`Use 1–2 font families. Get variety from weight and size instead.`],
controls:[
 {type:'range',label:'Base size',var:'--base',min:12,max:22,step:1,unit:'px',value:16},
 {type:'range',label:'Scale ratio',var:'--r',min:1.05,max:1.6,step:0.01,unit:'',value:1.25},
 {type:'range',label:'Line height',var:'--lh',min:1,max:2,step:0.05,unit:'',value:1.5},
 {type:'range',label:'Measure',var:'--measure',min:24,max:100,step:1,unit:'ch',value:60}
],
html:`<article class="menu">
  <h1>Mains</h1>
  <h2>Wood-fired Aubergine</h2>
  <p>Charred over oak, finished with tahini, pomegranate and a little too much garlic, which is exactly the right amount. Served with flatbread from the same fire.</p>
  <h3>£14 · Vegetarian</h3>
  <small>Ask us about allergens</small>
</article>`,
css:`.menu{max-width:var(--measure);font-size:var(--base);line-height:var(--lh)}
h1{font:700 calc(var(--base) * var(--r) * var(--r) * var(--r) * var(--r))/1.05 'Space Grotesk';margin:0 0 .3em}
h2{font:600 calc(var(--base) * var(--r) * var(--r))/1.2 'Space Grotesk';margin:0 0 .3em}
p{margin:0}
h3{font:600 var(--base)/1.4 'JetBrains Mono';color:var(--amber);margin:.6em 0 0}
small{font-size:calc(var(--base) / var(--r));color:var(--ink2)}
.scale{font:12px/1.6 'JetBrains Mono';color:var(--ink2);margin-top:20px;border-top:1px solid var(--line);padding-top:12px}`,
js:`var out=document.createElement('pre');out.className='scale';document.body.appendChild(out);
function update(){
  var cs=getComputedStyle(document.documentElement);
  var b=parseFloat(cs.getPropertyValue('--base'))||16, r=parseFloat(cs.getPropertyValue('--r'))||1.25;
  out.textContent=[4,2,0,-1].map(function(k){return 'step '+(k>0?'+':'')+k+'   '+(b*Math.pow(r,k)).toFixed(1)+'px'}).join('\\n');
}
window.onVar=update; update();`,
bad:{label:'Three fonts, one size, and a line that runs on forever.',html:`<div style="font-size:14px"><div style="font-family:Georgia">Mains</div><div style="font-family:Courier New">Wood-fired Aubergine</div><div style="font-family:Arial;line-height:1.1">Charred over oak, finished with tahini, pomegranate and a little too much garlic. Served with flatbread from the same fire, and yes it really is quite a long line to read.</div></div>`},
good:{label:'One family, a clear scale, and a comfortable line length.',html:`<div style="max-width:34ch;line-height:1.5"><div style="font:700 30px/1.1 'Space Grotesk'">Mains</div><div style="font:600 19px 'Space Grotesk';margin:6px 0">Wood-fired Aubergine</div><div style="font-size:14px;color:#A9B4C2">Charred over oak, tahini, pomegranate. Served with flatbread.</div></div>`},
figma:[`Name text styles by role (Display, H1, H2, Body, Caption), not by size.`,`Set body line height in % (e.g. 150%) so it scales with font size.`,`Generate a modular scale with a plugin like Typescale, then round to whole pixels.`],
quiz:[
 {q:`What's a comfortable line length for body text?`,options:[`15–25 characters`,`45–75 characters`,`120+ characters`],answer:1,why:`45–75 characters keeps the eye's return sweep easy.`},
 {q:`With a 16px base and a 1.25 ratio, the next step up is…`,options:[`18px`,`20px`,`24px`],answer:1,why:`16 × 1.25 = 20.`}
]},
{
id:'box-model', level:'beginner', title:'The CSS Box Model', metaphor:'Shipping a package', scene:'box',
legend:[{c:'#7EF2C3',t:'Content: the mug'},{c:'#B9A3FF',t:'Padding: bubble wrap'},{c:'#FFC877',t:'Border: the cardboard'},{c:'#7FD4FF',t:'Margin: space in the van'}],
parable:`When you ship a mug, there's the mug itself (content), bubble wrap around it (padding), the cardboard box (border), and the space the courier leaves between packages in the van (margin). Every HTML element is shipped exactly like this.`,
theory:[`From the inside out: content → padding → border → margin.`,`Padding shows the element's background. Margin is always transparent.`,`box-sizing: content-box adds padding and border on top of the width. border-box keeps the width fixed and squeezes the content.`,`Vertical margins between blocks can collapse: the bigger one wins.`],
controls:[
 {type:'range',label:'width',var:'--w',min:80,max:220,step:2,unit:'px',value:140},
 {type:'range',label:'padding',var:'--pad',min:0,max:40,step:2,unit:'px',value:16},
 {type:'range',label:'border',var:'--bw',min:0,max:16,step:1,unit:'px',value:4},
 {type:'range',label:'margin',var:'--m',min:0,max:40,step:2,unit:'px',value:16},
 {type:'select',label:'box-sizing',options:[{label:'content-box',vars:{'--bs':'content-box'}},{label:'border-box',vars:{'--bs':'border-box'}}]}
],
html:`<div class="van">
  <div class="pkg">mug</div>
  <div class="pkg">mug</div>
</div>
<pre id="out"></pre>`,
css:`.van{display:flex;flex-wrap:wrap;background:repeating-linear-gradient(45deg,#1A2130 0 8px,#141a24 8px 16px);border:1px dashed #7FD4FF;border-radius:6px;width:max-content;max-width:100%}
.pkg{box-sizing:var(--bs);width:var(--w);padding:var(--pad);border:var(--bw) solid #FFC877;margin:var(--m);
  background:linear-gradient(#7EF2C3,#7EF2C3) content-box,#3B3160;color:#0D1016;font:600 13px 'JetBrains Mono';text-align:center}
#out{font:12px/1.6 'JetBrains Mono';color:var(--ink2);margin-top:16px}`,
js:`function update(){
  var p=document.querySelector('.pkg'), cs=getComputedStyle(p);
  var pad=parseFloat(cs.paddingLeft)*2, bd=parseFloat(cs.borderLeftWidth)*2, w=parseFloat(cs.width);
  var content=cs.boxSizing==='border-box'?Math.max(0,w-pad-bd):w;
  document.getElementById('out').textContent=
    'box-sizing: '+cs.boxSizing+'\\n'+
    'content '+content.toFixed(0)+' + padding '+pad+' + border '+bd+' = '+p.offsetWidth+'px on screen\\n'+
    'margin '+cs.marginLeft+' on each side (transparent)';
}
window.onVar=update; update();`,
bad:{label:'width:100% + padding with content-box overflows its parent.',html:`<div style="width:220px;border:1px dashed #7FD4FF;padding:4px"><div style="box-sizing:content-box;width:100%;padding:16px;background:#3B3160;font:12px 'JetBrains Mono'">I spill out →</div></div>`},
good:{label:'border-box keeps 100% meaning 100%, padding included.',html:`<div style="width:220px;border:1px dashed #7FD4FF;padding:4px"><div style="box-sizing:border-box;width:100%;padding:16px;background:#3B3160;font:12px 'JetBrains Mono'">I fit inside ✓</div></div>`},
figma:[`Figma frames behave like border-box: the size you set includes padding. Set strokes to "Inside" to match.`,`In Auto layout, the padding fields are CSS padding and the gap acts like margins between children.`,`In Dev Mode, the inspect panel shows a box-model diagram for any layer.`],
quiz:[
 {q:`Which layer shows the element's background color?`,options:[`Margin`,`Padding`,`Neither`],answer:1,why:`the background paints under content and padding, and the border sits on top. Margin is always transparent.`},
 {q:`width:200px; padding:20px; border:5px; box-sizing:content-box. What's the rendered width?`,options:[`200px`,`240px`,`250px`],answer:2,why:`200 + 20×2 + 5×2 = 250px.`}
]},
/* ───────────── INTERMEDIATE ───────────── */
{
id:'spacing', level:'intermediate', title:'Spacing & the 8pt Grid', metaphor:'Building bricks',
parable:`Toy bricks snap together because every stud sits exactly the same distance apart. You never need a ruler: everything lines up because it's all built on one unit. An 8-point spacing system gives your UI the same snap. Every gap is 4, 8, 16, 24, 32…`,
theory:[`Choose one base unit (8px, or 4px for tight spots).`,`Every padding, gap and size is a multiple of that unit.`,`Fewer choices mean faster decisions and a consistent rhythm.`,`Big spaces separate sections. Small spaces bind related items together.`],
controls:[
 {type:'select',label:'Spacing values',options:[{label:'Random',vars:{'--a':'7px','--b':'13px','--c':'5px','--d':'19px'}},{label:'On the grid',vars:{'--a':'calc(var(--u) * 1)','--b':'calc(var(--u) * 2)','--c':'calc(var(--u) * 1)','--d':'calc(var(--u) * 3)'}}]},
 {type:'range',label:'Base unit',var:'--u',min:4,max:12,step:4,unit:'px',value:8},
 {type:'select',label:'Grid overlay',options:[{label:'Off',vars:{'--grid':'none'}},{label:'On',vars:{'--grid':'linear-gradient(rgba(127,212,255,.14) 1px,transparent 1px),linear-gradient(90deg,rgba(127,212,255,.14) 1px,transparent 1px)'}}]}
],
html:`<div class="card">
  <h3>Notifications</h3>
  <p>Choose what reaches you.</p>
  <div class="row"><span>Order shipped</span><i class="sw on"></i></div>
  <div class="row"><span>Price drops</span><i class="sw"></i></div>
  <div class="row"><span>Weekly digest</span><i class="sw on"></i></div>
  <button>Save</button>
</div>`,
css:`body{background-image:var(--grid);background-size:var(--u) var(--u)}
.card{max-width:340px;padding:var(--d);background:var(--raised);border:1px solid var(--line);border-radius:var(--b);display:flex;flex-direction:column;gap:var(--c);transition:all .25s}
h3{margin:0;font-size:20px}
p{margin:0 0 var(--a);color:var(--ink2)}
.row{display:flex;justify-content:space-between;align-items:center;padding:var(--a) 0;border-top:1px solid var(--line)}
.sw{width:36px;height:20px;border-radius:99px;background:#263042;position:relative}
.sw.on{background:#7EF2C3}
.sw::after{content:'';position:absolute;top:3px;left:3px;width:14px;height:14px;border-radius:50%;background:#E6EDF3;transition:left .2s}
.sw.on::after{left:19px;background:#0D1016}
button{align-self:flex-start;margin-top:var(--b);padding:var(--a) var(--b);border-radius:8px;border:none;background:#7EF2C3;color:#0D1016;font:600 14px 'IBM Plex Sans'}`,
js:`document.querySelectorAll('.sw').forEach(function(s){s.onclick=function(){s.classList.toggle('on')}});`,
bad:{label:'Gaps of 5, 7, 13 and 19 make it feel slightly "off" everywhere.',html:`<div style="background:#1A2130;padding:13px 19px 7px;border-radius:5px;max-width:240px"><div style="font-weight:600;margin-bottom:3px">Profile</div><div style="color:#A9B4C2;font-size:13px;margin-bottom:11px">Edit your details</div><div style="background:#7EF2C3;color:#0D1016;padding:5px 13px;width:max-content;border-radius:9px;font-size:13px">Edit</div></div>`},
good:{label:'Everything is a multiple of 8, so it feels calm and aligned.',html:`<div style="background:#1A2130;padding:16px 24px;border-radius:8px;max-width:240px"><div style="font-weight:600;margin-bottom:4px">Profile</div><div style="color:#A9B4C2;font-size:13px;margin-bottom:16px">Edit your details</div><div style="background:#7EF2C3;color:#0D1016;padding:8px 16px;width:max-content;border-radius:8px;font-size:13px">Edit</div></div>`},
figma:[`In Preferences → Nudge amount, set the big nudge to 8 so Shift+Arrow moves 8px.`,`Add an 8px Layout grid to frames, and toggle it with Ctrl/Cmd+Shift+4.`,`Create spacing variables (space/8, space/16…) and bind them to auto-layout gaps and padding.`],
quiz:[
 {q:`On an 8pt system, which value doesn't belong?`,options:[`16`,`24`,`13`,`32`],answer:2,why:`13 isn't a multiple of 4 or 8.`},
 {q:`Why allow a half-step of 4px?`,options:[`For tight spots like the gap between an icon and its label`,`To make spacing random`,`Browsers require it`],answer:0,why:`4px covers small, tight relationships without leaving the system.`}
]},
{
id:'fitts-hick', level:'intermediate', title:`Fitts's & Hick's Law`, metaphor:'Light switches & menus',
parable:`In the dark, you find the big light switch by the door in a second. A tiny button on the far side of the room? You'll stub a toe. And at a diner with 300 dishes you stare at the menu forever, while at a food truck with 5 choices you order in seconds. Big and close is fast. Fewer choices are faster.`,
theory:[`Fitts's law: the time to hit a target grows with distance and shrinks with size.`,`Make primary actions large and close to where the pointer or thumb already is. Screen edges and corners are easy targets.`,`Hick's law: decision time grows with the number of choices. Group, chunk, or reveal options progressively.`,`Touch targets: aim for 44×44px. WCAG 2.2 AA sets a 24×24px minimum.`],
controls:[
 {type:'range',label:'Switch size',var:'--size',min:16,max:110,step:2,unit:'px',value:28},
 {type:'range',label:'Distance',var:'--dist',min:20,max:300,step:10,unit:'px',value:260},
 {type:'range',label:'Menu choices',var:'--n',min:2,max:24,step:1,unit:'',value:16}
],
html:`<section>
  <h4>Fitts: hit the light switch</h4>
  <div class="lane"><button id="start">Start</button><button id="target">ON</button></div>
  <p id="ft" class="res">Press Start, then the switch.</p>
</section>
<section>
  <h4>Hick: find “Tacos”</h4>
  <button id="hs">Shuffle menu</button>
  <div id="menu"></div>
  <p id="ht" class="res">Press Shuffle, then find Tacos.</p>
</section>`,
css:`section{margin-bottom:20px}
h4{margin:0 0 10px;font:600 15px 'Space Grotesk'}
.lane{position:relative;height:120px;border:1px dashed var(--line);border-radius:10px;overflow:hidden}
#start{position:absolute;left:12px;top:50%;transform:translateY(-50%)}
#target{position:absolute;left:calc(90px + var(--dist));top:50%;transform:translateY(-50%);width:var(--size);height:var(--size);padding:0;font-size:10px;background:#FFC877;color:#0D1016;border:none;border-radius:8px;transition:all .2s}
button{padding:8px 14px;border-radius:8px;border:1px solid var(--line);background:var(--raised);color:var(--ink);font:500 13px 'IBM Plex Sans';cursor:pointer}
#menu{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0}
#menu button{font-size:12px;padding:6px 10px}
.res{font:13px 'JetBrains Mono';color:var(--mint);margin:8px 0 0}`,
js:`var t0=0, armed=false;
document.getElementById('start').onclick=function(){t0=performance.now();armed=true;document.getElementById('ft').textContent='Go!'};
document.getElementById('target').onclick=function(){
  if(!armed)return; armed=false;
  document.getElementById('ft').textContent='Hit in '+Math.round(performance.now()-t0)+' ms. Try it bigger or closer.';
};
var foods=['Tacos','Ramen','Pizza','Pho','Curry','Burger','Sushi','Falafel','Paella','Pierogi','Bibimbap','Gyoza','Risotto','Kebab','Laksa','Poutine','Dal','Arepas','Tamales','Udon','Shakshuka','Ceviche','Goulash','Satay'];
var h0=0;
function n(){return parseInt(getComputedStyle(document.documentElement).getPropertyValue('--n'))||12}
document.getElementById('hs').onclick=function(){
  var k=n(), list=foods.slice(0,k).sort(function(){return Math.random()-.5}), m=document.getElementById('menu');
  m.innerHTML='';
  list.forEach(function(f){
    var b=document.createElement('button'); b.textContent=f;
    b.onclick=function(){ if(f!=='Tacos'||!h0)return;
      document.getElementById('ht').textContent='Found in '+Math.round(performance.now()-h0)+' ms among '+k+' choices.'; h0=0; };
    m.appendChild(b);
  });
  h0=performance.now(); document.getElementById('ht').textContent='Find Tacos…';
};
window.onVar=function(k){ if(k==='--n'){document.getElementById('menu').innerHTML='';document.getElementById('ht').textContent=n()+' choices. Press Shuffle.'} };`,
bad:{label:'A tiny checkout link far from the thumb, plus 9 equal choices.',html:`<div style="position:relative;height:150px;max-width:240px;border:1px solid #263042;border-radius:12px;padding:10px;font-size:11px;color:#A9B4C2"><div style="text-align:right;text-decoration:underline">checkout</div><div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:10px"><span style="border:1px solid #263042;padding:2px 5px">Std</span><span style="border:1px solid #263042;padding:2px 5px">Exp</span><span style="border:1px solid #263042;padding:2px 5px">Eco</span><span style="border:1px solid #263042;padding:2px 5px">Pick</span><span style="border:1px solid #263042;padding:2px 5px">Lock</span><span style="border:1px solid #263042;padding:2px 5px">Drone</span><span style="border:1px solid #263042;padding:2px 5px">Night</span><span style="border:1px solid #263042;padding:2px 5px">Sat</span><span style="border:1px solid #263042;padding:2px 5px">Sun</span></div></div>`},
good:{label:'Two clear choices, and a big primary button right under the thumb.',html:`<div style="position:relative;height:150px;max-width:240px;border:1px solid #263042;border-radius:12px;padding:10px;font-size:13px;display:flex;flex-direction:column;gap:8px"><div style="display:flex;gap:6px"><span style="flex:1;border:2px solid #7EF2C3;padding:6px;border-radius:8px;text-align:center">Standard</span><span style="flex:1;border:1px solid #263042;padding:6px;border-radius:8px;text-align:center">Express</span></div><div style="color:#A9B4C2;font-size:12px">More options ›</div><div style="margin-top:auto;background:#7EF2C3;color:#0D1016;font-weight:600;padding:12px;border-radius:10px;text-align:center">Checkout</div></div>`},
figma:[`Put a 44×44 "hit area" frame (no fill) behind small icons and make it part of the icon component.`,`Prototype progressive disclosure with variants: show 5 options, then a "More…" state.`,`Test on your phone with the Figma mobile app to feel thumb reach.`],
quiz:[
 {q:`By Fitts's law, which is fastest to click?`,options:[`A small button far away`,`A large button near the cursor`,`A medium link inside a paragraph`],answer:1,why:`large and near means a short movement onto a forgiving target.`},
 {q:`Your settings page has 40 toggles in one list. What does Hick's law suggest?`,options:[`Add 10 more`,`Group them into a few categories`,`Make them all red`],answer:1,why:`chunking cuts down the number of choices weighed at once.`}
]},
{
id:'affordance', level:'intermediate', title:'Affordances & Feedback', metaphor:'Doors & elevator buttons',
parable:`A door with a flat metal plate says "push". A door with a handle says "pull", yet some doors have handles and need pushing, and everyone walks into them. These are called Norman doors. Meanwhile, an elevator button that lights up when pressed is telling you: "I heard you, stop pressing." Interfaces need both: look clickable, and answer back.`,
theory:[`An affordance is what an object lets you do. A signifier is the visual hint that tells you: a shadow, an underline, the cursor.`,`Feedback: every action gets an immediate, visible response. Under 100ms feels instant.`,`Show system status (loading, success, error) so users are never left guessing.`,`Don't make non-interactive things look clickable.`],
controls:[
 {type:'select',label:'Signifier',options:[{label:'Plain text',vars:{'--btn-bg':'transparent','--btn-bd':'transparent','--btn-sh':'none','--btn-c':'#A9B4C2'}},{label:'Outlined',vars:{'--btn-bg':'transparent','--btn-bd':'#7EF2C3','--btn-sh':'none','--btn-c':'#7EF2C3'}},{label:'Solid & raised',vars:{'--btn-bg':'#7EF2C3','--btn-bd':'#7EF2C3','--btn-sh':'0 4px 0 #2f7d61','--btn-c':'#0D1016'}}]},
 {type:'select',label:'Feedback',options:[{label:'None',vars:{'--fb':'0'}},{label:'Press only',vars:{'--fb':'1'}},{label:'Press + status',vars:{'--fb':'2'}}]}
],
html:`<div class="panel">
  <p class="hint">Lobby · Floor G</p>
  <button id="call">Call elevator</button>
  <p id="status" class="status"></p>
</div>`,
css:`.panel{display:grid;gap:12px;justify-items:start;padding:24px;background:var(--raised);border-radius:12px;border:1px solid var(--line);max-width:340px}
.hint{margin:0;color:var(--ink2);font:12px 'JetBrains Mono'}
#call{padding:12px 20px;border-radius:10px;border:2px solid var(--btn-bd);background:var(--btn-bg);color:var(--btn-c);box-shadow:var(--btn-sh);font:600 15px 'IBM Plex Sans';cursor:pointer;transition:transform .08s,box-shadow .08s}
.fb #call:active{transform:translateY(3px);box-shadow:none}
#call.lit{outline:3px solid #FFC877;outline-offset:3px}
.status{margin:0;font:13px 'JetBrains Mono';color:var(--mint);min-height:1.5em}`,
js:`function fb(){return parseInt(getComputedStyle(document.documentElement).getPropertyValue('--fb'))||0}
var b=document.getElementById('call'), s=document.getElementById('status'), busy=false, clicks=0;
window.onVar=function(){document.body.classList.toggle('fb',fb()>=1);s.textContent='';b.classList.remove('lit');clicks=0};
b.onclick=function(){
  clicks++; var f=fb();
  if(f===0){s.style.color='#A9B4C2';s.textContent=clicks>1?'(pressed '+clicks+' times… did it work?)':'';return}
  b.classList.add('lit'); if(f===1||busy)return;
  busy=true; var fl=6; s.style.color='#7EF2C3'; s.textContent='Elevator coming: floor 6…';
  var iv=setInterval(function(){ fl--; s.textContent=fl>0?'Elevator coming: floor '+fl+'…':'Arrived. Doors opening.';
    if(fl<=0){clearInterval(iv);busy=false;b.classList.remove('lit')} },500);
};
window.onVar();`,
bad:{label:'Underlined text that isn\'t a link, and a "button" that looks like a label.',html:`<div style="display:grid;gap:10px;font-size:14px"><span style="color:#7FD4FF;text-decoration:underline">Free shipping on orders over $40</span><span style="color:#A9B4C2">Continue</span></div>`},
good:{label:'Links look like links, and buttons look pressable.',html:`<div style="display:grid;gap:10px;font-size:14px;justify-items:start"><span style="color:#A9B4C2">Free shipping on orders over $40</span><span style="background:#7EF2C3;color:#0D1016;font-weight:600;padding:9px 16px;border-radius:8px;box-shadow:0 3px 0 #2f7d61">Continue</span><span style="color:#7FD4FF;text-decoration:underline">Shipping policy</span></div>`},
figma:[`Build buttons as a component with variants: State = Default / Hover / Pressed / Loading / Disabled.`,`In Prototype mode, use "While pressing" → Change to the Pressed variant for tactile feedback.`,`Chain "After delay" interactions to fake loading → success states.`],
quiz:[
 {q:`What is a "Norman door"?`,options:[`A door whose design signals the wrong action`,`A revolving door`,`An automatic door`],answer:0,why:`its signifier (a handle) suggests pull when you actually need to push.`},
 {q:`A user clicks Save and nothing visible happens for 3 seconds. What's the best fix?`,options:[`Nothing`,`Show a pressed state and a spinner, then a confirmation`,`Play a sound only`],answer:1,why:`immediate visual feedback plus status keeps users from double-clicking.`}
]},
{
id:'responsive', level:'intermediate', title:'Responsive Flexbox & Grid', metaphor:'Moving furniture',
parable:`When you move from a big house into a studio flat, you don't saw the sofa in half. You rearrange: the shelf goes against another wall, the table folds away, things stack. Flexbox and Grid are your movers. They rearrange content so it fits any room, which on the web means any screen.`,
theory:[`Flexbox works in one direction (row or column). Items grow, shrink and wrap.`,`Grid works in two dimensions. repeat(auto-fit, minmax(…)) adds and removes columns automatically.`,`Design mobile-first, then add space as screens get larger.`,`Avoid fixed widths. Use max-width, min(), and clamp().`],
controls:[
 {type:'range',label:'Room width',var:'--room',min:200,max:640,step:10,unit:'px',value:480},
 {type:'select',label:'Layout',options:[{label:'Rigid row',vars:{'--display':'flex','--wrap':'nowrap','--cols':'none','--flex':'0 0 140px'}},{label:'Flex wrap',vars:{'--display':'flex','--wrap':'wrap','--cols':'none','--flex':'1 1 120px'}},{label:'Grid auto-fit',vars:{'--display':'grid','--wrap':'nowrap','--cols':'repeat(auto-fit, minmax(110px, 1fr))','--flex':'initial'}}]},
 {type:'range',label:'gap',var:'--gap',min:0,max:32,step:4,unit:'px',value:12}
],
html:`<div class="room">
  <div class="f">Sofa</div><div class="f">Table</div><div class="f">Lamp</div>
  <div class="f">Bookshelf</div><div class="f">Armchair</div><div class="f">Plant</div>
</div>
<p class="cap">Drag “Room width” to move into a smaller flat.</p>`,
css:`.room{width:var(--room);display:var(--display);flex-wrap:var(--wrap);grid-template-columns:var(--cols);gap:var(--gap);padding:12px;border:2px solid #7FD4FF;border-radius:12px;background:#121a26;transition:width .2s}
.f{flex:var(--flex);min-height:60px;display:grid;place-items:center;border-radius:8px;background:#2C2547;border:1px solid #4a3f7a;font:500 13px 'JetBrains Mono'}
.f:nth-child(2n){background:#1F3B33;border-color:#2f6b57}
.cap{color:var(--ink2);font-size:13px}`,
js:``,
bad:{label:'A fixed 520px row in a small screen gets cut off.',html:`<div style="width:220px;overflow:hidden;border:2px solid #FF8A8A;border-radius:8px;padding:6px"><div style="display:flex;gap:6px;width:520px"><div style="flex:0 0 120px;height:50px;background:#2C2547;border-radius:6px"></div><div style="flex:0 0 120px;height:50px;background:#1F3B33;border-radius:6px"></div><div style="flex:0 0 120px;height:50px;background:#2C2547;border-radius:6px"></div></div></div>`},
good:{label:'An auto-fit grid reflows to however much room there is.',html:`<div style="width:220px;border:2px solid #7EF2C3;border-radius:8px;padding:6px;display:grid;grid-template-columns:repeat(auto-fit,minmax(90px,1fr));gap:6px"><div style="height:50px;background:#2C2547;border-radius:6px"></div><div style="height:50px;background:#1F3B33;border-radius:6px"></div><div style="height:50px;background:#2C2547;border-radius:6px"></div></div>`},
figma:[`Auto layout is basically Flexbox: direction, gap, padding and alignment map 1:1 to CSS.`,`Set children to "Fill container" (flex:1) or "Hug contents" (auto), and turn on Wrap for flex-wrap.`,`Set min and max widths on frames, then resize them to stress-test the layout.`],
quiz:[
 {q:`Cards should fill the row and drop to fewer columns as the screen shrinks, with no media queries. Use…`,options:[`float:left`,`grid-template-columns: repeat(auto-fit, minmax(200px,1fr))`,`position:absolute`],answer:1,why:`auto-fit + minmax creates as many columns as fit.`},
 {q:`What's the difference between Flexbox and Grid?`,options:[`Flex handles one axis; Grid handles rows and columns together`,`They are identical`,`Grid only works on mobile`],answer:0,why:`Flexbox lays out one dimension, Grid lays out two.`}
]},
{
id:'z-index', level:'intermediate', title:'z-index & Stacking Contexts', metaphor:'Plates on cafeteria trays', scene:'stack',
legend:[{c:'#7EF2C3',t:'Plate A (in the tray)'},{c:'#B9A3FF',t:'Plate B (in the tray)'},{c:'#FFC877',t:'Plate C (outside)'},{c:'#7FD4FF',t:'Tray = stacking context'}],
parable:`In a cafeteria, you stack plates on trays. If tray 2 sits on top of tray 1, even the highest plate on tray 1 can never end up above anything on tray 2. The tray decides first. z-index works the same way: elements stack inside their "tray" (a stacking context), and the trays stack against each other.`,
theory:[`z-index only applies to positioned elements (relative, absolute, fixed, sticky) and to flex or grid children.`,`With equal z-index, whichever comes later in the HTML paints on top.`,`A parent with a non-auto z-index, opacity below 1, a transform, or isolation:isolate creates a new tray (stacking context).`,`Children can never escape their tray: z-index:9999 inside a low tray still loses to a higher tray.`],
controls:[
 {type:'range',label:'A z-index',var:'--za',min:-1,max:5,step:1,unit:'',value:3},
 {type:'range',label:'B z-index',var:'--zb',min:-1,max:5,step:1,unit:'',value:1},
 {type:'range',label:'C z-index',var:'--zc',min:-1,max:5,step:1,unit:'',value:2},
 {type:'select',label:'Tray around A & B',options:[{label:'No tray (auto)',vars:{'--trayz':'auto','--trayline':'none','--traybg':'transparent'}},{label:'Tray z-index: 1',vars:{'--trayz':'1','--trayline':'2px dashed #7FD4FF','--traybg':'rgba(127,212,255,.06)'}}]}
],
html:`<div class="stage">
  <div class="tray">
    <div class="plate a">A · z <b id="la"></b></div>
    <div class="plate b">B · z <b id="lb"></b></div>
  </div>
  <div class="plate c">C · z <b id="lc"></b></div>
</div>
<p id="order" class="out"></p>`,
css:`.stage{position:relative;height:230px;max-width:360px}
.tray{position:relative;z-index:var(--trayz);height:170px;width:250px;outline:var(--trayline);background:var(--traybg);border-radius:14px}
.plate{position:absolute;width:150px;height:100px;border-radius:14px;padding:10px;font:600 13px 'JetBrains Mono';color:#0D1016;box-shadow:0 8px 24px rgba(0,0,0,.55)}
.a{left:10px;top:10px;background:#7EF2C3;z-index:var(--za)}
.b{left:80px;top:55px;background:#B9A3FF;z-index:var(--zb)}
.c{left:150px;top:100px;background:#FFC877;z-index:var(--zc)}
.out{font:13px 'JetBrains Mono';color:var(--ink2)}`,
js:`function v(k){return getComputedStyle(document.documentElement).getPropertyValue(k).trim()}
function srt(a){return a.sort(function(x,y){return x[1]-y[1]||x[2]-y[2]}).map(function(x){return x[0]})}
function update(){
  var za=+v('--za'), zb=+v('--zb'), zc=+v('--zc'), t=v('--trayz'), order;
  document.getElementById('la').textContent=za; document.getElementById('lb').textContent=zb; document.getElementById('lc').textContent=zc;
  if(t==='auto'){ order=srt([['A',za,0],['B',zb,1],['C',zc,2]]); }
  else { var inner=srt([['A',za,0],['B',zb,1]]); order=(+t>zc)?['C'].concat(inner):inner.concat(['C']); }
  document.getElementById('order').textContent='bottom → top:  '+order.join(' → ')+(t==='auto'?'':'   (A & B are stuck in their tray)');
}
window.onVar=update; update();`,
bad:{label:'z-index wars: numbers keep growing until nobody knows why.',html:`<pre style="margin:0;font:12px/1.6 'JetBrains Mono';color:#A9B4C2">.header   { z-index: 999; }
.dropdown { z-index: 9999; }
.modal    { z-index: 99999; }
.toast    { z-index: 2147483647; } <span style="color:#FF8A8A">/* help */</span></pre>`},
good:{label:'A small, named scale, with isolation:isolate on components.',html:`<pre style="margin:0;font:12px/1.6 'JetBrains Mono';color:#A9B4C2">:root {
  --z-dropdown: 10;
  --z-sticky:   20;
  --z-modal:    30;
  --z-toast:    40;
}
.card { isolation: isolate; } <span style="color:#7EF2C3">/* own tray */</span></pre>`},
figma:[`The Layers panel is your z-order: higher in the list means on top.`,`Frames act like trays. A child can't render above a sibling frame that sits higher in the list.`,`Use Cmd/Ctrl + ] and [ to move a layer forward or backward.`],
quiz:[
 {q:`Card A has z-index:999 inside a parent with z-index:1. Sibling C (outside) has z-index:2. Which is on top?`,options:[`A`,`C`],answer:1,why:`A is trapped in its parent's tray, and that tray (1) is below C (2).`},
 {q:`Which of these does NOT create a stacking context?`,options:[`opacity: 0.9`,`transform: translateX(0)`,`isolation: isolate`,`margin: 10px`],answer:3,why:`margin has no effect on stacking.`}
]},
/* ───────────── ADVANCED ───────────── */
{
id:'a11y', level:'advanced', title:'Accessibility (WCAG)', metaphor:'Curb cuts',
parable:`Curb cuts, the little ramps at street corners, were built for wheelchair users. Today parents with strollers, travelers with suitcases and kids on bikes use them every day. Accessible design is a curb cut: built for some, better for everyone.`,
theory:[`Perceivable: provide text alternatives and enough contrast, and never rely on color alone.`,`Operable: everything works with a keyboard, with a visible focus ring.`,`Understandable: use real labels (not placeholder-only) and clear error messages.`,`Robust: semantic HTML (button, label, nav) lets assistive tech understand the page. To test, put the mouse away and press Tab.`],
controls:[
 {type:'select',label:'Labels',options:[{label:'Placeholder only',vars:{'--label':'none'}},{label:'Real labels',vars:{'--label':'block'}}]},
 {type:'select',label:'Focus ring',options:[{label:'Removed',vars:{'--ring':'none'}},{label:'Visible',vars:{'--ring':'3px solid #FFC877'}}]},
 {type:'select',label:'Vision simulation',options:[{label:'None',vars:{'--filter':'none'}},{label:'Blur',vars:{'--filter':'blur(1.5px)'}},{label:'Grayscale',vars:{'--filter':'grayscale(1)'}}]}
],
html:`<form class="f" onsubmit="event.preventDefault()">
  <label for="e">Email</label>
  <input id="e" placeholder="Email">
  <label for="p">Password</label>
  <input id="p" type="password" placeholder="Password">
  <p class="err">⚠ Password must be 8+ characters</p>
  <button>Sign in</button>
</form>
<p class="tip">Click inside the form, then press Tab.</p>`,
css:`.f{display:grid;gap:8px;max-width:300px;filter:var(--filter)}
label{display:var(--label);font-size:13px;color:var(--ink2);margin-top:4px}
input{padding:10px 12px;border-radius:8px;border:1px solid #3a4862;background:#0D1016;color:var(--ink);font:14px 'IBM Plex Sans'}
input::placeholder{color:#5d6a80}
input:focus,button:focus{outline:var(--ring);outline-offset:2px}
.err{margin:0;color:#FF8A8A;font-size:13px}
button{margin-top:8px;padding:11px;border-radius:8px;border:none;background:#7EF2C3;color:#0D1016;font:600 14px 'IBM Plex Sans'}
.tip{font:12px 'JetBrains Mono';color:var(--ink2)}`,
js:``,
bad:{label:'An icon-only div. Screen readers say nothing, and it can\'t be reached with the keyboard.',html:`<div style="display:flex;gap:8px;align-items:center"><div style="width:36px;height:36px;border-radius:8px;background:#263042;display:grid;place-items:center;color:#5d6a80">⌕</div><span style="color:#3A4558;font-size:13px">search…</span></div>`},
good:{label:'A real button with a visible label, focusable and announced.',html:`<div style="display:flex;gap:8px;align-items:center"><span style="padding:8px 14px;border-radius:8px;background:#263042;color:#E6EDF3;outline:3px solid #FFC877;outline-offset:2px;font-size:14px">⌕ Search</span><span style="color:#A9B4C2;font:12px 'JetBrains Mono'">&lt;button aria-label…&gt;</span></div>`},
figma:[`Use plugins like Stark, or a focus-order annotation kit, to mark tab order and check contrast.`,`Add a "Focus" variant to every interactive component so developers build the ring.`,`Write alt text and accessible names in Dev Mode annotations.`],
quiz:[
 {q:`Why is placeholder-only labeling a problem?`,options:[`It disappears while typing and is often low-contrast`,`It's slow`,`It breaks CSS`],answer:0,why:`once you type, the hint is gone, and placeholder text usually fails contrast.`},
 {q:`What's the fastest accessibility smoke test?`,options:[`Use only the keyboard (Tab, Enter, Space)`,`Make the logo bigger`,`Add more animation`],answer:0,why:`keyboard-only use reveals missing focus states, traps, and fake buttons.`}
]},
{
id:'figma-components', level:'advanced', title:'Figma Auto Layout & Components', metaphor:'The cookie cutter',
parable:`A baker uses one cookie cutter to make a hundred cookies. Change the cutter's shape, and tomorrow's whole batch changes. That's a Figma component: one main, many instances. Auto layout is the baking tray that spaces the cookies evenly and grows when you add one more.`,
theory:[`The main component (◆) defines the design. Instances (◇) inherit from it and can override text or colors locally.`,`Variants group states and sizes into one component set (Size=S/M/L, State=Hover).`,`Auto layout has direction, gap, padding, alignment, and Hug or Fill sizing. It's essentially CSS Flexbox.`,`Component properties (boolean, text, instance swap) keep instances flexible without detaching them.`],
controls:[
 {type:'select',label:'Direction',options:[{label:'Horizontal →',vars:{'--dir':'row'}},{label:'Vertical ↓',vars:{'--dir':'column'}}]},
 {type:'range',label:'Gap',var:'--gap',min:0,max:40,step:4,unit:'px',value:12},
 {type:'range',label:'Padding',var:'--pad',min:0,max:40,step:4,unit:'px',value:16},
 {type:'select',label:'Children',options:[{label:'Hug contents',vars:{'--fill':'0 0 auto','--w':'max-content'}},{label:'Fill container',vars:{'--fill':'1 1 0','--w':'100%'}}]},
 {type:'select',label:'Main component color',options:[{label:'Mint',vars:{'--main':'#7EF2C3'}},{label:'Lilac',vars:{'--main':'#B9A3FF'}},{label:'Amber',vars:{'--main':'#FFC877'}}]}
],
html:`<div class="frame">
  <div class="cookie">◇ Cookie</div>
  <div class="cookie">◇ Cookie</div>
  <div class="cookie">◇ Cookie</div>
</div>
<button id="add">+ Add instance</button>
<pre id="css"></pre>`,
css:`.frame{display:flex;flex-direction:var(--dir);gap:var(--gap);padding:var(--pad);width:var(--w);max-width:100%;border:1px dashed #B9A3FF;border-radius:10px;background:rgba(185,163,255,.06);transition:all .2s}
.cookie{flex:var(--fill);padding:10px 14px;border-radius:999px;background:var(--main);color:#0D1016;font:600 13px 'JetBrains Mono';text-align:center;white-space:nowrap;transition:background .3s}
#add{margin:12px 0;padding:8px 14px;border-radius:8px;border:1px solid var(--line);background:var(--raised);color:var(--ink);font:500 13px 'IBM Plex Sans';cursor:pointer}
pre{font:12px/1.55 'JetBrains Mono';color:var(--ink2);background:#0D1016;padding:12px;border-radius:8px;border:1px solid var(--line);margin:0}`,
js:`function v(k){return getComputedStyle(document.documentElement).getPropertyValue(k).trim()}
function update(){
  document.getElementById('css').textContent=
    '/* Figma auto layout → CSS */\\n.frame {\\n  display: flex;\\n  flex-direction: '+v('--dir')+';\\n  gap: '+v('--gap')+';\\n  padding: '+v('--pad')+';\\n}\\n.cookie { flex: '+v('--fill')+'; } /* '+(v('--fill').indexOf('1 1')===0?'Fill container':'Hug contents')+' */';
}
document.getElementById('add').onclick=function(){var f=document.querySelector('.frame');f.appendChild(f.firstElementChild.cloneNode(true))};
window.onVar=update; update();`,
bad:{label:'Detached copies: each one drifted a little in color, radius and padding.',html:`<div style="display:flex;gap:7px;flex-wrap:wrap"><span style="background:#7EF2C3;color:#0D1016;padding:8px 12px;border-radius:999px;font-size:12px">Save</span><span style="background:#6fe0b2;color:#0D1016;padding:7px 14px;border-radius:6px;font-size:12px">Save</span><span style="background:#8ff7cf;color:#0D1016;padding:9px 10px;border-radius:12px;font-size:13px">save</span></div>`},
good:{label:'Instances of one main component, consistent everywhere.',html:`<div style="display:flex;gap:8px;flex-wrap:wrap"><span style="background:#7EF2C3;color:#0D1016;padding:8px 14px;border-radius:999px;font-size:12px">Save</span><span style="background:#7EF2C3;color:#0D1016;padding:8px 14px;border-radius:999px;font-size:12px">Save</span><span style="background:#7EF2C3;color:#0D1016;padding:8px 14px;border-radius:999px;font-size:12px">Save</span></div>`},
figma:[`Select layers and press Shift+A to add Auto layout.`,`Press Cmd/Ctrl+Alt+K to create a component, then "Combine as variants" to build a set.`,`Add component properties (Text, Boolean, Instance swap) instead of near-duplicate variants.`],
quiz:[
 {q:`You need to change the button color across 120 screens. What do you do?`,options:[`Edit each one`,`Edit the main component once`,`Screenshot and recolor`],answer:1,why:`every instance inherits from the main component.`},
 {q:`Auto layout's "Fill container" is closest to which CSS?`,options:[`flex: 1`,`position: absolute`,`float: right`],answer:0,why:`Fill grows to take the remaining space, just like flex: 1.`}
]},
{
id:'state', level:'advanced', title:'JS Events & State', metaphor:'The vending machine',
parable:`A vending machine only does what its current state allows. No coins? The buttons do nothing. Enough coins? Pick a snack. Dispensing? Please wait. Each button press is an event, and the machine checks its state before deciding what happens. Your UI is a vending machine.`,
theory:[`Events (click, input, keydown) are how users talk to you. Listeners respond to them.`,`State is the data that describes what's true right now: credit, selection, status.`,`Render from state. Update the state, then redraw the UI from it, never the other way round.`,`Model states explicitly (idle → paying → dispensing) so impossible combinations can't happen.`],
controls:[
 {type:'range',label:'Snack price (¢)',var:'--price',min:50,max:300,step:25,unit:'',value:150},
 {type:'select',label:'Event log',options:[{label:'On',vars:{'--log':'block'}},{label:'Off',vars:{'--log':'none'}}]}
],
html:`<div class="vm">
  <div class="screen" id="screen"></div>
  <div class="snacks" id="snacks"></div>
  <div class="coins"><button data-c="25">+25¢</button><button data-c="100">+$1</button><button id="refund">Refund</button></div>
  <div class="tray" id="tray"></div>
</div>
<pre id="log"></pre>`,
css:`.vm{max-width:320px;padding:16px;border-radius:16px;background:#1A2130;border:1px solid var(--line);display:grid;gap:12px}
.screen{font:600 14px 'JetBrains Mono';color:#7EF2C3;background:#0D1016;padding:10px 12px;border-radius:8px}
.snacks{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.coins{display:flex;gap:8px}
button{padding:10px;border-radius:8px;border:1px solid var(--line);background:#131821;color:var(--ink);font:500 13px 'IBM Plex Sans';cursor:pointer}
button:disabled{opacity:.4;cursor:not-allowed}
.tray{min-height:20px;font:13px 'JetBrains Mono';color:#FFC877}
#log{display:var(--log);font:12px/1.5 'JetBrains Mono';color:var(--ink2);max-height:120px;overflow:auto;background:#0D1016;padding:10px;border-radius:8px;max-width:320px}`,
js:`var state={status:'idle',credit:0,price:150,out:''};
var snacks=['Chips','Cookie','Gum','Pretzels'];
function money(c){return '$'+(c/100).toFixed(2)}
function log(m){var l=document.getElementById('log');l.textContent='› '+m+'\\n'+l.textContent}
function set(patch,why){Object.assign(state,patch);log(why+'  →  '+state.status+', credit '+money(state.credit));render()}
function render(){
  var busy=state.status==='dispensing';
  document.getElementById('screen').textContent=busy?'Dispensing…':state.credit>=state.price?'Credit '+money(state.credit)+': pick a snack':'Insert '+money(state.price-state.credit);
  var box=document.getElementById('snacks'); box.innerHTML='';
  snacks.forEach(function(n){var b=document.createElement('button');b.textContent=n+' · '+money(state.price);b.disabled=busy||state.credit<state.price;b.onclick=function(){buy(n)};box.appendChild(b)});
  document.querySelectorAll('.coins button').forEach(function(b){b.disabled=busy});
  document.getElementById('tray').textContent=state.out;
}
function buy(n){
  set({status:'dispensing',credit:state.credit-state.price,out:''},'click '+n);
  setTimeout(function(){var ch=state.credit;set({status:'idle',credit:0,out:'Enjoy your '+n+(ch?' · change '+money(ch):'')},'dispensed')},900);
}
document.querySelectorAll('[data-c]').forEach(function(b){b.onclick=function(){set({credit:state.credit+Number(b.dataset.c),status:'paying',out:''},'insert '+b.dataset.c+'¢')}});
document.getElementById('refund').onclick=function(){set({out:state.credit?'Returned '+money(state.credit):'',credit:0,status:'idle'},'refund')};
window.onVar=function(k,v){if(k==='--price')set({price:parseInt(v)},'price set')};
render();`,
bad:{label:'The DOM is the source of truth, so the logic reads text back out of the screen.',html:`<pre style="margin:0;font:12px/1.6 'JetBrains Mono';color:#A9B4C2">btn.onclick = () => {
  let c = parseInt(screen.innerText.slice(1));
  if (screen.innerText.includes('$')) ...
  <span style="color:#FF8A8A">// what state are we even in?</span>
}</pre>`},
good:{label:'One state object, events update it, and render() redraws.',html:`<pre style="margin:0;font:12px/1.6 'JetBrains Mono';color:#A9B4C2">const state = { status: 'idle', credit: 0 };
coin.onclick = () => {
  state.credit += 25;
  render();            <span style="color:#7EF2C3">// UI = f(state)</span>
};</pre>`},
figma:[`Model screens as variants (Idle / Paying / Dispensing) and wire them with prototype interactions.`,`Use Variables (number, boolean) to hold real state like credit in a prototype.`,`Combine "Set variable" on click with conditionals ("if credit ≥ price") to prototype logic without code.`],
quiz:[
 {q:`Where should "number of items in the cart" live?`,options:[`In a state variable the UI renders from`,`Only in the DOM text`,`In a CSS class`],answer:0,why:`state is the single source of truth, and the UI is drawn from it.`},
 {q:`The Buy button still works while dispensing, causing double charges. What's the fix?`,options:[`Check the state and disable actions that aren't valid in it`,`Click more slowly`,`Add more listeners`],answer:0,why:`explicit states guard against impossible actions.`}
]},
{
id:'motion', level:'advanced', title:'Motion & Easing', metaphor:'Elevators & braking',
parable:`A good elevator doesn't teleport, and it doesn't slam to a stop either. It eases gently into your floor. A good driver brakes smoothly rather than at a constant rate. Motion that starts fast and settles slowly feels natural, because things in the real world have mass and friction.`,
theory:[`Duration: 150–250ms for small UI, 250–400ms for panels. Past about 500ms it starts to feel sluggish.`,`Use ease-out for things entering, ease-in for things leaving, and ease-in-out for things moving across the screen.`,`Linear motion feels robotic. Save it for spinners and progress bars.`,`Animate transform and opacity (cheap for the GPU), and respect prefers-reduced-motion.`],
controls:[
 {type:'range',label:'Duration',var:'--dur',min:0,max:2000,step:50,unit:'ms',value:400},
 {type:'select',label:'Easing',options:[{label:'linear',vars:{'--ease':'linear'}},{label:'ease-out',vars:{'--ease':'cubic-bezier(.2,.8,.2,1)'}},{label:'ease-in-out',vars:{'--ease':'cubic-bezier(.65,0,.35,1)'}},{label:'spring',vars:{'--ease':'cubic-bezier(.34,1.56,.64,1)'}}],default:1}
],
html:`<div class="wrap">
  <div class="shaft"><div class="car" id="car"></div></div>
  <div class="floors"><button data-f="3">3</button><button data-f="2">2</button><button data-f="1">1</button><button data-f="0">G</button></div>
  <div class="side">
    <button id="drawer">Toggle drawer</button>
    <div class="drawer" id="d">Settings drawer<br><small>slides in with your easing</small></div>
  </div>
</div>`,
css:`.wrap{display:flex;gap:24px;flex-wrap:wrap;align-items:flex-start}
.shaft{position:relative;width:80px;height:240px;border:1px solid var(--line);border-radius:10px;background:repeating-linear-gradient(#131821 0 59px,#263042 59px 60px)}
.car{position:absolute;left:8px;right:8px;bottom:4px;height:52px;border-radius:8px;background:#7EF2C3;transform:translateY(calc(var(--floor,0) * -60px));transition:transform var(--dur) var(--ease)}
.floors{display:grid;gap:8px}
button{padding:10px 14px;border-radius:8px;border:1px solid var(--line);background:var(--raised);color:var(--ink);font:600 13px 'JetBrains Mono';cursor:pointer}
.side{display:grid;gap:12px;width:200px;overflow:hidden;padding-bottom:4px}
.drawer{padding:16px;border-radius:10px;background:#2C2547;border:1px solid #4a3f7a;transform:translateX(-110%);opacity:0;transition:transform var(--dur) var(--ease),opacity var(--dur) var(--ease)}
.drawer.open{transform:none;opacity:1}
small{color:var(--ink2)}`,
js:`var car=document.getElementById('car');
document.querySelectorAll('[data-f]').forEach(function(b){b.onclick=function(){car.style.setProperty('--floor',b.dataset.f)}});
document.getElementById('drawer').onclick=function(){document.getElementById('d').classList.toggle('open')};`,
bad:{label:'Linear and slow, like a robot on a conveyor belt.',html:`<style>@keyframes mb{0%,15%{transform:translateX(0)}70%,100%{transform:translateX(150px)}}</style><div style="width:200px;height:40px;border:1px solid #263042;border-radius:8px;position:relative"><div style="position:absolute;top:6px;left:6px;width:28px;height:28px;border-radius:6px;background:#FF93B5;animation:mb 2.4s linear infinite"></div></div>`},
good:{label:'Ease-out: a quick start that settles gently.',html:`<style>@keyframes mg{0%,15%{transform:translateX(0)}50%,100%{transform:translateX(150px)}}</style><div style="width:200px;height:40px;border:1px solid #263042;border-radius:8px;position:relative"><div style="position:absolute;top:6px;left:6px;width:28px;height:28px;border-radius:6px;background:#7EF2C3;animation:mg 2.4s cubic-bezier(.2,.8,.2,1) infinite"></div></div>`},
figma:[`Use Smart Animate between variants, with "Ease out" at 200–300ms for entering elements.`,`Try the Spring presets (Gentle, Quick, Bouncy) for playful UI.`,`Document motion tokens (motion/fast = 150ms, motion/base = 250ms) for developers.`],
quiz:[
 {q:`A dropdown menu is opening. Which easing fits best?`,options:[`ease-out (fast start, gentle stop)`,`ease-in (slow start, abrupt stop)`,`linear`],answer:0,why:`entering elements should arrive quickly and settle.`},
 {q:`Which property is cheapest to animate?`,options:[`width`,`top`,`transform`],answer:2,why:`transform skips layout and is GPU-composited.`}
]},
{
id:'tokens', level:'advanced', title:'Design Tokens & Theming', metaphor:'The spice rack',
parable:`In a well-run kitchen, every spice jar is labeled and always lives in the same spot. Recipes say "a pinch of salt", not "grains from the third jar on the left". Design tokens are those labeled jars: color-accent, space-16, radius-md. Change what's in a jar, and every recipe that uses it updates.`,
theory:[`Tokens are named design decisions: color, type, spacing, radius, shadow, motion.`,`Layer them: primitive (mint-300) → semantic (color-action) → component (button-bg).`,`Themes (dark, light, brand) swap the values and keep the names.`,`In code, tokens are CSS custom properties. In Figma, they're Variables with Modes. Keep one source of truth.`],
controls:[
 {type:'select',label:'Theme (mode)',options:[{label:'Terminal',vars:{'--t-bg':'#131821','--t-surface':'#1A2130','--t-ink':'#E6EDF3','--t-accent':'#7EF2C3','--t-on':'#0D1016','--t-line':'#263042'}},{label:'Paper',vars:{'--t-bg':'#EDE8DC','--t-surface':'#FFFDF8','--t-ink':'#1D1B16','--t-accent':'#2B59C3','--t-on':'#FFFFFF','--t-line':'#D6CDBA'}},{label:'Candy',vars:{'--t-bg':'#2A1B3D','--t-surface':'#3A2654','--t-ink':'#FFF4FB','--t-accent':'#FF93B5','--t-on':'#2A1B3D','--t-line':'#56407a'}}]},
 {type:'range',label:'radius token',var:'--t-radius',min:0,max:24,step:2,unit:'px',value:10},
 {type:'range',label:'space token',var:'--t-space',min:4,max:14,step:2,unit:'px',value:8}
],
html:`<div class="app">
  <div class="card">
    <h3>Order #2048</h3>
    <p>Your parcel is on the way.</p>
    <input value="Leave at the door">
    <div class="row"><button class="primary">Track</button><button>Details</button></div>
  </div>
</div>
<pre id="tok"></pre>`,
css:`.app{background:var(--t-bg);padding:calc(var(--t-space) * 3);border-radius:12px;transition:background .3s}
.card{background:var(--t-surface);color:var(--t-ink);border:1px solid var(--t-line);border-radius:var(--t-radius);padding:calc(var(--t-space) * 3);display:grid;gap:calc(var(--t-space) * 1.5);max-width:320px;transition:all .3s}
h3{margin:0}
p{margin:0}
input{padding:calc(var(--t-space) * 1.25);border-radius:calc(var(--t-radius) * .6);border:1px solid var(--t-line);background:var(--t-bg);color:var(--t-ink);font:inherit}
.row{display:flex;gap:var(--t-space)}
button{padding:var(--t-space) calc(var(--t-space) * 2);border-radius:calc(var(--t-radius) * .6);border:1px solid var(--t-line);background:transparent;color:var(--t-ink);font:600 14px 'IBM Plex Sans'}
.primary{background:var(--t-accent);color:var(--t-on);border-color:var(--t-accent)}
pre{font:12px/1.6 'JetBrains Mono';color:var(--ink2);margin:14px 0 0}`,
js:`function v(k){return getComputedStyle(document.documentElement).getPropertyValue(k).trim()}
function update(){document.getElementById('tok').textContent=['--t-accent','--t-surface','--t-radius','--t-space'].map(function(k){return k+': '+v(k)+';'}).join('\\n')}
window.onVar=update; update();`,
bad:{label:'Hard-coded values scattered across every file.',html:`<pre style="margin:0;font:12px/1.6 'JetBrains Mono';color:#A9B4C2">.btn    { background: #7EF2C3; border-radius: 9px; }
.badge  { background: #7ef1c4; border-radius: 10px; }
.link   { color: #80F2C2; }
<span style="color:#FF8A8A">/* three "mints". which is right? */</span></pre>`},
good:{label:'Semantic tokens: one jar, used everywhere.',html:`<pre style="margin:0;font:12px/1.6 'JetBrains Mono';color:#A9B4C2">:root { --color-action: #7EF2C3; --radius-md: 10px; }
.btn   { background: var(--color-action); border-radius: var(--radius-md); }
.badge { background: var(--color-action); }
<span style="color:#7EF2C3">/* change once → everywhere */</span></pre>`},
figma:[`In the Local variables panel, create collections (Primitives, Semantic) and add Modes (Dark, Light) for themes.`,`Bind fills, gaps, radius and padding to variables using the variable icon in each field.`,`Sync variables to code via a plugin or the Variables REST API so your CSS custom properties match.`],
quiz:[
 {q:`What's the best token name for the main button background?`,options:[`#7EF2C3`,`mint-green-light`,`color-action-primary`],answer:2,why:`semantic names describe purpose, so the value can change without renaming.`},
 {q:`To add dark mode with tokens, you…`,options:[`Rewrite every component`,`Swap token values under a theme or mode`,`Duplicate the site`],answer:1,why:`themes swap values and keep the names.`}
]}
];
window.UX_LESSONS.forEach(function(l,i){ l.n=i+1; });
