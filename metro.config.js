// Metro config para o Expo SDK 54 + Firebase v12.
// Adiciona a extensão .cjs (Firebase 9+ usa) e desabilita exports não-experimentais
// que conflitam com a forma como o Firebase declara seus subpaths.
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.sourceExts = [...config.resolver.sourceExts, 'cjs'];
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
