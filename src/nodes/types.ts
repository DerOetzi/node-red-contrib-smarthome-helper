import { NodeDef } from "node-red";

export interface BaseNodeConfig extends NodeDef {
  topic: string;
  topicType: string;
  filterUniquePayload: boolean;
  newMsg: boolean;
}
