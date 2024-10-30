import { Node } from "node-red";
import { NodeSendHandler } from "../../../common/sendhandler";
import { NodeStateHandler } from "../../../common/statehandler";
import { RED } from "../../../globals";
import { CommonNodeConfig } from "../..//flowctrl/common";
import {
  emptyCmp,
  eqCmp,
  falseCmp,
  gtCmp,
  gteCmp,
  ltCmp,
  lteCmp,
  neqCmp,
  notEmptyCmp,
  trueCmp,
} from "../operations";

// Typdefinition für das Node-Konfigurationsobjekt
interface CompareNodeConfig extends CommonNodeConfig {
  property: string;
  propertyType: string;
  operator: string;
  value: string;
  valueType: string;
}

const comparators: Record<string, any> = {
  eq: { func: eqCmp, propertyOnly: false },
  neq: { func: neqCmp, propertyOnly: false },
  lt: { func: ltCmp, propertyOnly: false },
  lte: { func: lteCmp, propertyOnly: false },
  gt: { func: gtCmp, propertyOnly: false },
  gte: { func: gteCmp, propertyOnly: false },
  true: { func: trueCmp, propertyOnly: true },
  false: { func: falseCmp, propertyOnly: true },
  empty: { func: emptyCmp, propertyOnly: true },
  not_empty: { func: notEmptyCmp, propertyOnly: true },
};

export default function CompareNode(
  this: Node,
  config: CompareNodeConfig
): void {
  RED.nodes.createNode(this, config);
  const node = this;
  const stateHandler = new NodeStateHandler(node, config);
  const sendHandler = new NodeSendHandler(stateHandler, 1);

  const comparator = comparators[config.operator];

  node.on("input", (msg: any, send: any, done: any) => {
    const propertyValue = RED.util.evaluateNodeProperty(
      config.property,
      config.propertyType,
      this,
      msg
    );
    const compareValue = RED.util.evaluateNodeProperty(
      config.value,
      config.valueType,
      this,
      msg
    );

    let result: boolean;
    if (comparator.propertyOnly) {
      result = comparator.func(propertyValue);
    } else {
      result = comparator.func(propertyValue, compareValue);
    }

    stateHandler.nodeStatus = result;

    sendHandler.sendMsg(msg, { send, payload: result });

    if (done) {
      done();
    }
  });
}
