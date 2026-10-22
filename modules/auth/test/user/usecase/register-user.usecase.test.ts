import { ValidationException } from "@sdd/shared";
import { EmailAlreadyRegisteredError, RegisterUser, User } from "../../../src";
import { FakeCryptoProvider, FakeUserRepository } from "../../mock";

const VALID_INPUT = {
  name: "Joao Silva",
  email: "joao@silva.com",
  password: "Strong@123",
};

function makeSut() {
  const cryptoProvider = new FakeCryptoProvider();
  const userRepository = new FakeUserRepository();
  const useCase = new RegisterUser(cryptoProvider, userRepository);

  return { cryptoProvider, userRepository, useCase };
}

async function getErrors(promise: Promise<void>): Promise<string[]> {
  try {
    await promise;
    return [];
  } catch (error) {
    return (error as ValidationException).errors.map((item) => item.message);
  }
}

describe("RegisterUser", () => {
  test("deve validar, criptografar a senha e persistir no caminho feliz", async () => {
    const { cryptoProvider, userRepository, useCase } = makeSut();
    const validateSpy = jest.spyOn(User.prototype, "validate");

    await expect(useCase.execute(VALID_INPUT)).resolves.toBeUndefined();

    expect(cryptoProvider.encryptedPasswords).toEqual(["Strong@123"]);
    expect(validateSpy).toHaveBeenCalledTimes(1);
    expect(userRepository.createdUsers).toHaveLength(1);

    const [saved] = userRepository.createdUsers;
    expect(saved.name).toBe(VALID_INPUT.name);
    expect(saved.email).toBe(VALID_INPUT.email);
    expect(saved.password).not.toBe(VALID_INPUT.password);

    validateSpy.mockRestore();
  });

  test("deve falhar com e-mail ja cadastrado sem criptografar nem persistir", async () => {
    const { cryptoProvider, userRepository, useCase } = makeSut();
    await useCase.execute(VALID_INPUT);
    cryptoProvider.encryptedPasswords.length = 0;

    await expect(useCase.execute(VALID_INPUT)).rejects.toThrow(
      EmailAlreadyRegisteredError,
    );

    expect(cryptoProvider.encryptedPasswords).toEqual([]);
    expect(userRepository.createdUsers).toHaveLength(1);
  });

  test("deve expor o erro de e-mail duplicado com status 409", async () => {
    const { useCase } = makeSut();
    await useCase.execute(VALID_INPUT);

    await expect(useCase.execute(VALID_INPUT)).rejects.toMatchObject({
      statusCode: 409,
      message: "user.email.already.registered",
    });
  });

  test("deve falhar com senha fraca antes de qualquer efeito colateral", async () => {
    const { cryptoProvider, userRepository, useCase } = makeSut();

    const errors = await getErrors(
      useCase.execute({ ...VALID_INPUT, password: "123456" }),
    );

    expect(errors).toContain("user.password.strong.password");
    expect(cryptoProvider.encryptedPasswords).toEqual([]);
    expect(userRepository.createdUsers).toEqual([]);
  });

  test("deve falhar com senha vazia", async () => {
    const { useCase } = makeSut();

    const errors = await getErrors(
      useCase.execute({ ...VALID_INPUT, password: "" }),
    );

    expect(errors).toContain("user.password.required");
  });

  test("deve retornar um erro para cada campo invalido", async () => {
    const { userRepository, useCase } = makeSut();

    const errors = await getErrors(
      useCase.execute({ name: "", email: "invalido", password: "123" }),
    );

    expect(errors).toEqual(
      expect.arrayContaining([
        "user.name.required",
        "user.email.invalid.email",
        "user.password.strong.password",
      ]),
    );
    expect(userRepository.createdUsers).toEqual([]);
  });

  test("deve rejeitar nome sem sobrenome", async () => {
    const { useCase } = makeSut();

    const errors = await getErrors(
      useCase.execute({ ...VALID_INPUT, name: "Joao" }),
    );

    expect(errors).toContain("user.name.person.name");
  });
});
