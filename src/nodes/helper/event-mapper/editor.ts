import { EditorNodeDef } from "node-red";
import BaseNodeEditor from "../../flowctrl/base/editor";
import {
  getMatchers,
  initializeMatcherRows,
} from "../../flowctrl/match-join/editor";
import {
  autocompleteEvents,
  defaultEventMapperNodeConfig,
  EventMapperNodeEditorProperties,
  EventMapperNodeType,
  EventMapperRule,
} from "./types";

const EventMapperNodeEditor: EditorNodeDef<EventMapperNodeEditorProperties> = {
  ...BaseNodeEditor,
  category: EventMapperNodeType.categoryLabel,
  color: EventMapperNodeType.color,
  defaults: {
    ...BaseNodeEditor.defaults,
    matchers: {
      value: defaultEventMapperNodeConfig.matchers!,
      required: true,
    },
    join: {
      value: defaultEventMapperNodeConfig.join!,
      required: true,
    },
    discardNotMatched: {
      value: defaultEventMapperNodeConfig.discardNotMatched!,
      required: true,
    },
    minMsgCount: {
      value: defaultEventMapperNodeConfig.minMsgCount!,
      required: true,
    },
    rules: {
      value: defaultEventMapperNodeConfig.rules!,
      required: true,
    },
    ignoreUnknownEvents: {
      value: defaultEventMapperNodeConfig.ignoreUnknownEvents!,
      required: false,
    },
  },
  icon: "switch",
  outputLabels: function (index: number) {
    return this.rules[index]?.event || "event " + index;
  },
  label: function () {
    return this.name || EventMapperNodeType.name;
  },
  oneditprepare: function () {
    BaseNodeEditor.oneditprepare!.call(this);

    initializeMatcherRows(this.matchers, {
      targets: ["event"],
      translatePrefix: "helper.event-mapper.target",
      t: this._.bind(this),
    });

    initializeRuleRows("#rule-rows", this.rules);
  },
  oneditsave: function () {
    this.matchers = getMatchers();
    this.rules = getRules("#rule-rows");
    this.outputs = this.rules.length;
  },
};

export function initializeRuleRows(
  containerId: string,
  rules: EventMapperRule[]
) {
  $(containerId)
    .editableList({
      addButton: true,
      removable: true,
      sortable: true,
      height: "auto",
      header: $("<div>").append($("<label>").text("Event => Mapped")),
      addItem: function (container, index, data: EventMapperRule) {
        container.css({
          overflow: "hidden",
          whiteSpace: "nowrap",
        });

        container.attr("data-row", index);

        const $row = $("<div />").appendTo(container);
        const $row1 = $("<div />").appendTo($row).css("margin-bottom", "6px");

        const eventName: any = $("<input/>", {
          class: "event-name",
          type: "text",
        })
          .css("width", "100%")
          .appendTo($row1);

        let eventValue = data.event ?? "";
        eventName.val(eventValue);

        eventName.autoComplete({
          search: function (val: any) {
            const matches: any[] = [];
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
            return matches;
          },
        });

        const $row2 = $("<div />").appendTo($row).css("margin-bottom", "6px");

        const mappedName = $("<input/>", {
          class: "mapped-name",
          type: "text",
        })
          .css("width", "100%")
          .appendTo($row2)
          .typedInput({
            types: ["str", "num", "bool", "msg"],
          });

        mappedName.typedInput("value", data.mapped ?? "");
        mappedName.typedInput("type", data.mappedType ?? "str");
      },
    })
    .editableList("addItems", rules || []);
}

export function getRules(containerId: string): EventMapperRule[] {
  let rulesList = $(containerId).editableList("items");
  let rules: EventMapperRule[] = [];

  rulesList.each((index, row) => {
    let identifier = $(row);

    rules.push({
      event: identifier.find(".event-name").val() as string,
      mapped: identifier.find(".mapped-name").typedInput("value"),
      mappedType: identifier.find(".mapped-name").typedInput("type"),
      output: index,
    });
  });

  return rules;
}

export default EventMapperNodeEditor;

export { EventMapperNodeType };
