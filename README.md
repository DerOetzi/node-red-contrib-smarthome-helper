# @deroetzi/node-red-contrib-smarthome-helper

A collection of Node-RED nodes for smart home automations, focused on reusable logic, robust control, and maintainable flows.

## Overview

This package provides multiple node groups:

- Flow control nodes for gate, match, and status behavior
- Helper nodes for climate, lighting, notifications, and event mapping
- Logical nodes for comparisons and boolean operations
- Operator nodes for arithmetic calculations

In addition, the project generates Node-RED help text at runtime from editor definitions and existing locale files.

## Installation

Install in your Node-RED user directory (typically `~/.node-red`):

```bash
npm install @deroetzi/node-red-contrib-smarthome-helper
```

Then restart Node-RED.

Requirements:

- Node.js >= 20
- Node-RED >= 2 (tested in this package with Node-RED 4)

## Included Nodes

### FlowCtrl

- `automation-gate`: Gate for automation flow and replay scenarios
- `base`: Shared base for debounce, topic evaluation, and status reporting
- `gate-control`: Controls gates via commands (for example start, stop, pause)
- `match-join`: Matching/joining of multiple input messages
- `status`: Creates and distributes status information

### Helper Climate

- `dehumidifier-controller`: Control logic for dehumidification
- `heating-controller`: Heating logic with modes and additional conditions
- `hygro-calculator`: Calculates dew point and absolute humidity

### Helper Control

- `event-mapper`: Maps events to target values/actions
- `motion-controller`: Motion-based switching logic

### Helper Light

- `light-controller`: Light control (switch, RGB, color temperature)

### Helper Notification

- `moisture-alert`: Alerts based on moisture thresholds
- `notify-dispatcher`: Distribution to broadcast and person-specific channels
- `waste-reminder`: Reminders for waste collection events
- `whitegood-reminder`: Reminders for household appliances
- `window-reminder`: Window-related reminder logic

### Logical

- `compare`: Comparison operators
- `hysteresis-switch`: Switching with hysteresis
- `op`: Boolean operations
- `switch`: Conditional routing/switching
- `toggle`: Toggle logic

### Operator

- `arithmetic`: Arithmetic operations on message values

## Runtime Node Help

Help text in the Node-RED UI is generated dynamically when the editor loads.

Core idea:

1. During registration in `src/editor.ts`, help injection is triggered for each node.
2. The help logic in `src/nodes/flowctrl/base/help.ts` combines:
   - Editor definition (`defaults`, `outputLabels`, `oneditprepare`)
   - Editor metadata (`EditorMetadata`)
   - i18n entries from locale files
3. The result is a language-aware, consistent help block including description, parameters, inputs, and outputs.

Important:

- Metadata is exported directly in each node's `editor.ts`.
- Registry files only consume these exports.
- No separate manual help HTML is required per node.

## Localization

Translations are located in `src/nodes/**/locales/*.json` and `src/locales/**`.

Typical structure per node:

```json
{
  "name": "Node Name",
  "description": "Short description",
  "input": {
    "exampleInput": {
      "name": "Input Name",
      "description": "Description"
    }
  },
  "output": {
    "exampleOutput": {
      "name": "Output Name",
      "description": "Description"
    }
  },
  "field": {
    "exampleField": {
      "label": "Field label",
      "description": "Description"
    }
  }
}
```

## Development

### Setup

```bash
npm install
```

### Build

```bash
npm run build
```

The build (Gulp) generates, among other artifacts:

- `dist/index.js` for Node-RED runtime
- `dist/index.html` for editor assets
- `dist/locales/**` from merged translations
- `examples/*.json` from the devcontainer flow source

### Linting

```bash
npm run lint
npm run lint_fix
```

### Watch Mode

```bash
npx gulp watch
```

Notes:

- `src/version.ts` and files in `dist/` are generated and should not be edited manually.
- Always register new nodes through the appropriate registry so runtime and editor registration stay in sync.

## Examples

The `examples/` directory contains ready-to-use example flows:

- `flowctrl.json`
- `helper_climate.json`
- `helper_lights.json`
- `helper_notification.json`
- `logical.json`
- `operators.json`

## Contributing

Issues and pull requests are welcome. For larger changes, a short alignment upfront is recommended.

## License

MIT

## Links

- Node-RED: https://nodered.org/
- Repository: https://github.com/DerOetzi/node-red-contrib-smarthome-helper
