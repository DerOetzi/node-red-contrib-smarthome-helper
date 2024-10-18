import { EditorNodeProperties } from "node-red";

export interface BaseNodeEditorProperties extends EditorNodeProperties {
  name: string;
  topic: string;
  topicType: string;
  filterUniquePayload: boolean;
  newMsg: boolean;
}

export const baseNodeEditorPropertiesDefaults: Record<
  keyof BaseNodeEditorProperties,
  any
> = {
  name: { value: "", required: false },
  topic: { value: "topic", required: true },
  topicType: { value: "msg", required: true },
  filterUniquePayload: { value: false, required: false },
  newMsg: { value: false, required: false },
  inputs: { value: 1, required: true },
};
