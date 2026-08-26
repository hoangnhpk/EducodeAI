import React, { useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import { AuthField } from './auth-field';

export type CaptchaInputProps = { token: string; onTokenChange(token: string): void; error?: string };

const siteKey = process.env.EXPO_PUBLIC_RECAPTCHA_SITE_KEY?.trim();

export function CaptchaInput({ token, onTokenChange, error }: CaptchaInputProps) {
  const [loaded, setLoaded] = useState(false);
  const webViewRef = useRef<WebView>(null);
  const source = useMemo(() => ({ html: `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><script src="https://www.google.com/recaptcha/api.js" async defer></script><style>body{margin:0;background:transparent;font-family:Arial}.g-recaptcha{transform:scale(.9);transform-origin:0 0}</style></head><body><div class="g-recaptcha" data-sitekey="${siteKey || ''}" data-callback="captchaSuccess" data-expired-callback="captchaExpired" data-error-callback="captchaError"></div><script>function send(type,value){window.ReactNativeWebView.postMessage(JSON.stringify({type,value:value||''}))}function captchaSuccess(value){send('success',value)}function captchaExpired(){send('expired','')}function captchaError(){send('error','')}</script></body></html>`, baseUrl: 'https://localhost' }), []);
  const [webError, setWebError] = useState<string>();
  const handleMessage = (event: WebViewMessageEvent) => { try { const message = JSON.parse(event.nativeEvent.data) as { type: string; value?: string }; if (message.type === 'success' && message.value) onTokenChange(message.value); else if (message.type === 'error') { setWebError('Google CAPTCHA không thể tải trên thiết bị này.'); onTokenChange(''); } else if (message.type !== 'success') onTokenChange(''); } catch { onTokenChange(''); } };
  if (!siteKey) return <AuthField label="Mã CAPTCHA" value={token} onChangeText={onTokenChange} error="Thiếu EXPO_PUBLIC_RECAPTCHA_SITE_KEY." />;
  return <View style={styles.container}><Text style={styles.label}>Xác minh CAPTCHA</Text>{!loaded && <ActivityIndicator color="#f69050" />}{token ? <Text style={styles.success}>Đã xác minh CAPTCHA</Text> : <WebView ref={webViewRef} originWhitelist={['*']} source={source} onLoadEnd={() => setLoaded(true)} onMessage={handleMessage} onError={() => setWebError('Không thể tải trang CAPTCHA. Kiểm tra Internet trên điện thoại.')} javaScriptEnabled domStorageEnabled thirdPartyCookiesEnabled style={styles.webview} />}{webError ? <Text style={styles.error}>{webError}</Text> : null}{error ? <Text style={styles.error}>{error}</Text> : null}<Pressable onPress={() => { setWebError(undefined); onTokenChange(''); webViewRef.current?.reload(); }}><Text style={styles.reset}>Làm mới CAPTCHA</Text></Pressable></View>;
}

const styles = StyleSheet.create({ container: { marginTop: 12, minHeight: 150 }, label: { color: '#374151', fontWeight: '700', marginBottom: 8 }, webview: { height: 125, backgroundColor: 'transparent' }, success: { color: '#059669', paddingVertical: 16, fontWeight: '700' }, error: { color: '#dc2626', marginTop: 6 }, reset: { color: '#f69050', marginTop: 8, fontWeight: '700' } });
