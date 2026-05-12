import {
  buildEditorMetadata,
  buildEditorNodeDef,
  buildEditorTemplate,
  i18n,
  NodeEditorDefinition,
} from "../../flowctrl/base/editor";
import { EditorNodeInstance } from "node-red";
import { EditorMetadata } from "../../types";
import {
  buildSwitchFormContent,
  buildSwitchOutputLabels,
} from "../switch/editor";
import ToggleNode from "./";
import { ToggleEditorNodeProperties, ToggleNodeOptionsDefaults } from "./types";

const ToggleEditorDefinition: NodeEditorDefinition<
  typeof ToggleNodeOptionsDefaults,
  ToggleEditorNodeProperties
> = {
  localePrefix: "logical.toggle",
  nodeClass: ToggleNode,
  defaults: ToggleNodeOptionsDefaults,
  icon: "font-awesome/fa-exchange",
  inputMode: "msg-property",
  fieldKeys: [],
  outputKeys: [],
  form: {
    id: "logical-switch-options",
    fields: [],
    build: buildSwitchFormContent,
  },
  baseTemplate: "without-status",
  hooks: {
    label(node: EditorNodeInstance<ToggleEditorNodeProperties>) {
      return node.name?.trim() ? node.name.trim() : i18n("logical.toggle.name");
    },
    outputLabels(
      node: EditorNodeInstance<ToggleEditorNodeProperties>,
      index: number,
    ) {
      return buildSwitchOutputLabels(node, index);
    },
  },
};

export const ToggleEditorTemplate = buildEditorTemplate(ToggleEditorDefinition);
export const ToggleEditorMetadata: EditorMetadata = buildEditorMetadata(
  ToggleEditorDefinition,
);
export default buildEditorNodeDef(ToggleEditorDefinition);
