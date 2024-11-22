import { EditorNodeDef } from "node-red";
import BaseNodeEditor from "../../flowctrl/base/editor";
import {
  getMatchers,
  initializeMatcherRows,
} from "../../flowctrl/match-join/editor";
import {
  defaultNotifyDispatcherNodeConfig,
  NotifyDispatcherNodeEditorProperties,
  NotifyDispatcherNodeType,
} from "./types";

const NotifyDispatcherNodeEditor: EditorNodeDef<NotifyDispatcherNodeEditorProperties> =
  {
    ...BaseNodeEditor,
    category: NotifyDispatcherNodeType.categoryLabel,
    color: NotifyDispatcherNodeType.color,
    defaults: {
      ...BaseNodeEditor.defaults,
      matchers: {
        value: defaultNotifyDispatcherNodeConfig.matchers!,
        required: true,
      },
      join: { value: defaultNotifyDispatcherNodeConfig.join!, required: false },
      discardNotMatched: {
        value: defaultNotifyDispatcherNodeConfig.discardNotMatched!,
        required: false,
      },
      minMsgCount: {
        value: defaultNotifyDispatcherNodeConfig.minMsgCount!,
        required: true,
      },
      outputs: {
        value: defaultNotifyDispatcherNodeConfig.outputs!,
        required: true,
      },
    },
    outputLabels: (index: number) => {
      return index === 0 ? "broadcast" : "person " + index;
    },
    icon: "person.svg",
    label: function () {
      return this.name || NotifyDispatcherNodeType.name;
    },
    oneditprepare: function () {
      BaseNodeEditor.oneditprepare!.call(this);
      initializeMatcherRows(
        "#matcher-rows",
        true,
        this.matchers,
        true,
        "person"
      );
    },
    oneditsave: function () {
      this.matchers = getMatchers("#matcher-rows", "person");
      this.outputs = this.matchers.length + 1;
      this.minMsgCount = this.matchers.length + 1;
    },
  };

export default NotifyDispatcherNodeEditor;

export { NotifyDispatcherNodeType };