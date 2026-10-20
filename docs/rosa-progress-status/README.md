# Assessment lifecycle and resume

Built on `feat/rosa-feedback-refinement` (PR #15), preserving the latest Spatial/Fluid flow and preceding Finish/Submission restoration. No production/main changes.

## Behavior

One shared `spatialLifecycle` derives status, CTA, destination and valid progress for Assignments, Overview and Explorer. Starting records a persisted boolean even before answering anything. Legacy answers/comments/paused/index data still identify an in-progress assessment.

| Condition | Status | Primary action |
| --- | --- | --- |
| Not started | Ready to start | Start assessment |
| Started / partially recorded | In Progress | Resume assessment (last visited index) |
| All valid tasks, Review pending | In Progress | Continue to review |
| Checklist confirmed / Sign-off pending | In Progress | Continue to review |
| Signed and submitted, manager required | Pending Review | View assessment result |
| Signed/submitted with no manager requirement | Completed | View assessment result |

Fryer Station requires manager approval in assessment metadata, so it remains Pending Review after submission. No manager approval is fabricated. The existing local submission sheet explicitly says nothing was sent to Alex. The no-manager configuration is covered by unit tests, not presented as the prototype's active policy.

Overview retains the last visited task; resuming does not search for the first unanswered task. Valid progress uses the existing Pass/Fail and mandatory-evidence rules. No manual assessment Save button is added. Completed responses remain locked; pre-submission comment correction remains available. Returning from Result to Overview is now allowed without reopening editable responses, including after refresh.

The initial notification scenario is unchanged. Returning to Assignments after starting uses the existing shared assignment card with the same status, progress and resume action.

## Photographic evidence

V5 opts the existing EvidencePanel into device-local IndexedDB Blob storage. Object URLs are rebuilt from real saved photo bytes after reload/page closure; counts are restored from actual records rather than filenames. Photo writes/removals commit before the UI counts them. Serialized transactions and per-panel busy guards prevent concurrent writes from losing evidence. An unsuccessful restoration cannot silently overwrite an existing collection. Save/restore failures surface a visible error; failed saves do not contribute to progress. Hydration does not clear a submitted record's confirmation flag.

Keys separate participant and isolated prototype scenarios. Reset prototype clears the matching participant and preview Blob records as well as response drafts. V2–V4 keep their original session-only evidence behavior. No dependency, backend upload or manual Save is introduced.

Storage is local to the current origin/browser/device. It cannot recover photos lost by older session-only versions, migrate data between different preview origins, synchronize devices, survive explicit browser-data clearing or guarantee retention against browser eviction/private-mode restrictions. Photos remain subject to the organisation's privacy/retention policy before production. Existing loaded-page offline edits are preserved; this does not add an offline app-shell/service worker.

## Duplicate evidence message

The repeated requirement paragraph between Pass/Fail and the composer is visually hidden in the actual shared Live card. Its accessible description remains available; the existing comment-field requirement and disabled Next validation remain unchanged. No duplicate message or layout gap appears. Spatial and Fluid at 320/390/419px were checked for both missing-comment-and-photo and photo-only states.

## Validation

- Production React build passed.
- 52 unit tests passed, including lifecycle statuses, valid progress, legacy/start metadata and manager-required/no-manager submission rules.
- Lint: only the three existing Fast Refresh warnings in button/badge/tabs.
- Actual Chromium interaction tests in Spatial and Fluid: start without answering, Overview/Assignments statuses, resume task 5 rather than the first missing task, comments/answers preserved, photo bytes after reload/page close, persisted removal, offline addition, failed storage write, required-evidence progress, all eleven answers still In Progress, Continue to review, checklist/signature still In Progress, submission Pending Review and Reset clearing photos.
- Existing completion and typed/drawn signature browser regressions passed.
- [Machine-readable lifecycle results](results.json).

| State | Spatial | Fluid |
| --- | --- | --- |
| Assignments | [Screenshot](spatial-assignments-in-progress.png) | [Screenshot](fluid-assignments-in-progress.png) |
| Overview | [Screenshot](spatial-overview-in-progress.png) | [Screenshot](fluid-overview-in-progress.png) |
| Restored photo | [Screenshot](spatial-restored-photo.png) | [Screenshot](fluid-restored-photo.png) |
| Pending Review | [Screenshot](spatial-pending-review.png) | [Screenshot](fluid-pending-review.png) |
| Single evidence message | [Screenshot](spatial-single-evidence-message.png) | [Screenshot](fluid-single-evidence-message.png) |

Device tests are browser emulation, not a physical Android device. No backend approval, upload/sync or WCAG compliance claim.
