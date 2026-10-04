// Bump CACHE whenever any file changes so installed copies pick up the update.
const CACHE = "ros2-learn-v6";
const FILES = [
  "./", "./index.html", "./style.css", "./app.js", "./manifest.json",
  "./content/m0_linux.js", "./content/m1_python.js", "./content/m2_turtlesim.js",
  "./content/m3_workspaces.js", "./content/planned.js",
  "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Cache first, fall back to the network. Google Fonts files are cached the
// first time they load so the fonts also work offline.
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const host = new URL(e.request.url).hostname;
  const isFont = host === "fonts.googleapis.com" || host === "fonts.gstatic.com";
  e.respondWith(
    caches.match(e.request).then((hit) => hit || fetch(e.request).then((res) => {
      if (isFont && res && (res.ok || res.type === "opaque")) {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
      }
      return res;
    }))
  );
});
