import { NodeMessage } from "node-red";
import { NodeMessageFlow } from "../../flowctrl/base/types";
import { NodeCategory, NodeSendFunction } from "../../types";

export const HelperNotificationCategory: NodeCategory = {
  label: "Smarthome Helper Notification",
  name: "helper",
  color: "#87ceeb",
};

export interface NotifyMessage {
  title: string;
  message: string;
  onlyAtHome?: boolean;
}

export interface NotifyNodeMessage extends NodeMessage {
  notify: NotifyMessage;
}

export class NotifyNodeMessageFlow extends NodeMessageFlow {
  constructor(
    topic: string,
    notify: NotifyMessage,
    output: number,
    send?: NodeSendFunction
  ) {
    super({ topic }, output, send);
    this.notify = notify;
  }

  public get notify(): NotifyMessage {
    return this.getAdditionalAttribute("notify");
  }

  public set notify(value: NotifyMessage) {
    this.updateAdditionalAttribute("notify", value);
  }

  public static clone(
    messageFlow: NodeMessageFlow,
    topic: string,
    notify: NotifyMessage
  ): NotifyNodeMessageFlow {
    const clonedMessageFlow = new NotifyNodeMessageFlow(
      topic,
      notify,
      messageFlow.output,
      messageFlow.send
    );
    clonedMessageFlow.payload = messageFlow.payload;
    clonedMessageFlow.additionalAttributes = {
      ...(messageFlow as NotifyNodeMessageFlow).additionalAttributes,
      ...clonedMessageFlow.additionalAttributes,
    };

    return clonedMessageFlow;
  }

  public clone(): NotifyNodeMessageFlow {
    const clone = new NotifyNodeMessageFlow(
      this.topic!,
      this.notify,
      this.output,
      this.send
    );

    clone.payload = this.payload;
    clone.additionalAttributes = { ...this.additionalAttributes };

    return clone;
  }
}
