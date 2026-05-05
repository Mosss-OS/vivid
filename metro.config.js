const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure .ts and .tsx files can be resolved
config.resolver.sourceExts = ['jsx', 'js', 'ts', 'tsx', ...(config.resolver.sourceExts || [])];

module.exports = config;
