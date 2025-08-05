// Custom Service Worker for better offline support
const CACHE_NAME = 'bank-sampah-v1.0.0';
const OFFLINE_URL = '/offline.html';

// Resources to cache for offline functionality
const CACHE_RESOURCES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
  // Add other critical resources here
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching offline resources');
        return cache.addAll(CACHE_RESOURCES);
      })
      .then(() => {
        // Force activation immediately
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Cache installation failed:', error);
      })
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        // Take control of all clients immediately
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!event.request.url.startsWith('http')) {
    return;
  }

  // Handle navigation requests (for SPA routing)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          // If network fails, serve the cached index.html
          return caches.match('/') || caches.match('/index.html');
        })
    );
    return;
  }

  // Handle other requests with cache-first strategy for static assets
  if (event.request.url.match(/\.(js|css|png|jpg|jpeg|svg|gif|ico|woff|woff2|ttf|eot)$/)) {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          // Return cached version or fetch from network
          return response || fetch(event.request)
            .then((fetchResponse) => {
              // Cache the new response
              const responseClone = fetchResponse.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseClone);
                });
              return fetchResponse;
            });
        })
        .catch(() => {
          // If both cache and network fail, return a fallback
          console.log('Both cache and network failed for:', event.request.url);
        })
    );
    return;
  }

  // Handle API requests with network-first strategy
  if (event.request.url.includes('/rest/v1/') || event.request.url.includes('supabase')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache successful responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseClone);
              });
          }
          return response;
        })
        .catch(() => {
          // If network fails, try cache
          return caches.match(event.request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // Return a basic error response for API calls
              return new Response(
                JSON.stringify({ error: 'Offline - data not available' }),
                {
                  status: 503,
                  statusText: 'Service Unavailable',
                  headers: { 'Content-Type': 'application/json' }
                }
              );
            });
        })
    );
    return;
  }

  // Default strategy for other requests
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      })
  );
});

// Background sync for when connection is restored
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('Background sync triggered');
    event.waitUntil(
      // Here you could implement logic to sync pending data
      // when the connection is restored
      syncPendingData()
    );
  }
});

async function syncPendingData() {
  // Implementation for syncing pending data when back online
  try {
    console.log('Syncing pending data...');
    // Add your sync logic here
  } catch (error) {
    console.error('Sync failed:', error);
  }
}

// Message handling
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
