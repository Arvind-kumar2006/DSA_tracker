import { useEffect, useCallback } from 'react';

export function usePushNotifications({ enabled, dueCount, settingsLoaded }) {
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;
    const result = await Notification.requestPermission();
    return result === 'granted';
  }, []);

  useEffect(() => {
    if (!enabled || !settingsLoaded || dueCount === 0) return;

    const check = async () => {
      const granted = await requestPermission();
      if (!granted) return;

      const lastNotified = localStorage.getItem('lastDueNotification');
      const today = new Date().toDateString();
      if (lastNotified === today) return;

      new Notification('DSA Revision Tracker', {
        body: `${dueCount} question${dueCount > 1 ? 's' : ''} due for revision today`,
        icon: '/vite.svg',
      });
      localStorage.setItem('lastDueNotification', today);
    };

    check();
  }, [enabled, dueCount, settingsLoaded, requestPermission]);

  return { requestPermission };
}
