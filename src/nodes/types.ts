import { NodeMessage } from "node-red";

export interface NodeCategory {
  label: string;
  name: string;
}

export enum NodeColor {
  AutomationGate = "#ff7f50",
  Base = "#7fffd4",
  Climate = "#ff69b4",
  Light = "#ffd700",
  Logical = "#7fff00",
  Notification = "#87CEEB",
  Switch = "#ff8c00",
}

export type NodeSendFunction = (
  msg: NodeMessage | Array<NodeMessage | NodeMessage[] | null>
) => void;

export type NodeDoneFunction = (err?: Error, msg?: NodeMessage) => void;
