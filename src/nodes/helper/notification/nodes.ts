import { NodeRegistryEntry } from "../../types";
import MoistureAlertNode from "./moisture-alert";
import MoistureAlertEditorNode from "./moisture-alert/editor";
import NotifyDispatcherNode from "./notify-dispatcher";
import NotifyDispatcherEditorNode from "./notify-dispatcher/editor";
import WasteReminderNode from "./waste-reminder";
import WasteReminderEditorNode from "./waste-reminder/editor";
import WhitegoodReminderNode from "./whitegood-reminder";
import WhitegoodReminderEditorNode from "./whitegood-reminder/editor";
import WindowReminderNode from "./window-reminder";
import WindowReminderEditorNode from "./window-reminder/editor";

export const HelperNotificationNodesRegistry: {
  [key: string]: NodeRegistryEntry;
} = {
  [MoistureAlertNode.NodeTypeName]: {
    node: MoistureAlertNode,
    editor: MoistureAlertEditorNode,
  },
  [NotifyDispatcherNode.NodeTypeName]: {
    node: NotifyDispatcherNode,
    editor: NotifyDispatcherEditorNode,
  },
  [WasteReminderNode.NodeTypeName]: {
    node: WasteReminderNode,
    editor: WasteReminderEditorNode,
  },
  [WhitegoodReminderNode.NodeTypeName]: {
    node: WhitegoodReminderNode,
    editor: WhitegoodReminderEditorNode,
  },
  [WindowReminderNode.NodeTypeName]: {
    node: WindowReminderNode,
    editor: WindowReminderEditorNode,
  },
};
