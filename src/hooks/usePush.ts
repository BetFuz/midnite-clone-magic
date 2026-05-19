import { useState, useEffect } from 'react';
import { registerSW, requestPushPermission, showLocalNotification } from '@/lib/push';

type PushState = 'idle' | 'requesting' | 'granted' | 'denied' | 'unsupported';

export function usePush() {
  const [state, setState] = useState<PushState>('idle');

  useEffect(() => {
    if (!('Notification' in window)) {
      setState('unsupported');
      return;
    }
    if (Notification.permission === 'granted') setState('granted');
    else if (Notification.permission === 'denied') setState('denied');
  }, []);

  const enable = async () => {
    setState('requesting');
    await registerSW();
    const perm = await requestPushPermission();
    setState(perm === 'granted' ? 'granted' : perm === 'denied' ? 'denied' : 'idle');
    if (perm === 'granted') {
      showLocalNotification('BetFuz Notifications On', 'You\'ll get bet results and promotions instantly!', '/');
    }
  };

  return { state, enable };
}
