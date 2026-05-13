import { NodeEditorDefinition } from "../../flowctrl/base/editor";
import { LightControllerEditorDef } from "./light-controller/editor";

export const HelperLightDefs: NodeEditorDefinition<any, any>[] = [
  LightControllerEditorDef,
];
