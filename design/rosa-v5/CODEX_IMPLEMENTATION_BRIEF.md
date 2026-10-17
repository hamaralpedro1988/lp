# Rosa V5 — Spatial Flow · Codex implementation handoff

**Task:** Implement `?version=5` as a coherent, fully interactive **Spatial UI** redesign of the existing Rosa **complete assessment journey**, not just the live checklist. Keep existing V2, V3 and V4 completely intact. V4 is the functional baseline; the approved V5 standalone HTML is the **visual and interaction reference**, not a production data model.

## Sources / starting point

1. **Approved visual prototype:** [LearningPool_Rosa_V5_Spatial_Flow.html](./LearningPool_Rosa_V5_Spatial_Flow.html). Open this HTML locally to experience its visual language, animation, physical/tactile feedback, layered cards, progress and contextual sheets. The prototype is illustrative and contains simulated functionality. **Do not replace existing functional logic with fake demo behaviors.**
2. **Existing full journey:** `src/pages/assessment-flow.tsx` (V4 route: `?version=4`).
3. **Existing design and styles:** `src/styles/flow.css`, `src/index.css`, `src/lib/theme*`, `src/components/ui/`, `src/components/assessment/`.
4. **Data/rules:** `src/data/flow-draft.ts`, including 11 criteria, sections Preparation/Frying/Completion, critical rules, required evidence and `flowMissing`/`flowEvidenceOk`.
5. **Routing/version navigation:** `src/App.tsx`, `src/components/layout/version-switcher*`.
6. **Tests:** `tests/flow.test.ts`, `tests/rosa.test.ts`, `tests/theme.test.ts`, plus any relevant current suite.

Create a **new V5 implementation**. Prefer shared functional components with version-scoped styling/animations rather than copying all flow business logic. Keep a **separate persisted V5 draft key**, so V4 data is not mutated. If refactoring shared logic, ensure all previous versions remain stable and tested.

## Design intent: Spatial Flow

A premium *calm spatial interface* for a real, busy restaurant supervisor. There is depth and motion, but **observation comes first**: the UI is quiet until Rosa interacts. Think clean iOS-grade craft plus practical shadcn/ui components; not futuristic VR chrome or excessive glassmorphism.

**Visual source of truth:** inspect the HTML. Suggested initial tokens, extracted from the approved source:

- Canvas `#f3f0fb`, ink `#242339`, secondary text `#76748c`, iris primary `#7363bd` / deep iris `#6453b0`, line `#e8e5f0`.
- Outcome colors: pass `#427764`, coaching `#a5743f`, fail `#b96572`; ensure text/shape also conveys state.
- Inter across headings/body. Layered near-white cards on subtle lavender-grey canvas; very fine edges, ambient background glows, soft diffused shadows, controlled rounded radii.
- Translucency and blur for **navigation layers, overlays, secondary surfaces** only; main questions, answer options, review text and any safety-critical content must remain opaque/readable with accessible contrast.
- Responsive at 320, 375, 390, 430 px and desktop; respect safe-area insets, zoom, larger type and keyboard/scroll.

**Important:** Translate the standalone HTML's styling and ideas into React + TypeScript + Tailwind/shadcn/ui + existing theme/token model. Do **not** ship a pasted `iframe` or replace the app with that HTML. Do not introduce an unrelated design system. Version-scoped classes (e.g. `.flow-v5`) and V5 token aliases are preferred.

## Scope: ALL screens and supporting surfaces

