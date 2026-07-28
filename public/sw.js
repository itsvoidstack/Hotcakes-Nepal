// Hotcakes Nepal Service Worker for Browser Push Notifications

self.addEventListener('push', function (event) {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const title = data.title || '🔔 Hotcakes Nepal';
    const options = {
      body: data.body || 'New vacancy application received!',
      icon: data.icon || '/favicon.ico',
      badge: '/favicon.ico',
      data: {
        url: data.url || '/hc-dashboard?tab=vacancies',
      },
      vibrate: [100, 50, 100],
      tag: 'vacancy-notification',
      renotify: true,
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (err) {
    console.error('Push event error:', err);
    event.waitUntil(
      self.registration.showNotification('🔔 Hotcakes Nepal', {
        body: event.data.text() || 'New application received!',
        data: { url: '/hc-dashboard?tab=vacancies' },
      })
    );
  }
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/hc-dashboard?tab=vacancies';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url && 'focus' in client) {
          if (client.navigate) {
            client.navigate(targetUrl);
          }
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
