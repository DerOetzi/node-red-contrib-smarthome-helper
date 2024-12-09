import { EditorNodeDef } from "node-red";
import BaseNodeEditor from "../../flowctrl/base/editor";
import {
  defaultMotionControllerNodeConfig,
  MotionControllerNodeEditorProperties,
  MotionControllerNodeType,
} from "./types";
import {
  getMatchers,
  initializeMatcherRows,
} from "../../flowctrl/match-join/editor";

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

      initializeMatcherRows("#matcher-rows", false, this.matchers, true);

      let matcherDarknessRow = $("#matcher-rows [data-row='1']")
        .parent()
        .toggle(this.onlyDarkness);

      let matcherNightRow = $("#matcher-rows [data-row='2']")
        .parent()
        .toggle(this.nightmodeEnabled);

      $("#matcher-rows [data-row='3']").parent().hide();

      let nightmodeCommandRow = $("#node-input-nightmodeCommand")
        .parent()
        .toggle(this.nightmodeEnabled);

      $("#node-input-onlyDarkness").on("change", function () {
        matcherDarknessRow.toggle($(this).is(":checked"));
      });

      $("#node-input-nightmodeEnabled").on("change", function () {
        matcherNightRow.toggle($(this).is(":checked"));
        nightmodeCommandRow.toggle($(this).is(":checked"));
      });
    },
    oneditsave: function () {
      this.matchers = getMatchers("#matcher-rows");
    },
  };

export default MotionControllerNodeEditor;
