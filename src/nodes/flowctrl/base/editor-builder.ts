import { TimeIntervalUnit } from "../../../helpers/time.helper";
import { i18n } from "./editor-node";
import {
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

export class NodeEditorFormBuilder {
  private readonly uniqueIdCounters: Record<string, number> = {};

  constructor(
    private container: JQuery,
    private readonly params: NodeEditorFormBuilderParams,
  ) {}

  public newContainer(container: JQuery) {
    this.container = container;
  }

  public line(): JQuery {
    return $("<hr/>").appendTo(this.container);
  }

  public subHeader(key: string): JQuery {
    const text = i18n(`${this.params.translatePrefix}.section.${key}`);
    return $("<div/>", { class: "form-row" })
      .append(
        $("<label/>", { style: "font-weight: bold; width: 100%;" }).text(text),
      )
      .appendTo(this.container);
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
    params: NodeEditorFormBuilderTypedInputParams,
  ): JQuery {
    const input = this.createTextInput(params);

    const uniqueIdType = this.uniqueId(params.idType);
    const inputType = $("<input/>", {
      id: uniqueIdType,
      type: "hidden",
      class: params.idType,
    })
      .data("id", params.idType)
      .appendTo(input.parent());

    inputType.val(params.valueType ?? "str");

    input
      .typedInput({
        types: params.types ?? ["msg", "str", "num", "bool"],
        typeField: `#${uniqueIdType}`,
      })
      .typedInput(
        "width",
        params.width ?? this.params.defaultTypeInputWidth ?? 310,
      );

    return input;
  }

  public createAutocompleteInput(
    params: NodeEditorFormBuilderAutocompleteInputParams,
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
    params: NodeEditorFormBuilderNumberInputParams,
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
        input.attr(attr, (params as any)[attr] as number);
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
        let optionText: string;

        if (typeof option === "string") {
          optionText = i18n(
            `${optionTranslatePrefix}.field.${params.label}.options.${option}`,
          );
        } else {
          optionText = option.label;
        }

        const optionValue = typeof option === "string" ? option : option.value;

        $("<option/>", {
          value: optionValue,
          text: optionText,
        }).appendTo(select);
      },
    );

    if (params.value) {
      select.val(params.value as string);
    }

    return select;
  }

  public createHiddenInput(
    params: NodeEditorFormBuilderHiddenInputParams,
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
    params: NodeEditorFormBuilderInputParams,
  ): JQuery {
    const formRow = this.createFormRow();
    const labelTranslatePrefix =
      params.translateLabelPrefix ??
      params.translatePrefix ??
      this.params.translatePrefix;

    let text = i18n(`${labelTranslatePrefix}.field.${params.label}.label`);

    if (params.labelPlaceholders) {
      text = text.replace(/\{\{(\w+)\}\}/g, (_, key) => {
        return params.labelPlaceholders![key] || "";
      });
    }

    const labelTag = $("<label/>", {
      for: id,
      text,
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

export abstract class NodeEditorFormEditableList<T> {
  protected listContainer?: JQuery;
  protected rowBuilder?: NodeEditorFormBuilder;
  protected headerPrefix?: string;

  public initialize(
    id: string,
    items: T[],
    rowBuilderParams: NodeEditorFormBuilderParams,
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
          $("<label>").text(i18n(`${headerPrefix}.${id}`)),
        ),
        addItem: (rowContainer: JQuery, idx: number, data: T) => {
          rowContainer.css({
            overflow: "hidden",
            whiteSpace: "nowrap",
          });

          this.rowBuilder!.newContainer(rowContainer);

          this.addItem(data, idx);
          this.emitChange();
        },
        removeItem: () => {
          this.emitChange();
        },
      })
      .editableList("addItems", (items as any) ?? []);

    return this;
  }

  private emitChange(): void {
    this.listContainer?.trigger("change");
  }

  protected abstract addItem(data: T, idx?: number): void;

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
              (record as any)[key] = $input.val() as string;
            }
            return record;
          },
          { ...defaults } as T,
        );
    });
  }

  public toggle(toggle: boolean): this {
    this.listContainer?.closest(".red-ui-editableList").toggle(toggle);
    return this;
  }
}
