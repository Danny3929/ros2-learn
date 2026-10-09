// Bump CACHE whenever any file changes so installed copies pick up the update.
// Python (Pyodide) files from the CDN are big, so they live in their own cache that is kept across updates.
const PYCACHE = "ros2-learn-pyodide";
const CACHE = "ros2-learn-v24";
const FILES = [
  "./", "./index.html", "./style.css", "./app.js", "./manifest.json",
  "./content/m0_linux.js", "./content/m1_python.js", "./content/m2_turtlesim.js",
  "./content/m3_workspaces.js", "./content/m4_robot.js", "./content/m5_mapping.js", "./content/m6_talking.js", "./content/m7_debugging.js", "./content/planned.js",
  "./content/story.js", "./content/enhance.js", "./content/sim.js", "./content/practicals.js", "./content/pyworker.js",
  "./images/gazebo_mybot.jpg", "./images/gazebo_pillars.jpg", "./images/gazebo_turtlebot.jpg", "./images/nav2_costmaps.jpg", "./images/rqt_console.jpg", "./images/rviz_mybot.jpg", "./images/saved_map.jpg", "./images/slam_building_map.jpg", "./images/turtle_chase.jpg", "./images/turtle_circle.jpg", "./images/turtle_two.jpg",
  "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE && k !== PYCACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Our own files: network first, so a visit always shows the newest version.
// Each good response refreshes the saved copy, which is used only when offline.
// Google Fonts files are cache first and saved the first time they load, so the
// fonts also work offline.
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  if (url.origin === self.location.origin) {
    e.respondWith(
      fetch(e.request, { cache: "no-cache" })
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(e.request, copy));
          }
          return res;
        })
        .catch(() => caches.match(e.request, { ignoreSearch: true }).then((hit) => hit || caches.match("./index.html")))
    );
    return;
  }
  const host = url.hostname;
  if (host === "cdn.jsdelivr.net" && url.pathname.indexOf("/pyodide/") === 0) {
    e.respondWith(
      caches.open(PYCACHE).then((c) => c.match(e.request).then((hit) => hit || fetch(e.request).then((res) => {
        if (res && res.ok) c.put(e.request, res.clone());
        return res;
      })))
    );
    return;
  }
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
