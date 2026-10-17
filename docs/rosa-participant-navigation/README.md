# Participant navigation

V5 now uses `SpatialFlowHeader` across Assignments, Overview, Live Assessment, Review and Sign-off. Live retains its person and evidence-aware segmented progress. Back targets remain contextual; Assignments has no artificial back action.

The V5 participant DOM no longer includes version selection, presentation rails, direct screen shortcuts, sample/reset controls, offline simulation, Theme Studio links or design rationale. Developer tools remain accessible through their dedicated routes. Desktop uses a centered responsive application column rather than the presentation shell; mobile remains edge to edge. V2–V4 are unchanged.

Validation: production build, unit suites, lint (three existing Fast Refresh warnings), `check-spatial.py`, `check-design-system.py` and `check-participant-navigation.py`. The latter checks all five screens at 320, 390 and 1440px, back destinations and absent internal controls.

## Desktop device presentation

The participant preview now has a Galaxy A55-inspired decorative shell above 650px: handset proportions (76.5:161.1), graphite bezel, centered camera, side keys and a gesture bar. It fits the viewport without scaling app text or intercepting input. At mobile widths the shell disappears and the app remains full screen. No simulated OS buttons, version controls or presentation rails are added.

## Copy and progress refinement

Removed “Before you begin” from the Overview. Removed generic “Category 2” metadata from V5 Assignments and Overview (legacy versions retain their category). Reviewed participant copy across entry, overview, observations, evidence, review, feedback, acknowledgements, section navigation, migration, offline/save errors and completion. Labels use direct assessor language, response descriptions are parallel, and local-only review wording avoids suggesting a submission or certification occurred. Existing assessment criteria and scoring logic are unchanged.

The segmented progress indicator is inset with the same `--spatial-space-gutter` as the content. Narrow layouts use that gutter too. The participant browser check compares actual left/right progress bounds with content padding at 320/390/1440px, in addition to asserting the removed Overview content is absent.

## Device overlay containment

V5 supplies an optional portal container to the shared Sheet, Dialog and AlertDialog primitives. Its overlay host lives inside the device screen, establishes the fixed-position containing block, and clips to the screen radius. Both the dimmed backdrop and content stay inside the device; sheets have a height limit relative to that screen and scroll internally. Dedicated tools and legacy flows keep Radix's default body portal.

`check-device-overlays.py` measures member/sections/photo content and backdrops at 320/390/1440px, checks the last criterion remains reachable, focus restoration on close and selection, and an open panel resized from desktop to short desktop to mobile.

## Evidence requirement presentation

Required evidence is communicated only by the composer helper (“Comment or photo required”), matching the existing either/or validation. Removed the camera-only Required badge and the camera button's required-state highlight. The button remains neutral while evidence is missing; its attachment indicator still reflects an added photo. Section and Critical tags are unchanged. Regression checks assert the helper, neutral button and absent Required badge, and exercise photo/comment completion.
