// Bump CACHE whenever any file changes so installed copies pick up the update.
const CACHE = "ros2-learn-v1";
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

// Cache first, fall back to the network.
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request)));
});
