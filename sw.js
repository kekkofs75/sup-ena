const CACHE_NAME = 'supena-v3';
const STATIC_ASSETS = [
  '/sup-ena/',
  '/sup-ena/index.html',
  '/sup-ena/manifest.json',
  '/sup-ena/icons/icon-192.png',
  '/sup-ena/icons/icon-512.png',
];

// Anni supportati — aggiungere qui eventuali nuovi anni futuri
const ANNI_DISPONIBILI = [2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];
const ESTRAZIONE_ASSETS = ANNI_DISPONIBILI.map(a => `/sup-ena/estrazioni/${a}.json`);

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll([...STATIC_ASSETS, ...ESTRAZIONE_ASSETS]);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Network-first per i file JSON delle estrazioni (aggiornati periodicamente)
  if (event.request.url.includes('/estrazioni/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }
  // Cache-first per tutto il resto
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
