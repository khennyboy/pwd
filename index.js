const CACHE_NAME = 'c-to-f-converter';

// Event listener for the 'install' event, triggered when the service worker is first installed
self.addEventListener('install', event => {
    event.waitUntil((async () => {
        // Open (or create) the cache with the specified name
        const cache = await caches.open(CACHE_NAME);

        // Add files to the cache for offline use
        await cache.addAll([
            '/index.html',                // Homepage
            '/index.js',       // JavaScript file
        ]);
    })());
});

// Event listener for the 'fetch' event, triggered for each network request made by the page
self.addEventListener('fetch', event => {
    event.respondWith((async () => {
        // Open the cache to check for cached resources
        const cache = await caches.open(CACHE_NAME);

        try {
            // Try to fetch the resource from the network
            const fetchResponse = await fetch(event.request);

            // If successful, store the network response in the cache for future use
            cache.put(event.request, fetchResponse.clone());

            // Return the network response to the page
            return fetchResponse;
        } catch (e) {
            // If the network request fails (e.g., offline), try to fetch from the cache
            const cachedResponse = await cache.match(event.request);

            // If the resource is found in the cache, return it
            if (cachedResponse) {
                return cachedResponse;
            } else {
                // If the resource is not available in the cache, return a custom error response
                return new Response('Network error occurred and no cache available', {
                    status: 408, // Request Timeout status
                    statusText: 'Network error occurred'
                });
            }
        }
    })());
});