import { AxiosError, AxiosHeaders } from 'axios';

import { getApiErrorMessage, normalizeApiError } from '../lib/api-error';

const responseError = (data: unknown, status = 400): AxiosError<unknown> =>
  new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data,
    status,
    statusText: 'Bad Request',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });

describe('API error normalization', () => {
  it('prefers an ASP.NET validation field message over the generic problem title', () => {
    const error = responseError({
      title: 'One or more validation errors occurred.',
      errors: { CaptchaToken: ['Thiếu mã xác minh Captcha.'] },
    });

    expect(getApiErrorMessage(error)).toBe('Thiếu mã xác minh Captcha.');
  });

  it('keeps a specific backend message ahead of validation details', () => {
    const error = responseError({
      message: 'Yêu cầu không hợp lệ.',
      errors: { Email: ['Email không hợp lệ.'] },
    });

    expect(getApiErrorMessage(error)).toBe('Yêu cầu không hợp lệ.');
  });

  it('retains the validation response as safe diagnostic details', () => {
    const data = { errors: { OtpCode: ['The field OtpCode is invalid.'] } };
    const normalized = normalizeApiError(responseError(data));

    expect(normalized.message).toBe('The field OtpCode is invalid.');
    expect(normalized.details).toBe(data);
  });
});
