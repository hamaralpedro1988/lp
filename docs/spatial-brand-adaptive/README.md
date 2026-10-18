# Spatial brand-adaptive theme

One existing React/shadcn application, with a narrowly scoped brand atmosphere layer. No new dependency, component rewrite, workflow change, storage migration or production merge.

## Brand demo

The Design System always exposes **Brand preview**. The actual assessment exposes the same switcher in an external preview panel only with `?version=5&brandDemo=1`; the default user-testing URL remains free of prototype controls. `brand=mcdonalds` or `brand=burger-king` deep-links a brand without exposing the switcher. Omit `brand` for the approved Spatial default. Switching uses React state plus a URL parameter, never a reload or tenant/assessment localStorage write. This is demonstration configuration, not real tenant discovery or authentication.

Configuration lives in `src/data/spatial-brands.ts`. Its allowlisted output contains only brand color variables. Three configurations reuse the same components and CSS geometry:

| Brand | Atmosphere | Five-screen visual review |
| --- | --- | --- |
| Spatial (default) | Approved lavender gradient, unchanged | [Assignments](screenshots/spatial-assignments.png), [Overview](screenshots/spatial-overview.png), [Live](screenshots/spatial-live.png), [Review](screenshots/spatial-review.png), [Sign-off](screenshots/spatial-signoff.png) |
| McDonald's | Light desaturated red | [Assignments](screenshots/mcdonalds-assignments.png), [Overview](screenshots/mcdonalds-overview.png), [Live](screenshots/mcdonalds-live.png), [Review](screenshots/mcdonalds-review.png), [Sign-off](screenshots/mcdonalds-signoff.png) |
| Burger King | Light warm orange | [Assignments](screenshots/burger-king-assignments.png), [Overview](screenshots/burger-king-overview.png), [Live](screenshots/burger-king-live.png), [Review](screenshots/burger-king-review.png), [Sign-off](screenshots/burger-king-signoff.png) |

## Audit before editing / classification

The existing `spatial-theme.css` already owned semantic Spatial variables, shadcn aliases, layouts, states and portal styles. `spatial-flow.ts` provides functional assessment rules and the initial shadcn theme; `theme.ts` owns Creator/Theme Studio settings. Design System previews import the real assessment components and read raw CSS for token inspection/export. The smallest change was to extend those variables, add three centrally configured brand presets and reuse the existing Select, rather than introduce another theme engine.

| Previous usage | Classification | Change / justification |
| --- | --- | --- |
| `--spatial-brand-canvas`, canvas-start/mid/end, workspace's hardcoded `#e5dff650` glow | Brand | Existing positions, gradient angle and layering retained; color stops and glow adapt. Spatial has no overrides, preserving exact default stops. |
| Iris decorative emphasis, avatar/goal icon discs, Explorer selected navigation | Brand/decorative | Use brand accent/subtle/ink roles; warm/red accents stay small. |
| Purple completion bar (`--spatial-brand-progress`) | Semantic, previously mixed with branding | Removed brand ownership. Spatial continuous bar and shared shadcn Progress reuse **existing `--spatial-success-ink: #427764`** with fixed neutral gray track. Dimensions/radii preserved. A visible percentage complements the accessible valid-criterion count; partial green never implies an overall pass. |
| Preparation/Frying/Completion tags, pending/in-progress badges, review section headings | Workflow/product | Fixed neutral `--spatial-section-bg/ink`; no brand or success/failure inference. Shapes and typography unchanged. |
| Pass/Fail, warning/Critical, local review, completed criterion marker, attached-photo dot | Semantic | Green/red/amber stay fixed. Completed markers/photo dot now consume semantic green instead of a brand color. |
| Dark primary/hover, secondary actions, input borders/selection surfaces, card reading surfaces | Product | Stable across brands. Product selected surfaces are neutral; no saturated red/orange controls. |
| Cool-tinted card/composer surfaces, depth shadows/overlay, `#7962d0` focus outline and its translucent focus halo | Product/accessibility, independent of organization | Deliberately retained to preserve Spatial material depth and one consistent visible focus treatment. These purple-tinted values are not tenant branding and do not encode status. No blind replacement of every purple value. |
| Purple illustration SVG in Explorer | Inert sample-media content | Kept unchanged as a labelled preview attachment, not branded application chrome. |
| Creator palette, Theme Studio presets and V2–V4 styles | Separate existing theme/version context | Unchanged. Branding is scoped to `data-assessment-version="5"`; Theme Studio and legacy storage remain functional. |
| Lazy V5 loading fallback | Product | Neutral fallback prevents a purple flash before the brand stylesheet loads. |

