declare const __PWA_CACHE_VERSION__: string;

interface ExtendableEventLike extends Event {
  waitUntil(promise: Promise<unknown>): void;
}

interface FetchEventLike extends ExtendableEventLike {
  request: Request;
  respondWith(response: Promise<Response> | Response): void;
}

interface MessageEventLike extends Event {
  data: unknown;
}

interface ServiceWorkerLike {
  addEventListener(type: "install" | "activate", listener: (event: ExtendableEventLike) => void): void;
  addEventListener(type: "fetch", listener: (event: FetchEventLike) => void): void;
  addEventListener(type: "message", listener: (event: MessageEventLike) => void): void;
  clients: { claim(): Promise<void> };
  location: Location;
  skipWaiting(): Promise<void>;
}

const serviceWorker = self as unknown as ServiceWorkerLike;
const CACHE_PREFIX = "ic-verify-app-shell";
const CACHE_NAME = `${CACHE_PREFIX}-${__PWA_CACHE_VERSION__}`;
const STATIC_SHELL_URLS = [
  "/manifest.json",
  "/favicon.svg",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

async function cacheResponse(cache: Cache, url: string): Promise<Response | undefined> {
  try {
    const response = await fetch(url, { cache: "reload" });
    if (response.ok) await cache.put(url, response.clone());
    return response;
  } catch {
    return undefined;
  }
}

function readLocalAssets(html: string): string[] {
  const assetUrls = Array.from(html.matchAll(/(?:src|href)=["']([^"']+)["']/g))
    .map((match) => {
      try {
        const url = new URL(match[1], serviceWorker.location.origin);
        return url.origin === serviceWorker.location.origin
          ? `${url.pathname}${url.search}`
          : undefined;
      } catch {
        return undefined;
      }
    })
    .filter((url): url is string => url !== undefined);
  return [...new Set(assetUrls)];
}

async function cacheAppShell(): Promise<void> {
  const cache = await caches.open(CACHE_NAME);
  const indexResponse = await cacheResponse(cache, "/index.html");

  if (indexResponse?.ok) {
    await cache.put("/", indexResponse.clone());
    const html = await indexResponse.text();
    await Promise.all(readLocalAssets(html).map((url) => cacheResponse(cache, url)));
  }

  await Promise.all(STATIC_SHELL_URLS.map((url) => cacheResponse(cache, url)));
}

async function cacheFirst(request: Request): Promise<Response> {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) return cachedResponse;

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    if (request.mode === "navigate") {
      const appShell = await caches.match("/index.html") ?? await caches.match("/");
      if (appShell) return appShell;
    }
    throw error;
  }
}

serviceWorker.addEventListener("install", (event) => {
  event.waitUntil(cacheAppShell());
});

serviceWorker.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames
        .filter((cacheName) => cacheName.startsWith(CACHE_PREFIX) && cacheName !== CACHE_NAME)
        .map((cacheName) => caches.delete(cacheName)),
    );
    await serviceWorker.clients.claim();
  })());
});

serviceWorker.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== "GET" || url.origin !== serviceWorker.location.origin) return;
  event.respondWith(cacheFirst(request));
});

serviceWorker.addEventListener("message", (event) => {
  if (
    typeof event.data === "object"
    && event.data !== null
    && "type" in event.data
    && event.data.type === "SKIP_WAITING"
  ) {
    void serviceWorker.skipWaiting();
  }
});
