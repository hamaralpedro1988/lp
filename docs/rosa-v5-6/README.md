# Rosa V5.6 Spatial Flow — React implementation

The working application is `/?version=5`. The interactive theme catalog is
`/?version=5&catalog=1`. These routes compose React/shadcn controls and the existing
assessment logic. No iframe, HTML injection or standalone HTML implementation is used.

Source of truth: [updated issue #1](https://github.com/hamaralpedro1988/lp/issues/1),
[full implementation specification](https://github.com/hamaralpedro1988/lp/blob/preview/rosa-v5-6/design/rosa-v5-6/SPATIAL_THEME_IMPLEMENTATION_SPEC.md),
and the approved V5.6 reference HTML on `preview/rosa-v5-6`.

## Visual review

Real browser screenshots of the React application. The scripted observations are
illustrative test data, including failures; completion never represents an overall pass.

| Screen | Mobile screenshot | Lower content / detail |
| --- | --- | --- |
| Assignments | [390px](screenshots/01-assignments-390.png) | [Desktop](screenshots/list-1440.png) |
| Overview | [390px](screenshots/02-overview-390.png) | [Goals and sections](screenshots/02-overview-details-390.png) |
| Live Assessment | [390px](screenshots/03-live-390.png) | [Required evidence](screenshots/06-required-evidence.png) |
| Review | [390px](screenshots/04-review-390.png) | [Grouped criteria](screenshots/04-review-details-390.png) |
| Sign-off | [390px](screenshots/05-signoff-390.png) | [Approvals and status](screenshots/05-signoff-details-390.png) |

| Width | Assignments | Overview | Live | Review | Sign-off |
| --- | --- | --- | --- | --- | --- |
| 320px | [View](screenshots/list-320.png) | [View](screenshots/overview-320.png) | [View](screenshots/assessment-320.png) | [View](screenshots/review-320.png) | [View](screenshots/signoff-320.png) |
| 375px | [View](screenshots/list-375.png) | [View](screenshots/overview-375.png) | [View](screenshots/assessment-375.png) | [View](screenshots/review-375.png) | [View](screenshots/signoff-375.png) |
| 390px | [View](screenshots/list-390.png) | [View](screenshots/overview-390.png) | [View](screenshots/assessment-390.png) | [View](screenshots/review-390.png) | [View](screenshots/signoff-390.png) |
| 419px | [View](screenshots/list-419.png) | [View](screenshots/overview-419.png) | [View](screenshots/assessment-419.png) | [View](screenshots/review-419.png) | [View](screenshots/signoff-419.png) |
| Desktop | [View](screenshots/list-1440.png) | [View](screenshots/overview-1440.png) | [View](screenshots/assessment-1440.png) | [View](screenshots/review-1440.png) | [View](screenshots/signoff-1440.png) |

Additional states: [Sections](screenshots/06-sections-sheet.png),
[member](screenshots/06-member-sheet.png), [camera](screenshots/06-camera-sheet.png),
[real photo preview](screenshots/06-photo-preview.png),
[incomplete review](screenshots/04-review-incomplete-390.png),
[local confirmation](screenshots/06-confirmation-sheet.png),
[short-screen card scroll](screenshots/07-short-mobile-evidence.png),
[save failure](screenshots/07-save-error.png),
[theme catalog](screenshots/08-theme-catalog.png),
[dialog](screenshots/08-theme-dialog.png), [sheet](screenshots/08-theme-sheet.png).

## Theme architecture

- `src/styles/spatial-theme.css`: semantic material, state, typography, spacing,
  radius, elevation and motion tokens; V5-only shadcn aliases; responsive layouts
  and portalled Sheet/Dialog/AlertDialog styling. CSS scopes through
  `html[data-assessment-version="5"]` and `.flow-v5`.
- Brand entry points: `--spatial-brand-canvas`, `--spatial-brand-iris`,
  `--spatial-brand-iris-deep`, plus canvas gradient stops, surface tint, selection,
  section and progress aliases under the same prefix. Component styles consume semantic roles.
- `src/components/assessment/spatial-primitives.tsx`: Surface, ActionButton,
  Status, Progress, AssessmentHeader, Choices/Choice, EvidenceComposer,
  LiveCard, Navigation and Sections. Underlying shadcn/Radix primitives retain
  semantic controls, focus trapping and accessible keyboard behavior.
- `src/pages/assessment-flow.tsx`: existing draft/validation/media integration,
  five real screens, version-specific composition. V5 does not inherit V3/V4
  layout classes. Shared `flow-draft.ts` rules remain the functional baseline.
- `src/data/spatial-flow.ts`: isolated V5 draft normalization, two-choice model,
  completion semantics and theme adapter. Coaching in earlier V5 drafts becomes
  unanswered with an explicit reselection notice; V2–V4 storage is untouched.
- `src/pages/design-system.tsx`: expanded interactive Spatial Design System Explorer. The earlier catalog URL remains an alias.

## Verification

Run `npm run build`, `npm run lint`, `npm test`.
Run a Vite dev/preview server, then:

```sh
python scripts/check-spatial.py --url http://127.0.0.1:5173 --screenshots docs/rosa-v5-6/screenshots
```

The final browser suite ran against the production build served by `vite preview`.
[Recorded acceptance output](VERIFICATION.txt). The browser suite covers all 11 criteria, binary radio keyboard selection,
no preselection or auto-advance, required-evidence gating, real image inputs,
preview/removal, media eligibility after reload, typed comment persistence,
review and local sign-off, sheet focus return/trapping, all requested widths,
whole-card scrolling, reduced motion, enlarged text, offline/save failure,
legacy coaching migration, the catalog and V2–V4 comparison.

Photos remain page-session attachments and are not uploaded. Comments and feedback
are local drafts. No backend, verified identity, real signatures, server sync or
certification is invented. See [UX decisions in English and Portuguese](UX_DECISIONS.md).
