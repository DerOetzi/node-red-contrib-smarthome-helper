import { EditorNodeDef } from "node-red";
import { comparators } from "../../logical/compare/operations";
import BaseNodeEditor from "../base/editor";
import {
  defaultMatchJoinNodeConfig,
  MatcherRow,
  MatchFixedTargets,
  MatchJoinNodeEditorProperties,
  MatchJoinNodeType,
} from "./types";

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

    initializeMatcherRows(this.matchers);

    $("#row-minMsgCount").toggle(this.join);

    $("#node-input-join").on("change", function () {
      $("#row-minMsgCount").toggle($(this).is(":checked"));
    });
  },
  oneditsave: function () {
    this.matchers = getMatchers();
  },
};

const matcherRowsId = "#matcher-rows";

export function initializeMatcherRows(
  matchers: MatcherRow[],
  fixedTargets?: MatchFixedTargets
) {
  $(matcherRowsId)
    .editableList({
      addButton: true,
      removable: true,
      sortable: true,
      height: "auto",
      header: $("<div>").append($("<label>").text("Input mappings")),
      addItem: function (container, _, data: MatcherRow) {
        container.css({
          overflow: "hidden",
          whiteSpace: "nowrap",
        });

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

        propertyTarget.typedInput("value", data.target ?? "");
        propertyTarget.typedInput("type", data.targetType ?? "str");

        if (fixedTargets) {
          const propertyTargetSelect = $("<select/>", {
            class: "property-target-select",
          })
            .css("width", "calc(100% - 40px)")
            .appendTo($row3);

          const matchers = $(matcherRowsId);

          fixedTargets.targets.forEach((target) => {
            const option = $("<option/>", {
              value: target,
              text: fixedTargets.t(fixedTargets.translatePrefix + "." + target),
            }).appendTo(propertyTargetSelect);

            option.toggle(matchers.data("showHide_" + target) ?? true);
          });

          propertyTargetSelect.val(data.target ?? "");
          propertyTargetSelect.on("change", function () {
            const value = $(this).val() as string;
            propertyTarget.typedInput("value", value);
          });
          (propertyTarget as any).typedInput("hide");
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

export function getMatchers(): MatcherRow[] {
  let matchersList = $(matcherRowsId).editableList("items");
  let matchers: MatcherRow[] = [];

  matchersList.each((_, row) => {
    let matcher = $(row);
    let target: string | null = null;
    let targetType: string | null = null;

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

export function showHideTarget(showHideTarget: boolean, option: string) {
  $(matcherRowsId)
    .data("showHide_" + option, showHideTarget)
    .find('.property-target-select option[value="' + option + '"]')
    .toggle(showHideTarget);
}

export function removeTarget(keep: boolean, option: string) {
  const inputs = $(matcherRowsId);

  showHideTarget(keep, option);

  if (!keep) {
    const matchers = getMatchers().filter((matcher) => {
      return matcher.target !== option;
    });

    inputs.editableList("empty");
    inputs.editableList("addItems", matchers);
  }
}

export default MatchJoinNodeEditor;

export { MatchJoinNodeType };
