const CACHE_NAME = 'back-safe-checkin-v20260513-restore-may-12';
const APP_SHELL = [
  './',
  './index.html',
  './site.webmanifest',
  './assets/icons/app-icon-180.png',
  './assets/icons/app-icon-192.png',
  './assets/icons/app-icon-512.png',
  './assets/icons/achievement-flame.png',
  './assets/icons/achievement-trophy.png',
  './assets/icons/achievement-perfect-week.png',
  './assets/icons/achievement-walk.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if(request.method !== 'GET') return;

  const url = new URL(request.url);
  if(url.origin !== location.origin) return;

  if(request.mode === 'navigate'){
    event.respondWith(networkFirst(request));
    return;
  }

  if(url.pathname.includes('/assets/exercises/') || url.pathname.includes('/assets/icons/achievement-')){
    event.respondWith(networkFirstAsset(request));
    return;
  }

  if(url.pathname.includes('/assets/') || url.pathname.endsWith('/site.webmanifest')){
    event.respondWith(cacheFirst(request));
  }
});

async function networkFirst(request){
  const cache = await caches.open(CACHE_NAME);
  try{
    const response = await fetch(request);
    if(response.ok) cache.put(request, response.clone());
    return response;
  } catch (error){
    return cache.match(request) || cache.match('./index.html');
  }
}

async function networkFirstAsset(request){
  const cache = await caches.open(CACHE_NAME);
  try{
    const response = await fetch(request);
    if(response.ok) cache.put(request, response.clone());
    return response;
  } catch (error){
    const cached = await cache.match(request);
    if(cached) return cached;
    throw error;
  }
}

async function cacheFirst(request){
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if(cached) return cached;
  const response = await fetch(request);
  if(response.ok) cache.put(request, response.clone());
  return response;
}
