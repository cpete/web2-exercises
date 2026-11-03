// CampusNotes Service Worker – Schritt 3: Caching-Strategien
//
// Routing im fetch-Handler:
//   Navigation (HTML)      → Network First, Fallback: Cache, dann offline.html
//   /api/…  (Mensaplan)    → Stale-While-Revalidate
//   statische Assets       → Cache First
//
// Achtung: Die Cache-Namen sind noch fest. Versionierung, Aufräumen alter Caches
// und ein Update-Hinweis in der App folgen im nächsten Schritt.

const SHELL_CACHE = 'campusnotes-shell-v1'; // Name aus Schritt 2, damit kein verwaister Cache entsteht
const RUNTIME_CACHE = 'campusnotes-runtime';
const API_CACHE = 'campusnotes-api';

const OFFLINE_URL = '/offline.html';
const APP_SHELL = [
  '/',
  '/css/style.css',
  '/js/app.js',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  OFFLINE_URL,
];

// ---------- Lifecycle ----------

self.addEventListener('install', event => {
  console.log('[SW] install');
  event.waitUntil(caches.open(SHELL_CACHE).then(cache => cache.addAll(APP_SHELL)));
});

self.addEventListener('activate', () => {
  console.log('[SW] activate');
});

// ---------- Routing ----------

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Nur GET-Requests der eigenen Origin behandeln, alles andere geht direkt ans Netz
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
  } else if (url.pathname.startsWith('/api/')) {
    event.respondWith(staleWhileRevalidate(event));
  } else {
    event.respondWith(cacheFirst(request));
  }
});

// ---------- Strategien ----------

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(RUNTIME_CACHE);
    cache.put(request, response.clone());
  }
  return response;
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // ignoreSearch: "/?action=…" soll offline ebenfalls die gecachte Startseite liefern
    return (await caches.match(request, { ignoreSearch: true })) ?? caches.match(OFFLINE_URL);
  }
}

async function staleWhileRevalidate(event) {
  const cache = await caches.open(API_CACHE);
  const cached = await cache.match(event.request);
  const network = fetch(event.request).then(response => {
    if (response.ok) cache.put(event.request, response.clone());
    return response;
  });
  // Den Service Worker am Leben halten, bis die Aktualisierung im Hintergrund fertig ist
  event.waitUntil(network.catch(() => {}));
  return cached ?? network;
}
