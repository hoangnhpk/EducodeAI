import React from 'react';
import { AuthField } from './auth-field';

export type CaptchaInputProps = {
  token: string;
  onTokenChange(token: string): void;
  error?: string;
};

/** Contract-neutral input. Replace with the approved native CAPTCHA provider without changing screens. */
export function CaptchaInput({ token, onTokenChange, error }: CaptchaInputProps) {
  return (
    <AuthField
      label="Mã xác minh CAPTCHA"
      value={token}
      onChangeText={onTokenChange}
      autoCapitalize="none"
      error={error}
      placeholder="Nhập token từ CAPTCHA đã xác minh"
    />
  );
}
