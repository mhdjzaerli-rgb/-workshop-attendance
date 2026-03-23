// Service Worker - نظام الدوام PWA
const CACHE_NAME = 'dawam-v1';
const OFFLINE_URLS = [
  './',
  './index.html',
  './manifest.json'
];

// تثبيت
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(OFFLINE_URLS);
    }).then(() => self.skipWaiting())
  );
});

// تفعيل
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// طلبات الشبكة - offline first للملفات المحلية
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // للخطوط والمكتبات الخارجية: network first
  if (url.origin !== location.origin) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // للملفات المحلية: cache first
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});
