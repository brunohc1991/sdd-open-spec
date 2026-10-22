import { ValidationException } from "@sdd/shared";
import { Product, ProductState } from "../../../src/product/model/product.entity";

function makeState(overrides: Partial<ProductState> = {}): ProductState {
  return {
    name: "Camiseta Azul",
    price: 49.9,
    status: "active",
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

function validate(overrides: Partial<ProductState>): string[] {
  return getValidationMessages(() => new Product(makeState(overrides)).validate());
}

describe("Product", () => {
  it("deve criar um produto valido com defaults e expor os getters", () => {
    const product = new Product(makeState());

    expect(product.name).toBe("Camiseta Azul");
    expect(product.description).toBeNull();
    expect(product.price).toBe(49.9);
    expect(product.status).toBe("active");
    expect(product.availableOnline).toBe(false);
    expect(product.featured).toBe(false);
    expect(product.allowsPreOrder).toBe(false);
    expect(product.id).toEqual(expect.any(String));
    expect(() => product.validate()).not.toThrow();
  });

  it("deve expor os valores informados", () => {
    const product = new Product(
      makeState({
        description: "Algodao 100%",
        availableOnline: true,
        featured: true,
        allowsPreOrder: true,
      }),
    );

    expect(product.description).toBe("Algodao 100%");
    expect(product.availableOnline).toBe(true);
    expect(product.featured).toBe(true);
    expect(product.allowsPreOrder).toBe(true);
    expect(() => product.validate()).not.toThrow();
  });

  it.each([[undefined], [null], [""], ["   "]])(
    "deve tratar a descricao %p como ausente (null)",
    (description) => {
      expect(new Product(makeState({ description })).description).toBeNull();
    },
  );

  it("deve tratar booleanos null como false", () => {
    const product = new Product(
      makeState({
        availableOnline: null as unknown as boolean,
        featured: null as unknown as boolean,
      }),
    );

    expect(product.availableOnline).toBe(false);
    expect(product.featured).toBe(false);
  });

  it("deve permitir existir invalido antes de validate() (lazy)", () => {
    const product = new Product(makeState({ name: "", price: -1, status: "x" as never }));

    expect(product.name).toBe("");
    expect(() => product.validate()).toThrow(ValidationException);
  });

  it("deve preservar id e createdAt e atualizar updatedAt no clone", () => {
    const createdAt = new Date("2026-01-01T00:00:00.000Z");
    const product = new Product(makeState({ createdAt, updatedAt: createdAt }));

    const cloned = product.clone({ price: 10 });

    expect(cloned.id).toBe(product.id);
    expect(cloned.createdAt).toEqual(createdAt);
    expect(cloned.updatedAt.getTime()).toBeGreaterThan(createdAt.getTime());
    expect(cloned.price).toBe(10);
    expect(cloned.name).toBe(product.name);
  });

  describe("name", () => {
    it("deve exigir o nome", () => {
      expect(validate({ name: "" })).toContain("product.name.required");
    });

    it("deve aceitar nome nos limites minimo (2) e maximo (120)", () => {
      expect(validate({ name: "ab" })).toEqual([]);
      expect(validate({ name: "a".repeat(120) })).toEqual([]);
    });

    it("deve rejeitar nome curto e longo demais", () => {
      expect(validate({ name: "a" })).toContain("product.name.min.length");
      expect(validate({ name: "a".repeat(121) })).toContain("product.name.max.length");
    });
  });

  describe("description", () => {
    it("deve aceitar descricao de ate 500 caracteres e rejeitar acima", () => {
      expect(validate({ description: "a".repeat(500) })).toEqual([]);
      expect(validate({ description: "a".repeat(501) })).toContain("product.description.max.length");
    });
  });

  describe("price", () => {
    it("deve aceitar zero, inteiros e ate 2 casas decimais", () => {
      expect(validate({ price: 0 })).toEqual([]);
      expect(validate({ price: 10 })).toEqual([]);
      expect(validate({ price: 19.99 })).toEqual([]);
      expect(validate({ price: 19.9 })).toEqual([]);
    });

    it("deve rejeitar preco negativo", () => {
      expect(validate({ price: -0.01 })).toContain("product.price.min.value");
    });

    it("deve rejeitar mais de 2 casas decimais", () => {
      expect(validate({ price: 10.999 })).toContain("product.price.precision");
    });

    it("deve rejeitar preco ausente ou nao numerico", () => {
      expect(validate({ price: undefined as unknown as number })).toContain("product.price.required");
      expect(validate({ price: "10" as unknown as number })).toContain("product.price.min.value");
    });
  });

  describe("status", () => {
    it.each(["active", "inactive", "draft"] as const)("deve aceitar o status %s", (status) => {
      expect(validate({ status })).toEqual([]);
    });

    it("deve rejeitar status fora da enumeracao", () => {
      expect(validate({ status: "archived" as never })).toEqual(["product.status.in"]);
    });

    it("deve exigir o status", () => {
      expect(validate({ status: "" as never })).toContain("product.status.required");
    });
  });

  describe("booleanos", () => {
    it("deve rejeitar valores que nao sao booleanos", () => {
      expect(
        validate({
          availableOnline: "sim" as unknown as boolean,
          featured: 1 as unknown as boolean,
          allowsPreOrder: "true" as unknown as boolean,
        }),
      ).toEqual([
        "product.availableOnline.boolean",
        "product.featured.boolean",
        "product.allowsPreOrder.boolean",
      ]);
    });
  });

  it("deve acumular erros de varios campos", () => {
    expect(validate({ name: "", price: -5, status: "x" as never })).toEqual(
      expect.arrayContaining([
        "product.name.required",
        "product.price.min.value",
        "product.status.in",
      ]),
    );
  });
});
