const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const required = (value: string, label: string) => value.trim() ? undefined : `${label} không được để trống.`;
export const emailError = (value: string) => required(value, 'Email') ?? (EMAIL.test(value.trim()) ? undefined : 'Email không hợp lệ.');
export const otpError = (value: string) => /^\d{6}$/.test(value) ? undefined : 'Mã OTP phải gồm 6 chữ số.';
export const passwordError = (value: string) => value.length >= 8 ? undefined : 'Mật khẩu phải có ít nhất 8 ký tự.';
export const matchingPasswordError = (password: string, confirmation: string) => password === confirmation ? undefined : 'Mật khẩu xác nhận không khớp.';
