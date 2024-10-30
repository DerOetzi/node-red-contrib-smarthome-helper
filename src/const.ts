export enum NodeColor {
  AutomationGate = "#ff7f50",
  Base = "#7fffd4",
  Logical = "#7fff00",
}

export interface NodeCategoryStruct {
  label: string;
  name: string;
}

export const NodeCategory: Record<string, NodeCategoryStruct> = {
  FlowControl: {
    label: "Smarthome Flow Control",
    name: "flowctrl",
  },
  Logical: {
    label: "Smarthome Logical",
    name: "logical",
  },
};

export class NodeTypeStruct {
  readonly name: string;
  readonly category: NodeCategoryStruct;
  readonly color: NodeColor;

  constructor(name: string, category: NodeCategoryStruct, color: NodeColor) {
    this.name = name;
    this.category = category;
    this.color = color;
  }

  get fullName(): string {
    return `${this.category.name}-${this.name}`;
  }
}

export const NodeType: Record<string, NodeTypeStruct> = {
  FlowCtrlBase: new NodeTypeStruct(
    "base",
    NodeCategory.FlowControl,
    NodeColor.Base
  ),
  FlowCtrlCommon: new NodeTypeStruct(
    "common",
    NodeCategory.FlowControl,
    NodeColor.Base
  ),
  FlowCtrlAutomationGate: new NodeTypeStruct(
    "automation-gate",
    NodeCategory.FlowControl,
    NodeColor.AutomationGate
  ),
  FlowCtrlGateControl: new NodeTypeStruct(
    "gate-control",
    NodeCategory.FlowControl,
    NodeColor.AutomationGate
  ),
  LogicalOp: new NodeTypeStruct("op", NodeCategory.Logical, NodeColor.Logical),
  LogicalCompare: new NodeTypeStruct(
    "compare",
    NodeCategory.Logical,
    NodeColor.Logical
  ),
  LogicalSwitch: new NodeTypeStruct(
    "switch",
    NodeCategory.Logical,
    NodeColor.Logical
  ),
};
