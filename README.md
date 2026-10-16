# Learning Pool — S2S Assessment foundation

A neutral component playground, ready for iterative product design. Includes the first Fryer Station observation screen and the design playground. No backend or authentication is implemented.

## Develop

Requires Node.js 22.12+ (validated with Node 24) and npm.

```sh
npm ci
npm run dev -- --host 0.0.0.0
```

Vite serves port 5173. Use your environment's port forwarding facility, or open the printed local address when running on your own machine. `npm run build` checks TypeScript and creates `dist/`; `npm run preview -- --host 0.0.0.0` serves that build. `npm run lint` runs Oxlint.

In this cloud environment, use `npm_config_cache=/workspace/.npm-cache` when running npm if the default home cache is unavailable.

## Structure

- `src/components/ui/`: the 16 official shadcn/ui components.
- `src/components/layout/`: shared playground shell and navigation.
- `src/components/assessment/`: reserved for future assessment components.
- `src/pages/`: interactive component playground.
- `src/data/`: reserved for future mock data.
- `src/lib/utils.ts`: shared `cn` utility.
- `src/styles/theme.css`: project light/dark tokens supplied from shadcn/create and Tailwind mappings.
- `src/index.css`: global typography, touch targets, and reduced-motion support.

Tailwind 4 uses the Vite plugin and CSS-first configuration; no `tailwind.config.js` is needed. `@/` resolves to `src/` in both TypeScript and Vite. Change semantic tokens in `theme.css` to theme the application later. The default view is light; dark tokens are ready for a future theme control.

## Components and provenance

Installed: Button, Card, Badge, Input, Textarea, Checkbox, Radio Group, Select, Progress, Separator, Dialog, Alert Dialog, Sheet, Tabs, Tooltip, Skeleton. These are the official Radix-based `new-york-v4` sources, installed through the official shadcn CLI v4.21.5 using a local registry bundle. Only imports were mapped to the project aliases.

The environment blocked `ui.shadcn.com`, so official documentation and source were read from `shadcn-ui/ui` on GitHub, commit `c6bcc126efb9ffa28218f39a931b6cc572fa8473`. The CLI fetched its neutral color metadata from that same official GitHub repository using the supported `REGISTRY_URL` override. No UI components were recreated.

For future additions with registry network access enabled:

```sh
npx shadcn@latest add <component>
```

The playground demonstrates hover/focus samples and real keyboard focus, disabled controls, email validation, selections, tabs, skeletons, tooltips, progress, and dismissible overlays. Use Tab/Shift+Tab, Enter/Space, arrow keys in grouped controls, and Escape in overlays.

## Verification

Validated dependency installation with `npm ci`, TypeScript and production bundling with `npm run build`, and lint with `npm run lint`. The official UI files produce three non-blocking Fast Refresh export warnings.

Chromium smoke checks passed at 390px, 768px, and 1440px with no page-level horizontal overflow or runtime errors. Checks exercised invalid/valid email submission, dialog Escape dismissal and trigger focus restoration, progress updates, confirmation reset, sheet dismissal, loading/preview tabs, and select changes. Browser-check tooling was temporary and is not an application dependency.

## Theme Studio

The application opens in the Fryer Station assessment prototype. Open `?studio=1` for the Portuguese Theme Studio. The editor changes semantic tokens in an isolated, interactive playground iframe (`?preview=1`), including portalled dialogs and menus. The editor itself stays neutral.

- Eleven starting presets: the supplied shadcn/create theme, neutral, ocean, forest, plum, ruby, amber, teal, indigo, rose, and slate. Presets replace both color modes and the radius.
- Edit 37 semantic colors through the native color picker or a six-digit HEX or OKLCH value (apply with Enter or blur).
- Light and dark colors are independent; radius (0–24px) is shared.
- Preview a real 390px mobile or 1200px desktop viewport, scaled to fit the available space.
- On smaller screens, switch between editing and preview using the top panel controls.
- Seven text contrast checks use the WCAG relative-luminance formula and the 4.5:1 AA threshold for normal text. These are limited checks, not a complete accessibility audit.
- Edits persist locally in this browser. Reset requires confirmation. Export both modes by copying CSS or downloading `theme.css`; applying the exported tokens to source remains a deliberate separate step.

