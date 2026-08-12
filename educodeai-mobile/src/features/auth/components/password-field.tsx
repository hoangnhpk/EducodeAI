import React from 'react';
import type { TextInputProps } from 'react-native';
import { AuthField } from './auth-field';

export function PasswordField(props: Omit<TextInputProps, 'secureTextEntry'> & { label?: string; error?: string }) {
  return <AuthField {...props} label={props.label ?? 'Mật khẩu'} error={props.error} secure />;
}
