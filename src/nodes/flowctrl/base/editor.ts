import { EditorNodeDef } from "node-red";
import {
  BaseNodeEditorProperties,
  BaseNodeType,
  defaultBaseNodeConfig,
} from "./types";

const BaseNodeEditor: EditorNodeDef<BaseNodeEditorProperties> = {
  category: BaseNodeType.categoryLabel,
  color: BaseNodeType.color,
  defaults: {
    name: { value: "", required: false },
    topic: { value: defaultBaseNodeConfig.topic!, required: true },
    topicType: { value: defaultBaseNodeConfig.topicType!, required: true },
    debounce: { value: defaultBaseNodeConfig.debounce!, required: false },
    debounceTopic: {
      value: defaultBaseNodeConfig.debounceTopic!,
      required: false,
    },
    debounceTime: {
      value: defaultBaseNodeConfig.debounceTime!,
      required: false,
    },
    debounceShowStatus: {
      value: defaultBaseNodeConfig.debounceShowStatus!,
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
    outputs: { value: defaultBaseNodeConfig.outputs!, required: true },
  },
  inputs: 1,
  outputs: 1,
  label: function () {
    return this.name || BaseNodeType.name;
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

export { BaseNodeType };
