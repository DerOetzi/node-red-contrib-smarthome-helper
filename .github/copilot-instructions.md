# Copilot Instructions

## Architecture

- `src/index.ts` bootstraps all Node-RED nodes by merging `FlowCtrl`, `Helper`, `Logical`, and `Operator` registries and wiring them through a shared `StatusNodesConnector`; new nodes must be exported through their registry so they get registered server- and editor-side.
- Runtime nodes extend `flowctrl/base`, which centralizes debounce handling, unique payload filtering, status publishing, and topic evaluation; expose behavior by overriding `input`, `matched`, or `updateStatusAfterDebounce` instead of reimplementing send logic.
- `NodeMessageFlow` (in `flowctrl/base/types.ts`) is the preferred wrapper for per-topic buffering, cloning, and metadata (`additionalAttributes`); derive data via helpers like `payloadAsNumber` to keep parsing consistent.
- Complex multi-input nodes usually extend `flowctrl/match-join`, which matches incoming messages via configured property/compare pairs before emitting combined payloads (e.g., helper climate controllers); reuse its `config.matchers` semantics to stay compatible with existing editor options/migration.
- Status propagation relies on `flowctrl/status` nodes plus `statusReportingEnabled` configs; reporting nodes call `registerStatusListener`, so only toggle that flag when a node actually emits `BaseNodeStatus` payloads.

## Editor & Migration

- `src/editor.ts` registers the same registry map with the Node-RED editor, logs the package `version.ts`, and hooks migration checks into `RED.events`; always export `NodeClass.Migration` when creating nodes so the editor can prompt upgrades.
- Build editor UIs with `NodeEditorFormBuilder`/`NodeEditorFormEditableList` (`flowctrl/base/editor.ts`) to get consistent labels, `typedInput` wiring, and translation keys; the builder automatically prefixes `flowctrl.<node>` label IDs, so keep locale files aligned.
- Migrations extend `flowctrl/base/migration.ts`, which enforces semantic version bumps and autowrites the new version back into the node when migrated; call `Migration.checkAndMigrate` from editor prepare hooks if you add new defaults.
- All editor/UI strings are fetched via `i18n()` from the `@deroetzi/node-red-contrib-smarthome-helper/all` namespace; add translations under each node's `locales/<lang>.json` with identical keys used in the editor builder.

## Build & Tooling

- `npm run build` executes the Gulp `default` task: `generateVersionFile` (writes `src/version.ts` from `package.json`), bundles runtime TS (`tsconfig.json` → `dist/index.js`), rolls up the editor (`src/editor.ts` → `dist/index.html`), copies icons, flattens locales, and regenerates `examples/*.json` from `.devcontainer/node-red-data/flows.json`.
- Use `npx gulp watch` during development to rebuild SCSS, HTML, TS, locales, and icons incrementally; the watcher tracks both runtime (`src/**/*.ts`) and editor assets.
- Lint with `npm run lint` (ESLint 9 + `@typescript-eslint`); the repo is `strict` TypeScript with `baseUrl: ./src`, so favor absolute imports like `from "nodes/flowctrl/base"` to match existing style.
- Do not edit `src/version.ts` or files in `dist/` directly—rerun the build instead; `node-red` loads `dist/index.js`, so missing builds break published packages.
- When exploring bugs, remember helper utilities live under `src/helpers/*` (date/time/object), and many nodes rely on these pure helpers for calculations (e.g., `convertToMilliseconds` in climate controllers).

## Data & Localization

- `buildLocales` collects every `src/nodes/**/locales/*.json` plus shared translations under `src/locales/**` and emits merged language bundles at `dist/locales/<lang>/index.json`; keep keys namespaced by category/node to avoid collisions.
- Localized UI text referenced by `NodeEditorFormBuilder` follows `flowctrl.<node>.label.<field>` (see `src/nodes/helper/.../locales`); add both `label` and `select` variants when creating dropdowns so autocomplete inputs stay translated.
- Generated flow samples under `examples/*.json` mirror tabs from `.devcontainer/node-red-data/flows.json`; update the source flows inside the devcontainer and rerun `gulp examples` instead of editing examples manually.
- Static assets in `icons/` are copied verbatim to `dist/icons`; reference them via the icon filename in node definitions to avoid embed duplication.
