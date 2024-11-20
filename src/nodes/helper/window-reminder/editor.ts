import { EditorNodeDef } from "node-red";
import BaseNodeEditor from "../../flowctrl/base/editor";
import {
  getMatchers,
  initializeMatcherRows,
} from "../../flowctrl/match-join/editor";
import {
  defaultWindowReminderNodeConfig,
  WindowReminderNodeEditorProperties,
  WindowReminderNodeType,
} from "./types";

const WindowReminderNodeEditor: EditorNodeDef<WindowReminderNodeEditorProperties> =
  {
    ...BaseNodeEditor,
    category: WindowReminderNodeType.categoryLabel,
    color: WindowReminderNodeType.color,
    defaults: {
      ...BaseNodeEditor.defaults,
      matchers: {
        value: defaultWindowReminderNodeConfig.matchers!,
        required: true,
      },
      join: { value: defaultWindowReminderNodeConfig.join!, required: false },
      discardNotMatched: {
        value: defaultWindowReminderNodeConfig.discardNotMatched!,
        required: false,
      },
      minMsgCount: {
        value: defaultWindowReminderNodeConfig.minMsgCount!,
        required: true,
      },
      interval: {
        value: defaultWindowReminderNodeConfig.interval!,
        required: true,
      },
    },
    outputLabels: ["notification"],
    icon: "window.svg",
    label: function () {
      return this.name || WindowReminderNodeType.name;
    },
    oneditprepare: function () {
      BaseNodeEditor.oneditprepare!.call(this);
      initializeMatcherRows("#matcher-rows", false, this.matchers, true);
    },
    oneditsave: function () {
      this.matchers = getMatchers("#matcher-rows");
    },
  };

export default WindowReminderNodeEditor;
