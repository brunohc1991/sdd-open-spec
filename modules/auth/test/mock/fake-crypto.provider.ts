import { createHash } from "crypto";
import { CryptoProvider } from "../../src";

export class FakeCryptoProvider implements CryptoProvider {
  readonly encryptedPasswords: string[] = [];

  async encrypt(value: string): Promise<string> {
    this.encryptedPasswords.push(value);

    return this.hash(value);
  }

  async comparePassword(value: string, hash: string): Promise<boolean> {
    return this.hash(value) === hash;
  }

  private hash(value: string): string {
    const digest = createHash("sha256").update(value).digest("hex");

    return `$2b$10$${digest.slice(0, 53)}`;
  }
}
