# Read-only assessment preview

The Overview’s “What you will observe by step” widget now ends with the secondary “Preview assessment” action. Start/Resume remains the primary page CTA.

The sheet browses the eleven actual tasks using Previous and Next task. It shares SpatialTaskHeading with Live Assessment and uses the same SpatialCriterionGuidance component through a labeled trigger. It shows the real section, position, Critical flag, description and separate photo/comment requirements from spatialEvidenceRequirement. Optional evidence is explicit.

No draft, answer handlers, note handlers, camera controllers or navigation-to-live callbacks are passed into the preview component. It cannot start, complete or edit an assessment. Closing returns to Overview; the last task offers Back to overview. Reopening starts at task 1 while the real assessment position remains untouched.

The nested guidance sheet returns to the same preview task. Browser Back dismisses the active sheet. Keyboard focus moves to each new task heading and returns to the preview trigger on close. The parent sheet is contained in the phone, has an independently scrolling body, safe-area footer and 44px close target. The same component is available in Rosa Flow Components in the library.

Validation: production build, 39 unit tests, all eleven titles and actual critical/evidence rules, absence of Pass/Fail or evidence editing controls, nested guidance, preserved local draft/answers/notes/feedback/index, first/last/previous/next behavior, reset-on-reopen, focus restoration, Escape and browser Back, actual resume after closing, 320/390/419px and short 520px viewport. Lint retains three existing Fast Refresh warnings.

Run python3 scripts/check-spatial-assessment-preview.py against the local production preview on port 5181.
