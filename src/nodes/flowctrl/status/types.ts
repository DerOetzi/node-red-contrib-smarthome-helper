import {
  BaseEditorNodeProperties,
  BaseEditorNodePropertiesDefaults,
  BaseNodeDef,
  BaseNodeOptions,
  BaseNodeOptionsDefaults,
} from "@base/types";
import { EditorNodePropertiesDef } from "node-red";

export interface StatusNodeOptions extends BaseNodeOptions {
  initialActive: boolean;
}

export const StatusNodeOptionsDefaults: StatusNodeOptions = {
  ...BaseNodeOptionsDefaults,
  initialActive: false,
  outputs: 2,
};

export interface StatusNodeDef extends BaseNodeDef, StatusNodeOptions {}

export interface StatusEditorNodeProperties
  extends BaseEditorNodeProperties,
    StatusNodeOptions {}

export const StatusEditorNodePropertiesDefaults: EditorNodePropertiesDef<StatusEditorNodeProperties> =
  {
    ...BaseEditorNodePropertiesDefaults,
    initialActive: {
      value: StatusNodeOptionsDefaults.initialActive,
      required: true,
    },
    outputs: {
      value: StatusNodeOptionsDefaults.outputs,
      required: true,
    },
  };
