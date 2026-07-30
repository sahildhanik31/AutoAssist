const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Firebase ships separate web and react-native builds.
// This makes Metro pick the react-native build, which
// contains getReactNativePersistence.
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
