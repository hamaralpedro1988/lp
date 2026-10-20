# Assessment Overview visual refinement

The React V5 Overview follows the supplied reference using the existing shadcn Card, Badge, Button, Separator and Sheet components and the Spatial tokens. The shared station heading and people/learning components are also used by the Explorer’s People & context story.

- Station thumbnail, title/subtitle and actual task count.
- Existing Dre photo/profile action, e-learning score row, live assessment status and assessor.
- “The assessment” description split into the two supplied paragraphs.
- Four existing goals with their meaningful icons.
- “What you will observe by step” uses the actual 3/5/3 tasks and existing section previews.
- Start/Resume/Review behavior, saved draft, media/evidence rules, branding, live cards, Review, sign-off and V2–V4 remain intact.

## Learning data boundary

`src/data/spatial-overview.ts` holds **8.4 as the explicit prototype example from the reference**. Its panel identifies it as an example. No score denominator, question results, dates, pass threshold, LMS integration or completion claim has been invented. The learning score never controls assessment eligibility. The type/prop accepts a future connected learning result without duplicating card styles.

The station thumbnail is an AI-generated illustration; Dre’s existing generated avatar is reused.

## Screenshots

Actual production React build in Chromium; browser emulation, not a physical-device test.

- [320px top](screenshots/spatial-top-320.png)
- [390px top](screenshots/spatial-top-390.png)
- [419px top](screenshots/spatial-top-419.png)
- [Goals and description](screenshots/spatial-goals.png)
- [Task steps](screenshots/spatial-sections.png)
- [Learning result example panel](screenshots/spatial-learning.png)

## Verification

Build passes. All 33 unit tests pass. Lint has only the three existing Fast Refresh warnings. Browser checks covered 320/390/419px in Spatial, McDonald’s and Burger King, station image loading, member/learning focus restoration, unchanged draft, four goals, actual section counts, Start Assessment and the real Explorer composition. The complete flow regression passed at 320/375/390/419/1440px, including actual media, strict evidence, Review/sign-off, persistence, offline/error, migration and V2–V4.
