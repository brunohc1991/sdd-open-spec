import { BooleanRule } from "../../../src/index";

describe("BooleanRule", () => {
  test("deve aceitar true e false", () => {
    const rule = new BooleanRule();

    expect(rule.validate(true)).toBeNull();
    expect(rule.validate(false)).toBeNull();
  });

  test("deve ignorar null e undefined para permitir campo opcional", () => {
    const rule = new BooleanRule();

    expect(rule.validate(null)).toBeNull();
    expect(rule.validate(undefined)).toBeNull();
  });

  test("deve reprovar valores que nao sao booleanos", () => {
    const rule = new BooleanRule();

    expect(rule.validate("true")).toBe("boolean");
    expect(rule.validate("")).toBe("boolean");
    expect(rule.validate(0)).toBe("boolean");
    expect(rule.validate(1)).toBe("boolean");
    expect(rule.validate({})).toBe("boolean");
  });
});
