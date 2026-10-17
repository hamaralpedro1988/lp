> Historical V5.0 implementation notes. Superseded by [V5.6 React Spatial Flow](../rosa-v5-6/README.md).

# Rosa V5 review guide

Implements [issue #1](https://github.com/hamaralpedro1988/lp/issues/1) on `feat/rosa-v5-spatial-flow`. Open `?version=5` in the branch preview. Main is not changed by this implementation.

Read the [EN → PT decisions](DECISIONS.md) for the source reference, implemented trade-offs, component inventory and intentionally illustrative behavior.

## Validation

```sh
npm run build
npm run lint
npm test
npm run dev -- --host 127.0.0.1
```

In a separate terminal with Python Playwright and Chromium installed:

```sh
python scripts/check-spatial.py --screenshots docs/rosa-v5/screenshots
```

Use `--url` and `--chromium` to select another local preview or browser executable. No Playwright package is added to the shipped app. The browser check uses a real file input with a generated screenshot fixture; physical-device camera permissions and native keyboards still need device testing.

## Mobile screenshots

| Screen / state | Capture |
| --- | --- |
| Assignments | [01-assignments-mobile.png](screenshots/01-assignments-mobile.png) |
| Overview | [02-overview-mobile.png](screenshots/02-overview-mobile.png) |
| Live selection | [03-live-selection-mobile.png](screenshots/03-live-selection-mobile.png) |
| All-criteria drawer | [04-sections-mobile.png](screenshots/04-sections-mobile.png) |
| Photo sheet | [05-photo-sheet-mobile.png](screenshots/05-photo-sheet-mobile.png) |
| Comment sheet | [06-comment-sheet-mobile.png](screenshots/06-comment-sheet-mobile.png) |
| Incomplete review | [07-review-incomplete-mobile.png](screenshots/07-review-incomplete-mobile.png) |
| Complete observations, including coaching/fail | [08-review-complete-mobile.png](screenshots/08-review-complete-mobile.png) |
| Sign-off | [09-signoff-mobile.png](screenshots/09-signoff-mobile.png) |
| Local demo confirmation | [10-confirmation-mobile.png](screenshots/10-confirmation-mobile.png) |
| Narrow mobile | [11-narrow-mobile.png](screenshots/11-narrow-mobile.png) |
| Offline, reduced-height viewport | [12-offline-mobile.png](screenshots/12-offline-mobile.png) |

## Desktop screenshots

[Assignments](screenshots/desktop-list.png) · [Overview](screenshots/desktop-overview.png) · [Live assessment](screenshots/desktop-assessment.png) · [Review](screenshots/desktop-review.png) · [Sign-off](screenshots/desktop-signoff.png)
