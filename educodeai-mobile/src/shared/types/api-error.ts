export interface BackendApiError {
  code?: string;
  message?: string;
}

export interface BackendApiEnvelope {
  success?: boolean;
  error?: BackendApiError | string | null;
  message?: string;
  title?: string;
  errors?: Record<string, string[] | string>;
  reason?: string;
}

export type ApiErrorKind =
  | 'http'
  | 'network'
  | 'timeout'
  | 'cancelled'
  | 'unknown';

export interface ApiErrorShape {
  name: 'ApiError';
  kind: ApiErrorKind;
  message: string;
  status: number | null;
  code: string | null;
  details?: unknown;
}
