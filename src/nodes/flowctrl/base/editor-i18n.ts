import { EditorRED } from "node-red";

declare const RED: EditorRED;

export function i18n(term: string): string {
  const namespace = "@deroetzi/node-red-contrib-smarthome-helper/all";
  return RED._(`${namespace}:${term}`);
}

export function i18nOutputLabel(prefix: string, outputKey: string): string {
  return i18n(`${prefix}.output.${outputKey}.name`);
}

export function i18nInputLabel(prefix: string, inputKey: string): string {
  return i18n(`${prefix}.input.${inputKey}.name`);
}

export function i18nFieldDefault(prefix: string, fieldKey: string): string {
  return i18n(`${prefix}.field.${fieldKey}.default`);
}
