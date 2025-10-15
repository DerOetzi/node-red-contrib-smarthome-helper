import { EditorNodeDef } from "node-red";
import BaseEditorNode, {
  createEditorDefaults,
  i18n,
  NodeEditorFormBuilder,
} from "../../../flowctrl/base/editor";
import { MatchJoinEditableList } from "../../../flowctrl/match-join/editor";
import MotionControllerNode from "./";
import {
  MotionControllerEditorNodeProperties,
  MotionControllerNodeOptions,
  MotionControllerNodeOptionsDefaults,
  MotionControllerTarget,
} from "./types";

const inputMatcherList = new MatchJoinEditableList({
  targets: Object.values(MotionControllerTarget),
  translatePrefix: "helper.motion-controller",
});

const MotionControllerEditorNode: EditorNodeDef<MotionControllerEditorNodeProperties> =
  {
    category: MotionControllerNode.NodeCategoryLabel,
    color: MotionControllerNode.NodeColor,
    icon: "font-awesome/fa-male",
    defaults: createEditorDefaults<
      MotionControllerNodeOptions,
      MotionControllerEditorNodeProperties
    >(MotionControllerNodeOptionsDefaults),
    label: function () {
      return this.name?.trim()
        ? this.name.trim()
        : i18n("helper.motion-controller.name");
    },
    inputs: MotionControllerNodeOptionsDefaults.inputs,
    outputs: MotionControllerNodeOptionsDefaults.outputs,
    outputLabels: function (index: number) {
      const outputs = ["action"];
      return i18n(`helper.motion-controller.output.${outputs[index]}`);
    },
    onadd: function () {
      this.onCommand = i18n("helper.light-controller.default.onCommand");
      this.offCommand = i18n("helper.light-controller.default.offCommand");
      this.nightmodeCommand = i18n(
        "helper.light-controller.default.nightmodeCommand"
      );
    },
    oneditprepare: function () {
      BaseEditorNode.oneditprepare!.call(this);

      inputMatcherList.initialize("matcher-rows", this.matchers, {
        translatePrefix: "flowctrl.match-join",
      });

      const motionControllerOptionsBuilder = new NodeEditorFormBuilder(
        $("#motion-controller-options"),
        {
          translatePrefix: "helper.motion-controller",
        }
      );

      motionControllerOptionsBuilder.createTimeInput({
        id: "node-input-timer",
        idType: "timerUnit",
        label: "timer",
        value: this.timer,
        valueType: this.timerUnit,
        icon: "clock-o",
      });

      motionControllerOptionsBuilder
        .createCheckboxInput({
          id: "node-input-onlyDarkness",
          label: "onlyDarkness",
          value: this.onlyDarkness,
          icon: "lightbulb-o",
        })
        .on("change", function () {
          inputMatcherList.showHideTarget(
            $(this).is(":checked"),
            MotionControllerTarget.darkness
          );
        });

      inputMatcherList.showHideTarget(
        this.onlyDarkness,
        MotionControllerTarget.darkness
      );

      const nightmodeEnabledCheckbox =
        motionControllerOptionsBuilder.createCheckboxInput({
          id: "node-input-nightmodeEnabled",
          label: "nightmodeEnabled",
          value: this.nightmodeEnabled,
          icon: "moon-o",
        });

      inputMatcherList.showHideTarget(
        this.nightmodeEnabled,
        MotionControllerTarget.night
      );

      motionControllerOptionsBuilder.line();

      motionControllerOptionsBuilder.createTextInput({
        id: "node-input-onCommand",
        label: "onCommand",
        value: this.onCommand,
        icon: "play",
        translatePrefix: "helper.light-controller",
      });

      motionControllerOptionsBuilder.createTextInput({
        id: "node-input-offCommand",
        label: "offCommand",
        value: this.offCommand,
        icon: "stop",
        translatePrefix: "helper.light-controller",
      });

      const nightmodeCommandRow = motionControllerOptionsBuilder
        .createTextInput({
          id: "node-input-nightmodeCommand",
          label: "nightmodeCommand",
          value: this.nightmodeCommand,
          icon: "moon-o",
          translatePrefix: "helper.light-controller",
        })
        .parent()
        .toggle(this.nightmodeEnabled);

      nightmodeEnabledCheckbox.on("change", function () {
        const nightmodeEnabled = $(this).is(":checked");
        inputMatcherList.removeTarget(
          nightmodeEnabled,
          MotionControllerTarget.night
        );
        nightmodeCommandRow.toggle(nightmodeEnabled);
      });
    },
    oneditsave: function () {
      this.matchers = inputMatcherList.values();
    },
  };

export default MotionControllerEditorNode;
