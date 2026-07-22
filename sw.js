/* IMPORTANTE: cada vez que subas un index.html nuevo, cambia este número de
   versión (v1 -> v2 -> v3...). Si no lo cambias, los móviles que ya tengan la
   app instalada seguirán viendo la versión vieja en caché durante días. */
const CACHE_NAME = 'mi-taller-v27';
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

/* Estrategia "cache-first, network-update": sirve SIEMPRE desde la copia local
   guardada en el dispositivo al instante, sin esperar ni depender de tener
   internet. Si hay conexión, de paso actualiza la caché en segundo plano
   para la próxima vez, pero la app nunca se queda esperando a la red. */
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then((cached) => {
      const actualizar = fetch(e.request).then((resp) => {
        const copy = resp.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, copy));
        return resp;
      }).catch(() => cached);
      return cached || actualizar;
    })
  );
});
