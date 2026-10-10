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
js/scenes.js          three.js scenes (world map, box model, z-index stack)
js/app.js             routing, rendering, playground engine, quiz, progress
assets/img/           sha-labs logo + favicon
```

## Run locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

three.js is loaded from unpkg and fonts from Google Fonts, so an internet connection is needed.
