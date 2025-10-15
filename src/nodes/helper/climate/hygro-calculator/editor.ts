import { EditorNodeDef } from "node-red";
import HygroCalculatorNode from ".";
import BaseEditorNode, {
  createEditorDefaults,
  i18n,
} from "../../../flowctrl/base/editor";
import { MatchJoinEditableList } from "../../../flowctrl/match-join/editor";
import {
  HygroCalculatorEditorNodeProperties,
  HygroCalculatorNodeOptions,
  HygroCalculatorNodeOptionsDefaults,
  HygroCalculatorTarget,
} from "./types";

const inputMatcherList = new MatchJoinEditableList({
  targets: Object.values(HygroCalculatorTarget),
  translatePrefix: "helper.hygro-calculator",
});

const HygroCalculatorEditorNode: EditorNodeDef<HygroCalculatorEditorNodeProperties> =
  {
    category: HygroCalculatorNode.NodeCategoryLabel,
    color: HygroCalculatorNode.NodeColor,
    icon: "font-awesome/fa-tint",
    defaults: createEditorDefaults<
      HygroCalculatorNodeOptions,
      HygroCalculatorEditorNodeProperties
    >(HygroCalculatorNodeOptionsDefaults),
    label: function () {
      return this.name?.trim()
        ? this.name.trim()
        : i18n("helper.hygro-calculator.name");
    },
    inputs: HygroCalculatorNodeOptionsDefaults.inputs,
    outputs: HygroCalculatorNodeOptionsDefaults.outputs,
    outputLabels: function (index: number) {
      const outputs = ["absoluteHumidity", "dewPoint"];

      return i18n(`helper.hygro-calculator.output.${outputs[index]}`);
    },
    oneditprepare: function () {
      BaseEditorNode.oneditprepare!.call(this);

      inputMatcherList.initialize("matcher-rows", this.matchers, {
        translatePrefix: "flowctrl.match-join",
      });
    },
    oneditsave: function () {
      this.matchers = inputMatcherList.values();
    },
  };

export default HygroCalculatorEditorNode;
