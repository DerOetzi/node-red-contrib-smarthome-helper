import { NodeRegistryEntry } from "../types";
import CompareNode from "./compare";
import CompareEditorNode from "./compare/editor";
import HysteresisSwitchNode from "./hysteresis-switch";
import HysteresisSwitchEditorNode from "./hysteresis-switch/editor";
import LogicalOpNode from "./op";
import LogicalOpEditorNode from "./op/editor";
import SwitchNode from "./switch";
import SwitchEditorNode from "./switch/editor";
import ToogleNode from "./toggle";
import ToggleEditorNode from "./toggle/editor";

const CompareEditorMetadata: NodeRegistryEntry["metadata"] = {
  localePrefix: "logical.compare",
  inputMode: "msg-property",
  fieldKeys: ["property", "operation", "compare"],
  inputKeys: [],
  outputKeys: [],
};

const HysteresisSwitchEditorMetadata: NodeRegistryEntry["metadata"] = {
  localePrefix: "logical.hysteresis-switch",
  inputMode: "msg-property",
  fieldKeys: ["upperThreshold", "lowerThreshold", "initialState"],
  inputKeys: [],
  outputKeys: [],
};

const LogicalOpEditorMetadata: NodeRegistryEntry["metadata"] = {
  localePrefix: "logical.op",
  inputMode: "msg-property",
  fieldKeys: ["operation", "minMsgCount"],
  inputKeys: [],
  outputKeys: [],
};

const SwitchEditorMetadata: NodeRegistryEntry["metadata"] = {
  localePrefix: "logical.switch",
  inputMode: "msg-property",
  fieldKeys: [
    "target",
    "trueValue",
    "falseValue",
    "seperatedOutputs",
    "debounceFlank",
  ],
  inputKeys: [],
  outputKeys: ["true", "false", "result"],
};

const ToggleEditorMetadata: NodeRegistryEntry["metadata"] = {
  localePrefix: "logical.toggle",
  inputMode: "msg-property",
  fieldKeys: [],
  inputKeys: [],
  outputKeys: [],
};

export const LogicalNodesRegistry: { [key: string]: NodeRegistryEntry } = {
  [CompareNode.NodeTypeName]: {
    node: CompareNode,
    editor: CompareEditorNode,
    metadata: CompareEditorMetadata,
  },
  [HysteresisSwitchNode.NodeTypeName]: {
    node: HysteresisSwitchNode,
    editor: HysteresisSwitchEditorNode,
    metadata: HysteresisSwitchEditorMetadata,
  },
  [LogicalOpNode.NodeTypeName]: {
    node: LogicalOpNode,
    editor: LogicalOpEditorNode,
    metadata: LogicalOpEditorMetadata,
  },
  [SwitchNode.NodeTypeName]: {
    node: SwitchNode,
    editor: SwitchEditorNode,
    metadata: SwitchEditorMetadata,
  },
  [ToogleNode.NodeTypeName]: {
    node: ToogleNode,
    editor: ToggleEditorNode,
    metadata: ToggleEditorMetadata,
  },
};
