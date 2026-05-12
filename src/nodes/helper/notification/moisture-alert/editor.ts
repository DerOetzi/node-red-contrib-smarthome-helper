import {
  buildEditorMetadata,
  buildEditorNodeDef,
  buildEditorTemplate,
  NodeEditorDefinition,
} from "../../../flowctrl/base/editor";
import { MatchJoinEditableList } from "../../../flowctrl/match-join/editor";
import MoistureAlertNode from ".";
import {
  MoistureAlertEditorNodeProperties,
  MoistureAlertNodeOptionsDefaults,
  MoistureAlertTarget,
} from "./types";

const MoistureAlertEditorDefinition: NodeEditorDefinition<
  typeof MoistureAlertNodeOptionsDefaults,
  MoistureAlertEditorNodeProperties
> = {
  localePrefix: "helper.moisture-alert",
  nodeClass: MoistureAlertNode,
  defaults: MoistureAlertNodeOptionsDefaults,
  icon: "font-awesome/fa-leaf",
  inputMode: "matcher-topic",
  inputKeys: ["moisture", "lastAlert"],
  outputKeys: ["notification", "lastAlert"],
  lists: [
    {
      id: "matcher-rows",
      create: () =>
        new MatchJoinEditableList({
          targets: Object.values(MoistureAlertTarget),
          translatePrefix: "helper.moisture-alert",
        }),
      dataKey: "matchers",
    },
  ],
  form: {
    id: "moisture-alert-options",
    fields: [
      { type: "number", key: "alertThreshold", icon: "percent" },
      { type: "time", key: "alertInterval", icon: "clock-o" },
    ],
  },
  baseTemplate: "input-only",
};

export const MoistureAlertEditorTemplate = buildEditorTemplate(
  MoistureAlertEditorDefinition,
);
export const MoistureAlertEditorMetadata = buildEditorMetadata(
  MoistureAlertEditorDefinition,
);
export default buildEditorNodeDef(MoistureAlertEditorDefinition);
