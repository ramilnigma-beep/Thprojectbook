// ── Твоё хобби — Service Worker ──────────────────────────────────────────────
const CACHE = 'tvoe-hobby-v1';

// Всё что кешируем при первой загрузке
const PRECACHE = [
  '/',
  '/index.html',
  '/App.jsx',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  'https://unpkg.com/react@18/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
  'https://unpkg.com/@babel/standalone@7.23.5/babel.min.js',
  'https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@300;400;500;600;700&display=swap',
];

// Установка — кешируем все файлы
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

// Активация — удаляем старые кеши
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// Запросы — сначала кеш, потом сеть (Cache First)
self.addEventListener('fetch', event => {
  // Только GET запросы
  if (event.request.method !== 'GET') return;

  // API Anthropic — всегда через сеть (не кешируем)
  if (event.request.url.includes('api.anthropic.com')) return;

  event.respondWith(
    caches.match(event.request)
      .then(cached => {
        if (cached) return cached;

        // Не в кеше — идём в сеть и кешируем
        return fetch(event.request)
          .then(response => {
            // Кешируем только успешные ответы
            if (response.ok && response.type !== 'opaque') {
              const clone = response.clone();
              caches.open(CACHE).then(cache => cache.put(event.request, clone));
            }
            return response;
          })
          .catch(() => {
            // Офлайн и нет в кеше — возвращаем главную страницу
            if (event.request.destination === 'document') {
              return caches.match('/index.html');
            }
          });
      })
  );
});
