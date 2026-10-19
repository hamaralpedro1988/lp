# V5 typography consistency review

The application and Component Library share the existing Spatial stylesheet and Inter Variable font. No dependencies, duplicate components or assessment logic changes.

## Reading roles

| Role | Size / line height | Weight |
|---|---|---|
| Page and task heading | 24px / 30px | 700 |
| Widget heading | 18px / 23.4px | 650 |
| Body description | 16px / 24px | 400 |
| Primary list/response label | 16px / 22.4px | 600 |
| Secondary copy / metadata | 14px / 21px | 400 |
| Secondary recorded value | 14px / 21px | 600 |
| Action label | 16px / 22.4px | 600 |
| Badge / task counter | 12px | compact label |
| Header supporting copy | 12px / 18px | 400 |

Display numbers (scores/stat totals), the simulated lock-screen clock, and compact tab count bubbles retain their distinct purposes. Result tab labels are 14px with 12px counts; the compact 36px tab bar is preserved and can scroll horizontally on narrow screens.

## Changes

Removed the 12px helper / 15px body split between equivalent widgets. Member roles, step and Before you start subtitles, statistic labels, signature state and manager role now share the same 14px/21px secondary role. Assessment descriptions, goals, Next Steps, submission explanations, task guidance and modal explanations use the 16px/24px body role.

Live response descriptions use the secondary role. Comment fields use the body role. Primary labels/actions are 16px. Widget titles remain 18px. Task/page titles are consistently 24px instead of viewport-dependent 24–29px sizing. Header titles use 18px and supporting text uses 12px. The existing spacing and accessible color tokens remain in place.

## Validation

Production build, 39 unit tests and lint (three existing Fast Refresh warnings). Browser measurements check rendered size, weight and line height across Overview, Live, Finish, Result and Submission at 320/390/419px, including no document overflow. Completion, typed/drawn signature, submission persistence and Before you start interaction checks pass. Existing contrast regression tests pass.

Run python3 scripts/check-spatial-typography.py against the local production preview on port 5181.
