# Rosa V5.6 — Spatial Flow Theme · Product-wide implementation specification

**Status:** Design direction approved for implementation; **not** a shipped React theme.
**Canonical visual reference:** `public/rosa-v5-6/index.html` on branch `preview/rosa-v5-6`.
**Functional baseline:** `src/pages/assessment-flow.tsx` (V4) on `main`.
**Target:** New selectable **Rosa V5.6 full assessment journey** in the existing React/TypeScript/shadcn/Tailwind application.

> **Critical distinction:** The standalone HTML is a **design reference only**. A Vercel-served copy of that HTML (or an iframe, static `public/` route, or pasted DOM) is **NOT** the deliverable. The deliverable is a **reusable, semantic Spatial Flow theme applied consistently to every screen and overlay of the actual assessment application**.

## 1. What “theme” means here

Implement a proper reusable design language, not a one-off screen:
- **Tokens:** named roles for backgrounds, foregrounds, surfaces, borders, focus rings, shadows, radii, typography, spacing, states, and motion.
- **Primitives / components:** `SpatialSurface`, `SpatialAssessmentHeader`, `SpatialProgress`, `SpatialActionButton`, `SpatialChoice`, `SpatialEvidenceComposer`, `SpatialSectionSheet`, `SpatialStatus`, and consistent typography patterns. Name freely but avoid copy-paste styling.
- **Screen layouts:** Assignments/List; Overview; **Live Assessment**; Review; Sign-off; all dialogs/sheets and empty/error/offline states.
- **Theming architecture:** use the existing semantic shadcn/ui token layer and additional scoped `--spatial-*` variables where necessary. Scope by `[data-assessment-version="5"]` / `.flow-v5` and also theme the portalled overlays. Do not globally overwrite Creator theme, Theme Studio or V2/V3/V4 appearance.
- **Implementation:** functional React components with existing data and validation. Preserve shadcn Buttons, Radios, Card, Badge, Sheet, Textarea primitives where appropriate.

## 2. Exact visual direction and tokens (from approved V5.6 HTML)

### Visual character
**Spatial Flow** = calm/lavender canvas, tactile near-white panels, delicate glow and elevation, iris focus/selection, restrained visual motion and strong typography.

Reference values / starting CSS aliases (adjust tiny contrast issues rather than blindly copying):
| Semantic role | Reference |
| --- | --- |
| Spatial canvas | `#f3f0fb`; within phone subtle gradient from `#f8f7fd` toward `#efedf8` / `#f0eef9` |
| Foreground/ink | `#242339` |
| Muted body copy | `#76748c` / `#7c7791` |
| Iris interactive accent | `#7363bd` |
| Iris deep | `#6453b0` |
| Selected outline / segmented progress | `#8272cf` / `#8978cf` |
| Main CTA / Next dark surface | `#28253c` |
| Card/elevated surface | `#ffffff` → `#fdfcff` → `#f9f7ff` gentle linear gradient |
| Default response surface | `#f9f8fd` |
| Selection surface | `#f1edff` |
| Global hairline border | `#e8e5f0` |
| Response border | `#e6e4ef` |
| Input/composer border | `#ded9ea` |
| Badge Preparation | surface `#f0edfa`, text `#6555a9` |
| Badge Critical | surface `#fff1e2`, text `#ad6738` |
| Pass/Fault outcome signaling | green `#427764` / red `#b96572` used only when semantically meaningful; **progress uses iris, not green** |
| Focus-visible ring | `#9482ed` with adequate thickness and offset |

Font: **Inter Variable** (existing project already has `@fontsource-variable/inter`). Strong headlines (~24–29 px on medium mobile, line-height ~1.18, tracking -0.9 px), readable body (~15–16 px), secondary descriptions (~15 px), response labels (~15 px bold), badge/counter (~11 px). Adapt fluidly to larger accessible text. Avoid font import from Google if bundled Inter is available.

### Geometry / materials
- Primary live assessment card radius **25–28 px**; 1 px fine light border and broad, **soft** ambient shadow (reference `0 22px 46px #51458027` plus subtle near shadow). Ambient depth must not produce a thick outline or crowded stacked-card illusion.
- Choice row radius **18 px**, touch height **>= 68–76 px** on typical mobile (decrease only cautiously for short viewports); choice selection has ~1 px iris border + subtle halo, filled radio/check.
- Inline evidence composer radius **17 px**; camera touch target **>= 44px** where feasible (reference was 43 px; adjust up for accessibility).
- Header Back button ~44–46 px, radius ~15 px. Footer buttons radius ~15 px, height ~55 px, Sections icon-only target 54 px on regular mobile, 48 px on narrow mobile.
- Badges radius ~9 px. Backgroundless header/footer: **no white panel, backdrop blur, footer bar, visible container border or hard shadow**; only buttons and the elevated central card own surfaces.
- Shadows and glow must be subtle and largely static; avoid bright decorative gradients behind text or excessive translucent text panels.

