const CACHE = 'bestway-v1';
const ASSETS = ['/', '/index.html', '/manifest.json'];

// Install: pre-cache basic assets
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

// Activate: take control immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Network-first for GET (fallback to cache)
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  event.respondWith(
    fetch(request).then((res) => {
      const clone = res.clone();
      caches.open(CACHE).then((c) => c.put(request, clone));
      return res;
    }).catch(() => caches.match(request))
  );
});
