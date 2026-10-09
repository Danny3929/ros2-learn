// "Install app" button, shared by ROS 2 Learn and PLC Learn.
// Adds an "Install app" link to the lesson list footer. On Android/desktop Chrome and Edge it opens the real
// install prompt; on iPhone/iPad Safari and other browsers it shows the short manual steps. It hides itself
// once the app is installed (running standalone).
//
// Source of truth: C:\Users\hp\shared-web\install.js. Copy it into each app with shared-web\sync.ps1.
// Use:  <script src="content/install.js"></script> after the page, then  AppInstall.init({ title: "ROS 2 Learn" });
(function (root) {
  "use strict";
  var deferred = null, cfg = { title: "this app" }, btn = null, bar = null;

  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text) e.textContent = text; return e; }
  function standalone() {
    try { if (root.matchMedia && root.matchMedia("(display-mode: standalone)").matches) return true; } catch (e) {}
    return !!navigator.standalone;
  }
  function isIOS() { return /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1); }

  function steps() {
    if (isIOS()) return "In Safari, tap the Share button (the square with an arrow), then choose \u201cAdd to Home Screen\u201d. It must be Safari, not Chrome.";
    if (/android/i.test(navigator.userAgent)) return "Open the browser menu (\u22EE) and choose \u201cInstall app\u201d or \u201cAdd to Home screen\u201d.";
    return "Look for the install icon at the right end of the address bar, or open the browser menu and choose \u201cInstall " + cfg.title + "\u201d.";
  }

  function css() {
    if (document.getElementById("installcss")) return;
    var s = el("style"); s.id = "installcss";
    s.textContent =
      ".ins{position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;padding:16px}" +
      ".ins-box{background:var(--panel,#fff);color:var(--ink,#111);max-width:380px;width:100%;border-radius:14px;padding:20px;box-shadow:0 10px 40px rgba(0,0,0,.4);font:14px/1.5 system-ui,sans-serif}" +
      ".ins-bar{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(14px + env(safe-area-inset-bottom,0px));z-index:9000;display:flex;align-items:center;background:var(--accent,#5b4bdb);color:var(--accent-ink,#fff);border-radius:999px;box-shadow:0 6px 20px rgba(0,0,0,.35)}" +
      ".ins-bar button{background:none;border:0;color:inherit;font:700 14px system-ui,sans-serif;cursor:pointer;min-height:44px}" +
      ".ins-go{padding:0 8px 0 18px}.ins-x{padding:0 16px 0 8px;opacity:.8}" +
      ".ins-box h2{margin:0 0 8px;font-size:18px}.ins-box p{margin:0 0 14px}" +
      ".ins-box button{background:var(--accent,#5b4bdb);color:var(--accent-ink,#fff);border:0;border-radius:10px;padding:10px 18px;font:inherit;font-weight:700;cursor:pointer;min-height:40px}";
    document.head.appendChild(s);
  }
  function showSteps() {
    css();
    var o = el("div", "ins"), b = el("div", "ins-box");
    o.setAttribute("role", "dialog"); o.setAttribute("aria-modal", "true");
    b.appendChild(el("h2", "", "Install " + cfg.title));
    b.appendChild(el("p", "", steps()));
    b.appendChild(el("p", "", "It then opens full-screen with its own icon and works offline."));
    var ok = el("button", "", "Got it"); ok.type = "button";
    function close() { o.remove(); document.removeEventListener("keydown", onKey); }
    function onKey(e) { if (e.key === "Escape") close(); }
    ok.addEventListener("click", close);
    o.addEventListener("click", function (e) { if (e.target === o) close(); });
    document.addEventListener("keydown", onKey);
    b.appendChild(ok); o.appendChild(b); document.body.appendChild(o); ok.focus();
  }

  function click() {
    if (deferred) {
      var p = deferred; deferred = null;
      p.prompt();
      if (p.userChoice) p.userChoice.then(function (r) { if (r && r.outcome === "accepted") hide(); });
    } else showSteps();
  }
  function hide() { if (btn) btn.hidden = true; if (bar) bar.remove(); bar = null; }

  // A floating bar so the option is visible without opening the lesson list. Dismissing it is remembered.
  function showBar() {
    try { if (localStorage.getItem("installbar.dismissed")) return; } catch (e) {}
    css();
    bar = el("div", "ins-bar");
    var b = el("button", "ins-go", "⬇ Install " + cfg.title); b.type = "button";
    b.addEventListener("click", click);
    var x = el("button", "ins-x", "✕"); x.type = "button"; x.setAttribute("aria-label", "Hide the install bar");
    x.addEventListener("click", function () {
      try { localStorage.setItem("installbar.dismissed", "1"); } catch (e) {}
      bar.remove(); bar = null;
    });
    bar.appendChild(b); bar.appendChild(x); document.body.appendChild(bar);
  }

  function init(options) {
    if (options) cfg = options;
    if (standalone()) return;
    // Electron (the desktop app) has no install step.
    if (/electron/i.test(navigator.userAgent)) return;
    root.addEventListener("beforeinstallprompt", function (e) { e.preventDefault(); deferred = e; });
    root.addEventListener("appinstalled", function () { deferred = null; hide(); });
    var foot = document.querySelector(".side-foot");
    if (foot && !document.getElementById("installbtn")) {
      btn = el("button", "link", "Install app"); btn.id = "installbtn"; btn.type = "button";
      btn.addEventListener("click", click);
      foot.insertBefore(btn, foot.firstChild);
    }
    if (document.body) showBar(); else document.addEventListener("DOMContentLoaded", showBar);
  }

  root.AppInstall = { init: init };
})(typeof window !== "undefined" ? window : globalThis);
