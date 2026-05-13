import {
  NodeEditorDefinition,
  NodeEditorFormBuilder,
  NodeEditorFormEditableList,
} from "../../flowctrl/base/editor";
import { MatchJoinEditableList } from "../../flowctrl/match-join/editor";
import ArithmeticNode from "./";
import {
  AdditionalValueRow,
  ArithmeticEditorNodeProperties,
  ArithmeticFunction,
  ArithmeticNodeOptions,
  ArithmeticNodeOptionsDefaults,
  ArithmeticTarget,
} from "./types";

class AdditionalValuesEditableList extends NodeEditorFormEditableList<AdditionalValueRow> {
  protected addItem(data: AdditionalValueRow) {
    this.rowBuilder!.createTypedInput({
      id: "value",
      idType: "valueType",
      label: "additionalValue",
      value: data.value ?? "",
      valueType: data.valueType ?? "num",
      types: ["num", "msg"],
      icon: "hashtag",
    });
  }
}

const operandMatcherList = new MatchJoinEditableList({
  targets: Object.values(ArithmeticTarget),
  translatePrefix: "operator.arithmetic",
});

const additionalValuesList = new AdditionalValuesEditableList();

function buildArithmeticFormContent(
  node: ArithmeticEditorNodeProperties,
): void {
  const builder = new NodeEditorFormBuilder($("#arithmetic-options"), {
    translatePrefix: "operator.arithmetic",
  });

  const minValueCount = builder.createNumberInput({
    id: "node-input-minValueCount",
    label: "minValueCount",
    value: node.minValueCount,
    icon: "hashtag",
  });

  const minValueCountRow = minValueCount
    .parent()
    .toggle(node.operation !== ArithmeticFunction.round);

  builder
    .createSelectInput({
      id: "node-input-operation",
      label: "operation",
      value: node.operation,
      icon: "cogs",
      options: Object.keys(ArithmeticFunction),
    })
    .on("change", function () {
      const operation = $(this).val();
      const isRound = operation === ArithmeticFunction.round;

      operandMatcherList.removeTarget(
        operation === ArithmeticFunction.sub,
        ArithmeticTarget.minuend,
      );

      minValueCountRow.toggle(!isRound);
      if (isRound) {
        minValueCount.val(1);
      }

      additionalValuesList.toggle(!isRound);
    });

  builder.createNumberInput({
    id: "node-input-precision",
    label: "precision",
    value: node.precision,
    icon: "dot-circle-o",
  });

  operandMatcherList.showHideTarget(
    node.operation === ArithmeticFunction.sub,
    ArithmeticTarget.minuend,
  );
  additionalValuesList.toggle(node.operation !== ArithmeticFunction.round);
}

export const ArithmeticEditorDef: NodeEditorDefinition<
  ArithmeticNodeOptions,
  ArithmeticEditorNodeProperties
> = {
  localePrefix: "operator.arithmetic",
  nodeClass: ArithmeticNode,
  defaults: ArithmeticNodeOptionsDefaults,
  icon: "arithmetic.svg",
  inputMode: "msg-property",
  fieldKeys: ["minValueCount", "operation", "precision", "additionalValue"],
  inputKeys: ["value", "minuend"],
  outputKeys: ["result"],
  labelSuffix: "operation",
  baseTemplate: "input-without-status",
  lists: [
    {
      id: "matcher-rows",
      create: () => operandMatcherList,
      dataKey: "matchers",
      rowTranslatePrefix: "flowctrl.match-join",
    },
    {
      id: "additional-values-rows",
      create: () => additionalValuesList,
      dataKey: "additionalValues",
      rowTranslatePrefix: "operator.arithmetic",
    },
  ],
  form: {
    id: "arithmetic-options",
    build: buildArithmeticFormContent,
  },
};
