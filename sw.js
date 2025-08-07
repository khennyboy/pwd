// sw.js
const CACHE_NAME = "c-to-f-converter-v1";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        "/",
        "/index.html",
        "/icon512.png"
      ]);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      try {
        const response = await fetch(event.request);
        cache.put(event.request, response.clone());
        return response;
      } catch (error) {
        const cachedResponse = await cache.match(event.request);
        return (
          cachedResponse ||
          new Response("Offline and no cache available", {
            status: 408,
            statusText: "Network error",
          })
        );
      }
    })
  );
});
