import { HelperClimateEditorNodes, HelperClimateNodes } from "@climate/nodes";
import { HelperControlEditorNodes, HelperControlNodes } from "@control/nodes";
import { HelperLightEditorNodes, HelperLightNodes } from "@light/nodes";
import {
  HelperNotificationEditorNodes,
  HelperNotificationNodes,
} from "@notification/nodes";

export const HelperNodes = [
  ...HelperClimateNodes,
  ...HelperControlNodes,
  ...HelperLightNodes,
  ...HelperNotificationNodes,
];

export const HelperEditorNodes = {
  ...HelperClimateEditorNodes,
  ...HelperControlEditorNodes,
  ...HelperLightEditorNodes,
  ...HelperNotificationEditorNodes,
};
