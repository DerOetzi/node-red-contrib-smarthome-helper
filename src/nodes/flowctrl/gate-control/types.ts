import { TimeIntervalUnit } from "../../../helpers/time.helper";
import { AutomationGateCommand } from "../automation-gate/types";
import {
  BaseEditorNodeProperties,
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
