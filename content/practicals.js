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
        done: function (s) { return s.cwd() === "/home/daniel/practice"; } },
      { text: "Create a file <code>b.txt</code> that contains the words <code>hello linux</code>.", hint: "echo \"hello linux\" > b.txt",
        done: function (s) { return /hello linux/.test(s.fileText("/home/daniel/practice/b.txt") || ""); } },
      { text: "Copy <code>b.txt</code> to <code>c.txt</code>, then rename <code>c.txt</code> to <code>notes.txt</code>.", hint: "cp b.txt c.txt  then  mv c.txt notes.txt",
        done: function (s) { return s.exists("/home/daniel/practice/notes.txt") && s.exists("/home/daniel/practice/b.txt") && !s.exists("/home/daniel/practice/c.txt"); } },
      { text: "Make an empty file <code>a.txt</code>, check it with <code>ls</code>, then delete it.", hint: "touch a.txt, ls, rm a.txt",
        done: function (s) { return !s.exists("/home/daniel/practice/a.txt") && s.okLines.some(function (l) { return /^touch\s+a\.txt/.test(l); }) && s.okLines.some(function (l) { return /^rm\s+a\.txt/.test(l); }); } }
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
