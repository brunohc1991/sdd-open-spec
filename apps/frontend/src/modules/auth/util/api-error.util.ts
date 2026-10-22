import { toast } from 'sonner';
import { getMessage } from '@/shared/i18n';

export class ApiRequestError extends Error {
  constructor(
    readonly status: number,
    readonly codes: string[],
  ) {
    super(codes.join(', ') || `HTTP ${status}`);
    this.name = 'ApiRequestError';
  }
}

export function notifyApiError(error: unknown): void {
  if (error instanceof ApiRequestError && error.codes.length > 0) {
    error.codes.forEach((code) => toast.error(getMessage(code)));
    return;
  }

  toast.error(getMessage('DEFAULT_API_ERROR'));
}
