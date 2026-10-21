# Connection scenario — presentation simulation

Uses the latest compatible React implementation on `feat/rosa-checklist-overview` at `ff6b916` (PR #17), confirmed against remote Rosa heads. Implemented in a separate `feat/rosa-connection-scenario` branch. No backend/dependency/production changes.

## Demonstration

1. In the existing external Preview controls panel, find **Connection scenario**.
2. Select **Simulate connection loss**. The simulated state becomes **Offline**; the app reuses its existing quiet offline feedback. Continue answering, commenting, adding photos and navigating normally. Required evidence validation remains unchanged.
3. Select **Restore connection**. The simulated state becomes **Online**, with a six-second **You’re back online. Your progress is synced.** status. The participant message simulates successful sync. The external controls identify this as a UX simulation; no actual upload/sync occurs.

The panel remains outside the phone on desktop and below it on narrow layouts; no new in-app toolbar or manual Save is introduced. Existing modal focus traps remain intact: close an open sheet to interact with the external presentation controls; a selected scenario continues while sheets are open.

## State and integrity

- Presenter state is isolated in `useConnectionScenario`, URL-scoped to `connectionScenario=offline`, and enabled only with V5 `brandDemo=1`. It survives refresh and the existing page shortcuts. It never writes `draft.offline`, responses, comments, signatures or progress.
- Toggling uses `history.replaceState` with the existing history state so it does not add back-stack entries or overwrite modal history metadata.
- Real browser offline events and existing legacy offline draft flags remain authoritative. Restoring the simulation cannot reconnect a physically offline device. The external panel identifies another active offline state, and the app keeps its offline message rather than claiming recovery.
- Existing localStorage and IndexedDB saving stays active. Saved photo bytes, notes, responses, current index and sequence position survive simulation/recovery. Local save errors retain priority over connection feedback.
- Reset prototype returns the scenario to Online and clears temporary recovery feedback using the existing reset operation. Theme/brand selection stays independent.
- No network interception, navigator monkey patch, service worker, backend queue, upload, actual disconnect/reconnect or server sync is implemented. The simulation represents UX only. Existing physical-device, storage and backend limitations are unchanged.

## Files

- `src/hooks/use-connection-scenario.ts`: isolated URL state, temporary recovery feedback and reset.
- `src/components/design-system/connection-scenario.tsx`: compact controls inside the existing presenter panel using shadcn Button/Badge.
- `src/components/assessment/spatial-primitives.tsx`: reuses existing semantic status styling for offline and recovery feedback.
- `src/pages/assessment-flow.tsx`: combines simulation with real connectivity, retains saving/validation, shares feedback across navigation screens and resets the scenario.
- `src/styles/spatial-theme.css`: external panel styling and a full-width connection banner outside the scrolling screen.
- `scripts/check-connection-scenario.py`, `scripts/check-connection-accessibility.py`: actual React interaction/automated accessibility checks.

## Visuals

| State | Spatial | Fluid |
| --- | --- | --- |
| Connection lost | [Screenshot](spatial-offline-desktop.png) | [Screenshot](fluid-offline-desktop.png) |
| Connection restored | [Screenshot](spatial-recovered-desktop.png) | [Screenshot](fluid-recovered-desktop.png) |

## Validation

- Production React build passed; lint has only three existing Fast Refresh warnings.
- 57 existing unit tests passed.
- [Actual React browser results](results.json): both themes, external placement at desktop and 320/390/430px, keyboard activation, byte-for-byte assessment storage unchanged by toggles, actual network state unchanged, no fetch/XHR sync requests, answers/comments/photo capture and strict evidence/Next while offline, preserved data through recovery and reload, temporary recovery, URL/page-shortcut persistence across all five screens, real offline not overridden, reset, participant mode and V2–V4 isolation.
- Existing completion and typed/drawn signature regressions passed.
- [Automated accessibility results](accessibility.json): 18 states across Spatial/Fluid and three brands, zero reported violations; 24 incomplete rule/state checks require manual review. A real local-save failure remains visible and suppresses recovery messaging.

Browser/device emulation is not physical TalkBack/VoiceOver or Android testing. No WCAG compliance claim. Public preview verification, when available, is described in the PR; local QA uses the actual production React build.

### Fixed top banner and measured contrast

Connection feedback is now a single, full-width banner below the device status chrome and above task progress/navigation on every screen. It stays visible while assessment content scrolls; it does not overlay or obscure the content. Local save failures still take priority. Recovery feedback remains temporary (six seconds).

Actual Chromium computed styles were checked in 48 combinations: Spatial/Fluid × three brands × 320/390/430/1440px × offline/recovered. Text is 14px, normal weight. Offline uses #8d5228 on #fff1e2 (**5.62:1**); recovery uses #427764 on #edf7f1 (**4.73:1**). Both exceed WCAG 2.2 AA's 4.5:1 requirement for normal text, so the existing semantic colors were retained. No low-contrast decorative outline is relied on to convey the message. This check covers these text pairs, not a whole-product conformance claim.

[Computed colors, ratios and fixed-position checks](banner-contrast.json), generated by `scripts/check-connection-banner.py`. [Spatial mobile](spatial-top-banner-mobile.png) · [Fluid mobile](fluid-top-banner-mobile.png).
