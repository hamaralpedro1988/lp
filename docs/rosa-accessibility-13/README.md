# Issue #13 — Accessibility & Inclusive UX Sprint

WCAG 2.2 AA is the **target**. This work does **not** establish WCAG compliance. Browser tests, axe results and accessibility-tree snapshots are not substitutes for physical TalkBack/VoiceOver testing or business approval of acknowledgement policy.

Base: latest successor `feat/rosa-fluid-ui` at `2463e27`, checked against open PRs #12/#11 and remote heads. Branch: `feat/rosa-accessibility-13`. P0 is isolated in the first implementation commit; subsequent work addresses audit findings and shared Explorer states. Production and main remain unchanged; UI review is required before merge.

## Implemented P0

1. **Completion without dragging.** The optional slide remains. A visible **Complete assessment** button, keyboard/AT activation and a completed slide all open the same explicit confirmation dialog. Cancel restores the initiating control. Final confirmation runs the existing response/evidence completion guard; duplicate activation is guarded. Storage failure keeps the confirmation/session open with an error instead of showing a completed result. Completion still locks responses; it is not manager submission or certification.
2. **Explicit, inclusive acknowledgement.** Type name is the initial accessible alternative, with Draw signature still available. Both require a name entered by the person acknowledging and an explicit feedback-receipt checkbox. Drawing alone never supplies a name. The record stores method, timestamp, consent, self-declared actor, explicitly unverified prototype assessor and unverified identity. Typed acknowledgement is visibly a **prototype alternative needing business validation**, not a declaration of legal equivalence. The readable result, failed tasks, feedback and next steps are available before consent; agreeing with the assessment is not required.
3. **Understandable validation.** A stable visible message identifies a missing response, comment, photo or both. The radio group is required and linked to the question/reason; required comments have descriptive/required/invalid semantics. Messages change when the missing requirement changes, not on each keystroke. There is no preselection or auto-advance. The focused task heading communicates position, section, title and valid-completion progress; the duplicate task live announcement was removed.

Existing Pass/Fail scoring, critical-failure outcome, valid-completion progress (including Fail), strict photo **and** comment requirement, swipe, autosave/resume, completion lock and submission gating are preserved. Sections may still browse unfinished tasks; neither browsing nor review can bypass final validation. Legacy acknowledgement records remain available with unknown method/consent and unverified identity; no retrospective identity proof is fabricated. Versions V2–V4 retain their logic/storage.

## Audit fixes

- Shared shadcn Sheet/Dialog Close controls now have 44×44 CSS px targets.
- Selected Pass also retains its semantic green while hovered on desktop; hover styling is restricted to unselected choices.
- Inactive acknowledgement Tabs had 4.09:1 contrast; the shared secondary text token fixes this across both themes/all three brands.
- Wrapping actions, flexible station headings, bounded metadata columns, scalable input/tab heights and whole-sheet scrolling prevent clipped labels and obscured form content at enlarged text/short viewports.
- Controlled completion dialogs restore focus when cancelled; the result heading keeps focus after completion. Programmatic history rewinds are serialized before reopening overlays, fixing a rapid close/reopen race that could dismiss the wrong sheet.
- Local submission also checks persistence before presenting saved status. Save errors are visible outside Live as well.
- Prototype copy no longer promises server sync or actual manager delivery.
- Explorer includes the real completion component, Complete / Save error stories, actual typed/drawn acknowledgement, existing response/critical/validation/focus states and OS reduced-motion guidance. No separate accessibility mode or duplicated component implementation.

The full findings register includes reproduction, impact, WCAG references, priority, fix, browser/manual result and remaining risk: **[findings.csv](findings.csv)**. Findings A01–A13 describe implemented fixes; R01–R04 record open research/device/policy work. WCAG 2.2 AA target size minimum is **24×24 CSS px with specified exceptions**; 44×44 is our larger touch design aim. Compact 30px review tabs and labelled radios should not be described as failing AA simply for being smaller than 44px.

## Test evidence

- Production `npm run build`: pass.
- `npm test`: **45 tests pass**. New tests cover explicit names, consent, method-specific evidence, unverified metadata, reload and each blocking validation modality.
- `npm run lint`: no errors; only the three existing Fast Refresh warnings in Button, Badge and Tabs.
- axe-core **4.14.0**, committed as a development dependency: **72 journey/overlay states** across Spatial/Fluid × Neutral/Crimson/Ocean, plus **8 shared Explorer component states**, with no reported WCAG-tagged violations. The earlier contrast failures are retained in [axe-baseline.json](axe-baseline.json); final [axe-results.json](axe-results.json) and [component-results.json](component-results.json) reflect fixes. **138 incomplete rule/state checks** in the journey report remain candidates for manual review, especially overlap/translucency; zero violations is not a compliance claim.
- An additional **32 interaction-state audits** cover exact selected Pass colors, hover, keyboard focus, offline, active filters and disabled radios: [interaction-state-results.json](interaction-state-results.json). No reported violations; incomplete checks are retained. Disabled-control contrast is exempt and is not presented as an AA text-contrast pass.
- **56 layout cases**: 320/375/390/419px, 390×520, 844×390 landscape and 1280px desktop; Spatial/Fluid; four content screens with 200% text stress. No page overflow or clipped tested labels in [reflow-results.json](reflow-results.json).
- Keyboard-only app controls through notification entry → Overview → all 11 tasks → completion → Result → acknowledgement → local submission. Native file picker was automated with a test image, not operated on a real phone. Tests cover Tab, Shift+Tab, Enter, Space, Escape, focus restoration, real evidence, offline/online events and completion reload lock. Radios retain arrow-key behavior.
- P0 pointer tests cover confirmation/cancel, explicit typed/drawn records, precise evidence feedback, real session image and simulated localStorage failure in both themes.
- Existing touch-slider, guidance tap/up-swipe/keyboard/browser-Back, read-only preview and simultaneous **300ms** card transition regressions pass. Reduced-motion keyboard flow and existing reduced-motion navigation regression pass. Short-viewport name focus and long-title answer focus are checked; contrast remains readable with backdrop-filter disabled.
- Browser accessibility-tree snapshots are included as `*-aria.yml`, explicitly **not physical AT evidence**.

