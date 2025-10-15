import { EditorNodeDef } from "node-red";
import { TimeIntervalUnit } from "../../../../helpers/time.helper";
import BaseEditorNode, {
  createEditorDefaults,
  i18n,
  NodeEditorFormEditableList,
} from "../../../flowctrl/base/editor";
import { MatchJoinEditableList } from "../../../flowctrl/match-join/editor";
import WindowReminderNode from "./";
import {
  WindowReminderEditorNodeProperties,
  WindowReminderIntervalRow,
  WindowReminderNodeOptions,
  WindowReminderNodeOptionsDefaults,
  WindowReminderTarget,
} from "./types";

const inputMatcherList = new MatchJoinEditableList({
  targets: Object.values(WindowReminderTarget),
  translatePrefix: "helper.window-reminder",
});

class IntervalsEditableList extends NodeEditorFormEditableList<WindowReminderIntervalRow> {
  protected addItem(data: WindowReminderIntervalRow, idx?: number): void {
    this.rowBuilder!.createTimeInput({
      id: "interval",
      idType: "intervalUnit",
      label: "interval",
      labelPlaceholders: { row: idx?.toString() ?? "" },
      value: data.interval ?? 10,
      valueType: data.intervalUnit ?? TimeIntervalUnit.m,
      icon: "clock-o",
    });
  }
}

const intervalsList = new IntervalsEditableList();

const WindowReminderEditorNode: EditorNodeDef<WindowReminderEditorNodeProperties> =
  {
    category: WindowReminderNode.NodeCategoryLabel,
    color: WindowReminderNode.NodeColor,
    icon: "font-awesome/fa-window-restore",
    defaults: createEditorDefaults<
      WindowReminderNodeOptions,
      WindowReminderEditorNodeProperties
    >(WindowReminderNodeOptionsDefaults),
    label: function () {
      return this.name?.trim()
        ? this.name.trim()
        : i18n("helper.window-reminder.name");
    },
    inputs: WindowReminderNodeOptionsDefaults.inputs,
    outputs: WindowReminderNodeOptionsDefaults.outputs,
    outputLabels: (_: number) => {
      return i18n("helper.window-reminder.output.notification");
    },
    oneditprepare: function () {
      BaseEditorNode.oneditprepare!.call(this);

      inputMatcherList.initialize("matcher-rows", this.matchers, {
        translatePrefix: "flowctrl.match-join",
      });

      inputMatcherList.showHideTarget(
        this.intervals.length > 0,
        WindowReminderTarget.command
      );

      inputMatcherList.showHideTarget(
        this.intervals.length > 1,
        WindowReminderTarget.intervalSelect
      );

      intervalsList.initialize("window-reminder-intervals", this.intervals, {
        translatePrefix: "helper.window-reminder",
      });

      $("#window-reminder-intervals").on("change" as any, () => {
        const intervalsCount = intervalsList.values().length;

        inputMatcherList.removeTarget(
          intervalsCount > 0,
          WindowReminderTarget.command
        );
        inputMatcherList.removeTarget(
          intervalsCount > 1,
          WindowReminderTarget.intervalSelect
        );
      });
    },
    oneditsave: function () {
      this.matchers = inputMatcherList.values();
      this.intervals = intervalsList.values();
    },
  };

export default WindowReminderEditorNode;
