const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

const svgEntry = path.resolve(
  __dirname,
  'node_modules/react-native-svg/lib/commonjs/index.js'
);

const upstreamResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Ép dùng bản đã compile — tránh Metro fail resolve `src/.../extractBrush` (Windows/OneDrive).
  if (moduleName === 'react-native-svg') {
    return { type: 'sourceFile', filePath: svgEntry };
  }
  if (typeof upstreamResolveRequest === 'function') {
    return upstreamResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
