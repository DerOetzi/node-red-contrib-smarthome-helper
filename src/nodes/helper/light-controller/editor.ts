import { EditorNodeDef } from "node-red";
import BaseNodeEditor from "../../flowctrl/base/editor";
import {
  getMatchers,
  initializeMatcherRows,
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

      initializeMatcherRows("#matcher-rows", false, this.matchers, true);

      initializeIdentifierRows("#identifier-rows", this.identifiers);

      let brightnessRow = $("#node-input-onBrightness")
        .parent()
        .toggle(this.lightbulbType !== "switch");

      let transitionTimeRow = $("#node-input-transitionTime")
        .parent()
        .toggle(this.lightbulbType !== "switch");

      let colortemperatureMatcherRow = $("#matcher-rows [data-row='1']")
        .parent()
        .toggle(this.lightbulbType === "colortemperature");

      let colortemperatureRow = $("#node-input-colorTemperature")
        .parent()
        .toggle(this.lightbulbType === "colortemperature");

      let nightmodeBrightnessRow = $("#node-input-nightmodeBrightness")
        .parent()
        .toggle(this.lightbulbType !== "switch");

      let nightmodeCommandRow = $("#node-input-nightmodeCommand")
        .parent()
        .toggle(this.lightbulbType !== "switch");

      let colorCycleRow = $("#node-input-colorCycle")
        .parent()
        .toggle(this.lightbulbType === "rgb");

      let fixColorRow = $("#node-input-fixColorHue")
        .parent()
        .toggle(this.lightbulbType === "rgb" && !this.colorCycle);

      let matcherHueRow = $("#matcher-rows [data-row='2']")
        .parent()
        .toggle(this.lightbulbType === "rgb" && !this.colorCycle);

      let matcherSaturationRow = $("#matcher-rows [data-row='3']")
        .parent()
        .toggle(this.lightbulbType === "rgb" && !this.colorCycle);

      $("#node-input-lightbulbType").on("change", function () {
        let lightbulbType = $(this).val() as string;
        let isSwitch = lightbulbType === "switch";

        brightnessRow.toggle(!isSwitch);
        transitionTimeRow.toggle(!isSwitch);
        nightmodeBrightnessRow.toggle(!isSwitch);
        nightmodeCommandRow.toggle(!isSwitch);

        colortemperatureMatcherRow.toggle(lightbulbType === "colortemperature");
        colortemperatureRow.toggle(lightbulbType === "colortemperature");

        colorCycleRow.toggle(lightbulbType === "rgb");
        fixColorRow.toggle(
          lightbulbType === "rgb" && !$("#node-input-colorCycle").is(":checked")
        );
        matcherHueRow.toggle(
          lightbulbType === "rgb" && !$("#node-input-colorCycle").is(":checked")
        );
        matcherSaturationRow.toggle(
          lightbulbType === "rgb" && !$("#node-input-colorCycle").is(":checked")
        );
      });

      $("#node-input-colorCycle").on("change", function () {
        fixColorRow.toggle(!$(this).is(":checked"));
        matcherHueRow.toggle(!$(this).is(":checked"));
        matcherSaturationRow.toggle(!$(this).is(":checked"));
      });
    },
    oneditsave: function () {
      this.matchers = getMatchers("#matcher-rows");
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
