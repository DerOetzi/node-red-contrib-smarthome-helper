import { EditorNodeDef } from "node-red";
import { NodeType } from "../../../const";
import {
  BaseNodeEditorProperties,
  baseNodeEditorPropertiesDefaults,
} from "../../../editor/types";

interface CompareNodeProperties extends BaseNodeEditorProperties {
  property: string;
  propertyType: string;
  operator: string;
  value: string;
  valueType: string;
}

const nodeType = NodeType.Compare;

const CompareNodeEditor: EditorNodeDef<CompareNodeProperties> = {
  category: nodeType.category.label,
  color: nodeType.color,
  defaults: {
    property: { value: "payload", required: true },
    propertyType: { value: "msg", required: true },
    operator: { value: "eq", required: true },
    value: { value: "", required: true },
    valueType: { value: "str", required: true },
    ...baseNodeEditorPropertiesDefaults,
  },
  inputs: 1,
  outputs: 1,
  outputLabels: ["Result of comparison"],
  icon: "compare.svg",
  label: function () {
    const operator = this.operator;
    let label: string = operator;

    if (this.name) {
      label = `${this.name} (${operator})`;
    }

    return label;
  },
  oneditprepare: function () {
    $("#node-input-property").typedInput({
      types: ["msg"],
    });

    $("#node-input-value").typedInput({
      types: ["str", "num", "msg"],
    });

    const valueRow = $("#node-input-value").parent();

    $("#node-input-operator").on("change", function () {
      const operator = $(this).val() as string;
      if (["true", "false", "empty", "not_empty"].includes(operator)) {
        valueRow.hide();
      } else {
        valueRow.show();
      }
    });

    $("#node-input-operator").trigger("change");

    $("#node-input-topic").typedInput({
      types: ["msg", "str"],
      typeField: "#node-input-topicType",
    });
  },
};

export default CompareNodeEditor;
