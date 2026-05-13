import { i18n, NodeEditorDefinition } from "../../flowctrl/base/editor";
import { EditorNodeInstance } from "node-red";
import HysteresisSwitchNode from ".";
import { buildSwitchFormContent } from "../switch/editor";
import {
  HysteresisSwitchEditorNodeProperties,
  HysteresisSwitchNodeOptionsDefaults,
} from "./types";

export const HysteresisSwitchEditorDef: NodeEditorDefinition<
  typeof HysteresisSwitchNodeOptionsDefaults,
  HysteresisSwitchEditorNodeProperties
> = {
  localePrefix: "logical.hysteresis-switch",
  nodeClass: HysteresisSwitchNode,
  defaults: HysteresisSwitchNodeOptionsDefaults,
  icon: "font-awesome/fa-toggle-on",
  inputMode: "msg-property",
  fieldKeys: ["upperThreshold", "lowerThreshold", "initialState"],
  outputKeys: [],
  form: {
    id: "hysteresis-switch-options",
    fields: [
      {
        type: "number",
        key: "lowerThreshold",
        icon: "arrow-down",
        min: -Infinity,
        max: Infinity,
        step: 0.1,
      },
      {
        type: "number",
        key: "upperThreshold",
        icon: "arrow-up",
        min: -Infinity,
        max: Infinity,
        step: 0.1,
      },
      { type: "checkbox", key: "initialState", icon: "toggle-on" },
    ],
  },
  extraForms: [{ id: "logical-switch-options", build: buildSwitchFormContent }],
  baseTemplate: "without-status",
  hooks: {
    label(node: EditorNodeInstance<HysteresisSwitchEditorNodeProperties>) {
      const baseName = i18n("logical.hysteresis-switch.name");
      return node.name ? `${node.name} (${baseName})` : baseName;
    },
  },
};
