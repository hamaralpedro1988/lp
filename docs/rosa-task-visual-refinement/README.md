# Task card visual refinement

The existing React/shadcn live components follow the supplied unselected / Pass / Fail reference:

- A permanent Check/X outcome symbol on the left; the native selected radio stays on the right. Outcome symbols stay visible before and after selection and are hidden from assistive technology.
- Semantic green Pass and red Fail stay independent of the selected brand.
- The card reads **Task X of 11** and retains the actual configured task order, titles, instructions and criticality.
- The continuous green progress rail has rounded ends. Its accessible completion description remains available; the visual percentage is omitted to match the reference.
- The comment composer sits at the card foot when there is room. The entire card scrolls on small viewports or with expanded evidence. It never becomes a sticky layer covering the choices.
- The neutral camera stays in the top-right of the full-surface text field. Required comment/photo messaging remains exact. Helper-bearing fields have extra height for readable evidence feedback.
- Footer actions are text-only Back and Next, with the Sections icon in the centre. The last button reads **Finish**, accessible as “Finish checklist”, and follows the existing route into Review. It does not submit or certify the assessment.
- Dre’s current photo/profile action, branding, 300ms simultaneous transitions, 98% exit depth, reduced motion, guidance and all saved state are preserved.

The actual `SpatialChoice`, `SpatialLiveCard`, `SpatialEvidenceComposer`, `SpatialProgress` and `SpatialNavigation` are shared with the Design System Explorer. V2–V4 retain their existing components and behavior.

## Screenshots

Real production React build, Chromium touch emulation with mock status chrome enabled for comparison.

| Width | Unselected | Pass | Fail |
| --- | --- | --- | --- |
| 320px | [Initial](screenshots/initial-320.png) | [Pass](screenshots/pass-320.png) | [Fail](screenshots/fail-320.png) |
| 390px | [Initial](screenshots/initial-390.png) | [Pass](screenshots/pass-390.png) | [Fail](screenshots/fail-390.png) |
| 419px | [Initial](screenshots/initial-419.png) | [Pass](screenshots/pass-419.png) | [Fail](screenshots/fail-419.png) |

[Last task / Finish](screenshots/last-task-fail.png) · [Short viewport with scroll](screenshots/short-520.png)

## Verification

Build and all 33 unit tests pass. Lint retains only the three existing Fast Refresh warnings. Browser checks cover left symbols/right radios, unselected/Pass/Fail states, disabled Next, bottom composer alignment, real short-viewport overflow and Finish → Review. Existing suites pass for native vertical scrolling, valid/blocked horizontal gestures, strict evidence, whole-field comment focus, top camera, semantic colors under red branding, 300ms animation, repeated clicks, reduced motion and the complete assessment journey including V2–V4.