The theme model, presets, validation, contrast calculation, and CSS export are in `src/lib/theme.ts`; the editor is in `src/pages/theme-studio.tsx`; the isolated preview is in `src/components/theme/theme-preview.tsx`. No new runtime dependencies were needed.


### Typography and expanded color tools

Choose independent body and heading families from System, Inter, Roboto, Lora, Georgia, and Monospace. Inter, Roboto, and Lora are bundled locally through Fontsource; they do not depend on external font requests. Body base size (14–20px), body line height (1.2–1.8), and heading weight (400–700) apply in both modes. Typography has a dedicated sample in the editor and playground. Existing text utilities keep their relative size roles; explicit line heights in components are retained.

Colors are grouped into surfaces/text, actions/controls, status, charts, and sidebar tokens. Twenty quick swatches can be applied to any selected token. Status surfaces, illustrative chart bars, and a sidebar sample show the additional tokens in context. Color presets preserve typography; resetting the entire theme resets typography too.

Legacy browser themes automatically gain default typography and the new tokens while preserving existing color overrides and radius. CSS export includes typography variables, body/heading rules, all color tokens, and both modes. When using the CSS in another project, install/import any selected Fontsource fonts as indicated in the export header; this project already includes them.

`npm test` uses Node's test runner (Node 24 recommended) for migration, invalid saved data, presets, contrast reference values, and CSS export. Browser checks also verified font files actually load, the computed styles update, typography survives reload and color preset changes, additional colors render, CSS reproduces typography, and mobile editing works.


### Applied shadcn/create theme

The project default now uses the exact supplied OKLCH tokens and `--radius: 0.45rem` in `src/styles/theme.css`. The same values are in `src/data/creator-theme.json` for the editor's **O teu tema** preset. Tests verify that global CSS, default palettes and export agree for every supplied token, including dark border/input alpha. Status colors and typography were not specified in the supplied theme; status defaults remain and previous typography choices are retained.

The editor accepts HEX and OKLCH strings without rounding or converting their stored values. Its native color picker displays an approximate opaque sRGB HEX swatch; editing through that picker intentionally replaces the value with HEX and removes alpha. Use the text field to preserve or edit OKLCH transparency. Contrast calculations convert to sRGB using Culori and composite alpha (a transparent background uses a white underlying surface).

Browser draft storage is now `lp-theme-studio-v2` so the supplied palette appears on the first visit to this release. Older drafts remain untouched in `lp-theme-studio-v1` and can be restored with **Recuperar ajustes anteriores**. Restoring a preset preserves typography; **Repor o teu tema** resets the full theme to the supplied project default.


## First assessment screen

The root route shows the reference's first criterion: **Checks fryer readiness and oil conditions**, Preparation 1 of 3. The interface uses the applied theme and the current saved typography/colors. Theme Studio remains available at `?studio=1`; the component iframe remains at `?preview=1`. Routes are loaded separately.

Implemented interactions: mutually exclusive observation result, note editor with save/cancel/remove, local image/video attachment previews and removal, elapsed timer with pause/resume, focus view, and a checklist sheet reflecting the current result. Focus view only reduces interface distractions; a website cannot suppress device calls or notifications.

Only the supplied criterion is defined. Back is disabled; Next is disabled, with an explanation that the next criterion is not available. Criteria 2 and 3 are clearly marked as undefined rather than fabricated. Text notes, results, and elapsed time are saved in this tab’s sessionStorage; reload restores the draft with the timer paused. Attachment object URLs are temporary and reload/navigation clears them. Files are never uploaded. Theme choices continue to persist separately in browser storage.

Chromium checks exercised selection, note save/cancel, image add/remove, actual timer pause/resume, focus view, checklist status, prototype navigation limits, route links, and layouts at 390/768/1440px.


