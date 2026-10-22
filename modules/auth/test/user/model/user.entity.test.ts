import { ValidationException } from "@sdd/shared";
import { User, UserState } from "../../../src/user/model/user.entity";

const VALID_HASH = `$2b$10$${"a".repeat(53)}`;

function makeState(overrides: Partial<UserState> = {}): UserState {
  return {
    name: "Maria Silva",
    email: "maria@example.com",
    password: VALID_HASH,
    ...overrides,
  };
}

function getValidationMessages(callback: () => void): string[] {
  try {
    callback();
    return [];
  } catch (error) {
    return (error as ValidationException).errors.map((item) => item.message);
  }
}

describe("User", () => {
  it("deve criar uma entidade valida e expor os getters", () => {
    const user = new User(makeState());

    expect(user.name).toBe("Maria Silva");
    expect(user.email).toBe("maria@example.com");
    expect(user.password).toBe(VALID_HASH);
    expect(user.id).toEqual(expect.any(String));
    expect(user.createdAt).toBeInstanceOf(Date);
    expect(user.updatedAt).toBeInstanceOf(Date);
    expect(user.deletedAt).toBeNull();
    expect(() => user.validate()).not.toThrow();
  });

  it("deve preservar id e timestamps informados", () => {
    const createdAt = new Date("2026-01-01T00:00:00.000Z");
    const updatedAt = new Date("2026-01-02T00:00:00.000Z");
    const deletedAt = new Date("2026-01-03T00:00:00.000Z");
    const id = "6f0f3b55-9a0e-4a54-8f43-3a2d6a6d2f11";

    const user = new User(makeState({ id, createdAt, updatedAt, deletedAt }));

    expect(user.id).toBe(id);
    expect(user.createdAt).toEqual(createdAt);
    expect(user.updatedAt).toEqual(updatedAt);
    expect(user.deletedAt).toEqual(deletedAt);
  });

  it("deve rejeitar id invalido na criacao (validacao da classe base)", () => {
    expect(() => new User(makeState({ id: "invalido" }))).toThrow(
      ValidationException,
    );
  });

  it("deve permitir existir invalida antes de validate() (lazy)", () => {
    const user = new User(
      makeState({ name: "", email: "x", password: "senha" }),
    );

    expect(user.name).toBe("");
    expect(() => user.validate()).toThrow(ValidationException);
  });

  it("deve preservar id e createdAt e atualizar updatedAt no clone", () => {
    const createdAt = new Date("2026-01-01T00:00:00.000Z");
    const user = new User(makeState({ createdAt, updatedAt: createdAt }));

    const cloned = user.clone({ name: "Joana Souza" });

    expect(cloned).not.toBe(user);
    expect(cloned.id).toBe(user.id);
    expect(cloned.createdAt).toEqual(createdAt);
    expect(cloned.updatedAt.getTime()).toBeGreaterThan(createdAt.getTime());
    expect(cloned.name).toBe("Joana Souza");
    expect(cloned.email).toBe(user.email);
    expect(user.equals(cloned)).toBe(true);
    expect(user.equals(null)).toBe(false);
  });

  describe("name", () => {
    it("deve exigir o nome", () => {
      const messages = getValidationMessages(() =>
        new User(makeState({ name: "" })).validate(),
      );

      expect(messages).toContain("user.name.required");
    });

    it("deve aceitar nome no limite minimo e maximo", () => {
      expect(() => new User(makeState({ name: "Al B" })).validate()).not.toThrow();
      expect(() =>
        new User(makeState({ name: `${"a".repeat(39)} ${"b".repeat(40)}` })).validate(),
      ).not.toThrow();
    });

    it("deve rejeitar nome curto demais", () => {
      const messages = getValidationMessages(() =>
        new User(makeState({ name: "Al" })).validate(),
      );

      expect(messages).toContain("user.name.min.length");
    });

    it("deve rejeitar nome longo demais", () => {
      const messages = getValidationMessages(() =>
        new User(makeState({ name: `${"a".repeat(40)} ${"b".repeat(40)}` })).validate(),
      );

      expect(messages).toContain("user.name.max.length");
    });

    it("deve rejeitar nome sem sobrenome ou com numeros", () => {
      expect(
        getValidationMessages(() =>
          new User(makeState({ name: "Maria" })).validate(),
        ),
      ).toContain("user.name.person.name");
      expect(
        getValidationMessages(() =>
          new User(makeState({ name: "Maria 123" })).validate(),
        ),
      ).toContain("user.name.person.name");
    });
  });

  describe("email", () => {
    it("deve exigir o e-mail", () => {
      const messages = getValidationMessages(() =>
        new User(makeState({ email: "" })).validate(),
      );

      expect(messages).toContain("user.email.required");
    });

    it("deve rejeitar e-mail com formato invalido", () => {
      const messages = getValidationMessages(() =>
        new User(makeState({ email: "maria@" })).validate(),
      );

      expect(messages).toContain("user.email.invalid.email");
    });
  });

  describe("password", () => {
    it("deve rejeitar senha que nao e hash bcrypt", () => {
      const messages = getValidationMessages(() =>
        new User(makeState({ password: "Senha@123" })).validate(),
      );

      expect(messages).toContain("user.password.bcrypt.hash");
    });

    it("deve aceitar hash bcrypt valido", () => {
      expect(() =>
        new User(makeState({ password: `$2a$12$${"B".repeat(53)}` })).validate(),
      ).not.toThrow();
    });
  });

  it("deve acumular erros de varios campos", () => {
    const messages = getValidationMessages(() =>
      new User(makeState({ name: "", email: "x", password: "y" })).validate(),
    );

    expect(messages).toEqual(
      expect.arrayContaining([
        "user.name.required",
        "user.email.invalid.email",
        "user.password.bcrypt.hash",
      ]),
    );
  });
});
