import { EditorNodeDef } from "node-red";
import BaseEditorNode, {
  createEditorDefaults,
  i18n,
  NodeEditorFormBuilder,
} from "../../../flowctrl/base/editor";
import { MatchJoinEditableList } from "../../../flowctrl/match-join/editor";
import WhitegoodReminderNode from "./";
import {
  WhitegoodReminderEditorNodeProperties,
  WhitegoodReminderNodeOptions,
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
    defaults: createEditorDefaults<
      WhitegoodReminderNodeOptions,
      WhitegoodReminderEditorNodeProperties
    >(WhitegoodReminderNodeOptionsDefaults),
    label: function () {
      return this.name?.trim()
        ? this.name.trim()
        : i18n("helper.whitegood-reminder.name");
    },
    inputs: WhitegoodReminderNodeOptionsDefaults.inputs,
    outputs: WhitegoodReminderNodeOptionsDefaults.outputs,
    outputLabels: function (index: number) {
      const outputs = ["notification", "runs"];

      return i18n(`helper.whitegood-reminder.output.${outputs[index]}`);
    },
    oneditprepare: function () {
      BaseEditorNode.oneditprepare!.call(this);

      inputMatcherList.initialize("matcher-rows", this.matchers, {
        translatePrefix: "flowctrl.match-join",
      });

      inputMatcherList.showHideTarget(
        this.cleanupEnabled,
        WhitegoodReminderTarget.runs
      );
      inputMatcherList.showHideTarget(
        this.emptyReminderEnabled,
        WhitegoodReminderTarget.emptied
      );

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
        inputMatcherList.removeTarget(
          cleanupEnabled,
          WhitegoodReminderTarget.runs
        );
      });

      const emptyReminderEnabled =
        whitegoodReminderOptionsBuilder.createCheckboxInput({
          id: "node-input-emptyReminderEnabled",
          label: "emptyReminderEnabled",
          value: this.emptyReminderEnabled,
          icon: "tint",
        });

      const emptyReminderIntervalRow = whitegoodReminderOptionsBuilder
        .createTimeInput({
          id: "node-input-emptyReminderInterval",
          idType: "node-input-emptyReminderUnit",
          label: "emptyReminderInterval",
          value: this.emptyReminderInterval,
          valueType: this.emptyReminderUnit,
          icon: "clock-o",
        })
        .parent()
        .toggle(this.emptyReminderEnabled);

      emptyReminderEnabled.on("change", function () {
        const emptyReminderEnabled = $(this).is(":checked");
        emptyReminderIntervalRow.toggle(emptyReminderEnabled);
        inputMatcherList.removeTarget(
          emptyReminderEnabled,
          WhitegoodReminderTarget.emptied
        );
      });
    },
    oneditsave: function () {
      this.matchers = inputMatcherList.values();
    },
  };

export default WhitegoodReminderEditorNode;