Run with the production preview on port 5181 and Chromium/Playwright available:

```sh
npm ci
npm run build
npm run preview -- --host 0.0.0.0 --port 5181
python scripts/check-accessibility-p0.py
python scripts/check-accessibility-keyboard.py
python scripts/check-accessibility-layout.py
python scripts/check-accessibility-components.py
python scripts/check-accessibility-states.py
python scripts/audit-accessibility.py
npm test
npm run lint
```

## Actual React screenshots

| State | Spatial | Fluid |
| --- | --- | --- |
| Entry | [Notification](spatial-entry.png) | [Notification](fluid-entry.png) |
| Overview | [Screen](spatial-overview.png) | [Screen](fluid-overview.png) |
| Live validation | [Required photo](spatial-evidence-validation.png) | [Required photo](fluid-evidence-validation.png) |
| No-drag confirmation | [Dialog](spatial-no-drag-confirmation.png) | [Dialog](fluid-no-drag-confirmation.png) |
| Result | [Screen](spatial-result.png) | [Screen](fluid-result.png) |
| Submission | [Screen](spatial-submission.png) | [Screen](fluid-submission.png) |
| Acknowledgement | [Typed method](spatial-typed-acknowledgement.png) | [Typed method](fluid-typed-acknowledgement.png) |
| Short viewport, 200% text | [Focused field](spatial-short-viewport-text-200-focus.png) | [Focused field](fluid-short-viewport-text-200-focus.png) |
| Explorer | [Completion/error](spatial-explorer-completion.png) | [Completion/error](fluid-explorer-completion.png) |

The current participant entry is the established notification scenario, not a newly added assignments page. The actual reusable Assignment tile is independently audited in the Explorer. Screenshots come from the real React production build, never standalone HTML.

## Remaining constraints and review gates

- **Physical Android TalkBack, iOS VoiceOver, Switch Access and voice control are untested.** Native camera/picker, real mobile keyboard, pronunciation, one-handed shift conditions and interruption recovery need handset testing.
- 200% text sizing and 320 CSS px reflow were tested in Chromium. Actual browser-UI 400% zoom and OS text scaling remain unverified; reduced viewport simulates, rather than reproduces, a soft keyboard.
- Business owners must approve typed/assisted acknowledgement policy, identity verification and production audit metadata. Rosa's session is not proof of Dre's identity. Prototype actors/assessors are explicitly unverified. No signature legal validity or certification is claimed.
- Drafts/acknowledgements are local; photos are session-local. There is no backend sync, server approval, native Do Not Disturb control or guaranteed cold-start offline operation.
- English sample copy is not sufficient evidence of inclusive translation, cognitive usability or real-user comprehension. Full WCAG review, including requirements outside these representative automated checks, remains necessary.

## Changed areas

Shared assessment components (`spatial-slide-complete`, `spatial-submission`, `spatial-primitives`, preparation copy); acknowledgement record/helper and normalization; guarded persistence in the existing assessment page; shared Sheet/Dialog Close primitives; scoped Spatial stylesheet inherited by Fluid; Explorer stories/catalog/guidelines; axe development dependency; unit/browser tests and this evidence folder. No new assessment screen implementation, scoring rule, identity role or production service was introduced.

## Português

O objetivo é WCAG 2.2 AA; **não estamos a declarar conformidade**. O P0 acrescenta conclusão sem arrastar com confirmação explícita, nome/consentimento obrigatórios sem identidade inventada e validação clara das respostas e evidências. Os ajustes seguintes corrigem foco, contraste, alvos de fechar e reflow, mantendo os componentes partilhados e as regras existentes.

Os testes de browser passaram, incluindo Spatial e Fluid. TalkBack/VoiceOver físicos, zoom nativo, teclado real do telemóvel, uso com uma mão e equivalência jurídica/operacional do reconhecimento continuam por validar. O reconhecimento digitado está identificado como alternativa de protótipo; identidade e assessor não são apresentados como verificados. É necessária revisão de UI e política antes de produção.


## Preview and review

[Spatial preview](https://lp-git-feat-rosa-accessibility-13-hamaralpedro1988.vercel.app/?version=5&brandDemo=1) · [Fluid preview](https://lp-git-feat-rosa-accessibility-13-hamaralpedro1988.vercel.app/?version=5&brandDemo=1&visualTheme=fluid) · [Completion Explorer](https://lp-git-feat-rosa-accessibility-13-hamaralpedro1988.vercel.app/?view=design-system&section=rosa&pattern=completion) · [Draft PR #14](https://github.com/hamaralpedro1988/lp/pull/14).

Vercel's GitHub integration confirms the public alias and successful preview deployment. Direct public HTTP/browser verification is blocked by the execution environment's outbound proxy (`CONNECT 403`), so browser evidence comes from the local production build. This is an explicit verification limitation, not a claim of a public-device test.
