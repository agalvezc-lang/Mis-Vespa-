/* IMPORTANTE: cada vez que subas un index.html nuevo, cambia este número de
   versión (v1 -> v2 -> v3...). Si no lo cambias, los móviles que ya tengan la
   app instalada seguirán viendo la versión vieja en caché durante días. */
const CACHE_NAME = 'mi-taller-v21';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './splash.jpg'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

/* Estrategia "network-first, cache-fallback": intenta traer siempre la
   versión más reciente de la red y actualiza la caché; si no hay conexión,
   sirve lo último guardado. Así la app funciona sin conexión pero no se
   queda pegada a una versión antigua en cuanto hay internet. */
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request, { cache: 'no-store' })
      .then((resp) => {
        const copy = resp.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, copy));
        return resp;
      })
      .catch(() => caches.match(e.request))
  );
});
