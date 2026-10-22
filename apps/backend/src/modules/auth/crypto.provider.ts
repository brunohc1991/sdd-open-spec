import { Injectable } from '@nestjs/common';
import { CryptoProvider } from '@sdd/auth';
import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

@Injectable()
export class BcryptCryptoProvider implements CryptoProvider {
  encrypt(value: string): Promise<string> {
    return bcrypt.hash(value, SALT_ROUNDS);
  }

  comparePassword(value: string, hash: string): Promise<boolean> {
    return bcrypt.compare(value, hash);
  }
}
