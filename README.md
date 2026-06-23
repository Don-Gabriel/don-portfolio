# J. Don Gabriel — J.A.R.V.I.S. Portfolio

An Iron-Man-style **holographic HUD** portfolio. An arc reactor boots up, JARVIS
comes online, and the work lives in glowing system panels you navigate like Tony
Stark in the lab — cyan-and-gold HUD, scanning lines, a targeting reticle that
tracks the cursor, animated diagnostics, generative music.

Pure **React + DOM + CSS + Canvas2D** — no WebGL, no flicker, tiny bundle.

## Make it yours

Everything is generated from one file — [`src/data/universe.ts`](src/data/universe.ts) —
or edited visually in the **Admin** page. Edit `IDENTITY` and each section's
entities; project cover art is generated automatically.

## Run it — two pages, one command

```bash
npm install      # once
npm run dev
```

| Page | URL | What |
|---|---|---|
| **Portfolio** | http://localhost:5173/ | the JARVIS HUD (what visitors see) |
| **Admin** | http://localhost:5173/admin | command center to edit everything |

Production:

```bash
npm run build    # → dist/
npm run preview  # serve the build
```

WebGL is not required (works on any modern browser). Music starts on first click
(browsers block autoplay) — toggle with the **♪** control.

## Navigation

- Left rail (bottom bar on mobile): **Home · Systems · Matrix · Career ·
  Academy · Honors · Comms**.
- **Systems** → click a project for a full diagnostic readout.
- **Matrix** → animated skill bars. **Comms** → email, socials, résumé.

## How the Admin works

The Command Center edits a copy of your data and **saves to the browser's
localStorage**, which the portfolio reads on load (instant on the same browser).
To make changes permanent: **Data & Backup → Download universe.json**, keep it as
a backup or paste it into `src/data/universe.ts`. **Reset** restores defaults.

## Architecture

```
src/
  main.tsx              # route split: / (portfolio) vs /admin
  data/universe.ts      # single source of truth (+ localStorage override loader)
  state/useJarvis.ts    # HUD UI state (zustand)
  jarvis/
    JarvisApp.tsx       # the HUD: rail, views, project detail, contact
    Reactor.tsx         # SVG arc reactor
    Background.tsx      # Canvas2D energy field
    Boot.tsx            # power-up / diagnostics sequence
    Reticle.tsx         # cursor targeting reticle
    jarvis.css          # the whole HUD look
  art/cover.ts          # procedural project cover art (canvas, no stock images)
  audio/AudioEngine.ts  # generative background music (Web Audio, no files)
  admin/AdminApp.tsx    # the command center
```

## Deploy

Static SPA in `dist/`. Vercel (`vercel.json`) / Netlify (`netlify.toml`) configs
included, or serve `dist/` anywhere. Both `/` and `/admin` work.

## Tech

React 18 · TypeScript · Zustand · Vite · Canvas2D · SVG · Web Audio · custom CSS.
