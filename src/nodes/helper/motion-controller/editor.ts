import { EditorNodeDef } from "node-red";
import BaseNodeEditor from "../../flowctrl/base/editor";
import {
  getMatchers,
  initializeMatcherRows,
  removeTarget,
  showHideTarget,
} from "../../flowctrl/match-join/editor";
import {
  defaultMotionControllerNodeConfig,
  MotionControllerNodeEditorProperties,
  MotionControllerNodeType,
} from "./types";

const MotionControllerNodeEditor: EditorNodeDef<MotionControllerNodeEditorProperties> =
  {
    ...BaseNodeEditor,
    category: MotionControllerNodeType.categoryLabel,
    color: MotionControllerNodeType.color,
    defaults: {
      ...BaseNodeEditor.defaults,
      matchers: {
        value: defaultMotionControllerNodeConfig.matchers!,
        required: true,
      },
      join: {
        value: defaultMotionControllerNodeConfig.join!,
        required: true,
      },
      discardNotMatched: {
        value: defaultMotionControllerNodeConfig.discardNotMatched!,
        required: true,
      },
      minMsgCount: {
        value: defaultMotionControllerNodeConfig.minMsgCount!,
        required: true,
      },
      timer: {
        value: defaultMotionControllerNodeConfig.timer!,
        required: true,
      },
      timerUnit: {
        value: defaultMotionControllerNodeConfig.timerUnit!,
        required: true,
      },
      onlyDarkness: {
        value: defaultMotionControllerNodeConfig.onlyDarkness!,
        required: true,
      },
      nightmodeEnabled: {
        value: defaultMotionControllerNodeConfig.nightmodeEnabled!,
        required: true,
      },
      onCommand: {
        value: defaultMotionControllerNodeConfig.onCommand!,
        required: true,
      },
      offCommand: {
        value: defaultMotionControllerNodeConfig.offCommand!,
        required: true,
      },
      nightmodeCommand: {
        value: defaultMotionControllerNodeConfig.nightmodeCommand!,
        required: true,
      },
      statusDelay: {
        value: defaultMotionControllerNodeConfig.statusDelay!,
        required: true,
      },
      outputs: {
        value: defaultMotionControllerNodeConfig.outputs!,
        required: true,
      },
    },
    icon: "motion.svg",
    label: function () {
      return this.name || MotionControllerNodeType.name;
    },
    outputLabels: ["Action", "Status"],
    oneditprepare: function () {
      BaseNodeEditor.oneditprepare!.call(this);

      initializeMatcherRows(this.matchers, {
        targets: ["motion", "darkness", "night", "manual_control", "command"],
        translatePrefix: "helper.motion-controller.target",
        t: this._.bind(this),
      });

      showHideTarget(this.onlyDarkness, "darkness");

      let nightmodeCommandRow = $("#node-input-nightmodeCommand")
        .parent()
        .toggle(this.nightmodeEnabled);

      showHideTarget(this.nightmodeEnabled, "night");

      $("#node-input-onlyDarkness").on("change", function () {
        removeTarget($(this).is(":checked"), "darkness");
      });

      $("#node-input-nightmodeEnabled").on("change", function () {
        nightmodeCommandRow.toggle($(this).is(":checked"));
        removeTarget($(this).is(":checked"), "night");
      });
    },
    oneditsave: function () {
      this.matchers = getMatchers();
    },
  };

export default MotionControllerNodeEditor;
