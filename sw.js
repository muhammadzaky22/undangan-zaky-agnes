const CACHE='za-domain-v2026-08-21-admin-pwa-1';
const CORE=['/','/index.html','/admin.html','/offline.html','/maintenance.html','/manifest.webmanifest','/admin-manifest.webmanifest','/icon-192.png','/icon-512.png','/admin-icon-192.png','/admin-icon-512.png','/admin-icon-maskable-512.png','/social-preview.jpg','/guest-rsvp-upgrades.js','/admin-upgrades.js','/admin-pwa.js','/assets/zaky.webp','/assets/agnes.webp','/assets/couple-1.webp','/assets/couple-2.webp','/assets/couple-3.webp','/assets/couple-4.webp','/assets/couple-5.webp'];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>Promise.allSettled(CORE.map(url=>cache.add(url)))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const req=event.request;
  if(req.mode==='navigate'){
    event.respondWith(fetch(req).then(res=>{const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy));return res;}).catch(async()=>{const cached=await caches.match(req);if(cached)return cached;const u=new URL(req.url);if(u.pathname.endsWith('/admin.html'))return (await caches.match('/admin.html'))||(await caches.match('/offline.html'));return caches.match('/offline.html');}));
    return;
  }
  event.respondWith(caches.match(req).then(cached=>cached||fetch(req).then(res=>{if(res&&res.status===200&&res.type!=='opaque'){const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy));}return res;})));
});
