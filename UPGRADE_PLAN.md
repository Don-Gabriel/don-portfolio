# UPGRADE_PLAN.md — J.A.R.V.I.S. Portfolio

> Goal: take the existing Iron-Man HUD from "very good custom build" to **premium,
> HUD-grade, reactive JARVIS**. Layer on top of what already works — keep the arc
> reactor, scan-lines, reticle, generative audio, boot sequence and procedural
> cover art. Do **not** genericize.

---

## 0. Project Map (as-built)

**Stack**
- React 18 + TypeScript, Vite 5, Zustand for HUD state. No CSS framework — all
  hand-written CSS. No WebGL.
- Two routes from one bundle, split in `src/main.tsx`: `/` (portfolio HUD) and
  `/admin` (content command-center). Lazy-loaded.
- Single source of truth for content: `src/data/universe.ts` (+ localStorage
  override loader written by the Admin page).
- Deploy configs: `vercel.json`, `netlify.toml`. Fonts loaded in `index.html`
  (Orbitron, Rajdhani, Space Grotesk, JetBrains Mono).

**Pages / sections (all client-rendered, no router lib — view = Zustand `module`)**

| Module | Label | Component | Content source |
|---|---|---|---|
| `home` | Home | `Home()` | `IDENTITY` |
| `projects` | Systems | `Projects()` (card grid) | `galaxy('projects')` — 7 projects |
| `skills` | Matrix | `Skills()` (animated bars) | `galaxy('knowledge')` — 5 clusters |
| `experience` | Career | `RowsView()` | `galaxy('experience')` |
| `education` | Academy | `RowsView()` | `galaxy('education')` |
| `achievements` | Honors | `RowsView()` | `galaxy('achievements')` |
| `contact` | Comms | `Contact()` | `IDENTITY.socials` |
| (overlay) | Detail | `Detail()` | clicked project/entity |
| `/admin` | Command Center | `src/admin/AdminApp.tsx` (729 lines) | edits universe → localStorage |

**Animation inventory (what powers what, where it lives, what triggers it)**

| Effect | Tech | Trigger | File |
|---|---|---|---|
| Boot / power-up diagnostics log | React state + `setTimeout` chain; CSS opacity fade | mount, once (skippable) | `jarvis/Boot.tsx`, `.boot*` in `jarvis.css` |
| Arc reactor (rotating rings + pulsing core) | SVG + CSS `@keyframes spin`/`corepulse` | always-on | `jarvis/Reactor.tsx`, `.rg-*`/`.r-core` |
| Energy-field particles + cursor links | Canvas2D + `requestAnimationFrame` | always-on, reacts to pointer | `jarvis/Background.tsx` (`.hud-canvas`) |
| Targeting reticle, "hot" lock on hover | DOM + rAF follow, class toggle | pointermove | `jarvis/Reticle.tsx`, `.reticle*` |
| Scan-line sweep | CSS `@keyframes scan` | always-on | `.hud-scan` |
| Grid backdrop + radial mask + vignette | CSS gradients | static | `.hud-grid`, `.hud-vignette` |
| View enter (fade+blur+rise) | CSS `@keyframes viewin` | on module change (`key={module}`) | `.view`, `.detail` |
| Skill bars fill | CSS `@keyframes fillin` (scaleX) | on Matrix view mount | `.bar .fill` |
| Status LED blink, JARVIS cursor blink | CSS `@keyframes blink` | always-on | `.brand .led`, `.cursor` |
| JARVIS line typewriter | React state interval | on module change | `JarvisLine()` |
| Live clock | `setInterval` 1s | always-on | `TopBar()` |
| Card hover lift | CSS `transform/box-shadow` transition | hover | `.card:hover` |
| Procedural cover art | Canvas2D, seeded, cached → dataURL | on render | `art/cover.ts` |
| Generative ambient score | Web Audio API, mood per module | first click; module change | `audio/AudioEngine.ts`, `components/AudioController.tsx` |

**Verdict:** there is **no animation library installed** — everything is hand-rolled
CSS/rAF/JS. `framer-motion` is **not** in `package.json`. The brief's "existing
framer-motion" assumption is incorrect; the real animation system is bespoke and
genuinely good. Plan: **add** framer-motion for orchestration/choreography that CSS
can't express cleanly (staggered lists, shared-layout detail open, exit animations,
gesture springs) **without removing** the existing CSS/Canvas effects.

