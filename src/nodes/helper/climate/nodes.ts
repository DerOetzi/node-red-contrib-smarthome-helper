import { NodeEditorDefinition } from "../../flowctrl/base/editor";
import { HeatingControllerEditorDef } from "./heating-controller/editor";
import { HygroCalculatorEditorDef } from "./hygro-calculator/editor";
import { WarmWaterPVControllerEditorDef } from "./warmwater-pv-controller/editor";

export const HelperClimateDefs: NodeEditorDefinition<any, any>[] = [
  HeatingControllerEditorDef,
  HygroCalculatorEditorDef,
  WarmWaterPVControllerEditorDef,
];
