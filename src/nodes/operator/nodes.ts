import { NodeEditorDefinition } from "../flowctrl/base/editor";
import { ArithmeticEditorDef } from "./arithmetic/editor";

export const OperatorDefs: NodeEditorDefinition<any, any>[] = [
  ArithmeticEditorDef,
];
