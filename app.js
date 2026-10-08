(function () {
  "use strict";
  var KEY = "ros2learn.v1";
  var mods = (window.MODULES || []).slice().sort(function (a, b) { return a.order - b.order; });
  var lessons = [];
  mods.forEach(function (m) { (m.lessons || []).forEach(function (l) { l.mod = m; lessons.push(l); }); });

  // Every block keeps its ORIGINAL number as its key, because saved answers and XP are stored under it.
  // Extra blocks (pictures, predictions) come from content/enhance.js and get their own stable keys,
  // so adding them never shifts what was already saved.
  lessons.forEach(function (l) { l.blocks.forEach(function (b, i) { b.key = String(i); }); });
  function blockText(b) { return typeof b[1] === "string" ? b[1] : Array.isArray(b[1]) ? b[1].join(" ") : (b[1] && b[1].q ? b[1].q : ""); }
  (window.ENHANCE || []).forEach(function (e) {
    var l = lessons.find(function (x) { return x.id === e.lesson; });
    if (!l) { console.warn("enhance: no lesson " + e.lesson); return; }
    var at = e.at, pos = -1;
    for (var i = 0; i < l.blocks.length; i++) {
      var b = l.blocks[i];
      if (b.key.charAt(0) === "e") continue;
      if (at.kind && b[0] !== at.kind) continue;
      var t = blockText(b);
      if (at.exact ? t === at.text : t.indexOf(at.text) >= 0) { pos = i; break; }
    }
    if (pos < 0) { console.warn("enhance: no match for " + e.id); return; }
    e.blocks.forEach(function (nb, n) { nb.key = "e_" + e.id + "_" + n; });
    Array.prototype.splice.apply(l.blocks, [e.place === "before" ? pos : pos + 1, 0].concat(e.blocks));
  });
  // Practice-terminal practicals (content/practicals.js) go at the end of their lesson.
  (window.PRACTICALS || []).forEach(function (p) {
    var l = lessons.find(function (x) { return x.id === p.lesson; });
    if (!l) { console.warn("practical: no lesson " + p.lesson); return; }
    var nb = ["practical", p]; nb.key = "e_pr_" + p.id; l.blocks.push(nb);
  });
  lessons.forEach(function (l) { l.byKey = {}; l.blocks.forEach(function (b) { l.byKey[b.key] = b; }); });
  function storyFor(order) { return (window.STORY || {})[order]; }

  // ---------- state ----------
  var blank = function () { return { done: {}, notes: {}, quiz: {}, tries: {}, tried: {}, awards: {}, badges: {}, days: [], steps: {}, stepsAll: {}, predict: {}, predictOk: {}, opened: {}, prefs: {}, prac: {} }; };
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
  var XP = { quizFirst: 10, quizRetry: 3, tryIt: 10, lesson: 25, module: 50, predict: 5 };

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
  function modDone(m) { return (m.lessons || []).length > 0 && !(m.planned && m.planned.length) && m.lessons.every(function (l) { return state.done[l.id]; }); }
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
    { id: "m4", icon: "🤖", name: "Robot builder", desc: "Complete the robot simulation module", test: function () { return mods.some(function (m) { return m.order === 4 && modDone(m); }); } },
    { id: "m5", icon: "🗺️", name: "Cartographer", desc: "Complete the mapping module", test: function () { return mods.some(function (m) { return m.order === 5 && modDone(m); }); } },
    { id: "m6", icon: "💬", name: "Communicator", desc: "Complete the services, actions and QoS module", test: function () { return mods.some(function (m) { return m.order === 6 && modDone(m); }); } },
    { id: "m7", icon: "🔧", name: "Debugger", desc: "Complete the recording and debugging module", test: function () { return mods.some(function (m) { return m.order === 7 && modDone(m); }); } },
    { id: "term", icon: "💻", name: "Terminal hacker", desc: "Finish 3 practice-terminal practicals", test: function () { return Object.keys(state.prac || {}).filter(function (k) { return state.prac[k].complete; }).length >= 3; } },
    { id: "oracle", icon: "🔮", name: "Fortune teller", desc: "Predict 5 outcomes correctly before running them", test: function () { return Object.keys(state.predictOk).length >= 5; } },
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

  // ---------- lesson list open/close (phone) ----------
  function navIsOpen() { return $("side").classList.contains("open"); }
  function setNav(open) {
    $("side").classList.toggle("open", open);
    document.body.classList.toggle("nav-open", open);
    $("menu").setAttribute("aria-expanded", open ? "true" : "false");
  }
  function closeNav() { if (navIsOpen()) setNav(false); }

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
    $("home").classList.toggle("active", !activeId);
    $("practicelink").classList.toggle("active", activeId === "practice");
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

  // forKey: the command this block directly follows (so its output can be revealed when that step is ticked)
  function renderBlock(l, b, forKey) {
    var kind = b[0], v = b[1], key = l.id + ":" + b.key;
    if (kind === "p") return "<p>" + v + "</p>";
    if (kind === "h") return "<h2>" + esc(v) + "</h2>";
    if (kind === "ul") return "<ul>" + v.map(function (x) { return "<li>" + x + "</li>"; }).join("") + "</ul>";
    if (kind === "note") return '<div class="box note"><b class="t">Note</b><p>' + v + "</p></div>";
    if (kind === "warn") return '<div class="box warn"><b class="t">Watch out</b><p>' + v + "</p></div>";
    if (kind === "img") {
      return '<figure class="shot"><img src="' + esc(v) + '" alt="' + esc(b[2] || "") + '" loading="lazy">' +
        (b[3] ? "<figcaption>" + b[3] + "</figcaption>" : "") + "</figure>";
    }
    if (kind === "try") {
      var d = state.tried[key];
      return '<div class="box try"><b class="t">Quest</b><p>' + v + '</p><button class="quest' + (d ? " got" : "") + '" data-try="' + key + '"' + (d ? " disabled" : "") + ">" +
        (d ? "✓ Quest complete" : "I did it · +" + XP.tryIt + " XP") + "</button></div>";
    }
    if (kind === "out") {
      var open = (forKey && state.steps[l.id + ":" + forKey]) || state.prefs.outs || state.opened[key];
      return '<details class="expect" data-key="' + key + '"' + (forKey ? ' data-for="' + l.id + ":" + forKey + '"' : "") + (open ? " open" : "") +
        '><summary>👀 What you should see</summary><pre class="out">' + esc(v) + "</pre></details>";
    }
    if (kind === "cmd") {
      var where = b[2] || "Ubuntu (WSL) terminal", ran = state.steps[key];
      return '<div class="cmd step' + (ran ? " ran" : "") + '"><span class="where">' + esc(where) + '</span><span class="prompt">$ </span>' + esc(v) +
        '<button class="stepdone' + (ran ? " on" : "") + '" data-step="' + key + '" aria-pressed="' + (ran ? "true" : "false") + '" title="Tick when you have run this">' + (ran ? "☑ Done" : "☐ Done") + "</button>" +
        '<button data-copy="' + esc(v).replace(/"/g, "&quot;") + '">Copy</button></div>';
    }
    if (kind === "code") {
      return '<div class="cmd code"><span class="where">File: ' + esc(b[2] || "script.py") + "</span>" + esc(v) +
        '<button data-copy="' + esc(v).replace(/"/g, "&quot;") + '">Copy</button></div>';
    }
    if (kind === "repl") {
      return '<div class="cmd code"><span class="where">Inside Python (the &gt;&gt;&gt; prompt)</span>' + esc(v) + "</div>";
    }
    if (kind === "practical") return practicalHtml(v);
    if (kind === "predict") {
      var pick = state.predict[key], answered = pick !== undefined, good = pick === v.answer;
      var ph = '<div class="quiz predict" data-key="' + key + '"><div class="ptag">🔮 Predict first</div><div class="q">' + v.q + "</div>";
      v.options.forEach(function (o, idx) {
        var cls = "opt";
        if (answered) { if (idx === v.answer) cls += " right"; else if (idx === pick) cls += " wrong"; }
        ph += '<button class="' + cls + '" data-idx="' + idx + '"' + (answered ? " disabled" : "") + ">" + o + "</button>";
      });
      ph += answered ? '<div class="why">' + (good ? "You called it. " : "Not quite. ") + v.why + "</div>"
                     : '<div class="hint">Take a guess, there is no penalty. You earn +' + XP.predict + " XP for trying.</div>";
      return ph + "</div>";
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

  // ---------- practice terminal (content/sim.js pretends to be Ubuntu + ROS 2) ----------
  var sessions = {};          // one pretend machine per practical, kept while the page is open
  var SANDBOX = {
    id: "sandbox", title: "Free play", xp: 0, tasks: [],
    intro: "A blank pretend Ubuntu with ROS 2 Humble. Type anything from the lessons, or tap a button to fill it in. Nothing here can break your real computer.",
    chips: ["help", "ls", "pwd", "ros2 run turtlesim turtlesim_node", "ros2 run turtlesim turtle_teleop_key", "ros2 run demo_nodes_cpp talker", "ros2 run demo_nodes_cpp listener", "ros2 node list", "ros2 topic list -t", "ros2 topic echo /chatter --once", "ros2 service list", "ros2 param list /turtlesim", "stop"]
  };
  function getSession(spec) {
    if (!sessions[spec.id]) {
      sessions[spec.id] = { sim: ROSSIM.create({ start: spec.start, files: spec.files, dirs: spec.dirs, cwd: spec.cwd }), lines: [], hist: [], hi: 0, draft: "" };
    }
    return sessions[spec.id];
  }
  function pracRec(id) { if (!state.prac[id]) state.prac[id] = { done: {}, complete: false }; return state.prac[id]; }
  function shortLabel(c) { return c.length > 38 ? c.slice(0, 36) + "…" : c; }

  function practicalHtml(spec) {
    if (!window.ROSSIM) return '<div class="box warn"><b class="t">Practice terminal</b><p>The practice terminal could not load. Reload the page.</p></div>';
    var rec = pracRec(spec.id), h = '<section class="prac" data-prac="' + spec.id + '">' +
      '<header class="phead"><b>💻 Practice terminal</b><span class="ptitle">' + esc(spec.title) + "</span>" +
      (rec.complete ? '<span class="pdone">✓ done</span>' : "") + '<button type="button" class="preset" title="Start this practical again">↺ Reset</button></header>' +
      '<p class="pintro">' + spec.intro + "</p>";
    if (spec.tasks.length) {
      h += '<ol class="ptasks">';
      spec.tasks.forEach(function (t, i) {
        var d = rec.done[i];
        h += '<li class="' + (d ? "ok" : "") + '" data-i="' + i + '"><span class="pbox">' + (d ? "☑" : "☐") + '</span><span class="ptext">' + t.text + "</span>" +
          '<button type="button" class="phint" aria-label="Show a hint">💡</button><div class="phinttext" hidden>' + esc(t.hint || "") + "</div></li>";
      });
      h += "</ol>";
    }
    h += '<div class="pstage" hidden><canvas class="pcanvas" width="264" height="264" aria-label="The turtle window"></canvas>' +
      '<div class="pdpad" hidden><button type="button" data-d="up" aria-label="Forward">▲</button><button type="button" data-d="left" aria-label="Turn left">◀</button>' +
      '<button type="button" data-d="down" aria-label="Backward">▼</button><button type="button" data-d="right" aria-label="Turn right">▶</button></div>' +
      '<div class="pnote">Turtle window (pretend). Start <code>turtle_teleop_key</code> to unlock the arrow pad.</div></div>' +
      '<div class="pscreen"><div class="plines" role="log" aria-live="polite"></div>' +
      '<form class="pform" autocomplete="off"><span class="pps"></span>' +
      '<input class="pin" type="text" autocapitalize="none" autocomplete="off" autocorrect="off" spellcheck="false" enterkeyhint="send" aria-label="Terminal: type a command and press Enter"></form></div>' +
      '<div class="pchips">';
    (spec.chips || []).forEach(function (c) { h += '<button type="button" data-cmd="' + esc(c).replace(/"/g, "&quot;") + '">' + esc(shortLabel(c)) + "</button>"; });
    h += '</div>' +
      '<div class="pkeys"><button type="button" data-k="tab">Tab</button><button type="button" data-k="up">↑</button><button type="button" data-k="down">↓</button>' +
      '<button type="button" data-k="int">Ctrl+C</button><button type="button" data-k="clear">Clear</button></div></section>';
    return h;
  }

  function mountPracticals(root) {
    if (!window.ROSSIM) return;
    root.querySelectorAll(".prac").forEach(function (el) {
      var id = el.getAttribute("data-prac");
      var spec = id === "sandbox" ? SANDBOX : (window.PRACTICALS || []).find(function (p) { return p.id === id; });
      if (spec) mountPractical(el, spec);
    });
  }

  function mountPractical(el, spec) {
    var ses = getSession(spec), sim = ses.sim, rec = pracRec(spec.id);
    var scr = el.querySelector(".pscreen"), lines = el.querySelector(".plines"), inp = el.querySelector(".pin"), ps = el.querySelector(".pps");
    var stage = el.querySelector(".pstage"), cv = el.querySelector(".pcanvas"), pad = el.querySelector(".pdpad");

    function addLine(cls, text) {
      var d = document.createElement("div"); d.className = "pl " + cls; d.textContent = text; lines.appendChild(d);
      scr.scrollTop = scr.scrollHeight;
    }
    function prompt() { return sim.prompt(); }
    ps.textContent = prompt();
    if (!ses.lines.length) ses.lines.push({ c: "sys", t: "Pretend Ubuntu 22.04 with ROS 2 Humble. Type  help  to see what works." });
    ses.lines.forEach(function (l) { addLine(l.c, l.t); });
    function log(cls, text) { ses.lines.push({ c: cls, t: text }); if (ses.lines.length > 300) ses.lines.shift(); addLine(cls, text); }

    // ----- the pretend turtle window -----
    function draw() {
      var on = sim.hasNode("/turtlesim");
      stage.hidden = !on; pad.hidden = !sim.hasTeleop();
      if (!on) return;
      var c = cv.getContext("2d"), k = cv.width / ROSSIM.WORLD;
      c.fillStyle = "rgb(" + sim.bg.join(",") + ")"; c.fillRect(0, 0, cv.width, cv.height);
      c.lineCap = "round";
      sim.trails.forEach(function (t) {
        c.strokeStyle = "rgb(" + t[4] + "," + t[5] + "," + t[6] + ")"; c.lineWidth = Math.max(1, t[7] * 0.8);
        c.beginPath(); c.moveTo(t[0] * k, cv.height - t[1] * k); c.lineTo(t[2] * k, cv.height - t[3] * k); c.stroke();
      });
      Object.keys(sim.turtles).forEach(function (name) {
        var t = sim.turtles[name];
        c.save(); c.translate(t.x * k, cv.height - t.y * k); c.rotate(-t.theta);
        c.fillStyle = "#5fa05f"; [[-7, -8], [-7, 8], [6, -8], [6, 8]].forEach(function (p) { c.beginPath(); c.ellipse(p[0], p[1], 4, 3, 0, 0, 7); c.fill(); });
        c.fillStyle = "#4b8a4b"; c.beginPath(); c.ellipse(0, 0, 11, 9, 0, 0, 7); c.fill();
        c.fillStyle = "#6bb36b"; c.beginPath(); c.arc(11, 0, 5, 0, 7); c.fill();
        c.fillStyle = "#1b1735"; c.beginPath(); c.arc(13, -2, 1, 0, 7); c.arc(13, 2, 1, 0, 7); c.fill();
        c.restore();
        c.fillStyle = "rgba(255,255,255,.9)"; c.font = "10px system-ui"; c.fillText(name, t.x * k - 12, cv.height - t.y * k + 24);
      });
    }
    sim.listeners = [draw];
    draw();

    // ----- tasks -----
    function check() {
      var any = false;
      spec.tasks.forEach(function (t, i) {
        if (rec.done[i]) return;
        var ok = false; try { ok = !!t.done(sim); } catch (e) {}
        if (!ok) return;
        rec.done[i] = true; any = true;
        var li = el.querySelector('.ptasks li[data-i="' + i + '"]');
        if (li) { li.classList.add("ok"); li.querySelector(".pbox").textContent = "☑"; }
        toast("✅ <b>Task done</b>", "xp");
      });
      if (spec.tasks.length && !rec.complete && spec.tasks.every(function (t, i) { return rec.done[i]; })) {
        rec.complete = true; save();
        var hd = el.querySelector(".phead");
        if (hd && !hd.querySelector(".pdone")) { var sp = document.createElement("span"); sp.className = "pdone"; sp.textContent = "✓ done"; hd.insertBefore(sp, hd.querySelector(".preset")); }
        if (award("pr:" + spec.id, spec.xp || 20, "practical complete")) confetti(30);
        checkBadges();
      }
      if (any) save();
    }

    // ----- typing -----
    function clean(line) { return line.replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/—/g, "--").replace(/–/g, "-"); }
    function run(raw) {
      var line = clean(raw);
      log("echo", prompt() + line);
      var r = sim.exec(line);
      if (r.clear) { ses.lines = []; lines.textContent = ""; }
      else if (r.out !== "") log(r.code ? "pe" : "po", r.out.replace(/\n+$/, ""));
      if (line.trim() && ses.hist[ses.hist.length - 1] !== line) ses.hist.push(line);
      ses.hi = ses.hist.length; ses.draft = "";
      ps.textContent = prompt();
      draw(); check();
    }
    scr.addEventListener("click", function () {
      var sel = window.getSelection && window.getSelection();
      if (sel && String(sel).length) return;
      inp.focus();
    });
    el.querySelector(".pform").addEventListener("submit", function (e) {
      e.preventDefault();
      var v = inp.value; inp.value = "";
      run(v); inp.focus();
    });
    function complete() {
      var r = sim.complete(inp.value);
      inp.value = r.line;
      if (r.options.length) log("sys", r.options.join("   "));
    }
    function histMove(d) {
      if (!ses.hist.length) return;
      if (ses.hi === ses.hist.length) ses.draft = inp.value;
      ses.hi = Math.min(ses.hist.length, Math.max(0, ses.hi + d));
      inp.value = ses.hi === ses.hist.length ? ses.draft : ses.hist[ses.hi];
    }
    function interrupt() {
      var live = inp.value; log("echo", prompt() + live + "^C"); inp.value = "";
      var o = sim.interrupt(); if (o !== "^C") log("po", o.replace(/^\^C\n?/, ""));
      draw(); check();
    }
    inp.addEventListener("keydown", function (e) {
      if (e.key === "Tab") { e.preventDefault(); complete(); }
      else if (e.key === "ArrowUp") { e.preventDefault(); histMove(-1); }
      else if (e.key === "ArrowDown") { e.preventDefault(); histMove(1); }
      else if (e.ctrlKey && (e.key === "c" || e.key === "C")) { e.preventDefault(); interrupt(); }
      else if (e.ctrlKey && (e.key === "l" || e.key === "L")) { e.preventDefault(); ses.lines = []; lines.textContent = ""; }
    });
    el.querySelector(".pkeys").addEventListener("click", function (e) {
      var b = e.target.closest("button[data-k]"); if (!b) return;
      var k = b.getAttribute("data-k");
      if (k === "tab") complete(); else if (k === "up") histMove(-1); else if (k === "down") histMove(1);
      else if (k === "int") interrupt(); else if (k === "clear") { ses.lines = []; lines.textContent = ""; }
      inp.focus();
    });
    el.querySelector(".pchips").addEventListener("click", function (e) {
      var b = e.target.closest("button[data-cmd]"); if (!b) return;
      inp.value = b.getAttribute("data-cmd"); inp.focus();
      try { inp.setSelectionRange(inp.value.length, inp.value.length); } catch (x) {}
    });
    pad.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-d]"); if (!b) return;
      var d = b.getAttribute("data-d");
      sim.drive(d === "up" ? 2 : d === "down" ? -2 : 0, d === "left" ? 2 : d === "right" ? -2 : 0);
      draw(); check();
    });
    el.querySelectorAll(".phint").forEach(function (b) {
      b.addEventListener("click", function () { var t = b.parentNode.querySelector(".phinttext"); t.hidden = !t.hidden; });
    });
    el.querySelector(".preset").addEventListener("click", function () {
      delete sessions[spec.id]; rec.done = {}; save();
      var y = window.scrollY;
      if (currentId === "practice") renderPractice(); else renderLesson(currentId, true);
      window.scrollTo(0, y);
    });
  }

  function renderPractice() {
    currentId = "practice"; renderNav("practice"); renderHud();
    document.querySelector(".main").classList.remove("home");
    var h = '<a class="backhome" href="#/">← Home</a><h1>Practice terminal</h1><div class="meta">Works on a phone, no ROS needed</div>' +
      practicalHtml(SANDBOX) + '<h2 class="sec">Guided practicals</h2><p>Short tasks that go with the lessons. Each one gives XP when every task is ticked.</p><ul class="praclist">';
    (window.PRACTICALS || []).forEach(function (p) {
      var done = state.prac[p.id] && state.prac[p.id].complete;
      h += '<li><a href="#/' + p.lesson + '">' + (done ? "✓ " : "") + esc("Lesson " + p.lesson + ": " + p.title) + "</a></li>";
    });
    $("lesson").innerHTML = h + "</ul>";
    mountPracticals($("lesson"));
    window.scrollTo(0, 0); closeNav();
  }

  function renderWelcome() {
    currentId = null; renderNav(null); renderHud(); closeNav();
    var next = lessons.find(function (l) { return !state.done[l.id]; });
    var started = Object.keys(state.awards).length > 0;
    var xp = totalXp(), li = levelFor(xp), cur = LEVELS[li], nxt = LEVELS[li + 1], s = streak();
    var pct = nxt ? Math.round(((xp - cur.at) / (nxt.at - cur.at)) * 100) : 100;
    var h = '<div class="top">' +
      '<div class="chip flame' + (s ? "" : " off") + '"><span class="ico">🔥</span>' + s + '<small>day streak</small></div>' +
      '<div class="chip"><span class="ico">⭐</span>Level ' + (li + 1) + " <small>" + esc(cur.title) + "</small></div>" +
      '<div class="chip xpchip"><div class="bar"><i style="width:' + pct + '%"></i></div><small>' + xp + " XP" + (nxt ? " · " + (nxt.at - xp) + " to go" : "") + "</small></div></div>" +
      '<div class="hero"><div><h1>' + (started ? "Welcome back!" : "Learn ROS 2 from zero") + "</h1><p>" +
      (next ? (started ? "Next up: " : "Start with: ") + "<b>" + esc(next.id + " " + next.title) + "</b> (about " + next.minutes + " min)" : "You have finished every available lesson. More are coming.") +
      "</p></div>" +
      (next ? '<a class="btn go" href="#/' + next.id + '">' + (started ? "CONTINUE" : "START") + " →</a>" : "") + "</div>" +
      '<a class="pracbanner" href="#/practice"><span>💻</span><div><b>Practice terminal</b><small>Try commands right here, even on your phone. No ROS needed.</small></div></a>' +
      '<h2 class="sec">Your path</h2><div class="cards">';
    mods.forEach(function (m) {
      var has = m.lessons && m.lessons.length, n = has ? m.lessons.filter(function (l) { return state.done[l.id]; }).length : 0;
      var first = has ? (m.lessons.find(function (l) { return !state.done[l.id]; }) || m.lessons[0]) : null;
      var p = has ? Math.round(n / m.lessons.length * 100) : 0, done = has && modDone(m);
      var icon = done ? "⭐" : has ? "🚀" : "🔒";
      var inner = '<div class="ring" style="--p:' + p + '"><span>' + icon + "</span></div><h3>" + esc(m.title) + '</h3><div class="sub">' +
        (has ? n + " / " + m.lessons.length + " lessons" : "Coming soon") + "</div>";
      h += has ? '<a class="card' + (done ? " complete" : "") + '" href="#/' + first.id + '">' + inner + "</a>"
               : '<div class="card locked">' + inner + "</div>";
    });
    h += '</div><h2 class="sec">Trophy shelf</h2><div class="shelf">';
    BADGES.forEach(function (b) {
      var on = state.badges[b.id];
      h += '<div class="trophy ' + (on ? "on" : "off") + '" title="' + esc(b.desc) + '"><i>' + (on ? b.icon : "🔒") + "</i>" + esc(b.name) + "</div>";
    });
    $("lesson").innerHTML = h + '</div><p class="about">Humble on Ubuntu 22.04 (WSL) · Python · simulation first. Wrong answers never cost XP, so experiment. Tell Claude when you are stuck and paste the error.</p>';
    document.querySelector(".main").classList.add("home");
  }

  function stepCounts(l) {
    var total = 0, done = 0;
    l.blocks.forEach(function (b) { if (b[0] === "cmd") { total++; if (state.steps[l.id + ":" + b.key]) done++; } });
    return { total: total, done: done };
  }

  function showZoom(src, alt) {
    var z = document.createElement("div");
    z.className = "zoomer";
    var im = document.createElement("img");
    im.src = src; im.alt = alt || "";
    z.appendChild(im);
    z.addEventListener("click", function () { if (z.parentNode) z.parentNode.removeChild(z); });
    document.body.appendChild(z);
  }

  function renderLesson(id, keepScroll) {
    var idx = lessons.findIndex(function (l) { return l.id === id; });
    if (idx < 0) return renderWelcome();
    var l = lessons[idx];
    currentId = id; renderNav(id); renderHud(); document.querySelector(".main").classList.remove("home");
    var h = '<a class="backhome" href="#/">← Home</a><h1>' + esc(l.id + "  " + l.title) + '</h1><div class="meta">' + esc(l.mod.title) + " · about " + l.minutes + " min</div>";
    var story = storyFor(l.mod.order);
    if (story && l.mod.lessons[0] === l) {
      h += '<div class="briefing"><div class="btag">Mission briefing</div><h3>' + story.icon + " " + esc(story.title) + "</h3><p>" + esc(story.text) + "</p></div>";
    }
    var sc = stepCounts(l);
    if (sc.total) {
      h += '<div class="stephead"><span id="stepcount">' + sc.done + " of " + sc.total + ' steps done</span>' +
        '<label class="allouts"><input type="checkbox" id="allouts"' + (state.prefs.outs ? " checked" : "") + "> Show all expected output</label></div>" +
        '<div class="bar steps"><i id="stepfill" style="width:' + Math.round(sc.done / sc.total * 100) + '%"></i></div>';
    }
    // an output belongs to the most recent command (a paragraph may sit in between), until the next output or heading
    var lastCmd = null;
    l.blocks.forEach(function (b) {
      h += renderBlock(l, b, b[0] === "out" ? lastCmd : null);
      if (b[0] === "cmd") lastCmd = b.key; else if (b[0] === "out" || b[0] === "h") lastCmd = null;
    });
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
        if (modDone(l.mod) && award("m:" + l.mod.order, XP.module, "module complete: " + l.mod.title)) {
          confetti(60);
          var st = storyFor(l.mod.order);
          if (st) toast("🏁 <b>Mission complete!</b> " + esc(st.done), "big");
        }
        checkBadges(); save();
      }
      renderLesson(id, true);
    });
    $("lesson").querySelectorAll("button[data-copy]").forEach(function (b) {
      b.addEventListener("click", function () { copy(b.getAttribute("data-copy"), b); });
    });
    // tick a step: marks the command, reveals its expected output, updates the progress bar
    $("lesson").querySelectorAll("button.stepdone").forEach(function (b) {
      b.addEventListener("click", function () {
        var k = b.getAttribute("data-step"), on = !state.steps[k];
        if (on) state.steps[k] = true; else delete state.steps[k];
        b.classList.toggle("on", on); b.setAttribute("aria-pressed", on ? "true" : "false"); b.textContent = on ? "☑ Done" : "☐ Done";
        b.parentNode.classList.toggle("ran", on);
        var det = $("lesson").querySelector('details[data-for="' + k + '"]');
        if (det && !state.prefs.outs) det.open = on;
        var c = stepCounts(l);
        $("stepcount").textContent = c.done + " of " + c.total + " steps done";
        $("stepfill").style.width = Math.round(c.done / c.total * 100) + "%";
        if (c.done === c.total && !state.stepsAll[id]) { state.stepsAll[id] = true; toast("✅ <b>Every step done!</b> Nicely driven.", "xp"); confetti(14); }
        save();
      });
    });
    var all = $("allouts");
    if (all) all.addEventListener("change", function () {
      state.prefs.outs = all.checked; save();
      $("lesson").querySelectorAll("details.expect").forEach(function (d) {
        var forKey = d.getAttribute("data-for");
        d.open = all.checked || !!(forKey && state.steps[forKey]) || !!state.opened[d.getAttribute("data-key")];
      });
    });
    $("lesson").querySelectorAll("details.expect").forEach(function (d) {
      d.addEventListener("toggle", function () {
        var k = d.getAttribute("data-key");
        if (d.open) state.opened[k] = true; else delete state.opened[k];
        save();
      });
    });
    $("lesson").querySelectorAll(".shot img").forEach(function (im) {
      im.addEventListener("click", function () { showZoom(im.getAttribute("src"), im.getAttribute("alt")); });
    });
    $("lesson").querySelectorAll("button.quest").forEach(function (b) {
      b.addEventListener("click", function () {
        var k = b.getAttribute("data-try"); state.tried[k] = true; save();
        award("t:" + k, XP.tryIt, "quest complete"); confetti(14); rewire(l);
      });
    });
    $("lesson").querySelectorAll(".quiz:not(.predict)").forEach(function (q) {
      var key = q.getAttribute("data-key"), blk = l.byKey[key.slice(l.id.length + 1)][1];
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
    // predictions: one guess, instant explanation, a little XP just for trying
    $("lesson").querySelectorAll(".quiz.predict").forEach(function (q) {
      var key = q.getAttribute("data-key"), blk = l.byKey[key.slice(l.id.length + 1)][1];
      q.querySelectorAll("button.opt").forEach(function (b) {
        b.addEventListener("click", function () {
          var pick = parseInt(b.getAttribute("data-idx"), 10), good = pick === blk.answer;
          state.predict[key] = pick; if (good) state.predictOk[key] = true; save();
          award("p:" + key, XP.predict, good ? "you called it!" : "good guess");
          if (good) confetti(8);
          rewire(l);
        });
      });
    });
    mountPracticals($("lesson"));
    if (!keepScroll) window.scrollTo(0, 0);
    closeNav();
  }

  function rewire(l) { var y = window.scrollY; renderLesson(l.id, true); window.scrollTo(0, y); }

  function route() {
    var m = location.hash.match(/^#\/(.+)$/);
    if (m && m[1] === "practice") renderPractice(); else if (m) renderLesson(decodeURIComponent(m[1])); else renderWelcome();
  }
  window.addEventListener("hashchange", route);

  // ---------- lesson list on a phone ----------
  // Open with the Lessons button or a swipe from the left edge. Close with the X, a tap on the
  // dimmed area, a swipe to the left, the Escape key, or by tapping any link in the list.
  $("menu").addEventListener("click", function () { setNav(!navIsOpen()); });
  $("sideclose").addEventListener("click", closeNav);
  $("scrim").addEventListener("click", closeNav);
  $("side").addEventListener("click", function (e) { if (e.target.closest && e.target.closest("a")) closeNav(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeNav(); });
  window.addEventListener("resize", function () { if (window.innerWidth > 800) closeNav(); });
  var swipe = null;
  document.addEventListener("touchstart", function (e) { var t = e.touches[0]; swipe = { x: t.clientX, y: t.clientY }; }, { passive: true });
  document.addEventListener("touchend", function (e) {
    var s = swipe; swipe = null;
    if (!s || window.innerWidth > 800) return;
    var t = e.changedTouches[0], dx = t.clientX - s.x, dy = t.clientY - s.y;
    if (Math.abs(dy) > 60 || Math.abs(dx) < 70) return;     // not a clear sideways swipe
    if (dx < 0 && navIsOpen()) closeNav();
    else if (dx > 0 && !navIsOpen() && s.x < 24) setNav(true);
  }, { passive: true });
  $("reset").addEventListener("click", function () {
    if (confirm("Erase all XP, badges, progress, notes and quiz answers?")) { state = blank(); save(); route(); }
  });
  route();
})();