### Mobile interaction pass

The assessment is now an edge-to-edge, viewport-height mobile screen (centered at a phone width on larger screens), with a fixed header, independently scrolling content, and fixed bottom navigation. Safe-area insets protect the top and bottom controls. Touch actions use large row targets and icon buttons at least 44px square.

Checklist, pause controls, notes, media sources, and evidence preview use bottom sheets. Browser Back dismisses an active sheet first. Dismissing pause controls does not resume timing; Resume is explicit. Unsaved note edits require a discard decision. The note sheet follows `visualViewport` dimensions to leave room for the on-screen keyboard and its editor uses 16px text to avoid iOS focus zoom.

The media chooser separates rear-camera photo capture, video capture, and library selection via native file inputs. `capture="environment"` is a browser/device hint, not a guarantee of camera availability. Evidence can be opened in a larger preview, and video uses inline playback controls. No upload occurs. Focus view reduces UI distractions only; OS notifications and calls are unaffected.

`use-assessment-draft.ts` stores text/results/timing in `sessionStorage` under `lp-assessment-draft-v1`. The timer pauses on page visibility loss, and restored drafts start paused. Media remains in memory only. `use-mobile-overlay.ts` handles sheet Back navigation and keyboard viewport measurements.

Chromium touch-emulation checks passed at 320/390/430/768px: whole-row radio selection, fixed navigation during scroll, note save and discard guard, Back dismissal, media capture attributes and preview, explicit resume, simulated background pause, draft reload recovery, and disabled unavailable criteria. Reduced-height viewport checks verify note actions stay visible, but native camera and actual iOS/Android soft-keyboard behavior still require physical-device verification.


### Simplified checklist exploration

The default assessment route now uses a compact checklist rather than one page per criterion. All three slots stay in context; only the defined first criterion is interactive. Tap its row to expand inline rating and evidence controls, then collapse it to see the updated status and note indicator. Hidden details stay mounted so collapsing preserves attached media. Progress counts assessed criteria rather than the currently viewed position. There are no Back/Next controls or redundant bottom navigation in this version.

The original mobile screen is retained at `?view=step`, accessible through **Assessment options → View one criterion at a time**. The two layouts share the same tab-scoped result/note/timer draft. Files remain page-local and do not survive navigation between layouts. Theme Studio remains at `?studio=1` and is available in the options sheet.

Touch tests validated overview/expansion, inline result changes, progress, note and media retention across collapse, timer pause/Back, layout comparison with draft preservation, and 320/390/430/768px widths.


## Rosa V2 — supplied compact checklist

The default route now implements the supplied `LearningPool_Rosa_V2_Compact_Checklist.html` as React components. It uses the reference's compact Inter typography, neutral surfaces, green/red decision states, section pills, swipe actions, full criterion details, and completeness review. The original single-criterion route remains at `?view=step`; Theme Studio is at `?studio=1`.

The supplied ten criteria are in `src/data/rosa-criteria.ts` (Preparation 3, Frying 4, Completion 3). The configuration weights, critical flags, and the f2 evidence rule are expressly illustrative. Review reports observed counts and missing evidence; it does not calculate a certification score, submit data, or implement sign-off.

- Tap ✓ / ✕ to select a result; tap the selected value again to clear it.
- Tap criterion text to open question, observation guidance, illustrative configuration, assessment, and evidence.
- Swipe a row left to reveal note/media actions. The same actions remain accessible from details without a gesture.
- Section pills scroll within the list; scrolling updates the active section.
- Review reports unanswered criteria and any configured evidence gaps, with direct links to details.
- Reset requires confirmation and clears responses, notes, media and elapsed time. This supplied version exposes image capture/library options; the previous layout retains video support.

Answers/notes are validated and stored under localStorage key `lp-rosa-compact-v1`; the first existing criterion draft is migrated when applicable. Timer interruption behavior remains tab-scoped. Photos/videos remain in memory, survive list/detail transitions, and are released on reset or page exit. File names alone are never counted as available evidence after reload. The UI makes this storage distinction explicit. Local-save failures are reported.

