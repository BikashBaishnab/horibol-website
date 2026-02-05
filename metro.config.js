const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Fix for react-native-image-viewing on web
if (process.env.EXPO_PUBLIC_PLATFORM === 'web' || process.env.NODE_ENV === 'production') {
    config.resolver.extraNodeModules = {
        ...config.resolver.extraNodeModules,
        'react-native-image-viewing': 'react-native-web/dist/exports/View',
    };
}

module.exports = withNativeWind(config, { input: "./global.css" });
