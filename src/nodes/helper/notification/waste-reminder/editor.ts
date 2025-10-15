import { EditorNodeDef } from "node-red";
import WasteReminderNode from ".";
import BaseEditorNode, {
  createEditorDefaults,
  i18n,
} from "../../../flowctrl/base/editor";
import { MatchJoinEditableList } from "../../../flowctrl/match-join/editor";
import {
  WasteReminderEditorNodeProperties,
  WasteReminderNodeOptions,
  WasteReminderNodeOptionsDefaults,
  WasteReminderTarget,
} from "./types";

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
