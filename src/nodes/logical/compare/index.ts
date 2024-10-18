import { RED } from "../../../globals";
import { Node } from "node-red";
import { eqCmp, neqCmp } from "../operations";
import { BaseNodeConfig } from "../../types";
import { SendHandler } from "../../../common/sendhandler";

// Typdefinition für das Node-Konfigurationsobjekt
interface CompareNodeConfig extends BaseNodeConfig {
  property: string;
  propertyType: string;
  operator: string;
  value: string;
  valueType: string;
}

const comparators: Record<string, any> = {
  eq: { func: eqCmp, propertyOnly: false },
  neq: { func: neqCmp, propertyOnly: false },
};

export default function CompareNode(
  this: Node,
  config: CompareNodeConfig
): void {
  RED.nodes.createNode(this, config);
  const node = this;
  const sendHandler = new SendHandler(node, config, 1);

  const comparator = comparators[config.operator];

  node.status({ fill: "grey", shape: "ring", text: "no message" });

  node.on("input", (msg: any) => {
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

    node.status({
      fill: result ? "green" : "red",
      shape: "dot",
      text: result.toString(),
    });

    sendHandler.sendMsg(msg, result);
  });
}
