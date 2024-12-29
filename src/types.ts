import { NodeMessage } from "node-red";

export type NodeRedSend = (
  msg: NodeMessage | Array<NodeMessage | NodeMessage[] | null>
) => void;

export type NodeRedDone = (err?: Error, msg?: NodeMessage) => void;
