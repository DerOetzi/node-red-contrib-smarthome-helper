import {
  SwitchEditorNodeProperties,
  SwitchNodeDef,
  SwitchNodeOptions,
  SwitchNodeOptionsDefaults,
} from "../switch/types";

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
