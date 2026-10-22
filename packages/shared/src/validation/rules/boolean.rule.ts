import { ValidationRule } from "../validation-rule.interface";

export class BooleanRule implements ValidationRule {
  validate(value: unknown): string | null {
    if (value === null || value === undefined || typeof value === "boolean") {
      return null;
    }

    return "boolean";
  }
}
