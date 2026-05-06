import { EditorNodeDef } from "node-red";
import { EditorMetadata } from "../../types";
import BaseEditorNode, {
  createEditorDefaults,
  i18nInputLabel,
  NodeEditorFormBuilder,
  NodeEditorFormEditableList,
} from "../base/editor";
import {
  NodeEditorFormBuilderParams,
} from "../base/types";
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

export const MatchJoinEditorMetadata: EditorMetadata = {
  localePrefix: "flowctrl.match-join",
  inputMode: "matcher-topic",
  fieldKeys: ["discardNotMatched", "join", "minMsgCount", "target"],
  inputKeys: [],
  outputKeys: [],
};

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
    if (!this.fixedTargets) return;

    const allHidden = this.fixedTargets.targets.every(
      (target) => (this.listContainer?.data("showHide_" + target) ?? true) === false,
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

const matchers = new MatchJoinEditableList();

const MatchJoinEditorNode: EditorNodeDef<MatchJoinEditorNodeProperties> = {
  category: MatchJoinNode.NodeCategoryLabel,
  color: MatchJoinNode.NodeColor,
  icon: "join.svg",
  defaults: createEditorDefaults<
    MatchJoinNodeOptions,
    MatchJoinEditorNodeProperties
  >(MatchJoinNodeOptionsDefaults),
  label: function () {
    const label = this.join ? "join" : "match";
    return this.name ? `${this.name} (${label})` : label;
  },
  inputs: MatchJoinNodeOptionsDefaults.inputs,
  outputs: MatchJoinNodeOptionsDefaults.outputs,
  oneditprepare: function () {
    BaseEditorNode.oneditprepare!.call(this);

    matchers.initialize("matcher-rows", this.matchers, {
      translatePrefix: "flowctrl.match-join",
    });

    const matchJoinOptionsBuilder = new NodeEditorFormBuilder(
      $("#matcher-join-options"),
      {
        translatePrefix: "flowctrl.match-join",
      },
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
    this.matchers = matchers.values();
  },
};

export default MatchJoinEditorNode;
