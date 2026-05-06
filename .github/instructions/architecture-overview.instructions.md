---
description: "Use when analyzing architecture, adding or modifying Node-RED nodes, editor definitions, migrations, registries, build pipeline, or localization in this repository. Covers runtime/editor bootstrap, shared base abstractions, node family layout, and packaging flow."
name: "Repository Architecture Overview"
applyTo: "src/**"
---

# Repository Architecture Overview

## Runtime Bootstrap

- Runtime registration starts in `src/index.ts`, which merges the `flowctrl`, `helper`, `logical`, and `operator` registries, instantiates each node class, and wires them through one shared `StatusNodesConnector`.
- Each node family exposes a `nodes.ts` registry file. New nodes are only fully integrated when they are exported through their family registry and then included in the category-level registry consumed by `src/index.ts` and `src/editor.ts`.
- Runtime nodes should normally extend `src/nodes/flowctrl/base/index.ts`. That base class centralizes default config merging, debounce handling, unique-payload filtering, topic evaluation, message cloning, and status reporting; prefer overriding lifecycle methods such as `input`, `debounced`, `matched`, or `updateStatusAfterDebounce` instead of reimplementing send plumbing.
- Use `NodeMessageFlow` from `src/nodes/flowctrl/base/types.ts` as the standard message wrapper for per-output state, cloned payload/topic updates, and `additionalAttributes`. Prefer its parsing helpers such as `payloadAsNumber` and `payloadAsBoolean` over ad hoc coercion.
- Nodes that combine or correlate multiple inputs should build on the `flowctrl/match-join` abstractions and matcher configuration model so they remain compatible with the existing editor UI and migration helpers.
- Helper utilities under `src/helpers/` are the shared place for common date, object, and time behavior. Reuse them instead of duplicating conversions or cloning logic inside individual nodes.

## Editor

- Editor registration starts in `src/editor.ts`, using the same merged registry map. Editor definitions, migration checks, and generated help must use the same structure, naming conventions, and update processes as the runtime registry entry for each node type.
- Editor UIs are built around `src/nodes/flowctrl/base/editor.ts`. Reuse `NodeEditorFormBuilder`, editable-list helpers, and shared `i18n` helpers so labels, typed inputs, and help generation follow the existing conventions.

## Node Metadata

- `NodeRegistryEntry.metadata` drives generated help and editor introspection; keep `localePrefix`, input keys, output keys, and field keys accurate when adding or changing nodes.
- If node metadata contains mismatched or missing keys, log a detailed error message specifying the problematic fields and resolve the inconsistency before relying on the generated help or editor introspection.

## Migration

- Migration support is a first-class part of node design. Node classes expose a static `Migration`, editor bootstrap triggers migration checks, and migration classes commonly extend the shared base migration or match-join migration.
- When defaults or persisted config shape change, add an explicit migration step instead of relying on silent fallback logic.

## Localization

- Localization is assembled from `src/nodes/**/locales/*.json` and `src/locales/**/*.json` into `dist/locales/<lang>/index.json` by the Gulp build. Keep locale keys aligned with the prefixes used by node editors and generated help.

## Build Pipeline

- The build output in `dist/` is generated, not authored. `gulpfile.js` generates `src/version.ts`, compiles runtime TypeScript, bundles editor assets into `dist/index.html`, copies icons, merges locales, and regenerates examples. Do not hand-edit `dist/` or `src/version.ts`; rerun the build instead.
- TypeScript is strict and the project favors absolute imports rooted at `src` where configured. Keep changes small and consistent with the existing node-family structure instead of introducing parallel abstractions.
