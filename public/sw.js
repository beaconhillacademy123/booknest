self.addEventListener('install',event=>{event.waitUntil(caches.open('m-king-reads-v1').then(cache=>cache.addAll(['/','/login'])));self.skipWaiting();});
self.addEventListener('activate',event=>{event.waitUntil(self.clients.claim())});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin) return;
  event.respondWith(fetch(event.request).catch(()=>caches.match(event.request).then(r=>r||caches.match('/'))));
});