## Design decisions / trade-offs

- Generate light, desaturated brand tints by mixing small amounts of accent into white/cool-neutral bases. Keep dark accent ink separately, with AA contrast tested. The red/orange mid/end stops were lightened after contrast tests caught a weak muted-text combination.
- Keep the original CSS default as the fallback source; the Spatial preset intentionally has no overrides. Alternate palettes are generated from centralized configuration. Scoped CSS selectors plus a root data attribute cover actual screens and Radix portals without leaking into Theme Studio or V2–V4.
- Reuse existing tokens instead of adding parallel product/status names. Primary actions remain almost-black. Success remains `#427764`, including completion bars, independent of all brand tokens.
- Keep the rail 4px and its original width. Reserve the existing header gap for a small percentage; the header/card do not gain another toolbar. Completion logic still requires valid results and configured comment/photo evidence.
- Workflow stages are neutral, as requested. Only decorative avatar/goal/navigation accents change brand; input focus, material tint and shadows remain product-level constants.
- The switcher is an explicit demo feature, not participant configuration. It persists through screen navigation via one mounted flow and survives reload only through the shareable URL. No localStorage/theme preference writes are introduced.
- Explorer token values refresh on a switch. CSS export includes the selected brand's generated atmosphere override, alongside the actual shared product/semantic declarations.

## Changed files

| File | Responsibility |
| --- | --- |
| `src/data/spatial-brands.ts` (new) | Three configurations, light tint generation, validated brand IDs and CSS declarations |
| `src/hooks/use-spatial-brand.ts` (new) | Live URL-scoped selection and reversible root dataset lifecycle |
| `src/components/design-system/brand-switcher.tsx` (new) | Existing shadcn Select plus scoped generated CSS; shared by both routes |
| `src/styles/spatial-theme.css` | Brand atmosphere variables, neutral workflow tags, semantic progress/markers, percentage and discreet demo control layout |
| `src/styles/design-system.css` | Brand-adaptive selected Explorer navigation |
| `src/pages/assessment-flow.tsx` | Optional demo selector and brand lifecycle in real V5 |
| `src/pages/design-system.tsx` | Shared selector, active-brand token inspection/export and brand-aware link to Rosa |
| `src/components/assessment/spatial-primitives.tsx` | Visible progress percentage; existing continuous progress reused |
| `src/data/design-system/catalog.ts` | Correct progress token usage guidance |
| `src/App.tsx` | Neutral lazy-loading fallback |
| `tests/spatial-brands.test.ts` (new) | Brand boundary/default/contrast checks |
| `scripts/check-spatial-brands.py` (new) | Actual UI switching, all five screens, state retention, semantic/product parity and export |
| `docs/spatial-brand-adaptive/` (new) | Audit, decisions, verification and screenshots of each brand |

## Validation and limitations

Production build, unit suites and lint pass (three existing Fast Refresh warnings in button/badge/tabs). Brand tests check AA contrast of accent ink and muted text against generated backgrounds, default fallback, and absence of semantic/product keys in configuration.

Browser checks cover all five screens under all three brands, Sections portals, 320/390/419px, switching without reload, draft preservation, fixed product/semantic token values, matching green Pass/progress, visible percentage, shared core Progress, selected-brand CSS export and the absence of controls in the default participant app. Existing full-flow, touch/swipe and Design System/Theme Studio regressions are run separately, including V2–V4.

No physical device or live tenant integration is available; mobile checks use browser emulation. Presets demonstrate atmospheric adaptation, not licensed logos or a final corporate brand manual. Arbitrary color entry is intentionally absent: new configurations should undergo the same contrast review.


## External preview controls

The explicit brand demo control is a sibling of the app stage, never a child of the phone screen. At desktop widths it sits in a separate panel to the right; at widths up to 1100px it follows the app in document flow below it, keeping the phone viewport intact instead of overlaying or shrinking it. It remains absent from the standard participant URL.

Verified at 390/900/1440px: app width and height match the URL without controls; the panel is geometrically outside the app; selecting McDonald's still updates the theme. [Desktop](external-controls/1440.png) · [Tablet](external-controls/900.png) · [Mobile](external-controls/390.png). Production build and lint pass, with the same three existing Fast Refresh warnings.
