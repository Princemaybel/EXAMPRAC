/**
 * service-worker.js — EXAMPRAC Offline Cache
 * Caches all app shell files on install; serves from cache first.
 */

const CACHE_NAME = 'examprac-v3';

const PRECACHE = [
  './',
  './index.html',
  './css/styles.css',
  './js/app.js',
  './js/database.js',
  './js/questions.js',
  './js/timer.js',
  './js/settings.js',
  './js/sound.js',
  './js/confetti.js',
  './data/questions.json',
  './data/questions_data.js',
  './data/afpsat_questions.json',
  './data/afpsat_questions_data.js',
  './manifest.webmanifest',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
];

// Install: cache all essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Cache files one at a time to identify which fails
      for (const url of PRECACHE) {
        try {
          await cache.add(url);
        } catch (err) {
          console.warn(`[SW] Failed to cache: ${url}`, err);
        }
      }
    })
  );
  self.skipWaiting();
});

// Activate: delete old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: cache-first strategy
self.addEventListener('fetch', (event) => {
  // Only handle GET requests for same-origin resources
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        // Cache newly fetched resources
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      }).catch(() => {
        // Offline fallback: return index.html for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});

