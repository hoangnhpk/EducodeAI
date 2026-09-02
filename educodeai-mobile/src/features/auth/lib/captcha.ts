const DEVELOPMENT_CAPTCHA_TOKEN = 'SKIP_CAPTCHA';

const CAPTCHA_UNAVAILABLE_MESSAGE =
  'Xác minh CAPTCHA chưa được cấu hình cho ứng dụng. Vui lòng thử lại trên website.';

export const getPublicAuthCaptchaToken = (): string => {
  if (__DEV__) return DEVELOPMENT_CAPTCHA_TOKEN;
  throw new Error(CAPTCHA_UNAVAILABLE_MESSAGE);
};
