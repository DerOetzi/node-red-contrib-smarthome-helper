import { EditorNodeDef } from "node-red";
import BaseEditorNode, {
  i18n,
  NodeEditorFormBuilder,
} from "../../../flowctrl/base/editor";
import { MatchJoinEditableList } from "../../../flowctrl/match-join/editor";
import WindowReminderNode from "./";
import { windowReminderMigration } from "./migration";
import {
  WindowReminderEditorNodeProperties,
  WindowReminderEditorNodePropertiesDefaults,
  WindowReminderNodeOptionsDefaults,
  WindowReminderTarget,
} from "./types";

const inputMatcherList = new MatchJoinEditableList({
  targets: Object.values(WindowReminderTarget),
  translatePrefix: "helper.window-reminder",
});

const WindowReminderEditorNode: EditorNodeDef<WindowReminderEditorNodeProperties> =
  {
    category: WindowReminderNode.NodeCategoryLabel,
    color: WindowReminderNode.NodeColor,
    icon: "font-awesome/fa-window-restore",
    defaults: WindowReminderEditorNodePropertiesDefaults,
    label: function () {
      return this.name || i18n("helper.window-reminder.name");
    },
    inputs: WindowReminderNodeOptionsDefaults.inputs,
    outputs: WindowReminderNodeOptionsDefaults.outputs,
    outputLabels: (_: number) => {
      return i18n("helper.window-reminder.output.notification");
    },
    oneditprepare: function () {
      windowReminderMigration.checkAndMigrate(this);
      BaseEditorNode.oneditprepare!.call(this);

      inputMatcherList.initialize("matcher-rows", this.matchers, {
        translatePrefix: "flowctrl.match-join",
      });

      const windowReminderOptionsBuilder = new NodeEditorFormBuilder(
        $("#window-reminder-options"),
        {
          translatePrefix: "helper.window-reminder",
        }
      );

      windowReminderOptionsBuilder.createTimeInput({
        id: "node-input-interval",
        idType: "node-input-intervalUnit",
        label: "interval",
        value: this.interval,
        valueType: this.intervalUnit,
        icon: "clock-o",
      });
    },
    oneditsave: function () {
      this.matchers = inputMatcherList.values();
    },
  };

export default WindowReminderEditorNode;
