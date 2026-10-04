(function () {
  "use strict";
  var KEY = "ros2learn.v1";
  var mods = (window.MODULES || []).slice().sort(function (a, b) { return a.order - b.order; });
  var lessons = [];
  mods.forEach(function (m) { (m.lessons || []).forEach(function (l) { l.mod = m; lessons.push(l); }); });

  // ---------- state ----------
  var blank = function () { return { done: {}, notes: {}, quiz: {}, tries: {}, tried: {}, awards: {}, badges: {}, days: [] }; };
  var state = blank();
  try { var raw = localStorage.getItem(KEY); if (raw) state = Object.assign(blank(), JSON.parse(raw)); } catch (e) {}
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }
  var currentId = null;

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function $(id) { return document.getElementById(id); }

  // ---------- game rules ----------
  var LEVELS = [
    { at: 0, title: "Rookie" }, { at: 60, title: "Node" }, { at: 140, title: "Topic" }, { at: 250, title: "Publisher" },
    { at: 400, title: "Subscriber" }, { at: 600, title: "Service Caller" }, { at: 850, title: "Launcher" },
    { at: 1150, title: "Navigator" }, { at: 1500, title: "Roboticist" }
  ];
  var XP = { quizFirst: 10, quizRetry: 3, tryIt: 10, lesson: 25, module: 50 };

  function totalXp() { var t = 0; for (var k in state.awards) t += state.awards[k]; return t; }
  function levelFor(xp) {
    var i = 0; while (i + 1 < LEVELS.length && xp >= LEVELS[i + 1].at) i++;
    return i;
  }
  function today(offset) {
    var d = new Date(); d.setDate(d.getDate() - (offset || 0));
    return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2);
  }
  function streak() {
    var n = 0, off = state.days.indexOf(today(0)) >= 0 ? 0 : 1;
    while (state.days.indexOf(today(n + off)) >= 0) n++;
    return n;
  }
  function modDone(m) { return (m.lessons || []).length > 0 && m.lessons.every(function (l) { return state.done[l.id]; }); }
  function countKeys(obj, prefix) { return Object.keys(obj).filter(function (k) { return k.indexOf(prefix) === 0; }).length; }

  var BADGES = [
    { id: "first", icon: "🚀", name: "Liftoff", desc: "Complete your first lesson", test: function () { return lessons.some(function (l) { return state.done[l.id]; }); } },
    { id: "sharp", icon: "🎯", name: "Sharp shooter", desc: "Answer 3 quizzes right on the first try", test: function () { return countKeys(state.awards, "q:") >= 3 && Object.keys(state.awards).filter(function (k) { return k.indexOf("q:") === 0 && state.awards[k] === XP.quizFirst; }).length >= 3; } },
    { id: "hands", icon: "🛠️", name: "Hands on", desc: "Finish 5 Try-it tasks", test: function () { return Object.keys(state.tried).length >= 5; } },
    { id: "notes", icon: "📝", name: "Note taker", desc: "Write notes in 3 lessons", test: function () { return Object.keys(state.notes).filter(function (k) { return state.notes[k].trim(); }).length >= 3; } },
    { id: "fire", icon: "🔥", name: "On fire", desc: "Reach a 3-day streak", test: function () { return streak() >= 3; } },
    { id: "m0", icon: "🐧", name: "Terminal tamer", desc: "Complete the Linux module", test: function () { return mods.some(function (m) { return m.order === 0 && modDone(m); }); } },
    { id: "m1", icon: "🐍", name: "Pythonista", desc: "Complete the Python module", test: function () { return mods.some(function (m) { return m.order === 1 && modDone(m); }); } },
    { id: "m2", icon: "🐢", name: "Turtle driver", desc: "Complete the turtlesim module", test: function () { return mods.some(function (m) { return m.order === 2 && modDone(m); }); } },
    { id: "m3", icon: "📦", name: "Package builder", desc: "Complete the workspaces and packages module", test: function () { return mods.some(function (m) { return m.order === 3 && modDone(m); }); } },
    { id: "lv4", icon: "⭐", name: "Rising star", desc: "Reach level 4", test: function () { return levelFor(totalXp()) >= 3; } }
  ];

  // ---------- feedback ----------
  var reduced = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  function toast(msg, cls) {
    var box = $("toasts"), t = document.createElement("div");
    t.className = "toast " + (cls || ""); t.innerHTML = msg; box.appendChild(t);
    setTimeout(function () { t.classList.add("out"); }, 2600);
    setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 3100);
  }
  function confetti(n) {
    if (reduced) return;
    var colors = ["#4db3e0", "#6cc38f", "#f2b84b", "#ef6f6c", "#b48ef0"];
    for (var i = 0; i < n; i++) {
      var p = document.createElement("i"); p.className = "conf";
      p.style.left = 30 + Math.random() * 40 + "vw";
      p.style.background = colors[i % colors.length];
      p.style.setProperty("--dx", (Math.random() * 300 - 150) + "px");
      p.style.setProperty("--dy", (Math.random() * 260 + 120) + "px");
      p.style.setProperty("--rot", (Math.random() * 720 - 360) + "deg");
      document.body.appendChild(p);
      (function (el) { setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 1300); })(p);
    }
  }

  function award(key, xp, label) {
    if (state.awards[key] !== undefined) return false;
    var before = levelFor(totalXp());
    var d = today(0);
    var firstToday = state.days.indexOf(d) < 0;
    if (firstToday) state.days.push(d);
    state.awards[key] = xp;
    toast("<b>+" + xp + " XP</b> " + esc(label), "xp");
    if (firstToday) {
      var s = streak();
      if (s >= 2) { var bonus = Math.min(s, 5) * 5; state.awards["s:" + d] = bonus; toast("🔥 <b>" + s + "-day streak!</b> +" + bonus + " XP", "xp"); }
    }
    var after = levelFor(totalXp());
    if (after > before) { toast("🎉 <b>Level " + (after + 1) + ": " + LEVELS[after].title + "</b>", "big"); confetti(40); }
    checkBadges();
    save(); renderHud(); renderNav(currentId);
    return true;
  }
  function checkBadges() {
    BADGES.forEach(function (b) {
      if (!state.badges[b.id] && b.test()) { state.badges[b.id] = true; toast("🏅 Badge unlocked: <b>" + esc(b.name) + "</b>", "big"); confetti(24); }
    });
  }

  // ---------- rendering ----------
  function renderHud() {
    var xp = totalXp(), li = levelFor(xp), cur = LEVELS[li], nxt = LEVELS[li + 1];
    var pct = nxt ? Math.round(((xp - cur.at) / (nxt.at - cur.at)) * 100) : 100;
    var s = streak();
    var h = '<div class="lv"><b>Level ' + (li + 1) + "</b> " + esc(cur.title) + "</div>" +
      '<div class="bar xp"><i style="width:' + pct + '%"></i></div>' +
      '<div class="xpline">' + xp + " XP" + (nxt ? " · " + (nxt.at - xp) + " to " + esc(nxt.title) : " · max level") +
      (s ? " · 🔥 " + s + (s === 1 ? " day" : "-day streak") : "") + "</div><div class=\"badges\">";
    BADGES.forEach(function (b) {
      var on = state.badges[b.id];
      h += '<span class="badge' + (on ? " on" : "") + '" title="' + esc(b.name + ": " + b.desc) + '">' + (on ? b.icon : "🔒") + "</span>";
    });
    $("hud").innerHTML = h + "</div>";
  }

  function renderNav(activeId) {
    var html = "";
    mods.forEach(function (m) {
      var has = m.lessons && m.lessons.length, n = has ? m.lessons.filter(function (l) { return state.done[l.id]; }).length : 0;
      html += '<div class="mod' + (has ? "" : " soon") + '"><h3>' + esc(m.title) +
        (has ? ' <span class="soon-tag">' + (modDone(m) ? "⭐ " : "") + n + "/" + m.lessons.length + "</span>" : ' <span class="soon-tag">(locked)</span>') + "</h3>";
      (m.lessons || []).forEach(function (l) {
        html += '<a class="nav-item' + (l.id === activeId ? " active" : "") + '" href="#/' + l.id + '">' +
          '<span class="tick">' + (state.done[l.id] ? "✓" : "") + "</span><span>" + esc(l.id + "  " + l.title) + "</span></a>";
      });
      (m.planned || []).forEach(function (t) {
        html += '<div class="nav-item planned"><span class="tick">🔒</span><span>' + esc(t) + "</span></div>";
      });
      html += "</div>";
    });
    $("nav").innerHTML = html;
  }

  function copy(text, btn) {
    function ok() { btn.textContent = "Copied"; setTimeout(function () { btn.textContent = "Copy"; }, 1200); }
    function fallback() {
      var t = document.createElement("textarea"); t.value = text; document.body.appendChild(t); t.select();
      try { document.execCommand("copy"); ok(); } catch (e) {} document.body.removeChild(t);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(ok, fallback); else fallback();
  }

  function renderBlock(l, b, i) {
    var kind = b[0], v = b[1], key = l.id + ":" + i;
    if (kind === "p") return "<p>" + v + "</p>";
    if (kind === "h") return "<h2>" + esc(v) + "</h2>";
    if (kind === "ul") return "<ul>" + v.map(function (x) { return "<li>" + x + "</li>"; }).join("") + "</ul>";
    if (kind === "note") return '<div class="box note"><b class="t">Note</b><p>' + v + "</p></div>";
    if (kind === "warn") return '<div class="box warn"><b class="t">Watch out</b><p>' + v + "</p></div>";
    if (kind === "try") {
      var d = state.tried[key];
      return '<div class="box try"><b class="t">Quest</b><p>' + v + '</p><button class="quest' + (d ? " got" : "") + '" data-try="' + key + '"' + (d ? " disabled" : "") + ">" +
        (d ? "✓ Quest complete" : "I did it · +" + XP.tryIt + " XP") + "</button></div>";
    }
    if (kind === "out") return '<pre class="out">' + esc(v) + "</pre>";
    if (kind === "cmd") {
      var where = b[2] || "Ubuntu (WSL) terminal";
      return '<div class="cmd"><span class="where">' + esc(where) + '</span><span class="prompt">$ </span>' + esc(v) +
        '<button data-copy="' + esc(v).replace(/"/g, "&quot;") + '">Copy</button></div>';
    }
    if (kind === "code") {
      return '<div class="cmd code"><span class="where">File: ' + esc(b[2] || "script.py") + "</span>" + esc(v) +
        '<button data-copy="' + esc(v).replace(/"/g, "&quot;") + '">Copy</button></div>';
    }
    if (kind === "repl") {
      return '<div class="cmd code"><span class="where">Inside Python (the &gt;&gt;&gt; prompt)</span>' + esc(v) + "</div>";
    }
    if (kind === "quiz") {
      var chosen = state.quiz[key], solved = chosen === v.answer;
      var h = '<div class="quiz" data-key="' + key + '"><div class="q">' + v.q + "</div>";
      v.options.forEach(function (o, idx) {
        var cls = "opt";
        if (chosen !== undefined) { if (idx === v.answer && solved) cls += " right"; else if (idx === chosen) cls += " wrong"; }
        h += '<button class="' + cls + '" data-idx="' + idx + '"' + (solved ? " disabled" : "") + ">" + o + "</button>";
      });
      if (chosen !== undefined) h += '<div class="why">' + (solved ? "Correct. " : "Not quite, try again. ") + (solved ? v.why : "") + "</div>";
      return h + "</div>";
    }
    return "";
  }

  function renderWelcome() {
    currentId = null; renderNav(null); renderHud();
    var next = lessons.find(function (l) { return !state.done[l.id]; });
    var started = Object.keys(state.awards).length > 0;
    $("lesson").innerHTML = '<div class="welcome"><h1>Learn ROS 2 from zero</h1>' +
      '<div class="meta">Humble on Ubuntu 22.04 (WSL) · Python · simulation first</div>' +
      "<p>This course assumes no Linux or Python experience. Earn <b>XP</b> for correct answers, quests and finished lessons, level up, keep a daily <b>streak</b> and collect badges.</p><ul>" +
      "<li><b>Linux terminal</b>: the commands every ROS 2 session depends on.</li>" +
      "<li><b>Python basics</b>: just enough to write ROS 2 nodes.</li>" +
      "<li><b>ROS 2 in simulation</b>: turtlesim, then Gazebo and RViz. No robot needed.</li></ul>" +
      "<p>Wrong answers never cost XP, so experiment. Tell Claude when you are stuck and paste the error.</p>" +
      (next ? '<div class="actions"><a class="btn" href="#/' + next.id + '">' + (started ? "Continue: " : "Start: ") + esc(next.id + " " + next.title) + "</a></div>" : "<p><b>You have finished every available lesson. More are coming.</b></p>") + "</div>";
  }

  function renderLesson(id, keepScroll) {
    var idx = lessons.findIndex(function (l) { return l.id === id; });
    if (idx < 0) return renderWelcome();
    var l = lessons[idx];
    currentId = id; renderNav(id); renderHud();
    var h = "<h1>" + esc(l.id + "  " + l.title) + '</h1><div class="meta">' + esc(l.mod.title) + " · about " + l.minutes + " min</div>";
    l.blocks.forEach(function (b, i) { h += renderBlock(l, b, i); });
    h += '<div class="notes"><h2>My notes</h2><textarea id="note" placeholder="Anything you want to remember or ask about later"></textarea></div>';
    var prev = lessons[idx - 1], next = lessons[idx + 1], got = state.awards["l:" + id] !== undefined;
    h += '<div class="actions">' +
      (prev ? '<a class="btn ghost" href="#/' + prev.id + '">← ' + esc(prev.title) + "</a>" : "") +
      '<button class="btn' + (state.done[id] ? " done" : "") + '" id="done">' + (state.done[id] ? "✓ Completed" : "Complete lesson" + (got ? "" : " · +" + XP.lesson + " XP")) + "</button>" +
      (next ? '<a class="btn ghost" href="#/' + next.id + '">' + esc(next.title) + " →</a>" : "") + "</div>";
    $("lesson").innerHTML = h;
    $("note").value = state.notes[id] || "";
    $("note").addEventListener("input", function (e) { state.notes[id] = e.target.value; save(); checkBadges(); save(); renderHud(); });
    $("done").addEventListener("click", function () {
      state.done[id] = !state.done[id]; save();
      if (state.done[id]) {
        if (award("l:" + id, XP.lesson, "lesson complete")) confetti(30);
        if (modDone(l.mod) && award("m:" + l.mod.order, XP.module, "module complete: " + l.mod.title)) confetti(60);
        checkBadges(); save();
      }
      renderLesson(id, true);
    });
    $("lesson").querySelectorAll(".cmd button").forEach(function (b) {
      b.addEventListener("click", function () { copy(b.getAttribute("data-copy"), b); });
    });
    $("lesson").querySelectorAll("button.quest").forEach(function (b) {
      b.addEventListener("click", function () {
        var k = b.getAttribute("data-try"); state.tried[k] = true; save();
        award("t:" + k, XP.tryIt, "quest complete"); confetti(14); rewire(l);
      });
    });
    $("lesson").querySelectorAll(".quiz").forEach(function (q) {
      var key = q.getAttribute("data-key"), bi = parseInt(key.split(":")[1], 10), blk = l.blocks[bi][1];
      q.querySelectorAll("button.opt").forEach(function (b) {
        b.addEventListener("click", function () {
          var pick = parseInt(b.getAttribute("data-idx"), 10);
          state.tries[key] = (state.tries[key] || 0) + 1; state.quiz[key] = pick; save();
          if (pick === blk.answer) {
            award("q:" + key, state.tries[key] === 1 ? XP.quizFirst : XP.quizRetry, state.tries[key] === 1 ? "first try!" : "correct");
            if (state.tries[key] === 1) confetti(10);
          }
          rewire(l);
        });
      });
    });
    if (!keepScroll) window.scrollTo(0, 0);
    $("side").classList.remove("open");
  }

  function rewire(l) { var y = window.scrollY; renderLesson(l.id, true); window.scrollTo(0, y); }

  function route() {
    var m = location.hash.match(/^#\/(.+)$/);
    if (m) renderLesson(decodeURIComponent(m[1])); else renderWelcome();
  }
  window.addEventListener("hashchange", route);
  $("menu").addEventListener("click", function () { $("side").classList.toggle("open"); });
  $("reset").addEventListener("click", function () {
    if (confirm("Erase all XP, badges, progress, notes and quiz answers?")) { state = blank(); save(); route(); }
  });
  route();
})();
