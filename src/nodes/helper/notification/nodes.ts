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

const MoistureAlertEditorMetadata: NodeRegistryEntry["metadata"] = {
  localePrefix: "helper.moisture-alert",
  inputMode: "matcher-topic",
  fieldKeys: ["alertThreshold", "alertInterval"],
  inputKeys: ["moisture", "lastAlert"],
  outputKeys: ["notification", "lastAlert"],
};

const NotifyDispatcherEditorMetadata: NodeRegistryEntry["metadata"] = {
  localePrefix: "helper.notify-dispatcher",
  inputMode: "matcher-topic",
  fieldKeys: ["persons"],
  inputKeys: [
    "message",
    "person1",
    "person2",
    "person3",
    "person4",
    "person5",
    "person6",
    "person7",
    "person8",
    "person9",
    "person10",
  ],
  outputKeys: [
    "broadcast",
    "person1",
    "person2",
    "person3",
    "person4",
    "person5",
    "person6",
    "person7",
    "person8",
    "person9",
    "person10",
  ],
};

const WasteReminderEditorMetadata: NodeRegistryEntry["metadata"] = {
  localePrefix: "helper.waste-reminder",
  inputMode: "matcher-topic",
  fieldKeys: [],
  inputKeys: ["types", "remaining"],
  outputKeys: ["notification"],
};

const WhitegoodReminderEditorMetadata: NodeRegistryEntry["metadata"] = {
  localePrefix: "helper.whitegood-reminder",
  inputMode: "matcher-topic",
  fieldKeys: [
    "offPowerLimit",
    "standbyPowerLimit",
    "cleanupEnabled",
    "cleanupInterval",
    "statusShowRuns",
    "emptyReminderEnabled",
    "emptyReminderInterval",
  ],
  inputKeys: ["power", "runs", "emptied"],
  outputKeys: ["notification", "runs"],
};

const WindowReminderEditorMetadata: NodeRegistryEntry["metadata"] = {
  localePrefix: "helper.window-reminder",
  inputMode: "matcher-topic",
  fieldKeys: ["interval"],
  inputKeys: ["window", "presence", "command", "intervalSelect"],
  outputKeys: ["notification"],
};

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
