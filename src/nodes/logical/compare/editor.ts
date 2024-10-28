import { EditorNodeDef } from "node-red";
import { NodeType } from "../../../const";
import CommonNodeEditor, {
  CommonNodeEditorProperties,
} from "../../flowctrl/common/editor";

interface CompareNodeProperties extends CommonNodeEditorProperties {
  property: string;
  propertyType: string;
  operator: string;
  value: string;
  valueType: string;
}

const nodeType = NodeType.LogicalCompare;

const CompareNodeEditor: EditorNodeDef<CompareNodeProperties> = {
  ...CommonNodeEditor,
  category: nodeType.category.label,
  color: nodeType.color,
  defaults: {
    ...CommonNodeEditor.defaults,
    property: { value: "payload", required: true },
    propertyType: { value: "msg", required: true },
    operator: { value: "eq", required: true },
    value: { value: "", required: true },
    valueType: { value: "str", required: true },
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
    if (CommonNodeEditor.oneditprepare) {
      CommonNodeEditor.oneditprepare.call(this);
    }

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
  },
};

export default CompareNodeEditor;
