import { EditorNodeDef } from "node-red";
import { NodeType } from "../../../const";
import { BaseNodeEditorProperties, defaultBaseNodeConfig } from "./types";

const nodeType = NodeType.FlowCtrlBase;

const BaseNodeEditor: EditorNodeDef<BaseNodeEditorProperties> = {
  category: nodeType.category.label,
  color: nodeType.color,
  defaults: {
    name: { value: "", required: false },
    topic: { value: defaultBaseNodeConfig.topic!, required: true },
    topicType: { value: defaultBaseNodeConfig.topicType!, required: true },
    debounce: { value: defaultBaseNodeConfig.debounce!, required: false },
    debounceTime: {
      value: defaultBaseNodeConfig.debounceTime!,
      required: false,
    },
    debounceUnit: {
      value: defaultBaseNodeConfig.debounceUnit!,
      required: false,
    },
    debounceLeading: {
      value: defaultBaseNodeConfig.debounceLeading!,
      required: false,
    },
    debounceTrailing: {
      value: defaultBaseNodeConfig.debounceTrailing!,
      required: false,
    },
    filterUniquePayload: {
      value: defaultBaseNodeConfig.filterUniquePayload!,
      required: false,
    },
    newMsg: { value: defaultBaseNodeConfig.newMsg!, required: false },
  },
  inputs: 1,
  outputs: 1,
  label: function () {
    return this.name || nodeType.name;
  },
  oneditprepare: function () {
    $("#node-input-topic").typedInput({
      types: ["msg", "str"],
      typeField: "#node-input-topicType",
    });

    const debounceOptions = $("#debounce-options");

    debounceOptions.toggle(this.debounce);

    $("#node-input-debounce").on("change", function () {
      debounceOptions.toggle($(this).is(":checked"));
    });
  },
};

export default BaseNodeEditor;
