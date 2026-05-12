import { EditorNodeDef, EditorNodePropertiesDef, EditorRED } from "node-red";
import { EditorMetadata, EditorTemplateDiv } from "../../types";
import version from "../../../version";
import BaseNode from "./";
import { generateNodeHelp as generateNodeHelpFromDefinition } from "./help";
import {
  BaseEditorNodeProperties,
  BaseNodeOptions,
  BaseNodeOptionsDefaults,
} from "./types";
import { NodeEditorFormBuilder } from "./editor-builder";
import { i18n } from "./editor-i18n";
export {
  i18n,
  i18nOutputLabel,
  i18nInputLabel,
  i18nFieldDefault,
} from "./editor-i18n";

declare const RED: EditorRED;

export const BaseCommonElement = new EditorTemplateDiv("base-common-options");
export const BaseDebounceElement = new EditorTemplateDiv(
  "base-debounce-options",
);
export const BaseDebounceNoTopicElement = new EditorTemplateDiv(
  "base-debounce-options",
  { topic: "false" },
);
export const BaseStatusElement = new EditorTemplateDiv("base-status-options");

export const BaseEditorWithoutStatusTemplate = [
  BaseCommonElement,
  BaseDebounceElement,
];

export const BaseEditorTemplate = [
  ...BaseEditorWithoutStatusTemplate,
  BaseStatusElement,
];

export const BaseEditorMetadata: EditorMetadata = {
  localePrefix: "flowctrl.base",
  inputMode: "msg-property",
  fieldKeys: [
    "name",
    "topic",
    "filterUniquePayload",
    "newMsg",
    "debounce",
    "debounceTopic",
    "debounceShowStatus",
    "debounceTime",
    "debounceLeading",
    "debounceTrailing",
    "statusReportingEnabled",
    "statusItem",
    "statusTextItem",
  ],
  inputKeys: [],
  outputKeys: [],
};

export function generateNodeHelp(
  nodeType: string,
  editorDef: any,
  localePrefix: string,
  metadata?: EditorMetadata,
): string {
  return generateNodeHelpFromDefinition(
    nodeType,
    editorDef,
    localePrefix,
    i18n,
    metadata,
  );
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
      {} as Record<string, { value: any }>,
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
        }),
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
      { translatePrefix: "flowctrl.base" },
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

    debounceOptionsBuilder
      .createCheckboxInput({
        id: "node-input-debounceTopic",
        label: "debounceTopic",
        value: this.debounceTopic,
        icon: "tags",
      })
      .parent()
      .toggle(debounceOptions.data("topic") !== false);

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

export const InputEditorWithoutStatusTemplate = [
  BaseCommonElement,
  BaseDebounceNoTopicElement,
];

export const InputEditorTemplate = [
  ...InputEditorWithoutStatusTemplate,
  BaseStatusElement,
];
