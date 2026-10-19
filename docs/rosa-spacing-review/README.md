# V5 widget spacing review

The existing Spatial tokens now use the shared 4px scale.

- Card edges: 20px block/inline; inline reduces to 16px below 350px.
- Card heading to body: 16px.
- Related metadata rows and icon/text groups: 12px.
- Closely related name/role lines: 4px.
- Nested statistic tiles and list-row block padding: 16px.
- Space between page widgets: 20px.
- Live card: same 20px edge token; preserves 16px title/description rhythm.
- Bottom sheets use the shared 20px horizontal token, retain handle/close clearance, independent scrolling and safe-area padding.
- Submission description/action/status spacing: 16px.
- Existing control sizes and compact tabs are intentionally retained.

Applied to Overview, Live Assessment, Finish, Result, Submission, step/guidance/task detail sheets and shared Design System stories. No version 2–4 changes or new dependencies.

Validation: production build, 37 unit tests, existing completion and submission browser checks (including real touch signature), all five screens at 320/390/419px with measured card paddings, sheet containment and overflow checks. Lint retains only three existing Fast Refresh warnings.
