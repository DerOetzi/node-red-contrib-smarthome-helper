import { EditorNodeDef } from "node-red";
import BaseEditorNode, {
  createEditorDefaults,
  i18n,
  NodeEditorFormBuilder,
} from "../../../flowctrl/base/editor";
import {
  InputEditorWithoutStatusTemplate,
  MatchJoinEditableList,
} from "../../../flowctrl/match-join/editor";
import {
  EditorMetadata,
  EditorTemplateDiv,
  EditorTemplateOl,
} from "../../../types";
import NotifyDispatcherNode from "./";
import {
  NotifyDispatcherEditorNodeProperties,
  NotifyDispatcherNodeOptions,
  NotifyDispatcherNodeOptionsDefaults,
  NotifyDispatcherTarget,
} from "./types";

export const NotifyDispatcherEditorTemplate = [
  new EditorTemplateDiv("notify-dispatcher-options"),
  new EditorTemplateOl("matcher-rows"),
  ...InputEditorWithoutStatusTemplate,
];

export const NotifyDispatcherEditorMetadata: EditorMetadata = {
  localePrefix: "helper.notify-dispatcher",
  inputMode: "matcher-topic",
  fieldKeys: ["persons"],
  inputKeys: [
    "message",
    "person1",
    "person2",
    "person3",
    "person4",
    "person5",
    "person6",
    "person7",
    "person8",
    "person9",
    "person10",
  ],
  outputKeys: [
    "broadcast",
    "person1",
    "person2",
    "person3",
    "person4",
    "person5",
    "person6",
    "person7",
    "person8",
    "person9",
    "person10",
  ],
};

const inputMatcherList = new MatchJoinEditableList({
  targets: Object.values(NotifyDispatcherTarget),
  translatePrefix: "helper.notify-dispatcher",
});

const NotifyDispatcherEditorNode: EditorNodeDef<NotifyDispatcherEditorNodeProperties> =
  {
    category: NotifyDispatcherNode.NodeCategoryLabel,
    color: NotifyDispatcherNode.NodeColor,
    icon: "font-awesome/fa-bell",
    defaults: createEditorDefaults<
      NotifyDispatcherNodeOptions,
      NotifyDispatcherEditorNodeProperties
    >(NotifyDispatcherNodeOptionsDefaults),
    label: function () {
      return this.name?.trim()
        ? this.name.trim()
        : i18n("helper.notify-dispatcher.name");
    },
    inputs: NotifyDispatcherNodeOptionsDefaults.inputs,
    outputs: NotifyDispatcherNodeOptionsDefaults.outputs,
    outputLabels: (index: number) => {
      return index === 0 ? "broadcast" : "person " + index;
    },
    oneditprepare: function () {
      BaseEditorNode.oneditprepare!.call(this);

      inputMatcherList.initialize("matcher-rows", this.matchers, {
        translatePrefix: "flowctrl.match-join",
      });

      const notifyDispatcherOptionsBuilder = new NodeEditorFormBuilder(
        $("#notify-dispatcher-options"),
        {
          translatePrefix: "helper.notify-dispatcher",
        },
      );

      for (let i = 1; i <= 10; i++) {
        inputMatcherList.showHideTarget(i <= this.persons, `person${i}`);
      }

      const outputsHidden = notifyDispatcherOptionsBuilder.createHiddenInput({
        id: "node-input-outputs",
        value: this.outputs,
      });

      notifyDispatcherOptionsBuilder
        .createNumberInput({
          id: "node-input-persons",
          label: "persons",
          value: this.persons,
          icon: "hashtag",
          min: 0,
          max: 10,
        })
        .on("change", function () {
          const persons = Number.parseInt($(this).val() as string, 10);
          for (let i = 1; i <= 10; i++) {
            inputMatcherList.removeTarget(i <= persons, `person${i}`);
          }

          outputsHidden.val(persons + 1);
        });
    },
    oneditsave: function () {
      this.matchers = inputMatcherList.values();
    },
  };

export default NotifyDispatcherEditorNode;
