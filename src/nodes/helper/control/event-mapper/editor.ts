import { EditorNodeDef } from "node-red";
import BaseEditorNode, {
  i18n,
  NodeEditorFormBuilder,
  NodeEditorFormEditableList,
} from "../../../flowctrl/base/editor";
import { NodeEditorFormBuilderAutocompleteMatch } from "../../../flowctrl/base/types";
import { MatchJoinEditableList } from "../../../flowctrl/match-join/editor";
import {
  autocompleteEvents,
  EventMapperEditorNodeProperties,
  EventMapperEditorNodePropertiesDefaults,
  EventMapperNodeOptionsDefaults,
  EventMapperRule,
  EventMapperTarget,
} from "./types";

import EventMapperNode from "./";
import { eventMapperMigration } from "./migration";

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
    val: string
  ): Promise<NodeEditorFormBuilderAutocompleteMatch[]> {
    const matches: NodeEditorFormBuilderAutocompleteMatch[] = [];
    autocompleteEvents.forEach((v) => {
      let i = v.toLowerCase().indexOf(val.toLowerCase());
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

const EventMapperEditorNode: EditorNodeDef<EventMapperEditorNodeProperties> = {
  category: EventMapperNode.NodeCategoryLabel,
  color: EventMapperNode.NodeColor,
  icon: "font-awesome/fa-map-signs",
  defaults: EventMapperEditorNodePropertiesDefaults,
  label: function () {
    return this.name || i18n("helper.event-mapper.name");
  },
  inputs: EventMapperNodeOptionsDefaults.inputs,
  outputs: EventMapperNodeOptionsDefaults.outputs,
  outputLabels: function (index: number) {
    return this.rules[index]?.event || "event " + index;
  },
  oneditprepare: function () {
    eventMapperMigration.checkAndMigrate(this);

    BaseEditorNode.oneditprepare!.call(this);

    eventMatcherList.initialize("matcher-rows", this.matchers, {
      translatePrefix: "flowctrl.match-join",
    });

    ruleRows.initialize("rule-rows", this.rules, {
      translatePrefix: "helper.event-mapper",
    });

    const eventMapperOptionsBuilder = new NodeEditorFormBuilder(
      $("#event-mapper-options"),
      {
        translatePrefix: "helper.event-mapper",
      }
    );

    eventMapperOptionsBuilder.createCheckboxInput({
      id: "node-input-ignoreUnknownEvents",
      label: "ignoreUnknownEvents",
      value: this.ignoreUnknownEvents,
      icon: "question",
    });
  },
  oneditsave: function () {
    this.matchers = eventMatcherList.values();
    this.rules = ruleRows.values();
    this.outputs = this.rules.length;
  },
};

export default EventMapperEditorNode;
