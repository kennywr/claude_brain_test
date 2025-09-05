import { config } from 'dotenv';

// Load environment variables from .env file
config();

export default {
  expo: {
    name: "BraintestMobile",
    slug: "BraintestMobile",
    owner: "kennywr",
    version: "1.4.1",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true
    },
    android: {
      package: "com.kennywr.braintestmobile",
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    extra: {
      pexelsApiKey: process.env.PEXELS_API_KEY,
      eas: {
        projectId: "c1cf6eae-5369-4b2b-965c-bfb3363bba22"
      }
    },
  },
};