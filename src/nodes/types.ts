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
  Switch = "#ff8c00",
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
