import { ValidationException } from "@sdd/shared";
import { Product, SaveProduct, SaveProductIn } from "../../../src";
import { FakeProductRepository } from "../../mock";

const VALID: SaveProductIn = { name: "Camiseta Azul", price: 49.9, status: "active" };
const EXISTING_ID = "6f0f3b55-9a0e-4a54-8f43-3a2d6a6d2f11";

function makeSut() {
  const productRepository = new FakeProductRepository();

  return { productRepository, useCase: new SaveProduct(productRepository) };
}

async function makeSutWithExisting() {
  const sut = makeSut();
  const existing = new Product({
    id: EXISTING_ID,
    name: "Produto Original",
    description: "Descricao original",
    price: 10,
    status: "draft",
    availableOnline: true,
    featured: true,
    allowsPreOrder: true,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
  });
  await sut.productRepository.create(existing);

  return { ...sut, existing };
}

async function getErrors(promise: Promise<unknown>): Promise<string[]> {
  try {
    await promise;
    return [];
  } catch (error) {
    return (error as ValidationException).errors.map((item) => item.message);
  }
}

describe("SaveProduct", () => {
  describe("criacao", () => {
    test("deve criar sem id com novo id, defaults e retornar void", async () => {
      const { productRepository, useCase } = makeSut();

      await expect(useCase.execute(VALID)).resolves.toBeUndefined();

      expect(productRepository.products).toHaveLength(1);
      const [saved] = productRepository.products;
      expect(saved.id).toEqual(expect.any(String));
      expect(saved.name).toBe(VALID.name);
      expect(saved.price).toBe(49.9);
      expect(saved.status).toBe("active");
      expect(saved.description).toBeNull();
      expect(saved.availableOnline).toBe(false);
      expect(saved.featured).toBe(false);
      expect(saved.allowsPreOrder).toBe(false);
    });

    test("deve criar com todos os campos informados", async () => {
      const { productRepository, useCase } = makeSut();

      await useCase.execute({
        ...VALID,
        description: "Algodao 100%",
        availableOnline: true,
        featured: true,
        allowsPreOrder: true,
      });

      const [saved] = productRepository.products;
      expect(saved.description).toBe("Algodao 100%");
      expect(saved.availableOnline).toBe(true);
      expect(saved.featured).toBe(true);
      expect(saved.allowsPreOrder).toBe(true);
    });

    test("deve criar usando o id recebido quando findById nao encontra", async () => {
      const { productRepository, useCase } = makeSut();

      await useCase.execute({ ...VALID, id: EXISTING_ID });

      expect(productRepository.products).toHaveLength(1);
      expect(productRepository.products[0].id).toBe(EXISTING_ID);
    });
  });

  describe("atualizacao", () => {
    test("deve atualizar o produto existente preservando id e createdAt", async () => {
      const { productRepository, useCase, existing } = await makeSutWithExisting();

      await useCase.execute({
        id: EXISTING_ID,
        name: "Produto Atualizado",
        description: null,
        price: 25.5,
        status: "inactive",
        availableOnline: false,
        featured: true,
        allowsPreOrder: false,
      });

      expect(productRepository.products).toHaveLength(1);
      const [updated] = productRepository.products;
      expect(updated.id).toBe(EXISTING_ID);
      expect(updated.createdAt).toEqual(existing.createdAt);
      expect(updated.name).toBe("Produto Atualizado");
      expect(updated.description).toBeNull();
      expect(updated.price).toBe(25.5);
      expect(updated.status).toBe("inactive");
      expect(updated.availableOnline).toBe(false);
      expect(updated.featured).toBe(true);
      expect(updated.allowsPreOrder).toBe(false);
    });

    test("deve tratar booleanos ausentes como false na atualizacao (substituicao completa)", async () => {
      const { productRepository, useCase } = await makeSutWithExisting();

      await useCase.execute({ id: EXISTING_ID, name: "Produto Original", price: 10, status: "draft" });

      const [updated] = productRepository.products;
      expect(updated.availableOnline).toBe(false);
      expect(updated.featured).toBe(false);
      expect(updated.allowsPreOrder).toBe(false);
    });
  });

  describe("validacao", () => {
    test("deve rejeitar nome invalido sem persistir", async () => {
      const { productRepository, useCase } = makeSut();

      const errors = await getErrors(useCase.execute({ ...VALID, name: "a" }));

      expect(errors).toContain("product.name.min.length");
      expect(productRepository.products).toEqual([]);
    });

    test("deve rejeitar preco negativo e com mais de 2 casas", async () => {
      const { useCase } = makeSut();

      expect(await getErrors(useCase.execute({ ...VALID, price: -1 }))).toContain("product.price.min.value");
      expect(await getErrors(useCase.execute({ ...VALID, price: 1.234 }))).toContain("product.price.precision");
    });

    test("deve rejeitar status fora da enumeracao", async () => {
      const { useCase } = makeSut();

      const errors = await getErrors(useCase.execute({ ...VALID, status: "archived" as never }));

      expect(errors).toEqual(["product.status.in"]);
    });

    test("deve rejeitar na atualizacao sem alterar o produto existente", async () => {
      const { productRepository, useCase, existing } = await makeSutWithExisting();

      const errors = await getErrors(
        useCase.execute({ id: EXISTING_ID, name: "", price: 10, status: "draft" }),
      );

      expect(errors).toContain("product.name.required");
      expect(productRepository.products).toEqual([existing]);
      expect(productRepository.products[0].name).toBe("Produto Original");
    });
  });
});
