# Checklist overview (All tasks)

Built on the latest React `feat/rosa-progress-status` (PR #16). No production/main changes or new dependencies.

## Interaction decisions

- Keeps the existing All tasks sheet, section groups, counters, typography, colors, row sizing, critical indicators and portal container. The trigger is now labelled All tasks. Uses the requested description verbatim.
- Current task continues the active assessment. Complete tasks (including Fail) remain selectable for review/edit; future incomplete tasks show Upcoming · Preview only and an eye icon. They remain normal, readable buttons rather than disabled controls.
- Reuses the actual Assessment Preview content for question, section/Critical tags, evidence requirements and Guidance. The checklist preview has no radio, textarea, camera/evidence actions, Save or Next. Only Back to checklist, Guidance and sheet dismissal are available. Closing Guidance restores its trigger; Back/Escape/X from preview returns to the list row and its scroll context. A subsequent Escape/Back closes the sheet and restores the footer trigger.
- Removes the old V5 Review all shortcut from this sheet, which otherwise let the assessor enter the editing workflow outside the sequence. Existing Finish/Result/Sign-off and V2–V4 remain intact.
- An optional persisted `activeIndex` separates the active sequence from a temporarily reviewed task. Existing drafts without it use their existing index; previewing writes nothing. Editing only adds navigation metadata on normal user interactions, never resets existing observations. Return to current task explicitly goes back to the active position rather than advancing from a reviewed task. The usual response/evidence guard applies before this action; missing evidence still blocks Next.
- Existing earlier gaps in legacy records remain revisitable for recovery; previously completed later items are preserved and can be reviewed without promoting the active sequence. Later answers, comments and photos are retained. After the explicit assessment completion receipt, the existing response lock remains unchanged.
- Sequential navigation is a prototype design assumption, isolated in `spatial-checklist.ts`, not an enforced backend/scoring/operational policy.

## Files

- `src/data/spatial-checklist.ts`: shared statuses, selection policy and next-position helpers.
- `src/data/flow-draft.ts`: optional bounded active sequence position, backward-compatible normalization.
- `src/components/assessment/spatial-primitives.tsx`: existing rows, inline read-only preview, focus/history handling, review cue and navigation action.
- `src/components/assessment/spatial-assessment-preview.tsx`: extracts shared preview content instead of duplicating question/evidence/guidance UI.
- `src/pages/assessment-flow.tsx`: guarded selection, preserved sequence, exact copy and preview dismissal integration.
- `src/components/design-system/rosa-preview.tsx`, `src/data/design-system/rosa-patterns.ts`: same real behavior in Explorer examples.
- `src/styles/spatial-theme.css`: small scoped preview/review-cue additions; no semantic/brand token changes.
- `tests/spatial-checklist.test.ts`, `scripts/check-checklist-overview.py`, `scripts/check-checklist-accessibility.py`: validation.

## Visual review

| State | Spatial | Fluid |
| --- | --- | --- |
| Current / complete / upcoming | [Screenshot](spatial-partial-checklist.png) | [Screenshot](fluid-partial-checklist.png) |
| Read-only upcoming preview | [Screenshot](spatial-upcoming-preview.png) | [Screenshot](fluid-upcoming-preview.png) |
| Reviewing a completed task | [Screenshot](spatial-review-completed.png) | [Screenshot](fluid-review-completed.png) |

## Validation

- React production build passed.
- 57 unit tests passed (five new checklist cases): zero observations, Fail completion, strict evidence, read-only selection, active-position persistence, old/later observations, and final response lock.
- Lint has only the three pre-existing Fast Refresh warnings in shared button/badge/tabs.
- Actual React browser checks passed in Spatial/Fluid × 320/390/430px: empty checklist, partial section, all eleven valid observations, evidence missing and recovered, completed response/evidence edits, read-only future question/guidance/requirements, unchanged storage/progress/index during preview, row/scroll return, keyboard activation, X/Back/Escape, at least 44px row targets, no horizontal overflow, correct active return, and later-data preservation.
- Existing completion, typed/drawn signature and full lifecycle/photo persistence regressions passed.
- Axe: 12 states across both themes and three brands; zero reported violations, 36 incomplete rule/state checks needing manual review. Shared Explorer preview/Escape also passed.
- [Interaction results](results.json) and [targeted accessibility results](accessibility.json). Automated checks are not a WCAG compliance claim; physical TalkBack/VoiceOver and Android device testing remain outstanding.

This keeps local autosave/IndexedDB evidence behavior. It adds no backend policy or data migration/reset. The existing preview shortcuts are demonstration controls, not production navigation or permissions enforcement.
