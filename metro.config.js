const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add .ts extension resolution
config.resolver.sourceExts = ['jsx', 'js', 'ts', 'tsx', ...config.resolver.sourceExts];

module.exports = config;
