import { NodeRegistryEntry } from "../../types";
import MoistureAlertNode from "./moisture-alert";
import MoistureAlertEditorNode, {
  MoistureAlertEditorMetadata,
} from "./moisture-alert/editor";
import NotifyDispatcherNode from "./notify-dispatcher";
import NotifyDispatcherEditorNode, {
  NotifyDispatcherEditorMetadata,
} from "./notify-dispatcher/editor";
import WasteReminderNode from "./waste-reminder";
import WasteReminderEditorNode, {
  WasteReminderEditorMetadata,
} from "./waste-reminder/editor";
import WhitegoodReminderNode from "./whitegood-reminder";
import WhitegoodReminderEditorNode, {
  WhitegoodReminderEditorMetadata,
} from "./whitegood-reminder/editor";
import WindowReminderNode from "./window-reminder";
import WindowReminderEditorNode, {
  WindowReminderEditorMetadata,
} from "./window-reminder/editor";

export const HelperNotificationNodesRegistry: {
  [key: string]: NodeRegistryEntry;
} = {
  [MoistureAlertNode.NodeTypeName]: {
    node: MoistureAlertNode,
    editor: MoistureAlertEditorNode,
    metadata: MoistureAlertEditorMetadata,
  },
  [NotifyDispatcherNode.NodeTypeName]: {
    node: NotifyDispatcherNode,
    editor: NotifyDispatcherEditorNode,
    metadata: NotifyDispatcherEditorMetadata,
  },
  [WasteReminderNode.NodeTypeName]: {
    node: WasteReminderNode,
    editor: WasteReminderEditorNode,
    metadata: WasteReminderEditorMetadata,
  },
  [WhitegoodReminderNode.NodeTypeName]: {
    node: WhitegoodReminderNode,
    editor: WhitegoodReminderEditorNode,
    metadata: WhitegoodReminderEditorMetadata,
  },
  [WindowReminderNode.NodeTypeName]: {
    node: WindowReminderNode,
    editor: WindowReminderEditorNode,
    metadata: WindowReminderEditorMetadata,
  },
};
