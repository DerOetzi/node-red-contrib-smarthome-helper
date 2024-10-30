import {
  BaseNodeConfig,
  BaseNodeEditorProperties,
} from "../../flowctrl/base/types";

export interface LogicalOpNodeConfig extends BaseNodeConfig {
  logical: string;
  minMsgCount: number;
}

export const defaultLogicalOpNodeConfig: Partial<LogicalOpNodeConfig> = {
  logical: "and",
  minMsgCount: 1,
};

export interface LogicalOpNodeEditorProperties
  extends BaseNodeEditorProperties {
  logical: string;
  minMsgCount: number;
}
