import { ValidationException } from "@sdd/shared";
import { EmailAlreadyRegisteredError, SaveUser, User } from "../../../src";
import { FakeCryptoProvider, FakeUserRepository } from "../../mock";

const VALID = { name: "Maria Silva", email: "maria@silva.com", password: "Strong@123" };
const EXISTING_ID = "6f0f3b55-9a0e-4a54-8f43-3a2d6a6d2f11";
const OTHER_ID = "0b6c1f0e-5f7a-4f0e-9c1b-7d1f6a4c2e22";

async function makeSut() {
  const cryptoProvider = new FakeCryptoProvider();
  const userRepository = new FakeUserRepository();
  const useCase = new SaveUser(cryptoProvider, userRepository);

  return { cryptoProvider, userRepository, useCase };
}

async function makeSutWithExisting() {
  const sut = await makeSut();
  const hash = await sut.cryptoProvider.encrypt("Original@123");
  const existing = new User({
    id: EXISTING_ID,
    name: "Joao Original",
    email: "joao@original.com",
    password: hash,
  });
  await sut.userRepository.create(existing);
  sut.cryptoProvider.encryptedPasswords.length = 0;

  return { ...sut, existing, hash };
}

async function getErrors(promise: Promise<unknown>): Promise<string[]> {
  try {
    await promise;
    return [];
  } catch (error) {
    return (error as ValidationException).errors.map((item) => item.message);
  }
}

describe("SaveUser", () => {
  describe("criacao", () => {
    test("deve criar sem id com novo id e senha criptografada", async () => {
      const { cryptoProvider, userRepository, useCase } = await makeSut();

      await expect(useCase.execute(VALID)).resolves.toBeUndefined();

      expect(userRepository.createdUsers).toHaveLength(1);
      const [saved] = userRepository.createdUsers;
      expect(saved.id).toEqual(expect.any(String));
      expect(saved.name).toBe(VALID.name);
      expect(saved.email).toBe(VALID.email);
      expect(saved.password).not.toBe(VALID.password);
      expect(cryptoProvider.encryptedPasswords).toEqual([VALID.password]);
    });

    test("deve criar usando o id recebido quando findById nao encontra usuario", async () => {
      const { userRepository, useCase } = await makeSut();

      await useCase.execute({ ...VALID, id: EXISTING_ID });

      expect(userRepository.createdUsers).toHaveLength(1);
      expect(userRepository.createdUsers[0].id).toBe(EXISTING_ID);
    });

    test("deve exigir senha na criacao", async () => {
      const { userRepository, useCase } = await makeSut();

      const errors = await getErrors(
        useCase.execute({ name: VALID.name, email: VALID.email }),
      );

      expect(errors).toContain("user.password.required");
      expect(userRepository.createdUsers).toEqual([]);
    });

    test("deve rejeitar senha fraca na criacao sem efeitos colaterais", async () => {
      const { cryptoProvider, userRepository, useCase } = await makeSut();

      const errors = await getErrors(
        useCase.execute({ ...VALID, password: "123456" }),
      );

      expect(errors).toContain("user.password.strong.password");
      expect(cryptoProvider.encryptedPasswords).toEqual([]);
      expect(userRepository.createdUsers).toEqual([]);
    });

    test("deve acumular erros de nome e e-mail invalidos", async () => {
      const { useCase } = await makeSut();

      const errors = await getErrors(
        useCase.execute({ ...VALID, name: "Maria", email: "invalido" }),
      );

      expect(errors).toEqual(
        expect.arrayContaining(["user.name.person.name", "user.email.invalid.email"]),
      );
    });

    test("deve falhar com e-mail de outro usuario", async () => {
      const { userRepository, useCase } = await makeSutWithExisting();

      await expect(
        useCase.execute({ ...VALID, email: "joao@original.com" }),
      ).rejects.toBeInstanceOf(EmailAlreadyRegisteredError);
      expect(userRepository.createdUsers).toHaveLength(1);
    });
  });

  describe("atualizacao", () => {
    test("deve atualizar o usuario existente e re-hashear a nova senha", async () => {
      const { cryptoProvider, userRepository, useCase, hash } = await makeSutWithExisting();

      await useCase.execute({
        id: EXISTING_ID,
        name: "Joao Atualizado",
        email: "joao@novo.com",
        password: "Another@123",
      });

      expect(userRepository.createdUsers).toHaveLength(1);
      const [updated] = userRepository.createdUsers;
      expect(updated.id).toBe(EXISTING_ID);
      expect(updated.name).toBe("Joao Atualizado");
      expect(updated.email).toBe("joao@novo.com");
      expect(updated.password).not.toBe(hash);
      expect(cryptoProvider.encryptedPasswords).toEqual(["Another@123"]);
    });

    test.each([
      ["ausente", undefined],
      ["vazia", ""],
    ])("deve manter o hash atual quando a senha esta %s", async (_label, password) => {
      const { cryptoProvider, userRepository, useCase, hash } = await makeSutWithExisting();

      await useCase.execute({
        id: EXISTING_ID,
        name: "Joao Atualizado",
        email: "joao@original.com",
        password,
      });

      const [updated] = userRepository.createdUsers;
      expect(updated.name).toBe("Joao Atualizado");
      expect(updated.password).toBe(hash);
      expect(cryptoProvider.encryptedPasswords).toEqual([]);
    });

    test("deve permitir manter o proprio e-mail", async () => {
      const { useCase, userRepository } = await makeSutWithExisting();

      await expect(
        useCase.execute({ id: EXISTING_ID, name: "Joao Original", email: "joao@original.com" }),
      ).resolves.toBeUndefined();
      expect(userRepository.createdUsers).toHaveLength(1);
    });

    test("deve rejeitar e-mail que pertence a outro usuario", async () => {
      const { userRepository, useCase } = await makeSutWithExisting();
      await useCase.execute({ ...VALID, id: OTHER_ID });

      await expect(
        useCase.execute({ id: EXISTING_ID, name: "Joao Original", email: VALID.email }),
      ).rejects.toBeInstanceOf(EmailAlreadyRegisteredError);
      expect(userRepository.createdUsers.find((u) => u.id === EXISTING_ID)?.email).toBe(
        "joao@original.com",
      );
    });

    test("deve rejeitar senha fraca informada na edicao", async () => {
      const { cryptoProvider, useCase } = await makeSutWithExisting();

      const errors = await getErrors(
        useCase.execute({
          id: EXISTING_ID,
          name: "Joao Original",
          email: "joao@original.com",
          password: "123",
        }),
      );

      expect(errors).toContain("user.password.strong.password");
      expect(cryptoProvider.encryptedPasswords).toEqual([]);
    });

    test("deve rejeitar senha so com espacos na edicao", async () => {
      const { useCase } = await makeSutWithExisting();

      const errors = await getErrors(
        useCase.execute({
          id: EXISTING_ID,
          name: "Joao Original",
          email: "joao@original.com",
          password: "   ",
        }),
      );

      expect(errors).toContain("user.password.required");
    });
  });
});
