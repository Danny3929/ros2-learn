// Real Python for the practice terminal, run by Pyodide (CPython compiled to WebAssembly) inside a
// Web Worker. A worker means an endless loop can be stopped (the page just restarts it) instead of
// freezing a phone. Pyodide is downloaded from a CDN the first time Python is used, about 10 MB,
// and the service worker keeps a copy for next time.
window.PYODIDE_VERSION = "0.26.4";

// Python side: a REPL that behaves like the real one, a script runner, and a pretend `rclpy`
// so the lesson 1.8 check (python3 -c "import rclpy; print('rclpy OK')") works.
window.PYBOOT = [
  "import sys, code, traceback, linecache, types",
  "",
  "def _exit(*a):",
  "    raise SystemExit",
  "",
  "class _It(code.InteractiveInterpreter):",
  "    def showtraceback(self):",
  "        et, ev, tb = sys.exc_info()",
  "        while tb is not None and tb.tb_frame.f_code.co_filename != '<stdin>':",
  "            tb = tb.tb_next",
  "        traceback.print_exception(et, ev, tb)",
  "",
  "class _Repl:",
  "    def __init__(self):",
  "        self.reset()",
  "    def reset(self):",
  "        self.ns = {'__name__': '__main__', '__doc__': None, 'exit': _exit, 'quit': _exit}",
  "        self.it = _It(self.ns)",
  "        self.buf = []",
  "    def push(self, line):",
  "        self.buf.append(line)",
  "        try:",
  "            more = self.it.runsource('\\n'.join(self.buf), '<stdin>', 'single')",
  "        except SystemExit:",
  "            self.buf = []",
  "            return 'exit'",
  "        if more:",
  "            return 'more'",
  "        self.buf = []",
  "        return 'done'",
  "    def interrupt(self):",
  "        self.buf = []",
  "",
  "_repl = _Repl()",
  "",
  "def _run_script(src, name):",
  "    linecache.cache[name] = (len(src), None, src.splitlines(True), name)",
  "    g = {'__name__': '__main__', '__file__': name, 'exit': _exit, 'quit': _exit}",
  "    try:",
  "        exec(compile(src, name, 'exec'), g)",
  "        return True",
  "    except SystemExit:",
  "        return True",
  "    except BaseException:",
  "        et, ev, tb = sys.exc_info()",
  "        if tb is not None and tb.tb_next is not None:",
  "            tb = tb.tb_next",
  "        else:",
  "            tb = None",
  "        traceback.print_exception(et, ev, tb)",
  "        return False",
  "",
  "_rclpy = types.ModuleType('rclpy')",
  "_rclpy.__doc__ = 'pretend rclpy for the practice terminal'",
  "sys.modules['rclpy'] = _rclpy",
  "sys.ps1 = '>>> '",
  "sys.ps2 = '... '"
].join("\n");

// The worker body. It is turned into a string and started from a Blob (see app.js), so it must not
// use anything from outside this function.
window.pyWorkerMain = function () {
  var py = null, out = [], total = 0, MAXCHARS = 20000;
  function push(e, t) {
    if (total > MAXCHARS) return;
    total += t.length + 1;
    if (total > MAXCHARS) { out.push({ e: 1, t: "... (output cut: too long)" }); return; }
    out.push({ e: e, t: t });
  }
  function take() {
    try { py.runPython("import sys\nsys.stdout.flush()\nsys.stderr.flush()"); } catch (x) {}
    // Python 3.12 underlines the failing part with ~^~ ; the lessons were written with 3.10, which does not
    var o = out.filter(function (x) { return !(x.e && /^\s*[~^]*~[~^]*$/.test(x.t)); });
    out = []; total = 0; return o;
  }
  self.onmessage = async function (ev) {
    var m = ev.data;
    try {
      if (m.type === "init") {
        importScripts("https://cdn.jsdelivr.net/pyodide/v" + m.version + "/full/pyodide.js");
        py = await loadPyodide();
        py.setStdout({ batched: function (s) { push(0, s); } });
        py.setStderr({ batched: function (s) { push(1, s); } });
        py.runPython(m.boot);
        postMessage({ id: m.id, ok: true });
      } else if (m.type === "repl-reset") {
        py.runPython("_repl.reset()");
        postMessage({ id: m.id, ok: true });
      } else if (m.type === "repl-interrupt") {
        py.runPython("_repl.interrupt()");
        postMessage({ id: m.id, ok: true });
      } else if (m.type === "repl") {
        py.globals.set("_line", m.line);
        var state = py.runPython("_repl.push(_line)");
        postMessage({ id: m.id, ok: true, state: state, out: take() });
      } else if (m.type === "script") {
        py.globals.set("_src", m.src); py.globals.set("_name", m.name);
        var good = py.runPython("_run_script(_src, _name)");
        postMessage({ id: m.id, ok: true, good: good, out: take() });
      }
    } catch (err) {
      postMessage({ id: m.id, ok: false, error: String(err && err.message || err), out: out });
    }
  };
};
