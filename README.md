# ux.lab · by sha-labs

An interactive learning world for UI/UX and frontend, shown as a 3D map: **world → city → district → lesson**. Two cities are joined by one highway loop:

- **Pixelia · UI/UX City**
  - **Principia** (UI/UX theory, 13 lessons): the UX process, research & personas, user flows, hierarchy, Gestalt, color, type, spacing, Fitts & Hick, affordances, accessibility, motion, usability heuristics.
  - **Vectoria** (Figma, 5 lessons): frames & layers, auto layout & components, variables & tokens, prototyping & Smart Animate, Dev Mode & handoff.
- **Frontera · Frontend City**
  - **Foundry** (HTML · CSS · JavaScript, 7 lessons): HTML semantics, selectors & the cascade, the box model, flexbox & grid, z-index, JavaScript & the DOM, events & state.
  - **React District** (5 lessons) and **Vue District** (5 lessons), with real React/Vue playgrounds.

Every lesson starts from an everyday story, **explains the idea with a 3D model that follows the controls**, and ends in a live playground you can edit.

- **Bilingual**: switch between 🇮🇩 **ID** and 🇺🇸 **ENG** in the header (saved in `localStorage` as `uxlab.lang`).
- **Progress** is saved in `localStorage` (`uxlab.done`).
- Plain static site, no build step. Works on GitHub Pages.

## Structure

```
index.html            Learning Lab (hub + lesson view, hash routing: #/ and #/lesson/{id})
design-system.html    Night Shift design system page
css/tokens.css        design tokens (CSS custom properties)
css/app.css           shared styles
js/i18n.js            UI strings (ID/ENG) + language switcher
js/lessons.js              original lessons + playground code (English, from the design handoff)
js/lessons-pixelia.js      new UX and Figma lessons
js/lessons-frontend.js     React and Vue lessons
js/lessons-foundry.js      new HTML / CSS / JS lessons
js/syllabus.js             which district each lesson belongs to, and the order (edit this to reorganize)
js/*.id.js                 Indonesian translations
js/explainers.js           the 3D explainer for each lesson (declarative: controls → 3D objects)
js/scenes.js          three.js scenes, ES module (neon city world map, box model, z-index stack)
js/app.js             routing, rendering, playground engine, quiz, progress
assets/img/           sha-labs logo + favicon
```

## Run locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

three.js (and its bloom/reflector addons) is loaded from unpkg through an import map, and fonts from Google Fonts, so an internet connection is needed. Open the site through a local server (not `file://`) because `js/scenes.js` is an ES module.

## The 3D world map

Everything is generated in code (no model files). The two cities sit on either side of a river, joined by a single highway loop with bridges. Each city also has its own ring road, and side streets cross each city to meet the ring and the highway at both ends, so no road dead-ends. Suburbs of houses, shophouses (ruko), apartments and trees fill the land around the highway (instanced meshes, so they stay cheap to draw). Use the **Pixelia / Frontera / Whole map** buttons to fly between cities.

- **Principia**: academy halls with columns and pediments around a domed temple.
- **Vectoria**: towers topped with Figma's shapes, around a 3D Figma logo.
- **Foundry**: workshops with sawtooth roofs and smoking chimneys, tinted orange (HTML), blue (CSS) and yellow (JS), around three glowing pillars.
- **React**: stacked component modules around a spinning atom. **Vue**: terraced garden towers around the V logo.
- Lit windows, neon number signs, bloom glow, fog, floating particles in the logo colors, street lamps, a mirrored floor (desktop only), cars, drones with a spotlight.
- Completed lessons light up with brighter windows and a light pillar. Clicking a building flies the camera in before opening the lesson.
- `prefers-reduced-motion` turns off auto-rotation, traffic and the camera flight.

## Frontend playgrounds

React and Vue lessons load the library from unpkg inside the playground iframe (React 18 + Babel standalone for JSX, Vue 3 global build). A small helper is injected:

- `useControl(name, fallback)` (React) / `controlRef(name, fallback)` (Vue) read the controls on the left.
- `ux.tree(nodes)`, `ux.render(id)` and `ux.flow(from, to, kind)` drive the 3D component tree next to the preview.

## 3D explainers

`js/explainers.js` holds one small function per lesson that turns the lesson's controls into a list of 3D objects (`{ id, shape, p, s, c, label, … }`). The engine (`makeExplain` in `js/scenes.js`) keeps one object per id and animates it to its new position, size, color and opacity whenever the controls change, like React for 3D. Playgrounds can also send their state (`ux.state({...})`), which the vending-machine lesson uses.

## Adding a city later (for example backend)

Add the city to `PROVINCES` and its districts to `LEVELS` in `js/app.js`, list the lessons in `js/syllabus.js`, give the districts and city a place in `DISTRICTS`, `CITIES` and `RINGS` in `js/scenes.js`, and extend the `LOOP` highway around it.
