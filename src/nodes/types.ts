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

export interface EditorMetadata {
  localePrefix: string;
  fieldKeys?: string[];
  inputKeys?: string[];
  outputKeys?: string[];
  inputMode?: "msg-property" | "matcher-topic";
}

export interface NodeRegistryEntry {
  node: any;
  editor: EditorNodeDef<any>;
  metadata?: EditorMetadata;
}
