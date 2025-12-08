import { EditorNodeDef, EditorNodePropertiesDef, EditorRED } from "node-red";
import { TimeIntervalUnit } from "../../../helpers/time.helper";
import version from "../../../version";
import BaseNode from "./";
import {
  BaseEditorNodeProperties,
  BaseNodeOptions,
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

/**
 * Helper function to get output label.
 * Uses structure: output.X.name
 */
export function i18nOutputLabel(prefix: string, outputKey: string): string {
  return i18n(`${prefix}.output.${outputKey}.name`);
}

/**
 * Helper function to get input label.
 * Uses structure: input.X.name
 */
export function i18nInputLabel(prefix: string, inputKey: string): string {
  return i18n(`${prefix}.input.${inputKey}.name`);
}

/**
 * Helper function to get field default value.
 * Uses structure: field.X.default
 */
export function i18nFieldDefault(prefix: string, fieldKey: string): string {
  return i18n(`${prefix}.field.${fieldKey}.default`);
}

/**
 * Generates Node-RED help HTML dynamically by introspecting the node's editor definition.
 * This calls outputLabels and observes oneditprepare to discover what the node actually uses.
 */
export function generateNodeHelp(
  nodeType: string,
  editorDef: any,
  localePrefix: string
): string {
  const sections: string[] = [];

  // Main description
  const description = i18n(`${localePrefix}.description`);
  if (description && description !== `${localePrefix}.description`) {
    sections.push(`<p>${escapeHtml(description)}</p>`);
  }

  // Collect outputs by calling outputLabels
  const outputCount = editorDef.outputs || 0;
  const outputLabelsData: Array<{ index: number; label: string; key: string }> =
    [];

  if (outputCount > 0 && typeof editorDef.outputLabels === "function") {
    for (let i = 0; i < outputCount; i++) {
      try {
        const label = editorDef.outputLabels.call({}, i);
        if (label) {
          // Try to extract the key from the label by reverse lookup
          const key = extractOutputKey(label, localePrefix);
          outputLabelsData.push({ index: i, label, key });
        }
      } catch (e) {
        // Ignore errors
      }
    }
  }

  // Collect input/field information by observing FormBuilder
  const formFields: Array<{ key: string; label: string; description: string }> =
    [];
  const inputKeys: Set<string> = new Set();

  // Try to discover inputs and fields by calling oneditprepare in a mock context
  if (typeof editorDef.oneditprepare === "function") {
    const mockContext = createMockNodeContext(localePrefix, formFields, inputKeys);
    try {
      editorDef.oneditprepare.call(mockContext);
    } catch (e) {
      // Ignore errors from mock execution
    }
  }

  // Generate Inputs section from discovered inputs
  if (inputKeys.size > 0) {
    sections.push("<h3>" + i18n("common.help.inputs") + "</h3>");
    sections.push('<dl class="message-properties">');

    inputKeys.forEach((key) => {
      const inputName = i18n(`${localePrefix}.input.${key}.name`);
      const inputDesc = i18n(`${localePrefix}.input.${key}.description`);
      if (inputName !== `${localePrefix}.input.${key}.name`) {
        sections.push(`<dt>${escapeHtml(inputName)}`);
        sections.push(
          `<span class="property-type">msg.${escapeHtml(key)}</span>`
        );
        sections.push("</dt>");
        sections.push(`<dd>${escapeHtml(inputDesc)}</dd>`);
      }
    });

    sections.push("</dl>");
  }

  // Generate Outputs section from discovered outputs
  if (outputLabelsData.length > 0) {
    sections.push("<h3>" + i18n("common.help.outputs") + "</h3>");

    if (outputLabelsData.length === 1) {
      const output = outputLabelsData[0];
      const outputDesc = i18n(`${localePrefix}.output.${output.key}.description`);
      sections.push('<dl class="message-properties">');
      sections.push(`<dt>${escapeHtml(output.label)}`);
      sections.push(
        `<span class="property-type">msg.${escapeHtml(output.key)}</span>`
      );
      sections.push("</dt>");
      if (outputDesc !== `${localePrefix}.output.${output.key}.description`) {
        sections.push(`<dd>${escapeHtml(outputDesc)}</dd>`);
      }
      sections.push("</dl>");
    } else {
      // Multiple outputs
      sections.push('<ol class="node-ports">');
      outputLabelsData.forEach((output) => {
        const outputDesc = i18n(`${localePrefix}.output.${output.key}.description`);
        sections.push(`<li>${escapeHtml(output.label)}`);
        sections.push('<dl class="message-properties">');
        sections.push(`<dt>${escapeHtml(output.key)}`);
        if (outputDesc !== `${localePrefix}.output.${output.key}.description`) {
          sections.push(
            `<span class="property-type">${escapeHtml(outputDesc)}</span>`
          );
        }
        sections.push("</dt>");
        sections.push("</dl>");
        sections.push("</li>");
      });
      sections.push("</ol>");
    }
  }

  // Generate Details section from discovered fields
  if (formFields.length > 0) {
    sections.push("<h3>" + i18n("common.help.details") + "</h3>");
    formFields.forEach((field) => {
      if (field.description) {
        sections.push(
          `<p><strong>${escapeHtml(field.label)}:</strong> ${escapeHtml(field.description)}</p>`
        );
      }
    });
  }

  return sections.join("\n");
}

/**
 * Creates a mock node context that captures form field creation
 */
function createMockNodeContext(
  localePrefix: string,
  formFields: Array<{ key: string; label: string; description: string }>,
  inputKeys: Set<string>
): any {
  // Mock context with empty properties
  const mockContext: any = {};

  // Try to capture input keys from common input properties
  const commonInputProps = ["payload", "topic", "gate", "pause", "motion", "command"];
  commonInputProps.forEach((prop) => {
    const inputName = i18n(`${localePrefix}.input.${prop}.name`);
    if (inputName !== `${localePrefix}.input.${prop}.name`) {
      inputKeys.add(prop);
    }
  });

  return mockContext;
}

/**
 * Tries to extract the output key from the label by doing a reverse i18n lookup
 */
function extractOutputKey(label: string, localePrefix: string): string {
  // Common output keys to try
  const commonKeys = ["message", "result", "status", "action", "payload", "true", "false"];

  for (const key of commonKeys) {
    const expectedLabel = i18n(`${localePrefix}.output.${key}.name`);
    if (expectedLabel === label) {
      return key;
    }
  }

  // Default to the label itself if no match
  return label.toLowerCase().replace(/\s+/g, "_");
}

/**
 * Escapes HTML special characters
 */
function escapeHtml(text: string): string {
  if (!text) return "";
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
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
      .appendTo(input.parent());

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
            `${optionTranslatePrefix}.field.${params.label}.options.${option}`
          );
        } else {
          optionText = option.label;
        }

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

  protected addItem(data: T, idx?: number): void {
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
              (record as any)[key] = $input.val() as string;
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

export function createEditorDefaults<
  T extends BaseNodeOptions = BaseNodeOptions,
  U extends BaseEditorNodeProperties = BaseEditorNodeProperties,
>(defaults: T): EditorNodePropertiesDef<U> {
  return {
    ...Object.keys(defaults).reduce(
      (acc: Record<string, { value: any }>, key) => {
        acc[key] = { value: (defaults as any)[key] };
        return acc;
      },
      {} as Record<string, { value: any }>
    ),
  } as EditorNodePropertiesDef<U>;
}

const BaseEditorNode: EditorNodeDef<BaseEditorNodeProperties> = {
  category: BaseNode.NodeCategoryLabel,
  color: BaseNode.NodeColor,
  icon: "font-awesome/fa-cogs",
  defaults: createEditorDefaults(BaseNodeOptionsDefaults),
  label: function () {
    return this.name?.trim() ? this.name.trim() : i18n("flowctrl.base.name");
  },
  inputs: BaseNodeOptionsDefaults.inputs,
  outputs: BaseNodeOptionsDefaults.outputs,
  oneditprepare: function () {
    const baseOptions = $("#base-common-options");

    if (this.migrated) {
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
      value: this.name,
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

    const statusOptionsBuilder = new NodeEditorFormBuilder(
      $("#base-status-options"),
      {
        translatePrefix: "flowctrl.base",
      }
    );

    const statusReportingEnabledCheckbox =
      statusOptionsBuilder.createCheckboxInput({
        id: "node-input-statusReportingEnabled",
        label: "statusReportingEnabled",
        value: this.statusReportingEnabled,
        icon: "bullhorn",
      });

    const statusItemRow = statusOptionsBuilder
      .createTextInput({
        id: "node-input-statusItem",
        label: "statusItem",
        value: this.statusItem,
        icon: "list",
      })
      .parent()
      .toggle(this.statusReportingEnabled);

    const statusTextItemRow = statusOptionsBuilder
      .createTextInput({
        id: "node-input-statusTextItem",
        label: "statusTextItem",
        value: this.statusTextItem,
        icon: "comment",
      })
      .parent()
      .toggle(this.statusReportingEnabled);

    statusReportingEnabledCheckbox.on("change", function () {
      const isStatusReportingEnabled = $(this).is(":checked");
      statusItemRow.toggle(isStatusReportingEnabled);
      statusTextItemRow.toggle(isStatusReportingEnabled);
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
