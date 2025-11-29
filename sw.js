/* Basic Service Worker for Regal Party Rentals
   Caches core assets on install and provides simple runtime
   caching strategies: cache-first for images/fonts, network-first
   for navigation (HTML), and stale-while-revalidate for CSS/JS.
*/

const CACHE_VERSION = 'v1';
const CACHE_NAME = `rpr-static-${CACHE_VERSION}`;

const CORE_ASSETS = [
  '/',
  '/index.html',
  '/css/custom.css',
  '/css/local-fonts.css',
  '/js/script.js',
  '/images/hero-wedding-table-1920.webp',
  '/images/hero-wedding-table-1200.webp',
  '/images/hero-wedding-table-800.webp',
  '/images/Logo-Regal.png'
];
// Add offline page to core assets
CORE_ASSETS.push('/offline.html');

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
});

// Helper: return response from cache or fetch and update cache
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const res = await fetch(request);
    if (res && res.status === 200) cache.put(request, res.clone());
    return res;
  } catch (e) {
    return cached || Response.error();
  }
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const res = await fetch(request);
    if (res && res.status === 200) cache.put(request, res.clone());
    return res;
  } catch (e) {
    const cached = await cache.match(request);
    if (cached) return cached;
    // If navigation request and nothing cached, serve offline fallback
    if (request.mode === 'navigate' || (request.headers.get('accept') || '').includes('text/html')) {
      const fallback = await cache.match('/offline.html');
      if (fallback) return fallback;
    }
    return Response.error();
  }
}

self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle GET requests
  if (req.method !== 'GET') return;

  // Serve navigation (HTML) with network-first to keep content fresh
  if (req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html')) {
    event.respondWith(networkFirst(req));
    return;
  }

  // Cache fonts and images (cache-first)
  if (req.destination === 'image' || req.destination === 'font') {
    event.respondWith(cacheFirst(req));
    return;
  }

  // For CSS/JS use stale-while-revalidate pattern
  if (req.destination === 'style' || req.destination === 'script') {
    event.respondWith((async function() {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(req);
      const network = fetch(req).then(res => { if (res && res.status === 200) cache.put(req, res.clone()); return res; }).catch(() => null);
      return cached || network;
    })());
    return;
  }

  // Fallback to cache-first for others
  event.respondWith(cacheFirst(req));
});
