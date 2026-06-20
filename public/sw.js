/* Pin-Reference service worker — offline support for lab use.
 * Network-first so the app stays fresh while online, but falls back to the
 * cache when there's no internet. It deliberately ignores the local API
 * (/api/*) and Vite's dev internals so flashing/HMR are never disturbed. */
const CACHE = "micropin-cache-v1";
const CORE = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).catch(() => {}));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.map((k) => (k === CACHE ? null : caches.delete(k)))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return; // never touch POST (compile/upload/Gemini)
  const url = new URL(req.url);

  // Leave the local backend API and Vite dev machinery completely alone.
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/@") ||
    url.pathname.includes("/node_modules/.vite")
  )
    return;

  const sameOrigin = url.origin === location.origin;
  const isGoogleFont = /fonts\.(googleapis|gstatic)\.com$/.test(url.host);
  if (!sameOrigin && !isGoogleFont) return; // let other cross-origin requests pass

  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.status === 200) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
      })
      .catch(() =>
        caches.match(req).then((m) => m || (req.mode === "navigate" ? caches.match("/index.html") : Response.error()))
      )
  );
});
