import {
  EditorNodeDef,
  EditorWidgetTypedInputType,
  EditorWidgetTypedInputTypeDefinition,
} from "node-red";
import BaseNode from "./";
import {
  BaseEditorNodeProperties,
  BaseEditorNodePropertiesDefaults,
} from "./types";

const BaseNodeEditor: EditorNodeDef<BaseEditorNodeProperties> = {
  category: BaseNode.NodeCategory.label,
  color: BaseNode.NodeColor,
  defaults: BaseEditorNodePropertiesDefaults,
  icon: "font-awesome/fa-cogs",
  inputs: 1,
  label: function () {
    return this.name || BaseNode.NodeType;
  },
  oneditprepare: function () {
    const commonOptionsBuilder = new NodeEditorFormBuilder(
      $("#base-common-options"),
      "flowctrl.base",
      this._.bind(this)
    );

    commonOptionsBuilder.createTextInput(
      "node-input-name",
      "name",
      this.name!,
      "code"
    );

    commonOptionsBuilder.createTypedInput(
      "node-input-topic",
      "node-input-topicType",
      "topic",
      this.topic,
      this.topicType,
      ["msg", "str"],
      "tag"
    );

    commonOptionsBuilder.line();

    commonOptionsBuilder.createCheckboxInput(
      "node-input-newMsg",
      "newMsg",
      this.newMsg,
      "pencil-square-o"
    );

    commonOptionsBuilder.createCheckboxInput(
      "node-input-filterUniquePayload",
      "filterUniquePayload",
      this.filterUniquePayload,
      "filter"
    );

    const debounceOptions = $("#base-debounce-options").toggle(this.debounce);

    commonOptionsBuilder
      .createCheckboxInput(
        "node-input-debounce",
        "debounce",
        this.debounce,
        "line-chart"
      )
      .on("change", function () {
        debounceOptions.toggle($(this).prop("checked"));
      });

    const debounceOptionsBuilder = new NodeEditorFormBuilder(
      debounceOptions,
      "flowctrl.base",
      this._.bind(this)
    );

    debounceOptionsBuilder.createCheckboxInput(
      "node-input-debounceTopic",
      "debounceTopic",
      this.debounceTopic,
      "tags"
    );

    debounceOptionsBuilder.createCheckboxInput(
      "node-input-debounceShowStatus",
      "debounceShowStatus",
      this.debounceShowStatus,
      "eye"
    );

    debounceOptionsBuilder.createTimeInput(
      "node-input-debounceTime",
      "node-input-debounceUnit",
      "debounceTime",
      this.debounceTime,
      this.debounceUnit,
      "clock-o"
    );

    debounceOptionsBuilder.createCheckboxInput(
      "node-input-debounceLeading",
      "debounceLeading",
      this.debounceLeading,
      "angle-double-down"
    );

    debounceOptionsBuilder.createCheckboxInput(
      "node-input-debounceTrailing",
      "debounceTrailing",
      this.debounceTrailing,
      "angle-double-up"
    );
  },
};

export default BaseNodeEditor;

export class NodeEditorFormBuilder {
  constructor(
    private readonly container: JQuery,
    private readonly translatePrefix: string,
    private readonly translate: Function
  ) {}

  public line(): JQuery {
    return $("<hr/>").appendTo(this.container);
  }

  public createTimeInput(
    id: string,
    idUnit: string,
    label: string,
    value: number,
    valueUnit: string,
    icon?: string
  ): JQuery {
    return this.createTypedInput(
      id,
      idUnit,
      label,
      value.toString(),
      valueUnit,
      [
        { value: "ms", label: "ms" },
        { value: "s", label: "s" },
        { value: "m", label: "m" },
        { value: "h", label: "h" },
      ],
      icon
    );
  }

  public createTypedInput(
    id: string,
    idType: string,
    label: string,
    value: string,
    valueType: string,
    types: (
      | EditorWidgetTypedInputType
      | EditorWidgetTypedInputTypeDefinition
    )[],
    icon?: string
  ): JQuery {
    const input = this.createTextInput(id, label, value, icon);
    const inputType = $("<input/>", { id: idType, type: "hidden" }).appendTo(
      input.parent() as JQuery
    );

    inputType.val(valueType ?? "str");

    input.typedInput({
      types,
      typeField: `#${idType}`,
    });

    return input;
  }

  public createTextInput(
    id: string,
    label: string,
    value: string,
    icon?: string
  ): JQuery {
    const formRow = this.createFormRowWithLabel(id, label, icon);
    const input = $("<input/>", { id, type: "text" }).appendTo(formRow);

    if (value) {
      input.val(value);
    }

    return input;
  }

  public createCheckboxInput(
    id: string,
    label: string,
    value: boolean,
    icon?: string
  ): JQuery {
    const formRow = this.createFormRowWithLabel(id, label, icon);
    const input = $("<input/>", { id, type: "checkbox" }).appendTo(formRow);

    if (value) {
      input.prop("checked", true);
    }

    return input;
  }

  private createFormRowWithLabel(
    id: string,
    label: string,
    icon?: string
  ): JQuery {
    const formRow = this.createFormRow();

    const labelTag = $("<label/>", {
      for: id,
      text: this.translate(`${this.translatePrefix}.label.${label}`),
    }).appendTo(formRow);

    if (icon) {
      labelTag.prepend(" ").prepend($("<i/>", { class: `fa fa-${icon}` }));
    }

    return formRow;
  }

  private createFormRow(): JQuery {
    return $("<div/>", { class: "form-row" }).appendTo(this.container);
  }
}
