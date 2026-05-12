import {
  buildEditorMetadata,
  buildEditorNodeDef,
  buildEditorTemplate,
  NodeEditorDefinition,
} from "../base/editor";
import { MatchJoinEditableList } from "../match-join/editor";
import StatusNode from ".";
import {
  StatusEditorNodeProperties,
  StatusNodeOptions,
  StatusNodeOptionsDefaults,
  StatusNodeScope,
} from "./types";
import { ActiveControllerTarget } from "../active-controller/types";

const StatusDef: NodeEditorDefinition<
  StatusNodeOptions,
  StatusEditorNodeProperties
> = {
  localePrefix: "flowctrl.status",
  nodeClass: StatusNode,
  icon: "font-awesome/fa-key",
  defaults: StatusNodeOptionsDefaults,
  inputMode: "msg-property",
  inputKeys: ["activeCondition"],
  outputKeys: ["status", "statusText"],
  baseTemplate: "input-without-status",
  lists: [
    {
      id: "matcher-rows",
      create: () =>
        new MatchJoinEditableList({
          targets: [ActiveControllerTarget.activeCondition],
          translatePrefix: "flowctrl.status",
        }),
      dataKey: "matchers",
    },
  ],
  form: {
    id: "status-node-options",
    fields: [
      {
        type: "select",
        key: "scope",
        icon: "sitemap",
        options: Object.values(StatusNodeScope),
      },
      { type: "checkbox", key: "defaultActive", icon: "toggle-on" },
    ],
  },
};

export const StatusEditorTemplate = buildEditorTemplate(StatusDef);
export const StatusEditorMetadata = buildEditorMetadata(StatusDef);

export default buildEditorNodeDef(StatusDef);
