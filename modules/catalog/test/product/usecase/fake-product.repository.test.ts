import { Product } from "../../../src";
import { FakeProductRepository } from "../../mock";

function makeProduct(name: string): Product {
  return new Product({ name, price: 10, status: "active" });
}

describe("FakeProductRepository", () => {
  test("deve criar, buscar, atualizar, paginar e remover", async () => {
    const repository = new FakeProductRepository();
    const first = makeProduct("Produto A");
    const second = makeProduct("Produto B");

    await repository.create(first);
    await repository.create(second);
    expect(await repository.findById(first.id)).toBe(first);
    expect(await repository.findById("outro")).toBeNull();

    const updated = first.clone({ price: 20 });
    await repository.update(updated);
    expect((await repository.findById(first.id))?.price).toBe(20);
    await expect(repository.update(makeProduct("Nao existe"))).rejects.toThrow("not found");

    expect(await repository.findPage({ page: 1, perPage: 1 })).toMatchObject({
      page: 1,
      perPage: 1,
      total: 2,
      items: [updated],
    });
    expect((await repository.findPage({ page: 2, perPage: 1 })).items).toEqual([second]);

    await repository.delete("inexistente");
    expect(repository.products).toHaveLength(2);
    await repository.delete(first.id);
    expect(repository.products).toEqual([second]);
  });
});
