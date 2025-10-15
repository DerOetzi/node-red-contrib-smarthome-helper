import { EditorNodeDef } from "node-red";
import BaseEditorNode, {
  createEditorDefaults,
  i18n,
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

const operandMatcherList = new MatchJoinEditableList({
  targets: Object.values(ArithmeticTarget),
  translatePrefix: "operator.arithmetic",
});

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

const additionalValuesList = new AdditionalValuesEditableList();

const ArithmeticEditorNode: EditorNodeDef<ArithmeticEditorNodeProperties> = {
  category: ArithmeticNode.NodeCategoryLabel,
  color: ArithmeticNode.NodeColor,
  icon: "arithmetic.svg",
  defaults: createEditorDefaults<
    ArithmeticNodeOptions,
    ArithmeticEditorNodeProperties
  >(ArithmeticNodeOptionsDefaults),
  label: function () {
    const operator = i18n(
      "operator.arithmetic.select.operation." + this.operation
    );
    let label: string = operator;

    if (this.name) {
      label = `${this.name} (${operator})`;
    }

    return label;
  },
  inputs: ArithmeticNodeOptionsDefaults.inputs,
  outputs: ArithmeticNodeOptionsDefaults.outputs,
  outputLabels: function (index: number) {
    return i18n("operator.arithmetic.output.result");
  },
  oneditprepare: function () {
    BaseEditorNode.oneditprepare!.call(this);

    operandMatcherList
      .initialize("matcher-rows", this.matchers, {
        translatePrefix: "flowctrl.match-join",
      })
      .showHideTarget(
        this.operation === ArithmeticFunction.sub,
        ArithmeticTarget.minuend
      );

    additionalValuesList
      .initialize("additional-values-rows", this.additionalValues, {
        translatePrefix: "operator.arithmetic",
      })
      .toggle(this.operation !== ArithmeticFunction.round);

    const arithmeticOptionsBuilder = new NodeEditorFormBuilder(
      $("#arithmetic-options"),
      { translatePrefix: "operator.arithmetic" }
    );

    const minValueCount = arithmeticOptionsBuilder.createNumberInput({
      id: "node-input-minValueCount",
      label: "minValueCount",
      value: this.minValueCount,
      icon: "hashtag",
    });

    const minValueCountRow = minValueCount
      .parent()
      .toggle(this.operation !== ArithmeticFunction.round);

    arithmeticOptionsBuilder
      .createSelectInput({
        id: "node-input-operation",
        label: "operation",
        value: this.operation,
        icon: "cogs",
        options: Object.keys(ArithmeticFunction),
      })
      .on("change", function () {
        const operation = $(this).val();
        const isRound = operation === ArithmeticFunction.round;

        operandMatcherList.removeTarget(
          operation === ArithmeticFunction.sub,
          ArithmeticTarget.minuend
        );

        minValueCountRow.toggle(!isRound);
        if (isRound) {
          minValueCount.val(1);
        }

        additionalValuesList.toggle(!isRound);
      });

    arithmeticOptionsBuilder.createNumberInput({
      id: "node-input-precision",
      label: "precision",
      value: this.precision,
      icon: "dot-circle-o",
    });
  },
  oneditsave: function () {
    this.matchers = operandMatcherList.values();
    this.additionalValues = additionalValuesList.values();
  },
};

export default ArithmeticEditorNode;
