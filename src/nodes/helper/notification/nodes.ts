import NotifyDispatcherNode from "./notify-dispatcher";
import NotifyDispatcherEditorNode from "./notify-dispatcher/editor";
import WhitegoodReminderNode from "./whitegood-reminder";
import WhitegoodReminderEditorNode from "./whitegood-reminder/editor";
import WindowReminderNode from "./window-reminder";
import WindowReminderEditorNode from "./window-reminder/editor";

export const HelperNotificationNodes = [
  NotifyDispatcherNode,
  WhitegoodReminderNode,
  WindowReminderNode,
];

export const HelperNotificationEditorNodes = {
  [NotifyDispatcherNode.NodeTypeName]: NotifyDispatcherEditorNode,
  [WhitegoodReminderNode.NodeTypeName]: WhitegoodReminderEditorNode,
  [WindowReminderNode.NodeTypeName]: WindowReminderEditorNode,
};
