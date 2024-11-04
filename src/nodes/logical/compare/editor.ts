import { EditorNodeDef } from "node-red";
import BaseNodeEditor from "../../flowctrl/base/editor";
import {
  CompareNodeEditorProperties,
  CompareNodeType,
  defaultCompareNodeConfig,
} from "./types";

const CompareNodeEditor: EditorNodeDef<CompareNodeEditorProperties> = {
  ...BaseNodeEditor,
  category: CompareNodeType.categoryLabel,
  color: CompareNodeType.color,
  defaults: {
    ...BaseNodeEditor.defaults,
    property: { value: defaultCompareNodeConfig.property!, required: true },
    propertyType: {
      value: defaultCompareNodeConfig.propertyType!,
      required: true,
    },
    operator: { value: defaultCompareNodeConfig.operator!, required: true },
    value: { value: defaultCompareNodeConfig.value!, required: true },
    valueType: { value: defaultCompareNodeConfig.valueType!, required: true },
  },
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
    if (BaseNodeEditor.oneditprepare) {
      BaseNodeEditor.oneditprepare.call(this);
    }

    $("#node-input-property").typedInput({
      types: ["msg"],
      typeField: "#node-input-propertyType",
    });

    const valueRow = $("#node-input-value")
      .typedInput({
        types: ["str", "num", "msg"],
        typeField: "#node-input-valueType",
      })
      .parent();

    valueRow.toggle(
      !["true", "false", "empty", "not_empty"].includes(this.operator)
    );

    $("#node-input-operator").on("change", function () {
      valueRow.toggle(
        !["true", "false", "empty", "not_empty"].includes(
          $(this).val() as string
        )
      );
    });
  },
};

export default CompareNodeEditor;

export { CompareNodeType };
