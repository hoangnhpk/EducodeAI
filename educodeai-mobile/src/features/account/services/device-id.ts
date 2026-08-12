import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const DEVICE_ID_KEY = 'educodeai.current-device-id';

function createDeviceId(): string {
  return `mobile-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

export async function getCurrentDeviceId(): Promise<string> {
  const stored = await AsyncStorage.getItem(DEVICE_ID_KEY);
  if (stored) return stored;

  const created = createDeviceId();
  await AsyncStorage.setItem(DEVICE_ID_KEY, created);
  return created;
}

export function getCurrentDeviceName(): string {
  return Platform.OS === 'ios' ? 'Thiết bị iOS' : Platform.OS === 'android' ? 'Thiết bị Android' : 'Thiết bị di động';
}