Shared evidence controls now expose an imperative controller for swipe shortcuts and use unique accessible field IDs per criterion. Nested browser Back navigation keeps criterion detail open when dismissing a note or media sheet.

Validation: production build, lint (three existing official UI Fast Refresh warnings), nine unit tests, and Chromium touch checks for quick toggle/clear, swipe notes, details, nested Back, section jumps, evidence gaps, review (including all ten complete), actual per-item attachment retention, local reload, menu review, reset/cancel and widths 320/390/430/768px.


## Current default — Rosa V2.3 focused cards and mixed responses

The latest supplied `LearningPool_Rosa_V2_3_Focused_Cards_Mixed_Responses.html` replaces the default list with nine focused cards: Preparation (3), Frying (4), Completion (2). It uses the reference's blue active-card treatment and Inter typography, one expanded criterion at a time, inline guidance, evidence actions, and a subtle one-shot number pulse after advancing. Controls retain at least 44px touch targets; reduced-motion preferences suppress animation.

`src/data/focused-criteria.ts` contains the supplied binary, 1–5 rating, numeric measurement, single-choice, and multi-select criteria. Numeric and multi-select values are only committed with Record. Numeric zero and comma decimals are accepted; negative/non-finite values are rejected. Ratings have no implicit pass/fail threshold. The p2 criterion requires a note or available photo before counting as complete, irrespective of its binary answer.

Answering a complete criterion advances to the next pending card after a brief delay. Manual navigation, editing, opening a sheet, or pausing cancels pending advancement. Required evidence keeps the card active until supplied. The footer offers Save, Review, and Next pending (or Review assessment when complete). Review is a bottom sheet with summaries for every section; sign-off remains an explicit prototype placeholder.

New draft key: `lp-rosa-focused-v2-3`. It stores committed answers, notes, active card, guidance state, and uncommitted numeric/multi drafts. Compatible p1/p2/c2 answers and notes can migrate from `lp-rosa-compact-v1`; changed observation types are not guessed. The old draft key stays untouched. Photos remain actual page-session objects, and progress is recalculated without them on reload. Timer/background/Back/keyboard behavior continues through shared mobile hooks. Pause locks response inputs while retaining readable guidance and evidence.

Implementation: `focused-response.tsx` renders the five response controls; `focused-draft.ts` validates and migrates drafts; `use-focused-draft.ts` handles local persistence; `focused.css` adapts the supplied card styles. Shared evidence controls support compact display and restore focus to the visible calling action.

Validation: 14 unit tests plus Chromium touch tests for all five response types, automatic focus, required evidence, zero/comma measurement values, explicit multi confirmation, complete review, pause, reload with missing session photos, reset, 44px rating controls and 320/390/430/768px widths. A separate browser run verifies legacy migration preserves the old draft and restores uncommitted numeric/multi values without counting them as recorded.


## Question bottom sheet and inline comment

The default assessment now keeps all nine cards compact. Tapping a criterion opens a modal sheet from the bottom with the question, response controls, guidance, an always-open Comment textarea, and photo evidence. The list stays behind the overlay; browser Back/outside/close dismiss the sheet and restore focus to the current row.

Comments are controlled by the existing per-criterion notes map and saved locally on every change. There is no Add note button or extra comment modal in this flow. Required-evidence rules accept a non-blank comment or available session photo. Pause makes the question read-only and provides an explicit Resume action.

Selecting or recording an answer no longer advances automatically: **Continue** leaves time to comment, then changes the question inside the same sheet. The action stays disabled until the criterion is complete. When all criteria are complete, it opens Review assessment. Closing the question never discards a recorded answer or comment.

The sheet has a fixed action footer, a scrollable question body, keyboard-aware height/bottom placement via visualViewport, 16px comment input, safe-area padding, and reduced-motion support. Existing media controllers remain mounted outside the question portal; gallery previews are portalled into the active question, preserving actual files across sheet dismissal and question changes without an upload.

