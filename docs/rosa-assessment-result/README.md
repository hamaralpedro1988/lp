# Assessment Result and completion

React/shadcn implementation on the existing cumulative V5 branch. V2–V4 retain their workflow.

- Final Finish button and forward swipe open the same confirmation sheet.
- All eleven responses and required comment plus real session photo are validated before completion.
- Close or Escape cancels completion and returns to assessing.
- Slide to complete requires dragging the handle fully right and releasing. A partial drag or ordinary click never completes. Keyboard/screen-reader activation uses two explicit confirmations; blur or Escape cancels the armed state. A brief green completed state precedes Assessment Result.
- Completion records a local completion receipt and opens Assessment Result.
- Responses, comments, navigation to the checklist, reset and observation editing are locked after completion, including after reload.
- A Pass requires no failed critical tasks. Noncritical failures remain visible and included in counts.
- Result shares the actual station heading, surfaces, tokens, filters, task rows and detail sheets with the design system.
- Tasks initially show four rows; View All expands the selected filter. Details are read-only after completion.
- See Insights presents actual passed and critical-failure totals.
- Next Steps follows Tasks. Sign Off continues the existing feedback/acknowledgement flow.

## Prototype boundary

Completion persists in browser storage, not on a server. Clearing browser data removes local records. A validated photo count is stored in the receipt; original files are still session-only. After reload the detail sheet explicitly explains that the original photo is unavailable, rather than showing a fake attachment. Acknowledgements and submission are not implemented backend operations, so next-step copy describes the current feedback/sign-off workflow without claiming submission.

## Validation

Production build and unit suites pass. Lint has only the three existing Fast Refresh warnings in button, badge and tabs. Chromium mobile checks cover missing-evidence guard, cancellation, real photo attachment, completion, four-row expansion, read-only task details, reload lock, insights and sign-off at 320/390/419px. Screenshots alongside this file show confirmation and result.

Scoring: explicitly approved by the user — Pass if no critical task fails.
