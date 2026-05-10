import { EditorNodeDef } from "node-red";
import { EditorMetadata, EditorTemplateElement } from "../../types";
import StatusNode from ".";
import BaseEditorNode, {
  BaseCommonElement,
  BaseDebounceNoTopicElement,
  createEditorDefaults,
  i18n,
  i18nOutputLabel,
  NodeEditorFormBuilder,
} from "../base/editor";
import { MatchJoinEditableList } from "../match-join/editor";
import {
  StatusEditorNodeProperties,
  StatusNodeOptions,
  StatusNodeOptionsDefaults,
  StatusNodeScope,
} from "./types";
import { ActiveControllerTarget } from "../active-controller/types";

export const StatusEditorTemplate: EditorTemplateElement[] = [
  { tag: "ol", id: "matcher-rows" },
  "hr",
  { tag: "div", id: "status-node-options" },
  "hr",
  BaseCommonElement,
  "hr",
  BaseDebounceNoTopicElement,
];

export const StatusEditorMetadata: EditorMetadata = {
  localePrefix: "flowctrl.status",
  inputMode: "msg-property",
  fieldKeys: ["scope", "initialActive"],
  inputKeys: ["activeCondition"],
  outputKeys: ["status", "statusText"],
  template: StatusEditorTemplate,
};

const inputMatcherList = new MatchJoinEditableList({
  targets: [ActiveControllerTarget.activeCondition],
  translatePrefix: "flowctrl.status",
});

const StatusEditorNode: EditorNodeDef<StatusEditorNodeProperties> = {
  category: StatusNode.NodeCategoryLabel,
  color: StatusNode.NodeColor,
  icon: "font-awesome/fa-key",
  defaults: createEditorDefaults<StatusNodeOptions, StatusEditorNodeProperties>(
    StatusNodeOptionsDefaults,
  ),
  label: function () {
    return this.name?.trim() ? this.name.trim() : i18n("flowctrl.status.name");
  },
  inputs: StatusNodeOptionsDefaults.inputs,
  outputs: StatusNodeOptionsDefaults.outputs,
  outputLabels: function (index: number) {
    const outputs = ["status", "statusText"];

    return i18nOutputLabel("flowctrl.status", outputs[index]);
  },
  oneditprepare: function () {
    BaseEditorNode.oneditprepare!.call(this);

    inputMatcherList.initialize("matcher-rows", this.matchers, {
      translatePrefix: "flowctrl.match-join",
    });

    const statusNodeOptionsBuilder = new NodeEditorFormBuilder(
      $("#status-node-options"),
      { translatePrefix: "flowctrl.status" },
    );

    statusNodeOptionsBuilder.createSelectInput({
      id: "node-input-scope",
      label: "scope",
      options: Object.values(StatusNodeScope),
      value: this.scope,
      icon: "sitemap",
    });

    statusNodeOptionsBuilder.createCheckboxInput({
      id: "node-input-defaultActive",
      label: "defaultActive",
      value: this.defaultActive,
      icon: "toggle-on",
    });
  },
  oneditsave: function () {
    this.matchers = inputMatcherList.values();
  },
};

export default StatusEditorNode;