### Structural rhythm / spacing
- Use a deliberate 4/8 px spacing scale with local overrides: header 14–16 px vertical; header progress ~14–15 px after title row; main gutter ~12–17 px; card padding ~21–25 px; badges → headline ~24 px; headline → description ~24 px; description → responses ~23 px; answer stack gap ~13 px with two actions; evidence composer ~22 px after the choices.
- These values are **visual starting points from V5.6** and may be tightened after mobile screenshot QA. Never solve space shortages by clipping text or overlapping the footer.

## 3. Approved V5.6 interaction layout (highest fidelity target)

### Compact assessment header
- On **one row**: **Back icon to Overview** (top-level) | **Fryer Station** (primary title) | Dre avatar/label.
- Directly beneath: **11-segment ultra-thin progress** running the full available width, with iris completion and muted incomplete segments. NO visible "2 of 11" secondary counter in header; NO persistent "Automatically Saved", timer, Save or Pause.
- Header and global footer are **transparent on the same lavender canvas**. Show *save failure / pending sync* status only when actually relevant and based on real persistence. Avoid false "synced" promises.

### Live question card
- **One criterion at a time.** Preparation/Frying/Completion badge, conditional Critical badge, compact `02 / 11` position indicator. Big question, short instruction/subcopy.
- **Only TWO constant choices: Pass and Fail**. Same vertical order and positions on every criterion; **never Needs coaching** (this is superseded V5.0/V4 behavior).
- Choice selected state should be unmistakable with outline, radio, label and gentle response animation; no default choice, no automatic advancement.
- If previously saved draft contains `coaching`, **do not silently convert to Fail or Pass**. Preserve the original value for old-version data and treat as unanswered in V5 with explicit re-selection, or use an explicit version migration policy.
- Under the choices, **always visible, optional inline Comment textarea** with **camera action embedded in the composer** (lower right). Show a small removable attachment chip/thumbnail when a photo is recorded. Preserve real capture flow, file metadata, and per-criterion association where already supported.
- **Entire live card is the only scrollable card content region**, with no visible scrollbar track. Comment and camera **are NOT fixed**: they scroll naturally after answers, because optional evidence should not reserve mandatory screen space. Do not restore earlier anchored evidence footers or split scrolling.
- On short devices, header/footer remain in view while content scrolls within the card. Keyboard focus must bring textarea into view without overlaying it.

### Footer priority (latest V5.6)
- **Back**: wide labeled secondary button, left, white surface and chevron.
- **Sections**: small **icon-only** tertiary control, centered (~54px), accessible text `aria-label="Sections"`.
- **Next**: wide dark primary button, right, with arrow.
- Typical footer grid: `minmax(0,1fr) 54px minmax(0,1.09fr)` (narrow ~48px middle; smaller gaps).
- No solid footer background. Do not confuse footer Back (previous criterion) with header Back (Overview); label, description, keyboard behavior and focus state must distinguish.
- Next requires criterion response and required evidence in accordance with existing business rules; no unexpected auto-next.

## 4. Full journey theming — all screens, not just the live view

| Screen or system state | Required V5.6 application |
| --- | --- |
| **Assignments / entry** | Spatial assignment tile/card, status and employee hierarchy, tactile entry/resume CTA, suitable empty/saved states. |
| **Overview** | Lavender canvas, premium elevated content surfaces, badges/goal group/people data/sections preview and strong Start/Resume action. Avoid permanent timers and manual Save. |
| **Live assessment** | Match approved V5.6 faithfully, including header, progress, 2 choices, full-card scroll, inline composer and footer priority. |
| **Sections & jump navigation** | Spatial, responsive shadcn Sheet/Drawer with same backgrounds, typography, chip/status/row tokens and purposeful opening motion. Preserve section and criterion status semantics and direct jump. |
| **Photo / notes** | Inline comment with embedded camera on live screen; actual attachment and preview/remove experience must be themed in the same language. Required evidence warnings readable and actionable. |
| **Review** | Summary tiles for **Pass / Fail / Incomplete** (no Needs Coaching), grouped lists with criterion answers, critical indication, evidence summary, edit links, missing warnings, and consistent spatial layers. |
| **Sign-off / finish** | Same form surfaces, hierarchy, CTA treatment, confirmation states and state handling. Differentiate recorded observation, signature, pending sync and final server confirmation; don't invent unverified identity or manager sign-off. |
| **Global** | Offline/pending sync/save failure/validation/loading/empty/toast/dialog; large device layout; focus, keyboard, reduced motion; design-system theme preview / usage examples as appropriate. |

