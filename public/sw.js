const CACHE_VERSION = "__PWA_CACHE_VERSION__";
const CACHE_NAME = `pdf-to-jpg-${CACHE_VERSION}`;
const PRECACHE_ASSETS = [];

const APP_SHELL = [
  "./",
  "./index.html",
  "./offline.html",
  "./manifest.webmanifest",
  "./favicon.svg",
  "./apple-touch-icon.png",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-512.png"
];

const cacheUrl = (path) => new URL(path, self.registration.scope).toString();

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      const urls = [...APP_SHELL, ...PRECACHE_ASSETS].map(cacheUrl);
      return cache.addAll(urls);
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(cacheUrl("./index.html"), copy));
          return response;
        })
        .catch(() => caches.match(cacheUrl("./offline.html")))
    );
    return;
  }

  const requestUrl = new URL(request.url);
  const scopeUrl = new URL(self.registration.scope);
  if (requestUrl.origin !== scopeUrl.origin) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request).then((response) => {
        if (!response || response.status !== 200) return response;
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        return response;
      });
    })
  );
});
