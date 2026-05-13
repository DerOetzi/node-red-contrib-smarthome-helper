import {
  NodeEditorDefinition,
  NodeEditorFormEditableList,
} from "../../../flowctrl/base/editor";
import { TimeIntervalUnit } from "../../../../helpers/time.helper";
import { MatchJoinEditableList } from "../../../flowctrl/match-join/editor";
import WindowReminderNode from "./";
import {
  WindowReminderEditorNodeProperties,
  WindowReminderIntervalRow,
  WindowReminderNodeOptionsDefaults,
  WindowReminderTarget,
} from "./types";

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

export const WindowReminderEditorDef: NodeEditorDefinition<
  typeof WindowReminderNodeOptionsDefaults,
  WindowReminderEditorNodeProperties
> = {
  localePrefix: "helper.window-reminder",
  nodeClass: WindowReminderNode,
  defaults: WindowReminderNodeOptionsDefaults,
  icon: "font-awesome/fa-window-restore",
  inputMode: "matcher-topic",
  inputKeys: ["window", "presence", "command", "intervalSelect"],
  outputKeys: ["notification"],
  lists: [
    {
      id: "matcher-rows",
      create: () =>
        new MatchJoinEditableList({
          targets: Object.values(WindowReminderTarget),
          translatePrefix: "helper.window-reminder",
        }),
      dataKey: "matchers",
    },
    {
      id: "window-reminder-intervals",
      create: () => new IntervalsEditableList(),
      dataKey: "intervals",
      rowTranslatePrefix: "helper.window-reminder",
    },
  ],
  baseTemplate: "input-only",
  hooks: {
    oneditprepare(node, ctx) {
      const matcherList = ctx.getList("matcher-rows");
      const intervalsList = ctx.getList("window-reminder-intervals");

      matcherList.showHideTarget?.(
        node.intervals.length > 0,
        WindowReminderTarget.command,
      );
      matcherList.showHideTarget?.(
        node.intervals.length > 1,
        WindowReminderTarget.intervalSelect,
      );

      $("#window-reminder-intervals").on("change" as any, () => {
        const count = intervalsList.values().length;
        matcherList.removeTarget?.(count > 0, WindowReminderTarget.command);
        matcherList.removeTarget?.(
          count > 1,
          WindowReminderTarget.intervalSelect,
        );
      });
    },
  },
};
