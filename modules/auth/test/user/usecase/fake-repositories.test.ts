import { User } from "../../../src";
import { FakeCryptoProvider, FakeUserRepository } from "../../mock";

const HASH = `$2b$10$${"a".repeat(53)}`;

function makeUser(email: string): User {
  return new User({ name: "Maria Silva", email, password: HASH });
}

describe("FakeUserRepository", () => {
  test("deve criar, buscar, atualizar, paginar e remover", async () => {
    const repository = new FakeUserRepository();
    const user = makeUser("maria@example.com");

    await repository.create(user);
    expect(await repository.findById(user.id)).toBe(user);
    expect(await repository.findById("outro")).toBeNull();
    expect(await repository.findByEmail("maria@example.com")).toBe(user);
    expect(await repository.findByEmail("x@y.com")).toBeNull();

    const updated = user.clone({ name: "Joana Souza" });
    await repository.update(updated);
    expect((await repository.findById(user.id))?.name).toBe("Joana Souza");
    await repository.update(makeUser("nao-existe@example.com"));
    expect(repository.createdUsers).toHaveLength(1);

    expect(await repository.findPage({ page: 1, perPage: 10 })).toMatchObject({
      total: 1,
      page: 1,
      perPage: 10,
    });

    await repository.delete("inexistente");
    expect(repository.createdUsers).toHaveLength(1);
    await repository.delete(user.id);
    expect(repository.createdUsers).toHaveLength(0);
  });
});

describe("FakeCryptoProvider", () => {
  test("deve comparar valor com o hash gerado", async () => {
    const provider = new FakeCryptoProvider();
    const hash = await provider.encrypt("Strong@123");

    expect(await provider.comparePassword("Strong@123", hash)).toBe(true);
    expect(await provider.comparePassword("Strong@123", "outro")).toBe(false);
  });
});