**Housekeeping found:** stray zero-byte files in repo root from a mis-pasted shell
command — `16)`, `2.5`, `8)`, `intensity'`, `real`, `x.id`. These are untracked
junk and will be deleted.

---

## 1. Design-System Audit (via UI/UX Pro Max)

Skill matched the project to **Cyberpunk / HUD / sci-fi** style + **Portfolio Grid**
pattern — exactly the current identity, so direction is confirmed, not redirected.
Below: where it's already strong, and where it falls short of premium HUD-grade.

### Strong ✅
- **Identity & cohesion.** Cyan `#4fe3ff` + gold `#ffc24d` on `#04070f`, Orbitron
  display / Rajdhani UI / JetBrains mono — disciplined and on-theme. Clip-path
  bevelled buttons & cards read as "panel hardware," not web buttons.
- **Atmosphere.** Layered backdrop (radial + masked grid + scan + vignette) +
  Canvas particle field + always-on reactor = real depth and a "living machine" feel.
- **Signature moments.** Boot sequence, generative audio, reticle, procedural covers
  are distinctive and hard to copy. This is the soul — protect it.

### Falls short of premium ⚠️
1. **Tokens are ad-hoc.** One spacing system isn't defined — paddings are magic rems
   (`5.2rem`, `2.4rem`, `1.2rem`…). No type scale, no radius/elevation/`z-index`
   scale. Repeated `rgba(79,227,255,…)` literals instead of cyan-alpha tokens.
2. **`z-index` soup.** Values 0–101 scattered; UX guidance flags arbitrary stacking.
   Needs a named scale (backdrop/content/rail/overlay/boot/reticle).
3. **Motion lacks orchestration.** Each effect is independent; entrances don't
   **stagger** (cards/rows/bars all appear at once). No **exit** animations (detail
   overlay & view changes pop out). No spring physics — all `ease`/cubic-bezier.
4. **No `prefers-reduced-motion` path** — HIGH severity a11y gap. Scan-line, reactor
   spin, particle field, typewriter all run regardless.
5. **Accessibility holes.** `cursor:none` everywhere hurts keyboard users; no visible
   `:focus-visible` rings; icon-only rail buttons use glyphs without `aria-label`;
   the detail overlay isn't a focus-trapped dialog and lacks `Esc` close; emoji/glyph
   icons (`⌂ ◳ ⊞ ✦ ♪`) instead of SVG (skill anti-pattern).
6. **Micro-interactions are shallow.** Hover = simple lift/opacity. No magnetic
   buttons, no reactive glow tracking the cursor, no press feedback, no sound-coupled
   hover, no number count-ups on metrics, no tactile rail "lock-on."
7. **Home is static.** The hero name/tagline just fade in via `.view`. For the
   centerpiece it should choreograph (reactor charge → title decrypt → chips stagger).
8. **Component gaps.** No skeleton/loading states, no toast/status feedback, no
   command-palette (very on-brand for JARVIS), no scanning "data readout" treatment
   on metrics, no glitch/decrypt text effect the Cyberpunk style calls for.
9. **Perf foot-guns.** Particle field + reticle each run their own rAF; `box-shadow`
   transitions on cards; large blur on overlay; no `content-visibility`; no pause of
   loops when tab hidden or during boot.

---

## 2. Prioritized Upgrade Plan

Effort: **S** ≤30min · **M** ~1–2h · **L** ~half-day. Each numbered group = one commit.

### P0 — Foundation (do first; everything else builds on it)
- **S1. Design tokens & cleanup** *(M)* — Add a token layer in `jarvis.css`
  (`:root`): spacing scale (`--s-1…--s-8`), type scale, radius, cyan/gold alpha
  ramps, elevation shadows, and a named `--z-*` scale. Add `prefers-reduced-motion`
  global guard. Delete stray root junk files. *No visual change yet — just the
  substrate.*
- **S2. Install framer-motion + motion primitives** *(S)* — Add dependency; create
  `src/jarvis/motion.ts` with shared variants (stagger container, `fadeRise`,
  `decrypt`, spring presets) and a `useReducedMotionSafe` hook so every animation has
  one source of truth and an a11y off-switch.

### P1 — Signature polish (highest visual ROI)
- **S3. Choreographed Home hero** *(M)* — framer-motion timeline: reactor settles →
  role line wipes in → name does a **decrypt/scramble** reveal → tagline → chips
  **stagger** → CTA buttons spring. Keeps existing `Reactor`.
