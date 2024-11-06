export interface NodeCategory {
  label: string;
  name: string;
}

export enum NodeColor {
  AutomationGate = "#ff7f50",
  Base = "#7fffd4",
  Logical = "#7fff00",
  Heating = "#b22222",
}

export class NodeType {
  constructor(
    public readonly category: NodeCategory,
    public readonly name: string,
    private readonly _color: NodeColor
  ) {}

  get fullName(): string {
    return `${this.category.name}-${this.name}`;
  }

  get categoryLabel(): string {
    return this.category.label;
  }

  get color(): string {
    return this._color;
  }
}
