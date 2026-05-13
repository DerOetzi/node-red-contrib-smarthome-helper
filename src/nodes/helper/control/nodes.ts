import { NodeEditorDefinition } from "../../flowctrl/base/editor";
import { EventMapperEditorDef } from "./event-mapper/editor";
import { MotionControllerEditorDef } from "./motion-controller/editor";

export const HelperControlDefs: NodeEditorDefinition<any, any>[] = [
  EventMapperEditorDef,
  MotionControllerEditorDef,
];