Chromium touch checks passed for all five response types, explicit continuation, comment persistence/whitespace rules, nested photo/preview Back behavior, focus restoration, review-to-question navigation, per-criterion gallery retention, reduced-height keyboard simulation, pause/reload recovery and 320/390/430/768px widths. Native keyboard/camera verification on a physical device remains necessary.

## Side-by-side versions — Rosa Flow v0.1

The supplied `LearningPool_Rosa_Flow_v01.html` is integrated as a separate React experience. **Versões** opens a bottom sheet with direct links. It is available in the V1 header and in V2’s external desktop presentation sidebar:

- `/` or `?version=1`: the existing compact nine-criterion checklist and question bottom sheet (V1).
- `?version=2`: the new Rosa Flow experience (V2), including Assessments, Overview, Live checklist, Review, and demonstration sign-off.

V2 preserves the reference's eleven observations (Preparation 3 / Frying 5 / Completion 3), three response states, illustrative critical flags and underlying weight configuration (weights are hidden from the question UI), and required note-or-photo evidence on product quality. It starts on criterion 5, as in the supplied HTML. V2 has no presentation header inside the app. Screen shortcuts, version switching, sample/reset tools and Theme Studio remain in the external desktop sidebar; the offline simulation toggle remains outside the phone. On mobile, only the app screens and their own controls are shown; use `?version=1` or `?version=2` for direct version access. Mobile uses the actual browser viewport without a simulated status bar or home indicator, with safe-area spacing on its content. Both versions keep their original navigation and independent drafts.

Comments remain visible and save per keystroke. V2 uses `lp-rosa-flow-v2-v01` in localStorage and never migrates or overwrites V1 answers. Browser Back dismisses open sheets. Responses and comments autosave on every change. The fixed assessment footer contains Back, Sections, and Next; Back is disabled on the first question, and Next opens Review after the final question. Sections opens a bottom sheet with progress for Preparation, Frying, and Completion, jumps to the first question in the selected section, and also provides Review all. Reset has confirmation and affects V2 only.

Real photo/video attachments use the shared native camera/library chooser, previews and removal. Controllers stay mounted across screen/criterion changes. Only current-session images qualify as photo evidence; videos and stored file names do not. Reload or switching versions releases attachments, and review recalculates missing evidence. Text survives. Local storage failures are visible.

The response options are Pass, Needs coaching, and Fail. All three count as recorded results; required evidence still applies. Legacy Not observed drafts stay pending and are never silently converted to Fail. Review includes Pass/Fail counts, and feedback highlights recorded failures or coaching without inventing a certification threshold. Sign-off is gated by completeness; changing observations, feedback or evidence clears the demo assessor confirmation. Online/offline toggles simulate status only. Assessor review never grants real approval, sync or certification.

Implementation: `src/pages/assessment-flow.tsx`, scoped `src/styles/flow.css`, validated data/storage model `src/data/flow-draft.ts`, and shared `src/components/layout/version-switcher.tsx`. V1 and V2 are lazy-loaded independently.

V2 applies the supplied shadcn Creator theme exactly, including its OKLCH light/dark tokens and 0.45rem base radius. The assessment stylesheet uses semantic surface/text, primary, input, border, focus and sidebar tokens rather than the HTML reference palette. Existing success/warning tokens distinguish outcomes; critical/failure tints and supporting text derive from theme colors with readable contrast. The compact header and question hierarchy are retained. V2 is fixed to light mode. Its typography is increased by at least 2px across questions, headings, badges, supporting text, fields, buttons and portalled sheets/media controls. The smallest labels use at least 12px, and textareas use 18px. Shared typography tokens are scoped to V2; at narrow widths the review statistics use two columns for readability. V2 does not overwrite saved Theme Studio settings.

Validation: 18 unit tests, production build, lint (three pre-existing official UI Fast Refresh warnings), Chromium mobile interaction checks across the complete V2 flow and the existing V1 question-sheet flow, widths 320/390/430/768/1440px, and a reduced-height keyboard simulation. Native camera and keyboard behavior still need physical-device verification.
