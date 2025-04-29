const CACHE_NAME = 'irapp-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json',
    '/assets/favicon.ico',
    '/assets/logo.png',
    '/assets/logo.png'
];

// ✅ Install and pre-cache assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[ServiceWorker] Caching app shell...');
            return cache.addAll(urlsToCache);
        })
    );
});

// ✅ Activate and cleanup old cache
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(
                keyList.map((key) => {
                    if (key !== CACHE_NAME) {
                        console.log('[ServiceWorker] Removing old cache:', key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );
});

// ✅ Intercept fetch requests and serve cached or fallback
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
