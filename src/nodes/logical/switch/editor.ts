import { EditorNodeDef } from "node-red";
import { NodeType } from "../../../const";
import {
  BaseNodeEditorProperties,
  baseNodeEditorPropertiesDefaults,
} from "../../../editor/types";

interface SwitchNodeProperties extends BaseNodeEditorProperties {}

const nodeType = NodeType.LogicalSwitch;

const SwitchNodeEditor: EditorNodeDef<SwitchNodeProperties> = {
  category: nodeType.category.label,
  color: nodeType.color,
  defaults: {
    ...baseNodeEditorPropertiesDefaults,
  },
  inputs: 1,
  outputs: 2,
  outputLabels: ["true", "false"],
  icon: "switch.svg",
  label: function () {
    return this.name || "switch";
  },
  oneditprepare: function () {
    $("#node-input-topic").typedInput({
      types: ["msg", "str"],
      typeField: "#node-input-topicType",
    });
  },
};

export default SwitchNodeEditor;
