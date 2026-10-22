import { NotFoundError } from "@sdd/shared";
import { DeleteUser, User } from "../../../src";
import { FakeCryptoProvider, FakeUserRepository } from "../../mock";

async function makeSut() {
  const userRepository = new FakeUserRepository();
  const hash = await new FakeCryptoProvider().encrypt("Strong@123");
  const user = new User({ name: "Maria Silva", email: "maria@silva.com", password: hash });
  const other = new User({ name: "Joao Silva", email: "joao@silva.com", password: hash });
  await userRepository.create(user);
  await userRepository.create(other);

  return { userRepository, user, other, useCase: new DeleteUser(userRepository) };
}

describe("DeleteUser", () => {
  test("deve remover apenas o usuario indicado e retornar void", async () => {
    const { userRepository, user, other, useCase } = await makeSut();

    await expect(useCase.execute({ id: user.id })).resolves.toBeUndefined();

    expect(await userRepository.findById(user.id)).toBeNull();
    expect(await userRepository.findById(other.id)).toBe(other);
    expect(userRepository.createdUsers).toHaveLength(1);
  });

  test("deve falhar com user.not_found quando o usuario nao existe", async () => {
    const { userRepository, useCase } = await makeSut();

    const promise = useCase.execute({ id: "inexistente" });

    await expect(promise).rejects.toBeInstanceOf(NotFoundError);
    await expect(promise).rejects.toMatchObject({ statusCode: 404, message: "user.not_found" });
    expect(userRepository.createdUsers).toHaveLength(2);
  });
});
