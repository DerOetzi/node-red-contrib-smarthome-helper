import BaseEditorNode, { i18n, NodeEditorFormBuilder } from "@base/editor";
import { MatchJoinEditableList } from "@match-join/editor";
import { EditorNodeDef } from "node-red";
import NotifyDispatcherNode from "./";
import { notifyDispatcherMigration } from "./migration";
import {
  NotifyDispatcherEditorNodeDefaults,
  NotifyDispatcherEditorNodeProperties,
  NotifyDispatcherNodeOptionsDefaults,
  NotifyDispatcherTarget,
} from "./types";

const inputMatcherList = new MatchJoinEditableList({
  targets: Object.values(NotifyDispatcherTarget),
  translatePrefix: "helper.notify-dispatcher",
});

const NotifyDispatcherEditorNode: EditorNodeDef<NotifyDispatcherEditorNodeProperties> =
  {
    category: NotifyDispatcherNode.NodeCategoryLabel,
    color: NotifyDispatcherNode.NodeColor,
    icon: "font-awesome/fa-bell",
    defaults: NotifyDispatcherEditorNodeDefaults,
    label: function () {
      return this.name?.trim() ? this.name.trim() : i18n("helper.notify-dispatcher.name");
    },
    inputs: NotifyDispatcherNodeOptionsDefaults.inputs,
    outputs: NotifyDispatcherNodeOptionsDefaults.outputs,
    outputLabels: (index: number) => {
      return index === 0 ? "broadcast" : "person " + index;
    },
    oneditprepare: function () {
      notifyDispatcherMigration.checkAndMigrate(this);
      BaseEditorNode.oneditprepare!.call(this);

      inputMatcherList.initialize("matcher-rows", this.matchers, {
        translatePrefix: "flowctrl.match-join",
      });

      const notifyDispatcherOptionsBuilder = new NodeEditorFormBuilder(
        $("#notify-dispatcher-options"),
        {
          translatePrefix: "helper.notify-dispatcher",
        }
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
          const persons = parseInt($(this).val() as string, 10);
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
