import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

export type CaptchaInputProps = { token: string; onTokenChange(token: string): void; error?: string };
const CAPTCHA_URL = process.env.EXPO_PUBLIC_CAPTCHA_URL || 'https://educodeai.top/mobile-captcha.html';
const allowedHost = 'educodeai.top';

export function CaptchaInput({ token, onTokenChange, error }: CaptchaInputProps) {
  const webViewRef = useRef<WebView>(null);
  const [loaded, setLoaded] = useState(false);
  const [webError, setWebError] = useState<string>();
  const validUrl = (() => { try { const url = new URL(CAPTCHA_URL); return url.protocol === 'https:' && url.hostname === allowedHost; } catch { return false; } })();
  useEffect(() => () => onTokenChange(''), [onTokenChange]);
  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const message = JSON.parse(event.nativeEvent.data) as { version?: number; type?: string; token?: string };
      if (message.version !== 1) return onTokenChange('');
      if (message.type === 'success' && typeof message.token === 'string' && message.token.trim()) onTokenChange(message.token);
      else if (message.type === 'error') { setWebError('Không thể tải CAPTCHA. Vui lòng thử lại.'); onTokenChange(''); }
      else if (message.type === 'expired') onTokenChange('');
    } catch { onTokenChange(''); }
  };
  if (!validUrl) return <Text style={styles.error}>CAPTCHA chưa được cấu hình an toàn.</Text>;
  return <View style={styles.container}><Text style={styles.label}>Xác minh CAPTCHA</Text>{!loaded && <ActivityIndicator color="#f69050" />}{token ? <Text style={styles.success}>Đã xác minh CAPTCHA</Text> : <WebView ref={webViewRef} source={{ uri: CAPTCHA_URL }} originWhitelist={['https://educodeai.top']} onLoadEnd={() => setLoaded(true)} onMessage={handleMessage} onError={() => setWebError('Không thể tải trang CAPTCHA.')} onHttpError={() => setWebError('Trang CAPTCHA không khả dụng.')} javaScriptEnabled domStorageEnabled style={styles.webview} />}{webError ? <Text style={styles.error}>{webError}</Text> : null}{error ? <Text style={styles.error}>{error}</Text> : null}<Pressable onPress={() => { setLoaded(false); setWebError(undefined); onTokenChange(''); webViewRef.current?.reload(); }}><Text style={styles.reset}>Làm mới CAPTCHA</Text></Pressable></View>;
}
const styles = StyleSheet.create({ container: { marginTop: 12, minHeight: 150 }, label: { color: '#374151', fontWeight: '700', marginBottom: 8 }, webview: { height: 125, backgroundColor: 'transparent' }, success: { color: '#059669', paddingVertical: 16, fontWeight: '700' }, error: { color: '#dc2626', marginTop: 6 }, reset: { color: '#f69050', marginTop: 8, fontWeight: '700' } });
