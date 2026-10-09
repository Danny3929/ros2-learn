// Review quiz, shared by ROS 2 Learn and PLC Learn.
// Picks 5 random quiz questions from the lessons you have completed, one at a time, with the explanation
// after each answer. Finishing a round gives XP once a day.
//
// Source of truth: C:\Users\hp\shared-web\review.js (copy with sync.ps1).
// Use:  AppReview.render(hostElement, { lessons, isDone, award, confetti, esc, xp });
//   lessons: [{ id, title, blocks: [["quiz", { q, options, answer, why }], ...] }]
(function (root) {
  "use strict";
  var ROUND = 5;

  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function today() { var d = new Date(); return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }

  function pool(ctx) {
    var out = [];
    ctx.lessons.forEach(function (l) {
      if (!ctx.isDone(l.id)) return;
      l.blocks.forEach(function (b) {
        var v = b[0] === "quiz" ? b[1] : null;
        if (v && v.options && v.options.length > 1 && typeof v.answer === "number") out.push({ lesson: l, q: v.q, options: v.options, answer: v.answer, why: v.why || "" });
      });
    });
    return out;
  }

  function render(host, ctx) {
    var all = pool(ctx), esc = ctx.esc;
    if (!all.length) {
      host.innerHTML = '<h1>Review quiz</h1><p>Finish a lesson first. The review quiz asks questions from the lessons you have completed, so old ideas stay fresh.</p>' +
        '<p><a class="btn" href="#/">Back to the home page</a></p>';
      return;
    }
    var round = shuffle(all).slice(0, ROUND), at = 0, right = 0;

    function question() {
      var item = round[at], order = shuffle(item.options.map(function (o, i) { return { t: o, i: i }; })), answered = false;
      host.innerHTML = '<h1>Review quiz</h1><div class="meta">Question ' + (at + 1) + " of " + round.length + " · from lesson " + esc(item.lesson.id + " " + item.lesson.title) +
        '</div><div class="quiz rv"><div class="q">' + item.q + "</div>" +
        order.map(function (o, k) { return '<button type="button" class="opt" data-k="' + k + '">' + o.t + "</button>"; }).join("") +
        '<div class="rvout" role="status"></div></div>' +
        '<p class="rvbar"><a href="#/">Stop and go home</a></p>';
      var btns = host.querySelectorAll("button.opt"), out = host.querySelector(".rvout");
      btns.forEach(function (b) {
        b.addEventListener("click", function () {
          if (answered) return; answered = true;
          var k = parseInt(b.getAttribute("data-k"), 10), good = order[k].i === item.answer;
          if (good) right++;
          btns.forEach(function (x, n) {
            x.disabled = true;
            if (order[n].i === item.answer) x.classList.add("right"); else if (n === k) x.classList.add("wrong");
          });
          out.innerHTML = '<div class="why">' + (good ? "Correct. " : "Not quite. ") + item.why + ' <a href="#/' + esc(item.lesson.id) + '">Open lesson ' + esc(item.lesson.id) + "</a></div>" +
            '<p><button type="button" class="btn rvnext">' + (at + 1 < round.length ? "Next question" : "See my score") + "</button></p>";
          out.querySelector(".rvnext").addEventListener("click", function () { at++; if (at < round.length) question(); else finish(); });
          out.querySelector(".rvnext").focus();
        });
      });
    }

    function finish() {
      var got = ctx.award("rv:" + today(), ctx.xp || 10, "daily review");
      if (got && ctx.confetti) ctx.confetti(right >= 4 ? 30 : 12);
      host.innerHTML = '<h1>Review quiz</h1><div class="quiz rv"><div class="q">You got <b>' + right + " of " + round.length + "</b> right." +
        (right === round.length ? " Perfect round!" : right >= 3 ? " Good, a little polish and you have it." : " Worth another look at the lessons below.") + "</div>" +
        (got ? "<p>+" + (ctx.xp || 10) + " XP for today's review.</p>" : "<p>You already earned today's review XP. Practice is still good for you.</p>") +
        "<p>" + round.map(function (r) { return '<a href="#/' + esc(r.lesson.id) + '">' + esc(r.lesson.id + " " + r.lesson.title) + "</a>"; }).filter(function (x, i, arr) { return arr.indexOf(x) === i; }).join(" · ") + "</p>" +
        '<p><button type="button" class="btn rvagain">Another round</button> <a class="btn ghost" href="#/">Home</a></p></div>';
      host.querySelector(".rvagain").addEventListener("click", function () { render(host, ctx); });
    }

    question();
  }

  root.AppReview = { render: render, _pool: pool };
})(typeof window !== "undefined" ? window : globalThis);
