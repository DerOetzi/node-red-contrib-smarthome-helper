import {
  BaseCommonElement,
  BaseDebounceNoTopicElement,
  BaseStatusElement,
  i18nInputLabel,
  NodeEditorDefinition,
  NodeEditorFormEditableList,
} from "../base/editor";
import { NodeEditorFormBuilderParams } from "../base/types";
import MatchJoinNode from "./";
import {
  MatcherRow,
  MatcherRowDefaults,
  MatchFixedTargets,
  MatchJoinEditorNodeProperties,
  MatchJoinNodeOptions,
  MatchJoinNodeOptionsDefaults,
} from "./types";

import {
  ApplicableCompareFunction,
  NotApplicableCompareFunction,
} from "../../logical/compare/types";

export const InputEditorWithoutStatusTemplate = [
  BaseCommonElement,
  BaseDebounceNoTopicElement,
];

export const InputEditorTemplate = [
  ...InputEditorWithoutStatusTemplate,
  BaseStatusElement,
];

export class MatchJoinEditableList extends NodeEditorFormEditableList<MatcherRow> {
  constructor(private readonly fixedTargets?: MatchFixedTargets) {
    super();
    if (this.fixedTargets) {
      this.headerPrefix = this.fixedTargets.headerPrefix
        ? this.fixedTargets.headerPrefix
        : "flowctrl.match-join.fixedTargets";
    }
  }

  public initialize(
    id: string,
    items: MatcherRow[],
    rowBuilderParams: NodeEditorFormBuilderParams,
  ): this {
    if (this.fixedTargets) {
      const allowed = new Set(this.fixedTargets.targets);
      items = items.filter((item) => allowed.has(item.target));
    }
    return super.initialize(id, items, rowBuilderParams);
  }

  protected addItem(data: MatcherRow): void {
    this.rowBuilder!.createTypedInput({
      id: "property",
      idType: "propertyType",
      label: "property",
      value: data.property ?? MatcherRowDefaults.property,
      valueType: data.propertyType ?? MatcherRowDefaults.propertyType,
      types: ["msg"],
      icon: "envelope-o",
      translatePrefix: "logical.compare",
    });

    const operationSelect = this.rowBuilder!.createSelectInput({
      id: "operation",
      label: "operation",
      value: data.operation ?? MatcherRowDefaults.operation,
      options: [
        ...Object.keys(ApplicableCompareFunction),
        ...Object.keys(NotApplicableCompareFunction),
      ],
      icon: "search",
      translatePrefix: "logical.compare",
    });

    const compareInputRow = this.rowBuilder!.createTypedInput({
      id: "compare",
      idType: "compareType",
      label: "compare",
      value: data.compare ?? MatcherRowDefaults.compare,
      valueType: data.compareType ?? MatcherRowDefaults.compareType,
      icon: "file-text-o",
      translatePrefix: "logical.compare",
    })
      .parent()
      .toggle(
        ((data.operation ?? MatcherRowDefaults.operation) as string) in
          ApplicableCompareFunction,
      );

    operationSelect.on("change", function () {
      compareInputRow.toggle(
        ($(this).val() as string) in ApplicableCompareFunction,
      );
    });

    if (this.fixedTargets) {
      // Convert fixed targets to select options using input labels from new locale structure
      const targetOptions = this.fixedTargets.targets.map((target) => ({
        value: target,
        label: i18nInputLabel(this.fixedTargets!.translatePrefix, target),
      }));

      const targetSelect = this.rowBuilder!.createSelectInput({
        id: "target",
        label: "target",
        value: data.target,
        options: targetOptions,
        icon: "tag",
        translateLabelPrefix: this.headerPrefix,
      });

      this.fixedTargets.targets.forEach((target) => {
        targetSelect
          .find('option[value="' + target + '"]')
          .toggle(this.listContainer!.data("showHide_" + target) ?? true);
      });
    } else {
      this.rowBuilder!.createTypedInput({
        id: "target",
        idType: "targetType",
        label: "target",
        value: data.target ?? MatcherRowDefaults.target,
        valueType: data.targetType ?? MatcherRowDefaults.targetType,
        types: ["msg", "str"],
        icon: "tag",
      });
    }
  }

  public values(): MatcherRow[] {
    return super.values({ targetType: "str" });
  }

  public showHideTarget(showHideTarget: boolean, option: string): this {
    this.listContainer
      ?.data("showHide_" + option, showHideTarget)
      .find('.target option[value="' + option + '"]')
      .toggle(showHideTarget);

    this.syncListVisibility();

    return this;
  }

  private syncListVisibility(): void {
    if (!this.fixedTargets) {
      return;
    }

    const allHidden = this.fixedTargets.targets.every(
      (target) =>
        (this.listContainer?.data("showHide_" + target) ?? true) === false,
    );

    this.toggle(!allHidden);
  }

  public removeTarget(keep: boolean, option: string): this {
    this.showHideTarget(keep, option);

    if (!keep) {
      const matchers = this.values().filter((matcher) => {
        return matcher.target !== option;
      });

      this.listContainer?.editableList("empty");
      this.listContainer?.editableList("addItems", matchers);
    }

    return this;
  }
}

export const MatchJoinEditorDef: NodeEditorDefinition<
  MatchJoinNodeOptions,
  MatchJoinEditorNodeProperties
> = {
  localePrefix: "flowctrl.match-join",
  nodeClass: MatchJoinNode,
  defaults: MatchJoinNodeOptionsDefaults,
  icon: "join.svg",
  inputMode: "matcher-topic",
  baseTemplate: "without-status",
  lists: [
    {
      id: "matcher-rows",
      create: () => new MatchJoinEditableList(),
      dataKey: "matchers",
      rowTranslatePrefix: "flowctrl.match-join",
    },
  ],
  form: {
    id: "matcher-join-options",
    fields: [
      { type: "checkbox", key: "discardNotMatched", icon: "stop-circle-o" },
      { type: "checkbox", key: "join", icon: "compress" },
      {
        type: "number",
        key: "minMsgCount",
        icon: "hashtag",
        dependsOn: "join",
      },
    ],
  },
  hooks: {
    label: (node) => {
      const label = node.join ? "join" : "match";
      return node.name ? `${node.name} (${label})` : label;
    },
  },
};
