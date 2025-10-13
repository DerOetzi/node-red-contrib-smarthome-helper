import { EditorNodePropertiesDef } from "node-red";
import {
  SwitchEditorNodeProperties,
  SwitchEditorNodePropertiesDefaults,
  SwitchNodeDef,
  SwitchNodeOptions,
  SwitchNodeOptionsDefaults,
} from "../switch/types";

export interface HysteresisSwitchNodeOptions extends SwitchNodeOptions {
  upperThreshold: number;
  lowerThreshold: number;
  initialState: boolean;
}

export const HysteresisSwitchNodeOptionsDefaults: HysteresisSwitchNodeOptions =
  {
    ...SwitchNodeOptionsDefaults,
    seperatedOutputs: false,
    outputs: 1,
    upperThreshold: 1,
    lowerThreshold: 0,
    initialState: false,
  };

export interface HysteresisSwitchNodeDef
  extends SwitchNodeDef,
    HysteresisSwitchNodeOptions {}

export interface HysteresisSwitchEditorNodeProperties
  extends SwitchEditorNodeProperties,
    HysteresisSwitchNodeOptions {}

export const HysteresisSwitchEditorNodePropertiesDefaults: EditorNodePropertiesDef<HysteresisSwitchEditorNodeProperties> =
  {
    ...SwitchEditorNodePropertiesDefaults,
    seperatedOutputs: {
      value: HysteresisSwitchNodeOptionsDefaults.seperatedOutputs,
      required: true,
    },
    outputs: {
      value: HysteresisSwitchNodeOptionsDefaults.outputs,
      required: true,
    },
    upperThreshold: {
      value: HysteresisSwitchNodeOptionsDefaults.upperThreshold,
      required: true,
    },
    lowerThreshold: {
      value: HysteresisSwitchNodeOptionsDefaults.lowerThreshold,
      required: true,
    },
    initialState: {
      value: HysteresisSwitchNodeOptionsDefaults.initialState,
      required: true,
    },
  };
