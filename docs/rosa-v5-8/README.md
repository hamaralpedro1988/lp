# Rosa V5.8 React preview

Implements [issue #8](https://github.com/hamaralpedro1988/lp/issues/8) on top of PR #7, preserving the real React/shadcn assessment flow. The [approved HTML](https://github.com/hamaralpedro1988/lp/blob/design/rosa-v5-8-handoff/design/rosa-v5-8/approved-reference.html) and [complete handoff](https://github.com/hamaralpedro1988/lp/blob/design/rosa-v5-8-handoff/design/rosa-v5-8/CODEX_REACT_V58_DEPLOY.md) at `baa5d9f80396652630d3975eb7f4df6165810ed3` informed the layout and gestures; no static HTML, iframe or demo JS is embedded in the app.

Use `?version=5` for the actual React app; `?view=design-system&tab=rosa&pattern=card` explores its shared card/navigation. Production and main remain untouched.

## Screens for review

| Assignments | Overview | Live Assessment | Review | Sign-off |
| --- | --- | --- | --- | --- |
| [Screenshot](screenshots/01-assignments-390.png) | [Screenshot](screenshots/02-overview-390.png) | [Screenshot](screenshots/06-live-390.png) | [Screenshot](screenshots/04-review-390.png) | [Screenshot](screenshots/05-signoff-390.png) |

[320px](screenshots/06-live-320.png) · [375px](screenshots/06-live-375.png) · [390px](screenshots/06-live-390.png) · [419px](screenshots/06-live-419.png) · [desktop](screenshots/assessment-1440.png)

[Drag feedback](screenshots/03-valid-drag.png) · [Unanswered snapback](screenshots/02-blocked-snapback.png) · [Evidence snapback](screenshots/05-evidence-snapback.png) · [Sections](screenshots/04-sections.png) · [Native safe-area example](screenshots/07-safe-area-native.png) · [Touch QA video](swipe-qa.webm)

The reference comparison uses the app's bundled Inter font to avoid relying on Google Fonts availability. [Approved reference at 390px](screenshots/approved-reference-inter-390.png). The real app retains the previously approved readable field text, grid Sections icon, revised copy and stricter comment+photo requirement; those functional requirements take precedence over stale either/or wording in the HTML.

## Preview system chrome

Mock time/connectivity/battery indicators are decorative (`aria-hidden`) and do not report actual device state. Desktop defaults to showing the 44px mock chrome; coarse-pointer mobile browsers hide it automatically. `?version=5&systemChrome=preview` opts into mock chrome for screenshot review; `?version=5&native=1` explicitly hides it on any device. No extra controls are exposed to participants. Real `safe-area-inset-top/bottom` and visual viewport resizing remain active in either mode. Real online/offline and save failures still use actual system-state messages.

## Verification

- Build, lint and 30 unit tests passed; lint has three pre-existing Fast Refresh warnings.
- `check-spatial-swipe.py`: Chromium CDP touch input, valid left, blocked response/evidence, right-back/first-item limit, vertical full-card scroll, textarea exclusion, short/edge gesture exclusion, multi-touch cancellation, Sections/focus return, reduced motion, last-to-Review guard, 320/375/390/419px, short viewport and safe-area simulation. Video is from this actual React test run.
- `check-spatial.py`: all five screens at 320/375/390/419/1440px; real image attach/preview/remove, required comment+photo, photo loss on reload, local persistence, review/sign-off, keyboard, expanded text, reduced motion, offline/save errors, draft migration and V2–V4 regressions.
- `check-design-system.py`: installed component inventory, real portals, shared Rosa patterns, token parity, accessible state controls, Theme Studio editing/export and V2–V4.
- `check-participant-navigation.py`: five headers, back destinations, no internal participant controls and measured progress gutter alignment.

Physical-device access is unavailable in this environment. Mobile checks use browser touch emulation, not a claimed physical Samsung/iPhone test. The safe-area screenshot uses explicit simulated insets, not proof of native OS execution.
