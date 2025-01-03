import { EditorNodeDef } from "node-red";
import BaseNode from "./";
import {
  BaseEditorNodeProperties,
  BaseEditorNodePropertiesDefaults,
  BaseNodeOptionsDefaults,
  NodeEditorFormBuilderInputParams,
  NodeEditorFormBuilderParams,
  NodeEditorFormBuilderSelectParams,
  NodeEditorFormBuilderTimeInputParams,
  NodeEditorFormBuilderTypedInputParams,
} from "./types";

const BaseNodeEditor: EditorNodeDef<BaseEditorNodeProperties> = {
  category: BaseNode.NodeCategory.label,
  color: BaseNode.NodeColor,
  icon: "font-awesome/fa-cogs",
  defaults: BaseEditorNodePropertiesDefaults,
  label: function () {
    return this.name || BaseNode.NodeType;
  },
  inputs: BaseNodeOptionsDefaults.inputs,
  outputs: BaseNodeOptionsDefaults.outputs,
  oneditprepare: function () {
    const commonOptionsBuilder = new NodeEditorFormBuilder(
      $("#base-common-options"),
      { translatePrefix: "flowctrl.base", translate: this._.bind(this) }
    );

    commonOptionsBuilder.createTextInput({
      id: "node-input-name",
      label: "name",
      value: this.name!,
      icon: "code",
    });

    commonOptionsBuilder.createTypedInput({
      id: "node-input-topic",
      idType: "node-input-topicType",
      label: "topic",
      value: this.topic,
      valueType: this.topicType,
      types: ["msg", "str"],
      icon: "tag",
    });

    commonOptionsBuilder.line();

    commonOptionsBuilder.createCheckboxInput({
      id: "node-input-newMsg",
      label: "newMsg",
      value: this.newMsg,
      icon: "pencil-square-o",
    });

    commonOptionsBuilder.createCheckboxInput({
      id: "node-input-filterUniquePayload",
      label: "filterUniquePayload",
      value: this.filterUniquePayload,
      icon: "filter",
    });

    const debounceOptions = $("#base-debounce-options").toggle(this.debounce);

    commonOptionsBuilder
      .createCheckboxInput({
        id: "node-input-debounce",
        label: "debounce",
        value: this.debounce,
        icon: "line-chart",
      })
      .on("change", function () {
        debounceOptions.toggle($(this).is(":checked"));
      });

    const debounceOptionsBuilder = new NodeEditorFormBuilder(debounceOptions, {
      translatePrefix: "flowctrl.base",
      translate: this._.bind(this),
    });

    debounceOptionsBuilder.createCheckboxInput({
      id: "node-input-debounceTopic",
      label: "debounceTopic",
      value: this.debounceTopic,
      icon: "tags",
    });

    debounceOptionsBuilder.createCheckboxInput({
      id: "node-input-debounceShowStatus",
      label: "debounceShowStatus",
      value: this.debounceShowStatus,
      icon: "eye",
    });

    debounceOptionsBuilder.createTimeInput({
      id: "node-input-debounceTime",
      idType: "node-input-debounceUnit",
      label: "debounceTime",
      value: this.debounceTime,
      valueType: this.debounceUnit,
      icon: "clock-o",
    });

    debounceOptionsBuilder.createCheckboxInput({
      id: "node-input-debounceLeading",
      label: "debounceLeading",
      value: this.debounceLeading,
      icon: "hourglass-1",
    });

    debounceOptionsBuilder.createCheckboxInput({
      id: "node-input-debounceTrailing",
      label: "debounceTrailing",
      value: this.debounceTrailing,
      icon: "hourglass-end",
    });
  },
};

export default BaseNodeEditor;

export class NodeEditorFormBuilder {
  private readonly uniqueIdCounters: Record<string, number> = {};

  constructor(
    private container: JQuery,
    private readonly params: NodeEditorFormBuilderParams
  ) {}

  public newContainer(container: JQuery) {
    this.container = container;
  }

  public line(): JQuery {
    return $("<hr/>").appendTo(this.container);
  }

