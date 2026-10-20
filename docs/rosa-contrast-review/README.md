# Rosa V5 contrast review — WCAG 2.2 AA

## Scope and method

The Spatial, McDonald’s and Burger King configurations were checked in the existing React application using axe-core 4.14.0, production Chromium rendering and deterministic token-pair tests. No runtime dependency was added.

The main automated matrix covers 18 states per brand: phone notification, Overview, the three step sheets, DND toast, unanswered live task, Pass, Fail, guidance, sections, add-photo sheet, finish confirmation, Result, insights, task details, submission and signature. Supplementary checks cover member and learning sheets, required evidence helpers, composer focus, each alternative selected result tab and primary-button focus.

Thresholds:
- WCAG 1.4.3: normal text 4.5:1; large text 3:1. Theme regression tests conservatively require 4.5:1 for all text roles.
- WCAG 1.4.11: necessary control boundaries, state indicators and icons 3:1.
- Focus indication is checked at 3:1 against the reading surfaces, alongside the existing visible outline.
- Inactive disabled controls and purely decorative card dividers do not carry the same contrast requirements.

## Corrections

| Combination | Before | After | Threshold |
|---|---:|---:|---:|
| Spatial secondary text / darkest canvas stop | 4.45:1 | 4.80:1 | 4.5:1 |
| Field boundary / darkest card stop | 1.30:1 | 3.46:1 | 3:1 |
| White switch thumb / off track | 1.25:1 | 4.19:1 | 3:1 |
| Radio boundary / choice surface | reinforced | 3.66:1 | 3:1 |
| White text / primary button | unchanged | 14.79:1 | 4.5:1 |
| Focus outline / darkest card stop | unchanged | 4.42:1 | 3:1 |

Axe specifically found selected-task helper text at 4.49:1 on #efeff4. The shared muted text role was darkened to #6b657d. Field boundaries now use their own #8b819c token rather than darkening every decorative card line. Radio boundaries use #887d98. The off switch uses #81788f. Placeholder opacity is explicit. Semantic Pass/Fail colors, branding and gradients are preserved.

## Results and limits

The main 54-state automated matrix and 27 supplementary states (81 total) have zero detected text-contrast violations after correction. See automated-summary.json for pass and incomplete counts. The added theme tests check normal/secondary text against all canvas and card gradient stops in each brand, selected states, semantic badges, primary/hover buttons, toast, field/radio boundaries, switches, progress and focus.

Axe returns “incomplete” for many overlapping or gradient-backed elements inside the phone presentation. Those entries are not treated as automatic passes: their shared foreground/background roles were checked separately using the token-pair tests above. The notification’s main text and light card backgrounds were also reviewed visually. Uploaded photo/video content and actual Android system UI are outside the app-controlled palette and cannot be guaranteed by this audit.

This is a contrast review, not a claim of complete WCAG conformance across keyboard behavior, semantics, reflow or every other accessibility criterion. Legacy V2–V4 and the separate editable Theme Studio palettes were not recolored.

## Re-run

- npm test
- npm run build
- Download axe-core into work/contrast (npm pack, not a project dependency), extract package/axe.min.js.
- python3 scripts/check-spatial-contrast.py --axe work/contrast/package/axe.min.js

Existing lint output retains three pre-existing Fast Refresh warnings.
