import type { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "Social Chat",
  slug: "social-chat-app",
  version: "1.0.0",
  orientation: "portrait",
  userInterfaceStyle: "automatic",
  ios: {
    supportsTablet: false,
    bundleIdentifier: "com.socialchat.app",
  },
  android: {
    package: "com.socialchat.app",
    permissions: ["POST_NOTIFICATIONS"],
  },
  web: {
    bundler: "metro",
    output: "static",
  },
};

export default config;
