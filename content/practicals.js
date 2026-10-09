// Short hands-on practicals for the practice terminal (content/sim.js). Each one is attached to the end
// of its lesson. They run inside the page, so they work on a phone with no ROS installed.
// A task's `done(s)` is checked after every command; `s` is the pretend session
// (s.cwd(), s.fileText(p), s.exists(p), s.env(k), s.hasNode(n), s.turtle(name), s.bg, s.trails, s.okLines).
window.PRACTICALS = [
  {
    id: "files", lesson: "0.3", title: "Files and folders", xp: 20,
    intro: "Same commands as the lesson, but you can do them right here. Nothing you do can break anything.",
    chips: ["pwd", "ls", "ls -l", "mkdir practice", "cd practice", "cd ..", "touch a.txt", "echo \"hello linux\" > b.txt", "cat b.txt", "cp b.txt c.txt", "mv c.txt notes.txt", "rm a.txt"],
    tasks: [
      { text: "Make a folder called <code>practice</code> and move into it.", hint: "mkdir practice  then  cd practice",
        done: function (s) { return s.cwd() === "/home/student/practice"; } },
      { text: "Create a file <code>b.txt</code> that contains the words <code>hello linux</code>.", hint: "echo \"hello linux\" > b.txt",
        done: function (s) { return /hello linux/.test(s.fileText("/home/student/practice/b.txt") || ""); } },
      { text: "Copy <code>b.txt</code> to <code>c.txt</code>, then rename <code>c.txt</code> to <code>notes.txt</code>.", hint: "cp b.txt c.txt  then  mv c.txt notes.txt",
        done: function (s) { return s.exists("/home/student/practice/notes.txt") && s.exists("/home/student/practice/b.txt") && !s.exists("/home/student/practice/c.txt"); } },
      { text: "Make an empty file <code>a.txt</code>, check it with <code>ls</code>, then delete it.", hint: "touch a.txt, ls, rm a.txt",
        done: function (s) { return !s.exists("/home/student/practice/a.txt") && s.okLines.some(function (l) { return /^touch\s+a\.txt/.test(l); }) && s.okLines.some(function (l) { return /^rm\s+a\.txt/.test(l); }); } }
    ]
  },
  {
    id: "vars", lesson: "0.4", title: "Environment variables", xp: 20,
    intro: "Variables are named boxes the terminal remembers. Make one, read one, and find the ROS ones.",
    chips: ["echo $HOME", "echo $PATH", "export MYNAME=Daniel", "echo $MYNAME", "printenv | grep ROS", "echo $ROS_DISTRO", "source /opt/ros/humble/setup.bash"],
    tasks: [
      { text: "Create a variable called <code>MYNAME</code> holding your name.", hint: "export MYNAME=Daniel",
        done: function (s) { return !!s.env("MYNAME"); } },
      { text: "Print it back with <code>echo</code>.", hint: "echo $MYNAME",
        done: function (s) { return !!s.env("MYNAME") && s.okLines.some(function (l) { return /^echo\s+.*\$\{?MYNAME/.test(l); }); } },
      { text: "Show only the variables that mention ROS.", hint: "printenv | grep ROS",
        done: function (s) { return s.okLines.some(function (l) { return /printenv\s*\|\s*grep\s+ROS/.test(l); }); } },
      { text: "Find out which ROS version name is set (look for <code>ROS_DISTRO</code>).", hint: "echo $ROS_DISTRO",
        done: function (s) { return s.okLines.some(function (l) { return /ROS_DISTRO/.test(l) && /^(echo|printenv)/.test(l); }); } }
    ]
  },
  {
    id: "firstsim", lesson: "2.1", title: "Start the turtle", xp: 20,
    intro: "Run the simulation, then drive the turtle. In the real app the keyboard moves it; here use the arrow pad.",
    chips: ["ros2 run turtlesim turtlesim_node", "ros2 run turtlesim turtle_teleop_key", "ros2 node list", "stop"],
    tasks: [
      { text: "Start the simulator: run the <code>turtlesim_node</code>.", hint: "ros2 run turtlesim turtlesim_node",
        done: function (s) { return s.hasNode("/turtlesim"); } },
      { text: "Start the keyboard controller: <code>turtle_teleop_key</code>. An arrow pad appears.", hint: "ros2 run turtlesim turtle_teleop_key",
        done: function (s) { return s.hasNode("/teleop_turtle"); } },
      { text: "Drive the turtle with the arrow pad at least 5 times.", hint: "Tap ▲ ◀ ▶ under the picture.",
        done: function (s) { return !!s.turtle() && s.turtle().moved >= 5; } }
    ]
  },
  {
    id: "nodes", lesson: "2.2", title: "Meet the nodes", xp: 20,
    intro: "The turtle simulator is already running. Ask the graph what is alive.",
    start: ["ros2 run turtlesim turtlesim_node"],
    chips: ["ros2 node list", "ros2 node info /turtlesim", "ros2 run turtlesim turtle_teleop_key", "ros2 run demo_nodes_cpp talker", "stop"],
    tasks: [
      { text: "List the running nodes.", hint: "ros2 node list",
        done: function (s) { return s.okLines.some(function (l) { return /^ros2 node list/.test(l); }); } },
      { text: "Ask <code>/turtlesim</code> for its details: what does it publish and subscribe to?", hint: "ros2 node info /turtlesim",
        done: function (s) { return s.okLines.some(function (l) { return /^ros2 node info\s+\/turtlesim/.test(l); }); } },
      { text: "Start the teleop node, then list nodes again. You should see two.", hint: "ros2 run turtlesim turtle_teleop_key  then  ros2 node list",
        done: function (s) { return s.hasNode("/teleop_turtle") && s.okLines.filter(function (l) { return /^ros2 node list/.test(l); }).length >= 2; } }
    ]
  },
  {
    id: "topics", lesson: "2.3", title: "Topics: listen and talk", xp: 25,
    intro: "Topics are the channels nodes use. Look at one, then publish a message yourself.",
    start: ["ros2 run turtlesim turtlesim_node"],
    chips: ["ros2 topic list", "ros2 topic list -t", "ros2 topic info /turtle1/cmd_vel", "ros2 interface show geometry_msgs/msg/Twist", "ros2 topic echo /turtle1/pose --once", "ros2 topic pub --once /turtle1/cmd_vel geometry_msgs/msg/Twist \"{linear: {x: 2.0}, angular: {z: 1.8}}\""],
    tasks: [
      { text: "List the topics together with their message types.", hint: "ros2 topic list -t",
        done: function (s) { return s.okLines.some(function (l) { return /^ros2 topic list\s+(-t|--show-types)/.test(l); }); } },
      { text: "Read the turtle's current position once.", hint: "ros2 topic echo /turtle1/pose --once",
        done: function (s) { return s.okLines.some(function (l) { return /^ros2 topic echo\s+\/turtle1\/pose/.test(l); }); } },
      { text: "Publish one <code>Twist</code> message to <code>/turtle1/cmd_vel</code> so the turtle moves.", hint: "ros2 topic pub --once /turtle1/cmd_vel geometry_msgs/msg/Twist \"{linear: {x: 2.0}, angular: {z: 1.8}}\"",
        done: function (s) { return !!s.turtle() && s.turtle().moved >= 1 && s.okLines.some(function (l) { return /^ros2 topic pub/.test(l); }); } },
      { text: "Make the turtle end up with a turning angle (theta) bigger than 1. Echo the pose to check.", hint: "Send a Twist with a bigger angular z, e.g. z: 3.0, then echo the pose.",
        done: function (s) { return !!s.turtle() && Math.abs(s.turtle().theta) > 1 && s.okLines.some(function (l) { return /^ros2 topic echo\s+\/turtle1\/pose/.test(l); }); } }
    ]
  },
  {
    id: "services", lesson: "2.4", title: "Services: ask for something", xp: 25,
    intro: "A service is a question with an answer. Spawn a second turtle, change a pen colour, then clean up.",
    start: ["ros2 run turtlesim turtlesim_node", "ros2 run turtlesim turtle_teleop_key"],
    chips: ["ros2 service list", "ros2 service type /spawn", "ros2 interface show turtlesim/srv/Spawn", "ros2 service call /spawn turtlesim/srv/Spawn \"{x: 2.0, y: 2.0, theta: 0.2, name: 'turtle2'}\"", "ros2 service call /turtle1/set_pen turtlesim/srv/SetPen \"{r: 255, g: 0, b: 0, width: 5, 'off': 0}\"", "ros2 service call /clear std_srvs/srv/Empty", "ros2 service call /reset std_srvs/srv/Empty"],
    tasks: [
      { text: "Spawn a second turtle named <code>turtle2</code> at x 2, y 2.", hint: "ros2 service call /spawn turtlesim/srv/Spawn \"{x: 2.0, y: 2.0, theta: 0.2, name: 'turtle2'}\"",
        done: function (s) { return !!s.turtle("turtle2"); } },
      { text: "Make turtle1's pen <b>red</b> and thick.", hint: "ros2 service call /turtle1/set_pen turtlesim/srv/SetPen \"{r: 255, g: 0, b: 0, width: 5, 'off': 0}\"",
        done: function (s) { var p = s.turtle() && s.turtle().pen; return !!p && p.r > 200 && p.g < 60 && p.b < 60 && p.width >= 4; } },
      { text: "Drive turtle1 with the arrow pad until it draws a red line.", hint: "Tap ▲ a few times.",
        done: function (s) { return s.trails.some(function (t) { return t[4] > 200 && t[5] < 60 && t[6] < 60; }); } },
      { text: "Clear the drawing with the <code>/clear</code> service.", hint: "ros2 service call /clear std_srvs/srv/Empty",
        done: function (s) { return s.trails.length === 0 && s.okLines.some(function (l) { return /^ros2 service call\s+\/clear/.test(l); }); } }
    ]
  },
  {
    id: "params", lesson: "2.5", title: "Parameters: tune a node", xp: 20,
    intro: "Parameters are a node's settings. The turtle window's colour is made of three of them.",
    start: ["ros2 run turtlesim turtlesim_node"],
    chips: ["ros2 param list /turtlesim", "ros2 param get /turtlesim background_r", "ros2 param set /turtlesim background_r 150", "ros2 param set /turtlesim background_g 0", "ros2 param set /turtlesim background_b 0"],
    tasks: [
      { text: "List the parameters of <code>/turtlesim</code>.", hint: "ros2 param list /turtlesim",
        done: function (s) { return s.okLines.some(function (l) { return /^ros2 param list\s+\/turtlesim/.test(l); }); } },
      { text: "Read the current value of <code>background_r</code>.", hint: "ros2 param get /turtlesim background_r",
        done: function (s) { return s.okLines.some(function (l) { return /^ros2 param get\s+\/turtlesim\s+background_r/.test(l); }); } },
      { text: "Turn the background red: set <code>background_r</code> to 200 or more, <code>g</code> and <code>b</code> to 60 or less.", hint: "set background_r 255, background_g 0, background_b 0",
        done: function (s) { return s.bg[0] >= 200 && s.bg[1] <= 60 && s.bg[2] <= 60; } },
      { text: "Try a value that is too big (like 999) and read the error. Colours only go 0 to 255.", hint: "ros2 param set /turtlesim background_r 999",
        done: function (s) { return s.sawError ? s.sawError(/range/) : false; } }
    ]
  }
];

// ----- Python practicals (real Python runs in the page, see content/pyworker.js) -----
// Helpers: the runs of one file, in order.
(function () {
  function runs(s, f) { return s.pyRuns.filter(function (r) { return r.kind === "file" && r.name.split("/").pop() === f; }); }
  function sawOut(s, f, rx) { return runs(s, f).some(function (r) { return r.ok && rx.test(r.out); }); }
  function repl(s, rx) { return s.replInputs.some(function (r) { return rx.test(r.line); }); }
  var DIR = "/home/student/python_practice";
  var EDIT = "Type  nano NAME  to open the editor, change the file, then tap  Save and run.";

  window.PRACTICALS = window.PRACTICALS.concat([
    {
      id: "py_first", lesson: "1.1", title: "Your first Python", xp: 25, cwd: DIR, dirs: ["python_practice"],
      intro: "This runs real Python. Type <code>python3</code> to open the Python prompt (<code>&gt;&gt;&gt;</code>), then make and run a file. The first time it downloads Python (about 10 MB).",
      chips: ["python3", "2 + 3", "\"robot\" * 3", "exit()", "nano hello.py", "python3 hello.py", "ls", "cat hello.py"],
      tasks: [
        { text: "Open Python with <code>python3</code> and work out <code>2 + 3</code>.", hint: "python3   then   2 + 3",
          done: function (s) { return s.replInputs.some(function (r) { return /^\s*2\s*\+\s*3\s*$/.test(r.line) && /(^|\n)5\s*$/.test(r.out); }); } },
        { text: "Repeat a word: type <code>\"robot\" * 3</code>.", hint: "\"robot\" * 3",
          done: function (s) { return s.replInputs.some(function (r) { return /\*/.test(r.line) && /["']/.test(r.line) && r.ok && r.out.length > 3; }); } },
        { text: "Leave Python with <code>exit()</code>.", hint: "exit()   (or the Ctrl+D button)",
          done: function (s) { return repl(s, /^\s*(exit|quit)\(\)\s*$/); } },
        { text: "Create <code>hello.py</code> with a <code>print(...)</code> line using <code>nano hello.py</code>, then run it with <code>python3 hello.py</code>.", hint: "nano hello.py  -> type:  print(\"Hello, ROS 2!\")  -> Save and run",
          done: function (s) { return runs(s, "hello.py").some(function (r) { return r.ok && /print\(/.test(r.src) && r.out.length > 0; }); } },
        { text: "Change <code>hello.py</code> to print your own name and run it again.", hint: "nano hello.py, change the text inside the quotes, Save and run.",
          done: function (s) { var r = runs(s, "hello.py").filter(function (x) { return x.ok; }); return r.length >= 2 && r[r.length - 1].out !== r[0].out; } }
      ]
    },
    {
      id: "py_vars", lesson: "1.2", title: "Variables and types", xp: 20, cwd: DIR, files: {"python_practice/variables.py": "name = \"turtle1\"\nspeed = 1.5\nsteps = 4\nmoving = True\nprint(name, type(name))\nprint(speed, type(speed))\nprint(steps, type(steps))\nprint(moving, type(moving))\ndistance = speed * steps\nprint(f\"{name} travels {distance} metres\")"},
      intro: "<code>variables.py</code> is already here. Run it, then change it.",
      chips: ["python3 variables.py", "nano variables.py", "cat variables.py", "python3", "type(3.5)"],
      tasks: [
        { text: "Run <code>variables.py</code> and read the types it prints.", hint: "python3 variables.py",
          done: function (s) { return sawOut(s, "variables.py", /turtle1 travels 6\.0 metres/); } },
        { text: "Add <code>battery = 90</code> and print it with an f-string like <code>f\"Battery at {battery} percent\"</code>.", hint: EDIT + " Add the two lines at the bottom.",
          done: function (s) { return runs(s, "variables.py").some(function (r) { return r.ok && /battery\s*=\s*90/.test(r.src) && /Battery.*90/i.test(r.out); }); } },
        { text: "In the Python prompt, ask for the type of <code>3.5</code> with <code>type(3.5)</code>.", hint: "python3   then   type(3.5)",
          done: function (s) { return s.replInputs.some(function (r) { return /type\(/.test(r.line) && /<class 'float'>/.test(r.out); }); } }
      ]
    },
    {
      id: "py_if", lesson: "1.3", title: "Making decisions", xp: 20, cwd: DIR, files: {"python_practice/decide.py": "battery = 35\nif battery > 80:\n    print(\"Plenty of charge\")\nelif battery > 20:\n    print(\"Okay, keep an eye on it\")\nelse:\n    print(\"Return to charger\")\n\nspeed = 0.5\nobstacle = False\nif speed > 0 and not obstacle:\n    print(\"Driving\")"},
      intro: "<code>decide.py</code> picks a message from the battery level. Change the number and watch the answer change.",
      chips: ["python3 decide.py", "nano decide.py", "cat decide.py"],
      tasks: [
        { text: "Run <code>decide.py</code> (battery is 35).", hint: "python3 decide.py",
          done: function (s) { return sawOut(s, "decide.py", /Okay, keep an eye on it/); } },
        { text: "Change <code>battery</code> to <b>90</b> and run it. Which message appears?", hint: EDIT,
          done: function (s) { return sawOut(s, "decide.py", /Plenty of charge/); } },
        { text: "Change <code>battery</code> to <b>10</b> and run it again.", hint: EDIT,
          done: function (s) { return sawOut(s, "decide.py", /Return to charger/); } }
      ]
    },
    {
      id: "py_loops", lesson: "1.4", title: "Loops", xp: 20, cwd: DIR, files: {"python_practice/loops.py": "for i in range(3):\n    print(\"step\", i)\n\ncount = 0\nwhile count < 3:\n    print(\"count is\", count)\n    count += 1"},
      intro: "<code>loops.py</code> has a <code>for</code> loop and a <code>while</code> loop.",
      chips: ["python3 loops.py", "nano loops.py", "cat loops.py"],
      tasks: [
        { text: "Run <code>loops.py</code>.", hint: "python3 loops.py",
          done: function (s) { return sawOut(s, "loops.py", /count is 2/); } },
        { text: "Change <code>range(3)</code> to <code>range(5)</code> so it prints up to <code>step 4</code>.", hint: EDIT,
          done: function (s) { return sawOut(s, "loops.py", /step 4/); } },
        { text: "Change the <code>while</code> loop so it counts up to <code>count is 9</code>.", hint: "Change  count < 3  to  count < 10.",
          done: function (s) { return sawOut(s, "loops.py", /count is 9/); } }
      ]
    },
    {
      id: "py_funcs", lesson: "1.5", title: "Functions", xp: 20, cwd: DIR, files: {"python_practice/funcs.py": "def drive(distance, speed=1.0):\n    time_needed = distance / speed\n    return time_needed\n\nprint(drive(10))\nprint(drive(10, speed=2.5))"},
      intro: "<code>funcs.py</code> has a function called <code>drive</code>. Write one of your own.",
      chips: ["python3 funcs.py", "nano funcs.py", "cat funcs.py"],
      tasks: [
        { text: "Run <code>funcs.py</code>.", hint: "python3 funcs.py",
          done: function (s) { return sawOut(s, "funcs.py", /10\.0/); } },
        { text: "Add a function <code>double(x)</code> that returns <code>x * 2</code>, and print <code>double(21)</code>. It should print 42.", hint: "def double(x):\n    return x * 2\n\nprint(double(21))",
          done: function (s) { return runs(s, "funcs.py").some(function (r) { return r.ok && /def\s+double/.test(r.src) && /(^|\n)42\s*($|\n)/.test(r.out); }); } }
      ]
    },
    {
      id: "py_lists", lesson: "1.6", title: "Lists and dictionaries", xp: 20, cwd: DIR, files: {"python_practice/collections_demo.py": "waypoints = [\"door\", \"desk\", \"window\"]\nwaypoints.append(\"charger\")\nprint(waypoints[0], len(waypoints))\nfor w in waypoints:\n    print(\"go to\", w)\n\nrobot = {\"name\": \"turtle1\", \"speed\": 1.5}\nrobot[\"speed\"] = 2.0\nrobot[\"battery\"] = 90\nprint(robot[\"name\"], robot)"},
      intro: "<code>collections_demo.py</code> uses a list of waypoints and a dictionary for a robot.",
      chips: ["python3 collections_demo.py", "nano collections_demo.py", "cat collections_demo.py"],
      tasks: [
        { text: "Run <code>collections_demo.py</code>.", hint: "python3 collections_demo.py",
          done: function (s) { return sawOut(s, "collections_demo.py", /turtle1/); } },
        { text: "Add a fifth waypoint with <code>append</code>, so five <code>go to</code> lines print.", hint: "waypoints.append(\"garden\")   (put it before the for loop)",
          done: function (s) { return runs(s, "collections_demo.py").some(function (r) { return r.ok && (r.out.match(/go to/g) || []).length >= 5; }); } },
        { text: "Add a <code>\"color\"</code> key to the dictionary and print it.", hint: "robot[\"color\"] = \"green\"  then  print(robot[\"color\"])",
          done: function (s) { return runs(s, "collections_demo.py").some(function (r) { return r.ok && /\[\s*["']color["']\s*\]\s*=/.test(r.src) && /color/i.test(r.src.split("\n").filter(function (l) { return /print/.test(l); }).join("\n")); }); } }
      ]
    },
    {
      id: "py_classes", lesson: "1.7", title: "Classes and objects", xp: 25, cwd: DIR, files: {"python_practice/robot.py": "class Robot:\n    def __init__(self, name):\n        self.name = name\n        self.position = 0\n\n    def move(self, distance):\n        self.position += distance\n        print(f\"{self.name} is now at {self.position}\")\n\n\nclass FastRobot(Robot):\n    def __init__(self, name):\n        super().__init__(name)\n        self.boost = 2\n\n    def move(self, distance):\n        super().move(distance * self.boost)\n\n\nr = Robot(\"turtle1\")\nr.move(2)\nr.move(3)\nf = FastRobot(\"zoom\")\nf.move(3)"},
      intro: "<code>robot.py</code> has a <code>Robot</code> class and a faster child class.",
      chips: ["python3 robot.py", "nano robot.py", "cat robot.py"],
      tasks: [
        { text: "Run <code>robot.py</code> and compare how far <code>Robot</code> and <code>FastRobot</code> move.", hint: "python3 robot.py",
          done: function (s) { return sawOut(s, "robot.py", /zoom is now at 6/); } },
        { text: "Add a <code>say_hello</code> method to <code>Robot</code> that prints <code>Hi, I am</code> and the name, then call it on <code>r</code>.", hint: "Inside class Robot add:\n    def say_hello(self):\n        print(\"Hi, I am\", self.name)\nand at the bottom:  r.say_hello()",
          done: function (s) { return runs(s, "robot.py").some(function (r) { return r.ok && /def\s+say_hello/.test(r.src) && /Hi, I am\s*turtle1/.test(r.out); }); } },
        { text: "Make <code>FastRobot</code> say hello too, using the method it inherited.", hint: "f.say_hello()",
          done: function (s) { return runs(s, "robot.py").some(function (r) { return r.ok && /Hi, I am\s*zoom/.test(r.out); }); } }
      ]
    },
    {
      id: "py_errors", lesson: "1.8", title: "Imports and errors", xp: 25, cwd: DIR, files: {"python_practice/errors.py": "import math\n\nprint(math.sqrt(16))\n\ntry:\n    number = int(\"abc\")\nexcept ValueError:\n    print(\"That is not a number\")\n\n\ndef main():\n    print(\"running main\")\n\n\nif __name__ == \"__main__\":\n    main()"},
      intro: "<code>errors.py</code> imports <code>math</code> and catches an error. In this terminal <code>rclpy</code> is only pretend, so check the real one in your own Ubuntu window.",
      chips: ["python3 errors.py", "nano errors.py", "python3 -c \"print(1/0)\"", "python3 -c \"print(1 + 1)\"", "cat errors.py"],
      tasks: [
        { text: "Run <code>errors.py</code>.", hint: "python3 errors.py",
          done: function (s) { return sawOut(s, "errors.py", /running main/); } },
        { text: "Make Python fail on purpose: run <code>python3 -c \"print(1/0)\"</code> and read the <code>ZeroDivisionError</code>.", hint: "python3 -c \"print(1/0)\"",
          done: function (s) { return s.sawError(/ZeroDivisionError/); } },
        { text: "Add a <code>try</code>/<code>except ZeroDivisionError</code> around <code>10 / 0</code> that prints <code>Cannot divide by zero</code>.", hint: "try:\n    print(10 / 0)\nexcept ZeroDivisionError:\n    print(\"Cannot divide by zero\")",
          done: function (s) { return sawOut(s, "errors.py", /Cannot divide by zero/); } }
      ]
    }
  ]);
})();

// ----- Module 3 practicals: workspaces and packages (pretend colcon, ros2 pkg create, sourcing) -----
(function () {
  var HOME = "/home/student", WS = HOME + "/ros2_ws";
  function ok(s, rx) { return s.okLines.some(function (l) { return rx.test(l); }); }
  var ENTRY = "            'circle_publisher = turtle_tools.circle_publisher:main',\n            'pose_listener = turtle_tools.pose_listener:main',\n            'wall_avoider = turtle_tools.wall_avoider:main',";

  window.PRACTICALS = window.PRACTICALS.concat([
    {
      id: "ws_build", lesson: "3.1", title: "Your first workspace", xp: 25,
      intro: "A workspace is just a folder where ROS builds your code. Make one, build it (it is empty, that is fine) and see what colcon creates.",
      chips: ["mkdir -p ~/ros2_ws/src", "cd ~/ros2_ws", "colcon build", "ls", "ls install", "source ~/ros2_ws/install/setup.bash", "echo \"source ~/ros2_ws/install/setup.bash\" >> ~/.bashrc", "tail -n 2 ~/.bashrc"],
      tasks: [
        { text: "Make the workspace folders <code>~/ros2_ws/src</code> in one go.", hint: "mkdir -p ~/ros2_ws/src",
          done: function (s) { return s.isDir(WS + "/src"); } },
        { text: "Go into <code>~/ros2_ws</code> and run <code>colcon build</code>.", hint: "cd ~/ros2_ws   then   colcon build",
          done: function (s) { return s.exists(WS + "/install/setup.bash"); } },
        { text: "List the folder with <code>ls</code>: you should see <code>build install log src</code>.", hint: "ls",
          done: function (s) { return s.exists(WS + "/build") && ok(s, /^ls\s*$/); } },
        { text: "Activate the workspace in this terminal with <code>source</code>.", hint: "source ~/ros2_ws/install/setup.bash",
          done: function (s) { return ok(s, /^source\s+\S*install\/(local_)?setup\.(bash|sh)/); } },
        { text: "Make it automatic for every new terminal: add that <code>source</code> line to <code>~/.bashrc</code>.", hint: "echo \"source ~/ros2_ws/install/setup.bash\" >> ~/.bashrc",
          done: function (s) { return /ros2_ws\/install\/setup\.bash/.test(s.fileText(HOME + "/.bashrc") || ""); } }
      ]
    },
    {
      id: "ws_pkg", lesson: "3.2", title: "Your first package", xp: 25,
      intro: "The workspace already exists. Create a Python package inside <code>src</code>, describe it, build it, and make ROS able to see it.",
      start: ["mkdir -p ~/ros2_ws/src", "cd ~/ros2_ws", "colcon build", "cd src"],
      chips: ["ros2 pkg create --build-type ament_python --license MIT turtle_tools --dependencies rclpy geometry_msgs turtlesim", "find turtle_tools -type f | sort", "nano turtle_tools/package.xml", "cat turtle_tools/package.xml", "cd ~/ros2_ws", "colcon build --packages-select turtle_tools", "source install/setup.bash", "ros2 pkg list | grep turtle_tools"],
      tasks: [
        { text: "Create the package <code>turtle_tools</code> (build type <code>ament_python</code>) with <code>ros2 pkg create</code>.", hint: "ros2 pkg create --build-type ament_python --license MIT turtle_tools --dependencies rclpy geometry_msgs turtlesim",
          done: function (s) { return /<build_type>ament_python/.test(s.fileText(WS + "/src/turtle_tools/package.xml") || ""); } },
        { text: "Look at what was generated with <code>find turtle_tools -type f | sort</code>.", hint: "find turtle_tools -type f | sort",
          done: function (s) { return ok(s, /^find\s+turtle_tools.*sort/); } },
        { text: "Replace the <code>TODO: Package description</code> in <code>package.xml</code> with a real description (use <code>nano</code>).", hint: "nano turtle_tools/package.xml  then change the text inside <description>...</description>, Save.",
          done: function (s) { var t = s.fileText(WS + "/src/turtle_tools/package.xml") || ""; return /<description>/.test(t) && !/TODO: Package description/.test(t); } },
        { text: "Go to <code>~/ros2_ws</code> and build only this package.", hint: "cd ~/ros2_ws   then   colcon build --packages-select turtle_tools",
          done: function (s) { return s.exists(WS + "/install/turtle_tools/share/turtle_tools/package.xml"); } },
        { text: "Source the workspace, then check ROS can see the package with <code>ros2 pkg list | grep turtle_tools</code>.", hint: "source install/setup.bash   then   ros2 pkg list | grep turtle_tools",
          done: function (s) { return s.sourcedPackages().indexOf("turtle_tools") >= 0 && ok(s, /^ros2 pkg list.*grep\s+turtle_tools/); } }
      ]
    },
    {
      id: "ws_nodes", lesson: "3.3", title: "Put your nodes in the package", xp: 30,
      intro: "Your three nodes are already copied into the package, but ROS cannot run them yet: <code>setup.py</code> does not list them. Add the entry points, rebuild, and run one.",
      start: ["mkdir -p ~/ros2_ws/src", "cd ~/ros2_ws/src", "ros2 pkg create --build-type ament_python --license MIT turtle_tools --dependencies rclpy geometry_msgs turtlesim"].concat(["cd ~/ros2_ws", "colcon build", "source install/setup.bash"]),
      filesAfter: {"/home/student/ros2_ws/src/turtle_tools/turtle_tools/circle_publisher.py": "import rclpy\nfrom rclpy.node import Node\nfrom geometry_msgs.msg import Twist\n\n\nclass CirclePublisher(Node):\n    def __init__(self):\n        super().__init__(\"circle_publisher\")\n        self.publisher = self.create_publisher(Twist, \"/turtle1/cmd_vel\", 10)\n        self.timer = self.create_timer(0.5, self.send_command)\n\n    def send_command(self):\n        msg = Twist()\n        msg.linear.x = 2.0\n        msg.angular.z = 1.0\n        self.publisher.publish(msg)\n        self.get_logger().info(\"Sent: forward 2.0, turn 1.0\")\n\n\ndef main():\n    rclpy.init()\n    node = CirclePublisher()\n    try:\n        rclpy.spin(node)\n    except KeyboardInterrupt:\n        pass\n    finally:\n        node.destroy_node()\n        if rclpy.ok():\n            rclpy.shutdown()\n\n\nif __name__ == \"__main__\":\n    main()", "/home/student/ros2_ws/src/turtle_tools/turtle_tools/pose_listener.py": "import rclpy\nfrom rclpy.node import Node\nfrom turtlesim.msg import Pose\n\n\nclass PoseListener(Node):\n    def __init__(self):\n        super().__init__(\"pose_listener\")\n        self.subscription = self.create_subscription(Pose, \"/turtle1/pose\", self.on_pose, 10)\n\n    def on_pose(self, msg):\n        self.get_logger().info(\n            f\"x={msg.x:.2f} y={msg.y:.2f} theta={msg.theta:.2f}\",\n            throttle_duration_sec=1.0,\n        )\n\n\ndef main():\n    rclpy.init()\n    node = PoseListener()\n    try:\n        rclpy.spin(node)\n    except KeyboardInterrupt:\n        pass\n    finally:\n        node.destroy_node()\n        if rclpy.ok():\n            rclpy.shutdown()\n\n\nif __name__ == \"__main__\":\n    main()", "/home/student/ros2_ws/src/turtle_tools/turtle_tools/wall_avoider.py": "import math\n\nimport rclpy\nfrom rclpy.node import Node\nfrom geometry_msgs.msg import Twist\nfrom turtlesim.msg import Pose\n\n\nclass WallAvoider(Node):\n    def __init__(self):\n        super().__init__(\"wall_avoider\")\n        self.publisher = self.create_publisher(Twist, \"/turtle1/cmd_vel\", 10)\n        self.subscription = self.create_subscription(Pose, \"/turtle1/pose\", self.on_pose, 10)\n        self.turning = False\n\n    def on_pose(self, msg):\n        # The point 1 metre in front of the turtle, in the direction it is facing\n        ahead_x = msg.x + math.cos(msg.theta)\n        ahead_y = msg.y + math.sin(msg.theta)\n        wall_ahead = not (0.5 < ahead_x < 10.5 and 0.5 < ahead_y < 10.5)\n\n        cmd = Twist()\n        if wall_ahead:\n            cmd.angular.z = 2.0\n        else:\n            cmd.linear.x = 2.0\n\n        if wall_ahead != self.turning:\n            self.turning = wall_ahead\n            self.get_logger().info(\"Wall ahead, turning\" if wall_ahead else \"Clear, driving straight\")\n\n        self.publisher.publish(cmd)\n\n\ndef main():\n    rclpy.init()\n    node = WallAvoider()\n    try:\n        rclpy.spin(node)\n    except KeyboardInterrupt:\n        pass\n    finally:\n        node.destroy_node()\n        if rclpy.ok():\n            rclpy.shutdown()\n\n\nif __name__ == \"__main__\":\n    main()"},
      chips: ["ros2 pkg executables turtle_tools", "nano src/turtle_tools/setup.py", "grep -n console_scripts -A4 src/turtle_tools/setup.py", "colcon build --packages-select turtle_tools --symlink-install", "source install/setup.bash", "ros2 run turtlesim turtlesim_node", "ros2 run turtle_tools wall_avoider", "ros2 node list"],
      tasks: [
        { text: "Check the executables now with <code>ros2 pkg executables turtle_tools</code>. It is empty: that is the problem.", hint: "ros2 pkg executables turtle_tools",
          done: function (s) { return ok(s, /^ros2 pkg executables\s+turtle_tools/); } },
        { text: "Open <code>src/turtle_tools/setup.py</code> in the editor and add three lines inside <code>console_scripts</code>, one per node.", hint: "nano src/turtle_tools/setup.py  and inside the empty console_scripts list add:\n" + ENTRY,
          done: function (s) { return s.packages(WS).some(function (p) { return p.name === "turtle_tools" && p.exes.length >= 3; }); } },
        { text: "Rebuild the package so the new executables are installed.", hint: "colcon build --packages-select turtle_tools --symlink-install",
          done: function (s) { return s.exists(WS + "/install/turtle_tools/lib/turtle_tools/wall_avoider"); } },
        { text: "Source the workspace again and list the executables. You should see three.", hint: "source install/setup.bash   then   ros2 pkg executables turtle_tools",
          done: function (s) { return ok(s, /^ros2 pkg executables\s+turtle_tools/) && s.exists(WS + "/install/turtle_tools/lib/turtle_tools/pose_listener") && ok(s, /^source\s+\S*setup\.bash/); } },
        { text: "Start <code>turtlesim_node</code>, then run <code>ros2 run turtle_tools wall_avoider</code>.", hint: "ros2 run turtlesim turtlesim_node   then   ros2 run turtle_tools wall_avoider",
          done: function (s) { return s.hasNode("/turtlesim") && s.hasNode("/wall_avoider"); } }
      ]
    },
    {
      id: "ws_params", lesson: "3.5", title: "Parameters in your own node", xp: 25,
      intro: "The package is built and sourced, and <code>wall_avoider</code> declares <code>speed</code> and <code>turn_speed</code>. Set them at start-up and while it runs.",
      start: ["mkdir -p ~/ros2_ws/src", "cd ~/ros2_ws/src", "ros2 pkg create --build-type ament_python --license MIT turtle_tools --dependencies rclpy geometry_msgs turtlesim"].concat(["cd ~/ros2_ws"]),
      filesAfter: {"/home/student/ros2_ws/src/turtle_tools/turtle_tools/circle_publisher.py": "import rclpy\nfrom rclpy.node import Node\nfrom geometry_msgs.msg import Twist\n\n\nclass CirclePublisher(Node):\n    def __init__(self):\n        super().__init__(\"circle_publisher\")\n        self.publisher = self.create_publisher(Twist, \"/turtle1/cmd_vel\", 10)\n        self.timer = self.create_timer(0.5, self.send_command)\n\n    def send_command(self):\n        msg = Twist()\n        msg.linear.x = 2.0\n        msg.angular.z = 1.0\n        self.publisher.publish(msg)\n        self.get_logger().info(\"Sent: forward 2.0, turn 1.0\")\n\n\ndef main():\n    rclpy.init()\n    node = CirclePublisher()\n    try:\n        rclpy.spin(node)\n    except KeyboardInterrupt:\n        pass\n    finally:\n        node.destroy_node()\n        if rclpy.ok():\n            rclpy.shutdown()\n\n\nif __name__ == \"__main__\":\n    main()", "/home/student/ros2_ws/src/turtle_tools/turtle_tools/pose_listener.py": "import rclpy\nfrom rclpy.node import Node\nfrom turtlesim.msg import Pose\n\n\nclass PoseListener(Node):\n    def __init__(self):\n        super().__init__(\"pose_listener\")\n        self.subscription = self.create_subscription(Pose, \"/turtle1/pose\", self.on_pose, 10)\n\n    def on_pose(self, msg):\n        self.get_logger().info(\n            f\"x={msg.x:.2f} y={msg.y:.2f} theta={msg.theta:.2f}\",\n            throttle_duration_sec=1.0,\n        )\n\n\ndef main():\n    rclpy.init()\n    node = PoseListener()\n    try:\n        rclpy.spin(node)\n    except KeyboardInterrupt:\n        pass\n    finally:\n        node.destroy_node()\n        if rclpy.ok():\n            rclpy.shutdown()\n\n\nif __name__ == \"__main__\":\n    main()", "/home/student/ros2_ws/src/turtle_tools/turtle_tools/wall_avoider.py": "import math\n\nimport rclpy\nfrom rclpy.node import Node\nfrom geometry_msgs.msg import Twist\nfrom turtlesim.msg import Pose\n\n\nclass WallAvoider(Node):\n    def __init__(self):\n        super().__init__(\"wall_avoider\")\n        self.declare_parameter(\"speed\", 2.0)\n        self.declare_parameter(\"turn_speed\", 2.0)\n        self.publisher = self.create_publisher(Twist, \"/turtle1/cmd_vel\", 10)\n        self.subscription = self.create_subscription(Pose, \"/turtle1/pose\", self.on_pose, 10)\n        self.turning = False\n\n    def on_pose(self, msg):\n        speed = self.get_parameter(\"speed\").value\n        turn_speed = self.get_parameter(\"turn_speed\").value\n\n        # The point 1 metre in front of the turtle, in the direction it is facing\n        ahead_x = msg.x + math.cos(msg.theta)\n        ahead_y = msg.y + math.sin(msg.theta)\n        wall_ahead = not (0.5 < ahead_x < 10.5 and 0.5 < ahead_y < 10.5)\n\n        cmd = Twist()\n        if wall_ahead:\n            cmd.angular.z = turn_speed\n        else:\n            cmd.linear.x = speed\n\n        if wall_ahead != self.turning:\n            self.turning = wall_ahead\n            self.get_logger().info(\"Wall ahead, turning\" if wall_ahead else \"Clear, driving straight\")\n\n        self.publisher.publish(cmd)\n\n\ndef main():\n    rclpy.init()\n    node = WallAvoider()\n    try:\n        rclpy.spin(node)\n    except KeyboardInterrupt:\n        pass\n    finally:\n        node.destroy_node()\n        if rclpy.ok():\n            rclpy.shutdown()\n\n\nif __name__ == \"__main__\":\n    main()\n", "/home/student/ros2_ws/src/turtle_tools/setup.py": "import os\nfrom glob import glob\n\nfrom setuptools import find_packages, setup\n\npackage_name = 'turtle_tools'\n\nsetup(\n    name=package_name,\n    version='0.0.1',\n    packages=find_packages(exclude=['test']),\n    data_files=[\n        ('share/ament_index/resource_index/packages',\n            ['resource/' + package_name]),\n        ('share/' + package_name, ['package.xml']),\n        (os.path.join('share', package_name, 'launch'), glob('launch/*.launch.py')),\n    ],\n    install_requires=['setuptools'],\n    zip_safe=True,\n    maintainer='ROS learner',\n    maintainer_email='you@example.com',\n    description='Tools for driving the turtle',\n    license='MIT',\n    extras_require={\n        'test': ['pytest'],\n    },\n    entry_points={\n        'console_scripts': [\n            'circle_publisher = turtle_tools.circle_publisher:main',\n            'pose_listener = turtle_tools.pose_listener:main',\n            'wall_avoider = turtle_tools.wall_avoider:main',\n        ],\n    },\n)\n"},
      finish: ["colcon build --packages-select turtle_tools --symlink-install", "source install/setup.bash"],
      chips: ["ros2 run turtlesim turtlesim_node", "ros2 run turtle_tools wall_avoider --ros-args -p speed:=3.0", "ros2 param list /wall_avoider", "ros2 param get /wall_avoider speed", "ros2 param set /wall_avoider speed 1.0", "ros2 param set /wall_avoider speed 1", "stop"],
      tasks: [
        { text: "Start the turtle window, then start <code>wall_avoider</code> with <code>speed</code> set to <b>3.0</b> on the command line.", hint: "ros2 run turtlesim turtlesim_node\nros2 run turtle_tools wall_avoider --ros-args -p speed:=3.0",
          done: function (s) { return s.hasNode("/turtlesim") && s.nodeParam("wall_avoider", "speed") === 3; } },
        { text: "List the parameters of <code>/wall_avoider</code>.", hint: "ros2 param list /wall_avoider",
          done: function (s) { return ok(s, /^ros2 param list\s+\/wall_avoider/); } },
        { text: "Read <code>speed</code> back.", hint: "ros2 param get /wall_avoider speed",
          done: function (s) { return ok(s, /^ros2 param get\s+\/wall_avoider\s+speed/); } },
        { text: "Change <code>speed</code> to <b>1.0</b> while the node is running.", hint: "ros2 param set /wall_avoider speed 1.0",
          done: function (s) { return s.nodeParam("wall_avoider", "speed") === 1 && ok(s, /^ros2 param set\s+\/wall_avoider\s+speed\s+1\.0/); } },
        { text: "Try setting it to a whole number, <code>1</code>, and read the error: <code>speed</code> is a decimal (double).", hint: "ros2 param set /wall_avoider speed 1",
          done: function (s) { return s.sawError(/is of type \{double\}/); } }
      ]
    },
    {
      id: "ws_trouble", lesson: "3.7", title: "When things go wrong", xp: 30,
      intro: "The package is built, but this is a fresh terminal where nothing has been sourced. Meet the two most common errors and fix them.",
      start: ["mkdir -p ~/ros2_ws/src", "cd ~/ros2_ws/src", "ros2 pkg create --build-type ament_python --license MIT turtle_tools --dependencies rclpy geometry_msgs turtlesim"].concat(["cd ~/ros2_ws"]),
      filesAfter: {"/home/student/ros2_ws/src/turtle_tools/turtle_tools/circle_publisher.py": "import rclpy\nfrom rclpy.node import Node\nfrom geometry_msgs.msg import Twist\n\n\nclass CirclePublisher(Node):\n    def __init__(self):\n        super().__init__(\"circle_publisher\")\n        self.publisher = self.create_publisher(Twist, \"/turtle1/cmd_vel\", 10)\n        self.timer = self.create_timer(0.5, self.send_command)\n\n    def send_command(self):\n        msg = Twist()\n        msg.linear.x = 2.0\n        msg.angular.z = 1.0\n        self.publisher.publish(msg)\n        self.get_logger().info(\"Sent: forward 2.0, turn 1.0\")\n\n\ndef main():\n    rclpy.init()\n    node = CirclePublisher()\n    try:\n        rclpy.spin(node)\n    except KeyboardInterrupt:\n        pass\n    finally:\n        node.destroy_node()\n        if rclpy.ok():\n            rclpy.shutdown()\n\n\nif __name__ == \"__main__\":\n    main()", "/home/student/ros2_ws/src/turtle_tools/turtle_tools/pose_listener.py": "import rclpy\nfrom rclpy.node import Node\nfrom turtlesim.msg import Pose\n\n\nclass PoseListener(Node):\n    def __init__(self):\n        super().__init__(\"pose_listener\")\n        self.subscription = self.create_subscription(Pose, \"/turtle1/pose\", self.on_pose, 10)\n\n    def on_pose(self, msg):\n        self.get_logger().info(\n            f\"x={msg.x:.2f} y={msg.y:.2f} theta={msg.theta:.2f}\",\n            throttle_duration_sec=1.0,\n        )\n\n\ndef main():\n    rclpy.init()\n    node = PoseListener()\n    try:\n        rclpy.spin(node)\n    except KeyboardInterrupt:\n        pass\n    finally:\n        node.destroy_node()\n        if rclpy.ok():\n            rclpy.shutdown()\n\n\nif __name__ == \"__main__\":\n    main()", "/home/student/ros2_ws/src/turtle_tools/turtle_tools/wall_avoider.py": "import math\n\nimport rclpy\nfrom rclpy.node import Node\nfrom geometry_msgs.msg import Twist\nfrom turtlesim.msg import Pose\n\n\nclass WallAvoider(Node):\n    def __init__(self):\n        super().__init__(\"wall_avoider\")\n        self.declare_parameter(\"speed\", 2.0)\n        self.declare_parameter(\"turn_speed\", 2.0)\n        self.publisher = self.create_publisher(Twist, \"/turtle1/cmd_vel\", 10)\n        self.subscription = self.create_subscription(Pose, \"/turtle1/pose\", self.on_pose, 10)\n        self.turning = False\n\n    def on_pose(self, msg):\n        speed = self.get_parameter(\"speed\").value\n        turn_speed = self.get_parameter(\"turn_speed\").value\n\n        # The point 1 metre in front of the turtle, in the direction it is facing\n        ahead_x = msg.x + math.cos(msg.theta)\n        ahead_y = msg.y + math.sin(msg.theta)\n        wall_ahead = not (0.5 < ahead_x < 10.5 and 0.5 < ahead_y < 10.5)\n\n        cmd = Twist()\n        if wall_ahead:\n            cmd.angular.z = turn_speed\n        else:\n            cmd.linear.x = speed\n\n        if wall_ahead != self.turning:\n            self.turning = wall_ahead\n            self.get_logger().info(\"Wall ahead, turning\" if wall_ahead else \"Clear, driving straight\")\n\n        self.publisher.publish(cmd)\n\n\ndef main():\n    rclpy.init()\n    node = WallAvoider()\n    try:\n        rclpy.spin(node)\n    except KeyboardInterrupt:\n        pass\n    finally:\n        node.destroy_node()\n        if rclpy.ok():\n            rclpy.shutdown()\n\n\nif __name__ == \"__main__\":\n    main()\n", "/home/student/ros2_ws/src/turtle_tools/setup.py": "import os\nfrom glob import glob\n\nfrom setuptools import find_packages, setup\n\npackage_name = 'turtle_tools'\n\nsetup(\n    name=package_name,\n    version='0.0.1',\n    packages=find_packages(exclude=['test']),\n    data_files=[\n        ('share/ament_index/resource_index/packages',\n            ['resource/' + package_name]),\n        ('share/' + package_name, ['package.xml']),\n        (os.path.join('share', package_name, 'launch'), glob('launch/*.launch.py')),\n    ],\n    install_requires=['setuptools'],\n    zip_safe=True,\n    maintainer='ROS learner',\n    maintainer_email='you@example.com',\n    description='Tools for driving the turtle',\n    license='MIT',\n    extras_require={\n        'test': ['pytest'],\n    },\n    entry_points={\n        'console_scripts': [\n            'circle_publisher = turtle_tools.circle_publisher:main',\n            'pose_listener = turtle_tools.pose_listener:main',\n            'wall_avoider = turtle_tools.wall_avoider:main',\n        ],\n    },\n)\n"},
      finish: ["colcon build --packages-select turtle_tools --symlink-install"],
      chips: ["ros2 run turtle_tools wall_avoider", "source install/setup.bash", "ros2 run turtle_tools wall_avoiderr", "ros2 pkg prefix turtle_tools", "ros2 pkg executables turtle_tools", "rm -rf build install log", "colcon build --symlink-install", "ls"],
      tasks: [
        { text: "Run <code>ros2 run turtle_tools wall_avoider</code> and read the error. ROS does not know the package yet.", hint: "ros2 run turtle_tools wall_avoider",
          done: function (s) { return s.sawError(/Package 'turtle_tools' not found/); } },
        { text: "Fix it: source the workspace.", hint: "source install/setup.bash",
          done: function (s) { return s.sourcedPackages().indexOf("turtle_tools") >= 0; } },
        { text: "Run <code>wall_avoider</code> again. It starts this time.", hint: "ros2 run turtle_tools wall_avoider",
          done: function (s) { return s.hasNode("/wall_avoider"); } },
        { text: "Make a typo on purpose: <code>wall_avoiderr</code>. Read the different error.", hint: "ros2 run turtle_tools wall_avoiderr",
          done: function (s) { return s.sawError(/No executable found/); } },
        { text: "Ask where ROS found the package: <code>ros2 pkg prefix turtle_tools</code>.", hint: "ros2 pkg prefix turtle_tools",
          done: function (s) { return ok(s, /^ros2 pkg prefix\s+turtle_tools/); } },
        { text: "Last resort: delete <code>build install log</code> and rebuild everything.", hint: "rm -rf build install log   then   colcon build --symlink-install",
          done: function (s) { return ok(s, /^rm\s+-rf\s+build\s+install\s+log/) && s.exists(WS + "/install/setup.bash") && s.exists(WS + "/install/turtle_tools/lib/turtle_tools/wall_avoider"); } }
      ]
    }
  ]);
})();
