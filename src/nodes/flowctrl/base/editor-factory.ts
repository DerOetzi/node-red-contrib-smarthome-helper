import { EditorNodeDef } from "node-red";
import {
  EditorMetadata,
  EditorTemplateDiv,
  EditorTemplateElement,
  EditorTemplateOl,
} from "../../types";
import {
  BaseEditorNodeProperties,
  BaseNodeOptions,
  NodeEditorBaseTemplate,
  NodeEditorExtraForm,
  NodeEditorFieldDefinition,
  NodeEditorListDefinition,
  NodeEditorListInstance,
} from "./types";
import { NodeEditorFormBuilder } from "./editor-builder";
import {
  BaseEditorTemplate,
  BaseEditorWithoutStatusTemplate,
  InputEditorTemplate,
  InputEditorWithoutStatusTemplate,
  createEditorDefaults,
  i18n,
  i18nFieldDefault,
  i18nOutputLabel,
} from "./editor-node";
import BaseEditorNode from "./editor-node";

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface EditorPrepareContext {
  getList(id: string): NodeEditorListInstance<any>;
  getField(key: string): JQuery;
  getFieldRow(key: string): JQuery;
}

export interface EditorSaveContext {
  getList(id: string): NodeEditorListInstance<any>;
}

export interface NodeEditorHooks<TProps extends BaseEditorNodeProperties> {
  oneditprepare?: (
    node: EditorNodeInstance<TProps>,
    ctx: EditorPrepareContext,
  ) => void;
  oneditsave?: (
    node: EditorNodeInstance<TProps>,
    ctx: EditorSaveContext,
  ) => void;
  label?: (node: EditorNodeInstance<TProps>) => string | undefined;
  outputLabels?: (
    node: EditorNodeInstance<TProps>,
    index: number,
  ) => string | undefined;
}

export interface NodeEditorDefinition<
  TOptions extends BaseNodeOptions = BaseNodeOptions,
  TProps extends BaseEditorNodeProperties = BaseEditorNodeProperties,
> {
  localePrefix: string;
  nodeClass: { NodeCategoryLabel: string; NodeColor: string };
  defaults: TOptions;
  icon: string;
  inputMode?: "msg-property" | "matcher-topic";
  fieldKeys?: string[];
  inputKeys?: string[];
  outputKeys?: string[];
  labelField?: string;
  labelSuffix?: string;
  lists?: NodeEditorListDefinition[];
  form?: {
    id: string;
    fields: NodeEditorFieldDefinition[];
    build?: (node: any) => void;
  };
  extraForms?: NodeEditorExtraForm[];
  baseTemplate?: NodeEditorBaseTemplate;
  hooks?: NodeEditorHooks<TProps>;
}

// ── Template + Metadata builders ──────────────────────────────────────────────

function getBaseTemplateElements(
  baseTemplate?: NodeEditorBaseTemplate,
): EditorTemplateElement[] {
  switch (baseTemplate) {
    case "full":
      return [...BaseEditorTemplate];
    case "without-status":
      return [...BaseEditorWithoutStatusTemplate];
    case "input-without-status":
      return [...InputEditorWithoutStatusTemplate];
    case "none":
      return [];
    case "input-only":
    default:
      return [...InputEditorTemplate];
  }
}

export function buildEditorTemplate(
  def: NodeEditorDefinition<any, any>,
): EditorTemplateElement[] {
  return [
    ...(def.lists?.map((l) => new EditorTemplateOl(l.id)) ?? []),
    ...(def.form ? [new EditorTemplateDiv(def.form.id)] : []),
    ...(def.extraForms?.map((f) => new EditorTemplateDiv(f.id)) ?? []),
    ...getBaseTemplateElements(def.baseTemplate),
  ];
}

export function buildEditorMetadata(
  def: NodeEditorDefinition<any, any>,
): EditorMetadata {
  const derivedFieldKeys =
    def.form?.fields
      .filter((f) => !!f.key && f.type !== "line" && f.type !== "subheader")
      .map((f) => f.key!) ?? [];
  return {
    localePrefix: def.localePrefix,
    inputMode: def.inputMode,
    fieldKeys: def.fieldKeys ?? derivedFieldKeys,
    inputKeys: def.inputKeys ?? [],
    outputKeys: def.outputKeys ?? [],
  };
}

// ── Private helpers ───────────────────────────────────────────────────────────

function fieldVisibility(
  fieldDef: NodeEditorFieldDefinition,
  rawVal: any,
): boolean {
  if (fieldDef.dependsOnValues) {
    return fieldDef.dependsOnValues.includes(String(rawVal));
  }
  if (fieldDef.dependsOnValue !== undefined) {
    return String(rawVal) === fieldDef.dependsOnValue;
  }
  return !!rawVal;
}

