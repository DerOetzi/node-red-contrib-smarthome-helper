import { HelperClimateNodesRegistry } from "./climate/nodes";
import { HelperControlNodesRegistry } from "./control/nodes";
import { HelperLightNodesRegistry } from "./light/nodes";
import { HelperNotificationNodesRegistry } from "./notification/nodes";

export const HelperNodesRegistry = {
  ...HelperClimateNodesRegistry,
  ...HelperControlNodesRegistry,
  ...HelperLightNodesRegistry,
  ...HelperNotificationNodesRegistry,
};
