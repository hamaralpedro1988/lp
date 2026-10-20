# Optional criterion guidance

Implements the approved visual concept as real shared React/shadcn UI, on top of the brand-adaptive V5 branch. The participant app shows only a small centered 40×4px neutral grabber beneath the comment/evidence area, inside the assessment card and above the existing footer. It is not a system home indicator.

The visible bar has a 44px-high full-width button target with an accessible name. Tap/click, Enter/Space or a deliberate upward drag (more than 32px, with vertical intent) opens the current criterion's guidance. Sideways/downward gestures on the handle do not open it or move the checklist. The rest of the card retains native vertical scroll and the existing guarded horizontal swipe navigation.

The existing Sheet primitive provides the bottom panel, scoped to the app's overlay container. Content is scrollable with a 76% screen-height limit, site-procedure context, three observation prompts and Back to assessment. Close X, Escape, the return button, outside dismissal and browser/mobile Back use the established modal behavior. Opening focuses the panel heading; closing returns focus to the handle without scrolling the question away.

Guidance is optional supporting information only. Its state is independent of answers, comments, photos, completion and approvals. It introduces no extra validation, default answer, score or submission. All eleven criteria have distinct content in `spatial-guidance.ts`, based on the existing supplied tasks and approved site procedures; no numerical cooking limits or invented policy thresholds are introduced.

The actual `SpatialCriterionGuidance` export is embedded by `SpatialLiveCard` and has its own Rosa Flow Components story (`?view=design-system&section=rosa&pattern=guidance`). It uses the current Spatial tokens across all brand configurations. No separate theme or static image implementation is used.

## Visual review

| Closed | Open |
| --- | --- |
| [390px](screenshots/closed-390-844.png) | [390px](screenshots/open-390-844.png) |
| [320px](screenshots/closed-320-844.png) | [320px](screenshots/open-320-844.png) |
| [419px](screenshots/closed-419-844.png) | [419px](screenshots/open-419-844.png) |
| [Short mobile](screenshots/closed-390-520.png) | [Short mobile](screenshots/open-390-520.png) |
| [Desktop](screenshots/closed-1440-900.png) | [Desktop](screenshots/open-1440-900.png) |

[Shared Explorer component](screenshots/explorer-guidance.png).

## Verification

- Build, unit suites and lint; only the three pre-existing Fast Refresh warnings.
- `check-spatial-guidance.py`: actual Chromium touch-up gesture, tap/click, keyboard, Escape/browser Back, return focus, state/progress isolation, mandatory photo preserved after reading guidance, all eleven contexts, reduced motion, shared Explorer story, sheet bounds at 320/390/419px, short 390×520 and 1440×900.
- Existing full-flow regression: criterion transitions without duplicate headings/choices, real media, required evidence, persistence, review/sign-off, focus, offline/save errors, draft migration and V2–V4.
- Existing touch regression: left/right navigation, blocked swipe validation, vertical scroll, composer exclusion, edge/multitouch cancellation and reduced motion.
- Existing Design System/Theme Studio regression.

Mobile checks use browser touch emulation; no physical device was available. Discoverability of an unlabelled optional handle remains a deliberate user-testing question; assistive technology and keyboard users receive a named button.

## UX decisions — English

Keep secondary help visually quiet: one handle, with no label, icon or tile while closed. Preserve a generous invisible hit target and alternate tap/keyboard entry. Scope upward recognition to the handle rather than stealing full-card scroll. Reuse the existing modal and theme, keep guidance criterion-specific, and make it read-only with respect to assessment data.

## Decisões de UX — Português

Manter a ajuda secundária discreta: apenas uma barra, sem label, ícone ou cartão quando recolhida. Preservar uma área de toque generosa e abertura por toque/teclado. Reconhecer o gesto para cima apenas na barra, sem capturar a rolagem do cartão. Reutilizar o modal e o tema existentes, contextualizar cada critério e não alterar os dados da avaliação ao consultar a orientação.
