// Progress backup and restore, shared by ROS 2 Learn and PLC Learn.
// Progress lives in this browser's localStorage only, so a phone, a laptop and the desktop app each keep
// their own copy, and clearing browser data erases it. This adds "Back up / restore progress" to the lesson
// list: save a file, copy a short code (paste it into a WhatsApp chat to yourself), and restore from either.
//
// Source of truth: C:\Users\hp\shared-web\backup.js. Copy it into each app with shared-web\sync.ps1.
// Use:  <script src="backup.js"></script> after the page, then
//       AppBackup.init({ app: "ros2-learn", title: "ROS 2 Learn", key: "ros2learn.v1" });
(function (root) {
  "use strict";
  var cfg = null, overlay = null;

  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text) e.textContent = text; return e; }
  function today() { var d = new Date(); return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
  function toB64(str) { return btoa(unescape(encodeURIComponent(str))); }
  function fromB64(b64) { return decodeURIComponent(escape(atob(b64))); }

  function readState() {
    var raw = null;
    try { raw = localStorage.getItem(cfg.key); } catch (e) {}
    return raw ? JSON.parse(raw) : null;
  }
  function wrapper() {
    var data = readState();
    if (!data) return null;
    return { app: cfg.app, version: 1, exported: new Date().toISOString(), data: data };
  }
  function makeCode(w) { return cfg.app.toUpperCase().replace(/[^A-Z0-9]/g, "") + "1:" + toB64(JSON.stringify(w)); }

  // Turn pasted text (a code or the JSON of a file) into a checked wrapper, or throw a readable error.
  function parseBackup(text) {
    text = String(text || "").trim();
    if (!text) throw new Error("Paste a backup code first, or choose a backup file.");
    var json = text;
    var m = /^([A-Z0-9]+1):([A-Za-z0-9+\/=\s]+)$/.exec(text);
    if (m) {
      if (m[1] !== cfg.app.toUpperCase().replace(/[^A-Z0-9]/g, "") + "1") throw new Error("This code is from a different app.");
      try { json = fromB64(m[2].replace(/\s+/g, "")); } catch (e) { throw new Error("That code looks damaged. Copy it again in full."); }
    }
    var w;
    try { w = JSON.parse(json); } catch (e) { throw new Error("That is not a backup from this app."); }
    if (!w || typeof w !== "object" || w.app !== cfg.app || !w.data || typeof w.data !== "object") throw new Error("That is not a backup from " + cfg.title + ".");
    var d = w.data;
    if (typeof d.done !== "object" || typeof d.awards !== "object" || d.done === null || d.awards === null) throw new Error("The backup is missing its progress data.");
    if (JSON.stringify(d).length > 2000000) throw new Error("The backup is too large.");
    return w;
  }
  function summary(d) {
    var xp = 0, k;
    for (k in d.awards) if (typeof d.awards[k] === "number") xp += d.awards[k];
    var lessons = Object.keys(d.done).filter(function (x) { return d.done[x]; }).length;
    return xp + " XP, " + lessons + " lesson" + (lessons === 1 ? "" : "s") + " completed";
  }

  function download(name, text) {
    var blob = new Blob([text], { type: "application/json" }), url = URL.createObjectURL(blob);
    var a = el("a"); a.href = url; a.download = name; document.body.appendChild(a); a.click();
    setTimeout(function () { document.body.removeChild(a); URL.revokeObjectURL(url); }, 500);
  }
  function copyText(text, done) {
    function fallback() {
      var t = el("textarea"); t.value = text; t.style.position = "fixed"; t.style.opacity = "0"; document.body.appendChild(t); t.select();
      var ok = false; try { ok = document.execCommand("copy"); } catch (e) {} document.body.removeChild(t); done(ok);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { done(true); }, fallback); else fallback();
  }

  function css() {
    if (document.getElementById("backupcss")) return;
    var s = el("style"); s.id = "backupcss";
    s.textContent =
      ".bk-over { position: fixed; inset: 0; z-index: 40; background: rgba(0,0,0,.6); display: flex; align-items: flex-end; justify-content: center; padding: 0; }" +
      "@media (min-width: 640px) { .bk-over { align-items: center; padding: 20px; } }" +
      ".bk { width: 100%; max-width: 520px; max-height: 92vh; max-height: 92dvh; overflow-y: auto; background: var(--panel); color: var(--ink); border: 1px solid var(--line); border-radius: 14px 14px 0 0; padding: 18px 18px calc(18px + env(safe-area-inset-bottom, 0px)); box-shadow: 0 -10px 40px rgba(0,0,0,.4); font: 15px/1.5 system-ui, sans-serif; }" +
      "@media (min-width: 640px) { .bk { border-radius: 14px; } }" +
      ".bk h2 { margin: 0 0 6px; font-size: 20px; } .bk p { margin: 6px 0; max-width: none; color: var(--muted); font-size: 14px; } .bk h3 { margin: 16px 0 6px; font-size: 14px; text-transform: uppercase; letter-spacing: .06em; }" +
      ".bk-row { display: flex; flex-wrap: wrap; gap: 8px; margin: 8px 0; }" +
      ".bk button, .bk .bk-file { min-height: 44px; padding: 0 16px; border-radius: 10px; border: 1px solid var(--line); background: var(--bg); color: var(--ink); font: 700 14px system-ui, sans-serif; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; }" +
      ".bk button.bk-main { background: var(--accent); border-color: var(--accent); color: var(--accent-ink); }" +
      ".bk button.bk-danger { background: var(--bad); border-color: var(--bad); color: #fff; }" +
      ".bk textarea { width: 100%; min-height: 84px; box-sizing: border-box; padding: 10px; border-radius: 10px; border: 1px solid var(--line); background: var(--bg); color: var(--ink); font: 16px ui-monospace, Consolas, monospace; }" +
      ".bk-msg { min-height: 22px; margin-top: 8px; font-weight: 700; font-size: 14px; } .bk-msg.ok { color: var(--ok); } .bk-msg.bad { color: var(--bad); }" +
      ".bk-x { float: right; width: 44px; padding: 0 !important; font-size: 20px !important; }";
    document.head.appendChild(s);
  }

  function close() {
    if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
    overlay = null; document.removeEventListener("keydown", onKey);
  }
  function onKey(e) { if (e.key === "Escape") close(); }

  function open() {
    if (!cfg) return;
    close(); css();
    overlay = el("div", "bk-over");
    var box = el("div", "bk"); box.setAttribute("role", "dialog"); box.setAttribute("aria-modal", "true"); box.setAttribute("aria-label", "Back up or restore progress");
    var x = el("button", "bk-x", "✕"); x.type = "button"; x.setAttribute("aria-label", "Close"); x.addEventListener("click", close);
    box.appendChild(x);
    box.appendChild(el("h2", "", "Back up your progress"));
    box.appendChild(el("p", "", "Your XP, badges and notes are saved in this browser only. A phone, a computer and the desktop app each keep their own copy, and clearing browser data erases it. Save a backup now and then, or move progress to another device."));

    var w = wrapper();
    box.appendChild(el("h3", "", "Save"));
    var info = el("p", "", w ? "Right now: " + summary(w.data) + "." : "Nothing to back up yet. Finish a lesson first.");
    box.appendChild(info);
    var row = el("div", "bk-row");
    var bFile = el("button", "bk-main", "Save backup file"); bFile.type = "button"; bFile.disabled = !w;
    var bCopy = el("button", "", "Copy backup code"); bCopy.type = "button"; bCopy.disabled = !w;
    row.appendChild(bFile); row.appendChild(bCopy); box.appendChild(row);
    box.appendChild(el("p", "", "Tip: copy the code, then paste it into a WhatsApp chat with yourself. On another device, copy it from there and paste it below."));

    box.appendChild(el("h3", "", "Restore"));
    var ta = el("textarea"); ta.setAttribute("placeholder", "Paste a backup code here"); ta.setAttribute("spellcheck", "false"); ta.setAttribute("autocapitalize", "none"); ta.setAttribute("autocorrect", "off"); ta.setAttribute("aria-label", "Backup code");
    box.appendChild(ta);
    var row2 = el("div", "bk-row");
    var lab = el("label", "bk-file", "Choose backup file"); var fi = el("input"); fi.type = "file"; fi.accept = ".json,application/json,text/plain"; fi.style.display = "none"; lab.appendChild(fi);
    var bRestore = el("button", "bk-main", "Restore"); bRestore.type = "button";
    row2.appendChild(lab); row2.appendChild(bRestore); box.appendChild(row2);
    var msg = el("div", "bk-msg"); msg.setAttribute("role", "status"); box.appendChild(msg);
    function say(t, cls) { msg.textContent = t; msg.className = "bk-msg" + (cls ? " " + cls : ""); }

    bFile.addEventListener("click", function () {
      var cur = wrapper(); if (!cur) return;
      download(cfg.app + "-progress-" + today() + ".json", JSON.stringify(cur, null, 1));
      say("Backup file saved.", "ok");
    });
    bCopy.addEventListener("click", function () {
      var cur = wrapper(); if (!cur) return;
      copyText(makeCode(cur), function (ok) { say(ok ? "Backup code copied." : "Could not copy. Use Save backup file instead.", ok ? "ok" : "bad"); });
    });
    fi.addEventListener("change", function () {
      var f = fi.files && fi.files[0]; if (!f) return;
      if (f.size > 2000000) { say("That file is too large to be a backup.", "bad"); return; }
      var r = new FileReader();
      r.onload = function () { ta.value = String(r.result); say("File loaded. Tap Restore.", "ok"); };
      r.onerror = function () { say("Could not read that file.", "bad"); };
      r.readAsText(f);
    });
    var armed = false;
    ta.addEventListener("input", function () { armed = false; bRestore.textContent = "Restore"; bRestore.className = "bk-main"; });
    bRestore.addEventListener("click", function () {
      var parsed;
      try { parsed = parseBackup(ta.value); } catch (e) { say(e.message, "bad"); armed = false; return; }
      if (!armed) {
        armed = true; bRestore.textContent = "Tap again to replace";
        bRestore.className = "bk-danger";
        say("This backup has " + summary(parsed.data) + ". Restoring replaces the progress on this device.", "");
        return;
      }
      try { localStorage.setItem(cfg.key, JSON.stringify(parsed.data)); } catch (e) { say("Could not save: browser storage is blocked.", "bad"); return; }
      say("Restored. Reloading…", "ok");
      setTimeout(function () { location.reload(); }, 500);
    });

    overlay.appendChild(box);
    overlay.addEventListener("click", function (e) { if (e.target === overlay) close(); });
    document.body.appendChild(overlay);
    document.addEventListener("keydown", onKey);
    x.focus();
  }

  function init(options) {
    cfg = options;
    var foot = document.querySelector(".side-foot");
    if (foot && !document.getElementById("backupbtn")) {
      var b = el("button", "link", "Back up / restore progress"); b.id = "backupbtn"; b.type = "button";
      foot.insertBefore(b, foot.firstChild);
    }
    document.addEventListener("click", function (e) {
      var t = e.target.closest && e.target.closest("#backupbtn, [data-backup]");
      if (t) { e.preventDefault(); open(); }
    });
  }

  root.AppBackup = { init: init, open: open, _parse: function (t) { return parseBackup(t); }, _code: function () { var w = wrapper(); return w && makeCode(w); } };
})(typeof window !== "undefined" ? window : globalThis);
