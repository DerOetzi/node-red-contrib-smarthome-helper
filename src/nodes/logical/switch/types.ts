import {
  BaseNodeConfig,
  BaseNodeEditorProperties,
} from "../../flowctrl/base/types";

export interface SwitchNodeConfig extends BaseNodeConfig {}

export const defaultSwitchNodeConfig: Partial<SwitchNodeConfig> = {};

export interface SwitchNodeEditorProperties extends BaseNodeEditorProperties {}
