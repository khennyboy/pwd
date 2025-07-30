// A constant to hold the name of our cache.
// Using a constant makes it easy to update the cache version if you change the files.
const CACHE_NAME = "c-to-f-converter";

// This adds an event listener for the 'install' event.
// This event is fired by the browser when the service worker is first installed.
// It's the perfect place to set up the cache and add core files to it.
self.addEventListener("install", (event) => {
  // event.waitUntil() tells the browser to wait for the promise inside to resolve
  // before considering the installation complete. This ensures our cache is ready.
  event.waitUntil(
    (async () => {
      // caches.open() opens a specific cache by name. If it doesn't exist, it creates it.
      // This returns a promise that resolves with the cache object.
      const cache = await caches.open(CACHE_NAME);

      // cache.addAll() takes an array of URLs, fetches them from the network,
      // and adds the responses to the cache. This is an "all-or-nothing" operation.
      // If any file fails to download, the entire operation fails.
      await cache.addAll([
        "/index.html", // The main HTML file for the app shell.
        "/index.js", // The service worker script itself.
      ]);
    })()
  );
});

// This adds an event listener for the 'fetch' event.
// This event is fired for every single network request made by the page
// (e.g., for HTML, CSS, JS, images, API calls).
self.addEventListener("fetch", (event) => {
  // event.respondWith() intercepts the request and allows us to provide our own
  // response instead of letting it go to the network directly.
  event.respondWith(
    (async () => {
      // We open our cache to be ready to serve files from it or add files to it.
      const cache = await caches.open(CACHE_NAME);

      try {
        // First, we try to fetch the requested resource from the network.
        // This is the "network-first" part of our strategy.
        const fetchResponse = await fetch(event.request);

        // If the network request is successful, we do two things:
        // 1. We put a copy of the response into our cache for future offline use.
        //    We use .clone() because a Response object can only be read once.
        cache.put(event.request, fetchResponse.clone());

        // 2. We return the original network response to the browser, so the page gets the fresh content.
        return fetchResponse;
      } catch (e) {
        // This 'catch' block runs if the network request fails (e.g., the user is offline).

        // We now check if a matching response already exists in our cache.
        const cachedResponse = await cache.match(event.request);

        // If a cached response is found, we return it.
        // This is what makes the app work offline!
        if (cachedResponse) {
          return cachedResponse;
        } else {
          // If the network request fails AND the resource is not in the cache,
          // we return a custom, generic error response.
          return new Response("Network error occurred and no cache available", {
            status: 408, // 408 Request Timeout is a fitting status code.
            statusText: "Network error occurred",
          });
        }
      }
    })()
  );
});
