// ============================================================
// Vooa — Service Worker
// Estratégia: cache apenas de arquivos estáticos.
// Dados do usuário, Supabase e Gemini NUNCA são cacheados.
// ============================================================

const CACHE_NAME = 'vooa-v2';

// Arquivos estáticos que entram no cache
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/js/main.js',
  '/js/auth.js',
  '/js/search.js',
  '/js/history.js',
  '/js/render.js',
  '/js/links.js',
  '/assets/favicon.svg',
  '/manifest.json'
];

// Domínios que NUNCA devem ser cacheados (dados sensíveis e APIs)
const NEVER_CACHE = [
  'supabase.co',        // autenticação e banco de dados
  'googleapis.com',     // Gemini API
  'generativelanguage', // Gemini API (endpoint alternativo)
  '/api/search'         // função serverless Vercel (chave Gemini)
];

// ============================================================
// INSTALL — faz cache dos arquivos estáticos
// ============================================================
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(
        STATIC_ASSETS.map((url) =>
          cache.add(url).catch((err) =>
            console.warn('SW: não foi possível cachear', url, err)
          )
        )
      );
    })
  );
  self.skipWaiting();
});

// ============================================================
// ACTIVATE — remove caches antigos de versões anteriores
// ============================================================
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// ============================================================
// FETCH — intercepta requisições
// ============================================================
self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // Bloqueia cache para qualquer URL sensível
  const isSensitive = NEVER_CACHE.some((blocked) => url.includes(blocked));
  if (isSensitive) {
    // Vai direto para a rede, sem tocar no cache
    event.respondWith(fetch(event.request));
    return;
  }

  // Para requisições POST nunca usar cache (ex: buscas)
  if (event.request.method !== 'GET') {
    event.respondWith(fetch(event.request));
    return;
  }

  // Estratégia: Cache First para arquivos estáticos
  // Serve do cache se disponível, senão busca na rede
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        return cached;
      }
      return fetch(event.request).then((response) => {
        // Só armazena respostas válidas de origens próprias
        if (
          response &&
          response.status === 200 &&
          response.type === 'basic'
        ) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      });
    })
  );
});
