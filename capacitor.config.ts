import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.7ba1311d0d744c7285b5d9f0e1f1df3a',
  appName: 'Betfuz',
  webDir: 'dist',
  server: {
    url: 'https://7ba1311d-0d74-4c72-85b5-d9f0e1f1df3a.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    },
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#0D1117',
      showSpinner: true,
      spinnerColor: '#10B981'
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0D1117'
    }
  }
};

export default config;
