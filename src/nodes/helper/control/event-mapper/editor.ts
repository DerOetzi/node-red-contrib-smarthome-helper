import {
  NodeEditorDefinition,
  NodeEditorFormEditableList,
} from "../../../flowctrl/base/editor";
import { NodeEditorFormBuilderAutocompleteMatch } from "../../../flowctrl/base/types";
import { MatchJoinEditableList } from "../../../flowctrl/match-join/editor";
import {
  autocompleteEvents,
  EventMapperEditorNodeProperties,
  EventMapperNodeOptions,
  EventMapperNodeOptionsDefaults,
  EventMapperRule,
  EventMapperTarget,
} from "./types";

import EventMapperNode from "./";

const eventMatcherList = new MatchJoinEditableList({
  targets: Object.values(EventMapperTarget),
  translatePrefix: "helper.event-mapper",
});

class EventMapperRuleEditableList extends NodeEditorFormEditableList<EventMapperRule> {
  protected addItem(data: EventMapperRule) {
    this.rowBuilder!.createAutocompleteInput({
      id: "event",
      label: "event",
      value: data.event ?? "",
      icon: "comment-o",
      search: this.eventAutocomplete.bind(this),
    });

    this.rowBuilder!.createTypedInput({
      id: "mapped",
      idType: "mappedType",
      label: "mapped",
      value: data.mapped ?? "",
      valueType: data.mappedType ?? "str",
      types: ["str", "num", "bool", "msg"],
      icon: "map-signs",
    });
  }

  private eventAutocomplete(
    val: string,
  ): Promise<NodeEditorFormBuilderAutocompleteMatch[]> {
    const matches: NodeEditorFormBuilderAutocompleteMatch[] = [];
    autocompleteEvents.forEach((v) => {
      const i = v.toLowerCase().indexOf(val.toLowerCase());
      if (i > -1) {
        matches.push({
          value: v,
          label: v,
          i: i,
        });
      }
    });
    matches.sort(function (A, B) {
      return A.i - B.i;
    });
    return Promise.resolve(matches);
  }
}

const ruleRows = new EventMapperRuleEditableList();

export const EventMapperEditorDef: NodeEditorDefinition<
  EventMapperNodeOptions,
  EventMapperEditorNodeProperties
> = {
  localePrefix: "helper.event-mapper",
  nodeClass: EventMapperNode,
  defaults: EventMapperNodeOptionsDefaults,
  icon: "font-awesome/fa-map-signs",
  inputMode: "matcher-topic",
  inputKeys: ["event"],
  outputKeys: [],
  baseTemplate: "input-without-status",
  lists: [
    {
      id: "matcher-rows",
      create: () => eventMatcherList,
      dataKey: "matchers",
      rowTranslatePrefix: "flowctrl.match-join",
    },
    {
      id: "rule-rows",
      create: () => ruleRows,
      dataKey: "rules",
      rowTranslatePrefix: "helper.event-mapper",
    },
  ],
  form: {
    id: "event-mapper-options",
    fields: [
      { type: "checkbox", key: "ignoreUnknownEvents", icon: "question" },
    ],
  },
  hooks: {
    outputLabels: (node, index) => {
      return (node as any).rules?.[index]?.event || "event " + index;
    },
    oneditsave: (node, ctx) => {
      (node as any).outputs = ctx.getList("rule-rows").values().length;
    },
  },
};
