import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

export type CaptchaInputProps = { token: string; onTokenChange(token: string): void; error?: string };

const CAPTCHA_SITE_KEY = (process.env.EXPO_PUBLIC_RECAPTCHA_SITE_KEY || '').trim();
const CAPTCHA_BASE_URL = 'https://educodeai.top/';

const createCaptchaHtml = (siteKey: string) => `<!doctype html>
<html lang="vi">
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
  <meta http-equiv="Content-Security-Policy" content="default-src 'self' https://www.google.com https://www.gstatic.com; frame-src https://www.google.com/recaptcha/ https://recaptcha.google.com/recaptcha/; script-src 'self' 'unsafe-inline' https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/; style-src 'self' 'unsafe-inline';">
  <script src="https://www.google.com/recaptcha/api.js" async defer></script>
  <style>html,body{margin:0;padding:0;background:transparent;overflow:hidden}body{display:flex;justify-content:center}.g-recaptcha{margin-top:4px}</style>
</head>
<body>
  <div class="g-recaptcha" data-sitekey="${siteKey}" data-callback="captchaSuccess" data-expired-callback="captchaExpired" data-error-callback="captchaError"></div>
  <script>
    function send(type, token) { window.ReactNativeWebView.postMessage(JSON.stringify({version:1,type:type,token:token || ''})); }
    function captchaSuccess(token) { send('success', token); }
    function captchaExpired() { send('expired'); }
    function captchaError() { send('error'); }
  </script>
</body>
</html>`;

export function CaptchaInput({ token, onTokenChange, error }: CaptchaInputProps) {
  const webViewRef = useRef<WebView>(null);
  const [loaded, setLoaded] = useState(false);
  const [webError, setWebError] = useState<string>();
  const source = useMemo(() => ({ html: createCaptchaHtml(CAPTCHA_SITE_KEY), baseUrl: CAPTCHA_BASE_URL }), []);

  useEffect(() => () => onTokenChange(''), [onTokenChange]);

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const message = JSON.parse(event.nativeEvent.data) as { version?: number; type?: string; token?: string };
      if (message.version !== 1) return onTokenChange('');
      if (message.type === 'success' && typeof message.token === 'string' && message.token.trim()) {
        setWebError(undefined);
        onTokenChange(message.token);
      } else if (message.type === 'error') {
        setWebError('Không thể tải CAPTCHA. Vui lòng thử lại.');
        onTokenChange('');
      } else if (message.type === 'expired') onTokenChange('');
    } catch {
      onTokenChange('');
    }
  };

  if (!CAPTCHA_SITE_KEY) return <Text style={styles.error}>CAPTCHA chưa được cấu hình.</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Xác minh CAPTCHA</Text>
      {!loaded && <ActivityIndicator color="#f69050" />}
      {!token && (
        <WebView
          ref={webViewRef}
          source={source}
          originWhitelist={['https://educodeai.top', 'about:blank']}
          onLoadEnd={() => setLoaded(true)}
          onMessage={handleMessage}
          onError={() => setWebError('Không thể tải CAPTCHA.')}
          onHttpError={() => setWebError('CAPTCHA không khả dụng.')}
          javaScriptEnabled
          domStorageEnabled
          style={styles.webview}
        />
      )}
      {token ? <Text style={styles.success}>Đã xác minh CAPTCHA</Text> : null}
      {webError ? <Text style={styles.error}>{webError}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable onPress={() => { setLoaded(false); setWebError(undefined); onTokenChange(''); webViewRef.current?.reload(); }}>
        <Text style={styles.reset}>Làm mới CAPTCHA</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 12, minHeight: 150 },
  label: { color: '#374151', fontWeight: '700', marginBottom: 8 },
  webview: { height: 125, backgroundColor: 'transparent' },
  success: { color: '#059669', paddingVertical: 16, fontWeight: '700' },
  error: { color: '#dc2626', marginTop: 6 },
  reset: { color: '#f69050', marginTop: 8, fontWeight: '700' },
});
