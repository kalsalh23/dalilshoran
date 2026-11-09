import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'org.dalilshoran.app',
  appName: 'دليل صوران الطبي',
  webDir: '.',
  bundledWebAssets: false,
  server: {
    url: 'https://dalilshoran-main.vercel.app',
    cleartext: false,
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
      releaseType: 'APK',
    },
  },
};

export default config;
