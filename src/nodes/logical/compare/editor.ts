import { EditorNodeDef } from "node-red";
import { i18n, NodeEditorFormBuilder } from "../../flowctrl/base/editor";
import SwitchEditorNode from "../switch/editor";
import CompareNode from "./";
import { compareMigration } from "./migration";
import {
  ApplicableCompareFunction,
  CompareEditorNodeProperties,
  CompareEditorNodePropertiesDefaults,
  CompareNodeOptionsDefaults,
  NotApplicableCompareFunction,
} from "./types";

const CompareEditorNode: EditorNodeDef<CompareEditorNodeProperties> = {
  category: CompareNode.NodeCategory.label,
  color: CompareNode.NodeColor,
  icon: "font-awesome/fa-search",
  defaults: CompareEditorNodePropertiesDefaults,
  label: function () {
    const operation = i18n(
      "logical.compare.select.operation." + this.operation
    );
    let label: string = operation;

    if (this.name) {
      label = `${this.name} (${operation})`;
    }

    return label;
  },
  inputs: CompareNodeOptionsDefaults.inputs,
  outputs: CompareNodeOptionsDefaults.outputs,
  outputLabels: function (index) {
    if (typeof SwitchEditorNode.outputLabels === "function") {
      return SwitchEditorNode.outputLabels.call(this, index);
    }
    return undefined;
  },
  oneditprepare: function () {
    compareMigration.checkAndMigrate(this);

    SwitchEditorNode.oneditprepare!.call(this);

    const compareOptionsBuilder = new NodeEditorFormBuilder(
      $("#logical-compare-options"),
      { translatePrefix: "logical.compare" }
    );

    compareOptionsBuilder.createTypedInput({
      id: "node-input-property",
      idType: "node-input-propertyType",
      label: "property",
      value: this.property,
      valueType: this.propertyType,
      types: ["msg"],
      icon: "envelope-o",
    });

    const operationSelect = compareOptionsBuilder.createSelectInput({
      id: "node-input-operation",
      label: "operation",
      value: this.operation,
      icon: "search",
      options: [
        ...Object.keys(ApplicableCompareFunction),
        ...Object.keys(NotApplicableCompareFunction),
      ],
    });

    const valueInput = compareOptionsBuilder.createTypedInput({
      id: "node-input-compare",
      idType: "node-input-compareType",
      label: "compare",
      value: this.compare,
      valueType: this.compareType,
      types: ["str", "num", "bool", "msg"],
      icon: "search",
    });

    const valueInputRow = valueInput
      .parent()
      .toggle(this.operation in ApplicableCompareFunction);

    valueInput.on("change", function () {
      valueInputRow.toggle(
        (operationSelect.val() as string) in ApplicableCompareFunction
      );
    });
  },
};

export default CompareEditorNode;
