import { EditorMetadata } from "../../types";

// eslint-disable-next-line no-unused-vars
export type I18nTranslator = (term: string) => string;

type OutputData = { key: string; label: string; description: string };
type FieldData = { label: string; description: string };

/**
 * Generates Node-RED help HTML based on explicit editor metadata.
 */
export function generateNodeHelp(
  nodeType: string,
  editorDef: any,
  localePrefix: string,
  translate: I18nTranslator,
  metadata?: EditorMetadata,
): string {
  if (!nodeType || !metadata) {
    return "";
  }

  const resolvedLocalePrefix = metadata.localePrefix || localePrefix;
  const sections: string[] = [];

  appendDescriptionSection(sections, resolvedLocalePrefix, translate);

  const inputKeys = metadata.inputKeys ?? [];
  const fieldKeys = metadata.fieldKeys ?? [];
  const outputKeys = metadata.outputKeys ?? [];

  appendInputSection(
    sections,
    inputKeys,
    resolvedLocalePrefix,
    translate,
    metadata.inputMode === "matcher-topic",
  );

  const outputs = collectOutputs(
    editorDef,
    outputKeys,
    resolvedLocalePrefix,
    translate,
  );
  appendOutputSection(sections, outputs, translate);

  const fields = collectFields(fieldKeys, resolvedLocalePrefix, translate);
  appendDetailsSection(sections, fields, translate);

  return sections.join("\n");
}

function appendDescriptionSection(
  sections: string[],
  localePrefix: string,
  translate: I18nTranslator,
): void {
  const description = translate(`${localePrefix}.description`);
  if (description && description !== `${localePrefix}.description`) {
    sections.push(`<p>${escapeHtml(description)}</p>`);
  }
}

function appendInputSection(
  sections: string[],
  inputKeys: string[],
  localePrefix: string,
  translate: I18nTranslator,
  isMatchJoinNode: boolean,
): void {
  if (inputKeys.length === 0) {
    return;
  }

  const inputEntries = inputKeys
    .map((key) => {
      const preferredName = translate(`${localePrefix}.input.${key}.name`);
      const name =
        preferredName === `${localePrefix}.input.${key}.name`
          ? labelFromKey(key)
          : preferredName;

      const inputDesc = translate(`${localePrefix}.input.${key}.description`);
      const descriptionMarkup =
        inputDesc === `${localePrefix}.input.${key}.description`
          ? ""
          : `<dd>${escapeHtml(inputDesc)}</dd>`;

      const matcherHint = `msg.topic == "${key}"`;
      const propertyType = isMatchJoinNode
        ? `matcher target (${escapeHtml(matcherHint)})`
        : `msg.${escapeHtml(key)}`;

      return [
        `<dt>${escapeHtml(name)}<span class="property-type">${propertyType}</span></dt>`,
        descriptionMarkup,
      ].join("\n");
    })
    .filter(Boolean);

  if (inputEntries.length === 0) {
    return;
  }

  sections.push(
    [
      `<h3>${translate("common.help.inputs")}</h3>`,
      '<dl class="message-properties">',
      inputEntries.join("\n"),
      "</dl>",
    ].join("\n"),
  );
}

function collectOutputs(
  editorDef: any,
  outputKeys: string[],
  localePrefix: string,
  translate: I18nTranslator,
): OutputData[] {
  if (outputKeys.length === 0) {
    return [];
  }

  return outputKeys.map((key, index) => {
    const preferredLabel = translate(`${localePrefix}.output.${key}.name`);
    const fallbackLabel = labelFromKey(key);
    const labelFromLocale =
      preferredLabel === `${localePrefix}.output.${key}.name`
        ? fallbackLabel
        : preferredLabel;

    let label = labelFromLocale;
    if (typeof editorDef?.outputLabels === "function") {
      try {
        const rawLabel = editorDef.outputLabels.call({}, index);
        if (rawLabel && !isUnresolvedI18nToken(rawLabel)) {
          label = String(rawLabel);
        }
      } catch (error) {
        console.debug("Error while collecting output labels:", error);
      }
    }

    const description = translate(`${localePrefix}.output.${key}.description`);
    return {
      key,
      label,
      description:
        description === `${localePrefix}.output.${key}.description`
          ? ""
          : description,
    };
  });
}

