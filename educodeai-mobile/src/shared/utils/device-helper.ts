import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { AUTH_STORAGE_KEYS } from '../constants/storage-keys';
import { buildDeviceName, generateDeviceId } from './device';

export { buildDeviceName, generateDeviceId } from './device';

export interface DeviceInfo {
  maThietBi: string;
  tenThietBi: string;
}

export const getDeviceInfo = async (): Promise<DeviceInfo> => {
  try {
    const id = await Promise.race([
      AsyncStorage.getItem(AUTH_STORAGE_KEYS.deviceId),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 2_000)),
    ]);
    if (id) return { maThietBi: id, tenThietBi: buildDeviceName(Constants.expoConfig?.name, Platform.OS) };
  } catch {
    // Fall back to a generated device id when native storage is unavailable.
  }
  const id = generateDeviceId();
  void AsyncStorage.setItem(AUTH_STORAGE_KEYS.deviceId, id).catch(() => undefined);
  return { maThietBi: id, tenThietBi: buildDeviceName(Constants.expoConfig?.name, Platform.OS) };
};
