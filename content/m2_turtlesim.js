window.MODULES = window.MODULES || [];
window.MODULES.push({
  order: 2,
  title: "2 · ROS 2 first steps (turtlesim)",
  lessons: [
    {
      id: "2.1", title: "Run your first simulation", minutes: 15,
      blocks: [
        ["p", "<b>turtlesim</b> is a tiny simulator that ships with ROS 2: a turtle in a blue window that you can drive around. It is the standard first project because you can see everything you do."],
        ["p", "ROS 2 programs each need their own terminal. You will now use <b>two</b>. In Windows Terminal, open a second tab with <b>Ctrl+Shift+T</b> (or open another Ubuntu window from the Start menu)."],
        ["h", "Terminal 1: the simulator"],
        ["cmd", "ros2 run turtlesim turtlesim_node"],
        ["p", "A blue window appears with a turtle in the middle (its picture is random each time). The terminal prints:"],
        ["out", "[INFO] [...] [turtlesim]: Starting turtlesim with node name /turtlesim\n[INFO] [...] [turtlesim]: Spawning turtle [turtle1] at x=[5.544445], y=[5.544445], theta=[0.000000]"],
        ["p", "Read the command: <code>ros2 run &lt;package&gt; &lt;program&gt;</code>. The package is <code>turtlesim</code> and the program is <code>turtlesim_node</code>."],
        ["h", "Terminal 2: the keyboard controller"],
        ["cmd", "ros2 run turtlesim turtle_teleop_key", "Ubuntu terminal 2"],
        ["out", "Reading from keyboard\n---------------------------\nUse arrow keys to move the turtle.\nUse G|B|V|C|D|E|R|T keys to rotate to absolute orientations. 'F' to cancel a rotation.\n'Q' to quit."],
        ["p", "<b>Click on terminal 2</b> so it has focus, then press the arrow keys. The turtle moves and leaves a line. The keys only work while that terminal is selected, because it is reading your keyboard."],
        ["note", "Two separate programs are cooperating: one draws the turtle, the other reads your keys. Neither knows how the other works. How they talk to each other is what the rest of this module is about."],
        ["warn", "Close both with <b>Ctrl+C</b> in each terminal when you are done. If a window ever refuses to start with a strange error, check that an older turtlesim is not still running."],
        ["try", "Drive the turtle in a rough square. Then try <b>R</b>, <b>T</b> and <b>F</b> and see how the turtle rotates."],
        ["quiz", {
          q: "You press arrow keys but the turtle does not move. What is the most likely cause?",
          options: [
            "Terminal 2 does not have focus",
            "Ubuntu is out of date",
            "The turtle is asleep",
            "You need to restart Windows"
          ],
          answer: 0,
          why: "The teleop program reads keys from its own terminal, so that terminal must be the selected window."
        }]
      ]
    },
    {
      id: "2.2", title: "Nodes", minutes: 20,
      blocks: [
        ["p", "Each running ROS 2 program is called a <b>node</b>: a small worker with one job. A robot is built from many nodes, one for the camera, one for the wheels, one for planning. Keeping them separate makes each easy to understand, replace and reuse."],
        ["p", "Start turtlesim again in terminal 1 and the teleop in terminal 2 (as in lesson 2.1). Then open a <b>third terminal</b> for the commands below."],
        ["cmd", "ros2 node list", "Ubuntu terminal 3"],
        ["out", "/teleop_turtle\n/turtlesim"],
        ["p", "Two programs running, two nodes. The names start with <code>/</code>. Now ask one node about itself:"],
        ["cmd", "ros2 node info /turtlesim"],
        ["out", "/turtlesim\n  Subscribers:\n    /parameter_events: rcl_interfaces/msg/ParameterEvent\n    /turtle1/cmd_vel: geometry_msgs/msg/Twist\n  Publishers:\n    /parameter_events: rcl_interfaces/msg/ParameterEvent\n    /rosout: rcl_interfaces/msg/Log\n    /turtle1/color_sensor: turtlesim/msg/Color\n    /turtle1/pose: turtlesim/msg/Pose\n  Service Servers:\n    /clear: std_srvs/srv/Empty\n    /kill: turtlesim/srv/Kill\n    /reset: std_srvs/srv/Empty\n    /spawn: turtlesim/srv/Spawn\n    ...\n  Action Servers:\n    /turtle1/rotate_absolute: turtlesim/action/RotateAbsolute"],
        ["p", "This is a map of what the node does. The output has three kinds of things you will learn in the next lessons:"],
        ["ul", [
          "<b>Subscribers and Publishers</b>: channels where it receives and sends messages (<b>topics</b>, lesson 2.3).",
          "<b>Service Servers</b>: questions it can answer (<b>services</b>, lesson 2.4).",
          "<b>Action Servers</b>: longer tasks it can perform (covered later)."
        ]],
        ["p", "Notice that <code>/turtlesim</code> subscribes to <code>/turtle1/cmd_vel</code>. That is where the keyboard node sends its drive commands."],
        ["h", "See the whole picture"],
        ["cmd", "rqt_graph"],
        ["p", "<b>rqt_graph</b> opens a window that draws your nodes as ovals and the topics between them as arrows. Click the refresh button (circular arrow) if it looks empty. You should see <code>/teleop_turtle</code> connected to <code>/turtlesim</code> through <code>/turtle1/cmd_vel</code>. Close it when you are done."],
        ["note", "When you stop a node, it can stay in <code>ros2 node list</code> for a few seconds before ROS 2 notices it has gone. If a stopped node still shows up, wait a moment and run the command again."],
        ["try", "Run <code>ros2 node list</code>, stop the teleop with Ctrl+C, wait a few seconds, then run it again. What changed?"],
        ["quiz", {
          q: "What is a ROS 2 <b>node</b>?",
          options: [
            "A cable between two computers",
            "A single running program with one job, such as a camera driver or a controller",
            "A type of robot",
            "A Python file that has not been run yet"
          ],
          answer: 1,
          why: "A node is a running program. A robot system is many nodes working together."
        }]
      ]
    },
    {
      id: "2.3", title: "Topics", minutes: 25,
      blocks: [
        ["p", "<b>Topics</b> are how nodes send each other a continuous stream of data. Think of a radio channel: a node <b>publishes</b> messages to a named topic, and any node interested <b>subscribes</b> to listen. The publisher does not know or care who is listening."],
        ["p", "Keep turtlesim running in terminal 1. Use terminal 2 or 3 for these commands."],
        ["cmd", "ros2 topic list -t"],
        ["out", "/parameter_events [rcl_interfaces/msg/ParameterEvent]\n/rosout [rcl_interfaces/msg/Log]\n/turtle1/cmd_vel [geometry_msgs/msg/Twist]\n/turtle1/color_sensor [turtlesim/msg/Color]\n/turtle1/pose [turtlesim/msg/Pose]"],
        ["p", "Each line is a topic name, then in brackets its <b>message type</b>, the shape of the data it carries. Two matter here:"],
        ["ul", [
          "<code>/turtle1/cmd_vel</code>: <i>commands to the turtle</i> (type <code>Twist</code>).",
          "<code>/turtle1/pose</code>: <i>where the turtle is</i> (type <code>Pose</code>)."
        ]],
        ["cmd", "ros2 topic info /turtle1/cmd_vel"],
        ["out", "Type: geometry_msgs/msg/Twist\nPublisher count: 0\nSubscription count: 1"],
        ["p", "With only turtlesim running, nobody is publishing commands yet: zero publishers, one subscriber (turtlesim itself). Start the teleop node and run it again to see the publisher count become 1."],
        ["h", "What is inside a message?"],
        ["cmd", "ros2 interface show geometry_msgs/msg/Twist"],
        ["out", "Vector3  linear\n\tfloat64 x\n\tfloat64 y\n\tfloat64 z\nVector3  angular\n\tfloat64 x\n\tfloat64 y\n\tfloat64 z"],
        ["p", "A <code>Twist</code> is a velocity: <b>linear</b> speed in metres per second along x, y and z, and <b>angular</b> speed in radians per second around each axis. For a turtle on a flat floor only two matter: <code>linear.x</code> (forward) and <code>angular.z</code> (turning). Remember these, you will use them in your own code."],
        ["h", "Listen to a topic"],
        ["cmd", "ros2 topic echo /turtle1/pose --once"],
        ["out", "x: 5.544444561004639\ny: 5.544444561004639\ntheta: 0.0\nlinear_velocity: 0.0\nangular_velocity: 0.0\n---"],
        ["p", "<code>echo</code> subscribes to the topic and prints what arrives. <code>--once</code> prints a single message and stops. Without it, you get a live stream: try it, drive the turtle with the keys, and watch the numbers change. Stop with Ctrl+C."],
        ["cmd", "ros2 topic hz /turtle1/pose"],
        ["out", "average rate: 62.519\n\tmin: 0.015s max: 0.017s std dev: 0.00048s window: 64"],
        ["p", "<code>hz</code> measures how often messages arrive: turtlesim publishes its pose about 62 times per second."],
        ["h", "Be the publisher"],
        ["p", "You can publish from the command line too, with no keyboard node at all:"],
        ["cmd", "ros2 topic pub --once /turtle1/cmd_vel geometry_msgs/msg/Twist \"{linear: {x: 2.0}, angular: {z: 1.8}}\""],
        ["out", "publisher: beginning loop\npublishing #1: geometry_msgs.msg.Twist(linear=geometry_msgs.msg.Vector3(x=2.0, y=0.0, z=0.0), angular=geometry_msgs.msg.Vector3(x=0.0, y=0.0, z=1.8))"],
        ["p", "The turtle moves forward while turning, then stops. The text in braces is <b>YAML</b>, a simple way to write the message fields. Anything you leave out defaults to zero."],
        ["note", "Turtlesim stops the turtle if commands stop arriving for about a second. To keep it moving, publish repeatedly: replace <code>--once</code> with <code>--rate 1</code> (once per second) and stop with Ctrl+C."],
        ["try", "Publish a <code>Twist</code> with only <code>linear: {x: 3.0}</code>, then one with only <code>angular: {z: 3.0}</code>. Describe what each does."],
        ["quiz", {
          q: "You want to make the turtle move forward. Which part of the <code>Twist</code> do you set?",
          options: ["angular.z", "linear.x", "linear.z", "angular.x"],
          answer: 1,
          why: "<code>linear.x</code> is forward speed. <code>angular.z</code> is how fast it turns."
        }]
      ]
    },
    {
      id: "2.4", title: "Services", minutes: 20,
      blocks: [
        ["p", "Topics are a stream. A <b>service</b> is a one-off <b>question and answer</b>: a node sends a <b>request</b> and waits for a <b>response</b>. Use it for things you do occasionally, like &quot;add a turtle&quot; or &quot;clear the screen&quot;, rather than constant data."],
        ["cmd", "ros2 service list"],
        ["out", "/clear\n/kill\n/reset\n/spawn\n/turtle1/set_pen\n/turtle1/teleport_absolute\n/turtle1/teleport_relative\n/turtlesim/describe_parameters\n..."],
        ["cmd", "ros2 service type /spawn"],
        ["out", "turtlesim/srv/Spawn"],
        ["cmd", "ros2 interface show turtlesim/srv/Spawn"],
        ["out", "float32 x\nfloat32 y\nfloat32 theta\nstring name # Optional.  A unique name will be created and returned if this is empty\n---\nstring name"],
        ["p", "The <code>---</code> line splits the definition. <b>Above</b> it is the request (where to put the new turtle, and a name). <b>Below</b> it is the response (the name that was used)."],
        ["h", "Call a service"],
        ["cmd", "ros2 service call /spawn turtlesim/srv/Spawn \"{x: 2.0, y: 2.0, theta: 0.2, name: 'turtle2'}\""],
        ["out", "requester: making request: turtlesim.srv.Spawn_Request(x=2.0, y=2.0, theta=0.2, name='turtle2')\n\nresponse:\nturtlesim.srv.Spawn_Response(name='turtle2')"],
        ["p", "A second turtle appears in the window. Syntax: <code>ros2 service call &lt;service&gt; &lt;type&gt; &quot;&lt;request in YAML&gt;&quot;</code>."],
        ["cmd", "ros2 service call /clear std_srvs/srv/Empty"],
        ["p", "<code>Empty</code> means the request carries no data. <code>/clear</code> wipes the lines the turtle has drawn."],
        ["h", "Change the pen"],
        ["cmd", "ros2 service call /turtle1/set_pen turtlesim/srv/SetPen \"{r: 255, g: 0, b: 0, width: 5, 'off': 0}\""],
        ["p", "Now drive turtle1 and its line is thick and red. The word <code>'off'</code> needs its quotes: unquoted, YAML reads it as a true/false value."],
        ["cmd", "ros2 service call /reset std_srvs/srv/Empty"],
        ["p", "<code>/reset</code> clears the screen and puts the turtle back at the start."],
        ["h", "Topic or service?"],
        ["ul", [
          "<b>Topic</b>: continuous data, many listeners, no reply. Sensor readings, positions, drive commands.",
          "<b>Service</b>: occasional request that needs an answer. Spawn a turtle, reset, save a map."
        ]],
        ["try", "Spawn a second turtle at a different place with the name <code>helper</code>, then clear the screen. Then reset."],
        ["quiz", {
          q: "Which is better as a <b>service</b> than as a topic?",
          options: [
            "Streaming a camera image 30 times a second",
            "Reporting the robot's position continuously",
            "Asking the simulator to add a new turtle once and get its name back",
            "Sending steering commands every 0.1 seconds"
          ],
          answer: 2,
          why: "A one-time request with a reply is exactly what a service is for. The others are continuous streams, which are topics."
        }]
      ]
    },
    {
      id: "2.5", title: "Parameters", minutes: 15,
      blocks: [
        ["p", "A <b>parameter</b> is a setting belonging to a node, such as a colour, a speed limit or a file name. You can read or change it while the node is running, without editing code."],
        ["cmd", "ros2 param list /turtlesim"],
        ["out", "  background_b\n  background_g\n  background_r\n  qos_overrides./parameter_events.publisher.depth\n  ...\n  use_sim_time"],
        ["p", "The three <code>background_</code> parameters are the red, green and blue of the window."],
        ["cmd", "ros2 param get /turtlesim background_r"],
        ["out", "Integer value is: 69"],
        ["p", "The defaults are red 69, green 86, blue 255, which is the blue you see. Change the red value:"],
        ["cmd", "ros2 param set /turtlesim background_r 150"],
        ["out", "Set parameter successful"],
        ["p", "The background becomes purple. If it does not change straight away, call the clear service to make the window repaint:"],
        ["cmd", "ros2 service call /clear std_srvs/srv/Empty"],
        ["note", "Changes to parameters are <b>not saved</b>. Restart turtlesim and the colours return to their defaults. Later you will learn to set parameters in launch files."],
        ["try", "Make the background pure green: set red to 0, green to 255, blue to 0."],
        ["quiz", {
          q: "What does <code>ros2 param set /turtlesim background_r 150</code> change?",
          options: [
            "The turtle's speed",
            "The red part of the turtlesim background colour, while it is running",
            "A file on disk, permanently",
            "The message type of a topic"
          ],
          answer: 1,
          why: "It changes a setting of the running node. Nothing is written to disk."
        }]
      ]
    },
    {
      id: "2.6", title: "Your first Python publisher", minutes: 30,
      blocks: [
        ["p", "Time to write your own node. It will publish a <code>Twist</code> to <code>/turtle1/cmd_vel</code>, so it does the same job as the keyboard teleop, and the turtle will drive in a circle."],
        ["p", "Everything from Module 1 comes together here: a <b>class</b> that inherits from <code>Node</code>, a <b>callback</b> function, <code>import</code> and <code>main</code>."],
        ["cmd", "mkdir -p ~/ros2_practice && cd ~/ros2_practice && nano circle_publisher.py"],
        ["code", "import rclpy\nfrom rclpy.node import Node\nfrom geometry_msgs.msg import Twist\n\n\nclass CirclePublisher(Node):\n    def __init__(self):\n        super().__init__(\"circle_publisher\")\n        self.publisher = self.create_publisher(Twist, \"/turtle1/cmd_vel\", 10)\n        self.timer = self.create_timer(0.5, self.send_command)\n\n    def send_command(self):\n        msg = Twist()\n        msg.linear.x = 2.0\n        msg.angular.z = 1.0\n        self.publisher.publish(msg)\n        self.get_logger().info(\"Sent: forward 2.0, turn 1.0\")\n\n\ndef main():\n    rclpy.init()\n    node = CirclePublisher()\n    try:\n        rclpy.spin(node)\n    except KeyboardInterrupt:\n        pass\n    finally:\n        node.destroy_node()\n        if rclpy.ok():\n            rclpy.shutdown()\n\n\nif __name__ == \"__main__\":\n    main()", "circle_publisher.py"],
        ["h", "Run it"],
        ["p", "Keep turtlesim running in terminal 1. In terminal 2:"],
        ["cmd", "cd ~/ros2_practice && python3 circle_publisher.py", "Ubuntu terminal 2"],
        ["out", "[INFO] [1790889541.975914562] [circle_publisher]: Sent: forward 2.0, turn 1.0\n[INFO] [1790889542.422224358] [circle_publisher]: Sent: forward 2.0, turn 1.0\n..."],
        ["p", "The turtle drives in a circle. Stop it with <b>Ctrl+C</b>. To put it back in the middle, run <code>ros2 service call /reset std_srvs/srv/Empty</code>."],
        ["h", "Reading the code"],
        ["ul", [
          "<code>class CirclePublisher(Node)</code>: your node is a class inheriting from ROS 2's <code>Node</code>, exactly the pattern from lesson 1.7.",
          "<code>super().__init__(\"circle_publisher\")</code>: starts the parent <code>Node</code> and gives it a name. This is the name <code>ros2 node list</code> shows.",
          "<code>create_publisher(Twist, \"/turtle1/cmd_vel\", 10)</code>: &quot;I will publish <code>Twist</code> messages on this topic.&quot; The <code>10</code> is how many unsent messages may queue up. Use 10 for now.",
          "<code>create_timer(0.5, self.send_command)</code>: calls <code>send_command</code> every 0.5 seconds. This is a <b>callback</b>.",
          "<code>msg = Twist()</code> then setting <code>msg.linear.x</code> and <code>msg.angular.z</code>: building the message, the fields you saw in lesson 2.3.",
          "<code>self.get_logger().info(...)</code>: ROS 2's version of <code>print</code>, with timestamps and the node name.",
          "<code>rclpy.init()</code> starts ROS 2, and <code>rclpy.spin(node)</code> keeps the node alive, waiting for timers and messages, until you press Ctrl+C. <code>rclpy.shutdown()</code> cleans up."
        ]],
        ["note", "The <code>try</code> / <code>except KeyboardInterrupt</code> / <code>finally</code> part makes Ctrl+C stop the node quietly instead of printing an error. You can copy it into every node you write."],
        ["warn", "If you see <code>ModuleNotFoundError: No module named 'rclpy'</code>, ROS 2 is not sourced in that terminal (lesson 0.4). Open a fresh terminal and try again."],
        ["try", "Change <code>angular.z</code> to <code>2.0</code> for a tighter circle, or to <code>0.5</code> for a wider one. Stop, edit with nano, and rerun. Use <code>ros2 node list</code> in another terminal while it runs: do you see <code>/circle_publisher</code>?"],
        ["quiz", {
          q: "What does <code>rclpy.spin(node)</code> do?",
          options: [
            "Rotates the turtle",
            "Keeps the node running so it can process timers and messages until you stop it",
            "Deletes the node",
            "Publishes one message"
          ],
          answer: 1,
          why: "Spin is the node's main loop: it waits for events and runs your callbacks. Without it the program would start and finish at once."
        }]
      ]
    },
    {
      id: "2.7", title: "Your first Python subscriber", minutes: 25,
      blocks: [
        ["p", "The other half of topics. This node <b>subscribes</b> to <code>/turtle1/pose</code> and reports where the turtle is. ROS 2 calls your function every time a message arrives. That is a <b>callback</b>, just like the functions in lesson 1.5."],
        ["cmd", "cd ~/ros2_practice && nano pose_listener.py"],
        ["code", "import rclpy\nfrom rclpy.node import Node\nfrom turtlesim.msg import Pose\n\n\nclass PoseListener(Node):\n    def __init__(self):\n        super().__init__(\"pose_listener\")\n        self.subscription = self.create_subscription(Pose, \"/turtle1/pose\", self.on_pose, 10)\n\n    def on_pose(self, msg):\n        self.get_logger().info(\n            f\"x={msg.x:.2f} y={msg.y:.2f} theta={msg.theta:.2f}\",\n            throttle_duration_sec=1.0,\n        )\n\n\ndef main():\n    rclpy.init()\n    node = PoseListener()\n    try:\n        rclpy.spin(node)\n    except KeyboardInterrupt:\n        pass\n    finally:\n        node.destroy_node()\n        if rclpy.ok():\n            rclpy.shutdown()\n\n\nif __name__ == \"__main__\":\n    main()", "pose_listener.py"],
        ["p", "With turtlesim running in terminal 1, run it in terminal 2, and start the teleop in terminal 3 so you can move the turtle:"],
        ["cmd", "cd ~/ros2_practice && python3 pose_listener.py", "Ubuntu terminal 2"],
        ["out", "[INFO] [...] [pose_listener]: x=5.54 y=5.54 theta=0.00"],
        ["p", "Drive the turtle and a new line appears about once a second, with changing numbers. (Your numbers will differ.)"],
        ["h", "What is new"],
        ["ul", [
          "<code>create_subscription(Pose, \"/turtle1/pose\", self.on_pose, 10)</code>: &quot;I want <code>Pose</code> messages from this topic, and call <code>self.on_pose</code> for each one.&quot; The message type must match the topic, as shown by <code>ros2 topic list -t</code>.",
          "<code>on_pose(self, msg)</code>: the callback. <code>msg</code> is the <code>Pose</code> that just arrived, and its fields are <code>msg.x</code>, <code>msg.y</code>, <code>msg.theta</code>, as in <code>ros2 topic echo</code>.",
          "<code>{msg.x:.2f}</code>: the <code>:.2f</code> shows 2 decimal places.",
          "<code>throttle_duration_sec=1.0</code>: pose arrives about 62 times a second (you measured it with <code>topic hz</code>), which would flood the screen. This limits the log to one line per second."
        ]],
        ["note", "The import is <code>from turtlesim.msg import Pose</code>. The pattern is always <code>from &lt;package&gt;.msg import &lt;Type&gt;</code>, matching the type name <code>turtlesim/msg/Pose</code> that ROS 2 shows."],
        ["try", "Run the publisher from lesson 2.6 in another terminal at the same time. Your listener reports the circle being drawn. That is two of your own nodes cooperating through a topic."],
        ["quiz", {
          q: "In a subscriber, when does <code>on_pose</code> run?",
          options: [
            "Once, at startup",
            "Every time a new message arrives on the topic",
            "Only when you press a key",
            "Never, you have to call it yourself"
          ],
          answer: 1,
          why: "You register the function with <code>create_subscription</code>, and ROS 2 calls it for every incoming message while the node is spinning."
        }]
      ]
    },
    {
      id: "2.8", title: "Mini project: the wall-avoiding turtle", minutes: 40,
      blocks: [
        ["p", "Now combine both: one node that <b>subscribes</b> to the turtle's position and <b>publishes</b> drive commands. That is the shape of a real robot controller: <i>sense, decide, act</i>. The turtle will wander the window and turn away from walls on its own."],
        ["h", "The idea"],
        ["ul", [
          "<b>Sense</b>: read the turtle's pose from <code>/turtle1/pose</code>.",
          "<b>Decide</b>: look one metre ahead in the direction the turtle faces. If that point is outside the window, a wall is ahead.",
          "<b>Act</b>: if a wall is ahead, turn on the spot. Otherwise drive forward."
        ]],
        ["p", "<code>theta</code> is the direction the turtle faces. The point ahead is <code>x + cos(theta)</code>, <code>y + sin(theta)</code>, which uses <code>math.cos</code> and <code>math.sin</code> from the <code>import math</code> you met in lesson 1.8."],
        ["cmd", "cd ~/ros2_practice && nano wall_avoider.py"],
        ["code", "import math\n\nimport rclpy\nfrom rclpy.node import Node\nfrom geometry_msgs.msg import Twist\nfrom turtlesim.msg import Pose\n\n\nclass WallAvoider(Node):\n    def __init__(self):\n        super().__init__(\"wall_avoider\")\n        self.publisher = self.create_publisher(Twist, \"/turtle1/cmd_vel\", 10)\n        self.subscription = self.create_subscription(Pose, \"/turtle1/pose\", self.on_pose, 10)\n        self.turning = False\n\n    def on_pose(self, msg):\n        # The point 1 metre in front of the turtle, in the direction it is facing\n        ahead_x = msg.x + math.cos(msg.theta)\n        ahead_y = msg.y + math.sin(msg.theta)\n        wall_ahead = not (0.5 < ahead_x < 10.5 and 0.5 < ahead_y < 10.5)\n\n        cmd = Twist()\n        if wall_ahead:\n            cmd.angular.z = 2.0\n        else:\n            cmd.linear.x = 2.0\n\n        if wall_ahead != self.turning:\n            self.turning = wall_ahead\n            self.get_logger().info(\"Wall ahead, turning\" if wall_ahead else \"Clear, driving straight\")\n\n        self.publisher.publish(cmd)\n\n\ndef main():\n    rclpy.init()\n    node = WallAvoider()\n    try:\n        rclpy.spin(node)\n    except KeyboardInterrupt:\n        pass\n    finally:\n        node.destroy_node()\n        if rclpy.ok():\n            rclpy.shutdown()\n\n\nif __name__ == \"__main__\":\n    main()", "wall_avoider.py"],
        ["p", "With turtlesim running (and the teleop stopped, so it does not compete for control), run:"],
        ["cmd", "cd ~/ros2_practice && python3 wall_avoider.py", "Ubuntu terminal 2"],
        ["out", "[INFO] [...] [wall_avoider]: Wall ahead, turning\n[INFO] [...] [wall_avoider]: Clear, driving straight\n[INFO] [...] [wall_avoider]: Wall ahead, turning\n..."],
        ["p", "The turtle drives, turns away at each wall, and carries on. I tested this for 30 seconds: it stayed inside the window the whole time and never touched a wall."],
        ["h", "A bug worth knowing about"],
        ["p", "My first version turned <i>while creeping forward</i> whenever the turtle was close to a wall. It worked for a while, then got <b>trapped in a corner</b>, circling forever in a small loop that never left the danger zone. The fix was to turn <i>on the spot</i> until the way ahead was clear. The lesson: a robot controller can fail in situations you did not picture, so always watch it for longer than a few seconds."],
        ["h", "Look at the graph"],
        ["p", "Run <code>rqt_graph</code> while it is running. Your <code>/wall_avoider</code> node sits between <code>/turtle1/pose</code> and <code>/turtle1/cmd_vel</code>, a loop: the turtle reports its position, your node decides, and the turtle obeys."],
        ["h", "Challenges"],
        ["ul", [
          "<b>Easy</b>: change the driving speed (<code>2.0</code>) and turning speed (<code>2.0</code>). How do they change the path?",
          "<b>Medium</b>: before running it, set a thick red pen with the <code>/turtle1/set_pen</code> service from lesson 2.4 and watch the path it draws.",
          "<b>Harder</b>: make it drive slower when it is within 2 metres of a wall.",
          "<b>Stretch</b>: spawn a second turtle with the <code>/spawn</code> service and make a second node control it on <code>/turtle2/cmd_vel</code>."
        ]],
        ["try", "Run the wall avoider for a full minute and watch the pattern it draws. Then use <code>ros2 service call /clear std_srvs/srv/Empty</code> and run it again from a different starting point (drive the turtle somewhere first with the teleop)."],
        ["quiz", {
          q: "Why does the wall avoider need <b>both</b> a subscription and a publisher?",
          options: [
            "ROS 2 requires every node to have both",
            "It must read the turtle's position (subscribe) to decide, then send drive commands (publish) to act",
            "The subscription is only for logging",
            "A publisher alone cannot send messages"
          ],
          answer: 1,
          why: "Sense (subscribe to pose), decide, act (publish velocity). Many nodes have only one of the two, but a controller needs both."
        }]
      ]
    }
  ]
});
