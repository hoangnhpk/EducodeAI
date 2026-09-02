import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { STORAGE_KEYS } from '../constants/storage-keys';

export interface DeviceMetadata {
  maThietBi: string;
  tenThietBi?: string;
}

let pendingMetadata: Promise<DeviceMetadata> | null = null;

const createDeviceId = (): string => {
  const random = `${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;
  return `mobile_${Date.now().toString(36)}_${random.slice(0, 20)}`;
};

const getDeviceName = (): string => {
  const appName = Constants.expoConfig?.name?.trim() || 'EduCodeAI';
  const platform = Platform.OS === 'ios' ? 'iOS' : Platform.OS === 'android' ? 'Android' : Platform.OS;
  return `${appName} (${platform})`;
};

const loadDeviceMetadata = async (): Promise<DeviceMetadata> => {
  let maThietBi = await AsyncStorage.getItem(STORAGE_KEYS.deviceId);
  if (!maThietBi) {
    maThietBi = createDeviceId();
    await AsyncStorage.setItem(STORAGE_KEYS.deviceId, maThietBi);
  }
  return { maThietBi, tenThietBi: getDeviceName() };
};

export const getDeviceMetadata = (): Promise<DeviceMetadata> => {
  pendingMetadata ??= loadDeviceMetadata().finally(() => {
    pendingMetadata = null;
  });
  return pendingMetadata;
};