  public createTimeInput(params: NodeEditorFormBuilderTimeInputParams): JQuery {
    return this.createTypedInput({
      ...params,
      types: [
        { value: "ms", label: "ms", validate: /^\d+$/ },
        { value: "s", label: "s", validate: /^\d+$/ },
        { value: "m", label: "m", validate: /^\d+$/ },
        { value: "h", label: "h", validate: /^\d+$/ },
      ],
      valueType: params.valueType ?? "ms",
      width: 100,
    });
  }

  public createTypedInput(
    params: NodeEditorFormBuilderTypedInputParams
  ): JQuery {
    const input = this.createTextInput(params);

    const uniqueIdType = this.uniqueId(params.idType);
    const inputType = $("<input/>", {
      id: uniqueIdType,
      type: "hidden",
      class: params.idType,
    }).appendTo(input.parent() as JQuery);

    inputType.val(params.valueType ?? "str");

    input
      .typedInput({
        types: params.types ?? ["msg", "str", "num", "bool"],
        typeField: `#${uniqueIdType}`,
      })
      .typedInput(
        "width",
        params.width ?? this.params.defaultTypeInputWidth ?? 310
      );

    return input;
  }

  public createTextInput(params: NodeEditorFormBuilderInputParams): JQuery {
    const uniqueId = this.uniqueId(params.id);
    const formRow = this.createFormRowWithLabel(
      uniqueId,
      params.label,
      params.icon
    );
    const input = $("<input/>", {
      id: uniqueId,
      type: "text",
      class: params.id,
    }).appendTo(formRow);

    if (params.value) {
      input.val(params.value as string);
    }

    return input;
  }

  public createNumberInput(params: NodeEditorFormBuilderInputParams): JQuery {
    const uniqueId = this.uniqueId(params.id);
    const formRow = this.createFormRowWithLabel(
      uniqueId,
      params.label,
      params.icon
    );
    const input = $("<input/>", {
      id: uniqueId,
      type: "number",
      class: params.id,
    }).appendTo(formRow);

    if (params.value) {
      input.val(params.value as number);
    }

    return input;
  }

  public createCheckboxInput(params: NodeEditorFormBuilderInputParams): JQuery {
    const uniqueId = this.uniqueId(params.id);
    const formRow = this.createFormRowWithLabel(
      uniqueId,
      params.label,
      params.icon
    );
    const input = $("<input/>", {
      id: uniqueId,
      type: "checkbox",
      class: params.id,
    }).appendTo(formRow);

    if (params.value) {
      input.prop("checked", true);
    }

    return input;
  }

  public createSelectInput(params: NodeEditorFormBuilderSelectParams): JQuery {
    const uniqueId = this.uniqueId(params.id);
    const formRow = this.createFormRowWithLabel(
      uniqueId,
      params.label,
      params.icon
    );
    const select = $("<select/>", { id: uniqueId, class: params.id }).appendTo(
      formRow
    );

    params.options.forEach((option) => {
      const optionText =
        typeof option === "string"
          ? this.params.translate(
              `${this.params.translatePrefix}.select.${params.label}.${option}`
            )
          : option.label;

      const optionValue = typeof option === "string" ? option : option.value;

      $("<option/>", {
        value: optionValue,
        text: optionText,
      }).appendTo(select);
    });

    if (params.value) {
      select.val(params.value as string);
    }

    return select;
  }

  private createFormRowWithLabel(
    id: string,
    label: string,
    icon?: string
  ): JQuery {
    const formRow = this.createFormRow();

    const labelTag = $("<label/>", {
      for: id,
      text: this.params.translate(
        `${this.params.translatePrefix}.label.${label}`
      ),
    }).appendTo(formRow);

    if (icon) {
      labelTag.prepend(" ").prepend($("<i/>", { class: `fa fa-${icon}` }));
    }

    return formRow;
  }

  private createFormRow(): JQuery {
    return $("<div/>", { class: "form-row" }).appendTo(this.container);
  }

  private uniqueId(prefix: string): string {
    if (!this.params.createUniqueIds) {
      return prefix;
    }

    if (this.uniqueIdCounters.hasOwnProperty(prefix)) {
      this.uniqueIdCounters[prefix] += 1;
    } else {
      this.uniqueIdCounters[prefix] = 0;
    }

    return `${prefix}-${this.uniqueIdCounters[prefix]}`;
  }
}