Do **not** replace V4 business logic with HTML demo code. The raw HTML reference has simulated photo behavior and is **not** evidence of production persistence, backend validation, real sign-off or upload/sync.

## 5. Motion as theme tokens (functional feedback, not theatrics)

Motion should be included as a reusable layer, not scattered magic values:
- Answer press feedback `120–180ms` scale/compression + selected radio fill; no page jump.
- Question content next/back directional entrance `~300–380ms`; keep header/footer stable, never animate large chrome that Rosa relies on.
- Progress completion `~200–330ms` iris transition; update only for valid/assessed criteria and not for Pass exclusively.
- Sheet `~250–320ms` overlay/slide; focus managed on open/close and background noninteractive.
- Review transition `~300–400ms` subtle.
- No looping background motion, bounce, pulse, confetti, expensive blur on every button, or automatic next. Respect `prefers-reduced-motion:reduce` and ensure all state changes are perceivable without motion.

## 6. React/shadcn architecture requirements

1. Add true V5 route e.g. `?version=5` via `src/App.tsx` (and VersionSwitcher). Build/compose actual full-flow React screen(s), not HTML injection or iframe.
2. Create **V5 scoped theme variables** in `src/styles/spatial-theme.css` (or another clear theme module) using semantic roles, with shadcn mappings only within V5. Place optional high-level `SpatialThemeProvider` or root `data-visual-theme="spatial"` so Drawer/Sheet portals inherit visual tokens. Avoid global stylesheet collisions.
3. Reuse `src/data/flow-draft.ts` and existing validation, draft, keyboard/scroll, focus and evidence hooks. Keep separate V5 draft key. Preserve V2/V3/V4 behavior and storage.
4. Build reusable pieces for header, progress, card, answer, evidence composer, footer, section/status rows, summary/review, and overlays. Expose a lightweight **V5 theme showcase / token reference** in the repo (can be a Storybook-like page or simple catalog) so the designer can compare components/states.
5. Avoid modifying global Creator theme unless a genuine shared improvement is required and regression-safe. Support neutral client-brand adaptability: isolate brand-alias variables so lavender/iris can be replaced by customer tokens without rebuilding screens.
6. Preserve shadcn semantic state, accessibility and **actual actions**, especially form controls and evidence/media capture; do not invent camera functionality.
7. Treat existing V5.6 standalone HTML in `public/rosa-v5-6` as **historical design reference** only. A hosted HTML preview is not completion of this task.

## 7. Validation / deliverables

- [ ] Main application exposes new V5 theme & full journey; older version comparison works.
- [ ] All **five** journey steps + all sheets, alerts and edge states look related through reusable tokens/components.
- [ ] V5 live screen screenshot visually matches approved V5.6 at **320, 375, 390, 419 px** with no clipped header, answers or footer.
- [ ] Full-card scrolling + hidden scrollbar preserved; Comment/camera inside scrolling card; header/footer backgrounds transparent.
- [ ] Only Pass/Fail; section/critical; title/subcopy; two distinct Back destinations; new footer priority.
- [ ] Autosave works; no false sync claims; no invalid certification / signoff before legitimate confirmation; failed/partial must be reviewed appropriately.
- [ ] Keyboard, screen reader, focus return after Sheet, photo handling, touch targets, zoom and reduced motion tested.
- [ ] Tests include route/version isolation, 2-choice outcomes, progress, navigation, required evidence, offline/local saving, review & sign-off. No silent coaching mapping.
- [ ] `npm run build`, `npm run lint`, `npm test` pass. Provide real screenshots from all five React screens and a component/token gallery.
- [ ] Preview deployment on Vercel hosts **the actual React V5 app**, not only `/rosa-v5-6/index.html`. Do not replace live production without explicit approval.
- [ ] Produce UX decision changelog **English first, Portuguese second**, clearly labeling decisions implemented vs proposed, ready for the Word document.

**Next step for Codex:** inspect the reference HTML and current React code, briefly explain the component architecture and scope, implement on a dedicated branch and open a **draft PR**. Do not merge to `main` automatically.
