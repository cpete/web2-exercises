// CampusNotes Service Worker – Schritt 2: App-Shell-Precaching und Cache First
//
// Achtung: Der Mensaplan (/api/menu.json) wird hier noch NICHT gecacht.
// Offline fehlt er deshalb – das lösen wir in Übung 3.

const CACHE_NAME = 'campusnotes-shell-v1';

const APP_SHELL = [
  '/',
  '/css/style.css',
  '/js/app.js',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// 1. install: App Shell vorab in den Cache laden.
//    Schlägt ein einziger Request fehl, schlägt die ganze Installation fehl.
self.addEventListener('install', event => {
  console.log('[SW] install');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
  );
});

// 2. activate: Der neue Service Worker übernimmt. (Aufräumen alter Caches folgt in Übung 3.)
self.addEventListener('activate', () => {
  console.log('[SW] activate');
});

// 3. fetch: Jeder Request der Seite läuft hier durch – zuerst im Cache suchen, sonst Netzwerk.
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) console.log('[SW] aus dem Cache:', event.request.url);
      return cached || fetch(event.request);
    })
  );
});
