# ux.lab · by sha-labs

An interactive learning world for UI/UX and frontend. Lessons live in **provinces** on a 3D world map, joined by one highway loop:

- **Pixelia · UI/UX Province**: 15 lessons in three districts (Beginner, Intermediate, Advanced).
- **Frontera · Frontend Province**: 10 lessons in **React City** and **Vue City**, with React and Vue playgrounds and a 3D component tree that reacts to your code.

Every lesson starts from an everyday story and ends in a live playground you can edit (HTML/CSS/JS, JSX or Vue templates). The **Night Shift** design system page documents the visual language.

- **Bilingual**: switch between 🇮🇩 **ID** (Bahasa Indonesia) and 🇺🇸 **ENG** (English) from the header. The choice is saved in `localStorage` (`uxlab.lang`).
- **Progress** is saved in `localStorage` (`uxlab.done`).
- Plain static site, no build step. Works on GitHub Pages.

## Structure

```
index.html            Learning Lab (hub + lesson view, hash routing: #/ and #/lesson/{id})
design-system.html    Night Shift design system page
css/tokens.css        design tokens (CSS custom properties)
css/app.css           shared styles
js/i18n.js            UI strings (ID/ENG) + language switcher
js/lessons.js         Pixelia lessons + playground code (English, from the design handoff)
js/lessons.id.js      Indonesian translations of the Pixelia lessons
js/lessons-frontend.js     Frontera lessons (React City, Vue City)
js/lessons-frontend.id.js  Indonesian translations of the Frontera lessons
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

Everything is generated in code (no model files). Two provinces sit on either side of a river, joined by a single highway loop with bridges; every side street meets the highway at both ends, so no road dead-ends. Use the **Pixelia / Frontera / Whole map** buttons to fly between them.

- **Pemula**: a friendly kampung with gable-roof houses, trees and lantern strings.
- **Menengah**: a city of setback towers with water tanks, antennas and a sha-labs billboard.
- **Mahir**: a futuristic downtown with hex towers, spinning holo rings, spires and searchlights.
- **Kota React**: towers of stacked component modules joined by glowing seams, around a giant spinning React atom.
- **Kota Vue**: terraced garden towers around a standing Vue logo.
- Lit windows, neon number signs, bloom glow, fog, floating particles in the logo colors, street lamps, a mirrored floor (desktop only), cars, drones with a spotlight.
- Completed lessons light up with brighter windows and a light pillar. Clicking a building flies the camera in before opening the lesson.
- `prefers-reduced-motion` turns off auto-rotation, traffic and the camera flight.

## Frontend playgrounds

React and Vue lessons load the library from unpkg inside the playground iframe (React 18 + Babel standalone for JSX, Vue 3 global build). A small helper is injected:

- `useControl(name, fallback)` (React) / `controlRef(name, fallback)` (Vue) read the controls on the left.
- `ux.tree(nodes)`, `ux.render(id)` and `ux.flow(from, to, kind)` drive the 3D component tree next to the preview.

To add a province later (for example backend), add it to `PROVINCES` and `LEVELS` in `js/app.js`, give it a layout in `DISTRICTS` / `PROVINCES` in `js/scenes.js`, and extend the `LOOP` highway around it.
