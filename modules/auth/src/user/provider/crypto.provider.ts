export interface CryptoProvider {
  encrypt(value: string): Promise<string>;
  comparePassword(value: string, hash: string): Promise<boolean>;
}
