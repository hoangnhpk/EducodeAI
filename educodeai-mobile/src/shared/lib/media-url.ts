const ABSOLUTE_URL_PATTERN = /^[a-z][a-z\d+.-]*:/i;

const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/+$/, '') ?? '';
const configuredMediaUrl = process.env.EXPO_PUBLIC_MEDIA_URL?.trim().replace(/\/+$/, '') || configuredApiUrl;

export const normalizeMediaUrl = (
  value: string | null | undefined,
  baseUrl = configuredMediaUrl,
): string | null => {
  const source = value?.trim();
  if (!source) return null;
  if (source.startsWith('//')) return `https:${source}`;
  if (ABSOLUTE_URL_PATTERN.test(source)) return source;
  if (!baseUrl) return null;
  return `${baseUrl.replace(/\/+$/, '')}/${source.replace(/^\/+/, '')}`;
};
