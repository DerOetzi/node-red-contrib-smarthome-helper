import { NodeEditorDefinition } from "../flowctrl/base/editor";
import { CompareEditorDef } from "./compare/editor";
import { HysteresisSwitchEditorDef } from "./hysteresis-switch/editor";
import { LogicalOpEditorDef } from "./op/editor";
import { SwitchEditorDef } from "./switch/editor";
import { ToggleEditorDef } from "./toggle/editor";

export const LogicalDefs: NodeEditorDefinition<any, any>[] = [
  CompareEditorDef,
  HysteresisSwitchEditorDef,
  LogicalOpEditorDef,
  SwitchEditorDef,
  ToggleEditorDef,
];
