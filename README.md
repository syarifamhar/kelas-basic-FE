# ux.lab · by sha-labs

An interactive UI/UX learning lab: 15 lessons (Beginner → Advanced), each starting from an everyday story and ending in a live playground you can edit (HTML/CSS/JS), plus a 3D "world map" hub and the **Night Shift** design system page.

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
js/lessons.js         lesson content + playground code (English, from the design handoff)
js/lessons.id.js      Indonesian translations of the lesson text
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

Everything is generated in code (no model files):

- **Pemula**: a friendly kampung with gable-roof houses, trees and lantern strings.
- **Menengah**: a city of setback towers with water tanks, antennas and a sha-labs billboard.
- **Mahir**: a futuristic downtown with hex towers, spinning holo rings, spires and searchlights.
- Lit windows, neon number signs, bloom glow, fog, floating particles in the logo colors, street lamps, a mirrored floor (desktop only), cars, drones with a spotlight.
- Completed lessons light up with brighter windows and a light pillar. Clicking a building flies the camera in before opening the lesson.
- `prefers-reduced-motion` turns off auto-rotation, traffic and the camera flight.
