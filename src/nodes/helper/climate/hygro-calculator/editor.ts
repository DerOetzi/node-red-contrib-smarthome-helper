import {
  buildEditorMetadata,
  buildEditorNodeDef,
  buildEditorTemplate,
  NodeEditorDefinition,
} from "../../../flowctrl/base/editor";
import { MatchJoinEditableList } from "../../../flowctrl/match-join/editor";
import HygroCalculatorNode from ".";
import {
  HygroCalculatorEditorNodeProperties,
  HygroCalculatorNodeOptionsDefaults,
  HygroCalculatorTarget,
} from "./types";

const HygroCalculatorEditorDefinition: NodeEditorDefinition<
  typeof HygroCalculatorNodeOptionsDefaults,
  HygroCalculatorEditorNodeProperties
> = {
  localePrefix: "helper.hygro-calculator",
  nodeClass: HygroCalculatorNode,
  defaults: HygroCalculatorNodeOptionsDefaults,
  icon: "font-awesome/fa-tint",
  inputMode: "matcher-topic",
  inputKeys: ["temperature", "humidity"],
  outputKeys: ["absoluteHumidity", "dewPoint"],
  lists: [
    {
      id: "matcher-rows",
      create: () =>
        new MatchJoinEditableList({
          targets: Object.values(HygroCalculatorTarget),
          translatePrefix: "helper.hygro-calculator",
        }),
      dataKey: "matchers",
    },
  ],
  baseTemplate: "input-only",
};

export const HygroCalculatorEditorTemplate = buildEditorTemplate(
  HygroCalculatorEditorDefinition,
);
export const HygroCalculatorEditorMetadata = buildEditorMetadata(
  HygroCalculatorEditorDefinition,
);
export default buildEditorNodeDef(HygroCalculatorEditorDefinition);
