import {
  buildEditorMetadata,
  buildEditorNodeDef,
  buildEditorTemplate,
  NodeEditorDefinition,
} from "../../../flowctrl/base/editor";
import { MatchJoinEditableList } from "../../../flowctrl/match-join/editor";
import WhitegoodReminderNode from "./";
import {
  WhitegoodReminderEditorNodeProperties,
  WhitegoodReminderNodeOptionsDefaults,
  WhitegoodReminderTarget,
} from "./types";

const WhitegoodReminderEditorDefinition: NodeEditorDefinition<
  typeof WhitegoodReminderNodeOptionsDefaults,
  WhitegoodReminderEditorNodeProperties
> = {
  localePrefix: "helper.whitegood-reminder",
  nodeClass: WhitegoodReminderNode,
  defaults: WhitegoodReminderNodeOptionsDefaults,
  icon: "font-awesome/fa-plug",
  inputMode: "matcher-topic",
  inputKeys: ["power", "runs", "emptied"],
  outputKeys: ["notification", "runs"],
  lists: [
    {
      id: "matcher-rows",
      create: () =>
        new MatchJoinEditableList({
          targets: Object.values(WhitegoodReminderTarget),
          translatePrefix: "helper.whitegood-reminder",
        }),
      dataKey: "matchers",
    },
  ],
  form: {
    id: "whitegood-reminder-options",
    fields: [
      { type: "number", key: "offPowerLimit", icon: "level-down" },
      { type: "number", key: "standbyPowerLimit", icon: "level-up" },
      { type: "checkbox", key: "statusShowRuns", icon: "tint" },
      {
        type: "checkbox",
        key: "cleanupEnabled",
        icon: "tint",
        showsListTarget: {
          listId: "matcher-rows",
          target: WhitegoodReminderTarget.runs,
        },
      },
      {
        type: "number",
        key: "cleanupInterval",
        icon: "hashtag",
        dependsOn: "cleanupEnabled",
      },
      {
        type: "checkbox",
        key: "emptyReminderEnabled",
        icon: "tint",
        showsListTarget: {
          listId: "matcher-rows",
          target: WhitegoodReminderTarget.emptied,
        },
      },
      {
        type: "time",
        key: "emptyReminderInterval",
        icon: "clock-o",
        idType: "node-input-emptyReminderUnit",
        valueTypeKey: "emptyReminderUnit",
        dependsOn: "emptyReminderEnabled",
      },
    ],
  },
  baseTemplate: "input-only",
};

export const WhitegoodReminderEditorTemplate = buildEditorTemplate(
  WhitegoodReminderEditorDefinition,
);
export const WhitegoodReminderEditorMetadata = buildEditorMetadata(
  WhitegoodReminderEditorDefinition,
);
export default buildEditorNodeDef(WhitegoodReminderEditorDefinition);
