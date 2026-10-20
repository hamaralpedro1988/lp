# Spatial + Fluid: adaptive React themes

Fluid translates the uploaded [Adaptive Liquid Semantic V2 reference](reference.html) into the existing React/shadcn application. The reference is retained for review only; the application never embeds or executes it.

Base: `feat/rosa-criterion-guidance` at `59536c0`. Implementation: `feat/rosa-fluid-ui`. No merge or production deployment.

## Explore

Use `?version=5&brandDemo=1&visualTheme=fluid&brand=ocean`. Preview controls remain outside the phone. Visual theme and Customer branding are independent selectors. Omit `visualTheme` for the unchanged Spatial default. Neutral keeps the approved default identity (`brand=spatial`) for compatibility. New identities are `crimson` and `ocean`; old McDonald's/Burger King URLs remain supported.

Explorer: `?view=design-system&visualTheme=fluid&brand=ocean`. Foundations include shared semantic colors, actual resolved material/blur/elevation/motion values, typography, spacing and radii. Core UI and Rosa stories continue importing production components. Theme Studio and Component Playground remain separate working tools. Export includes shared semantics, selected theme and brand overrides.

## Architecture and decisions

- `semantic-tokens.css` is the immutable semantic layer, imported by Spatial and inherited by Fluid. Existing `--spatial-*` aliases deliberately remain: changing their names would introduce unnecessary component churn. Exact success/failure/warning/section/progress colors are unchanged.
- `spatial-theme.css` retains its existing styles. Only the semantic declarations moved to the shared file, without changing values.
- `fluid-theme.css` scopes materials to `html[data-assessment-version="5"][data-visual-theme="fluid"]`, including Radix portals. V2–V4 receive no overrides.
- Fluid uses the reference's neutral atmospheric canvas, two identity reflections, white reading-card gradient, layered blue-grey shadows, translucent navigation controls, reflected edges, pill navigation and frosted contextual sheet chrome. Text cards, answers, evidence composer, review observations and signature content stay opaque. Footer remains transparent.
- `spatial-brands.ts` centralizes customer identity, including Fluid reflections. Brands cannot write functional or semantic roles. Neutral preserves Spatial's approved default; Fluid supplies neutral blue-grey reflections when no brand overrides exist.
- `use-visual-theme.ts` is a URL-scoped preference. Switching does not reload, normalize, clear or write assessment drafts. Root attributes also theme overlays. Existing responsive layouts and Inter type/spacing scale are retained rather than replacing them with the compact reference HTML's smaller text.
- Fluid press feedback is 170ms; sheets use 320ms with their own ease. The requested 300ms full-card swipe remains unchanged. Reduced motion removes nonessential transitions; reduced transparency uses opaque controls. No continuously animated decoration.
- Existing validation, critical-failure outcome rule, strict photo+comment requirement, local completion lock, signature requirement and all evidence controls remain shared functional code.

## Visual review

All six combinations, with actual React screens at 390px:

| Theme | Neutral | Crimson | Ocean |
| --- | --- | --- | --- |
| Spatial | [Live](spatial-spatial-live.png) | [Live](spatial-crimson-live.png) | [Live](spatial-ocean-live.png) |
| Fluid | [Live](fluid-spatial-live.png) | [Live](fluid-crimson-live.png) | [Live](fluid-ocean-live.png) |

For each pair, files also include `-met`, `-fail`, `-critical`, `-overview`, `-result`, `-submission` and `-entry`. Entry is the existing notification scenario leading directly to Overview; the actual reusable Assignment component remains in the Explorer [screenshot](explorer.png). [Material foundations](explorer-materials.png).

## Validation

- Production build, 42 unit tests, lint (only the three existing Fast Refresh warnings).
- `scripts/check-fluid-ui.py`: 18 combinations (320/390/419 × two themes × three brands), five journey states; selected Pass/Fail background, border and radio colors; Critical states; enabled/disabled navigation; portal material; live theme switch preserving draft; signature-required submission; Explorer; V2–V4 and tools smoke. [Results](validation.json).
- Existing completion, signature and card-motion browser regressions pass in Spatial. The same completion/signature regressions also pass with Fluid: evidence guards, pointer/touch slider, reload completion lock, review filters, typed/drawn signature and feedback persistence.
- Fluid motion, guidance and read-only assessment-preview regressions exercise the same components and interactions.
- Additional semantic token/contrast audit results are recorded in `contrast.json`. Automated contrast tools cannot fully establish contrast over layered/overlapping backgrounds; unresolved checks are recorded for visual review.

## Existing prototype limitations

Photos remain session-local; drafts/signatures are local. No new backend synchronization, manager notification, Android Do Not Disturb integration or production submission is introduced. Theme switching does not change these existing limitations.

## Modified files

- `src/styles/semantic-tokens.css` — shared immutable state colors.
- `src/styles/spatial-theme.css` — import shared semantics; existing visual rules retained.
- `src/styles/fluid-theme.css` — scoped Fluid materials, elevation, shape and motion.
- `src/data/spatial-brands.ts` — centralized Neutral/Crimson/Ocean identity configuration and legacy compatibility.
- `src/hooks/use-visual-theme.ts` — independent URL-scoped theme preference.
- `src/components/design-system/visual-theme-switcher.tsx` — shared shadcn selector.
- `src/components/design-system/brand-switcher.tsx` — independent customer selector.
- `src/pages/assessment-flow.tsx` — shared theme wiring and external controls.
- `src/pages/design-system.tsx` — selectors, actual material/semantic foundation inventory, exports and shared component comparison.
- `src/data/design-system/catalog.ts` — source references for this branch.
- `tests/fluid.test.ts` — semantic boundaries, branding contrast and preference isolation.
- `tests/spatial.test.ts`, `tests/spatial-contrast.test.ts`, `tests/spatial-brands.test.ts` — read the extracted semantic layer and recognize additional decorative reflection roles.
- `scripts/check-fluid-ui.py`, `scripts/check-fluid-contrast.py` — browser validation.
- `docs/rosa-fluid-ui/` — reference, screenshots and validation reports.
