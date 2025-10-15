import { EditorNodeDef, NodeMessage } from "node-red";
import BaseNode from "./flowctrl/base";
import { BaseNodeDef, BaseNodeOptions } from "./flowctrl/base/types";

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
}
