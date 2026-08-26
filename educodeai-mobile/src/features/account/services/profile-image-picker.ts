import * as ImagePicker from 'expo-image-picker';
import type { ProfileImageFile } from '../types/account.types';

export type PickProfileImage = () => Promise<ProfileImageFile | null>;

export const pickProfileImage: PickProfileImage = async () => {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Ứng dụng cần quyền truy cập thư viện ảnh để chọn ảnh đại diện.');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.85,
  });

  if (result.canceled || !result.assets[0]) return null;

  const asset = result.assets[0];
  const extension = asset.uri.split('.').pop()?.toLowerCase();
  const type = asset.mimeType ?? (extension === 'png' ? 'image/png' : 'image/jpeg');

  return {
    uri: asset.uri,
    name: asset.fileName ?? `avatar.${type === 'image/png' ? 'png' : 'jpg'}`,
    type,
  };
};
