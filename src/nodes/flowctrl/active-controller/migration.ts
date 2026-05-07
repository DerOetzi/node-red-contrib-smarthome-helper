import MatchJoinMigration from "../match-join/migration";
import { ActiveControllerEditorNodeProperties } from "./types";

export default abstract class ActiveControllerMigration<
  T extends ActiveControllerEditorNodeProperties =
    ActiveControllerEditorNodeProperties,
> extends MatchJoinMigration<T> {}
