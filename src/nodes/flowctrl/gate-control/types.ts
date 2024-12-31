import { EditorNodePropertiesDef } from "node-red";
import { AutomationGateCommand } from "../automation-gate/types";
import {
  BaseEditorNodeProperties,
  BaseEditorNodePropertiesDefaults,
  BaseNodeDef,
  BaseNodeOptions,
  BaseNodeOptionsDefaults,
} from "../base/types";

export interface GateControlNodeOptions extends BaseNodeOptions {
  delay: number;
  gateCommand: AutomationGateCommand;
  pauseTime?: number;
  pauseUnit?: string;
}

export interface GateControlNodeDef
  extends BaseNodeDef,
    GateControlNodeOptions {}

export const GateControlNodeOptionsDefaults: Partial<GateControlNodeDef> = {
  ...BaseNodeOptionsDefaults,
  delay: 100,
  gateCommand: AutomationGateCommand.Start,
  pauseTime: 1,
  pauseUnit: "s",
  outputs: 2,
};

export interface GateControlEditorNodeProperties
  extends BaseEditorNodeProperties,
    GateControlNodeOptions {}

export const GateControlEditorNodePropertiesDefaults: EditorNodePropertiesDef<GateControlEditorNodeProperties> =
  {
    ...BaseEditorNodePropertiesDefaults,
    delay: {
      value: GateControlNodeOptionsDefaults.delay!,
      required: true,
    },
    gateCommand: {
      value: GateControlNodeOptionsDefaults.gateCommand!,
      required: true,
    },
    pauseTime: {
      value: GateControlNodeOptionsDefaults.pauseTime!,
      required: false,
    },
    pauseUnit: {
      value: GateControlNodeOptionsDefaults.pauseUnit!,
      required: false,
    },
    outputs: {
      value: GateControlNodeOptionsDefaults.outputs!,
      required: true,
    },
  };
