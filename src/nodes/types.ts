import { NodeMessage } from "node-red";

export interface NodeCategory {
  label: string;
  name: string;
  color: string;
}

export type NodeSendFunction = (
  msg: NodeMessage | Array<NodeMessage | NodeMessage[] | null>,
) => void;

export type NodeDoneFunction = (err?: Error, msg?: NodeMessage) => void;

export abstract class EditorTemplateElement {
  abstract tag: string;

  id?: string;
  data?: Record<string, string>;

  constructor(id?: string, data?: Record<string, string>) {
    this.id = id;
    this.data = data;
  }

  public getString(): string {
    const dataAttrs = this.data
      ? " " +
        Object.entries(this.data)
          .map(([k, v]) => `data-${k}="${v}"`)
          .join(" ")
      : "";
    const idAttr = this.id ? ` id="${this.id}"` : "";
    return `<${this.tag}${idAttr}${dataAttrs}></${this.tag}>`;
  }
}

export class EditorTemplateDiv extends EditorTemplateElement {
  tag = "div";
}

export class EditorTemplateOl extends EditorTemplateElement {
  tag = "ol";
}

export interface EditorMetadata {
  localePrefix: string;
  fieldKeys?: string[];
  inputKeys?: string[];
  outputKeys?: string[];
  inputMode?: "msg-property" | "matcher-topic";
}
