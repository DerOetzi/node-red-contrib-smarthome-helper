import MoistureAlertNode from "./moisture-alert";
import MoistureAlertEditorNode from "./moisture-alert/editor";
import NotifyDispatcherNode from "./notify-dispatcher";
import NotifyDispatcherEditorNode from "./notify-dispatcher/editor";
import WhitegoodReminderNode from "./whitegood-reminder";
import WhitegoodReminderEditorNode from "./whitegood-reminder/editor";
import WindowReminderNode from "./window-reminder";
import WindowReminderEditorNode from "./window-reminder/editor";

export const HelperNotificationNodes = [
  MoistureAlertNode,
  NotifyDispatcherNode,
  WhitegoodReminderNode,
  WindowReminderNode,
];

export const HelperNotificationEditorNodes = {
  [MoistureAlertNode.NodeTypeName]: MoistureAlertEditorNode,
  [NotifyDispatcherNode.NodeTypeName]: NotifyDispatcherEditorNode,
  [WhitegoodReminderNode.NodeTypeName]: WhitegoodReminderEditorNode,
  [WindowReminderNode.NodeTypeName]: WindowReminderEditorNode,
};
