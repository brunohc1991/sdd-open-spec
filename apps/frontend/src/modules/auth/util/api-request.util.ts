import { ApiRequestError } from './api-error.util';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function apiRequest<T>(path: string, token: string | null, init: RequestInit = {}): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  } catch {
    throw new ApiRequestError(0, []);
  }

  const text = await response.text();
  let body: unknown = null;

  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = null;
  }

  if (!response.ok) {
    const errors = (body as { errors?: unknown } | null)?.errors;
    const codes = Array.isArray(errors)
      ? errors.filter((code): code is string => typeof code === 'string')
      : [];

    throw new ApiRequestError(response.status, codes);
  }

  return body as T;
}
