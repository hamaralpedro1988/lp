# Spatial Design System Explorer

A React reference for the approved Rosa V5.6 Spatial Flow design language. Open
`/?view=design-system`. The earlier `/?version=5&catalog=1` URL is a compatibility
alias. Use `&section=rosa` to open **Rosa Flow Components** directly.

## Explore

- **Foundations:** live semantic token values, copy/export, color and brand aliases,
  typography, real component spacing, shape/elevation, motion and reduced-motion
  guidance. Neutral/Original and Spatial compare the same installed shadcn exports
  using local palette aliases; saved theme preferences remain unchanged.
- **Core UI Components:** a searchable/grouped manifest of the actual installed
  `src/components/ui` inventory. Each entry renders the real component, supported
  variants/states, usage/avoidance, keyboard behavior, semantic mappings, import/JSX
  and its source link. Counts derive from the manifest, checked against the folder.
- **Rosa Flow Components:** actual assignment, people/context, assessment header,
  live card, binary response, composer, navigation, sections, progress, review,
  feedback/approvals and system-status exports. Each has Purpose, Anatomy, States,
  UX rationale, screen usage, JSX and source references. Controls switch isolated
  fixture states; review links open the actual live-card editor within the story.
- **Usage & theming:** guidance for continuous canvas, mobile interaction,
  accessibility, brand aliases, safety semantics and contribution boundaries.

Navigation links connect Explorer, Theme Studio, Component Playground and Rosa V5.
The existing Theme Studio is still the editor/exporter. No second editor was added.
Spatial Light is approved; Dark is not designed or presented as approved.

## Shared architecture

| Responsibility | Actual source |
| --- | --- |
| V5 theme and component material/state/motion styles | `src/styles/spatial-theme.css` |
| Token extraction and installed inventory metadata | `src/data/design-system/catalog.ts` |
| Reused catalog shell | `src/components/layout/playground-layout.tsx` |
| Installed shadcn live previews | `src/components/design-system/core-preview.tsx` |
| Shared header/card/choice/composer/footer/progress/sections/status | `src/components/assessment/spatial-primitives.tsx` |
| Shared assignment/people/review/feedback/approval patterns | `src/components/assessment/spatial-journey.tsx` |
| Shared real photo thumbnail/metadata/removal | `EvidenceAttachment` in `src/components/assessment/evidence-panel.tsx` |
| Isolated story fixtures using the actual assessment model | `src/data/design-system/fixtures.ts` |
| Story composition and safe simulated callbacks | `src/components/design-system/rosa-preview.tsx` |
| Searchable pattern metadata and JSX examples | `src/data/design-system/rosa-patterns.ts` |
| Explorer-only page layout, not a second component theme | `src/styles/design-system.css` |

The token catalog imports the exact shared stylesheet as raw text. It extracts its
actual declarations and resolves values from the active CSS environment; no second
hardcoded color/value table exists. Export downloads those same declarations.
V5 uses semantic shadcn aliases and `--spatial-*` roles; client adaptation enters
through `--spatial-brand-*`. Keep Pass/Fail and warning semantics independent of
branding. Live card geometry/typography/motion use named tokens as well.

Rosa V5 **and** the Explorer import `spatial-journey.tsx`, `spatial-primitives.tsx`
and the installed `ui` components. Review/sign-off and entry patterns were extracted
from the existing flow; V2–V4 retain their earlier compositions and persistence.

## Usage example

