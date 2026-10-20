# Transparent feedback and editable observations

Implemented in the existing React/shadcn V5 flow, stacked on `feat/rosa-accessibility-13` (`a254468`). Remote heads and open PRs were checked: this includes Guidance (`59536c0` / #11), Fluid (`2463e27` / #12) and the newest compatible accessibility refinements/restored Finish and Submission (#14). Spatial remains the default. V2–V4 and production are unchanged.

## Current behavior

- Before you start has exactly four rows: assessment-specific ~15 min estimate (metadata, never tasks multiplied by fixed time), DND preview, automatic progress saving, shared feedback. Clock/Bell Off/Save/Users use the existing Goals icon treatment.
- The requested offline/sync product copy has an inline prototype qualifier in the same row: text is saved locally; server sync is unavailable. The DND switch still explicitly says it does not change phone settings.
- The actual shared Live composer retains its textarea/camera sizing and evidence messages. A persistent muted helper below it adds approximately one short text line (wrapping at narrow widths), without changing the input height. The textarea describes both sharing and required evidence to assistive technology.
- Task details keeps its existing structure. Observation text is editable immediately, without focusing the textarea on opening. Dirty edits show Cancel / Save changes. Saving persists to the existing draft before updating the UI and stays open; storage errors preserve the unsaved text. Cancel restores only the last saved observation.
- Close, X, Escape, outside dismissal and browser Back guard unsaved text with the existing shadcn AlertDialog. Keep editing is the default safe action. Focus returns to the initiating control; if a filtered row no longer exists, the active filter tab receives focus.
- Pass/Fail and photos remain read-only in task details. The existing Live edit action remains available before completion. Completed assessments still lock responses and repeat attempts; only comments can be corrected before submission.
- An immutable completion evidence snapshot allows a required comment to be temporarily cleared and saved without losing the completed-response lock on refresh. CURRENT required comments/evidence still gate sign-off/submission. The snapshot is local prototype validation data, not a server audit log. Legacy receipts acquire the snapshot when first edited.
- Once the local submission flag is set, observations and feedback are read-only; ordinary update paths cannot clear that flag by editing record fields. No amendments workflow is implemented.
- Submission has one short sharing reminder in the existing feedback card. The restored signature/acknowledgement interaction is preserved. Acknowledgement records receipt/discussion, not agreement or verified identity.
- Explorer Review stories use the SAME task-details editor and state helper, in memory only.

## Visual review and demonstration

| State | Spatial | Fluid |
| --- | --- | --- |
| Before you start | [Screenshot](spatial-before-start.png) | [Screenshot](fluid-before-start.png) |
| Live composer | [Screenshot](spatial-composer.png) | [Screenshot](fluid-composer.png) |
| Empty observation | [Screenshot](spatial-observation-empty.png) | [Screenshot](fluid-observation-empty.png) |
| Unsaved changes | [Screenshot](spatial-observation-unsaved.png) | [Screenshot](fluid-observation-unsaved.png) |
| Saved observation | [Screenshot](spatial-observation-saved.png) | [Screenshot](fluid-observation-saved.png) |

[Actual React editing demonstration](editing-demo.mp4): type, save, edit again, attempt close, return to editing, cancel.

## Product policy and implementation limits

Learner-facing reports should include relevant comments, permitted photos, critical failures, coaching and next steps. Access is restricted to Dre, the assessor and stakeholders authorised by organisation/role policy, NOT every employee. No private/hidden-official-evidence toggle is introduced. This prototype has no report delivery, backend ACLs, authentication, verified signer identity, native DND or server synchronization. It does not claim to deliver photos, notifications or reports. Photos still exist only in the mounted session; recorded completion counts do not recreate missing photos.

Before production, validate permitted photo subjects, handling of colleagues/customers/sensitive details, retention, redaction, role access, report delivery and auditable post-submission correction policy. No unrestricted sharing or new backend/permissions system is implemented. The existing signature flow is retained per the preceding explicit UI restoration request; this change does not reintroduce the reverted issue #13 acknowledgement redesign or claim legal equivalence of signature methods.

## Validation

- Production React build: passed.
- Unit tests: 49 passed, including comment correction, required-evidence removal/reload, legacy receipts and submitted-record locking.
- Lint: only the three pre-existing Fast Refresh warnings in shared button/badge/tabs.
- Actual React browser regression: Spatial and Fluid; existing/empty comments; draft/save/cancel/discard; first comment; reload persistence; unchanged responses; required evidence blocking and recovery; Live consistency; signature and local submission; submitted read-only; failed localStorage save recovery.
- Responsive checks: 320/390/419 mobile, short 390×440 viewport, desktop 1440×1000 and enlarged text. Save actions remain reachable by scrolling. Short viewport emulates available keyboard space; physical Android IME behavior still requires device testing.
- Existing completion and typed/drawn signature regressions passed.
- Targeted axe audit: 30 states across Spatial/Fluid × Neutral/Crimson/Ocean; zero reported violations, 48 incomplete rule/state checks requiring manual review. Keyboard Save/Cancel, X/outside/Back discard protection, return focus, actual touch swipe and Guidance passed.
- See [browser results](browser-results.json) and [targeted accessibility findings](accessibility-results.json).

WCAG 2.2 AA is a target, not a compliance claim. Automated axe checks do not replace physical TalkBack/VoiceOver, magnifier, Android keyboard or privacy-policy review.
