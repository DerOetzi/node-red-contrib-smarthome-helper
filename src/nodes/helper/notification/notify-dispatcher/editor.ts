import {
  buildEditorMetadata,
  buildEditorNodeDef,
  buildEditorTemplate,
  NodeEditorDefinition,
} from "../../../flowctrl/base/editor";
import { MatchJoinEditableList } from "../../../flowctrl/match-join/editor";
import NotifyDispatcherNode from "./";
import {
  NotifyDispatcherEditorNodeProperties,
  NotifyDispatcherNodeOptionsDefaults,
  NotifyDispatcherTarget,
} from "./types";

const NotifyDispatcherEditorDefinition: NodeEditorDefinition<
  typeof NotifyDispatcherNodeOptionsDefaults,
  NotifyDispatcherEditorNodeProperties
> = {
  localePrefix: "helper.notify-dispatcher",
  nodeClass: NotifyDispatcherNode,
  defaults: NotifyDispatcherNodeOptionsDefaults,
  icon: "font-awesome/fa-bell",
  inputMode: "matcher-topic",
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
  lists: [
    {
      id: "matcher-rows",
      create: () =>
        new MatchJoinEditableList({
          targets: Object.values(NotifyDispatcherTarget),
          translatePrefix: "helper.notify-dispatcher",
        }),
      dataKey: "matchers",
    },
  ],
  form: {
    id: "notify-dispatcher-options",
    fields: [
      { type: "hidden", key: "outputs" },
      { type: "number", key: "persons", icon: "hashtag", min: 0, max: 10 },
    ],
  },
  baseTemplate: "input-without-status",
  hooks: {
    oneditprepare(node, ctx) {
      const matcherList = ctx.getList("matcher-rows");

      for (let i = 1; i <= 10; i++) {
        matcherList.showHideTarget?.(i <= node.persons, `person${i}`);
      }

      ctx.getField("persons").on("change", function () {
        const persons = Number.parseInt($(this).val() as string, 10);
        for (let i = 1; i <= 10; i++) {
          matcherList.removeTarget?.(i <= persons, `person${i}`);
        }
        ctx.getField("outputs").val(persons + 1);
      });
    },
    outputLabels(_node, index) {
      return index === 0 ? "broadcast" : `person ${index}`;
    },
  },
};

export const NotifyDispatcherEditorTemplate = buildEditorTemplate(
  NotifyDispatcherEditorDefinition,
);
export const NotifyDispatcherEditorMetadata = buildEditorMetadata(
  NotifyDispatcherEditorDefinition,
);
export default buildEditorNodeDef(NotifyDispatcherEditorDefinition);
