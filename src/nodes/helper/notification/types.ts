import { MatchJoinNodeMessage } from "../../flowctrl/match-join/types";
import { NodeCategory } from "../../types";

export const HelperNotificationCategory: NodeCategory = {
  label: "Smarthome Helper Notification",
  name: "helper",
  color: "#87ceeb",
};

export interface NotifyMessage {
  title: string;
  message: string;
  onlyAtHome?: boolean;
}

export interface NotifyNodeMessage extends MatchJoinNodeMessage {
  notify: NotifyMessage;
}
