import { NodeRegistryEntry } from "../../types";
import MoistureAlertNode from "./moisture-alert";
import MoistureAlertEditorNode, {
  MoistureAlertEditorMetadata,
  MoistureAlertEditorTemplate,
} from "./moisture-alert/editor";
import NotifyDispatcherNode from "./notify-dispatcher";
import NotifyDispatcherEditorNode, {
  NotifyDispatcherEditorMetadata,
  NotifyDispatcherEditorTemplate,
} from "./notify-dispatcher/editor";
import WasteReminderNode from "./waste-reminder";
import WasteReminderEditorNode, {
  WasteReminderEditorMetadata,
  WasteReminderEditorTemplate,
} from "./waste-reminder/editor";
import WhitegoodReminderNode from "./whitegood-reminder";
import WhitegoodReminderEditorNode, {
  WhitegoodReminderEditorMetadata,
  WhitegoodReminderEditorTemplate,
} from "./whitegood-reminder/editor";
import WindowReminderNode from "./window-reminder";
import WindowReminderEditorNode, {
  WindowReminderEditorMetadata,
  WindowReminderEditorTemplate,
} from "./window-reminder/editor";

export const HelperNotificationNodesRegistry: {
  [key: string]: NodeRegistryEntry;
} = {
  [MoistureAlertNode.NodeTypeName]: {
    node: MoistureAlertNode,
    editor: MoistureAlertEditorNode,
    metadata: MoistureAlertEditorMetadata,
    template: MoistureAlertEditorTemplate,
  },
  [NotifyDispatcherNode.NodeTypeName]: {
    node: NotifyDispatcherNode,
    editor: NotifyDispatcherEditorNode,
    metadata: NotifyDispatcherEditorMetadata,
    template: NotifyDispatcherEditorTemplate,
  },
  [WasteReminderNode.NodeTypeName]: {
    node: WasteReminderNode,
    editor: WasteReminderEditorNode,
    metadata: WasteReminderEditorMetadata,
    template: WasteReminderEditorTemplate,
  },
  [WhitegoodReminderNode.NodeTypeName]: {
    node: WhitegoodReminderNode,
    editor: WhitegoodReminderEditorNode,
    metadata: WhitegoodReminderEditorMetadata,
    template: WhitegoodReminderEditorTemplate,
  },
  [WindowReminderNode.NodeTypeName]: {
    node: WindowReminderNode,
    editor: WindowReminderEditorNode,
    metadata: WindowReminderEditorMetadata,
    template: WindowReminderEditorTemplate,
  },
};