function buildFieldElement(
  builder: NodeEditorFormBuilder,
  fieldDef: NodeEditorFieldDefinition,
  node: any,
): JQuery | null {
  if (fieldDef.type === "line") {
    builder.line();
    return null;
  }
  if (fieldDef.type === "subheader") {
    if (fieldDef.section) {
      builder.subHeader(fieldDef.section);
    }
    return null;
  }
  if (!fieldDef.key) {
    return null;
  }

  const id = `node-input-${fieldDef.key}`;
  const value = node[fieldDef.key];

  switch (fieldDef.type) {
    case "text":
      return builder.createTextInput({
        id,
        label: fieldDef.key,
        value,
        icon: fieldDef.icon!,
      });
    case "number":
      return builder.createNumberInput({
        id,
        label: fieldDef.key,
        value,
        icon: fieldDef.icon!,
        min: fieldDef.min,
        max: fieldDef.max,
        step: fieldDef.step,
      });
    case "checkbox":
      return builder.createCheckboxInput({
        id,
        label: fieldDef.key,
        value,
        icon: fieldDef.icon!,
      });
    case "select":
      return builder.createSelectInput({
        id,
        label: fieldDef.key,
        value: String(value ?? ""),
        icon: fieldDef.icon!,
        options: fieldDef.options!,
      });
    case "typed":
      return builder.createTypedInput({
        id,
        idType: fieldDef.idType ?? `node-input-${fieldDef.key}Type`,
        label: fieldDef.key,
        value: String(value ?? ""),
        valueType:
          fieldDef.valueType ??
          (node[`${fieldDef.key}Type`] as string) ??
          "str",
        icon: fieldDef.icon!,
        types: fieldDef.types,
      });
    case "time":
      return builder.createTimeInput({
        id,
        idType: fieldDef.idType ?? `node-input-${fieldDef.key}Unit`,
        label: fieldDef.key,
        value,
        valueType: node[fieldDef.valueTypeKey ?? `${fieldDef.key}Unit`],
        icon: fieldDef.icon!,
      });
    case "autocomplete":
      return builder.createAutocompleteInput({
        id,
        label: fieldDef.key,
        value: String(value ?? ""),
        icon: fieldDef.icon!,
        search: fieldDef.search!,
      });
    case "hidden":
      return builder.createHiddenInput({ id, value });
    default:
      return null;
  }
}

function wireChangeListeners(
  fields: NodeEditorFieldDefinition[],
  fieldElements: Map<string, JQuery>,
  fieldRowElements: Map<string, JQuery>,
  listInstances: Map<string, NodeEditorListInstance<any>>,
): void {
  const fieldByKey = new Map(
    fields.filter((f) => f.key).map((f) => [f.key!, f]),
  );

  const controllerToDependents = new Map<string, string[]>();
  fields.forEach((f) => {
    if (!f.key || !f.dependsOn) {
      return;
    }
    const deps = controllerToDependents.get(f.dependsOn) ?? [];
    deps.push(f.key);
    controllerToDependents.set(f.dependsOn, deps);
  });

  const allControllers = new Set([
    ...controllerToDependents.keys(),
    ...fields.filter((f) => f.showsListTarget && f.key).map((f) => f.key!),
  ]);

  allControllers.forEach((controllerKey) => {
    const controllerElem = fieldElements.get(controllerKey);
    if (!controllerElem) {
      return;
    }

    const deps = controllerToDependents.get(controllerKey) ?? [];
    const listTarget = fieldByKey.get(controllerKey)?.showsListTarget;

    controllerElem.on("change", function () {
      const rawVal = $(this).val();
      deps.forEach((depKey) => {
        const depField = fieldByKey.get(depKey);
        if (depField) {
          fieldRowElements
            .get(depKey)
            ?.toggle(fieldVisibility(depField, rawVal));
        }
      });
      if (listTarget) {
        listInstances
          .get(listTarget.listId)
          ?.removeTarget?.($(this).is(":checked"), listTarget.target);
      }
    });
  });
}

function initializeLists(
  def: NodeEditorDefinition<any, any>,
  node: any,
  listInstances: Map<string, NodeEditorListInstance<any>>,
): void {
  def.lists?.forEach((listDef) => {
    const instance = listDef.create();
    listInstances.set(listDef.id, instance);
    instance.initialize(listDef.id, node[listDef.dataKey], {
      translatePrefix: listDef.rowTranslatePrefix ?? "flowctrl.match-join",
    });
  });
}

