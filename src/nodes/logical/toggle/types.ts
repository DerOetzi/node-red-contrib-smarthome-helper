import { EditorNodePropertiesDef } from "node-red";
import {
  SwitchEditorNodeProperties,
  SwitchEditorNodePropertiesDefaults,
  SwitchNodeDef,
  SwitchNodeOptions,
  SwitchNodeOptionsDefaults,
} from "@logical/switch/types";

export interface ToggleNodeOptions extends SwitchNodeOptions {}

export const ToggleNodeOptionsDefaults: ToggleNodeOptions = {
  ...SwitchNodeOptionsDefaults,
  seperatedOutputs: false,
  outputs: 1,
};

export interface ToggleNodeDef extends SwitchNodeDef, ToggleNodeOptions {}

export interface ToggleEditorNodeProperties
  extends SwitchEditorNodeProperties,
    ToggleNodeOptions {}

export const ToggleEditorNodePropertiesDefaults: EditorNodePropertiesDef<ToggleEditorNodeProperties> =
  {
    ...SwitchEditorNodePropertiesDefaults,
    seperatedOutputs: {
      value: ToggleNodeOptionsDefaults.seperatedOutputs,
      required: true,
    },
    outputs: { value: ToggleNodeOptionsDefaults.outputs, required: true },
  };
