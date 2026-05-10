import { EditorNodeDef } from "node-red";
import WasteReminderNode from ".";
import BaseEditorNode, {
  createEditorDefaults,
  i18n,
} from "../../../flowctrl/base/editor";
import {
  InputEditorTemplate,
  MatchJoinEditableList,
} from "../../../flowctrl/match-join/editor";
import { EditorMetadata, EditorTemplateElement } from "../../../types";
import {
  WasteReminderEditorNodeProperties,
  WasteReminderNodeOptions,
  WasteReminderNodeOptionsDefaults,
  WasteReminderTarget,
} from "./types";

export const WasteReminderEditorTemplate: EditorTemplateElement[] = [
  { tag: "ol", id: "matcher-rows" },
  { tag: "div", id: "waste-reminder-options" },
  ...InputEditorTemplate,
];

export const WasteReminderEditorMetadata: EditorMetadata = {
  localePrefix: "helper.waste-reminder",
  inputMode: "matcher-topic",
  fieldKeys: [],
  inputKeys: ["types", "remaining"],
  outputKeys: ["notification"],
  template: WasteReminderEditorTemplate,
};

const inputMatcherList = new MatchJoinEditableList({
  targets: Object.values(WasteReminderTarget),
  translatePrefix: "helper.waste-reminder",
});

const WasteReminderEditorNode: EditorNodeDef<WasteReminderEditorNodeProperties> =
  {
    category: WasteReminderNode.NodeCategoryLabel,
    color: WasteReminderNode.NodeColor,
    icon: "font-awesome/fa-recycle",
    defaults: createEditorDefaults<
      WasteReminderNodeOptions,
      WasteReminderEditorNodeProperties
    >(WasteReminderNodeOptionsDefaults),
    label: function () {
      return this.name?.trim()
        ? this.name.trim()
        : i18n("helper.waste-reminder.name");
    },
    inputs: WasteReminderNodeOptionsDefaults.inputs,
    outputs: WasteReminderNodeOptionsDefaults.outputs,
    outputLabels: function (_: number) {
      return i18n("helper.waste-reminder.output.notification");
    },
    oneditprepare: function () {
      BaseEditorNode.oneditprepare!.call(this);

      inputMatcherList.initialize("matcher-rows", this.matchers, {
        translatePrefix: "flowctrl.match-join",
      });
    },
    oneditsave: function () {
      this.matchers = inputMatcherList.values();
    },
  };

export default WasteReminderEditorNode;
