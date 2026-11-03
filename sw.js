/* Mondes Ouverts — service worker (version 49.1) */
const VERSION = "49.1";
const CACHE = "mondes-" + VERSION;
const CORE = ["./", "./index.html", "./manifest.json", "./icons/icon-192.png", "./icons/icon-512.png", "./icons/apple-180.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(CORE.map(u => fetch(new Request(u, { cache: "reload" })).then(r => { if (r.ok) return c.put(u, r); }).catch(() => {})))));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith("mondes-") && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("message", e => { if (e.data === "SKIP_WAITING") self.skipWaiting(); });
self.addEventListener("fetch", e => {
  const req = e.request; if (req.method !== "GET") return;
  const url = new URL(req.url); if (url.origin !== location.origin) return;
  if (url.pathname.endsWith("/version.json") || url.pathname.endsWith("/sw.js")) return;
  if (req.mode === "navigate") {
    e.respondWith(caches.open(CACHE).then(c => c.match("./index.html").then(r => r || fetch(req).then(n => { if (n.ok) c.put("./index.html", n.clone()); return n; }))));
    return;
  }
  e.respondWith(caches.open(CACHE).then(c => c.match(req, { ignoreSearch: true }).then(r => r || fetch(req).then(n => { if (n.ok) c.put(req, n.clone()); return n; }))));
});
