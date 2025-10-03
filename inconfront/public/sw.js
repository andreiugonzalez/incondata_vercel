// importScripts('https://cdn.jsdelivr.net/npm/pouchdb@8.0.1/dist/pouchdb.min.js')

// importScripts('sw-db.js');

// self.addEventListener('install', (event) => {
//     console.log('Service worker installed');
//     event.waitUntil(
//         caches.open('cache-v1')
//             .then((cache) => {
//                 // Add essential application files to the cache
//                 return cache.addAll([
//                     '/',
//                     '/login',
//                     '/account',
//                 ]);
//             })
//     );
// });

// self.addEventListener('activate', (event) => {
//     console.log('Service worker activated');
//     event.waitUntil(
//         caches.keys()
//             .then((cacheNames) => {
//                 return Promise.all(
//                     cacheNames.map((cacheName) => {
//                         if (cacheName !== 'cache-v1') {
//                             // Delete outdated cache versions
//                             return caches.delete(cacheName);
//                         }
//                     })
//                 );
//             })
//     );
//     self.clients.claim();
// });

// self.addEventListener("fetch", (event) => {
//     console.log('Interceptando sw...');
//     if (event.request.method === "POST") {
//         console.log('POST REQUEST');

//         if (self.registration.sync) {
//             return event.request.clone().json().then(body => {
//                 console.log('Pasé por el register', body);

//                 if (body || body.length > 0) {
//                     return saveRequest(body);
//                 }
//             })
//         }

//         // event.respondWith(fetch(event.request));
//         return;
//     }

//     if (event.request.url.includes("faenaqa-bucket")) {
//         event.respondWith(fetch(event.request));
//         return null;
//     }

//     if (event.request.url.startsWith('http://localhost:3000/register')) {

//         event.request.clone().text().then(body => {
//             console.log('Pasé por el register', body);
//             const bodyObj = JSON.parse(body);
//             saveRequest(bodyObj);
//         })
//     }

//     if (event.request.url.startsWith("http://localhost:3000")) {
//         event.respondWith(
//             caches.match(event.request)
//                 .then((response) => {
//                     // Si la solicitud está en caché, devuelve la respuesta en caché
//                     if (response) {
//                         console.log("Está en caché", event.request.url);
//                         return response;
//                     }

//                     // De lo contrario, realiza la solicitud de red
//                     return fetch(event.request)
//                         .then((response) => {
//                             console.log("No está en caché", event.request.url);
//                             // Abre el caché y guarda la respuesta para futuras solicitudes
//                             return caches.open('cache-v1')
//                                 .then((cache) => {
//                                     cache.put(event.request, response.clone());
//                                     return response;
//                                 });
//                         });
//                 })
//         );
//     }
// });

// self.addEventListener('sync', e => {

//     console.log ('SW: sync');

//     if ( e.tag === 'inicio-sesion' ) {

//         const response = postMessages();

//         e.waitUntil( response );
//     }
// });