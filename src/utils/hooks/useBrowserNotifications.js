import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { apiGet, apiPost } from '../api';

const notificationSupported = () => {
  if (typeof window === 'undefined' || typeof Notification === 'undefined') {
    return false;
  }
  return true;
};

const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

export const useBrowserNotifications = () => {
  const isSupported = useMemo(() => notificationSupported(), []);

  const [permission, setPermission] = useState(() => {
    if (!isSupported) {
      return 'unsupported';
    }
    try {
      return Notification.permission;
    } catch (error) {
      console.error('通知権限の取得に失敗しました:', error);
      return 'unsupported';
    }
  });

  const autoSubscribeAttemptedRef = useRef(false);

  const subscribeToPush = useCallback(async () => {
    if (!isSupported) {
      return { success: false, message: 'notification-not-supported' };
    }
    if (permission !== 'granted') {
      return { success: false, message: 'permission-not-granted' };
    }
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return { success: false, message: 'push-not-supported' };
    }

    try {
      let registration = await navigator.serviceWorker.getRegistration('/notification-sw.js');
      if (!registration) {
        registration = await navigator.serviceWorker.register('/notification-sw.js');
      }

      if (!registration?.pushManager) {
        return { success: false, message: 'push-manager-unavailable' };
      }

      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        const publicKeyResponse = await apiGet('/api/notifications/public-key');
        if (!publicKeyResponse.success || !publicKeyResponse.data?.publicKey) {
          return { success: false, message: 'missing-public-key' };
        }

        const applicationServerKey = urlBase64ToUint8Array(publicKeyResponse.data.publicKey);
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey,
        });
      }

      await apiPost('/api/notifications/subscribe', {
        subscription: subscription.toJSON(),
      });

      return { success: true };
    } catch (error) {
      console.error('プッシュ通知の登録に失敗しました:', error);
      autoSubscribeAttemptedRef.current = false;
      return { success: false, message: error.message || 'subscription-error' };
    }
  }, [isSupported, permission]);

  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      return 'unsupported';
    }
    if (permission === 'granted') {
      await subscribeToPush();
      return 'granted';
    }
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === 'granted') {
        await subscribeToPush();
      }
      return result;
    } catch (error) {
      console.error('通知権限のリクエストに失敗しました:', error);
      setPermission('denied');
      return 'denied';
    }
  }, [isSupported, permission, subscribeToPush]);

  const showNotification = useCallback(
    (title, options = {}) => {
      if (!isSupported || permission !== 'granted') {
        return null;
      }
      try {
        const notification = new Notification(title, options);
        return notification;
      } catch (error) {
        console.error('通知の表示に失敗しました:', error);
        return null;
      }
    },
    [isSupported, permission]
  );

  useEffect(() => {
    if (!isSupported || permission !== 'granted') {
      autoSubscribeAttemptedRef.current = false;
      return;
    }
    if (autoSubscribeAttemptedRef.current) {
      return;
    }
    autoSubscribeAttemptedRef.current = true;
    subscribeToPush()
      .then((result) => {
        if (!result?.success) {
          autoSubscribeAttemptedRef.current = false;
        }
      })
      .catch((error) => {
        console.error('自動プッシュ通知登録に失敗しました:', error);
      autoSubscribeAttemptedRef.current = false;
      });
  }, [isSupported, permission, subscribeToPush]);

  return {
    isSupported,
    permission,
    requestPermission,
    showNotification,
    subscribeToPush,
  };
};

export default useBrowserNotifications;

