import { Redirect } from 'expo-router';

/**
 * Redirect tạm về Home để demo module Discovery.
 * Sẽ được thay bằng splash/auth bootstrap của module Auth (Âu).
 */
export default function Index() {
  return <Redirect href="/home" />;
}
