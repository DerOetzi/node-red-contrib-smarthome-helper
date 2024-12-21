import { EditorNodeDef } from "node-red";
import BaseNodeEditor from "../base/editor";
import {
  defaultMatchJoinNodeConfig,
  MatcherRow,
  MatchJoinNodeEditorProperties,
  MatchJoinNodeType,
} from "./types";
import { comparators } from "../../logical/compare/operations";

const MatchJoinNodeEditor: EditorNodeDef<MatchJoinNodeEditorProperties> = {
  ...BaseNodeEditor,
  color: MatchJoinNodeType.color,
  defaults: {
    ...BaseNodeEditor.defaults,
    join: { value: defaultMatchJoinNodeConfig.join!, required: false },
    matchers: { value: defaultMatchJoinNodeConfig.matchers!, required: true },
    discardNotMatched: {
      value: defaultMatchJoinNodeConfig.discardNotMatched!,
      required: false,
    },
    minMsgCount: {
      value: defaultMatchJoinNodeConfig.minMsgCount!,
      required: true,
    },
  },
  icon: "join.svg",
  label: function () {
    const label = this.join ? "join" : "match";
    return this.name ? `${this.name} (${label})` : label;
  },
  oneditprepare: function () {
    if (BaseNodeEditor.oneditprepare) {
      BaseNodeEditor.oneditprepare.call(this);
    }

    initializeMatcherRows("#matcher-rows", true, this.matchers);

    $("#row-minMsgCount").toggle(this.join);

    $("#node-input-join").on("change", function () {
      $("#row-minMsgCount").toggle($(this).is(":checked"));
    });
  },
  oneditsave: function () {
    this.matchers = getMatchers("#matcher-rows");
  },
};

export function initializeMatcherRows(
  containerId: string,
  changeable: boolean,
  matchers: MatcherRow[],
  targetFixed: boolean = false,
  targetCounter: string = "",
  targets: Record<string, string> = {}
) {
  $(containerId)
    .editableList({
      addButton: true,
      removable: true,
      sortable: true,
      height: "auto",
      header: $("<div>").append($("<label>").text("Matchers")),
      addItem: function (container, index, data: MatcherRow) {
        container.css({
          overflow: "hidden",
          whiteSpace: "nowrap",
        });

        container.attr("data-row", index);

        const $row = $("<div />").appendTo(container);
        const $row1 = $("<div />").appendTo($row).css("margin-bottom", "6px");

        const propertyName = $("<input/>", {
          class: "property-name",
          type: "text",
        })
          .css("width", "100%")
          .appendTo($row1)
          .typedInput({
            types: ["msg"],
          });

        propertyName.typedInput("value", data.property ?? "topic");
        propertyName.typedInput("type", data.propertyType ?? "msg");

        const $row2 = $("<div />").appendTo($row).css("margin-bottom", "6px");

        const operator = $("<select/>", {}).css("width", "30%").appendTo($row2);

        Object.entries(comparators).forEach(([key, comparator]) => {
          $("<option/>", {
            value: key,
            text: comparator.label,
          }).appendTo(operator);
        });

        operator.val(data.operator ?? "eq");

        const compareWrap = $("<span/>", {
          class: "propery-compare-wrap",
        })
          .css("display", "inline-block")
          .css("width", "70%")
          .appendTo($row2);

        const propertyCompare = $("<input/>", {
          class: "property-compare",
          type: "text",
        })
          .appendTo(compareWrap)
          .css("width", "100%")
          .typedInput({
            types: ["msg", "str", "num", "bool"],
          });

        propertyCompare.typedInput("value", data.compare ?? "");
        propertyCompare.typedInput("type", data.compareType ?? "str");

        const $row3 = $("<div />").appendTo($row);
        $("<div/>", { style: "display:inline-block; padding:0px 6px;" })
          .text("=>")
          .appendTo($row3);

        const propertyTarget = $("<input/>", {
          class: "property-target",
          type: "text",
        })
          .css("width", "calc(100% - 40px)")
          .appendTo($row3)
          .typedInput({
            types: ["msg", "str"],
          });

        if (targetCounter) {
          data.target = `${targetCounter}${index + 1}`;
          data.targetType = "str";
          targetFixed = true;
        }

        propertyTarget.typedInput("value", data.target ?? "");
        propertyTarget.typedInput("type", data.targetType ?? "str");

        if (targetFixed) {
          if (targets) {
            const propertyTargetSelect = $("<select/>", {
              id: "property-target-select",
            })
              .css("width", "calc(100% - 40px)")
              .appendTo($row3);

            Object.entries(targets).forEach(([key, value]) => {
              $("<option/>", {
                value: key,
                text: value,
              }).appendTo(propertyTargetSelect);
            });

            propertyTargetSelect.val(data.target ?? "");
            propertyTargetSelect.on("change", function () {
              propertyTarget.typedInput("value", $(this).val() as string);
            });
            (propertyTarget as any).typedInput("hide");
          } else {
            (propertyTarget as any).typedInput("hide");
            $("<span />", {
              class: "target-value",
            })
              .text(data.target)
              .appendTo($row3);
          }
        }

        compareWrap.toggle(
          !["true", "false", "empty", "not_empty"].includes(
            operator.val() as string
          )
        );

        operator.on("change", function () {
          compareWrap.toggle(
            !["true", "false", "empty", "not_empty"].includes(
              $(this).val() as string
            )
          );
        });
      },
    })
    .editableList("addItems", matchers || []);
}

export function getMatchers(
  containerId: string,
  targetCounter: string = ""
): MatcherRow[] {
  let matchersList = $(containerId).editableList("items");
  let matchers: MatcherRow[] = [];

  matchersList.each((index, row) => {
    let matcher = $(row);
    let target: string | null = null;
    let targetType: string | null = null;

    if (targetCounter) {
      target = `${targetCounter}${index + 1}`;
      targetType = "str";
    }

    matchers.push({
      property: matcher.find(".property-name").typedInput("value"),
      propertyType: matcher.find(".property-name").typedInput("type"),
      operator: matcher.find("select").val() as string,
      compare: matcher.find(".property-compare").typedInput("value"),
      compareType: matcher.find(".property-compare").typedInput("type"),
      target: target ?? matcher.find(".property-target").typedInput("value"),
      targetType:
        targetType ?? matcher.find(".property-target").typedInput("type"),
    });
  });

  return matchers;
}

export default MatchJoinNodeEditor;

export { MatchJoinNodeType };
