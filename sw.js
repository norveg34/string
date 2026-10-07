const CACHE_NAME = "string-kereso-v1";

const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./manifest.json",
    "./SLK2_combiner.xlsx",
    "./icon-192.png",
    "./icon-512.png",
    "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"
];


/*
 * Telepítés
 */
self.addEventListener(
    "install",
    event => {

        event.waitUntil(

            caches
                .open(CACHE_NAME)
                .then(cache => {

                    return cache.addAll(
                        FILES_TO_CACHE
                    );

                })

        );

        self.skipWaiting();
    }
);


/*
 * Aktiválás
 */
self.addEventListener(
    "activate",
    event => {

        event.waitUntil(

            caches.keys()
                .then(cacheNames => {

                    return Promise.all(

                        cacheNames
                            .filter(
                                name =>
                                    name !==
                                    CACHE_NAME
                            )
                            .map(
                                name =>
                                    caches.delete(
                                        name
                                    )
                            )

                    );

                })

        );

        self.clients.claim();
    }
);


/*
 * Fetch
 *
 * Cache First stratégia.
 * Így internet nélkül is működik.
 */
self.addEventListener(
    "fetch",
    event => {

        event.respondWith(

            caches.match(
                event.request
            )
            .then(cachedResponse => {

                if (cachedResponse) {
                    return cachedResponse;
                }

                return fetch(
                    event.request
                )
                .then(response => {

                    /*
                     * Sikeres válasz cache-elése
                     */
                    if (
                        response &&
                        response.status === 200 &&
                        response.type !== "opaque"
                    ) {

                        const responseClone =
                            response.clone();

                        caches
                            .open(CACHE_NAME)
                            .then(cache => {

                                cache.put(
                                    event.request,
                                    responseClone
                                );

                            });
                    }

                    return response;

                });

            })

        );
    }
);
