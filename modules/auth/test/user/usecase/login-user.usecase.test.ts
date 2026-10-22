import { DomainError, ValidationException } from "@sdd/shared";
import { LoginUser, RegisterUser } from "../../../src";
import { FakeCryptoProvider, FakeUserRepository } from "../../mock";

const REGISTERED = {
  name: "José da Silva",
  email: "jose@silva.com",
  password: "Strong@123",
};

async function makeSut() {
  const cryptoProvider = new FakeCryptoProvider();
  const userRepository = new FakeUserRepository();
  await new RegisterUser(cryptoProvider, userRepository).execute(REGISTERED);

  return {
    cryptoProvider,
    userRepository,
    useCase: new LoginUser(cryptoProvider, userRepository),
  };
}

async function getErrors(promise: Promise<unknown>): Promise<string[]> {
  try {
    await promise;
    return [];
  } catch (error) {
    return (error as ValidationException).errors.map((item) => item.message);
  }
}

describe("LoginUser", () => {
  test("deve retornar apenas id, name e email no login valido", async () => {
    const { userRepository, useCase } = await makeSut();
    const [saved] = userRepository.createdUsers;

    const output = await useCase.execute({
      email: REGISTERED.email,
      password: REGISTERED.password,
    });

    expect(output).toEqual({
      id: saved.id,
      name: REGISTERED.name,
      email: REGISTERED.email,
    });
    expect(output).not.toHaveProperty("password");
    expect(JSON.stringify(output)).not.toContain(saved.password);
  });

  test("deve falhar com credenciais invalidas para e-mail inexistente", async () => {
    const { useCase } = await makeSut();

    const promise = useCase.execute({
      email: "ninguem@silva.com",
      password: REGISTERED.password,
    });

    await expect(promise).rejects.toBeInstanceOf(DomainError);
    await expect(promise).rejects.toMatchObject({
      statusCode: 401,
      message: "user.credentials.invalid",
    });
  });

  test("deve falhar com o mesmo erro para senha incorreta", async () => {
    const { useCase } = await makeSut();

    const promise = useCase.execute({
      email: REGISTERED.email,
      password: "Wrong@123",
    });

    await expect(promise).rejects.toBeInstanceOf(DomainError);
    await expect(promise).rejects.toMatchObject({
      statusCode: 401,
      message: "user.credentials.invalid",
    });
  });

  test("deve rejeitar e-mail vazio sem consultar a senha", async () => {
    const { useCase } = await makeSut();

    const errors = await getErrors(
      useCase.execute({ email: "", password: REGISTERED.password }),
    );

    expect(errors).toContain("user.email.required");
  });

  test("deve rejeitar e-mail com formato invalido", async () => {
    const { useCase } = await makeSut();

    const errors = await getErrors(
      useCase.execute({ email: "invalido", password: REGISTERED.password }),
    );

    expect(errors).toEqual(["user.email.invalid.email"]);
  });

  test("deve rejeitar senha vazia", async () => {
    const { useCase } = await makeSut();

    const errors = await getErrors(
      useCase.execute({ email: REGISTERED.email, password: "" }),
    );

    expect(errors).toEqual(["user.password.required"]);
  });
});
