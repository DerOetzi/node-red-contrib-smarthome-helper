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
import LogicalOpNode from "./";
import {
  LogicalFunction,
  LogicalOpEditorNodeProperties,
  LogicalOpNodeOptionsDefaults,
} from "./types";

const LogicalOpEditorDefinition: NodeEditorDefinition<
  typeof LogicalOpNodeOptionsDefaults,
  LogicalOpEditorNodeProperties
> = {
  localePrefix: "logical.op",
  nodeClass: LogicalOpNode,
  defaults: LogicalOpNodeOptionsDefaults,
  icon: "font-awesome/fa-some-lightbulb-o",
  inputMode: "msg-property",
  fieldKeys: ["operation", "minMsgCount"],
  outputKeys: [],
  form: {
    id: "logical-op-options",
    fields: [
      {
        type: "select",
        key: "operation",
        icon: "cogs",
        options: Object.keys(LogicalFunction),
      },
      {
        type: "number",
        key: "minMsgCount",
        icon: "hashtag",
        dependsOn: "operation",
        dependsOnValues: Object.keys(LogicalFunction).filter(
          (k) => k !== "not",
        ),
      },
    ],
  },
  extraForms: [{ id: "logical-switch-options", build: buildSwitchFormContent }],
  baseTemplate: "without-status",
  hooks: {
    label(node: EditorNodeInstance<LogicalOpEditorNodeProperties>) {
      const logicalOp = i18n(
        "logical.op.field.operation.options." + node.operation,
      );
      return node.name ? `${node.name} (${logicalOp})` : logicalOp;
    },
    outputLabels(
      node: EditorNodeInstance<LogicalOpEditorNodeProperties>,
      index: number,
    ) {
      return buildSwitchOutputLabels(node, index);
    },
  },
};

export const LogicalOpEditorTemplate = buildEditorTemplate(
  LogicalOpEditorDefinition,
);
export const LogicalOpEditorMetadata: EditorMetadata = buildEditorMetadata(
  LogicalOpEditorDefinition,
);
export default buildEditorNodeDef(LogicalOpEditorDefinition);
