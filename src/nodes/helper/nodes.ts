import { HelperClimateDefs } from "./climate/nodes";
import { HelperControlDefs } from "./control/nodes";
import { HelperLightDefs } from "./light/nodes";
import { HelperNotificationDefs } from "./notification/nodes";
import { NodeEditorDefinition } from "../flowctrl/base/editor";

export const HelperDefs: NodeEditorDefinition[] = [
  ...HelperClimateDefs,
  ...HelperControlDefs,
  ...HelperLightDefs,
  ...HelperNotificationDefs,
];
