const CACHE_NAME = 'solengkap-pwa-v5';
const CORE_ASSETS = [
  '/',
  '/SPJ/',
  '/index.html',
  '/404.html',
  '/manifest.webmanifest',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/pwa-maskable-512x512.png',
  '/apple-touch-icon.png',
  '/assets/index-CLfOyomA.js',
  '/assets/index-qJ82jXCe.css',
  '/assets/aiAgentService.js',
  '/assets/Dashboard-CGEN-pYO.js',
  '/assets/HasilVerifikasi-DfTwxSeU.js',
  '/assets/JadwalPelayanan-CYLqr1Eg.js',
  '/assets/Verifikasi-DW9R__Ag.js',
  '/assets/MasterData-C-iQkHEd.js',
  '/assets/Laporan-CDq7P6G7.js',
  '/assets/Pengaturan-CqyBakXJ.js',
  '/assets/PenyusunanPoa-D1ZqPuwn.js',
  '/assets/Kegiatan-D42Sbi24.js',
  '/assets/pegawaiService-MafhuZKS.js',
  '/assets/kegiatanService-bLxgTPBN.js',
  '/assets/spjService-BL-ROTsV.js'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      for (const url of CORE_ASSETS) {
        try {
          const response = await fetch(url, { cache: 'reload' });
          if (response && response.ok) {
            await cache.put(url, response.clone());
            if (url.startsWith('/assets/')) {
              await cache.put('/SPJ' + url, response.clone());
            }
          }
        } catch (err) {
          // Ignore individual asset failure during install
        }
      }
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Let Firestore / external API requests go to network so our app-level localStorage cache handles offline fallback cleanly
  if (
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('firebaseio.com') ||
    url.pathname.startsWith('/api/')
  ) {
    return;
  }

  // Navigation requests: Network-first with fallback to cached /index.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(async () => {
          const cache = await caches.open(CACHE_NAME);
          return (
            (await cache.match(request)) ||
            (await cache.match('/SPJ/')) ||
            (await cache.match('/index.html')) ||
            (await cache.match('/'))
          );
        })
    );
    return;
  }

  // Static JS/CSS/Image/Template assets: Network-first with immediate offline cache fallback
  if (
    url.origin === self.location.origin &&
    (url.pathname.includes('/assets/') ||
      url.pathname.includes('/templates/') ||
      url.pathname.endsWith('.png') ||
      url.pathname.endsWith('.svg') ||
      url.pathname.endsWith('.webmanifest') ||
      url.pathname.endsWith('.css') ||
      url.pathname.endsWith('.js'))
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const getCached = async () =>
          (await cache.match(request)) ||
          (url.pathname.startsWith('/SPJ/assets/')
            ? await cache.match(url.pathname.replace('/SPJ/assets/', '/assets/'))
            : null);

        try {
          const response = await fetch(request);
          if (response && response.status === 200) {
            cache.put(request, response.clone());
            return response;
          }
          return (await getCached()) || response;
        } catch {
          return await getCached();
        }
      })
    );
  }
});
