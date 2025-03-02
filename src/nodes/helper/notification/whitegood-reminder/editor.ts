import { EditorNodeDef } from "node-red";
import BaseEditorNode, {
  i18n,
  NodeEditorFormBuilder,
} from "../../../flowctrl/base/editor";
import { MatchJoinEditableList } from "../../../flowctrl/match-join/editor";
import WhitegoodReminderNode from "./";
import { whitegoodReminderMigration } from "./migration";
import {
  WhitegoodReminderEditorNodeProperties,
  WhitegoodReminderEditorNodePropertiesDefaults,
  WhitegoodReminderNodeOptionsDefaults,
  WhitegoodReminderTarget,
} from "./types";

const inputMatcherList = new MatchJoinEditableList({
  targets: Object.values(WhitegoodReminderTarget),
  translatePrefix: "helper.whitegood-reminder",
});

const WhitegoodReminderEditorNode: EditorNodeDef<WhitegoodReminderEditorNodeProperties> =
  {
    category: WhitegoodReminderNode.NodeCategoryLabel,
    color: WhitegoodReminderNode.NodeColor,
    icon: "font-awesome/fa-plug",
    defaults: WhitegoodReminderEditorNodePropertiesDefaults,
    label: function () {
      return this.name || i18n("helper.whitegood-reminder.name");
    },
    inputs: WhitegoodReminderNodeOptionsDefaults.inputs,
    outputs: WhitegoodReminderNodeOptionsDefaults.outputs,
    outputLabels: function (index: number) {
      const outputs = ["notification", "runs"];

      return i18n(`helper.whitegood-reminder.output.${outputs[index]}`);
    },
    oneditprepare: function () {
      whitegoodReminderMigration.checkAndMigrate(this);
      BaseEditorNode.oneditprepare!.call(this);

      inputMatcherList.initialize("matcher-rows", this.matchers, {
        translatePrefix: "flowctrl.match-join",
      });

      inputMatcherList.showHideTarget(this.cleanupEnabled, "runs");

      const whitegoodReminderOptionsBuilder = new NodeEditorFormBuilder(
        $("#whitegood-reminder-options"),
        {
          translatePrefix: "helper.whitegood-reminder",
        }
      );

      whitegoodReminderOptionsBuilder.createNumberInput({
        id: "node-input-offPowerLimit",
        label: "offPowerLimit",
        value: this.offPowerLimit,
        icon: "level-down",
      });

      whitegoodReminderOptionsBuilder.createNumberInput({
        id: "node-input-standbyPowerLimit",
        label: "standbyPowerLimit",
        value: this.standbyPowerLimit,
        icon: "level-up",
      });

      whitegoodReminderOptionsBuilder.createCheckboxInput({
        id: "node-input-statusShowRuns",
        label: "statusShowRuns",
        value: this.statusShowRuns,
        icon: "tint",
      });

      const cleanupEnabled =
        whitegoodReminderOptionsBuilder.createCheckboxInput({
          id: "node-input-cleanupEnabled",
          label: "cleanupEnabled",
          value: this.cleanupEnabled,
          icon: "tint",
        });

      const cleanupIntervalRow = whitegoodReminderOptionsBuilder
        .createNumberInput({
          id: "node-input-cleanupInterval",
          label: "cleanupInterval",
          value: this.cleanupInterval,
          icon: "hashtag",
        })
        .parent()
        .toggle(this.cleanupEnabled);

      cleanupEnabled.on("change", function () {
        const cleanupEnabled = $(this).is(":checked");
        cleanupIntervalRow.toggle(cleanupEnabled);
        inputMatcherList.removeTarget(cleanupEnabled, "runs");
      });
    },
    oneditsave: function () {
      this.matchers = inputMatcherList.values();
    },
  };

export default WhitegoodReminderEditorNode;