1. **Assignment list / entry:** create a visually rich but functional assessment assignment card; clear assessment status, Dre, station, resumption affordance and distinct CTA. Depth should help hierarchy, not obscure additional assignments.
2. **Overview / pre-assessment:** show Fryer Station, Dre Jackson, assessor Rosa, purpose/goals, sections, critical/evidence context and start/resume. Harmonize cards, icons, summary, and section-preview sheet with spatial language. Do not show an assessment timer as a metric.
3. **Live assessment:** keep one criterion at a time, concise header *Fryer Station + Dre*, segmented progress and compact section context, large question text, consistent `Pass / Needs coaching / Fail` actions, clearly selected state with subtle tactile feedback. Inline Photo and Comment actions should feel like parts of the card. Never auto-advance on selecting an answer; advance only when Rosa taps Next/uses navigation. V4 currently requires an answer before Next; retain functional restrictions and ability to return/edit; do not silently weaken validation rules.
4. **Sections / navigation drawer:** spatial drawer/sheet with preparation/frying/completion, criterion completion status and instant jump/back; preserve scroll/focus and active-criterion context. Visual polish must not introduce hidden gestures.
5. **Photo / Comment evidence:** transform trigger into an elegant contextual sheet/modal (shared-element/morphing impression when technically practical). Maintain existing real media/note flows, their accessibility and required evidence behavior. Photo count, note preview and pending required evidence must be truthful; **the standalone demo's fake photo button is not acceptable in production**.
6. **Review:** fully restyle summary, Pass/Coaching/Fail/Incomplete counts, grouped criterion list, missing evidence warnings, edit jumps and result interpretation. Smooth transition from focused observation into structured summary; critical/fail states easy to scan. Do not imply that assessed = passed.
7. **Sign-off / completion:** consistent spatial hierarchy for Rosa's assessor confirmation, Dre acknowledgement, optional manager countersign when configured, draft/submitted/pending sync states and final confirmation. Never imply completion or certification from local-only unsynced state. Preserve current sign-off limitations and explicitly label demo behavior where no backend identity verification exists.
8. **Global feedback/states:** loading, offline/pending sync/error status, saved draft/resume, confirmation, empty and incomplete states, sheets and dialogs, desktop presentation chrome/version chooser (kept outside Rosa's in-app mobile experience).

## Motion choreography — meaningful, fast, reversible

- **Card transitions:** next/previous directional with mild depth, ~300–380 ms, continuity of context; avoid lengthy staged delays.
- **Tactile answer selection:** short visual compression 120–180 ms, iris outline/surface transition, clear selected marker (not solely color). Re-selecting preserves the ability to change an answer.
- **Progress:** only when a criterion is actually assessed/complete by configured rules; ~200–280 ms; neutral/iris (do not confuse progress with Pass).
- **Evidence sheet:** smooth expansion ~250–320 ms with background gently receding; focus moves into sheet and returns to trigger on close; Escape/back navigation works.
- **Review transition:** careful continuity/matched elements if feasible, ~300–400 ms.
- **Movement should STOP at rest:** no perpetual shimmer, parallax, bounce, ambient drifting, repetitive pulse, confetti, celebratory animations for fail/coaching.
- **Reduced motion:** `prefers-reduced-motion: reduce` switches to minimal or no movement; no motion required to understand state.
- Any added motion dependency (e.g. Motion for React) should be deliberate, small, and compatible with the current build. CSS-only animation is fine if it satisfies quality and accessibility.

## Product constraints / non-negotiables

- Rosa is **observing Dre**, not filling a long form. One criterion visible, large right-thumb-friendly controls, minimal reading overhead and limited header/footer height.
- Preserve **autosave**; no explicit Save, Pause, or assessment stopwatch in the main interface. Save/resume functionality persists. Local demo persistence must not be represented as cloud sync.
- `Pass / Needs coaching / Fail` are the current V4 choices (retain for V5 unless the product owner decides otherwise); no preselection, no automatic next.
- Criteria are sectioned and may be *critical*, *weighted*, and may require **comment OR photo** as evidence. Preserve these rules. Weights are not prominent in the assessment UI; critical and missing evidence are.
- Offline in back-of-house: show *honest* persisted/local pending state; no fictional backend capability.
- Role-specific review/sign-off, automatic completion timestamp **when a valid final completion exists**, full completeness checks, and manager countersign only when configured. Do not invent universal sign-off requirements or claim backend capabilities not built.
- Touch targets ~44px+, keyboard/screen-reader access, usable focus rings, WCAG-compliant contrast, semantic inputs and non-color state indicators.
- Preserve existing V2/V3/V4 functionality, test coverage, and the ability to compare versions. `?version=5` must resolve, and VersionSwitcher must expose V5.

## Implementation steps (proposed)

1. Inspect the approved HTML and current V4, write a brief implementation plan & component inventory.
2. Implement V5 token layer + spatial primitives (card/sheet/response/progress/motion) without touching older styles.
3. Apply to **all five screens** and auxiliary sheets; preserve real behavior.
4. Cover responsive, accessibility, reduced motion, keyboard, local draft state and evidence gating.
5. Add focused tests: `version=5` routing; V4 regression; selection/Next gating; manual navigation; section jump; autosave isolation; required evidence; review/signoff; reduced-motion CSS.
6. Run `npm run build`, `npm run lint`, `npm test` (or repo-provided equivalent) and fix regressions. Verify the experience in mobile viewport and desktop.
7. Open a **draft PR** for review. Provide screenshots or a short recording of all five screens, including choice selection, evidence drawer, review and a narrow device. Call out intentionally illustrative behaviors.

## Acceptance criteria

- [ ] `?version=5` is reachable and V2/V3/V4 stay unchanged.
- [ ] All five screens and all auxiliary surfaces have a cohesive V5 Spatial Flow visual language; not just Live Assessment.
- [ ] Faithfully recognizes the supplied HTML's palette, typography, tactile answers, floating depth, contextual drawers and transition quality.
- [ ] No Save/Pause/timer clutter; explicit final confirmation and truthful autosave/offline semantics.
- [ ] Functional continuity: answers, notes, evidence, status, navigation, review, validation and signoff work as in V4.
- [ ] No automatic advance; selected result retains its state; incomplete and required evidence are respected.
- [ ] Layout usable at small mobile widths and desktop, accessible with keyboard/reader/reduced motion; no clipping/overlaps.
- [ ] Build/lint/tests pass; no broken existing versions.
- [ ] PR includes screenshots of all screens and a changelog of UX decisions (proposed vs implemented), with **EN first, PT second** for inclusion in the Learning Pool UI Design Decisions document.

## Design decision log — update after validation, not automatically

When implementation is complete, document: **(1)** spatial material/tokens; **(2)** tactile feedback and motion; **(3)** consistency across the five stages; **(4)** feedback and progress semantics; **(5)** accessibility and motion trade-offs. Distinguish the V5 design exploration from approved production decisions. **Do not rewrite the Word design-decision document unless separately requested.**

**Do not** change `main` or merge automatically. Build on a dedicated implementation branch and open a draft PR for review.
