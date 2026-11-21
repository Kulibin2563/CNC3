var CACHE='cnc-calc-v5';
var FILES=['./','index.html','manifest.json','apple-touch-icon.png','icon-512.png','tochenie.html','tochenie-manifest.json','tochenie-icon.png','tochenie-icon-512.png','sverlo.html','sverlo-manifest.json','sverlo-icon.png','sverlo-icon-512.png'];

self.addEventListener('install',function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){
    return Promise.all(FILES.map(function(f){return c.add(f).catch(function(){})}));
  }));
  self.skipWaiting();
});

self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.filter(function(k){return k!==CACHE}).map(function(k){return caches.delete(k)}));
  }).then(function(){return self.clients.claim()}));
});

// Сначала кэш (мгновенно и без сети), обновление в фоне
self.addEventListener('fetch',function(e){
  var r=e.request;
  if(r.method!=='GET')return;
  if(new URL(r.url).origin!==location.origin)return;
  e.respondWith(caches.match(r,{ignoreSearch:true}).then(function(m){
    var net=fetch(r).then(function(resp){
      if(resp&&resp.ok){var copy=resp.clone();caches.open(CACHE).then(function(c){c.put(r,copy)})}
      return resp;
    });
    if(m){net.catch(function(){});return m}
    return net.catch(function(){
      return caches.match('index.html').then(function(x){return x||caches.match('./')});
    });
  }));
});
