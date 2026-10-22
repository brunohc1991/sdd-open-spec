import { CreateUser, User } from "../../../src";
import { FakeCryptoProvider, FakeUserRepository } from "../../mock";

async function makeSut() {
  const userRepository = new FakeUserRepository();
  const hash = await new FakeCryptoProvider().encrypt("Strong@123");
  const entity = new User({ name: "Maria Silva", email: "maria@silva.com", password: hash });

  return { userRepository, entity, useCase: new CreateUser(userRepository) };
}

describe("CreateUser", () => {
  test("deve persistir a entidade recebida e retorna-la", async () => {
    const { userRepository, entity, useCase } = await makeSut();

    const output = await useCase.execute({ entity });

    expect(output).toBe(entity);
    expect(userRepository.createdUsers).toEqual([entity]);
  });

  test("deve permitir criar varios usuarios em sequencia", async () => {
    const { userRepository, entity, useCase } = await makeSut();
    const other = entity.clone({ id: undefined, email: "joao@silva.com" });

    await useCase.execute({ entity });
    await useCase.execute({ entity: other });

    expect(userRepository.createdUsers).toHaveLength(2);
  });
});
