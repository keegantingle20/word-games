const CACHE_NAME = 'wg-static-v2'; // Updated cache version
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  
  // Skip caching for HTML files to ensure fresh content
  if (request.url.includes('.html') || request.url.endsWith('/')) {
    event.respondWith(fetch(request));
    return;
  }
  
  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(request);
      
      // Check if cached response is still fresh
      if (cached) {
        const cacheTime = cached.headers.get('sw-cache-time');
        if (cacheTime && Date.now() - parseInt(cacheTime) < CACHE_DURATION) {
          return cached;
        }
      }
      
      try {
        const res = await fetch(request);
        if (res.status === 200 && res.type === 'basic') {
          // Add cache timestamp
          const responseToCache = res.clone();
          responseToCache.headers.set('sw-cache-time', Date.now().toString());
          cache.put(request, responseToCache);
        }
        return res;
      } catch {
        return cached || fetch(request);
      }
    })
  );
});


