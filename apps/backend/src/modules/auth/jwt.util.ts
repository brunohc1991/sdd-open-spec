import { sign } from 'jsonwebtoken';

const TOKEN_EXPIRES_IN_SECONDS = 7 * 24 * 60 * 60;

export interface TokenUser {
  id: string;
  name: string;
  email: string;
}

export function signUserToken(user: TokenUser, secret: string): string {
  return sign({ sub: user.id, name: user.name, email: user.email }, secret, {
    expiresIn: TOKEN_EXPIRES_IN_SECONDS,
  });
}
