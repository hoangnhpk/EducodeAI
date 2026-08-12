import { isAxiosError } from 'axios';

export interface ApiError {
  status: number | null;
  code: string;
  message: string;
  details?: unknown;
}

const FALLBACK_MESSAGE = 'Đã xảy ra lỗi. Vui lòng thử lại.';

export const normalizeApiError = (error: unknown): ApiError => {
  if (!isAxiosError(error)) {
    return { status: null, code: 'UNKNOWN_ERROR', message: error instanceof Error ? error.message : FALLBACK_MESSAGE };
  }

  const body = error.response?.data as {
    message?: unknown;
    error?: { code?: unknown; message?: unknown };
    errors?: unknown;
    thongBao?: unknown;
  } | undefined;
  const nestedMessage = typeof body?.error?.message === 'string' ? body.error.message : undefined;
  const message = typeof body?.message === 'string'
    ? body.message
    : typeof body?.thongBao === 'string'
      ? body.thongBao
      : nestedMessage ?? (error.code === 'ECONNABORTED' ? 'Yêu cầu đã hết thời gian chờ.' : FALLBACK_MESSAGE);

  return {
    status: error.response?.status ?? null,
    code: typeof body?.error?.code === 'string' ? body.error.code : error.code ?? 'HTTP_ERROR',
    message,
    details: body?.errors,
  };
};