- **S4. Staggered content entrances** *(M)* — Wrap Systems grid, Career/Academy/Honors
  rows, and Matrix groups in motion stagger containers; cards rise+settle in sequence
  instead of one block. Replace `.view` blur-pop with motion `AnimatePresence` so
  views also **exit**.
- **S5. Detail overlay → real dialog with shared-layout** *(M)* — `AnimatePresence`
  enter/exit, spring scale-in, backdrop fade; make it a focus-trapped `role="dialog"`
  with `Esc` to close and restore focus. Optional `layoutId` morph from card → panel.
- **S6. SVG icon set** *(M)* — Replace glyph icons in the rail and buttons with a tiny
  inline SVG set (HUD-styled: home, systems, matrix, career, academy, honors, comms,
  sound, close, download, external). Adds `aria-label`s. Removes emoji anti-pattern.

### P2 — Micro-interactions (the "reactive feel")
- **S7. Reactive buttons & cards** *(M)* — Cursor-tracking glow (radial-gradient
  follows pointer via CSS vars), magnetic pull on primary CTAs, press/tap spring,
  and sound-coupled hover blips (reuse `getAudio().blip`). Rail buttons get a
  "lock-on" bracket animation on hover/active.
- **S8. Live data readouts** *(M)* — Count-up animation on all `.metric` values and
  skill `%`; animate skill bars with framer-motion `whileInView` + a subtle scanning
  shimmer; add a faint per-card "SYS-OK" telemetry tag. Reinforces the diagnostics fiction.
- **S9. Decrypt/scramble text utility** *(S)* — Reusable `<Scramble>` for section
  titles and the JARVIS line, matching Cyberpunk "terminal decrypt" effect; respects
  reduced-motion (renders final text instantly).

### P3 — New components via /ui + JARVIS dressing
- **S10. Command palette (⌘K / "J")** *(L)* — On-brand JARVIS command input to jump
  modules, open projects, toggle sound, download résumé. Generated via `/ui`, then
  re-skinned to HUD tokens. Big perceived-premium win.
- **S11. Boot sequence upgrade** *(M)* — Add a progress/charge bar tied to the reactor,
  per-line typing cursor, subtle CRT power-on flash on handoff; keep skip. framer
  exit so the HUD "powers in."
- **S12. Status/toast layer** *(S)* — Tiny HUD toasts ("CHANNEL OPEN", "RÉSUMÉ
  DOWNLOADED", "SOUND ONLINE") for feedback on actions; auto-dismiss, stacked,
  reduced-motion aware.

### P4 — Accessibility & Performance hardening
- **S13. A11y pass** *(M)* — `:focus-visible` HUD rings everywhere; keep custom
  reticle but restore real cursor + focus outlines for keyboard/touch; `aria-label`s
  on icon buttons; dialog semantics (from S5); skip-to-content; verify contrast.
- **S14. Perf pass** *(M)* — Pause Background particle rAF + reactor when tab hidden
  (`visibilitychange`) and during boot; throttle reticle to one shared rAF;
  `content-visibility:auto` on offscreen rows; drop `box-shadow` transitions in favor
  of layered pseudo-element opacity; lazy-init audio already good. Confirm bundle:
  framer-motion code-split so first paint stays fast.

### Out of scope (note only)
- Admin page restyle (functional, lower priority) — token pass only if time allows.
- Real résumé PDF at `/resume.pdf` (content task, not design).

---

## 3. Execution order & commits
1. S1+S2 → `chore(design): tokens, z-scale, reduced-motion, framer-motion base`
2. S3 → `feat(home): choreographed arc-reactor hero with decrypt reveal`
3. S4 → `feat(motion): staggered view entrances + AnimatePresence exits`
4. S5 → `feat(detail): shared-layout dialog with focus trap + Esc`
5. S6 → `feat(ui): HUD SVG icon set, drop emoji glyphs`
6. S7 → `feat(micro): reactive cursor-glow + magnetic + sound-coupled controls`
7. S8 → `feat(data): metric count-ups + scanning skill bars`
8. S9 → `feat(ui): decrypt/scramble text utility`
9. S10 → `feat(cmdk): JARVIS command palette`
10. S11 → `feat(boot): reactor charge bar + power-on handoff`
11. S12 → `feat(ui): HUD toast/status layer`
12. S13 → `a11y: focus-visible, dialog semantics, aria labels`
13. S14 → `perf: pause loops when hidden, content-visibility, lighter hovers`

Each step is additive and independently revertible; the existing CSS/Canvas/audio
systems stay intact throughout.
