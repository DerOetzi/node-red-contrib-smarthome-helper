import {
  buildEditorMetadata,
  buildEditorNodeDef,
  buildEditorTemplate,
  NodeEditorDefinition,
} from "../../../flowctrl/base/editor";
import { MatchJoinEditableList } from "../../../flowctrl/match-join/editor";
import WasteReminderNode from ".";
import {
  WasteReminderEditorNodeProperties,
  WasteReminderNodeOptionsDefaults,
  WasteReminderTarget,
} from "./types";

const WasteReminderEditorDefinition: NodeEditorDefinition<
  typeof WasteReminderNodeOptionsDefaults,
  WasteReminderEditorNodeProperties
> = {
  localePrefix: "helper.waste-reminder",
  nodeClass: WasteReminderNode,
  defaults: WasteReminderNodeOptionsDefaults,
  icon: "font-awesome/fa-recycle",
  inputMode: "matcher-topic",
  inputKeys: ["types", "remaining"],
  outputKeys: ["notification"],
  lists: [
    {
      id: "matcher-rows",
      create: () =>
        new MatchJoinEditableList({
          targets: Object.values(WasteReminderTarget),
          translatePrefix: "helper.waste-reminder",
        }),
      dataKey: "matchers",
    },
  ],
  baseTemplate: "input-only",
};

export const WasteReminderEditorTemplate = buildEditorTemplate(
  WasteReminderEditorDefinition,
);
export const WasteReminderEditorMetadata = buildEditorMetadata(
  WasteReminderEditorDefinition,
);
export default buildEditorNodeDef(WasteReminderEditorDefinition);
