import {
  buildEditorMetadata,
  buildEditorNodeDef,
  buildEditorTemplate,
  i18nOutputLabel,
  NodeEditorDefinition,
  NodeEditorFormBuilder,
} from "../../flowctrl/base/editor";
import { EditorNodeInstance } from "node-red";
import { EditorMetadata } from "../../types";
import SwitchNode from "./";
import {
  DebounceFlank,
  SwitchEditorNodeProperties,
  SwitchNodeOptionsDefaults,
} from "./types";

export function buildSwitchFormContent(node: SwitchEditorNodeProperties): void {
  const builder = new NodeEditorFormBuilder($("#logical-switch-options"), {
    translatePrefix: "logical.switch",
  });

  builder.createTypedInput({
    id: "node-input-target",
    idType: "node-input-targetType",
    label: "target",
    value: node.target,
    valueType: node.targetType,
    types: ["msg"],
    icon: "envelope-o",
  });

  builder.createTypedInput({
    id: "node-input-trueValue",
    idType: "node-input-trueType",
    label: "trueValue",
    value: node.trueValue,
    valueType: node.trueType,
    types: [
      "bool",
      "msg",
      "str",
      "num",
      { value: "__stop__", label: "stop", hasValue: false },
    ],
    icon: "check",
  });

  builder.createTypedInput({
    id: "node-input-falseValue",
    idType: "node-input-falseType",
    label: "falseValue",
    value: node.falseValue,
    valueType: node.falseType,
    types: [
      "bool",
      "msg",
      "str",
      "num",
      { value: "__stop__", label: "stop", hasValue: false },
    ],
    icon: "times",
  });

  const outputsInput = builder.createHiddenInput({
    id: "node-input-outputs",
    value: node.outputs,
  });

  builder
    .createCheckboxInput({
      id: "node-input-seperatedOutputs",
      label: "seperatedOutputs",
      value: node.seperatedOutputs,
      icon: "exit",
    })
    .on("change", function () {
      outputsInput.val($(this).is(":checked") ? 2 : 1);
    });

  const debounceFlankRow = builder
    .createSelectInput({
      id: "node-input-debounceFlank",
      label: "debounceFlank",
      value: node.debounceFlank,
      options: Object.values(DebounceFlank),
      icon: "exchange",
    })
    .parent()
    .toggle(node.debounce ?? false);

  $("#node-input-debounce").on("change", function () {
    debounceFlankRow.toggle($(this).is(":checked"));
  });
}

export function buildSwitchOutputLabels(
  node: { seperatedOutputs: boolean },
  index: number,
): string | undefined {
  if (node.seperatedOutputs) {
    return index === 0
      ? i18nOutputLabel("logical.switch", "true")
      : i18nOutputLabel("logical.switch", "false");
  } else if (index === 0) {
    return i18nOutputLabel("logical.switch", "result");
  }
  return undefined;
}

const SwitchEditorDefinition: NodeEditorDefinition<
  typeof SwitchNodeOptionsDefaults,
  SwitchEditorNodeProperties
> = {
  localePrefix: "logical.switch",
  nodeClass: SwitchNode,
  defaults: SwitchNodeOptionsDefaults,
  icon: "switch.svg",
  inputMode: "msg-property",
  fieldKeys: [
    "target",
    "trueValue",
    "falseValue",
    "seperatedOutputs",
    "debounceFlank",
  ],
  outputKeys: ["true", "false", "result"],
  form: {
    id: "logical-switch-options",
    fields: [],
    build: buildSwitchFormContent,
  },
  baseTemplate: "without-status",
  hooks: {
    outputLabels(
      node: EditorNodeInstance<SwitchEditorNodeProperties>,
      index: number,
    ) {
      return buildSwitchOutputLabels(node, index);
    },
  },
};

export const SwitchEditorTemplate = buildEditorTemplate(SwitchEditorDefinition);
export const SwitchEditorMetadata: EditorMetadata = buildEditorMetadata(
  SwitchEditorDefinition,
);
export default buildEditorNodeDef(SwitchEditorDefinition);
