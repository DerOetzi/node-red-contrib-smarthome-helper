import { NodeEditorDefinition } from "../../flowctrl/base/editor";
import { MoistureAlertEditorDef } from "./moisture-alert/editor";
import { NotifyDispatcherEditorDef } from "./notify-dispatcher/editor";
import { WasteReminderEditorDef } from "./waste-reminder/editor";
import { WhitegoodReminderEditorDef } from "./whitegood-reminder/editor";
import { WindowReminderEditorDef } from "./window-reminder/editor";

export const HelperNotificationDefs: NodeEditorDefinition<any, any>[] = [
  MoistureAlertEditorDef,
  NotifyDispatcherEditorDef,
  WasteReminderEditorDef,
  WhitegoodReminderEditorDef,
  WindowReminderEditorDef,
];
