export interface JwtUserPayload {
  sub: string;
  name: string;
  email: string;
}

function base64UrlToBytes(value: string): Uint8Array {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

export function decodeJwtPayload(token: string): JwtUserPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const json = new TextDecoder('utf-8').decode(base64UrlToBytes(parts[1]));
    const payload: unknown = JSON.parse(json);

    if (typeof payload !== 'object' || payload === null) return null;

    const { sub, name, email } = payload as Record<string, unknown>;
    if (typeof sub !== 'string' || typeof name !== 'string' || typeof email !== 'string') {
      return null;
    }

    return { sub, name, email };
  } catch {
    return null;
  }
}
