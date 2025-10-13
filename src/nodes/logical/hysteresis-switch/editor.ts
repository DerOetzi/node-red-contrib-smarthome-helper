import { EditorNodeDef } from "node-red";
import {
  HysteresisSwitchEditorNodeProperties,
  HysteresisSwitchEditorNodePropertiesDefaults,
  HysteresisSwitchNodeOptionsDefaults,
} from "./types";
import HysteresisSwitchNode from ".";
import { i18n, NodeEditorFormBuilder } from "../../flowctrl/base/editor";
import { switchMigration } from "../switch/migration";
import SwitchEditorNode from "../switch/editor";

const HysteresisSwitchEditorNode: EditorNodeDef<HysteresisSwitchEditorNodeProperties> =
  {
    category: HysteresisSwitchNode.NodeCategoryLabel,
    color: HysteresisSwitchNode.NodeColor,
    icon: "font-awesome/fa-toggle-on",
    defaults: HysteresisSwitchEditorNodePropertiesDefaults,
    label: function () {
      let name = i18n("logical.hysteresis-switch.name");
      if (this.name) {
        name = `${this.name} (${name})`;
      }
      return name;
    },
    inputs: HysteresisSwitchNodeOptionsDefaults.inputs,
    outputs: HysteresisSwitchNodeOptionsDefaults.outputs,
    oneditprepare: function () {
      switchMigration.checkAndMigrate(this);

      SwitchEditorNode.oneditprepare!.call(this);

      const hysteresisSwitchOptionsBuilder = new NodeEditorFormBuilder(
        $("#hysteresis-switch-options"),
        { translatePrefix: "logical.hysteresis-switch" }
      );

      hysteresisSwitchOptionsBuilder.createNumberInput({
        id: "node-input-lowerThreshold",
        label: "lowerThreshold",
        value: this.lowerThreshold,
        icon: "arrow-down",
        min: -Infinity,
        max: Infinity,
        step: 0.1,
      });

      hysteresisSwitchOptionsBuilder.createNumberInput({
        id: "node-input-upperThreshold",
        label: "upperThreshold",
        value: this.upperThreshold,
        icon: "arrow-up",
        min: -Infinity,
        max: Infinity,
        step: 0.1,
      });

      hysteresisSwitchOptionsBuilder.createCheckboxInput({
        id: "node-input-initialState",
        label: "initialState",
        value: this.initialState,
        icon: "toggle-on",
      });
    },
  };

export default HysteresisSwitchEditorNode;
