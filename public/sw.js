// Service Worker for Wings of Steel
const CACHE_NAME = 'wings-of-steel-v6'; // Increment version to force update
const urlsToCache = [
  // Only cache essential static assets
  '/manifest.json',
  '/assets/hockey-sticks.webp',
  '/assets/wings-logo.webp',
  '/assets/wings-logo-real.webp'
];

// Install event - cache only essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.log('Cache install error:', error);
      })
  );
  // Force the service worker to become active immediately
  self.skipWaiting();
});

// Activate event - clean up ALL old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Take control of all pages immediately
  self.clients.claim();
});

// Fetch event - Network first, fallback to cache
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip API calls
  const url = new URL(event.request.url);
  if (url.hostname.includes('supabase.co') || 
      url.hostname.includes('stripe.com') ||
      url.hostname.includes('printify.com') ||
      url.pathname.includes('/api/')) {
    return;
  }

  // For HTML documents, always fetch from network first
  if (event.request.mode === 'navigate' || 
      event.request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Update cache with fresh response
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Only use cache as fallback for offline
          return caches.match(event.request)
            .then(response => response || caches.match('/index.html'));
        })
    );
    return;
  }

  // For static assets, use cache first but update in background
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          // Update cache with fresh version
          if (networkResponse.ok) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        });

        // Return cached version immediately, but update in background
        return response || fetchPromise;
      })
  );
});

// Listen for messages from the client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  // Handle cache clear message
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then(names => {
      names.forEach(name => {
        caches.delete(name);
      });
    });
  }
});