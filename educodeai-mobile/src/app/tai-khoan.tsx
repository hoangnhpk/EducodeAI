import { Redirect } from 'expo-router';

/** Account entry: tab là cửa chính → redirect về /(tabs)/account. */
export default function TaiKhoanRedirect() {
  return <Redirect href="/(tabs)/account" />;
}
