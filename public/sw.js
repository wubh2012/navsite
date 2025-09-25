// Service Worker for 水果导航 PWA
const CACHE_NAME = 'fruit-nav-v1.2.0';
const STATIC_CACHE_NAME = 'fruit-nav-static-v1.2.0';
const API_CACHE_NAME = 'fruit-nav-api-v1.2.0';

// 需要缓存的静态资源
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/app.js',
  '/img/avatar.svg',
  '/img/favicon.ico',
  '/manifest.json',
  // 外部资源
  'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Orbitron:wght@400;700;900&display=swap'
];

// API 端点
const API_ENDPOINTS = [
  '/api/navigation-data',
  '/api/favicon'
];

// 安装事件 - 预缓存静态资源
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  
  event.waitUntil(
    Promise.all([
      // 缓存静态资源
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log('[Service Worker] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      // 跳过等待，立即激活
      self.skipWaiting()
    ])
  );
});

// 激活事件 - 清理旧缓存
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  
  event.waitUntil(
    Promise.all([
      // 清理旧版本缓存
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== API_CACHE_NAME &&
                cacheName !== CACHE_NAME) {
              console.log('[Service Worker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // 立即接管所有客户端
      self.clients.claim()
    ])
  );
});

// 拦截网络请求
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // 跳过非 GET 请求
  if (request.method !== 'GET') {
    return;
  }

  // 跳过 Chrome 扩展请求
  if (url.protocol === 'chrome-extension:') {
    return;
  }

  // 处理不同类型的请求
  if (isStaticAsset(request)) {
    // 静态资源：缓存优先策略
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE_NAME));
  } else if (isAPIRequest(request)) {
    // API 请求：网络优先策略，带降级
    event.respondWith(networkFirstWithFallback(request));
  } else {
    // 其他请求：网络优先策略
    event.respondWith(networkFirst(request));
  }
});

// 判断是否为静态资源
function isStaticAsset(request) {
  const url = new URL(request.url);
  
  // 本地静态资源
  if (url.origin === self.location.origin) {
    return url.pathname.match(/\.(css|js|png|jpg|jpeg|svg|ico|html)$/) ||
           url.pathname === '/' ||
           url.pathname === '/index.html' ||
           url.pathname === '/manifest.json';
  }
  
  // 外部静态资源（字体、CSS等）
  return url.hostname === 'fonts.googleapis.com' ||
         url.hostname === 'cdn.jsdelivr.net';
}

// 判断是否为API请求
function isAPIRequest(request) {
  const url = new URL(request.url);
  return url.origin === self.location.origin && 
         url.pathname.startsWith('/api/');
}

// 缓存优先策略（适用于静态资源）
async function cacheFirstStrategy(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('[Service Worker] Cache hit:', request.url);
      // 后台更新缓存
      updateCacheInBackground(request, cache);
      return cachedResponse;
    }
    
    // 缓存未命中，从网络获取
    console.log('[Service Worker] Cache miss, fetching:', request.url);
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[Service Worker] Cache first strategy failed:', error);
    
    // 如果是HTML请求，返回离线页面
    if (request.destination === 'document') {
      return caches.match('/index.html');
    }
    
    throw error;
  }
}

// 网络优先策略（适用于API请求）
async function networkFirstWithFallback(request) {
  try {
    console.log('[Service Worker] Fetching from network:', request.url);
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // 缓存成功的API响应
      const cache = await caches.open(API_CACHE_NAME);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    throw new Error('Network response not ok');
  } catch (error) {
    console.log('[Service Worker] Network failed, trying cache:', request.url);
    
    // 网络失败，尝试从缓存获取
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('[Service Worker] Serving from cache:', request.url);
      return cachedResponse;
    }
    
    // 如果是导航数据API请求失败，返回降级数据
    if (request.url.includes('/api/navigation-data')) {
      return new Response(JSON.stringify({
        success: false,
        message: '网络连接失败，请检查网络后重试',
        data: {
          categories: [
            { name: "全部", count: 0 }
          ],
          tools: []
        }
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store'
        }
      });
    }
    
    throw error;
  }
}

// 纯网络优先策略
async function networkFirst(request) {
  try {
    return await fetch(request);
  } catch (error) {
    console.log('[Service Worker] Network request failed:', request.url);
    throw error;
  }
}

// 后台更新缓存
function updateCacheInBackground(request, cache) {
  fetch(request).then((response) => {
    if (response.ok) {
      cache.put(request, response);
      console.log('[Service Worker] Background cache update:', request.url);
    }
  }).catch((error) => {
    console.log('[Service Worker] Background update failed:', error);
  });
}

// 消息处理
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Received message:', event.data);
  
  if (event.data && event.data.type) {
    switch (event.data.type) {
      case 'SKIP_WAITING':
        self.skipWaiting();
        break;
      case 'GET_VERSION':
        event.ports[0].postMessage({ version: CACHE_NAME });
        break;
      case 'CLEAR_CACHE':
        clearAllCaches().then(() => {
          event.ports[0].postMessage({ success: true });
        });
        break;
    }
  }
});

// 清理所有缓存
async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames.map(cacheName => caches.delete(cacheName))
  );
  console.log('[Service Worker] All caches cleared');
}

// 推送通知事件（预留）
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push received');
  
  const options = {
    body: event.data ? event.data.text() : '您有新的导航更新',
    icon: '/img/icons/icon-192x192.png',
    badge: '/img/icons/icon-72x72.png',
    tag: 'fruit-nav-notification',
    renotify: true,
    requireInteraction: false,
    actions: [
      {
        action: 'view',
        title: '查看',
        icon: '/img/icons/icon-72x72.png'
      },
      {
        action: 'dismiss',
        title: '忽略',
        icon: '/img/icons/icon-72x72.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('水果导航', options)
  );
});

// 通知点击事件
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked');
  
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

console.log('[Service Worker] Script loaded');