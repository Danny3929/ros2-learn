// Practice terminal engine: a small pretend Ubuntu shell plus a pretend ROS 2 Humble world
// (turtlesim, talker/listener). No real ROS is involved, so it runs in any browser, phone included.
// Output texts were copied from real Humble runs in WSL (see the lessons).
(function (root) {
  "use strict";

  // ---------- small helpers ----------
  function fmtFloat(x) { return Number.isInteger(x) ? x.toFixed(1) : String(x); }
  function f32(x) { return Math.fround(x); }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  var WORLD = 11.088889;

  // ---------- message and service types ----------
  var T = {
    "geometry_msgs/msg/Twist": { f: [["linear", "geometry_msgs/msg/Vector3"], ["angular", "geometry_msgs/msg/Vector3"]] },
    "geometry_msgs/msg/Vector3": { f: [["x", "float64"], ["y", "float64"], ["z", "float64"]] },
    "std_msgs/msg/String": { f: [["data", "string"]] },
    "turtlesim/msg/Pose": { f: [["x", "float32"], ["y", "float32"], ["theta", "float32"], ["linear_velocity", "float32"], ["angular_velocity", "float32"]] },
    "turtlesim/msg/Color": { f: [["r", "uint8"], ["g", "uint8"], ["b", "uint8"]] },
    "turtlesim/srv/Spawn": { req: [["x", "float32"], ["y", "float32"], ["theta", "float32"], ["name", "string"]], res: [["name", "string"]] },
    "turtlesim/srv/Kill": { req: [["name", "string"]], res: [] },
    "turtlesim/srv/SetPen": { req: [["r", "uint8"], ["g", "uint8"], ["b", "uint8"], ["width", "uint8"], ["off", "uint8"]], res: [] },
    "turtlesim/srv/TeleportAbsolute": { req: [["x", "float32"], ["y", "float32"], ["theta", "float32"]], res: [] },
    "turtlesim/srv/TeleportRelative": { req: [["linear", "float32"], ["angular", "float32"]], res: [] },
    "std_srvs/srv/Empty": { req: [], res: [] }
  };
  var IFACE_TEXT = {
    "geometry_msgs/msg/Twist": "Vector3  linear\n\tfloat64 x\n\tfloat64 y\n\tfloat64 z\nVector3  angular\n\tfloat64 x\n\tfloat64 y\n\tfloat64 z",
    "geometry_msgs/msg/Vector3": "# This represents a vector in free space.\n\n# This is semantically different than a point.\n# A vector is always anchored at the origin.\n# When a transform is applied to a vector, only the rotational component is applied.\n\nfloat64 x\nfloat64 y\nfloat64 z",
    "std_msgs/msg/String": "# This was originally provided as an example message.\n# It is deprecated as of Foxy\n# It is recommended to create your own semantically meaningful message.\n# However if you would like to continue using this please use the equivalent in example_msgs.\n\nstring data",
    "turtlesim/msg/Pose": "float32 x\nfloat32 y\nfloat32 theta\n\nfloat32 linear_velocity\nfloat32 angular_velocity",
    "turtlesim/msg/Color": "uint8 r\nuint8 g\nuint8 b",
    "turtlesim/srv/Spawn": "float32 x\nfloat32 y\nfloat32 theta\nstring name # Optional.  A unique name will be created and returned if this is empty\n---\nstring name",
    "turtlesim/srv/Kill": "string name\n---",
    "turtlesim/srv/SetPen": "uint8 r\nuint8 g\nuint8 b\nuint8 width\nuint8 off\n---",
    "turtlesim/srv/TeleportAbsolute": "float32 x\nfloat32 y\nfloat32 theta\n---",
    "turtlesim/srv/TeleportRelative": "float32 linear\nfloat32 angular\n---",
    "std_srvs/srv/Empty": "---"
  };
  function pyName(type, suffix) { var p = type.split("/"); return p[0] + "." + p[1] + "." + p[2] + (suffix || ""); }
  function pyRepr(v, kind) {
    if (typeof v === "string") return "'" + v + "'";
    if (kind === "float32" || kind === "float64") return fmtFloat(v);
    return String(v);
  }
  function msgRepr(typeName, fields, values, suffix) {
    var parts = fields.map(function (f) {
      var v = values[f[0]];
      if (T[f[1]]) return f[0] + "=" + msgRepr(f[1], T[f[1]].f, v || {});
      return f[0] + "=" + pyRepr(v, f[1]);
    });
    return pyName(typeName, suffix) + "(" + parts.join(", ") + ")";
  }
  function defaultFor(kind) { return kind === "string" ? "" : 0; }
  // Fill a message from a parsed {..} object, checking field names and types like the real tool.
  function fillFields(fields, given, errs) {
    var out = {};
    given = given || {};
    Object.keys(given).forEach(function (k) {
      if (!fields.some(function (f) { return f[0] === k; })) errs.push("Failed to populate field: '" + k + "' is not a field of this type");
    });
    fields.forEach(function (f) {
      var name = f[0], kind = f[1], v = given[name];
      if (T[kind] && T[kind].f) { out[name] = fillFields(T[kind].f, typeof v === "object" ? v : {}, errs); return; }
      if (v === undefined) { out[name] = defaultFor(kind); return; }
      if (kind === "string") { out[name] = String(v); return; }
      if (typeof v !== "number") { errs.push("Failed to populate field: could not convert '" + v + "' to " + kind); out[name] = 0; return; }
      out[name] = kind === "float32" ? f32(v) : v;
      if (kind === "float32" || kind === "float64") out[name] = v;     // printed as typed, like the real tool
    });
    return out;
  }

  // ---------- tiny YAML flow-mapping parser: {a: 1, b: {c: 'x'}} ----------
  function parseYaml(src) {
    var i = 0;
    function ws() { while (i < src.length && /\s/.test(src[i])) i++; }
    function scalar(stops) {
      ws();
      var c = src[i], s;
      if (c === "'" || c === '"') {
        var q = c; i++; s = "";
        while (i < src.length && src[i] !== q) s += src[i++];
        if (i >= src.length) throw new Error("unterminated string");
        i++; return s;
      }
      s = "";
      while (i < src.length && stops.indexOf(src[i]) < 0) s += src[i++];
      s = s.trim();
      if (/^-?\d+$/.test(s)) return parseInt(s, 10);
      if (/^-?(\d+\.\d*|\.\d+|\d+)([eE][-+]?\d+)?$/.test(s)) return parseFloat(s);
      if (s === "true" || s === "True") return true;
      if (s === "false" || s === "False") return false;
      return s;
    }
    function value() {
      ws();
      if (src[i] === "{") return map();
      return scalar(",}");
    }
    function map() {
      var o = {}; i++; ws();
      if (src[i] === "}") { i++; return o; }
      for (;;) {
        ws();
        var k = scalar(":,}");
        ws();
        if (src[i] !== ":") throw new Error("expected ':' after " + k);
        i++;
        o[k] = value();
        ws();
        if (src[i] === ",") { i++; continue; }
        if (src[i] === "}") { i++; return o; }
        throw new Error("expected ',' or '}'");
      }
    }
    ws();
    if (src[i] !== "{") throw new Error("expected a {mapping}");
    var r = map(); ws();
    if (i < src.length) throw new Error("extra text after the mapping");
    return r;
  }

  // ---------- virtual file system ----------
  function dirNode() { return { t: "d", c: {} }; }
  function fileNode(text) { return { t: "f", d: text || "" }; }
  function baseFs() {
    var root = dirNode();
    function mk(path, text) {
      var parts = path.split("/").filter(Boolean), cur = root;
      parts.forEach(function (p, i) {
        if (i === parts.length - 1 && text !== undefined) cur.c[p] = fileNode(text);
        else { if (!cur.c[p]) cur.c[p] = dirNode(); cur = cur.c[p]; }
      });
    }
    ["/home/student", "/tmp", "/etc", "/usr/bin", "/usr/share", "/opt/ros/humble/bin", "/opt/ros/humble/lib", "/opt/ros/humble/include", "/opt/ros/humble/share"].forEach(function (d) { mk(d); });
    mk("/opt/ros/humble/setup.bash", "# ROS 2 Humble environment setup\n");
    mk("/opt/ros/humble/local_setup.bash", "# ROS 2 Humble local setup\n");
    mk("/home/student/.bashrc", "# ~/.bashrc: executed by bash for non-login shells.\nsource /opt/ros/humble/setup.bash\nsource /usr/share/colcon_cd/function/colcon_cd.sh\n");
    mk("/etc/os-release", 'PRETTY_NAME="Ubuntu 22.04.5 LTS"\n');
    return root;
  }

  // ---------- the session ----------
  function create(opts) {
    opts = opts || {};
    var fs = baseFs();
    var env = {
      HOME: "/home/student", USER: "student", SHELL: "/bin/bash", LANG: "C.UTF-8", PWD: "/home/student",
      PATH: "/opt/ros/humble/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
      ROS_VERSION: "2", ROS_PYTHON_VERSION: "3", ROS_LOCALHOST_ONLY: "0", ROS_DISTRO: "humble"
    };
    var cwd = "/home/student";
    var S = {
      history: [],       // every command line typed
      okLines: [],       // command lines that finished without an error
      failed: [],        // command lines that failed, with their error text
      nodes: [],         // running pretend ROS nodes
      turtles: {},       // turtlesim turtles
      trails: [],        // drawn pen lines
      bg: [69, 86, 255],
      clock: 0,
      listeners: []
    };
    var clockBase = 1791488559, tick = 0;
    function stamp() { tick += 1; return "[INFO] [" + (clockBase + tick) + "." + ("000000000" + (tick * 20199 % 1e9)).slice(-9) + "]"; }
    function warnStamp() { tick += 1; return "[WARN] [" + (clockBase + tick) + "." + ("000000000" + (tick * 20199 % 1e9)).slice(-9) + "]"; }

    // ----- paths -----
    function norm(path) {
      if (path === "~" || path.indexOf("~/") === 0) path = env.HOME + path.slice(1);
      if (path.charAt(0) !== "/") path = cwd + "/" + path;
      var out = [];
      path.split("/").forEach(function (p) {
        if (!p || p === ".") return;
        if (p === "..") out.pop(); else out.push(p);
      });
      return "/" + out.join("/");
    }
    function lookup(abs) {
      var cur = fs;
      var parts = abs.split("/").filter(Boolean);
      for (var i = 0; i < parts.length; i++) {
        if (!cur || cur.t !== "d" || !cur.c[parts[i]]) return null;
        cur = cur.c[parts[i]];
      }
      return cur;
    }
    function parentOf(abs) {
      var parts = abs.split("/").filter(Boolean), name = parts.pop();
      return { dir: lookup("/" + parts.join("/")), name: name, abs: abs };
    }
    function shortPath(p) {
      if (p === env.HOME) return "~";
      if (p.indexOf(env.HOME + "/") === 0) return "~" + p.slice(env.HOME.length);
      return p;
    }
    function writeFile(path, text, append) {
      var abs = norm(path);
      if (abs === "/dev/null") return null;
      var p = parentOf(abs);
      if (!p.dir || p.dir.t !== "d") return "bash: " + path + ": No such file or directory";
      var ex = p.dir.c[p.name];
      if (ex && ex.t === "d") return "bash: " + path + ": Is a directory";
      if (ex && append) ex.d += text; else p.dir.c[p.name] = fileNode(text);
      return null;
    }
    S.fileText = function (path) { var n = lookup(norm(path)); return n && n.t === "f" ? n.d : null; };
    S.exists = function (path) { return !!lookup(norm(path)); };
    S.isDir = function (path) { var n = lookup(norm(path)); return !!n && n.t === "d"; };
    S.cwd = function () { return cwd; };
    S.env = function (k) { return env[k]; };
    S.mkfile = function (path, text) { writeFile(path, text || "", false); };
    S.mkdir = function (path) {
      var abs = norm(path), parts = abs.split("/").filter(Boolean), cur = fs;
      parts.forEach(function (p) { if (!cur.c[p]) cur.c[p] = dirNode(); cur = cur.c[p]; });
    };
    S.prompt = function () { return "student@laptop:" + shortPath(cwd) + "$ "; };

    // ----- the ROS graph, computed from the running nodes -----
    var PARAM_SRV = ["describe_parameters", "get_parameter_types", "get_parameters", "list_parameters", "set_parameters", "set_parameters_atomically"];
    var PARAM_TYPE = { describe_parameters: "DescribeParameters", get_parameter_types: "GetParameterTypes", get_parameters: "GetParameters", list_parameters: "ListParameters", set_parameters: "SetParameters", set_parameters_atomically: "SetParametersAtomically" };
    var PEV = "rcl_interfaces/msg/ParameterEvent", LOG = "rcl_interfaces/msg/Log";
    function turtleNames() { return Object.keys(S.turtles); }
    function nodeInfo(n) {
      var info = { pubs: [["/parameter_events", PEV], ["/rosout", LOG]], subs: [["/parameter_events", PEV]], srvs: [], actions: [], aclients: [] };
      if (n.exe === "turtlesim_node") {
        info.srvs = [["/clear", "std_srvs/srv/Empty"], ["/kill", "turtlesim/srv/Kill"], ["/reset", "std_srvs/srv/Empty"], ["/spawn", "turtlesim/srv/Spawn"]];
        turtleNames().forEach(function (t) {
          info.pubs.push(["/" + t + "/color_sensor", "turtlesim/msg/Color"], ["/" + t + "/pose", "turtlesim/msg/Pose"]);
          info.subs.push(["/" + t + "/cmd_vel", "geometry_msgs/msg/Twist"]);
          info.srvs.push(["/" + t + "/set_pen", "turtlesim/srv/SetPen"], ["/" + t + "/teleport_absolute", "turtlesim/srv/TeleportAbsolute"], ["/" + t + "/teleport_relative", "turtlesim/srv/TeleportRelative"]);
          info.actions.push(["/" + t + "/rotate_absolute", "turtlesim/action/RotateAbsolute"]);
        });
      } else if (n.exe === "turtle_teleop_key") {
        info.pubs.push(["/turtle1/cmd_vel", "geometry_msgs/msg/Twist"]);
        info.aclients.push(["/turtle1/rotate_absolute", "turtlesim/action/RotateAbsolute"]);
      } else if (n.exe === "talker") {
        info.pubs.push(["/chatter", "std_msgs/msg/String"]);
      } else if (n.exe === "listener") {
        info.subs.push(["/chatter", "std_msgs/msg/String"]);
      }
      PARAM_SRV.forEach(function (p) { info.srvs.push(["/" + n.name + "/" + p, "rcl_interfaces/srv/" + PARAM_TYPE[p]]); });
      var byName = function (a, b) { return a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0; };
      ["pubs", "subs", "srvs", "actions", "aclients"].forEach(function (k) { info[k].sort(byName); });
      return info;
    }
    function topics() {
      var m = { "/parameter_events": { type: PEV, pubs: 0, subs: 0 }, "/rosout": { type: LOG, pubs: 0, subs: 0 } };
      S.nodes.forEach(function (n) {
        var i = nodeInfo(n);
        i.pubs.forEach(function (p) { (m[p[0]] = m[p[0]] || { type: p[1], pubs: 0, subs: 0 }).pubs++; });
        i.subs.forEach(function (p) { (m[p[0]] = m[p[0]] || { type: p[1], pubs: 0, subs: 0 }).subs++; });
      });
      return m;
    }
    function services() {
      var m = {};
      S.nodes.forEach(function (n) { nodeInfo(n).srvs.forEach(function (p) { m[p[0]] = p[1]; }); });
      return m;
    }
    function sortedKeys(o) { return Object.keys(o).sort(); }
    S.hasNode = function (name) { return S.nodes.some(function (n) { return "/" + n.name === name; }); };
    S.nodeNames = function () { return S.nodes.map(function (n) { return "/" + n.name; }).sort(); };
    S.turtle = function (name) { return S.turtles[name || "turtle1"]; };
    S.topicNames = function () { return sortedKeys(topics()); };

    // ----- turtlesim -----
    function newTurtle(name, x, y, th) {
      S.turtles[name] = { x: f32(x), y: f32(y), theta: f32(th), lin: 0, ang: 0, pen: { r: 179, g: 184, b: 255, width: 3, off: 0 }, moved: 0 };
    }
    function emit() { S.listeners.forEach(function (f) { f(); }); }
    function moveTurtle(name, lin, ang) {
      var t = S.turtles[name]; if (!t) return;
      var steps = 60, dt = 1 / 60, wall = false;
      var x = t.x, y = t.y, th = t.theta;
      for (var i = 0; i < steps; i++) {
        var nx = x + Math.cos(th) * lin * dt, ny = y + Math.sin(th) * lin * dt;
        if (nx < 0 || nx > WORLD || ny < 0 || ny > WORLD) { wall = true; break; }
        if (t.pen.off === 0 && (nx !== x || ny !== y)) S.trails.push([x, y, nx, ny, t.pen.r, t.pen.g, t.pen.b, t.pen.width]);
        x = nx; y = ny; th += ang * dt;
      }
      t.x = f32(x); t.y = f32(y); t.theta = f32(Math.atan2(Math.sin(th), Math.cos(th)));
      t.lin = lin; t.ang = ang; t.moved++;
      if (S.trails.length > 4000) S.trails.splice(0, S.trails.length - 4000);
      emit();
      return wall;
    }
    // for the on-screen arrow pad
    S.drive = function (lin, ang) {
      if (!S.hasNode("/turtlesim")) return false;
      moveTurtle("turtle1", lin, ang);
      S.okLines.push("@drive");
      return true;
    };
    S.hasTeleop = function () { return S.hasNode("/teleop_turtle") && S.hasNode("/turtlesim"); };

    // ----- start / stop nodes -----
    var EXES = {
      turtlesim: ["draw_square", "mimic", "turtle_teleop_key", "turtlesim_node"],
      demo_nodes_cpp: ["listener", "talker"],
      demo_nodes_py: ["listener", "talker"]
    };
    var DEFAULT_NAME = { turtlesim_node: "turtlesim", turtle_teleop_key: "teleop_turtle", talker: "talker", listener: "listener" };
    function startNode(pkg, exe, rename) {
      var name = rename || DEFAULT_NAME[exe];
      var node = { pkg: pkg, exe: exe, name: name, log: [] };
      var out = [];
      if (exe === "turtlesim_node") {
        S.turtles = {}; S.trails = []; S.bg = [69, 86, 255];
        newTurtle("turtle1", WORLD / 2, WORLD / 2, 0);
        out.push(stamp() + " [turtlesim]: Starting turtlesim with node name /" + name);
        out.push(stamp() + " [turtlesim]: Spawning turtle [turtle1] at x=[5.544445], y=[5.544445], theta=[0.000000]");
      } else if (exe === "turtle_teleop_key") {
        out.push("Reading from keyboard\n---------------------------\nUse arrow keys to move the turtle.\nUse G|B|V|C|D|E|R|T keys to rotate to absolute orientations. 'F' to cancel a rotation.\n'Q' to quit.");
        out.push("(Phone tip: the arrow pad under the picture is your keyboard.)");
      } else if (exe === "talker") {
        out.push(stamp() + " [talker]: Publishing: 'Hello World: 1'");
        out.push(stamp() + " [talker]: Publishing: 'Hello World: 2'");
      } else if (exe === "listener") {
        out.push(S.hasNode("/talker") ? stamp() + " [listener]: I heard: [Hello World: 3]" : "(waiting for messages - start the talker to hear something)");
      } else {
        out.push("(" + exe + " is not part of this practice terminal)");
        return { ok: false, out: out.join("\n") };
      }
      S.nodes.push(node);
      out.push("(started in the background. In a real terminal this window would stay busy; here you can keep typing. Use Ctrl+C or  stop  to end it.)");
      emit();
      return { ok: true, out: out.join("\n") };
    }
    S.interrupt = function () {
      if (!S.nodes.length) return "^C";
      var n = S.nodes.pop();
      if (n.exe === "turtlesim_node") { S.turtles = {}; S.trails = []; }
      emit();
      return "^C\n[INFO] [" + n.name + "]: stopped /" + n.name;
    };
    function stopByName(name) {
      var idx = -1;
      S.nodes.forEach(function (n, i) { if (n.name === name || "/" + n.name === name || n.exe === name) idx = i; });
      if (idx < 0) return false;
      var n = S.nodes.splice(idx, 1)[0];
      if (n.exe === "turtlesim_node") { S.turtles = {}; S.trails = []; }
      emit(); return true;
    }

    // ----- ros2 command -----
    var ROS2_USAGE = "usage: ros2 [-h] Call `ros2 <command> -h` for more detailed usage. ...\n\nros2 is an extensible command-line tool for ROS 2.\n\nCommands:\n  interface  Show information about ROS interfaces\n  node       Various node related sub-commands\n  param      Various param related sub-commands\n  pkg        Various package related sub-commands\n  run        Run a package specific executable\n  service    Various service related sub-commands\n  topic      Various topic related sub-commands\n  (the real tool has more: action, bag, launch, doctor ... they are not in this practice terminal)\n\n  Call `ros2 <command> -h` for more detailed usage.";
    var NO_PRACTICE = "(this part of ros2 is not in the practice terminal - try it in your real Ubuntu window)";
    function sample(name) {
      if (name === "/turtle1/pose" || /^\/turtle\d+\/pose$/.test(name)) {
        var t = S.turtles[name.split("/")[1]]; if (!t) return null;
        return "x: " + fmtFloat(t.x) + "\ny: " + fmtFloat(t.y) + "\ntheta: " + fmtFloat(t.theta) + "\nlinear_velocity: " + fmtFloat(f32(t.lin)) + "\nangular_velocity: " + fmtFloat(f32(t.ang)) + "\n---";
      }
      if (/^\/turtle\d+\/color_sensor$/.test(name)) return "r: " + S.bg[0] + "\ng: " + S.bg[1] + "\nb: " + S.bg[2] + "\n---";
      if (name === "/chatter") { return "data: 'Hello World: " + (chat++) + "'\n---"; }
      return null;
    }
    var chat = 14;
    function ros2(args) {
      if (!args.length || args[0] === "-h" || args[0] === "--help") return { out: ROS2_USAGE, code: 0 };
      var sub = args[0], rest = args.slice(1);
      var fn = ROS2CMDS[sub];
      if (!fn) {
        if (["action", "bag", "component", "control", "daemon", "doctor", "launch", "lifecycle", "multicast", "plugin", "security", "wtf"].indexOf(sub) >= 0) return { out: NO_PRACTICE, code: 0 };
        return { out: "usage: ros2 [-h] Call `ros2 <command> -h` for more detailed usage. ...\nros2: error: argument Call `ros2 <command> -h` for more detailed usage.: invalid choice: '" + sub + "' (choose from 'action', 'bag', 'component', 'daemon', 'doctor', 'interface', 'launch', 'lifecycle', 'node', 'param', 'pkg', 'run', 'service', 'topic')", code: 2 };
      }
      return fn(rest);
    }
    var ROS2CMDS = {
      run: function (a) {
        if (a.length < 1) return { out: "usage: ros2 run [-h] [--prefix PREFIX] package_name executable_name ...\nros2 run: error: the following arguments are required: package_name, executable_name", code: 2 };
        if (a.length < 2) return { out: "usage: ros2 run [-h] [--prefix PREFIX] package_name executable_name ...\nros2 run: error: the following arguments are required: executable_name", code: 2 };
        if (!EXES[a[0]]) return { out: "Package '" + a[0] + "' not found", code: 1 };
        if (EXES[a[0]].indexOf(a[1]) < 0) return { out: "No executable found", code: 1 };
        var rename = null;
        for (var i = 2; i < a.length; i++) { var m = /^__node:=(.+)$/.exec(a[i]); if (m) rename = m[1]; }
        var r = startNode(a[0], a[1], rename);
        return { out: r.out, code: r.ok ? 0 : 1 };
      },
      node: function (a) {
        if (a[0] === "list") return { out: S.nodeNames().join("\n"), code: 0 };
        if (a[0] === "info") {
          if (!a[1]) return { out: "usage: ros2 node info [-h] [--include-hidden] node_name\nros2 node info: error: the following arguments are required: node_name", code: 2 };
          var n = S.nodes.filter(function (x) { return "/" + x.name === a[1]; })[0];
          if (!n) return { out: "Unable to find node '" + a[1] + "'", code: 1 };
          var i = nodeInfo(n), L = function (arr) { return arr.map(function (p) { return "    " + p[0] + ": " + p[1]; }).join("\n"); };
          return { out: "/" + n.name + "\n  Subscribers:\n" + L(i.subs) + "\n  Publishers:\n" + L(i.pubs) + "\n  Service Servers:\n" + L(i.srvs) + "\n  Service Clients:\n\n  Action Servers:\n" + L(i.actions) + "\n  Action Clients:" + (i.aclients.length ? "\n" + L(i.aclients) : "") + "\n", code: 0 };
        }
        return { out: "usage: ros2 node [-h] Call `ros2 node <command> -h` for more detailed usage. ...\n  commands: list, info", code: a.length ? 2 : 0 };
      },
      topic: function (a) {
        var verb = a[0], tp = topics();
        if (verb === "list") {
          var showT = a.indexOf("-t") >= 0 || a.indexOf("--show-types") >= 0;
          return { out: sortedKeys(tp).map(function (k) { return showT ? k + " [" + tp[k].type + "]" : k; }).join("\n"), code: 0 };
        }
        if (verb === "type") {
          if (!tp[a[1]]) return { out: "", code: 1 };
          return { out: tp[a[1]].type, code: 0 };
        }
        if (verb === "info") {
          if (!a[1]) return { out: "usage: ros2 topic info [-h] [--verbose] topic_name\nros2 topic info: error: the following arguments are required: topic_name", code: 2 };
          if (!tp[a[1]]) return { out: "Unknown topic '" + a[1] + "'", code: 1 };
          return { out: "Type: " + tp[a[1]].type + "\nPublisher count: " + tp[a[1]].pubs + "\nSubscription count: " + tp[a[1]].subs, code: 0 };
        }
        if (verb === "echo") {
          var name = a.filter(function (x) { return x.charAt(0) === "/"; })[0];
          if (!name) return { out: "usage: ros2 topic echo [-h] topic_name [message_type]\nros2 topic echo: error: the following arguments are required: topic_name", code: 2 };
          if (!tp[name]) return { out: "WARNING: topic [" + name + "] does not appear to be published yet\nCould not determine the type for the passed topic", code: 1 };
          var once = a.indexOf("--once") >= 0;
          if (!tp[name].pubs || sample(name) === null) {
            return { out: once ? "" : "(nothing is being published on " + name + " right now, so a real echo would sit here silently. Press Ctrl+C in a real terminal.)", code: 0 };
          }
          if (once) return { out: sample(name), code: 0 };
          return { out: sample(name) + "\n" + sample(name) + "\n" + sample(name) + "\n(a real echo keeps going until you press Ctrl+C; this one shows 3 messages and stops)", code: 0 };
        }
        if (verb === "hz") {
          var hn = a[1];
          if (!hn || !tp[hn]) return { out: "WARNING: topic [" + (hn || "") + "] does not appear to be published yet", code: 1 };
          if (!tp[hn].pubs) return { out: "", code: 0 };
          var rate = hn === "/chatter" ? "1.000" : "62.519", mn = hn === "/chatter" ? "1.000s max: 1.001s std dev: 0.00041s window: 3" : "0.015s max: 0.017s std dev: 0.00048s window: 64";
          return { out: "average rate: " + rate + "\n\tmin: " + mn + "\n(a real hz keeps updating until Ctrl+C; this shows one reading)", code: 0 };
        }
        if (verb === "pub") return pub(a.slice(1));
        if (verb === "delay" || verb === "bw" || verb === "find") return { out: NO_PRACTICE, code: 0 };
        return { out: "usage: ros2 topic [-h] Call `ros2 topic <command> -h` for more detailed usage. ...\n  commands: list, info, type, echo, hz, pub", code: a.length ? 2 : 0 };
      },
      service: function (a) {
        var verb = a[0], sv = services();
        if (verb === "list") {
          var showT = a.indexOf("-t") >= 0 || a.indexOf("--show-types") >= 0;
          return { out: sortedKeys(sv).map(function (k) { return showT ? k + " [" + sv[k] + "]" : k; }).join("\n"), code: 0 };
        }
        if (verb === "type") {
          if (!sv[a[1]]) return { out: "", code: 1 };
          return { out: sv[a[1]], code: 0 };
        }
        if (verb === "call") return call(a.slice(1), sv);
        return { out: "usage: ros2 service [-h] Call `ros2 service <command> -h` for more detailed usage. ...\n  commands: list, type, call", code: a.length ? 2 : 0 };
      },
      param: function (a) {
        var verb = a[0];
        function nodeBy(name) { return S.nodes.filter(function (x) { return "/" + x.name === name; })[0]; }
        function paramsOf(n) {
          var p = {};
          if (n.exe === "turtlesim_node") { p.background_b = S.bg[2]; p.background_g = S.bg[1]; p.background_r = S.bg[0]; }
          p.use_sim_time = false;
          return p;
        }
        if (verb === "list") {
          if (a[1]) {
            var n1 = nodeBy(a[1]);
            if (!n1) return { out: "Node not found", code: 1 };
            return { out: paramList(n1).map(function (k) { return "  " + k; }).join("\n"), code: 0 };
          }
          if (!S.nodes.length) return { out: "", code: 0 };
          return { out: S.nodes.slice().sort(function (x, y) { return x.name < y.name ? -1 : 1; }).map(function (n) { return "/" + n.name + ":\n" + paramList(n).map(function (k) { return "  " + k; }).join("\n"); }).join("\n"), code: 0 };
        }
        function paramList(n) {
          var keys = Object.keys(paramsOf(n));
          if (n.exe === "turtlesim_node") keys = keys.concat(["qos_overrides./parameter_events.publisher.depth", "qos_overrides./parameter_events.publisher.durability", "qos_overrides./parameter_events.publisher.history", "qos_overrides./parameter_events.publisher.reliability"]);
          return keys.sort();
        }
        if (verb === "get") {
          if (a.length < 3) return { out: "usage: ros2 param get [-h] [--hide-type] node_name name\nros2 param get: error: the following arguments are required: " + (a.length < 2 ? "node_name, name" : "name"), code: 2 };
          var n2 = nodeBy(a[1]);
          if (!n2) return { out: "Node not found", code: 1 };
          var p2 = paramsOf(n2);
          if (!(a[2] in p2)) return { out: "Parameter not set", code: 1 };
          var v = p2[a[2]];
          return { out: typeof v === "boolean" ? "Boolean value is: " + (v ? "True" : "False") : "Integer value is: " + v, code: 0 };
        }
        if (verb === "set") {
          if (a.length < 4) return { out: "usage: ros2 param set [-h] node_name name value\nros2 param set: error: the following arguments are required: " + (a.length < 2 ? "node_name, name, value" : a.length < 3 ? "name, value" : "value"), code: 2 };
          var n3 = nodeBy(a[1]);
          if (!n3) return { out: "Node not found", code: 1 };
          var p3 = paramsOf(n3);
          if (!(a[2] in p3)) return { out: "Setting parameter failed: parameter '" + a[2] + "' cannot be set because it was not declared", code: 1 };
          var isBool = typeof p3[a[2]] === "boolean", val = a[3];
          if (isBool) {
            if (!/^(true|false)$/i.test(val)) return { out: "Setting parameter failed: Wrong parameter type, parameter {" + a[2] + "} is of type {bool}, setting it to {" + (/^-?\d+$/.test(val) ? "integer" : "string") + "} is not allowed.", code: 1 };
            return { out: "Set parameter successful", code: 0 };
          }
          if (!/^-?\d+$/.test(val)) return { out: "Setting parameter failed: Wrong parameter type, parameter {" + a[2] + "} is of type {integer}, setting it to {" + (/^-?\d*\.\d+$/.test(val) ? "double" : "string") + "} is not allowed.", code: 1 };
          var num = parseInt(val, 10);
          if (num < 0 || num > 255) return { out: "Setting parameter failed: Parameter {" + a[2] + "} doesn't comply with integer range.", code: 1 };
          if (a[2] === "background_r") S.bg[0] = num; else if (a[2] === "background_g") S.bg[1] = num; else if (a[2] === "background_b") S.bg[2] = num;
          emit();
          return { out: "Set parameter successful", code: 0 };
        }
        return { out: "usage: ros2 param [-h] Call `ros2 param <command> -h` for more detailed usage. ...\n  commands: list, get, set", code: a.length ? 2 : 0 };
      },
      interface: function (a) {
        if (a[0] === "show") {
          if (!a[1]) return { out: "usage: ros2 interface show [-h] type\nros2 interface show: error: the following arguments are required: type", code: 2 };
          if (!IFACE_TEXT[a[1]]) return { out: "Unknown message type '" + a[1] + "'", code: 1 };
          return { out: IFACE_TEXT[a[1]], code: 0 };
        }
        if (a[0] === "list") return { out: Object.keys(IFACE_TEXT).sort().join("\n") + "\n(the real list is much longer)", code: 0 };
        return { out: "usage: ros2 interface [-h] Call `ros2 interface <command> -h` for more detailed usage. ...\n  commands: show, list", code: a.length ? 2 : 0 };
      },
      pkg: function (a) {
        if (a[0] === "list") return { out: Object.keys(EXES).concat(["geometry_msgs", "std_msgs", "std_srvs", "rclpy"]).sort().join("\n") + "\n(the real list has hundreds of packages)", code: 0 };
        if (a[0] === "executables") {
          if (!a[1]) return { out: "usage: ros2 pkg executables [-h] package_name\nros2 pkg executables: error: the following arguments are required: package_name", code: 2 };
          if (!EXES[a[1]]) return { out: "Package not found", code: 1 };
          return { out: EXES[a[1]].map(function (e) { return a[1] + " " + e; }).join("\n"), code: 0 };
        }
        if (a[0] === "prefix") {
          if (!a[1] || !EXES[a[1]]) return { out: "Package not found", code: 1 };
          return { out: "/opt/ros/humble", code: 0 };
        }
        return { out: "usage: ros2 pkg [-h] Call `ros2 pkg <command> -h` for more detailed usage. ...\n  commands: list, executables, prefix", code: a.length ? 2 : 0 };
      }
    };

    function pub(a) {
      var once = false, rate = 1, pos = [];
      for (var i = 0; i < a.length; i++) {
        if (a[i] === "--once" || a[i] === "-1") once = true;
        else if (a[i] === "-r" || a[i] === "--rate") { rate = parseFloat(a[++i]) || 1; }
        else pos.push(a[i]);
      }
      if (pos.length < 3) return { out: "usage: ros2 topic pub [-h] [-r N] [-p N] [-1] [--keep-alive N] [-t TIMES] [-n NODE_NAME] topic_name message_type [values]\nros2 topic pub: error: the following arguments are required: " + (pos.length < 1 ? "topic_name, message_type" : "message_type"), code: 2 };
      var name = pos[0], type = pos[1];
      if (!T[type] || !T[type].f) return { out: "The passed message type is invalid", code: 1 };
      var given;
      try { given = parseYaml(pos[2]); } catch (e) { return { out: "Failed to parse the message values: " + e.message, code: 1 }; }
      var errs = [], vals = fillFields(T[type].f, given, errs);
      if (errs.length) return { out: errs[0], code: 1 };
      var tp = topics(), lines = [];
      if (tp[name] && tp[name].type !== type) return { out: "The passed message type is invalid", code: 1 };
      if (!tp[name] || !tp[name].subs) { if (!once || true) lines.push("Waiting for at least 1 matching subscription(s)..."); }
      if (!tp[name] || !tp[name].subs) {
        // no subscriber: a real --once publish waits forever. Say so, and stop.
        lines.push("(nobody is listening on " + name + ", so the real command would wait here until you press Ctrl+C. Is the node that listens running?)");
        return { out: lines.join("\n"), code: 1 };
      }
      lines = ["publisher: beginning loop"];
      var times = once ? 1 : 3;
      for (var k = 1; k <= times; k++) {
        lines.push("publishing #" + k + ": " + msgRepr(type, T[type].f, vals));
        if (name === "/turtle1/cmd_vel" || /^\/turtle\d+\/cmd_vel$/.test(name)) {
          var tn = name.split("/")[1];
          if (S.turtles[tn]) { var hit = moveTurtle(tn, vals.linear.x, vals.angular.z); if (hit) lines.push("(the turtle hit the wall and stopped)"); }
        }
      }
      lines.push("");
      if (!once) lines.push("(a real publisher at " + rate + " Hz keeps going until Ctrl+C; this one sent 3 messages and stopped)");
      return { out: lines.join("\n"), code: 0 };
    }

    function call(a, sv) {
      if (a.length < 2) return { out: "usage: ros2 service call [-h] [-r N] service_name service_type [values]\nros2 service call: error: the following arguments are required: " + (a.length < 1 ? "service_name, service_type" : "service_type"), code: 2 };
      var name = a[0], type = a[1];
      if (!T[type] || !T[type].req) return { out: "The passed service type is invalid", code: 1 };
      if (!sv[name]) return { out: "waiting for service to become available...\n(no node offers " + name + " yet, so the real command would wait here until you press Ctrl+C. Start the node first.)", code: 1 };
      if (sv[name] !== type) return { out: "The passed service type is invalid", code: 1 };
      var given = {};
      if (a[2] !== undefined) { try { given = parseYaml(a[2]); } catch (e) { return { out: "Failed to parse the request values: " + e.message, code: 1 }; } }
      var errs = [], req = fillFields(T[type].req, given, errs);
      if (errs.length) return { out: errs[0], code: 1 };
      var head = "requester: making request: " + msgRepr(type, T[type].req, req, "_Request");
      var res = {};
      var tn = /^\/(turtle\d+)\//.exec(name);
      if (name === "/spawn") {
        var nm = req.name;
        if (nm && S.turtles[nm]) return { out: head + "\n\nresponse:\n" + msgRepr(type, T[type].res, { name: "" }, "_Response"), code: 0 };
        if (!nm) { var k = 2; while (S.turtles["turtle" + k]) k++; nm = "turtle" + k; }
        newTurtle(nm, req.x, req.y, req.theta);
        res = { name: nm };
        tick++;
        emit();
      } else if (name === "/kill") {
        if (!S.turtles[req.name]) return { out: head + "\n\nresponse:\n(the service failed: Turtle " + req.name + " does not exist)", code: 1 };
        delete S.turtles[req.name]; emit();
      } else if (name === "/clear") { S.trails = []; emit(); }
      else if (name === "/reset") {
        S.trails = []; S.turtles = {}; S.bg = [69, 86, 255];
        newTurtle("turtle1", WORLD / 2, WORLD / 2, 0); emit();
      } else if (tn && /set_pen$/.test(name)) {
        var t = S.turtles[tn[1]]; if (t) t.pen = { r: req.r, g: req.g, b: req.b, width: req.width, off: req.off };
      } else if (tn && /teleport_absolute$/.test(name)) {
        var t2 = S.turtles[tn[1]];
        if (t2) { t2.x = f32(Math.min(Math.max(req.x, 0), WORLD)); t2.y = f32(Math.min(Math.max(req.y, 0), WORLD)); t2.theta = f32(req.theta); emit(); }
      } else if (tn && /teleport_relative$/.test(name)) {
        var t3 = S.turtles[tn[1]];
        if (t3) { t3.theta = f32(t3.theta + req.angular); t3.x = f32(Math.min(Math.max(t3.x + Math.cos(t3.theta) * req.linear, 0), WORLD)); t3.y = f32(Math.min(Math.max(t3.y + Math.sin(t3.theta) * req.linear, 0), WORLD)); emit(); }
      }
      return { out: head + "\n\nresponse:\n" + msgRepr(type, T[type].res, res, "_Response") + "\n", code: 0 };
    }

    // ----- shell parsing -----
    function tokenize(line) {
      var toks = [], i = 0, n = line.length;
      function pushWord(w, glob, hadQuote) { toks.push({ w: w, glob: glob, q: hadQuote }); }
      while (i < n) {
        var c = line[i];
        if (/\s/.test(c)) { i++; continue; }
        if (c === "#") break;
        if (c === ";") { toks.push({ op: ";" }); i++; continue; }
        if (c === "|") { if (line[i + 1] === "|") { toks.push({ op: "||" }); i += 2; } else { toks.push({ op: "|" }); i++; } continue; }
        if (c === "&") { if (line[i + 1] === "&") { toks.push({ op: "&&" }); i += 2; } else { toks.push({ op: "&" }); i++; } continue; }
        if (c === ">") { if (line[i + 1] === ">") { toks.push({ op: ">>" }); i += 2; } else { toks.push({ op: ">" }); i++; } continue; }
        var w = "", glob = false, hadQuote = false;
        while (i < n && !/[\s;|&>]/.test(line[i])) {
          var ch = line[i];
          if (ch === "'") { hadQuote = true; i++; while (i < n && line[i] !== "'") w += line[i++]; if (i >= n) throw new Error("unexpected EOF while looking for matching `''"); i++; }
          else if (ch === '"') {
            hadQuote = true; i++;
            while (i < n && line[i] !== '"') {
              if (line[i] === "\\" && /["\\$]/.test(line[i + 1] || "")) { w += line[i + 1]; i += 2; }
              else if (line[i] === "$") { var r = expandVar(line, i); w += r.v; i = r.i; }
              else w += line[i++];
            }
            if (i >= n) throw new Error("unexpected EOF while looking for matching `\"'");
            i++;
          }
          else if (ch === "\\") { w += line[i + 1] || ""; i += 2; hadQuote = true; }
          else if (ch === "$") { var r2 = expandVar(line, i); w += r2.v; i = r2.i; }
          else if (ch === "~" && w === "" && (i + 1 >= n || /[\s/;|&>]/.test(line[i + 1]))) { w += env.HOME; i++; }
          else { if (ch === "*" || ch === "?") glob = true; w += ch; i++; }
        }
        pushWord(w, glob, hadQuote);
      }
      return toks;
    }
    function expandVar(line, i) {
      var m = /^\$(\{(\w+)\}|(\w+)|\?)/.exec(line.slice(i));
      if (!m) return { v: "$", i: i + 1 };
      var name = m[2] || m[3];
      if (m[1] === "?") return { v: String(lastCode), i: i + 2 };
      return { v: env[name] !== undefined ? env[name] : "", i: i + m[0].length };
    }
    var lastCode = 0;
    function globToRe(g) { return new RegExp("^" + g.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\?/g, ".") + "$"); }
    function expandArgs(toks) {
      var out = [];
      toks.forEach(function (t) {
        if (t.glob && !t.q) {
          var slash = t.w.lastIndexOf("/"), dirPart = slash >= 0 ? t.w.slice(0, slash + 1) : "", pat = t.w.slice(slash + 1);
          var d = lookup(norm(dirPart || "."));
          var hits = d && d.t === "d" ? Object.keys(d.c).filter(function (nm) { return (nm.charAt(0) !== "." || pat.charAt(0) === ".") && globToRe(pat).test(nm); }).sort().map(function (nm) { return dirPart + nm; }) : [];
          out.push.apply(out, hits.length ? hits : [t.w]);
        } else out.push(t.w);
      });
      return out;
    }

    // ----- plain Linux commands -----
    function lsName(abs, name) { return name; }
    function lsCmd(args, stdin) {
      var flags = "", paths = [];
      args.forEach(function (a) { if (/^-[a-zA-Z]+$/.test(a)) flags += a.slice(1); else paths.push(a); });
      if (!paths.length) paths = ["."];
      var all = flags.indexOf("a") >= 0, long = flags.indexOf("l") >= 0, out = [], code = 0, multi = paths.length > 1;
      function lines(names, abs) {
        if (!long) return names.join("  ");
        var rows = names.map(function (nm) {
          var node = nm === "." || nm === ".." ? (nm === "." ? lookup(abs) : lookup(norm(abs + "/.."))) : lookup(abs === "/" ? "/" + nm : abs + "/" + nm);
          var isD = node && node.t === "d";
          return (isD ? "drwxr-xr-x" : "-rw-r--r--") + " " + (isD ? "2" : "1") + " student student " + ("     " + (isD ? 4096 : node ? node.d.length : 0)).slice(-5) + " Oct  8 10:00 " + nm;
        });
        return "total " + rows.length * 4 + "\n" + rows.join("\n");
      }
      paths.forEach(function (p) {
        var abs = norm(p), node = lookup(abs);
        if (!node) { out.push("ls: cannot access '" + p + "': No such file or directory"); code = 2; return; }
        if (node.t === "f") { out.push(long ? lines([p], norm(p + "/..")).replace(/^total \d+\n/, "") : p); return; }
        var names = Object.keys(node.c).filter(function (nm) { return all || nm.charAt(0) !== "."; });
        names.sort(function (x, y) { return x.replace(/^\./, "").toLowerCase() < y.replace(/^\./, "").toLowerCase() ? -1 : 1; });
        if (all) names = [".", ".."].concat(names);
        out.push((multi ? p + ":\n" : "") + lines(names, abs));
      });
      return { out: out.filter(function (x) { return x !== ""; }).join("\n\n"), code: code };
    }
    function textOf(files, stdin, cmd) {
      if (!files.length) return { text: stdin || "" };
      var text = "", err = [];
      files.forEach(function (f) {
        var n = lookup(norm(f));
        if (!n) err.push(cmd + ": " + f + ": No such file or directory");
        else if (n.t === "d") err.push(cmd + ": " + f + ": Is a directory");
        else text += n.d;
      });
      return { text: text, err: err };
    }
    var CMDS = {
      pwd: function () { return { out: cwd, code: 0 }; },
      "true": function () { return { out: "", code: 0 }; },
      "false": function () { return { out: "", code: 1 }; },
      whoami: function () { return { out: "student", code: 0 }; },
      hostname: function () { return { out: "laptop", code: 0 }; },
      date: function () { return { out: "Wed Oct  8 10:00:00 UTC 2026", code: 0 }; },
      lsb_release: function (a) { return { out: a.indexOf("-d") >= 0 ? "Description:\tUbuntu 22.04.5 LTS" : "No LSB modules are available.\nDistributor ID:\tUbuntu\nDescription:\tUbuntu 22.04.5 LTS\nRelease:\t22.04\nCodename:\tjammy", code: 0 }; },
      uname: function (a) { return { out: a.indexOf("-r") >= 0 ? "5.15.153.1-microsoft-standard-WSL2" : "Linux", code: 0 }; },
      clear: function () { return { out: "", code: 0, clear: true }; },
      exit: function () { return { out: "(this is a practice terminal, there is nothing to close. Use Reset to start over.)", code: 0 }; },
      ls: lsCmd,
      cd: function (a) {
        var t = a[0] === undefined ? env.HOME : a[0] === "-" ? env.OLDPWD || cwd : a[0];
        var abs = norm(t), n = lookup(abs);
        if (!n) return { out: "bash: cd: " + a[0] + ": No such file or directory", code: 1 };
        if (n.t !== "d") return { out: "bash: cd: " + a[0] + ": Not a directory", code: 1 };
        env.OLDPWD = cwd; cwd = abs; env.PWD = abs;
        return { out: "", code: 0 };
      },
      mkdir: function (a) {
        var parents = a.indexOf("-p") >= 0, out = [], code = 0, paths = a.filter(function (x) { return x.charAt(0) !== "-"; });
        if (!paths.length) return { out: "mkdir: missing operand", code: 1 };
        paths.forEach(function (p) {
          var abs = norm(p), ex = lookup(abs);
          if (ex) { if (!parents) { out.push("mkdir: cannot create directory ‘" + p + "’: File exists"); code = 1; } return; }
          var par = parentOf(abs);
          if (!par.dir || par.dir.t !== "d") {
            if (parents) { S.mkdir(abs); return; }
            out.push("mkdir: cannot create directory ‘" + p + "’: No such file or directory"); code = 1; return;
          }
          par.dir.c[par.name] = dirNode();
        });
        return { out: out.join("\n"), code: code };
      },
      rmdir: function (a) {
        var out = [], code = 0;
        a.forEach(function (p) {
          var n = lookup(norm(p));
          if (!n) { out.push("rmdir: failed to remove '" + p + "': No such file or directory"); code = 1; }
          else if (n.t !== "d") { out.push("rmdir: failed to remove '" + p + "': Not a directory"); code = 1; }
          else if (Object.keys(n.c).length) { out.push("rmdir: failed to remove '" + p + "': Directory not empty"); code = 1; }
          else { var par = parentOf(norm(p)); delete par.dir.c[par.name]; }
        });
        return { out: out.join("\n"), code: code };
      },
      touch: function (a) {
        var out = [], code = 0;
        if (!a.length) return { out: "touch: missing file operand", code: 1 };
        a.forEach(function (p) {
          if (lookup(norm(p))) return;
          var e = writeFile(p, "", false);
          if (e) { out.push("touch: cannot touch '" + p + "': No such file or directory"); code = 1; }
        });
        return { out: out.join("\n"), code: code };
      },
      echo: function (a) {
        var nl = true;
        if (a[0] === "-n") { nl = false; a = a.slice(1); }
        return { out: a.join(" "), code: 0, raw: nl };
      },
      cat: function (a, stdin) {
        var r = textOf(a, stdin, "cat");
        var t = r.text.replace(/\n$/, "");
        return { out: [t].concat(r.err || []).filter(function (x) { return x !== ""; }).join("\n"), code: r.err && r.err.length ? 1 : 0 };
      },
      head: function (a, stdin) { return headTail(a, stdin, true); },
      tail: function (a, stdin) { return headTail(a, stdin, false); },
      wc: function (a, stdin) {
        var files = a.filter(function (x) { return x.charAt(0) !== "-"; }), r = textOf(files, stdin, "wc");
        var lines = r.text ? r.text.replace(/\n$/, "").split("\n").length : 0;
        if (a.indexOf("-l") >= 0) return { out: String(lines), code: 0 };
        return { out: lines + " " + (r.text.split(/\s+/).filter(Boolean).length) + " " + r.text.length, code: 0 };
      },
      grep: function (a, stdin) {
        var flags = a.filter(function (x) { return /^-[a-zA-Z]+$/.test(x); }).join(""), rest = a.filter(function (x) { return !/^-[a-zA-Z]+$/.test(x); });
        if (!rest.length) return { out: "Usage: grep [OPTION]... PATTERNS [FILE]...", code: 2 };
        var re; try { re = new RegExp(rest[0], flags.indexOf("i") >= 0 ? "i" : ""); } catch (e) { return { out: "grep: Invalid regular expression", code: 2 }; }
        var r = textOf(rest.slice(1), stdin, "grep");
        var inv = flags.indexOf("v") >= 0;
        var hits = r.text.replace(/\n$/, "").split("\n").filter(function (l) { return l !== "" && (re.test(l) !== inv); });
        return { out: (r.err || []).concat(hits).join("\n"), code: hits.length ? 0 : 1 };
      },
      cp: function (a) {
        var rec = a.some(function (x) { return x === "-r" || x === "-R"; }), p = a.filter(function (x) { return x.charAt(0) !== "-"; });
        if (p.length < 2) return { out: "cp: missing destination file operand after '" + (p[0] || "") + "'", code: 1 };
        var dst = p[p.length - 1], out = [], code = 0, dn = lookup(norm(dst));
        p.slice(0, -1).forEach(function (s) {
          var sn = lookup(norm(s));
          if (!sn) { out.push("cp: cannot stat '" + s + "': No such file or directory"); code = 1; return; }
          if (sn.t === "d" && !rec) { out.push("cp: -r not specified; omitting directory '" + s + "'"); code = 1; return; }
          var target = dn && dn.t === "d" ? norm(dst + "/" + s.split("/").filter(Boolean).pop()) : norm(dst);
          var par = parentOf(target);
          if (!par.dir || par.dir.t !== "d") { out.push("cp: cannot create regular file '" + dst + "': No such file or directory"); code = 1; return; }
          par.dir.c[par.name] = clone(sn);
        });
        return { out: out.join("\n"), code: code };
      },
      mv: function (a) {
        var p = a.filter(function (x) { return x.charAt(0) !== "-"; });
        if (p.length < 2) return { out: "mv: missing destination file operand after '" + (p[0] || "") + "'", code: 1 };
        var dst = p[p.length - 1], out = [], code = 0, dn = lookup(norm(dst));
        p.slice(0, -1).forEach(function (s) {
          var sn = lookup(norm(s));
          if (!sn) { out.push("mv: cannot stat '" + s + "': No such file or directory"); code = 1; return; }
          var target = dn && dn.t === "d" ? norm(dst + "/" + s.split("/").filter(Boolean).pop()) : norm(dst);
          var par = parentOf(target);
          if (!par.dir || par.dir.t !== "d") { out.push("mv: cannot move '" + s + "' to '" + dst + "': No such file or directory"); code = 1; return; }
          var sp = parentOf(norm(s)); delete sp.dir.c[sp.name];
          par.dir.c[par.name] = sn;
        });
        return { out: out.join("\n"), code: code };
      },
      rm: function (a) {
        var rec = a.some(function (x) { return /^-[a-zA-Z]*[rR]/.test(x); }), force = a.some(function (x) { return /^-[a-zA-Z]*f/.test(x); });
        var p = a.filter(function (x) { return x.charAt(0) !== "-"; }), out = [], code = 0;
        if (!p.length) return { out: "rm: missing operand", code: 1 };
        p.forEach(function (s) {
          var abs = norm(s), n = lookup(abs);
          if (abs === "/" || abs === env.HOME) { out.push("rm: refusing to remove '" + s + "' in the practice terminal"); code = 1; return; }
          if (!n) { if (!force) { out.push("rm: cannot remove '" + s + "': No such file or directory"); code = 1; } return; }
          if (n.t === "d" && !rec) { out.push("rm: cannot remove '" + s + "': Is a directory"); code = 1; return; }
          var par = parentOf(abs); delete par.dir.c[par.name];
          if (cwd === abs || cwd.indexOf(abs + "/") === 0) { cwd = par.dir ? norm(abs + "/..") : "/"; }
        });
        return { out: out.join("\n"), code: code };
      },
      printenv: function (a) {
        if (a.length) return { out: env[a[0]] !== undefined ? env[a[0]] : "", code: env[a[0]] !== undefined ? 0 : 1 };
        return { out: Object.keys(env).map(function (k) { return k + "=" + env[k]; }).join("\n"), code: 0 };
      },
      env: function () { return CMDS.printenv([]); },
      export: function (a) {
        a.forEach(function (x) { var m = /^(\w+)=(.*)$/.exec(x); if (m) env[m[1]] = m[2]; });
        return { out: "", code: 0 };
      },
      unset: function (a) { a.forEach(function (k) { delete env[k]; }); return { out: "", code: 0 }; },
      source: function (a) {
        if (!a[0]) return { out: "bash: source: filename argument required", code: 2 };
        var n = lookup(norm(a[0]));
        if (!n) return { out: "bash: " + a[0] + ": No such file or directory", code: 1 };
        return { out: "", code: 0 };
      },
      which: function (a) {
        var known = { ros2: "/opt/ros/humble/bin/ros2", python3: "/usr/bin/python3", ls: "/usr/bin/ls", cat: "/usr/bin/cat", rqt_graph: "/opt/ros/humble/bin/rqt_graph" };
        return known[a[0]] ? { out: known[a[0]], code: 0 } : { out: "", code: 1 };
      },
      history: function () { return { out: S.history.map(function (h, i) { return ("    " + (i + 1)).slice(-5) + "  " + h; }).join("\n"), code: 0 }; },
      ping: function (a) {
        var m = a.indexOf("-c") >= 0 ? parseInt(a[a.indexOf("-c") + 1], 10) || 3 : 4, host = a.filter(function (x) { return x.charAt(0) !== "-" && !/^\d+$/.test(x); })[0] || "localhost";
        var o = ["PING " + host + " (127.0.0.1) 56(84) bytes of data."];
        for (var i = 1; i <= m; i++) o.push("64 bytes from localhost (127.0.0.1): icmp_seq=" + i + " ttl=64 time=0.0" + (30 + i) + " ms");
        o.push("", "--- " + host + " ping statistics ---", m + " packets transmitted, " + m + " received, 0% packet loss, time " + (m - 1) * 1001 + "ms");
        if (a.indexOf("-c") < 0) o.push("(a real ping runs until Ctrl+C; use  ping -c 3 localhost  to stop after 3)");
        return { out: o.join("\n"), code: 0 };
      },
      sudo: function () { return { out: "(sudo is not needed in the practice terminal: nothing here can be installed or broken)", code: 0 }; },
      apt: function () { return { out: "(apt is not part of the practice terminal)", code: 0 }; },
      nano: function (a) { return { out: "(nano cannot open here. To make a file, use:  echo \"some text\" > " + (a[0] || "file.txt") + ")", code: 0 }; },
      vim: function (a) { return CMDS.nano(a); },
      man: function (a) { return { out: "(man pages are not in the practice terminal. Try  " + (a[0] || "ls") + " --help  in your real terminal.)", code: 0 }; },
      python3: function (a) {
        if (a[0] === "--version" || a[0] === "-V") return { out: "Python 3.10.12", code: 0 };
        return { out: "(the practice terminal cannot run Python files; do that in your real Ubuntu terminal)", code: 0 };
      },
      rqt_graph: function () { return { out: NO_PRACTICE, code: 0 }; },
      ros2: ros2,
      stop: function (a) {
        if (!S.nodes.length) return { out: "nothing is running", code: 1 };
        if (a[0]) return stopByName(a[0]) ? { out: "stopped " + a[0], code: 0 } : { out: "stop: no running node called " + a[0], code: 1 };
        return { out: S.interrupt().replace(/^\^C\n/, ""), code: 0 };
      },
      jobs: function () { return { out: S.nodes.map(function (n, i) { return "[" + (i + 1) + "]  Running   ros2 run " + n.pkg + " " + n.exe; }).join("\n"), code: 0 }; },
      help: function () {
        return { out: "Practice terminal. Things to try:\n  pwd  ls  cd  mkdir  touch  echo  cat  cp  mv  rm  printenv  export  source\n  ros2 run turtlesim turtlesim_node\n  ros2 node list    ros2 topic list    ros2 service list    ros2 param list /turtlesim\n  stop  (ends the last started node, same as Ctrl+C)\nTap a button above the keyboard to fill in a command, or press Tab to complete.", code: 0 };
      }
    };
    function headTail(a, stdin, head) {
      var n = 10, files = [];
      for (var i = 0; i < a.length; i++) {
        if (a[i] === "-n") n = parseInt(a[++i], 10) || 10;
        else if (/^-\d+$/.test(a[i])) n = parseInt(a[i].slice(1), 10);
        else files.push(a[i]);
      }
      var r = textOf(files, stdin, head ? "head" : "tail");
      var ls = r.text.replace(/\n$/, "").split("\n");
      if (r.text === "") ls = [];
      return { out: (r.err || []).concat(head ? ls.slice(0, n) : ls.slice(-n)).join("\n"), code: r.err && r.err.length ? 1 : 0 };
    }

    // ----- run one command line -----
    function runSimple(toks, stdin) {
      var words = toks.filter(function (t) { return !t.op; });
      var redirect = null, kept = [];
      for (var i = 0; i < toks.length; i++) {
        if (toks[i].op === ">" || toks[i].op === ">>") {
          var tgt = toks[i + 1];
          if (!tgt || tgt.op) return { out: "bash: syntax error near unexpected token `newline'", code: 2 };
          redirect = { path: tgt.w, append: toks[i].op === ">>" }; i++;
        } else if (!toks[i].op) kept.push(toks[i]);
      }
      var args = expandArgs(kept);
      if (!args.length) return { out: "", code: 0 };
      // VAR=value on its own
      var asg = /^(\w+)=(.*)$/.exec(args[0]);
      if (asg && args.length === 1) { env[asg[1]] = asg[2]; return { out: "", code: 0 }; }
      var cmd = args[0], rest = args.slice(1), res;
      if (cmd.indexOf("/") >= 0 && !CMDS[cmd]) {
        var fn = lookup(norm(cmd));
        res = fn ? { out: "bash: " + cmd + ": Permission denied", code: 126 } : { out: "bash: " + cmd + ": No such file or directory", code: 127 };
      } else if (CMDS[cmd]) {
        try { res = CMDS[cmd](rest, stdin); } catch (e) { res = { out: "bash: " + cmd + ": something went wrong in the practice terminal (" + e.message + ")", code: 1 }; }
      } else res = { out: "" + cmd + ": command not found", code: 127 };
      if (redirect) {
        var text = res.out + (res.out !== "" || cmd === "echo" ? "\n" : "");
        var err = writeFile(redirect.path, text, redirect.append);
        if (err) return { out: err, code: 1 };
        return { out: "", code: res.code };
      }
      return res;
    }
    function runPipeline(toks) {
      var stages = [[]];
      toks.forEach(function (t) { if (t.op === "|") stages.push([]); else stages[stages.length - 1].push(t); });
      var stdin = "", res = { out: "", code: 0 };
      stages.forEach(function (st, i) {
        res = runSimple(st, stdin);
        stdin = res.out === "" ? "" : res.out + "\n";
      });
      return res;
    }
    var running = false;
    S.exec = function (line) {
      line = String(line);
      if (!line.trim()) return { out: "", code: 0 };
      S.history.push(line);
      var toks;
      try { toks = tokenize(line); } catch (e) { lastCode = 2; return { out: "bash: " + e.message, code: 2 }; }
      var cmds = [[]], seps = [];
      toks.forEach(function (t) {
        if (t.op === ";" || t.op === "&&" || t.op === "||") { seps.push(t.op); cmds.push([]); }
        else if (t.op === "&") { /* run in background: nodes already do */ }
        else cmds[cmds.length - 1].push(t);
      });
      var outs = [], code = 0, clear = false, ranAny = false;
      for (var i = 0; i < cmds.length; i++) {
        if (i > 0) {
          var sp = seps[i - 1];
          if (sp === "&&" && code !== 0) continue;
          if (sp === "||" && code === 0) continue;
        }
        var r = runPipeline(cmds[i]);
        code = r.code; lastCode = code;
        if (r.clear) { clear = true; outs = []; }
        else if (r.out !== "") outs.push(r.out);
        ranAny = true;
      }
      if (code === 0) S.okLines.push(line); else S.failed.push({ line: line, out: outs.join("\n") });
      return { out: outs.join("\n"), code: code, clear: clear };
    };

    // ----- tab completion -----
    var TOP = Object.keys(CMDS).filter(function (k) { return k !== "exit"; });
    function listDir(prefixPath) {
      var slash = prefixPath.lastIndexOf("/"), dirPart = slash >= 0 ? prefixPath.slice(0, slash + 1) : "", base = prefixPath.slice(slash + 1);
      var d = lookup(norm(dirPart || "."));
      if (!d || d.t !== "d") return [];
      return Object.keys(d.c).filter(function (nm) { return nm.indexOf(base) === 0 && (nm.charAt(0) !== "." || base.charAt(0) === "."); }).sort().map(function (nm) { return dirPart + nm + (d.c[nm].t === "d" ? "/" : ""); });
    }
    function commonPrefix(arr) {
      if (!arr.length) return "";
      var p = arr[0];
      arr.forEach(function (s) { while (s.indexOf(p) !== 0) p = p.slice(0, -1); });
      return p;
    }
    S.complete = function (line) {
      var m = /^(.*?)(\S*)$/.exec(line), before = m[1], word = m[2];
      var parts = before.trim() ? before.trim().split(/\s+/) : [];
      var cands = [];
      var last = parts[parts.length - 1];
      var isFirst = parts.length === 0 || /[;|&]$/.test(before.trim());
      if (isFirst) cands = TOP.filter(function (c) { return c.indexOf(word) === 0; });
      else if (parts[0] === "ros2") {
        var tree = { run: null, node: ["list", "info"], topic: ["list", "info", "echo", "hz", "pub", "type"], service: ["list", "type", "call"], param: ["list", "get", "set"], interface: ["show", "list"], pkg: ["list", "executables", "prefix"] };
        if (parts.length === 1) cands = Object.keys(tree).filter(function (c) { return c.indexOf(word) === 0; });
        else if (parts[1] === "run") {
          if (parts.length === 2) cands = Object.keys(EXES).filter(function (c) { return c.indexOf(word) === 0; });
          else if (parts.length === 3) cands = (EXES[parts[2]] || []).filter(function (c) { return c.indexOf(word) === 0; });
        } else if (parts.length === 2) cands = (tree[parts[1]] || []).filter(function (c) { return c.indexOf(word) === 0; });
        else {
          var verb = parts[2], pool = [];
          if (parts[1] === "node") pool = S.nodeNames();
          else if (parts[1] === "topic") {
            if (verb === "pub" && parts.length >= 4 && parts[parts.length - 1].charAt(0) === "/") pool = ["geometry_msgs/msg/Twist", "std_msgs/msg/String"];
            else pool = S.topicNames().concat(["--once", "-t"]);
          } else if (parts[1] === "service") {
            if (verb === "call" && parts.length >= 4) { var sv = services(); pool = sv[parts[3]] ? [sv[parts[3]]] : Object.keys(T).filter(function (k) { return T[k].req; }); }
            else pool = sortedKeys(services());
          } else if (parts[1] === "param") {
            if (parts.length === 3) pool = S.nodeNames();
            else if (parts.length === 4 && S.hasNode(parts[3])) pool = ["background_r", "background_g", "background_b", "use_sim_time"];
          } else if (parts[1] === "interface") pool = Object.keys(IFACE_TEXT).sort();
          else if (parts[1] === "pkg") pool = Object.keys(EXES);
          cands = pool.filter(function (c) { return c.indexOf(word) === 0; });
        }
      } else cands = listDir(word);
      cands = cands.filter(function (c, i) { return cands.indexOf(c) === i; });
      var cp = commonPrefix(cands);
      var done = cands.length === 1 && cp.charAt(cp.length - 1) !== "/" ? cp + " " : cp;
      return { line: before + (cands.length ? done : word), options: cands.length > 1 ? cands : [] };
    };

    S.sawError = function (rx) { return S.failed.some(function (f) { return rx.test(f.out); }); };
    S.subscribe = function (fn) { S.listeners.push(fn); };
    S.reset = function () { };

    // ----- optional starting state -----
    (opts.dirs || []).forEach(function (d) { S.mkdir(d); });
    Object.keys(opts.files || {}).forEach(function (p) { var abs = norm(p); S.mkdir(abs + "/.."); writeFile(abs, opts.files[p], false); });
    if (opts.cwd) cwd = norm(opts.cwd), env.PWD = cwd;
    (opts.start || []).forEach(function (c) { S.exec(c); });
    S.history = []; S.okLines = []; S.failed = []; S.preloaded = (opts.start || []).length;
    return S;
  }

  var API = { create: create, parseYaml: parseYaml, WORLD: WORLD };
  if (typeof module !== "undefined" && module.exports) module.exports = API; else root.ROSSIM = API;
})(typeof window !== "undefined" ? window : globalThis);
