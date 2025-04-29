import { IsBooleanStrict } from "@core/decorators/validate/is-boolean.decorator";
import { ToBoolean } from "@core/decorators/validate/to-boolean";

export class QuestionPublishInputModel {
  @ToBoolean()
  @IsBooleanStrict()
  published: boolean;
}
