const FILES_TO_CACHE = [
    "./server.js",
    "./models/transaction.js",
    "./routes/api",
    "./public/index.html",
    "./public/manifest.json",
    "./public/css/styles",
    "./public/js/idb.js",
    "./public/js/index.js",
    
];
const APP_PREFIX = 'Trust-Funder-';
const VERSION = 'version_01';
const CACHE_NAME = APP_PREFIX + VERSION;

//use self because service workers run before window exists
self.addEventListener('install', function (e) {
    //wait until work is complete before terminating the service worker.
    e.waitUntil(
        //find specific cache by name, then add every file in the files to cache array
        caches.open(CACHE_NAME).then(function (cache) {
            console.log('installing cache : ' + CACHE_NAME)
            return cache.addAll(FILES_TO_CACHE)
        })
    )
})

//return array of all cache names, call it keyList
self.addEventListener('activate', function(e) {
    e.waitUntil(
      caches.keys().then(function(keyList) {
        let cacheKeeplist = keyList.filter(function(key) {
          return key.indexOf(APP_PREFIX);
        });
        cacheKeeplist.push(CACHE_NAME);
  
        return Promise.all(
          keyList.map(function(key, i) {
            if (cacheKeeplist.indexOf(key) === -1) {
              console.log('deleting cache : ' + keyList[i]);
              return caches.delete(keyList[i]);
            }
          })
        );
      })
    );
  });

// listen for fetch event, log URL of requested resource
// respondWith to intercept fetch request with a check to see if the request is stored or not.
// If stored, this will deliver the resource directly from cache, otherwise, retrieve normally.
self.addEventListener('fetch', function (e) {
    console.log('fetch request: ' + e.request.url)
    e.respondWith(
        caches.match(e.request).then(function (request) {
            if (request) {
                console.log('responding with cache: ' + e.request.url)
                return request
            } else {
                console.log('file is not cached, fetching: ' + e.request.url)
                return fetch(e.request)
            }
        })
    )
})