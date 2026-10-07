const CACHE_NAME = "string-kereso-v1";
const urlsToCache = [
    "./",
    "./index.html",
    "./manifest.json",
    "./SLK2_combiner.xlsx",
    "./SLK1_combiner.xlsx",
    "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"
];

// Telepítés és cache-elés
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
    );
    self.skipWaiting();
});

// Aktiválás és régi cache-ek törlése
self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Offline kérések kiszolgálása (Cache-first stratégia)
self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Ha benne van a cache-ben, visszaadjuk, különben hálózatról kérjük
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});
