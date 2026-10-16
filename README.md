# Learning Pool — S2S Assessment foundation

A neutral component playground, ready for iterative product design. No assessment screens, branding, backend, or authentication are implemented.

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
- `src/styles/theme.css`: standard shadcn neutral light/dark tokens and Tailwind mappings.
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

The application opens in the Portuguese Theme Studio. The editor changes semantic tokens in an isolated, interactive playground iframe (`?preview=1`), including portalled dialogs and menus. The editor itself stays neutral.

- Four starting presets: neutral, ocean, forest, and plum. Presets replace both color modes and the radius.
- Edit 18 semantic colors through the native color picker or a six-digit HEX value (apply with Enter or blur).
- Light and dark colors are independent; radius (0–24px) is shared.
- Preview a real 390px mobile or 1200px desktop viewport, scaled to fit the available space.
- On smaller screens, switch between editing and preview using the top panel controls.
- Four text contrast checks use the WCAG relative-luminance formula and the 4.5:1 AA threshold for normal text. These are limited checks, not a complete accessibility audit.
- Edits persist locally in this browser. Reset requires confirmation. Export both modes by copying CSS or downloading `theme.css`; applying the exported tokens to source remains a deliberate separate step.

The theme model, presets, validation, contrast calculation, and CSS export are in `src/lib/theme.ts`; the editor is in `src/pages/theme-studio.tsx`; the isolated preview is in `src/components/theme/theme-preview.tsx`. No new runtime dependencies were needed.
