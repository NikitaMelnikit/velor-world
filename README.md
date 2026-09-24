# VELOR — an interactive brand world

[![CI](https://github.com/NikitaMelnikit/velor-world/actions/workflows/ci.yml/badge.svg)](https://github.com/NikitaMelnikit/velor-world/actions/workflows/ci.yml)
![Next.js 16](https://img.shields.io/badge/Next.js-16-000?logo=nextdotjs)
![React Three Fiber](https://img.shields.io/badge/R3F-9-000?logo=threedotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white)

> Don't visit the brand. Enter it. — *Objects with a point of view.*

A digital museum, magazine, product platform and archive for a fictional design house,
built as one continuous space of rooms rather than a set of pages.

```
npm install
npm run dev        # http://localhost:3000
npm run build      # static production build (30 prerendered routes)
npm run typecheck  # tsc --noEmit
npm run lint       # eslint (next/core-web-vitals + typescript)
```

Stack: Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS 4 ·
GSAP + ScrollTrigger · Framer Motion · Lenis · three.js / React Three Fiber / drei · Zustand.

## The rooms

| Route | Room | What happens there |
| --- | --- | --- |
| `/` | 00 ENTRY | WebGL colonnade. Scroll moves the camera down the corridor, the wordmark splits into the architecture, the corridor ends at seven lit doors. |
| `/world` | 01 WORLD | A drawn plan of the brand: draggable, parallax layers, travelling light pulses, surfacing fragments, visited-room memory. |
| `/origin` | 02 ORIGIN | Six scroll scenes (Question → Brand), each with its own light, type and "sound". Every chapter leaves a fragment; they assemble into the mark. |
| `/objects` | 03 OBJECTS | One object at a time in its own environment (concrete / steel / wool / light). Rotate, zoom, disassemble, X-ray, change finish, compare materials, hotspots. |
| `/objects/[slug]` | OBJECT STORY | The object · why · how it was shaped · material · anatomy (scroll-driven disassembly) · details · dimensions · idea · step inside. |
| `/atelier` | 04 ATELIER | Six stages on a pinned horizontal bench, readable as PROCESS / MATERIAL / PEOPLE — the whole interface re-skins per lens. |
| `/materials`, `/materials/[slug]` | 05 MATERIAL LAB | Six specimens reacting to the pointer (reflection, refraction, reveal, deformation, grain, layers); each opens source / structure (zoomable scales) / tactility (tap sound) / application. |
| `/journal`, `/journal/[slug]` | 06 JOURNAL | Magazine index + seven stories with seven different layout systems (essay, interview, contact sheet, horizontal architecture, split manifesto, visual story, anatomy). |
| `/archive` | 07 ARCHIVE | 2022–2026 timeline; each year changes paper, ink and photographic process. Draggable prints, detail drawer, *The ideas we didn't build*. |
| `/future` | 08 FUTURE | Six interactive speculative prototypes. *Not everything here is meant to exist.* |
| `/collection` | COLLECTOR | Create a named collection; keep objects, materials, stories, projects, ideas and concepts; arrange them on a table; annotate. Persisted locally. |

## Architecture

```
src/
  app/                    routes (server components, static metadata, generateStaticParams)
  content/                the whole world as typed data — products, materials, journal, archive, rooms…
  components/
    providers/            AppProviders (composition), SmoothScroll (Lenis ⇄ GSAP ticker ⇄ ScrollTrigger)
    transition/           TransitionProvider (cover → route swap → reveal), TransitionLink, variants
    navigation/           Hud (instrument panel, tone-aware), MenuOverlay + Stage (content recedes)
    three/                ObjectViewer (R3F), LazyObjectViewer (lazy + GPU gate + drawn fallback), materials
    media/                Plate (procedural photography), MaterialTexture, ElevationDrawing
    sound/                Waveform (canvas), PulseClock + SoundToggle (optional synthesized audio)
    type/                 SplitReveal, Rise, SectionMark, Marquee, Label
    cursor/, collect/     contextual cursor; collect button + toast
  features/<room>/        room-specific experiences
  lib/                    gsap setup, pulse bus, ambient audio, zustand stores, palette, utils
  hooks/                  reduced motion, media queries, lazy mounting, pointer refs
```

### Key systems

- **One source of truth for objects.** Each product is a list of typed parts (geometry, material,
  layer, explode vector, note). The same data builds the 3D model, the disassembly, x-ray, hotspots,
  and every 2D drawing (sketch, blueprint with dimensions, solid elevation) via `ElevationDrawing`.
- **Page transitions** (`components/transition`). A click closes the current room, the router swaps
  content under an always-mounted overlay, then the next room opens. Room pairs have their own
  metamorphosis: OBJECTS→ATELIER *blueprint*, ATELIER→MATERIALS *texture*, MATERIALS→JOURNAL
  *photo*, ARCHIVE→FUTURE *prototype*, ENTRY→WORLD *dolly*, map → room *iris*; everything else
  passes through doors. Real `<a>` elements are kept, so prefetch, a11y and new-tab still work.
- **Sound without sound** (`lib/pulse.ts`). Every interaction emits a pulse; waveforms and meters
  read a decaying energy value on the shared GSAP ticker (no React re-renders). Real audio is
  optional, synthesized with WebAudio (no files), and only starts from the SOUND toggle.
- **HUD tone.** Sections declare `data-tone="light|dark"`; the HUD samples what is under it and
  switches ink, falling back to a difference blend.
- **Collection** (`lib/store.ts`). Zustand + persist, hydrated after mount to keep SSR markup stable.

### Performance

- One rAF loop: Lenis, ScrollTrigger, waveforms, specimens and canvases all run on `gsap.ticker`,
  and every loop pauses when off-screen or when the tab is hidden.
- three.js is code-split (`next/dynamic`, `ssr: false`) and only loaded where a scene exists;
  canvases stop rendering when not visible (`frameloop="never"`), adapt DPR via `PerformanceMonitor`,
  use instancing, procedural canvas textures and blob shadows instead of shadow maps.
- Zero image weight: imagery is procedural SVG (`Plate`, `MaterialTexture`), resolution-independent.
  Real photography can be introduced with `next/image` (AVIF/WebP configured in `next.config.ts`).
- Animations are transform/opacity based; scroll-linked values are written to CSS variables or refs,
  not React state.
- All routes are statically prerendered.

### Accessibility & resilience

- `prefers-reduced-motion`: Lenis off, transitions reduced to fades, the entry renders as still rooms,
  WebGL animation and autorotation disabled.
- WebGL is gated (`WebGLGate` + error boundary). Without it, every object falls back to its drawn
  elevation and the entry to a procedural architectural plate.
- Keyboard: skip link, focusable map nodes and hotspots, Esc closes overlays, ←/→ switch objects.
- Touch devices get their own model: no custom cursor, tap-to-select on the map, specimens that drift
  on their own, vertical Atelier, bottom-reachable controls.

## Replacing placeholder content

Everything lives in `src/content/*`. Swap copy, add products (parts + env + variants), materials,
articles (choose one of the seven layouts) or archive years without touching components.
