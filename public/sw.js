const CACHE_NAME='m-king-reads-v3';
const APP_SHELL=['/','/login','/manifest.webmanifest','/icon-192.svg','/icon-512.svg'];

async function cacheResponse(request,response){
  if(!response || !response.ok) return response;
  const copy=response.clone();
  const cache=await caches.open(CACHE_NAME);
  await cache.put(request,copy);
  return response;
}

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE_NAME).map(key=>caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;

  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin) return;

  const isNavigation=event.request.mode==='navigate';
  const isStaticAsset=/\.(?:css|js|mjs|png|jpg|jpeg|webp|svg|ico|woff2?)$/i.test(url.pathname);

  // Keep API/data responses network-only so the app does not serve stale catalogue or account data.
  if(!isNavigation && !isStaticAsset) return;

  event.respondWith(
    fetch(event.request)
      .then(response=>cacheResponse(event.request,response).catch(()=>response))
      .catch(()=>caches.match(event.request).then(response=>response || (isNavigation ? caches.match('/') : undefined)))
  );
});
