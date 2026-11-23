/* Ritmo: resta sul telefono e funziona senza internet */
const CACHE='ritmo-v4';
const FILES=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE&&x!=='ritmo-mappe').map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
/* riquadri della mappa: prima quelli salvati sul telefono (anche senza internet), poi la rete */
const norm=u=>u.replace(/\/\/[a-d]\.basemaps/,'//a.basemaps');
const alt=u=>u.includes('@2x.')?u.replace('@2x.','.'):u.replace(/(\/\d+\/\d+\/\d+)\.png/,'$1@2x.png');
const O={ignoreVary:true,ignoreSearch:true};
function tile(req){const u=req.url;return caches.open('ritmo-mappe').then(c=>c.match(norm(u),O).then(r=>r||c.match(u,O)).then(r=>r||c.match(norm(alt(u)),O)).then(r=>r||fetch(req).catch(()=>caches.match(req,O).then(x=>x||new Response('',{status:504})))))}
/* prima la rete per avere l'ultima versione; senza internet usa la copia salvata */
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;const u=new URL(e.request.url);
  if(u.hostname.endsWith('basemaps.cartocdn.com')){e.respondWith(tile(e.request));return}
  if(u.origin!==location.origin){e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(CACHE).then(x=>x.put(e.request,c));return r}).catch(()=>caches.match(e.request,O).then(r=>r||new Response('',{status:504}))));return}
  e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(CACHE).then(x=>x.put(e.request,c));return r}).catch(()=>caches.match(e.request,{ignoreSearch:true}).then(r=>r||caches.match('./index.html'))))});
