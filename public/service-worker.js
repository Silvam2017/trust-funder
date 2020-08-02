const FILES_TO_CACHE = [
    "../models/transaction.js",
    "./index.html",
    "./manifest.json",
    "./css/styles",
    "./js/idb.js",
    "./js/index.js",
    "/",
    "./icons/icon-72x72",
    "./icons/icon-96x96",
    "./icons/icon-128x128",
    "./icons/icon-144x144",
    "./icons/icon-152x152",
    "./icons/icon-192x192",
    "./icons/icon-384x384",
    "./icons/icon-512x512",
];
const APP_PREFIX = 'Trust-Funder-';
const VERSION = 'version_01';
const CACHE_NAME = APP_PREFIX + VERSION;

//use self because service workers run before window exists
self.addEventListener('install', function (event) {
    //wait until work is complete before terminating the service worker.
    event.waitUntil(
        //find specific cache by name, then add every file in the files to cache array
        caches.open(CACHE_NAME).then(function (cache) {
            console.log('installing cache : ' + CACHE_NAME)
            return cache.addAll(FILES_TO_CACHE)
        })
    )
})

//return array of all cache names, call it keyList
self.addEventListener('activate', function(event) {
    event.waitUntil(
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
self.addEventListener('fetch', function (event) {
    console.log('fetch request: ' + event.request.url)
    event.respondWith(
        caches.match(event.request).then(function (request) {
            if (request) {
                console.log('responding with cache: ' + event.request.url)
                return request
            } else {
                console.log('file is not cached, fetching: ' + event.request.url)
                return fetch(event.request)
            }
        })
    )
})