import { EditorNodeDef } from "node-red";
import BaseNodeEditor from "../../flowctrl/base/editor";
import {
  removeTarget,
  getMatchers,
  initializeMatcherRows,
  showHideTarget,
} from "../../flowctrl/match-join/editor";
import {
  defaultLightControllerNodeConfig,
  LightControllerNodeEditorProperties,
  LightControllerNodeType,
  LightIdentifierRow,
} from "./types";

const LightControllerNodeEditor: EditorNodeDef<LightControllerNodeEditorProperties> =
  {
    ...BaseNodeEditor,
    category: LightControllerNodeType.categoryLabel,
    color: LightControllerNodeType.color,
    defaults: {
      ...BaseNodeEditor.defaults,
      matchers: {
        value: defaultLightControllerNodeConfig.matchers!,
        required: true,
      },
      join: {
        value: defaultLightControllerNodeConfig.join!,
        required: true,
      },
      discardNotMatched: {
        value: defaultLightControllerNodeConfig.discardNotMatched!,
        required: true,
      },
      minMsgCount: {
        value: defaultLightControllerNodeConfig.minMsgCount!,
        required: true,
      },
      identifiers: {
        value: defaultLightControllerNodeConfig.identifiers!,
        required: true,
      },
      lightbulbType: {
        value: defaultLightControllerNodeConfig.lightbulbType!,
        required: true,
      },
      homeAssistantOutput: {
        value: defaultLightControllerNodeConfig.homeAssistantOutput!,
        required: false,
      },
      onBrightness: {
        value: defaultLightControllerNodeConfig.onBrightness!,
        required: true,
      },
      transitionTime: {
        value: defaultLightControllerNodeConfig.transitionTime!,
        required: true,
      },
      colorTemperature: {
        value: defaultLightControllerNodeConfig.colorTemperature!,
        required: true,
      },
      nightmodeBrightness: {
        value: defaultLightControllerNodeConfig.nightmodeBrightness!,
        required: true,
      },
      onCommand: {
        value: defaultLightControllerNodeConfig.onCommand!,
        required: true,
      },
      offCommand: {
        value: defaultLightControllerNodeConfig.offCommand!,
        required: true,
      },
      nightmodeCommand: {
        value: defaultLightControllerNodeConfig.nightmodeCommand!,
        required: true,
      },
      colorCycle: {
        value: defaultLightControllerNodeConfig.colorCycle!,
        required: false,
      },
      fixColorHue: {
        value: defaultLightControllerNodeConfig.fixColorHue!,
        required: true,
      },
      fixColorSaturation: {
        value: defaultLightControllerNodeConfig.fixColorSaturation!,
        required: true,
      },
    },
    icon: "lightbulb.svg",
    label: function () {
      const label = this.lightbulbType;
      return this.name ? `${this.name} (${label})` : label;
    },
    oneditprepare: function () {
      BaseNodeEditor.oneditprepare!.call(this);

      initializeMatcherRows(this.matchers, {
        targets: ["command", "colorTemperature", "hue", "saturation"],
        translatePrefix: "helper.light-controller.target",
        t: this._.bind(this),
      });

      initializeIdentifierRows("#identifier-rows", this.identifiers);

      let brightnessRow = $("#node-input-onBrightness")
        .parent()
        .toggle(this.lightbulbType !== "switch");

      let transitionTimeRow = $("#node-input-transitionTime")
        .parent()
        .toggle(this.lightbulbType !== "switch");

      let colortemperatureRow = $("#node-input-colorTemperature")
        .parent()
        .toggle(this.lightbulbType === "colortemperature");

      showHideTarget(
        this.lightbulbType === "colortemperature",
        "colorTemperature"
      );

      let nightmodeBrightnessRow = $("#node-input-nightmodeBrightness")
        .parent()
        .toggle(this.lightbulbType !== "switch");

      let nightmodeCommandRow = $("#node-input-nightmodeCommand")
        .parent()
        .toggle(this.lightbulbType !== "switch");

      let colorCycleRow = $("#node-input-colorCycle")
        .parent()
        .toggle(this.lightbulbType === "rgb");

      const showColor = this.lightbulbType === "rgb" && !this.colorCycle;

      let fixColorRow = $("#node-input-fixColorHue").parent().toggle(showColor);

      showHideTarget(showColor, "hue");
      showHideTarget(showColor, "saturation");

      $("#node-input-lightbulbType").on("change", function () {
        let lightbulbType = $(this).val() as string;
        let isSwitch = lightbulbType === "switch";

        brightnessRow.toggle(!isSwitch);
        transitionTimeRow.toggle(!isSwitch);
        nightmodeBrightnessRow.toggle(!isSwitch);
        nightmodeCommandRow.toggle(!isSwitch);

        colortemperatureRow.toggle(lightbulbType === "colortemperature");
        removeTarget(lightbulbType === "colortemperature", "colorTemperature");

        const showColor =
          lightbulbType === "rgb" &&
          !$("#node-input-colorCycle").is(":checked");

        colorCycleRow.toggle(lightbulbType === "rgb");
        fixColorRow.toggle(showColor);
        removeTarget(showColor, "hue");
        removeTarget(showColor, "saturation");
      });

      $("#node-input-colorCycle").on("change", function () {
        const showColor = !$(this).is(":checked");
        fixColorRow.toggle(showColor);
        removeTarget(showColor, "hue");
        removeTarget(showColor, "saturation");
      });
    },
    oneditsave: function () {
      this.matchers = getMatchers();
      this.identifiers = getIdentifiers("#identifier-rows");
    },
  };

export function initializeIdentifierRows(
  containerId: string,
  identifiers: LightIdentifierRow[]
) {
  $(containerId)
    .editableList({
      addButton: true,
      removable: true,
      sortable: true,
      height: "auto",
      header: $("<div>").append($("<label>").text("Identifiers")),
      addItem: function (container, index, data: LightIdentifierRow) {
        container.css({
          overflow: "hidden",
          whiteSpace: "nowrap",
        });

        container.attr("data-row", index);

        const $row = $("<div />").appendTo(container);
        const $row1 = $("<div />").appendTo($row).css("margin-bottom", "6px");

        const identifierName = $("<input/>", {
          class: "identifier-name",
          type: "text",
        })
          .css("width", "100%")
          .appendTo($row1)
          .typedInput({
            types: ["str", "msg"],
          });

        identifierName.typedInput("value", data.identifier ?? "");
        identifierName.typedInput("type", data.identifierType ?? "str");
      },
    })
    .editableList("addItems", identifiers || []);
}

export function getIdentifiers(containerId: string): LightIdentifierRow[] {
  let identifiersList = $(containerId).editableList("items");
  let identifiers: LightIdentifierRow[] = [];

  identifiersList.each((_, row) => {
    let identifier = $(row);

    identifiers.push({
      identifier: identifier.find(".identifier-name").typedInput("value"),
      identifierType: identifier.find(".identifier-name").typedInput("type"),
    });
  });

  return identifiers;
}

export default LightControllerNodeEditor;

export { LightControllerNodeType };