function appendOutputSection(
  sections: string[],
  outputs: OutputData[],
  translate: I18nTranslator,
): void {
  if (outputs.length === 0) {
    return;
  }

  sections.push(`<h3>${translate("common.help.outputs")}</h3>`);

  if (outputs.length === 1) {
    const output = outputs[0];
    const descriptionMarkup = output.description
      ? `\n<dd>${escapeHtml(output.description)}</dd>`
      : "";

    sections.push(
      [
        '<dl class="message-properties">',
        `<dt>${escapeHtml(output.label)}<span class="property-type">msg.${escapeHtml(output.key)}</span></dt>${descriptionMarkup}`,
        "</dl>",
      ].join("\n"),
    );
    return;
  }

  const outputItems = outputs
    .map((output) => {
      const descriptionMarkup = output.description
        ? `<span class="property-type">${escapeHtml(output.description)}</span>`
        : "";

      return [
        `<li>${escapeHtml(output.label)}`,
        '<dl class="message-properties">',
        `<dt>${escapeHtml(output.key)}${descriptionMarkup}</dt>`,
        "</dl>",
        "</li>",
      ].join("\n");
    })
    .join("\n");

  sections.push(['<ol class="node-ports">', outputItems, "</ol>"].join("\n"));
}

function collectFields(
  fieldKeys: string[],
  localePrefix: string,
  translate: I18nTranslator,
): FieldData[] {
  return fieldKeys
    .map((fieldKey) => {
      const fieldLabel = translate(`${localePrefix}.field.${fieldKey}.label`);
      const fieldDesc = translate(
        `${localePrefix}.field.${fieldKey}.description`,
      );

      const label =
        fieldLabel === `${localePrefix}.field.${fieldKey}.label`
          ? labelFromKey(fieldKey)
          : fieldLabel;

      const description =
        fieldDesc === `${localePrefix}.field.${fieldKey}.description`
          ? ""
          : fieldDesc;

      return { label, description };
    })
    .filter((field) => field.description);
}

function appendDetailsSection(
  sections: string[],
  fields: FieldData[],
  translate: I18nTranslator,
): void {
  if (fields.length === 0) {
    return;
  }

  const details = fields.map(
    (field) =>
      `<p><strong>${escapeHtml(field.label)}:</strong> ${escapeHtml(field.description)}</p>`,
  );

  sections.push(
    `<h3>${translate("common.help.details")}</h3>\n${details.join("\n")}`,
  );
}

function isUnresolvedI18nToken(label: string): boolean {
  return (
    label.includes(":") ||
    label.startsWith("helper.") ||
    label.startsWith("flowctrl.") ||
    label.startsWith("logical.") ||
    label.startsWith("operator.")
  );
}

function labelFromKey(key: string): string {
  const withDelimiters = key.split("_").join(" ").split("-").join(" ");

  let withCamelSpacing = "";
  for (let i = 0; i < withDelimiters.length; i++) {
    const currentChar = withDelimiters[i];
    const previousChar = i > 0 ? withDelimiters[i - 1] : "";
    const isUpperAfterLower =
      currentChar >= "A" &&
      currentChar <= "Z" &&
      previousChar >= "a" &&
      previousChar <= "z";

    withCamelSpacing += isUpperAfterLower ? ` ${currentChar}` : currentChar;
  }

  if (!withCamelSpacing) {
    return "";
  }

  return withCamelSpacing[0].toUpperCase() + withCamelSpacing.slice(1);
}

function escapeHtml(text: string): string {
  if (!text) {
    return "";
  }

  return text
    .split("&")
    .join("&amp;")
    .split("<")
    .join("&lt;")
    .split(">")
    .join("&gt;")
    .split('"')
    .join("&quot;")
    .split("'")
    .join("&#039;");
}
