import { EditorNodeDef, EditorNodeProperties } from "node-red";
import { NodeType } from "../../../const";

export interface CommonNodeEditorProperties extends EditorNodeProperties {
  name: string;
  topic: string;
  topicType: string;
  debounce: boolean;
  debounceTime: number;
  debounceUnit: string;
  debounceLeading: boolean;
  debounceTrailing: boolean;
  filterUniquePayload: boolean;
  newMsg: boolean;
}

const nodeType = NodeType.FlowCtrlCommon;

const CommonNodeEditor: EditorNodeDef<CommonNodeEditorProperties> = {
  category: nodeType.category.label,
  color: nodeType.color,
  defaults: {
    name: { value: "", required: false },
    topic: { value: "topic", required: true },
    topicType: { value: "msg", required: true },
    debounce: { value: false, required: false },
    debounceTime: { value: 500, required: false },
    debounceUnit: { value: "ms", required: false },
    debounceLeading: { value: true, required: false },
    debounceTrailing: { value: false, required: false },
    filterUniquePayload: { value: false, required: false },
    newMsg: { value: false, required: false },
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
  },
};

export default CommonNodeEditor;
