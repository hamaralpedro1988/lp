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

Only the supplied criterion is defined. Back is disabled; Next explains that the next criterion is not yet available. Criteria 2 and 3 are clearly marked as undefined rather than fabricated. Notes, results, elapsed time, and attachment object URLs are kept only while this page remains mounted; reload/navigation clears them. Files are never uploaded. Theme choices continue to persist separately in browser storage.

Chromium checks exercised selection, note save/cancel, image add/remove, actual timer pause/resume, focus view, checklist status, prototype navigation limits, route links, and layouts at 390/768/1440px.
