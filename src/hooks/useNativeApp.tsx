import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { App, URLOpenListenerEvent } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';

export interface NativeAppState {
  isNative: boolean;
  platform: string;
  isReady: boolean;
}

export const useNativeApp = () => {
  const [state, setState] = useState<NativeAppState>({
    isNative: Capacitor.isNativePlatform(),
    platform: Capacitor.getPlatform(),
    isReady: false
  });

  useEffect(() => {
    const initNativeApp = async () => {
      if (!Capacitor.isNativePlatform()) {
        setState(prev => ({ ...prev, isReady: true }));
        return;
      }

      try {
        // Configure status bar
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: '#0D1117' });
        
        // Hide splash screen after app is ready
        await SplashScreen.hide();
        
        setState(prev => ({ ...prev, isReady: true }));
      } catch (error) {
        console.error('Native app init error:', error);
        setState(prev => ({ ...prev, isReady: true }));
      }
    };

    // Listen for deep links
    App.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
      console.log('App opened with URL:', event.url);
      // Handle deep linking
      const slug = event.url.split('.app').pop();
      if (slug) {
        window.location.href = slug;
      }
    });

    // Listen for app state changes
    App.addListener('appStateChange', ({ isActive }) => {
      console.log('App state changed. Is active?', isActive);
    });

    // Handle back button on Android
    App.addListener('backButton', ({ canGoBack }) => {
      if (!canGoBack) {
        App.exitApp();
      } else {
        window.history.back();
      }
    });

    initNativeApp();

    return () => {
      App.removeAllListeners();
    };
  }, []);

  return state;
};