```tsx
import { SpatialAssessmentHeader, SpatialLiveCard, SpatialNavigation }
  from '@/components/assessment/spatial-primitives'
import { SpatialReviewSummary, SpatialReviewList }
  from '@/components/assessment/spatial-journey'
import { flowMissing } from '@/data/flow-draft'

const canContinue = !flowMissing(draft, photos).includes(draft.index)

<SpatialAssessmentHeader draft={draft} photos={photos}
  saveError={saveError} onBack={openOverview} />
<SpatialLiveCard draft={draft} photos={photos} direction="next"
  titleRef={titleRef} onAnswer={onAnswer} onNote={onNote}
  onCamera={openCamera} galleryRef={setGalleryTarget} />
<SpatialNavigation index={draft.index} canContinue={canContinue}
  sectionsRef={sectionsRef} onBack={previousCriterion}
  onSections={openSections} onNext={nextCriterion} />
<SpatialReviewSummary draft={draft} photos={photos} />
<SpatialReviewList draft={draft} photos={photos} onEdit={editCriterion} />
```

Apply the existing V5 scope/theme as the product does; do not copy materials into
page-specific stylesheets. Controlled props/callbacks keep persistence, media and
navigation in the host workflow. The Explorer substitutes only safe callbacks and
in-memory fixtures, not a separate visual implementation.

## Safe preview boundaries

Explorer stories never read/write an assessment draft or persisted theme. They do
not request camera/library access, upload, submit, sign or certify. The camera story
adds a clearly labelled generated illustration to local React state and renders the
real shared attachment component. Per-criterion association, preview and removal
remain testable. Sign-off is a fixture-only confirmation with explicit limits.

The same completion/evidence helpers drive real flow and stories. A completed Fail
counts as assessed, while a Pass missing required evidence remains incomplete.
Pending server sync is documented as unimplemented, not fabricated as a live state.

## Visual review

| Area | Desktop | Mobile / detail |
| --- | --- | --- |
| Foundations | [Overview](screenshots/01-foundations-desktop.png) | [390px](screenshots/foundations-390.png) |
| Core UI Components | [Actions and guidance](screenshots/02-core-ui-desktop.png) | [390px](screenshots/components-390.png) |
| Rosa Flow Components | [Full story and usage](screenshots/03-rosa-components-desktop.png) | [Mobile preview](screenshots/03-rosa-mobile-preview.png) |
| Typography | [Shared roles](screenshots/01-foundations-typography.png) | |
| Shape/elevation | [Shared roles](screenshots/01-foundations-shape-and-elevation.png) | |
| Motion | [Shared roles](screenshots/01-foundations-motion.png) | |
| Overlays | [Dialog](screenshots/02-core-dialog.png) | [Rosa Sections](screenshots/03-rosa-sections.png) |
| Journey patterns | [Review](screenshots/03-rosa-review.png) | [Sign-off](screenshots/03-rosa-signoff.png) |

| Width | Foundations | UI Components | Rosa Flow Components |
| --- | --- | --- | --- |
| 320px | [View](screenshots/foundations-320.png) | [View](screenshots/components-320.png) | [View](screenshots/rosa-320.png) |
| 375px | [View](screenshots/foundations-375.png) | [View](screenshots/components-375.png) | [View](screenshots/rosa-375.png) |
| 390px | [View](screenshots/foundations-390.png) | [View](screenshots/components-390.png) | [View](screenshots/rosa-390.png) |
| 419px | [View](screenshots/foundations-419.png) | [View](screenshots/components-419.png) | [View](screenshots/rosa-419.png) |

## Validation

```sh
npm run build
npm run lint
npm test
npm run preview -- --host 127.0.0.1 --port 5181
python scripts/check-design-system.py --url http://127.0.0.1:5181
python scripts/check-spatial.py --url http://127.0.0.1:5181
```

Tests cover inventory synchronization, token-source changes, isolated fixtures,
actual export references, all installed primitives, portals/focus, token copy/export,
real pattern callbacks with safe media/sign-off, required evidence, storage isolation,
parity with Rosa V5, mobile layouts, reduced motion/larger text, Theme Studio
editing/export and V2–V4. The full production-build Rosa journey suite also runs
following extraction. Lint retains only the three pre-existing Fast Refresh warnings.

[Acceptance output](VERIFICATION.txt) · [UX decisions: English then Portuguese](UX_DECISIONS.md).
