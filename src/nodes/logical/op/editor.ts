import { EditorNodeDef } from "node-red";
import { i18n, NodeEditorFormBuilder } from "../../flowctrl/base/editor";
import SwitchEditorNode from "../switch/editor";
import LogicalOpNode from "./";
import { logicalOpMigration } from "./migration";
import {
  LogicalFunction,
  LogicalOpEditorNodeProperties,
  LogicalOpEditorNodePropertiesDefaults,
  LogicalOpNodeOptionsDefaults,
} from "./types";

const LogicalOpEditorNode: EditorNodeDef<LogicalOpEditorNodeProperties> = {
  category: LogicalOpNode.NodeCategory.label,
  color: LogicalOpNode.NodeColor,
  icon: "font-awesome/fa-some-lightbulb-o",
  defaults: LogicalOpEditorNodePropertiesDefaults,
  label: function () {
    const logicalOp = i18n("logical.op.select.operation." + this.operation);
    let label: string = logicalOp;

    if (this.name) {
      label = `${this.name} (${logicalOp})`;
    }

    return label;
  },
  inputs: LogicalOpNodeOptionsDefaults.inputs,
  outputs: LogicalOpNodeOptionsDefaults.outputs,
  outputLabels: function (index) {
    if (typeof SwitchEditorNode.outputLabels === "function") {
      return SwitchEditorNode.outputLabels.call(this, index);
    }
    return undefined;
  },
  oneditprepare: function () {
    logicalOpMigration.checkAndMigrate(this);

    SwitchEditorNode.oneditprepare!.call(this);

    const logicalOpOptionsBuilder = new NodeEditorFormBuilder(
      $("#logical-op-options"),
      { translatePrefix: "logical.op" }
    );

    const operationSelect = logicalOpOptionsBuilder.createSelectInput({
      id: "node-input-operation",
      label: "operation",
      value: this.operation,
      icon: "cogs",
      options: Object.keys(LogicalFunction),
    });

    const minMsgCount = logicalOpOptionsBuilder.createNumberInput({
      id: "node-input-minMsgCount",
      label: "minMsgCount",
      value: this.minMsgCount,
      icon: "hashtag",
    });

    const minMsgCountRow = minMsgCount
      .parent()
      .toggle(this.operation !== "not");

    operationSelect.on("change", function () {
      const isNot = ($(this).val() as string) === "not";

      minMsgCountRow.toggle(!isNot);
      if (isNot) {
        minMsgCount.val(1);
      }
    });
  },
};

export default LogicalOpEditorNode;
