import {
  EmailRule,
  MaxLengthRule,
  MinLengthRule,
  PersonNameRule,
  RequiredRule,
  StrongPasswordRule,
  UseCase,
  Validator,
} from "@sdd/shared";
import { EmailAlreadyRegisteredError } from "../error";
import { User } from "../model";
import { CryptoProvider, UserRepository } from "../provider";

export interface SaveUserIn {
  id?: string;
  name: string;
  email: string;
  password?: string;
}

export class SaveUser implements UseCase<SaveUserIn, void> {
  constructor(
    private readonly cryptoProvider: CryptoProvider,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(input: SaveUserIn): Promise<void> {
    const existing = input.id
      ? await this.userRepository.findById(input.id)
      : null;
    const hasPassword = input.password !== undefined && input.password !== null && input.password !== "";
    const changesPassword = !existing || hasPassword;

    Validator.validate([
      {
        code: "user.name",
        value: input.name,
        rules: [
          new RequiredRule(),
          new MinLengthRule(3),
          new MaxLengthRule(80),
          new PersonNameRule(),
        ],
      },
      {
        code: "user.email",
        value: input.email,
        rules: [new RequiredRule(), new EmailRule()],
      },
      ...(changesPassword
        ? [
            {
              code: "user.password",
              value: input.password,
              rules: [new RequiredRule(), new StrongPasswordRule()],
            },
          ]
        : []),
    ]);

    const userWithEmail = await this.userRepository.findByEmail(input.email);

    if (userWithEmail && userWithEmail.id !== existing?.id) {
      throw new EmailAlreadyRegisteredError();
    }

    const password = changesPassword
      ? await this.cryptoProvider.encrypt(input.password as string)
      : (existing as User).password;

    if (existing) {
      const updated = existing.clone({
        name: input.name,
        email: input.email,
        password,
      });

      updated.validate();
      await this.userRepository.update(updated);
      return;
    }

    const created = new User({
      id: input.id,
      name: input.name,
      email: input.email,
      password,
    });

    created.validate();
    await this.userRepository.create(created);
  }
}
