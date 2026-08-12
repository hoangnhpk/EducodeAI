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
  let id = await AsyncStorage.getItem(AUTH_STORAGE_KEYS.deviceId);
  if (!id) {
    id = generateDeviceId();
    await AsyncStorage.setItem(AUTH_STORAGE_KEYS.deviceId, id);
  }

  return { maThietBi: id, tenThietBi: buildDeviceName(Constants.expoConfig?.name, Platform.OS) };
};
