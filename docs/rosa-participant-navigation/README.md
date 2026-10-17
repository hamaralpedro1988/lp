# Participant navigation

V5 now uses `SpatialFlowHeader` across Assignments, Overview, Live Assessment, Review and Sign-off. Live retains its person and evidence-aware segmented progress. Back targets remain contextual; Assignments has no artificial back action.

The V5 participant DOM no longer includes version selection, presentation rails, direct screen shortcuts, sample/reset controls, offline simulation, Theme Studio links or design rationale. Developer tools remain accessible through their dedicated routes. Desktop uses a centered responsive application column rather than the presentation shell; mobile remains edge to edge. V2–V4 are unchanged.

Validation: production build, unit suites, lint (three existing Fast Refresh warnings), `check-spatial.py`, `check-design-system.py` and `check-participant-navigation.py`. The latter checks all five screens at 320, 390 and 1440px, back destinations and absent internal controls.

## Desktop device presentation

The participant preview now has a Galaxy A55-inspired decorative shell above 650px: handset proportions (76.5:161.1), graphite bezel, centered camera, side keys and a gesture bar. It fits the viewport without scaling app text or intercepting input. At mobile widths the shell disappears and the app remains full screen. No simulated OS buttons, version controls or presentation rails are added.
