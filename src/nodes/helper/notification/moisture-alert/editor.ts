import { EditorNodeDef } from "node-red";
import MoistureAlertNode from ".";
import BaseEditorNode, {
  createEditorDefaults,
  i18n,
  NodeEditorFormBuilder,
} from "../../../flowctrl/base/editor";
import { MatchJoinEditableList } from "../../../flowctrl/match-join/editor";
import {
  MoistureAlertEditorNodeProperties,
  MoistureAlertNodeOptions,
  MoistureAlertNodeOptionsDefaults,
  MoistureAlertTarget,
} from "./types";

const inputMatcherList = new MatchJoinEditableList({
  targets: Object.values(MoistureAlertTarget),
  translatePrefix: "helper.moisture-alert",
});

const MoistureAlertEditorNode: EditorNodeDef<MoistureAlertEditorNodeProperties> =
  {
    category: MoistureAlertNode.NodeCategoryLabel,
    color: MoistureAlertNode.NodeColor,
    icon: "font-awesome/fa-leaf",
    defaults: createEditorDefaults<
      MoistureAlertNodeOptions,
      MoistureAlertEditorNodeProperties
    >(MoistureAlertNodeOptionsDefaults),
    label: function () {
      return this.name?.trim()
        ? this.name.trim()
        : i18n("helper.moisture-alert.name");
    },
    inputs: MoistureAlertNodeOptionsDefaults.inputs,
    outputs: MoistureAlertNodeOptionsDefaults.outputs,
    outputLabels: (index: number) => {
      const outputs = ["notification", "lastAlert"];

      return i18n(`helper.moisture-alert.output.${outputs[index]}`);
    },
    oneditprepare: function () {
      BaseEditorNode.oneditprepare!.call(this);

      inputMatcherList.initialize("matcher-rows", this.matchers, {
        translatePrefix: "flowctrl.match-join",
      });

      const moistureAlertOptionsBuilder = new NodeEditorFormBuilder(
        $("#moisture-alert-options"),
        {
          translatePrefix: "helper.moisture-alert",
        }
      );

      moistureAlertOptionsBuilder.createNumberInput({
        id: "node-input-alertThreshold",
        label: "alertThreshold",
        value: this.alertThreshold,
        icon: "percent",
      });

      moistureAlertOptionsBuilder.createTimeInput({
        id: "node-input-alertInterval",
        idType: "node-input-alertIntervalUnit",
        label: "alertInterval",
        value: this.alertInterval,
        valueType: this.alertIntervalUnit,
        icon: "clock-o",
      });
    },
    oneditsave: function () {
      this.matchers = inputMatcherList.values();
    },
  };

export default MoistureAlertEditorNode;
