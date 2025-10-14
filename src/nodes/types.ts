import { EditorNodeDef, NodeMessage } from "node-red";

export interface NodeCategory {
  label: string;
  name: string;
  color: string;
}

export type NodeSendFunction = (
  msg: NodeMessage | Array<NodeMessage | NodeMessage[] | null>
) => void;

export type NodeDoneFunction = (err?: Error, msg?: NodeMessage) => void;

export interface NodeRegistryEntry {
  node: any;
  editor: EditorNodeDef<any>;
  migration?: any;
}
