/* eslint-disable no-unused-vars */

import { EditorNodeDef, NodeMessage } from "node-red";

export interface NodeCategory {
  label: string;
  name: string;
  color: string;
}

export type NodeSendFunction = (
  msg: NodeMessage | Array<NodeMessage | NodeMessage[] | null>,
) => void;

export type NodeDoneFunction = (err?: Error, msg?: NodeMessage) => void;

export type EditorTemplateElement =
  | { tag: "div"; id: string; data?: Record<string, string> }
  | { tag: "ol"; id: string }
  | "hr";

export interface EditorMetadata {
  localePrefix: string;
  fieldKeys?: string[];
  inputKeys?: string[];
  outputKeys?: string[];
  inputMode?: "msg-property" | "matcher-topic";
  template?: EditorTemplateElement[];
}

export interface NodeRegistryEntry {
  node: any;
  editor: EditorNodeDef<any>;
  metadata?: EditorMetadata;
}
