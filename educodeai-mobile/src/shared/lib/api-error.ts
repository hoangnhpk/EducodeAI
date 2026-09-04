import { isAxiosError, type AxiosError } from 'axios';

import type { ApiErrorKind, ApiErrorShape, BackendApiEnvelope } from '../types/api-error';

const FALLBACK_MESSAGE = 'Đã xảy ra lỗi. Vui lòng thử lại.';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const firstValidationMessage = (errors: unknown): string | null => {
  if (!isRecord(errors)) return null;
  for (const value of Object.values(errors)) {
    if (typeof value === 'string' && value.trim()) return value;
    if (Array.isArray(value)) {
      const message = value.find((item): item is string => typeof item === 'string' && item.trim().length > 0);
      if (message) return message;
    }
  }
  return null;
};

const backendErrorDetails = (data: unknown): { message: string | null; code: string | null } => {
  if (typeof data === 'string') return { message: data.trim() || null, code: null };
  if (!isRecord(data)) return { message: null, code: null };
  const envelope = data as BackendApiEnvelope;
  if (isRecord(envelope.error)) {
    return {
      message: typeof envelope.error.message === 'string' ? envelope.error.message : null,
      code: typeof envelope.error.code === 'string' ? envelope.error.code : null,
    };
  }
  const validationMessage = firstValidationMessage(envelope.errors);
  return {
    message:
      (typeof envelope.message === 'string' && envelope.message) ||
      validationMessage ||
      (typeof envelope.title === 'string' && envelope.title) ||
      (typeof envelope.reason === 'string' && envelope.reason) ||
      null,
    code: null,
  };
};

export class ApiError extends Error implements ApiErrorShape {
  readonly name = 'ApiError' as const;
  constructor(
    readonly kind: ApiErrorKind,
    message: string,
    readonly status: number | null = null,
    readonly code: string | null = null,
    readonly details?: unknown,
  ) {
    super(message);
  }
}

export const normalizeApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) return error;
  if (!isAxiosError(error)) {
    return new ApiError('unknown', error instanceof Error ? error.message : FALLBACK_MESSAGE, null, null, error);
  }

  const axiosError = error as AxiosError<unknown>;
  const status = axiosError.response?.status ?? null;
  const backend = backendErrorDetails(axiosError.response?.data);
  if (axiosError.code === 'ERR_CANCELED') {
    return new ApiError('cancelled', backend.message ?? 'Yêu cầu đã bị hủy.', status, backend.code);
  }
  if (axiosError.code === 'ECONNABORTED' || axiosError.code === 'ETIMEDOUT') {
    return new ApiError('timeout', backend.message ?? 'Yêu cầu mất quá nhiều thời gian.', status, backend.code);
  }
  if (!axiosError.response) {
    return new ApiError('network', 'Không thể kết nối đến máy chủ.', null, axiosError.code ?? null);
  }
  return new ApiError('http', backend.message ?? FALLBACK_MESSAGE, status, backend.code, axiosError.response.data);
};

export const getApiErrorMessage = (error: unknown): string => normalizeApiError(error).message;
