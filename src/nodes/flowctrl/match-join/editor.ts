import { EditorNodeDef } from "node-red";
import { comparators } from "../../logical/compare/operations";
import BaseNodeEditor, { NodeEditorFormBuilder } from "../base/editor";
import {
  MatcherRow,
  MatcherRowDefaults,
  MatchFixedTargets,
  MatchJoinEditorNodeProperties,
  MatchJoinEditorNodePropertiesDefaults,
  MatchJoinNodeOptionsDefaults,
} from "./types";
import MatchJoinNode from "./";

const MatchJoinNodeEditor: EditorNodeDef<MatchJoinEditorNodeProperties> = {
  category: MatchJoinNode.NodeCategory.label,
  color: MatchJoinNode.NodeColor,
  icon: "join.svg",
  defaults: MatchJoinEditorNodePropertiesDefaults,
  label: function () {
    const label = this.join ? "join" : "match";
    return this.name ? `${this.name} (${label})` : label;
  },
  inputs: MatchJoinNodeOptionsDefaults.inputs,
  outputs: MatchJoinNodeOptionsDefaults.outputs,
  oneditprepare: function () {
    BaseNodeEditor.oneditprepare!.call(this);

    initializeMatcherRows(this.matchers, this._.bind(this));

    const matchJoinOptionsBuilder = new NodeEditorFormBuilder(
      $("#matcher-join-options"),
      {
        translatePrefix: "flowctrl.match-join",
        translate: this._.bind(this),
      }
    );

    matchJoinOptionsBuilder.createCheckboxInput({
      id: "node-input-discardNotMatched",
      label: "discardNotMatched",
      value: this.discardNotMatched,
      icon: "stop-circle-o",
    });

    const joinCheckbox = matchJoinOptionsBuilder.createCheckboxInput({
      id: "node-input-join",
      label: "join",
      value: this.join,
      icon: "compress",
    });

    const minMsgCountInputRow = matchJoinOptionsBuilder
      .createNumberInput({
        id: "node-input-minMsgCount",
        label: "minMsgCount",
        value: this.minMsgCount,
        icon: "hashtag",
      })
      .parent()
      .toggle(this.join);

    joinCheckbox.on("change", function () {
      minMsgCountInputRow.toggle($(this).is(":checked"));
    });
  },
  oneditsave: function () {
    this.matchers = getMatchers();
  },
};

const matcherRowsId = "#matcher-rows";

const applicableComparators = Object.keys(comparators).filter(
  (key) => !comparators[key].propertyOnly
);

export function initializeMatcherRows(
  matchers: MatcherRow[],
  translate: (key: string) => string,
  fixedTargets?: MatchFixedTargets
) {
  const matcherRowFormBuilder = new NodeEditorFormBuilder($("<div/>"), {
    translatePrefix: "flowctrl.match-join",
    translate: translate.bind(this),
    createUniqueIds: true,
    defaultTypeInputWidth: 280,
  });

  const headerPrefix = fixedTargets ? fixedTargets.translatePrefix : "flowctrl.match-join";

  $(matcherRowsId)
    .editableList({
      addButton: true,
      removable: true,
      sortable: true,
      height: "auto",
      header: $("<div>").append($("<label>").text(translate(`${headerPrefix}.label.matchers`))),
      addItem: function (container, _: number, data: MatcherRow) {
        container.css({
          overflow: "hidden",
          whiteSpace: "nowrap",
        });

        matcherRowFormBuilder.newContainer(container);

        matcherRowFormBuilder.createTypedInput({
          id: "property",
          idType: "propertyType",
          label: "property",
          value: data.property ?? MatcherRowDefaults.property,
          valueType: data.propertyType ?? MatcherRowDefaults.propertyType,
          types: ["msg"],
          icon: "envelope-o",
        });

        const operatorSelect = matcherRowFormBuilder.createSelectInput({
          id: "operator",
          label: "operator",
          value: data.operator ?? MatcherRowDefaults.operator,
          options: Object.entries(comparators).map(([key, comparator]) => ({
            value: key,
            label: comparator.label,
          })),
          icon: "search",
        });

        const compareInputRow = matcherRowFormBuilder
          .createTypedInput({
            id: "compare",
            idType: "compareType",
            label: "compare",
            value: data.compare ?? MatcherRowDefaults.compare,
            valueType: data.compareType ?? MatcherRowDefaults.compareType,
            icon: "file-text-o",
          })
          .parent()
          .toggle(
            applicableComparators.includes(
              (data.operator ?? MatcherRowDefaults.operator) as string
            )
          );

        operatorSelect.on("change", function () {
          compareInputRow.toggle(
            applicableComparators.includes($(this).val() as string)
          );
        });

        matcherRowFormBuilder.createTypedInput({
          id: "target",
          idType: "targetType",
          label: "target",
          value: data.target ?? MatcherRowDefaults.target,
          valueType: data.targetType ?? MatcherRowDefaults.targetType,
          types: ["msg", "str"],
          icon: "tag",
        });

        // TODO Implement fixedTargets when needed
        //
        // if (fixedTargets) {
        //   const propertyTargetSelect = $("<select/>", {
        //     class: "property-target-select",
        //   })
        //     .css("width", "calc(100% - 40px)")
        //     .appendTo($row3);

        //   const matchers = $(matcherRowsId);

        //   fixedTargets.targets.forEach((target) => {
        //     const option = $("<option/>", {
        //       value: target,
        //       text: fixedTargets.t(fixedTargets.translatePrefix + "." + target),
        //     }).appendTo(propertyTargetSelect);

        //     option.toggle(matchers.data("showHide_" + target) ?? true);
        //   });

        //   propertyTargetSelect.val(data.target ?? "");
        //   propertyTargetSelect.on("change", function () {
        //     const value = $(this).val() as string;
        //     propertyTarget.typedInput("value", value);
        //   });
        //   (propertyTarget as any).typedInput("hide");
        // }
      },
    })
    .editableList("addItems", matchers || []);
}

export function getMatchers(): MatcherRow[] {
  let matchersList = $(matcherRowsId).editableList("items");
  let matchers: MatcherRow[] = [];

  matchersList.each((_, row) => {
    let matcher = $(row);

    matchers.push({
      property: matcher.find(".property").val() as string,
      propertyType: matcher.find(".propertyType").val() as string,
      operator: matcher.find(".operator").val() as string,
      compare: matcher.find(".compare").val() as string,
      compareType: matcher.find(".compareType").val() as string,
      target: matcher.find(".target").val() as string,
      targetType: matcher.find(".targetType").val() as string,
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
