import { EditorNodePropertiesDef } from "node-red";
import { TimeIntervalUnit } from "../../../helpers/time.helper";
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
  pauseUnit?: TimeIntervalUnit;
}
export const GateControlNodeOptionsDefaults: GateControlNodeOptions = {
  ...BaseNodeOptionsDefaults,
  delay: 100,
  gateCommand: AutomationGateCommand.Start,
  pauseTime: 1,
  pauseUnit: TimeIntervalUnit.s,
  outputs: 2,
};

export interface GateControlNodeDef
  extends BaseNodeDef,
    GateControlNodeOptions {}

export interface GateControlEditorNodeProperties
  extends BaseEditorNodeProperties,
    GateControlNodeOptions {}

export const GateControlEditorNodePropertiesDefaults: EditorNodePropertiesDef<GateControlEditorNodeProperties> =
  {
    ...BaseEditorNodePropertiesDefaults,
    delay: {
      value: GateControlNodeOptionsDefaults.delay,
      required: true,
    },
    gateCommand: {
      value: GateControlNodeOptionsDefaults.gateCommand,
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
      value: GateControlNodeOptionsDefaults.outputs,
      required: true,
    },
  };
