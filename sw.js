const CACHE_NAME = 'slk2-pwa-v3';

const APP_FILES = [
    './',
    './index.html',
    './manifest.json'
];

self.addEventListener('install', event => {

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(APP_FILES))
            .then(() => self.skipWaiting())
    );

});


self.addEventListener('activate', event => {

    event.waitUntil(

        caches.keys().then(keys =>

            Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            )

        ).then(() => self.clients.claim())

    );

});


self.addEventListener('fetch', event => {

    const request = event.request;

    /*
       Az Excel fájlt NEM cache-eljük.
       Így az alkalmazás mindig ellenőrizheti,
       van-e új Excel.
    */

    if (
        new URL(request.url).pathname
            .toLowerCase()
            .endsWith('.xlsx')
    ) {
        return;
    }


    /*
       Az alkalmazás fájljai:
       először cache, majd hálózat.
    */

    event.respondWith(

        caches.match(request)
            .then(cached => {

                if (cached) {
                    return cached;
                }

                return fetch(request)
                    .then(response => {

                        if (
                            response &&
                            response.status === 200
                        ) {

                            const copy =
                                response.clone();

                            caches.open(CACHE_NAME)
                                .then(cache =>
                                    cache.put(
                                        request,
                                        copy
                                    )
                                );
                        }

                        return response;
                    });

            })

    );

});