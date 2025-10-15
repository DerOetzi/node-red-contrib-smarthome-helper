import {
  SwitchEditorNodeProperties,
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
