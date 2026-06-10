import { ActiveControllerTarget } from "../../../flowctrl/active-controller/types";
import {
  NodeEditorDefinition,
  NodeEditorFormBuilder,
  NodeEditorFormEditableList,
} from "../../../flowctrl/base/editor";
import { MatchJoinEditableList } from "../../../flowctrl/match-join/editor";
import { TimeIntervalUnit } from "../../../../helpers/time.helper";
import WarmwaterCirculationControllerNode from "./";
import {
  WarmwaterCirculationControllerEditorNodeProperties,
  WarmwaterCirculationControllerNodeOptions,
  WarmwaterCirculationControllerNodeOptionsDefaults,
  WarmwaterCirculationControllerTarget,
  WarmwaterCirculationIntervalRow,
} from "./types";

class CirculationIntervalEditableList extends NodeEditorFormEditableList<WarmwaterCirculationIntervalRow> {
  protected addItem(data: WarmwaterCirculationIntervalRow) {
    this.rowBuilder!.createTextInput({
      id: "name",
      label: "intervalName",
      value: data.name ?? "",
      icon: "tag",
    });

    this.rowBuilder!.createTextInput({
      id: "from",
      label: "from",
      value: data.from ?? "05:00",
      icon: "clock-o",
    });

    this.rowBuilder!.createTextInput({
      id: "to",
      label: "to",
      value: data.to ?? "09:00",
      icon: "clock-o",
    });

    this.rowBuilder!.createTimeInput({
      id: "onTime",
      idType: "onTimeUnit",
      label: "onTime",
      value: data.onTime ?? 5,
      valueType: data.onTimeUnit ?? TimeIntervalUnit.m,
      icon: "toggle-on",
    });

    this.rowBuilder!.createTimeInput({
      id: "offTime",
      idType: "offTimeUnit",
      label: "offTime",
      value: data.offTime ?? 10,
      valueType: data.offTimeUnit ?? TimeIntervalUnit.m,
      icon: "toggle-off",
    });
  }
}

const controlMatcherList = new MatchJoinEditableList({
  targets: [ActiveControllerTarget.activeCondition],
  translatePrefix: "helper.warmwater-circulation-controller",
  headerPrefix: "helper.warmwater-circulation-controller",
});

const conditionMatcherList = new MatchJoinEditableList({
  targets: [
    WarmwaterCirculationControllerTarget.heatingAvailable,
    WarmwaterCirculationControllerTarget.runCondition,
    WarmwaterCirculationControllerTarget.specialRelease,
  ],
  translatePrefix: "helper.warmwater-circulation-controller",
  headerPrefix: "helper.warmwater-circulation-controller",
});

function buildWarmwaterCirculationControllerFormContent(
  node: WarmwaterCirculationControllerEditorNodeProperties,
): void {
  const builder = new NodeEditorFormBuilder(
    $("#warmwater-circulation-controller-options"),
    {
      translatePrefix: "helper.warmwater-circulation-controller",
    },
  );

  builder.createCheckboxInput({
    id: "node-input-defaultActive",
    label: "defaultActive",
    value: node.defaultActive,
    icon: "toggle-on",
  });

  builder.createCheckboxInput({
    id: "node-input-reactivateEnabled",
    label: "reactivateEnabled",
    value: node.reactivateEnabled,
    icon: "toggle-on",
  });

  builder.line();

  builder.createTimeInput({
    id: "node-input-defaultOnTime",
    idType: "node-input-defaultOnTimeUnit",
    label: "defaultOnTime",
    value: node.defaultOnTime,
    valueType: node.defaultOnTimeUnit,
    icon: "toggle-on",
  });

  builder.createTimeInput({
    id: "node-input-defaultOffTime",
    idType: "node-input-defaultOffTimeUnit",
    label: "defaultOffTime",
    value: node.defaultOffTime,
    valueType: node.defaultOffTimeUnit,
    icon: "toggle-off",
  });

  builder.createTimeInput({
    id: "node-input-specialReleaseOffDelay",
    idType: "node-input-specialReleaseOffDelayUnit",
    label: "specialReleaseOffDelay",
    value: node.specialReleaseOffDelay,
    valueType: node.specialReleaseOffDelayUnit,
    icon: "hourglass-half",
  });
}

export const WarmwaterCirculationControllerEditorDef: NodeEditorDefinition<
  WarmwaterCirculationControllerNodeOptions,
  WarmwaterCirculationControllerEditorNodeProperties
> = {
  localePrefix: "helper.warmwater-circulation-controller",
  nodeClass: WarmwaterCirculationControllerNode,
  defaults: WarmwaterCirculationControllerNodeOptionsDefaults,
  icon: "font-awesome/fa-refresh",
  inputMode: "matcher-topic",
  fieldKeys: [
    "target",
    "defaultActive",
    "defaultOnTime",
    "defaultOnTimeUnit",
    "defaultOffTime",
    "defaultOffTimeUnit",
    "specialReleaseOffDelay",
    "specialReleaseOffDelayUnit",
  ],
  inputKeys: [
    "activeCondition",
    "heatingAvailable",
    "runCondition",
    "specialRelease",
  ],
  outputKeys: ["pump"],
  baseTemplate: "input-only",
  lists: [
    {
      id: "matcher-rows-control",
      create: () => controlMatcherList,
      dataKey: "matchers",
      rowTranslatePrefix: "flowctrl.match-join",
    },
    {
      id: "matcher-rows-conditions",
      create: () => conditionMatcherList,
      dataKey: "matchers",
      rowTranslatePrefix: "flowctrl.match-join",
    },
    {
      id: "interval-rows",
      create: () => new CirculationIntervalEditableList(),
      dataKey: "intervals",
      rowTranslatePrefix: "helper.warmwater-circulation-controller",
    },
  ],
  form: {
    id: "warmwater-circulation-controller-options",
    build: buildWarmwaterCirculationControllerFormContent,
  },
};
