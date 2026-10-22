import { DomainError } from "@sdd/shared";
import { DeleteProduct, Product } from "../../../src";
import { FakeProductRepository } from "../../mock";

async function makeSut() {
  const productRepository = new FakeProductRepository();
  const product = new Product({ name: "Produto A", price: 10, status: "active" });
  const other = new Product({ name: "Produto B", price: 20, status: "draft" });
  await productRepository.create(product);
  await productRepository.create(other);

  return { productRepository, product, other, useCase: new DeleteProduct(productRepository) };
}

describe("DeleteProduct", () => {
  test("deve remover apenas o produto indicado e retornar void", async () => {
    const { productRepository, product, other, useCase } = await makeSut();

    await expect(useCase.execute({ id: product.id })).resolves.toBeUndefined();

    expect(await productRepository.findById(product.id)).toBeNull();
    expect(await productRepository.findById(other.id)).toBe(other);
  });

  test("deve lancar DomainError product.not_found (404) quando o id nao existe", async () => {
    const { productRepository, useCase } = await makeSut();

    const promise = useCase.execute({ id: "inexistente" });

    await expect(promise).rejects.toBeInstanceOf(DomainError);
    await expect(promise).rejects.toMatchObject({ statusCode: 404, message: "product.not_found" });
    expect(productRepository.products).toHaveLength(2);
  });
});
