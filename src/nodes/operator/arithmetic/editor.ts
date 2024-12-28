import { EditorNodeDef } from "node-red";
import BaseNodeEditor from "../../flowctrl/base/editor";
import {
  AdditionalValueRow,
  ArithmeticNodeEditorProperties,
  ArithmeticNodeType,
  defaultArithmeticNodeConfig,
} from "./types";
import {
  getMatchers,
  initializeMatcherRows,
  removeTarget,
  showHideTarget,
} from "../../flowctrl/match-join/editor";

const ArithmeticNodeEditor: EditorNodeDef<ArithmeticNodeEditorProperties> = {
  ...BaseNodeEditor,
  category: ArithmeticNodeType.categoryLabel,
  color: ArithmeticNodeType.color,
  defaults: {
    ...BaseNodeEditor.defaults,
    matchers: {
      value: defaultArithmeticNodeConfig.matchers!,
      required: true,
    },
    join: { value: defaultArithmeticNodeConfig.join!, required: false },
    discardNotMatched: {
      value: defaultArithmeticNodeConfig.discardNotMatched!,
      required: false,
    },
    minMsgCount: {
      value: defaultArithmeticNodeConfig.minMsgCount!,
      required: true,
    },
    minValueCount: {
      value: defaultArithmeticNodeConfig.minValueCount!,
      required: true,
    },
    operation: {
      value: defaultArithmeticNodeConfig.operation!,
      required: true,
    },
    precision: {
      value: defaultArithmeticNodeConfig.precision!,
      required: true,
    },
    additionalValues: {
      value: defaultArithmeticNodeConfig.additionalValues!,
      required: false,
    },
  },
  outputLabels: ["Result"],
  icon: "arithmetic.svg",
  label: function () {
    const operator = this.operation;
    let label: string = operator;

    if (this.name) {
      label = `${this.name} (${operator})`;
    }

    return label;
  },
  oneditprepare: function () {
    BaseNodeEditor.oneditprepare!.call(this);
    initializeMatcherRows(this.matchers, {
      targets: ["value", "minuend"],
      translatePrefix: "operator.arithmetic.target",
      t: this._.bind(this),
    });

    initializeAdditionalValuesRows(this.additionalValues);

    showHideTarget(this.operation == "sub", "minuend");

    const minValueCountRow = $("#node-input-minValueCount")
      .parent()
      .toggle(this.operation !== "round");

    const additionalValuesRow = $("#additional-values-rows").toggle(
      this.operation !== "round"
    );

    $("#node-input-operation").on("change", function () {
      const operation = $(this).val();
      removeTarget(operation === "sub", "minuend");

      minValueCountRow.toggle(operation !== "round");
      additionalValuesRow.toggle(operation !== "round");

      if (operation === "round") {
        $("#node-input-minValueCount").val(1);
      }
    });
  },
  oneditsave: function () {
    this.matchers = getMatchers();
    this.additionalValues = getAdditionalValues();
  },
};

export function initializeAdditionalValuesRows(
  additionalValues: AdditionalValueRow[]
) {
  $("#additional-values-rows")
    .editableList({
      addButton: true,
      removable: true,
      sortable: true,
      height: "auto",
      header: $("<div>").append($("<label>").text("Additional Values")),
      addItem: function (container, index, data: AdditionalValueRow) {
        container.css({
          overflow: "hidden",
          whiteSpace: "nowrap",
        });

        container.attr("data-row", index);

        const $row = $("<div />").appendTo(container);
        const $row1 = $("<div />").appendTo($row).css("margin-bottom", "6px");

        const additionalValue = $("<input/>", {
          class: "additional-value",
          type: "number",
        })
          .css("width", "100%")
          .appendTo($row1)
          .typedInput({
            types: ["num", "msg"],
          });

        additionalValue.typedInput("value", data.value ?? "");
        additionalValue.typedInput("type", data.valueType ?? "num");
      },
    })
    .editableList("addItems", additionalValues || []);
}

export function getAdditionalValues(): AdditionalValueRow[] {
  let additionalValuesList = $("#additional-values-rows").editableList("items");
  let additionalValues: AdditionalValueRow[] = [];

  additionalValuesList.each((_, row) => {
    let additionalValue = $(row);

    additionalValues.push({
      value: additionalValue.find(".additional-value").typedInput("value"),
      valueType: additionalValue.find(".additional-value").typedInput("type"),
    });
  });

  return additionalValues;
}

export default ArithmeticNodeEditor;
