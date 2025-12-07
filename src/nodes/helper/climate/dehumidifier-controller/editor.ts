import { EditorNodeDef } from "node-red";
import DehumidifierControllerNode from ".";
import BaseEditorNode, {
  createEditorDefaults,
  i18n,
  NodeEditorFormBuilder,
} from "../../../flowctrl/base/editor";
import { MatchJoinEditableList } from "../../../flowctrl/match-join/editor";
import {
  DehumidifierControllerEditorNodeProperties,
  DehumidifierControllerNodeOptions,
  DehumidifierControllerNodeOptionsDefaults,
  DehumidifierControllerTarget,
} from "./types";

const inputMatcherList = new MatchJoinEditableList({
  targets: Object.values(DehumidifierControllerTarget),
  translatePrefix: "helper.dehumidifier-controller",
});

const DehumidifierControllerEditorNode: EditorNodeDef<DehumidifierControllerEditorNodeProperties> =
  {
    category: DehumidifierControllerNode.NodeCategoryLabel,
    color: DehumidifierControllerNode.NodeColor,
    icon: "font-awesome/fa-tint",
    defaults: createEditorDefaults<
      DehumidifierControllerNodeOptions,
      DehumidifierControllerEditorNodeProperties
    >(DehumidifierControllerNodeOptionsDefaults),
    label: function () {
      return this.name?.trim() ? this.name.trim() : "Dehumidifier Controller";
    },
    inputs: DehumidifierControllerNodeOptionsDefaults.inputs,
    outputs: DehumidifierControllerNodeOptionsDefaults.outputs,
    outputLabels: function (index: number) {
      const outputs = ["control"];

      return i18n(`helper.dehumidifier-controller.output.${outputs[index]}`);
    },
    oneditprepare: function () {
      BaseEditorNode.oneditprepare!.call(this);

      inputMatcherList.initialize("matcher-rows", this.matchers, {
        translatePrefix: "flowctrl.match-join",
      });

      const dehhumidifierControllerOptionsBuilder = new NodeEditorFormBuilder(
        $("#dehumidifier-controller-options"),
        {
          translatePrefix: "helper.dehumidifier-controller",
        }
      );

      dehhumidifierControllerOptionsBuilder.createNumberInput({
        id: "node-input-minHumidity",
        label: "minHumidity",
        value: this.minHumidity,
        icon: "fa-tint",
        min: 40,
        max: 60,
        step: 5,
      });

      dehhumidifierControllerOptionsBuilder.createNumberInput({
        id: "node-input-maxHumidity",
        label: "maxHumidity",
        value: this.maxHumidity,
        icon: "fa-tint",
        min: 50,
        max: 80,
        step: 5,
      });

      dehhumidifierControllerOptionsBuilder.createNumberInput({
        id: "node-input-baseTarget",
        label: "baseTarget",
        value: this.baseTarget,
        icon: "fa-bullseye",
        min: 45,
        max: 65,
        step: 5,
      });

      dehhumidifierControllerOptionsBuilder.line();

      dehhumidifierControllerOptionsBuilder.createTimeInput({
        id: "node-input-minOnTime",
        idType: "node-input-minOnTimeUnit",
        label: "minOnTime",
        value: this.minOnTime,
        valueType: this.minOnTimeUnit,
        icon: "clock-o",
      });

      dehhumidifierControllerOptionsBuilder.createTimeInput({
        id: "node-input-minOffTime",
        idType: "node-input-minOffTimeUnit",
        label: "minOffTime",
        value: this.minOffTime,
        valueType: this.minOffTimeUnit,
        icon: "clock-o",
      });
    },
    oneditsave: function () {
      this.matchers = inputMatcherList.values();
    },
  };

export default DehumidifierControllerEditorNode;
