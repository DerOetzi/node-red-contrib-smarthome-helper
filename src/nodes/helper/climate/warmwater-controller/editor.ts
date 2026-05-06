import { EditorNodeDef } from "node-red";
import { MatchJoinEditableList } from "../../../flowctrl/match-join/editor";
import { EditorMetadata } from "../../../types";
import {
  WarmWaterControllerEditorNodeProperties,
  WarmWaterControllerNodeOptions,
  WarmWaterControllerNodeOptionsDefaults,
  WarmWaterControllerTarget,
} from "./types";
import WarmWaterControllerNode from ".";
import BaseEditorNode, {
  createEditorDefaults,
  i18n,
  NodeEditorFormBuilder,
} from "../../../flowctrl/base/editor";

export const WarmWaterControllerEditorMetadata: EditorMetadata = {
  localePrefix: "helper.warmwater-controller",
  inputMode: "matcher-topic",
  fieldKeys: ["defaultActive"],
  inputKeys: ["activeCondition"],
  outputKeys: [],
};

const controlMatcherList = new MatchJoinEditableList({
  targets: Object.values(WarmWaterControllerTarget),
  translatePrefix: WarmWaterControllerEditorMetadata.localePrefix,
  headerPrefix: WarmWaterControllerEditorMetadata.localePrefix,
});

const WarmWaterControllerEditorNode: EditorNodeDef<WarmWaterControllerEditorNodeProperties> =
  {
    category: WarmWaterControllerNode.NodeCategoryLabel,
    color: WarmWaterControllerNode.NodeColor,
    icon: "font-awesome/fa-thermometer-half",
    defaults: createEditorDefaults<
      WarmWaterControllerNodeOptions,
      WarmWaterControllerEditorNodeProperties
    >(WarmWaterControllerNodeOptionsDefaults),
    label: function () {
      return this.name?.trim()
        ? this.name.trim()
        : i18n("helper.warmwater-controller.name");
    },
    inputs: WarmWaterControllerNodeOptionsDefaults.inputs,
    outputs: WarmWaterControllerNodeOptionsDefaults.outputs,
    oneditprepare: function () {
      BaseEditorNode.oneditprepare!.call(this);

      controlMatcherList.initialize("matcher-rows-control", this.matchers, {
        translatePrefix: "flowctrl.match-join",
      });

      const warmWaterControllerOptionsBuilder = new NodeEditorFormBuilder(
        $("#warmwater-controller-options"),
        {
          translatePrefix: WarmWaterControllerEditorMetadata.localePrefix,
        },
      );

      warmWaterControllerOptionsBuilder.createCheckboxInput({
        id: "node-input-defaultActive",
        label: "defaultActive",
        value: this.defaultActive,
        icon: "toggle-on",
      });
    },
    oneditsave: function () {
      this.matchers = controlMatcherList.values();
    },
  };

export default WarmWaterControllerEditorNode;
