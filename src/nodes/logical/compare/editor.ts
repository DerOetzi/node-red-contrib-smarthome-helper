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
import CompareNode from "./";
import {
  ApplicableCompareFunction,
  CompareEditorNodeProperties,
  CompareNodeOptionsDefaults,
  NotApplicableCompareFunction,
} from "./types";

const CompareEditorDefinition: NodeEditorDefinition<
  typeof CompareNodeOptionsDefaults,
  CompareEditorNodeProperties
> = {
  localePrefix: "logical.compare",
  nodeClass: CompareNode,
  defaults: CompareNodeOptionsDefaults,
  icon: "font-awesome/fa-search",
  inputMode: "msg-property",
  fieldKeys: ["property", "operation", "compare"],
  outputKeys: [],
  form: {
    id: "logical-compare-options",
    fields: [
      {
        type: "typed",
        key: "property",
        idType: "node-input-propertyType",
        icon: "envelope-o",
        types: ["msg"],
      },
      {
        type: "select",
        key: "operation",
        icon: "search",
        options: [
          ...Object.keys(ApplicableCompareFunction),
          ...Object.keys(NotApplicableCompareFunction),
        ],
      },
      {
        type: "typed",
        key: "compare",
        idType: "node-input-compareType",
        icon: "search",
        types: ["str", "num", "bool", "msg"],
        dependsOn: "operation",
        dependsOnValues: Object.keys(ApplicableCompareFunction),
      },
    ],
  },
  extraForms: [{ id: "logical-switch-options", build: buildSwitchFormContent }],
  baseTemplate: "without-status",
  hooks: {
    label(node: EditorNodeInstance<CompareEditorNodeProperties>) {
      const operation = i18n(
        "logical.compare.field.operation.options." + node.operation,
      );
      return node.name ? `${node.name} (${operation})` : operation;
    },
    outputLabels(
      node: EditorNodeInstance<CompareEditorNodeProperties>,
      index: number,
    ) {
      return buildSwitchOutputLabels(node, index);
    },
  },
};

export const CompareEditorTemplate = buildEditorTemplate(
  CompareEditorDefinition,
);
export const CompareEditorMetadata: EditorMetadata = buildEditorMetadata(
  CompareEditorDefinition,
);
export default buildEditorNodeDef(CompareEditorDefinition);
