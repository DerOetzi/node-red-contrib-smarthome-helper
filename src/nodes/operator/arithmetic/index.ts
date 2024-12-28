import { Node } from "node-red";
import { RED } from "../../../globals";
import { BaseNodeDebounceData } from "../../flowctrl/base/types";
import MatchJoinNode from "../../flowctrl/match-join";
import { MatchJoinNodeData } from "../../flowctrl/match-join/types";
import { NodeType } from "../../types";
import {
  addOp,
  maxOp,
  meanOp,
  minOp,
  mulOp,
  roundOp,
  subOp,
} from "./operations";
import {
  ArithmeticNodeConfig,
  ArithmeticNodeType,
  defaultArithmeticNodeConfig,
} from "./types";

export default class ArithmeticNode extends MatchJoinNode<ArithmeticNodeConfig> {
  static get type(): NodeType {
    return ArithmeticNodeType;
  }

  constructor(
    node: Node,
    config: ArithmeticNodeConfig,
    private minuend: number,
    private values: Record<string, number> = {}
  ) {
    config = { ...defaultArithmeticNodeConfig, ...config };
    super(node, config);
  }

  protected matched(data: MatchJoinNodeData): void {
    const msg = data.received_msg;
    const valueType = msg.topic;

    if (typeof msg.payload !== "number") {
      this.node.error("Payload must be a number");
      return;
    }

    switch (valueType) {
      case "minuend":
        this.minuend = msg.payload;
        break;
      case "value":
        this.values[msg.originalTopic] = msg.payload;
        break;
    }

    const values = Object.values(this.values);

    if (
      values.length < this.config.minValueCount ||
      (this.config.operation === "sub" && !this.minuend)
    ) {
      this.nodeStatus = "waiting";
      return;
    }

    this.config.additionalValues?.forEach((row) => {
      values.push(
        RED.util.evaluateNodeProperty(row.value, row.valueType, this.node, msg)
      );
    });

    switch (this.config.operation) {
      case "add":
        data.payload = addOp(values);
        break;
      case "sub":
        data.payload = subOp(this.minuend, values);
        break;
      case "mul":
        data.payload = mulOp(values);
        break;
      case "round":
        data.payload = msg.payload;
        break;
      case "mean":
        data.payload = meanOp(values);
        break;
      case "min":
        data.payload = minOp(values);
        break;
      case "max":
        data.payload = maxOp(values);
        break;
    }

    data.payload = roundOp(data.payload, this.config.precision);

    this.debounce(data);
  }

  protected updateStatusAfterDebounce(data: BaseNodeDebounceData): void {
    this.nodeStatus = data.payload;
  }
}
