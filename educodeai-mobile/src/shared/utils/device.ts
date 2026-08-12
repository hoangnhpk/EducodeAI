export const generateDeviceId = (
  now = Date.now(),
  random = Math.random(),
): string => `native_${now.toString(36)}_${random.toString(36).slice(2, 12)}`;

export const buildDeviceName = (
  appName: string | null | undefined,
  platform: string,
): string => {
  const osName = platform === 'ios' ? 'iOS' : platform === 'android' ? 'Android' : platform;
  return `${appName || 'EduCodeAI'} - ${osName}`;
};
