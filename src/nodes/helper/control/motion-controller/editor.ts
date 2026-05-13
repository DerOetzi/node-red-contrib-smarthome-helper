import {
  i18nFieldDefault,
  NodeEditorDefinition,
} from "../../../flowctrl/base/editor";
import { MatchJoinEditableList } from "../../../flowctrl/match-join/editor";
import MotionControllerNode from "./";
import {
  MotionControllerEditorNodeProperties,
  MotionControllerNodeOptions,
  MotionControllerNodeOptionsDefaults,
  MotionControllerTarget,
} from "./types";

export const MotionControllerEditorDef: NodeEditorDefinition<
  MotionControllerNodeOptions,
  MotionControllerEditorNodeProperties
> = {
  localePrefix: "helper.motion-controller",
  nodeClass: MotionControllerNode,
  defaults: MotionControllerNodeOptionsDefaults,
  icon: "font-awesome/fa-male",
  inputMode: "matcher-topic",
  inputKeys: ["motion", "darkness", "night", "manualControl", "command"],
  outputKeys: ["action", "status"],
  baseTemplate: "input-only",
  lists: [
    {
      id: "matcher-rows",
      create: () =>
        new MatchJoinEditableList({
          targets: Object.values(MotionControllerTarget),
          translatePrefix: "helper.motion-controller",
        }),
      dataKey: "matchers",
      rowTranslatePrefix: "flowctrl.match-join",
    },
  ],
  form: {
    id: "motion-controller-options",
    fields: [
      { type: "time", key: "timer", icon: "clock-o" },
      {
        type: "checkbox",
        key: "onlyDarkness",
        icon: "lightbulb-o",
        showsListTarget: {
          listId: "matcher-rows",
          target: MotionControllerTarget.darkness,
        },
      },
      {
        type: "checkbox",
        key: "nightmodeEnabled",
        icon: "moon-o",
        showsListTarget: {
          listId: "matcher-rows",
          target: MotionControllerTarget.night,
        },
      },
      { type: "line" },
      {
        type: "text",
        key: "onCommand",
        icon: "play",
        translatePrefix: "helper.light-controller",
      },
      {
        type: "text",
        key: "offCommand",
        icon: "stop",
        translatePrefix: "helper.light-controller",
      },
      {
        type: "text",
        key: "nightmodeCommand",
        icon: "moon-o",
        translatePrefix: "helper.light-controller",
        dependsOn: "nightmodeEnabled",
      },
    ],
  },
  hooks: {
    onadd: (node) => {
      node.onCommand = i18nFieldDefault("helper.light-controller", "onCommand");
      node.offCommand = i18nFieldDefault(
        "helper.light-controller",
        "offCommand",
      );
      node.nightmodeCommand = i18nFieldDefault(
        "helper.light-controller",
        "nightmodeCommand",
      );
    },
  },
};