function applyFormFields(
  formId: string,
  fields: NodeEditorFieldDefinition[],
  localePrefix: string,
  node: any,
  fieldElements: Map<string, JQuery>,
  fieldRowElements: Map<string, JQuery>,
  listInstances: Map<string, NodeEditorListInstance<any>>,
): void {
  const builder = new NodeEditorFormBuilder($(`#${formId}`), {
    translatePrefix: localePrefix,
  });

  fields.forEach((fieldDef) => {
    const elem = buildFieldElement(builder, fieldDef, node);
    if (elem && fieldDef.key) {
      fieldElements.set(fieldDef.key, elem);
      fieldRowElements.set(fieldDef.key, elem.parent());
    }
  });

  fields.forEach((fieldDef) => {
    if (!fieldDef.key) {
      return;
    }
    if (fieldDef.dependsOn) {
      fieldRowElements
        .get(fieldDef.key)
        ?.toggle(fieldVisibility(fieldDef, node[fieldDef.dependsOn]));
    }
    if (fieldDef.showsListTarget) {
      const { listId, target } = fieldDef.showsListTarget;
      listInstances.get(listId)?.showHideTarget?.(!!node[fieldDef.key], target);
    }
  });

  wireChangeListeners(fields, fieldElements, fieldRowElements, listInstances);
}

// ── Factory ───────────────────────────────────────────────────────────────────

import { EditorNodeInstance } from "node-red";

export function buildEditorNodeDef<
  TOptions extends BaseNodeOptions,
  TProps extends BaseEditorNodeProperties,
>(def: NodeEditorDefinition<TOptions, TProps>): EditorNodeDef<TProps> {
  const listInstances = new Map<string, NodeEditorListInstance<any>>();
  const fieldElements = new Map<string, JQuery>();
  const fieldRowElements = new Map<string, JQuery>();

  const hasOnadd = !!def.form?.fields.some((f) => f.i18nDefault && f.key);

  return {
    category: def.nodeClass.NodeCategoryLabel,
    color: def.nodeClass.NodeColor,
    icon: def.icon,
    defaults: createEditorDefaults<TOptions, TProps>(def.defaults),
    inputs: def.defaults.inputs,
    outputs: def.defaults.outputs,

    label: function () {
      if (def.hooks?.label) {
        const result = def.hooks.label(this);
        if (result !== undefined) {
          return result;
        }
      }
      const labelField = def.labelField ?? "name";
      const mainLabel = ((this as any)[labelField] as string)?.trim();
      if (!def.labelSuffix) {
        return mainLabel || i18n(`${def.localePrefix}.name`);
      }
      const suffix = i18n(
        `${def.localePrefix}.field.${def.labelSuffix}.options.${(this as any)[def.labelSuffix]}`,
      );
      return mainLabel ? `${mainLabel} (${suffix})` : suffix;
    },

    ...(def.outputKeys?.length
      ? {
          outputLabels: function (index: number) {
            if (def.hooks?.outputLabels) {
              const result = def.hooks.outputLabels(this, index);
              if (result !== undefined) {
                return result;
              }
            }
            return def.outputKeys![index]
              ? i18nOutputLabel(def.localePrefix, def.outputKeys![index])
              : undefined;
          },
        }
      : {}),

    ...(hasOnadd
      ? {
          onadd: function () {
            def
              .form!.fields.filter((f) => f.i18nDefault && f.key)
              .forEach((f) => {
                (this as any)[f.key!] = i18nFieldDefault(
                  def.localePrefix,
                  f.key!,
                );
              });
          },
        }
      : {}),

    oneditprepare: function () {
      BaseEditorNode.oneditprepare!.call(this);

      listInstances.clear();
      fieldElements.clear();
      fieldRowElements.clear();

      initializeLists(def, this, listInstances);

      if (def.form) {
        if (def.form.build) {
          def.form.build(this);
        } else {
          applyFormFields(
            def.form.id,
            def.form.fields,
            def.localePrefix,
            this,
            fieldElements,
            fieldRowElements,
            listInstances,
          );
        }
      }

      def.extraForms?.forEach((extraForm) => {
        if (extraForm.build) {
          extraForm.build(this);
        }
      });

      if (def.hooks?.oneditprepare) {
        const ctx: EditorPrepareContext = {
          getList: (id) => listInstances.get(id)!,
          getField: (key) => fieldElements.get(key)!,
          getFieldRow: (key) => fieldRowElements.get(key)!,
        };
        def.hooks.oneditprepare(this, ctx);
      }
    },

    oneditsave: function () {
      const byDataKey = new Map<string, any[]>();
      def.lists?.forEach((listDef) => {
        const instance = listInstances.get(listDef.id);
        if (!instance) {
          return;
        }
        const existing = byDataKey.get(listDef.dataKey) ?? [];
        byDataKey.set(listDef.dataKey, [...existing, ...instance.values()]);
      });
      byDataKey.forEach((values, key) => {
        (this as any)[key] = values;
      });

      if (def.hooks?.oneditsave) {
        const ctx: EditorSaveContext = {
          getList: (id) => listInstances.get(id)!,
        };
        def.hooks.oneditsave(this, ctx);
      }
    },
  };
}
