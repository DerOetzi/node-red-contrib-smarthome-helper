# node-red-contrib-smarthome-helper

`node-red-contrib-smarthome-helper` is a Node-RED module designed to provide utility functions and tools that simplify the development of smart home automations. It includes helper functions to manage device states, handle complex calculations, and facilitate communication between nodes in a Node-RED flow.

## Features

- Provides helper functions to support smart home automation.
- Facilitates the integration of complex logic into Node-RED flows.
- Built with reusability and simplicity in mind.

## Installation

To install the module, run the following command in your Node-RED user directory (typically `~/.node-red`):

```sh
npm install node-red-contrib-smarthome-helper
```

After installation, restart Node-RED to load the new helper functions.

## Available Nodes

### Automation Gate

The **Automation Gate** node is used to control the flow of messages based on specified conditions. It acts as a gate that opens or closes depending on the defined automation logic. This allows users to create flows that only pass messages when certain criteria are met, such as time of day, device state, or other environmental conditions.

**Features:**

- Configurable conditions to control message flow.
- Useful for creating more complex automation logic where actions depend on multiple factors.

**Example Use Case:**

- Use the Automation Gate to allow motion sensor events to trigger a light only during nighttime hours.

### Control Gate

The **Control Gate** node provides a mechanism to enable or disable the flow of messages manually or based on an external trigger. It can be used to create manual overrides or to temporarily pause parts of an automation flow.

**Features:**

- Manual control to enable or disable the flow of messages.
- External input can be used to dynamically change the state of the gate.

**Example Use Case:**

- Use the Control Gate to temporarily disable an automation, such as preventing notifications during certain times (e.g., when guests are over).

## Usage

1. Open Node-RED.
2. Use the provided nodes (`Automation Gate` and `Control Gate`) to enhance your smart home automations.
3. Configure the nodes to interact with your smart devices effectively.

## Example Usage

Here is an example of how you might use the provided nodes to manage a smart lighting system:

1. Add an **Automation Gate** to ensure lights only turn on when motion is detected and it is nighttime.
2. Use a **Control Gate** to manually disable the lighting automation during specific situations, such as when you are hosting guests.

## Development

### Node Help Text Generation

This repository automatically generates Node-RED help text **at runtime** using the i18n translation system. Help text is generated dynamically when the Node-RED editor loads, automatically displaying content in the user's configured language.

**How It Works:**

1. When nodes are registered in `src/editor.ts`, the system automatically injects help text for each node
2. Help is generated dynamically using the `generateNodeHelp()` function from `src/nodes/flowctrl/base/editor.ts`
3. The function reads locale data using the same i18n system used for node labels and UI text
4. Help text is created from the existing locale structure:
   - `description` → Main node description
   - `input.*` → Inputs section
   - `output.*` → Outputs section
   - `field.*` → Details section

**Locale File Structure:**

No special help sections needed! The system uses your existing locale data:

```json
{
    "name": "Node Name",
    "description": "Brief description of what the node does",
    "input": {
        "propertyName": {
            "name": "Property Name",
            "description": "Description of this input property"
        }
    },
    "output": {
        "resultProperty": {
            "name": "Result",
            "description": "Description of this output property"
        }
    },
    "field": {
        "fieldName": {
            "label": "Field Label",
            "description": "Description of what this field configures"
        }
    }
}
```

**Benefits:**
- ✅ Help text automatically in user's language (German, English, etc.)
- ✅ No build-time generation needed
- ✅ Uses existing locale data (no duplication)
- ✅ Updates immediately when user changes language
- ✅ Consistent with Node-RED's i18n system

See existing nodes for examples: `automation-gate`, `arithmetic`, `compare`, or `status`.

## Contributing

Feel free to contribute by opening issues or creating pull requests. Contributions are always welcome to make this project even better.

## License

This project is licensed under the MIT License.

## Links

- [Node-RED](https://nodered.org/)
- [GitHub Repository](https://github.com/DerOetzi/node-red-contrib-smarthome-helper)

For more information and documentation, please visit the [GitHub repository](https://github.com/DerOetzi/node-red-contrib-smarthome-helper).
