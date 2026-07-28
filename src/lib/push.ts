// Utility functions for Web Push Notifications

export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = typeof window !== 'undefined' ? window.atob(base64) : Buffer.from(base64, 'base64').toString('binary');
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.warn('Service Worker is not supported in this environment.');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    await navigator.serviceWorker.ready;
    return registration;
  } catch (err) {
    console.error('Service Worker registration failed:', err);
    return null;
  }
}

export async function subscribeUserToPush(registration: ServiceWorkerRegistration, publicVapidKey?: string): Promise<PushSubscription | null> {
  if (!('PushManager' in window)) {
    console.warn('Push Messaging is not supported in this browser.');
    return null;
  }

  try {
    let subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      return subscription;
    }

    const applicationServerKey = publicVapidKey
      ? urlBase64ToUint8Array(publicVapidKey)
      : undefined;

    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey as BufferSource | undefined,
    });

    return subscription;
  } catch (err) {
    console.error('Failed to subscribe user to push:', err);
    return null;
  }
}
