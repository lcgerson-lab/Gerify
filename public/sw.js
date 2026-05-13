const CACHE = 'gerify-v1';
const SHELL = ['/', '/index.html'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const { request } = e;
  const url = new URL(request.url);

  // Google APIs y YouTube: sin interceptar
  if (url.hostname.includes('googleapis') || url.hostname.includes('youtube') || url.hostname.includes('gstatic') || url.hostname.includes('fonts')) {
    return;
  }

  // Navegación: network-first, fallback a index.html en caché
  if (request.mode === 'navigate') {
    e.respondWith(
      fetch(request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(request, clone));
          return res;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Assets estáticos (/assets/, /icons/): cache-first
  if (url.pathname.startsWith('/assets/') || url.pathname.startsWith('/icons/')) {
    e.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(res => {
          caches.open(CACHE).then(c => c.put(request, res.clone()));
          return res;
        });
      })
    );
  }
});
