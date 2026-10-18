# Rosa V5.8 — Spatial Swipe + Edge-to-edge Assessment Handoff

**Status:** Approved standalone HTML visual/interactivity reference, NOT yet the implemented React V5.8 product. The latest approved version is V5.8. **Codex must implement this in the actual React/shadcn Spatial theme** and deploy a **Vercel Preview**, without touching production or merging main.

## Source of truth

- **Approved interactive HTML source:** `design/rosa-v5-8/approved-reference.html` (on branch `design/rosa-v5-8-handoff`).
- **Static browser preview:** `public/rosa-v5-8/index.html` (viewable at `/rosa-v5-8/index.html` **only if this branch has been deployed to Vercel**; do not mistake this static path for the React app).
- **Real React implementation:** existing open **PR #7** (head `feat/rosa-participant-navigation`, base `feat/rosa-flow-ui-refinement`), plus open PR #4 for earlier V5.6 theme. This handoff branch was created *from the current PR #7 head*, so avoid rebasing on `main` or losing recent participant navigation / evidence validation.
- **Spatial theme/design system:** issue #1 (React V5) and issue #3 (Explorer); do not duplicate tokens or components.

## Approved V5.8 delta from V5.6/V5.7

### A. Frame and top chrome (scope carefully)
1. Remove the **outer fake device frame, rounded viewport corners, clipping mask and bezel shadow** from the *participant demo's full-screen presentation*. This MUST NOT remove the rounded corners on the **actual spatial assessment card**, evidence composer, choice rows, sheets or buttons.
2. The web preview may render a **mock mobile status bar** (time/connectivity/battery) to feel like a realistic phone. This mock is **only for a prototype preview**; on a native smartphone in production prefer the device's actual OS status bar and correct safe-area insets. Never stack mock system indicators over a real device status bar. If there is a demo toggle, document it.
3. Place the **progress bar below the OS safe-area/status indicators, and above the compact header**, with left and right layout gutter. Straight track/fill, 4px tall, no external corner clipping. V5.8 HTML shows one continuous iris-vs-muted fill line; progress is completed/valid criteria divided by 11, not pass count or mere current index.
4. Header: white-lavender seamless canvas, arrow to Overview, Fryer Station title, small 'Food Process & Safety' subtitle, employee Dre avatar/name at right. Header remains in view while card scrolls. No redundant visible count or always-on autosave label. The criterion card itself still has a small '02 / 11' context counter. Respect long names and small screens.
5. Footer remains **Back** (wide labeled white secondary), **Sections** (compact icon only, accessible label), **Next** (wide dark primary), no opaque toolbar background. Preserve existing separate destinations of header Back vs footer Back.

### B. Story-like navigation: swipe left/right
1. On the live assessment **question/card region only**:
   - **Swipe LEFT → Next criterion**.
   - **Swipe RIGHT → Previous criterion**.
   - Animate **question transition** horizontally with tactile follow-the-finger feedback and gentle snap; no looping showy motion, minimal latency, `prefers-reduced-motion` support.
2. Swipe and buttons **MUST call the same React navigation functions and the same criteria/evidence validation**. In particular:
   - No default Pass/Fail, no auto-advance simply by answering.
   - **Cannot swipe forward past unanswered criterion or missing required evidence**, including two-part comment+photo requirements from PR #7.
   - A blocked forward swipe snaps back and displays actionable validation feedback. Do not silently skip or infer success.
   - Back to previous question is permitted without creating/editing the answer.
   - On the last valid criterion, forward navigation may lead to Review *only if the existing flow would do so*; never infer completion/signoff/certification.
3. **Gesture recognition must not break vertical card scrolling.** Use direction detection with a clear horizontal threshold and compare horizontal/vertical deltas; do not call preventDefault until horizontal intent is established. Prefer CSS `touch-action:pan-y` for gesture target, preserve scroll of the whole card.
4. **Exclude textarea, input, selectors, camera/attachment/comment composer, sheets, dialogs, interactive buttons and other controls from swipe capture**. Prevent accidental criterion navigation while annotating evidence or using drawers.
5. Threshold/velocity should be forgiving yet resistant to mis-swipes; distinguish OS edge-back gestures (avoid taking over from screen edges where relevant), and cancel/clean up on touchcancel/multi-touch/route change.
6. **Desktop** may support left/right navigation buttons and optional pointer drag/mouse demonstrator without breaking text selection, click controls or keyboard. Ensure keyboard remains fully navigable and ARIA announces the new question/context.
7. Motion should not hide in-flight save state or cause state loss; autosave/load and per-criterion drafts remain intact. Native mobile smoke test is a must.

### C. Preserve complete previously approved V5.6 Spatial theme / flow
- Real React/shadcn components and one shared token source; maintain product's 5 screens: Assignments → Overview → Live Assessment → Review → Sign-off.
- **Only PASS / FAIL**, no 'Needs coaching' in V5 screen; old coaching drafts never auto-map to fail.
- Preparation/Critical badges, large prompt, supporting copy.
- The whole elevated card scrolls with scrollbar visually hidden; optional inline Comment area and camera button scroll as regular card content; no sticky evidence footer.
- Preserve PR #7 strict *comment/photo/both* configurable evidence types; no fake photo storage server or false certification.
- Preserve realistic offline/save error, required evidence, review and role-based sign-off semantics.
- Theme consistency with Design System Explorer, including shared motion tokens.

## What Codex must implement
- Start from open **PR #7** / `feat/rosa-participant-navigation`. Review PR #4/issue #1 for theme, and issue #3 for reusable component catalog.
- Extract V5.8 changes from approved HTML **as design/interaction reference**; DO NOT embed iframe, webview, raw HTML copy or substitute demo JS for real flow behavior.
- Implement real React gesture handling (well-scoped reusable hook/component), continuous progress component, safe-area & prototype system chrome treatment and polished responsive layout.
- Keep V2–V4 unchanged; avoid global or app-root CSS regressions.
- Update **Spatial Design System Explorer** examples to show progress, gesture-affordance/motion, and navigation states using the production component itself.
- Preserve all other five-screen styling and functional behavior.

## Validation & delivery
- Run `npm run build`, `npm run lint`, `npm test` and existing browser regression. Add a test for swipe-left valid, swipe-left blocked response/evidence, swipe-right back, vertical scroll intact, composer gestures ignored, and reduced motion.
- Test full V5.8 React mobile at **320, 375, 390, 419px**, on short-height devices, with status bar/safe area and keyboard. Test at least one physical mobile if possible; clearly label if not.
- Capture React screenshots/video of card drag threshold, invalid snapback, correct progress and OS chrome/safe areas. No clipping, overlapping bottom controls, missing touch targets or washed-out contrast.
- Publish **a new preview deployment on Vercel from the React implementation branch**. Confirm the actual URL resolves and shows `?version=5`, **not only the static `/rosa-v5-8/` reference**.
- Do **not** replace production, do not merge `main`; open/update a draft PR with source, preview URL and validation results. Add UX decision log EN first / PT second.
- Tell Pedro explicitly whether the live URL is the **static interactive reference** or the **real React V5.8 flow**.

## Design intent

A busy restaurant supervisor should move quickly between criteria with a natural Story-like horizontal gesture **without losing vertical scroll, evidence entry or the certainty of deliberate Pass/Fail observation**. A full-screen edge-to-edge demo enhances realism, but operating-system safe areas remain respected. The top progress is visually quiet yet always perceivable.

**This handoff is not proof of a Vercel deployment or proof that Codex ran.** It is ready for Codex to implement and publish.
