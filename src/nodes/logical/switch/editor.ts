import { EditorNodeDef } from "node-red";
import BaseEditorNode, {
  i18n,
  NodeEditorFormBuilder,
} from "../../flowctrl/base/editor";
import SwitchNode from "./";
import { switchMigration } from "./migration";
import {
  DebounceFlank,
  SwitchEditorNodeProperties,
  SwitchEditorNodePropertiesDefaults,
  SwitchNodeOptionsDefaults,
} from "./types";

const SwitchEditorNode: EditorNodeDef<SwitchEditorNodeProperties> = {
  category: SwitchNode.NodeCategoryLabel,
  color: SwitchNode.NodeColor,
  icon: "switch.svg",
  defaults: SwitchEditorNodePropertiesDefaults,
  label: function () {
    return this.name?.trim() ? this.name.trim() : i18n("logical.switch.name");
  },
  inputs: SwitchNodeOptionsDefaults.inputs,
  outputs: SwitchNodeOptionsDefaults.outputs,
  outputLabels: function (index) {
    if (this.seperatedOutputs) {
      return index === 0
        ? i18n("logical.switch.output.true")
        : i18n("logical.switch.output.false");
    } else if (index === 0) {
      return i18n("logical.switch.output.result");
    }
  },
  oneditprepare: function () {
    switchMigration.checkAndMigrate(this);

    BaseEditorNode.oneditprepare!.call(this);

    const switchOptionsBuilder = new NodeEditorFormBuilder(
      $("#logical-switch-options"),
      {
        translatePrefix: "logical.switch",
      }
    );

    switchOptionsBuilder.createTypedInput({
      id: "node-input-target",
      idType: "node-input-targetType",
      label: "target",
      value: this.target,
      valueType: this.targetType,
      types: ["msg"],
      icon: "envelope-o",
    });

    switchOptionsBuilder.createTypedInput({
      id: "node-input-trueValue",
      idType: "node-input-trueType",
      label: "trueValue",
      value: this.trueValue,
      valueType: this.trueType,
      types: [
        "bool",
        "msg",
        "str",
        "num",
        { value: "__stop__", label: "stop", hasValue: false },
      ],
      icon: "check",
    });

    switchOptionsBuilder.createTypedInput({
      id: "node-input-falseValue",
      idType: "node-input-falseType",
      label: "falseValue",
      value: this.falseValue,
      valueType: this.falseType,
      types: [
        "bool",
        "msg",
        "str",
        "num",
        { value: "__stop__", label: "stop", hasValue: false },
      ],
      icon: "times",
    });

    const outputsHidden = switchOptionsBuilder.createHiddenInput({
      id: "node-input-outputs",
      value: this.outputs,
    });

    switchOptionsBuilder
      .createCheckboxInput({
        id: "node-input-seperatedOutputs",
        label: "seperatedOutputs",
        value: this.seperatedOutputs,
        icon: "exit",
      })
      .on("change", function () {
        outputsHidden.val($(this).is(":checked") ? 2 : 1);
      });

    const debounceFlankRow = switchOptionsBuilder
      .createSelectInput({
        id: "node-input-debounceFlank",
        label: "debounceFlank",
        value: this.debounceFlank,
        options: Object.values(DebounceFlank),
        icon: "exchange",
      })
      .parent()
      .toggle(this.debounce);

    $("#node-input-debounce").on("change", function () {
      debounceFlankRow.toggle($(this).is(":checked"));
    });
  },
};

export default SwitchEditorNode;
