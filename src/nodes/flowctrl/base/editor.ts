import { EditorNodeDef, EditorRED } from "node-red";
import { TimeIntervalUnit } from "../../../helpers/time.helper";
import version from "../../../version";
import BaseNode from "./";
import { baseMigration } from "./migration";
import {
  BaseEditorNodeProperties,
  BaseEditorNodePropertiesDefaults,
  BaseNodeOptionsDefaults,
  NodeEditorFormBuilderAutocompleteInputParams,
  NodeEditorFormBuilderHiddenInputParams,
  NodeEditorFormBuilderInputParams,
  NodeEditorFormBuilderNumberInputParams,
  NodeEditorFormBuilderParams,
  NodeEditorFormBuilderSelectOption,
  NodeEditorFormBuilderSelectParams,
  NodeEditorFormBuilderTimeInputParams,
  NodeEditorFormBuilderTypedInputParams,
} from "./types";

declare const RED: EditorRED;

export function i18n(term: string): string {
  const namespace = "@deroetzi/node-red-contrib-smarthome-helper/all";
  return RED._(`${namespace}:${term}`);
}

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
      types: Object.values(TimeIntervalUnit).map((unit: string) => ({
        value: unit,
        label: unit,
        validate: /^\d+$/,
      })),
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
    })
      .data("id", params.idType)
      .appendTo(input.parent() as JQuery);

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

  public createAutocompleteInput(
    params: NodeEditorFormBuilderAutocompleteInputParams
  ): JQuery {
    const input = this.createTextInput(params);

    (input as any).autoComplete({
      search: params.search,
    });

    return input;
  }

  public createTextInput(params: NodeEditorFormBuilderInputParams): JQuery {
    const uniqueId = this.uniqueId(params.id);
    const formRow = this.createFormRowWithLabel(uniqueId, params);
    const input = $("<input/>", {
      id: uniqueId,
      type: "text",
      class: params.id,
    })
      .data("id", params.id)
      .appendTo(formRow);

    if (params.hasOwnProperty("value")) {
      let value = params.value as string;
      if (typeof value === "string" && value.startsWith("i18n:")) {
        value = i18n(value.substring(5));
      }

      input.val(value);
    }

    return input;
  }

  public createNumberInput(
    params: NodeEditorFormBuilderNumberInputParams
  ): JQuery {
    const uniqueId = this.uniqueId(params.id);
    const formRow = this.createFormRowWithLabel(uniqueId, params);
    const input = $("<input/>", {
      id: uniqueId,
      type: "number",
      class: params.id,
    })
      .data("id", params.id)
      .appendTo(formRow);

    ["min", "max", "step", "value"].forEach((attr) => {
      if (params.hasOwnProperty(attr)) {
        input.attr(attr, params[attr] as number);
      }
    });

    return input;
  }

  public createCheckboxInput(params: NodeEditorFormBuilderInputParams): JQuery {
    const uniqueId = this.uniqueId(params.id);
    const formRow = this.createFormRowWithLabel(uniqueId, params);
    const input = $("<input/>", {
      id: uniqueId,
      type: "checkbox",
      class: params.id,
    })
      .data("id", params.id)
      .appendTo(formRow);

    if (params.value) {
      input.prop("checked", true);
    }

    return input;
  }

  public createSelectInput(params: NodeEditorFormBuilderSelectParams): JQuery {
    const uniqueId = this.uniqueId(params.id);
    const formRow = this.createFormRowWithLabel(uniqueId, params);
    const select = $("<select/>", { id: uniqueId, class: params.id })
      .data("id", params.id)
      .appendTo(formRow);

    const optionTranslatePrefix =
      params.translatePrefix ?? this.params.translatePrefix;

    params.options.forEach(
      (option: string | NodeEditorFormBuilderSelectOption) => {
        const optionText =
          typeof option === "string"
            ? i18n(`${optionTranslatePrefix}.select.${params.label}.${option}`)
            : option.label;

        const optionValue = typeof option === "string" ? option : option.value;

        $("<option/>", {
          value: optionValue,
          text: optionText,
        }).appendTo(select);
      }
    );

    if (params.value) {
      select.val(params.value as string);
    }

    return select;
  }

  public createHiddenInput(
    params: NodeEditorFormBuilderHiddenInputParams
  ): JQuery {
    const uniqueId = this.uniqueId(params.id);
    const input = $("<input/>", {
      id: uniqueId,
      type: "hidden",
      class: params.id,
    })
      .data("id", params.id)
      .appendTo(this.container);

    return input;
  }

  private createFormRowWithLabel(
    id: string,
    params: NodeEditorFormBuilderInputParams
  ): JQuery {
    const formRow = this.createFormRow();
    const labelTranslatePrefix =
      params.translateLabelPrefix ??
      params.translatePrefix ??
      this.params.translatePrefix;

    const labelTag = $("<label/>", {
      for: id,
      text: i18n(`${labelTranslatePrefix}.label.${params.label}`),
    }).appendTo(formRow);

    labelTag.prepend(" ").prepend($("<i/>", { class: `fa fa-${params.icon}` }));

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

export class NodeEditorFormEditableList<T> {
  protected listContainer?: JQuery;
  protected rowBuilder?: NodeEditorFormBuilder;
  protected headerPrefix?: string;

  public initialize(
    id: string,
    items: T[],
    rowBuilderParams: NodeEditorFormBuilderParams
  ): this {
    this.listContainer = $(`#${id}`);

    this.rowBuilder = new NodeEditorFormBuilder($("<div/>"), {
      defaultTypeInputWidth: 280,
      ...rowBuilderParams,
      createUniqueIds: true,
    });

    const headerPrefix = this.headerPrefix ?? rowBuilderParams.translatePrefix;

    this.listContainer
      .editableList({
        addButton: true,
        removable: true,
        sortable: true,
        height: "auto",
        header: $("<div>").append(
          $("<label>").text(i18n(`${headerPrefix}.${id}`))
        ),
        addItem: (rowContainer: JQuery, _: number, data: T) => {
          rowContainer.css({
            overflow: "hidden",
            whiteSpace: "nowrap",
          });

          this.rowBuilder!.newContainer(rowContainer);

          this.addItem(data);
        },
      })
      .editableList("addItems", (items as any) || []);

    return this;
  }

  protected addItem(data: T): void {
    throw new Error("Not implemented");
  }

  public values(defaults?: Partial<T>): T[] {
    return Array.from(this.listContainer!.editableList("items")).map((item) => {
      return $(item)
        .find("input, select")
        .toArray()
        .reduce(
          (record, input) => {
            const $input = $(input);
            const key = $input.data("id");
            if (key) {
              record[key] = $input.val() as string;
            }
            return record;
          },
          { ...defaults } as T
        );
    });
  }

  public toggle(toggle: boolean): this {
    this.listContainer?.closest(".red-ui-editableList").toggle(toggle);
    return this;
  }
}

const BaseEditorNode: EditorNodeDef<BaseEditorNodeProperties> = {
  category: BaseNode.NodeCategoryLabel,
  color: BaseNode.NodeColor,
  icon: "font-awesome/fa-cogs",
  defaults: BaseEditorNodePropertiesDefaults,
  label: function () {
    return this.name || i18n("flowctrl.base.name");
  },
  inputs: BaseNodeOptionsDefaults.inputs,
  outputs: BaseNodeOptionsDefaults.outputs,
  oneditprepare: function () {
    const baseOptions = $("#base-common-options");

    if (this.migrated || baseMigration.checkAndMigrate(this)) {
      baseOptions.parent().prepend(
        $("<div/>", {
          text: i18n("flowctrl.base.migrated").replace("{version}", version),
          class: "migration-info",
        })
      );
      this.migrated = false;
      RED.editor.updateNodeProperties(this);
    }

    const commonOptionsBuilder = new NodeEditorFormBuilder(baseOptions, {
      translatePrefix: "flowctrl.base",
    });

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

export default BaseEditorNode;
