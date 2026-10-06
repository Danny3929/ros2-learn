window.MODULES = window.MODULES || [];
window.MODULES.push({
  "order": 7,
  "title": "7 · Recording and debugging",
  "lessons": [
    {
      "id": "7.1",
      "title": "Recording and replaying data (ros2 bag)",
      "minutes": 40,
      "blocks": [
        [
          "p",
          "Imagine your robot misbehaves in a hallway, and by the time you look at it the moment has passed. A <b>bag</b> is a recording of ROS 2 messages, like the black-box recorder on an aeroplane. You record while the robot runs, and afterwards you can <b>inspect</b> what happened, <b>replay</b> it to other programs, or <b>analyse</b> it with Python. Recording real data once and testing your code on it many times is one of the most useful habits in robotics."
        ],
        [
          "h",
          "Record a drive"
        ],
        [
          "p",
          "Use turtlesim as the &quot;robot&quot;. In <b>terminal 1</b>, start it:"
        ],
        [
          "cmd",
          "ros2 run turtlesim turtlesim_node",
          "Terminal 1 (Ubuntu)"
        ],
        [
          "p",
          "In <b>terminal 2</b>, start recording two topics: the commands that drive the turtle, and the pose it reports back. <code>-o</code> names the output folder."
        ],
        [
          "cmd",
          "cd ~/ros2_practice && ros2 bag record -o drive_bag /turtle1/cmd_vel /turtle1/pose",
          "Terminal 2 (Ubuntu)"
        ],
        [
          "out",
          "[INFO] [...] [rosbag2_storage]: Opened database 'drive_bag/drive_bag_0.db3' for READ_WRITE.\n[INFO] [...] [rosbag2_recorder]: Listening for topics...\n[INFO] [...] [rosbag2_recorder]: Recording...\n[INFO] [...] [rosbag2_recorder]: Subscribed to topic '/turtle1/cmd_vel'\n[INFO] [...] [rosbag2_recorder]: All requested topics are subscribed. Stopping discovery..."
        ],
        [
          "p",
          "While it records, drive the turtle in a circle from <b>terminal 3</b> for about 4 seconds, then stop it:"
        ],
        [
          "cmd",
          "ros2 topic pub --times 20 -r 5 /turtle1/cmd_vel geometry_msgs/msg/Twist \"{linear: {x: 2.0}, angular: {z: 1.0}}\"",
          "Terminal 3 (Ubuntu)"
        ],
        [
          "cmd",
          "ros2 topic pub --once /turtle1/cmd_vel geometry_msgs/msg/Twist \"{}\"",
          "Terminal 3 (Ubuntu)"
        ],
        [
          "p",
          "Now stop the recording with <code>Ctrl+C</code> in terminal 2. It finishes writing:"
        ],
        [
          "out",
          "[INFO] [...] [rosbag2_cpp]: Writing remaining messages from cache to the bag. It may take a while"
        ],
        [
          "cmd",
          "ls drive_bag",
          "Terminal 2 (Ubuntu)"
        ],
        [
          "out",
          "drive_bag_0.db3  metadata.yaml"
        ],
        [
          "ul",
          [
            "<code>drive_bag_0.db3</code>: the recorded messages, in a small SQLite database.",
            "<code>metadata.yaml</code>: a text file describing the bag: the topics, their types, how many messages."
          ]
        ],
        [
          "note",
          "A bag is a <b>folder</b>, not a single file. Always move or copy the whole folder."
        ],
        [
          "h",
          "What is in the bag?"
        ],
        [
          "cmd",
          "ros2 bag info drive_bag",
          "Terminal 2 (Ubuntu)"
        ],
        [
          "out",
          "Files:             drive_bag_0.db3\nBag size:          77.4 KiB\nStorage id:        sqlite3\nDuration:          13.440662861s\nStart:             Oct  6 2026 16:03:18.841177161 (1791291798.841177161)\nEnd:               Oct  6 2026 16:03:32.281840022 (1791291812.281840022)\nMessages:          858\nTopic information: Topic: /turtle1/cmd_vel | Type: geometry_msgs/msg/Twist | Count: 17 | Serialization Format: cdr\n                   Topic: /turtle1/pose | Type: turtlesim/msg/Pose | Count: 841 | Serialization Format: cdr"
        ],
        [
          "p",
          "Your numbers will differ, but the shape is the same. Look at the two topics: the <b>commands</b> were few (17, because they were published at 5 per second for a few seconds), while the <b>pose</b> was published about 60 times a second, for 841 messages. <code>cdr</code> is the binary format ROS 2 uses to put messages on the wire."
        ],
        [
          "h",
          "Replay it"
        ],
        [
          "p",
          "Put the turtle back in the middle (<code>ros2 service call /reset std_srvs/srv/Empty</code>) and play the commands back. Only the commands are replayed, not the old pose, because the turtle produces a fresh pose of its own:"
        ],
        [
          "cmd",
          "ros2 service call /reset std_srvs/srv/Empty",
          "Terminal 2 (Ubuntu)"
        ],
        [
          "cmd",
          "ros2 bag play drive_bag --topics /turtle1/cmd_vel",
          "Terminal 2 (Ubuntu)"
        ],
        [
          "out",
          "[INFO] [...] [rosbag2_storage]: Opened database 'drive_bag/drive_bag_0.db3' for READ_ONLY.\n[INFO] [...] [rosbag2_player]: Set rate to 1\n[INFO] [...] [rosbag2_player]: Press SPACE for Pause/Resume\n[INFO] [...] [rosbag2_player]: Press CURSOR_RIGHT for Play Next Message\n[INFO] [...] [rosbag2_player]: Press CURSOR_UP for Increase Rate 10%\n[INFO] [...] [rosbag2_player]: Press CURSOR_DOWN for Decrease Rate 10%"
        ],
        [
          "p",
          "The turtle moves again, driven by recorded commands, with the same timing as the original. While it plays you can press <b>Space</b> to pause, and the arrow keys to change the speed."
        ],
        [
          "warn",
          "Do not expect an <b>identical</b> path. In one test the live drive finished near (5.4, 9.5), and the replay finished near (7.3, 8.4). A bag replays the <i>messages</i> faithfully, but the turtle reacts to them with its own timing, which is never exactly the same twice. A bag is great for data and for testing software, but it is not a perfect time machine for the physical world."
        ],
        [
          "p",
          "Useful options for <code>ros2 bag play</code>:"
        ],
        [
          "ul",
          [
            "<code>-r 2.0</code> or <code>--rate 2.0</code>: play at double speed.",
            "<code>-l</code> or <code>--loop</code>: start again when it reaches the end.",
            "<code>--topics /name ...</code>: play only these topics.",
            "<code>-d SECONDS</code> or <code>--delay</code>: wait before starting.",
            "<code>--start-offset SECONDS</code>: skip the beginning."
          ]
        ],
        [
          "p",
          "And for <code>ros2 bag record</code>:"
        ],
        [
          "ul",
          [
            "<code>-a</code> or <code>--all</code>: record <b>every</b> topic (convenient, but bags get large).",
            "<code>-o NAME</code>: the output folder name.",
            "<code>-b</code> and <code>-d</code>: split the bag into new files after a maximum size or duration."
          ]
        ],
        [
          "h",
          "Read a bag with Python"
        ],
        [
          "p",
          "The pose data is a record of where the turtle went. A small script can open the bag directly and work out, say, how far the turtle travelled:"
        ],
        [
          "cmd",
          "nano read_bag.py",
          "Terminal 2 (Ubuntu)"
        ],
        [
          "code",
          "import math\nimport sys\n\nimport rosbag2_py\nfrom rclpy.serialization import deserialize_message\nfrom rosidl_runtime_py.utilities import get_message\n\n\ndef main():\n    if len(sys.argv) != 2:\n        print(\"Usage: python3 read_bag.py BAG_FOLDER\")\n        return\n\n    reader = rosbag2_py.SequentialReader()\n    reader.open(\n        rosbag2_py.StorageOptions(uri=sys.argv[1], storage_id=\"sqlite3\"),\n        rosbag2_py.ConverterOptions(input_serialization_format=\"cdr\", output_serialization_format=\"cdr\"),\n    )\n    types = {t.name: t.type for t in reader.get_all_topics_and_types()}\n\n    count = 0\n    distance = 0.0\n    last = None\n    while reader.has_next():\n        topic, data, stamp = reader.read_next()\n        if topic != \"/turtle1/pose\":\n            continue\n        msg = deserialize_message(data, get_message(types[topic]))\n        if last is not None:\n            distance += math.hypot(msg.x - last.x, msg.y - last.y)\n        last = msg\n        count += 1\n\n    print(f\"{count} pose messages\")\n    print(f\"the turtle travelled {distance:.1f} units\")\n\n\nif __name__ == \"__main__\":\n    main()",
          "read_bag.py"
        ],
        [
          "cmd",
          "python3 read_bag.py drive_bag",
          "Terminal 2 (Ubuntu)"
        ],
        [
          "out",
          "[INFO] [...] [rosbag2_storage]: Opened database 'drive_bag/drive_bag_0.db3' for READ_ONLY.\n841 pose messages\nthe turtle travelled 9.6 units"
        ],
        [
          "ul",
          [
            "<code>rosbag2_py.SequentialReader</code> reads a bag message by message, in time order. <code>StorageOptions</code> says where the bag is, and <code>ConverterOptions</code> says the messages were stored as <code>cdr</code>.",
            "<code>get_all_topics_and_types()</code> tells you the type of each topic, which you need to turn the raw bytes back into a message.",
            "<code>read_next()</code> returns the topic name, the raw <code>data</code> and a timestamp. <code>deserialize_message(data, get_message(type))</code> converts the bytes into a normal <code>Pose</code> object with <code>x</code>, <code>y</code> and <code>theta</code>.",
            "The loop adds up the distance between each pair of consecutive positions with <code>math.hypot</code>. Here it came to 9.6 units, roughly the length of the curved path the turtle drove."
          ]
        ],
        [
          "warn",
          "Bags grow fast, especially with cameras and lidars. Record only the topics you need, and delete test bags you no longer want. Remember that your Linux files live in a disk image on <code>C:</code>."
        ],
        [
          "try",
          "Record a new bag of <code>/turtle1/pose</code> only while you drive the turtle in any shape you like with <code>ros2 topic pub</code>. Use <code>ros2 bag info</code> to check the duration, then replay it at double speed with <code>--rate 2.0</code> (watch the terminal with <code>ros2 topic echo /turtle1/pose</code> in another window), and run <code>read_bag.py</code> on it."
        ],
        [
          "quiz",
          {
            "q": "A bag you recorded is a...",
            "options": [
              "single text file",
              "folder containing the recorded messages and a metadata.yaml description",
              "video",
              "launch file"
            ],
            "answer": 1,
            "why": "A bag is a folder: a <code>.db3</code> database with the messages plus <code>metadata.yaml</code>. Always copy the whole folder."
          }
        ],
        [
          "quiz",
          {
            "q": "You replay a recorded <code>/cmd_vel</code> bag and the robot ends up somewhere slightly different from the original run. Why?",
            "options": [
              "The bag file is corrupted",
              "The messages were replayed, but the robot and its environment never respond with exactly the same timing twice",
              "ROS 2 changes the numbers",
              "The bag only keeps half the messages"
            ],
            "answer": 1,
            "why": "A bag reproduces the <i>data</i>, not the physical world. Small timing differences add up, so a replayed drive is similar, not identical."
          }
        ]
      ]
    },
    {
      "id": "7.2",
      "title": "Logging and rqt_console",
      "minutes": 30,
      "blocks": [
        [
          "p",
          "You have used <code>self.get_logger().info(...)</code> since lesson 2.6, but logging has more to it. The right log messages are the difference between a robot you can debug in minutes and one you debug for days. ROS 2 logs have <b>five severity levels</b>, from least to most serious:"
        ],
        [
          "ul",
          [
            "<b>DEBUG</b>: fine detail for developers. Hidden by default.",
            "<b>INFO</b>: normal progress (&quot;started&quot;, &quot;goal reached&quot;).",
            "<b>WARN</b>: something odd, but the robot still works.",
            "<b>ERROR</b>: something failed.",
            "<b>FATAL</b>: the program cannot continue."
          ]
        ],
        [
          "p",
          "The default level is <b>INFO</b>: you see INFO and everything more serious, but not DEBUG."
        ],
        [
          "h",
          "A node that logs at every level"
        ],
        [
          "cmd",
          "cd ~/ros2_practice && nano log_demo.py",
          "Terminal 1 (Ubuntu)"
        ],
        [
          "code",
          "import rclpy\nfrom rclpy.node import Node\n\n\nclass LogDemo(Node):\n    def __init__(self):\n        super().__init__(\"log_demo\")\n        self.count = 0\n        self.create_timer(1.0, self.tick)\n\n    def tick(self):\n        self.count += 1\n        log = self.get_logger()\n        log.debug(f\"tick {self.count}: DEBUG, detail for developers\")\n        log.info(f\"tick {self.count}: INFO, normal progress\")\n        if self.count % 2 == 0:\n            log.warn(\"WARN: something odd, but still working\")\n        if self.count % 3 == 0:\n            log.error(\"ERROR: something failed\")\n        log.info(\"INFO throttled: at most once every 2 seconds\", throttle_duration_sec=2.0)\n        log.info(\"INFO once: printed only the first time\", once=True)\n\n\ndef main():\n    rclpy.init()\n    node = LogDemo()\n    try:\n        rclpy.spin(node)\n    except KeyboardInterrupt:\n        pass\n    finally:\n        node.destroy_node()\n        if rclpy.ok():\n            rclpy.shutdown()\n\n\nif __name__ == \"__main__\":\n    main()",
          "log_demo.py"
        ],
        [
          "ul",
          [
            "<code>log.debug</code>, <code>log.info</code>, <code>log.warn</code> and <code>log.error</code> are the four levels you will use most (<code>log.fatal</code> is the fifth). The timer runs once a second.",
            "<code>count % 2 == 0</code> is true on every second tick, so the WARN appears every other second, and the ERROR every third.",
            "<code>throttle_duration_sec=2.0</code> limits a message to <b>once every 2 seconds</b>. It is what you used with the lidar to stop the terminal flooding.",
            "<code>once=True</code> prints a message only the <b>first</b> time that line runs."
          ]
        ],
        [
          "cmd",
          "python3 log_demo.py",
          "Terminal 1 (Ubuntu)"
        ],
        [
          "out",
          "[INFO] [...] [log_demo]: tick 1: INFO, normal progress\n[INFO] [...] [log_demo]: INFO throttled: at most once every 2 seconds\n[INFO] [...] [log_demo]: INFO once: printed only the first time\n[INFO] [...] [log_demo]: tick 2: INFO, normal progress\n[WARN] [...] [log_demo]: WARN: something odd, but still working\n[INFO] [...] [log_demo]: tick 3: INFO, normal progress\n[ERROR] [...] [log_demo]: ERROR: something failed\n[INFO] [...] [log_demo]: tick 4: INFO, normal progress\n[WARN] [...] [log_demo]: WARN: something odd, but still working\n[INFO] [...] [log_demo]: INFO throttled: at most once every 2 seconds"
        ],
        [
          "p",
          "Check each behaviour: the DEBUG line never appears, the &quot;once&quot; line appears only in the first tick, the WARN every second tick, and the throttled line comes back about 3 seconds later, not at every tick. Stop it with <code>Ctrl+C</code>."
        ],
        [
          "h",
          "Change the level from the command line"
        ],
        [
          "p",
          "You do not have to edit the code to see more or fewer messages. Add <code>--ros-args --log-level</code> after the script. To see only WARN and above:"
        ],
        [
          "cmd",
          "python3 log_demo.py --ros-args --log-level warn",
          "Terminal 1 (Ubuntu)"
        ],
        [
          "out",
          "[WARN] [...] [log_demo]: WARN: something odd, but still working\n[ERROR] [...] [log_demo]: ERROR: something failed\n[WARN] [...] [log_demo]: WARN: something odd, but still working\n..."
        ],
        [
          "p",
          "To see DEBUG too, you could write <code>--log-level debug</code>, but try it: the screen fills with messages from the ROS 2 internals (lines like <code>[DEBUG] [...] [rcl]: Initializing node...</code>), and your own messages are buried. The better way is to <b>name the node</b>:"
        ],
        [
          "cmd",
          "python3 log_demo.py --ros-args --log-level log_demo:=debug",
          "Terminal 1 (Ubuntu)"
        ],
        [
          "out",
          "[DEBUG] [...] [log_demo]: tick 1: DEBUG, detail for developers\n[INFO] [...] [log_demo]: tick 1: INFO, normal progress\n[INFO] [...] [log_demo]: INFO throttled: at most once every 2 seconds\n[INFO] [...] [log_demo]: INFO once: printed only the first time\n..."
        ],
        [
          "p",
          "Now only your node is verbose. The same form works to <b>silence</b> a chatty node:"
        ],
        [
          "cmd",
          "python3 log_demo.py --ros-args --log-level log_demo:=error",
          "Terminal 1 (Ubuntu)"
        ],
        [
          "out",
          "[ERROR] [...] [log_demo]: ERROR: something failed\n[ERROR] [...] [log_demo]: ERROR: something failed\n..."
        ],
        [
          "p",
          "The same flag works on <code>ros2 run</code> and <code>ros2 launch</code> for any package, for example <code>ros2 run turtlesim turtlesim_node --ros-args --log-level debug</code>."
        ],
        [
          "h",
          "A window for your logs: rqt_console"
        ],
        [
          "p",
          "Every log message is also <b>published</b> on a topic called <code>/rosout</code>, so any tool can collect them from many nodes at once. <b>rqt_console</b> is a window that does exactly that. In <b>terminal 2</b>, start it, and keep <code>log_demo.py</code> running in terminal 1:"
        ],
        [
          "cmd",
          "ros2 run rqt_console rqt_console",
          "Terminal 2 (Ubuntu)"
        ],
        [
          "p",
          "A window opens. The messages arrive in the table at the top, newest first, with a number and a small <b>icon for the severity</b>: a light bulb for INFO, a warning triangle for WARN, and a red stop sign for ERROR. The bar above the table says how many messages it has collected."
        ],
        [
          "ul",
          [
            "<b>Exclude Messages</b>: tick a severity (Debug, Info, Warn, Error, Fatal) to <b>hide</b> it. Hiding Info leaves only the problems.",
            "<b>Highlight Messages</b>: type a word and every message containing it is marked, for example the name of a node.",
            "The pause button stops the table from moving while you read it, and the save button writes the messages to a file."
          ]
        ],
        [
          "note",
          "Use rqt_console when many nodes are running at once (a launch file with ten nodes, say). In one terminal you cannot tell which node said what, but in rqt_console you can sort and filter."
        ],
        [
          "warn",
          "Close the rqt_console window and press <code>Ctrl+C</code> in the other terminal when you finish."
        ],
        [
          "h",
          "Good logging habits"
        ],
        [
          "ul",
          [
            "Log <b>what happened and what was expected</b>, not just &quot;error&quot;. <code>Cannot reach the goal (3.2 m left)</code> beats <code>failed</code>.",
            "Use the right level. A WARN means something to look at, so too many of them train you to ignore warnings.",
            "Throttle anything that runs many times a second (sensors, timers), or the real problem scrolls away.",
            "Keep DEBUG lines in your code. They cost nothing when hidden and are gold when you need them."
          ]
        ],
        [
          "try",
          "Add a <code>log.fatal(...)</code> line to <code>log_demo.py</code> that runs only when <code>self.count == 4</code>, then run it with rqt_console open. Which icon does the new message get? Then run the script with <code>--ros-args --log-level log_demo:=warn</code> and confirm the INFO lines are gone."
        ],
        [
          "quiz",
          {
            "q": "You want to see the DEBUG messages of <b>only</b> your node <code>log_demo</code>. Which command line does that?",
            "options": [
              "--ros-args --log-level debug",
              "--ros-args --log-level log_demo:=debug",
              "--ros-args --debug",
              "--log-level log_demo"
            ],
            "answer": 1,
            "why": "<code>NAME:=LEVEL</code> sets the level for one logger only. A plain <code>--log-level debug</code> affects everything, including the noisy ROS internals."
          }
        ],
        [
          "quiz",
          {
            "q": "What does <code>throttle_duration_sec=2.0</code> do?",
            "options": [
              "Slows the whole program down",
              "Prints that message at most once every 2 seconds",
              "Waits 2 seconds before starting",
              "Deletes old messages"
            ],
            "answer": 1,
            "why": "Throttling suppresses repeats so a message that runs many times a second does not flood the screen."
          }
        ]
      ]
    },
    {
      "id": "7.3",
      "title": "Checking your system: ros2 doctor and domains",
      "minutes": 25,
      "blocks": [
        [
          "p",
          "When &quot;it worked yesterday&quot; and today it does not, you want a checkup. ROS 2 has a built-in doctor."
        ],
        [
          "h",
          "ros2 doctor"
        ],
        [
          "cmd",
          "ros2 doctor",
          "Terminal 1 (Ubuntu)"
        ],
        [
          "out",
          "/opt/ros/humble/lib/python3.10/site-packages/ros2doctor/api/package.py: 112: UserWarning: tf2 has been updated to a new version. local: 0.25.23 < latest: 0.25.24\n/opt/ros/humble/lib/python3.10/site-packages/ros2doctor/api/package.py: 112: UserWarning: tf2_ros has been updated to a new version. local: 0.25.23 < latest: 0.25.24\n... (dozens more lines like this)\n\nAll 5 checks passed"
        ],
        [
          "p",
          "Read it from the bottom. <b>All 5 checks passed</b> means the basics are healthy. The long list above it is warnings: each says that a package <b>installed on your computer has a newer version available</b> (<code>local: 0.25.23 &lt; latest: 0.25.24</code>). That is normal on a system that has not been updated for a few weeks, and it does not stop anything working. It is also why <code>ros2 doctor</code> is a good first command when something is wrong: it looks at your ROS version, your platform and your network setup, and it can report problems it finds."
        ],
        [
          "note",
          "<code>ros2 wtf</code> is just another name (an alias) for the same command, and prints the same output."
        ],
        [
          "h",
          "The full report"
        ],
        [
          "cmd",
          "ros2 doctor --report",
          "Terminal 1 (Ubuntu)"
        ],
        [
          "p",
          "This prints everything in sections. These are the ones it has:"
        ],
        [
          "out",
          "   NETWORK CONFIGURATION\n   PACKAGE VERSIONS\n   PLATFORM INFORMATION\n   QOS COMPATIBILITY LIST\n   RMW MIDDLEWARE\n   ROS 2 INFORMATION\n   TOPIC LIST"
        ],
        [
          "ul",
          [
            "<b>Network configuration</b>: the network connections ROS 2 can use. Useful when robots on different computers cannot see each other.",
            "<b>Package versions</b>: every ROS package installed, with its version and the newest available.",
            "<b>QoS compatibility list</b>: connections where the QoS of a publisher and subscriber do not match, the silent problem from lesson 6.4.",
            "<b>RMW middleware</b>: which communication layer is in use.",
            "<b>Topic list</b>: the topics, with their publishers and subscribers."
          ]
        ],
        [
          "note",
          "When you ask for help online or from Claude, paste the output of <code>ros2 doctor --report</code>. It tells helpers your ROS version, platform and setup in one go."
        ],
        [
          "h",
          "Keeping robots apart: ROS_DOMAIN_ID"
        ],
        [
          "p",
          "All ROS 2 programs on the same network <b>find each other automatically</b>. That is magic when you want it, and a problem when a classmate&apos;s robot starts answering your <code>/cmd_vel</code>. The <b>domain ID</b> separates groups. Programs only see each other when they share the same number. Official guidance is to use a value from 0 to 101."
        ],
        [
          "p",
          "Try it. In <b>terminal 1</b>, publish a message in domain 5. In <b>terminal 2</b>, listen in domain 5 and then in domain 6:"
        ],
        [
          "cmd",
          "ROS_DOMAIN_ID=5 ros2 topic pub -r 2 /hello std_msgs/msg/String \"{data: 'hi from domain 5'}\"",
          "Terminal 1 (Ubuntu)"
        ],
        [
          "cmd",
          "ROS_DOMAIN_ID=5 ros2 topic echo --once /hello",
          "Terminal 2 (Ubuntu)"
        ],
        [
          "out",
          "data: hi from domain 5\n---"
        ],
        [
          "cmd",
          "ROS_DOMAIN_ID=6 ros2 topic echo --once /hello",
          "Terminal 2 (Ubuntu)"
        ],
        [
          "out",
          "WARNING: topic [/hello] does not appear to be published yet\nCould not determine the type for the passed topic"
        ],
        [
          "p",
          "In domain 6, the topic does not exist at all. Compare the topic lists:"
        ],
        [
          "cmd",
          "ROS_DOMAIN_ID=5 ros2 topic list",
          "Terminal 2 (Ubuntu)"
        ],
        [
          "out",
          "/hello\n/parameter_events\n/rosout"
        ],
        [
          "cmd",
          "ROS_DOMAIN_ID=6 ros2 topic list",
          "Terminal 2 (Ubuntu)"
        ],
        [
          "out",
          "/parameter_events\n/rosout"
        ],
        [
          "p",
          "Writing <code>ROS_DOMAIN_ID=5</code> in front of a command sets it for that command only. To set it for a whole terminal, use <code>export ROS_DOMAIN_ID=5</code>, and to make it permanent, add that line to <code>~/.bashrc</code> (once, as in lesson 0.4). When the variable is not set, ROS 2 uses domain 0."
        ],
        [
          "cmd",
          "env | grep ^ROS_",
          "Terminal 2 (Ubuntu)"
        ],
        [
          "out",
          "ROS_DISTRO=humble\nROS_LOCALHOST_ONLY=0\nROS_PYTHON_VERSION=3\nROS_VERSION=2"
        ],
        [
          "p",
          "That is what your setup shows by default: no <code>ROS_DOMAIN_ID</code> line, so domain 0. <code>ROS_LOCALHOST_ONLY=0</code> means programs may use the network to find each other. (Setting it to <code>1</code> keeps everything inside one computer.)"
        ],
        [
          "warn",
          "All terminals in one WSL session are on the same computer, so domains here are mainly useful when two computers share a network, such as in a classroom with several robots, or to run two separate experiments on one PC."
        ],
        [
          "try",
          "Run <code>ros2 doctor</code> and note what it says at the bottom. Then publish a message in domain 7 and check that <code>ros2 topic list</code> in domain 0 does not show it."
        ],
        [
          "quiz",
          {
            "q": "A classmate&apos;s robot on the same Wi-Fi keeps reacting to your <code>/cmd_vel</code> messages. What is the simplest fix?",
            "options": [
              "Rename the topic in the code",
              "Both of you set different values of ROS_DOMAIN_ID",
              "Reinstall ROS 2",
              "Use a faster computer"
            ],
            "answer": 1,
            "why": "Programs only discover each other within the same domain ID. Two different IDs make two separate &quot;worlds&quot;, with no code changes."
          }
        ],
        [
          "quiz",
          {
            "q": "<code>ros2 doctor</code> prints dozens of warnings about newer package versions, and then ends with <i>All 5 checks passed</i>. What does that mean?",
            "options": [
              "ROS 2 is broken",
              "The basics are healthy, and newer versions of some installed packages are available",
              "You must reinstall everything",
              "Your network is down"
            ],
            "answer": 1,
            "why": "The version warnings only tell you that updates exist. The checks themselves passed."
          }
        ]
      ]
    },
    {
      "id": "7.4",
      "title": "TF2 in Python: broadcasting and listening",
      "minutes": 45,
      "blocks": [
        [
          "p",
          "In lesson 4.4 you made frames with terminal commands. Real robots do it in code. There are two jobs:"
        ],
        [
          "ul",
          [
            "A <b>broadcaster</b> publishes &quot;frame B is here, relative to frame A&quot;.",
            "A <b>listener</b> asks TF2 &quot;where is frame B, relative to frame C?&quot; and gets the answer, even when the two frames are connected only through several others."
          ]
        ],
        [
          "p",
          "You will build a small world: a <code>world</code> frame, a <code>base_link</code> robot standing at its origin, a <code>camera</code> fixed on the robot, and a <code>carrot</code> frame orbiting in a circle. Then you will ask: <b>where is the carrot, as seen from the camera?</b> TF2 has to chain three transforms to answer."
        ],
        [
          "h",
          "Static frames"
        ],
        [
          "cmd",
          "cd ~/ros2_practice && nano static_frames.py",
          "Terminal 1 (Ubuntu)"
        ],
        [
          "code",
          "import rclpy\nfrom geometry_msgs.msg import TransformStamped\nfrom rclpy.node import Node\nfrom tf2_ros.static_transform_broadcaster import StaticTransformBroadcaster\n\n\ndef make_transform(stamp, parent, child, x, y, z):\n    t = TransformStamped()\n    t.header.stamp = stamp\n    t.header.frame_id = parent\n    t.child_frame_id = child\n    t.transform.translation.x = x\n    t.transform.translation.y = y\n    t.transform.translation.z = z\n    t.transform.rotation.w = 1.0\n    return t\n\n\nclass StaticFrames(Node):\n    def __init__(self):\n        super().__init__(\"static_frames\")\n        self.broadcaster = StaticTransformBroadcaster(self)\n        now = self.get_clock().now().to_msg()\n        self.broadcaster.sendTransform([\n            make_transform(now, \"world\", \"base_link\", 0.0, 0.0, 0.0),\n            make_transform(now, \"base_link\", \"camera\", 0.2, 0.0, 0.15),\n        ])\n        self.get_logger().info(\"Published static frames: world -> base_link -> camera\")\n\n\ndef main():\n    rclpy.init()\n    node = StaticFrames()\n    try:\n        rclpy.spin(node)\n    except KeyboardInterrupt:\n        pass\n    finally:\n        node.destroy_node()\n        if rclpy.ok():\n            rclpy.shutdown()\n\n\nif __name__ == \"__main__\":\n    main()",
          "static_frames.py"
        ],
        [
          "ul",
          [
            "<code>StaticTransformBroadcaster</code> publishes frames that <b>never change</b>. They are sent once and remembered, so late listeners still get them (that is the QoS <code>TRANSIENT_LOCAL</code> from lesson 6.4, handled for you).",
            "<code>make_transform</code> builds a <code>TransformStamped</code>: a <b>header</b> naming the <b>parent</b> frame (<code>frame_id</code>) and the time, the <b>child</b> frame name (<code>child_frame_id</code>), and the position and rotation of the child <i>in the parent</i>. <code>rotation.w = 1.0</code> means &quot;no rotation&quot;.",
            "<code>sendTransform([...])</code> accepts a list, so both frames go out together: <code>world</code> to <code>base_link</code> (the robot is at the origin), and <code>base_link</code> to <code>camera</code> (0.2 m forward and 0.15 m up, as in lesson 4.4)."
          ]
        ],
        [
          "h",
          "A moving frame"
        ],
        [
          "cmd",
          "nano carrot_broadcaster.py",
          "Terminal 2 (Ubuntu)"
        ],
        [
          "code",
          "import math\n\nimport rclpy\nfrom geometry_msgs.msg import TransformStamped\nfrom rclpy.node import Node\nfrom tf2_ros import TransformBroadcaster\n\nRADIUS = 2.0\nSPEED = 0.5\n\n\nclass CarrotBroadcaster(Node):\n    def __init__(self):\n        super().__init__(\"carrot_broadcaster\")\n        self.broadcaster = TransformBroadcaster(self)\n        self.start = self.get_clock().now()\n        self.create_timer(0.05, self.tick)\n        self.get_logger().info(\"Publishing frame: world -> carrot, circling at 2 m\")\n\n    def tick(self):\n        now = self.get_clock().now()\n        angle = SPEED * (now - self.start).nanoseconds / 1e9\n        yaw = angle + math.pi / 2\n\n        t = TransformStamped()\n        t.header.stamp = now.to_msg()\n        t.header.frame_id = \"world\"\n        t.child_frame_id = \"carrot\"\n        t.transform.translation.x = RADIUS * math.cos(angle)\n        t.transform.translation.y = RADIUS * math.sin(angle)\n        t.transform.rotation.z = math.sin(yaw / 2)\n        t.transform.rotation.w = math.cos(yaw / 2)\n        self.broadcaster.sendTransform(t)\n\n\ndef main():\n    rclpy.init()\n    node = CarrotBroadcaster()\n    try:\n        rclpy.spin(node)\n    except KeyboardInterrupt:\n        pass\n    finally:\n        node.destroy_node()\n        if rclpy.ok():\n            rclpy.shutdown()\n\n\nif __name__ == \"__main__\":\n    main()",
          "carrot_broadcaster.py"
        ],
        [
          "ul",
          [
            "<code>TransformBroadcaster</code> is the dynamic version: you must send a <b>new transform every time it changes</b>. The timer runs 20 times a second.",
            "<code>angle</code> grows with time, <code>SPEED * seconds</code>, so the carrot moves around a circle of radius 2 m: <code>x = R cos(angle)</code>, <code>y = R sin(angle)</code>.",
            "The <b>timestamp</b> is the current time. TF2 needs it to know <i>when</i> each transform was true.",
            "The carrot also faces along its direction of travel: its heading is the angle plus a quarter turn. The rotation is written as a <b>quaternion</b>, <code>z = sin(yaw / 2)</code> and <code>w = cos(yaw / 2)</code>. That is exactly the formula from lesson 7.5, which explains it."
          ]
        ],
        [
          "h",
          "A listener"
        ],
        [
          "cmd",
          "nano frame_listener.py",
          "Terminal 3 (Ubuntu)"
        ],
        [
          "code",
          "import math\n\nimport rclpy\nfrom rclpy.node import Node\nfrom rclpy.time import Time\nfrom tf2_ros import TransformException\nfrom tf2_ros.buffer import Buffer\nfrom tf2_ros.transform_listener import TransformListener\n\n\nclass FrameListener(Node):\n    def __init__(self):\n        super().__init__(\"frame_listener\")\n        self.buffer = Buffer()\n        self.listener = TransformListener(self.buffer, self)\n        self.create_timer(1.0, self.tick)\n\n    def tick(self):\n        try:\n            t = self.buffer.lookup_transform(\"camera\", \"carrot\", Time())\n        except TransformException as error:\n            self.get_logger().info(f\"Not ready yet: {error}\")\n            return\n        x = t.transform.translation.x\n        y = t.transform.translation.y\n        distance = math.hypot(x, y)\n        bearing = math.degrees(math.atan2(y, x))\n        self.get_logger().info(f\"Carrot seen from the camera: x={x:.2f} y={y:.2f}  distance {distance:.2f} m, bearing {bearing:.0f} deg\")\n\n\ndef main():\n    rclpy.init()\n    node = FrameListener()\n    try:\n        rclpy.spin(node)\n    except KeyboardInterrupt:\n        pass\n    finally:\n        node.destroy_node()\n        if rclpy.ok():\n            rclpy.shutdown()\n\n\nif __name__ == \"__main__\":\n    main()",
          "frame_listener.py"
        ],
        [
          "ul",
          [
            "<code>Buffer</code> is a store of recent transforms. <code>TransformListener(self.buffer, self)</code> subscribes to <code>/tf</code> and <code>/tf_static</code> and keeps the buffer filled. <b>Keep both as attributes</b> of the node (<code>self.buffer</code>), or they are deleted and the buffer stays empty.",
            "<code>lookup_transform(&quot;camera&quot;, &quot;carrot&quot;, Time())</code> asks &quot;where is <b>carrot</b>, in the <b>camera</b> frame?&quot; <code>Time()</code> means &quot;the latest data available&quot;. The order matters: the first name is the frame the answer is expressed in (the <b>target</b>), the second is the frame you are asking about (the <b>source</b>).",
            "The call can <b>fail</b>, for example because the frames have not arrived yet, so it is wrapped in <code>try ... except TransformException</code>.",
            "<code>math.hypot(x, y)</code> is the distance, and <code>math.atan2(y, x)</code> is the bearing, the angle to the left of straight ahead."
          ]
        ],
        [
          "h",
          "Run it all"
        ],
        [
          "p",
          "First start only the <b>listener</b>, in terminal 3, with nothing else running. This shows what happens before the frames exist:"
        ],
        [
          "cmd",
          "python3 frame_listener.py",
          "Terminal 3 (Ubuntu)"
        ],
        [
          "out",
          "[INFO] [...] [frame_listener]: Not ready yet: \"camera\" passed to lookupTransform argument target_frame does not exist."
        ],
        [
          "p",
          "It keeps saying so once a second. That is correct behaviour: nothing has told TF2 about <code>camera</code> yet. Leave it running, then start the two broadcasters, one in terminal 1 and one in terminal 2:"
        ],
        [
          "cmd",
          "python3 static_frames.py",
          "Terminal 1 (Ubuntu)"
        ],
        [
          "out",
          "[INFO] [...] [static_frames]: Published static frames: world -> base_link -> camera"
        ],
        [
          "cmd",
          "python3 carrot_broadcaster.py",
          "Terminal 2 (Ubuntu)"
        ],
        [
          "out",
          "[INFO] [...] [carrot_broadcaster]: Publishing frame: world -> carrot, circling at 2 m"
        ],
        [
          "p",
          "In terminal 3 the listener starts answering:"
        ],
        [
          "out",
          "[INFO] [...] [frame_listener]: Carrot seen from the camera: x=-0.31 y=2.00  distance 2.02 m, bearing 99 deg\n[INFO] [...] [frame_listener]: Carrot seen from the camera: x=-1.25 y=1.70  distance 2.11 m, bearing 126 deg\n[INFO] [...] [frame_listener]: Carrot seen from the camera: x=-1.94 y=0.99  distance 2.18 m, bearing 153 deg\n[INFO] [...] [frame_listener]: Carrot seen from the camera: x=-2.20 y=0.03  distance 2.20 m, bearing 179 deg"
        ],
        [
          "p",
          "Watch the numbers: the carrot circles <b>round the robot</b>. Its bearing grows from 99 to 179 degrees (from just left of straight ahead round to directly behind the camera), and the distance changes a little because the camera is not at the centre of the circle (it is 0.2 m forward). TF2 chained <code>carrot</code> to <code>world</code> to <code>base_link</code> to <code>camera</code> for you."
        ],
        [
          "h",
          "Check it with the tools"
        ],
        [
          "p",
          "Everything you learned in lesson 4.4 works on your own frames. In <b>terminal 4</b>:"
        ],
        [
          "cmd",
          "ros2 run tf2_ros tf2_echo world carrot",
          "Terminal 4 (Ubuntu)"
        ],
        [
          "out",
          "At time 1791292025.215628209\n- Translation: [-1.108, -1.665, 0.000]\nAt time 1791292026.215567903\n- Translation: [-0.174, -1.992, 0.000]"
        ],
        [
          "cmd",
          "ros2 run tf2_ros tf2_echo camera carrot",
          "Terminal 4 (Ubuntu)"
        ],
        [
          "out",
          "At time 1791292028.415776815\n- Translation: [1.497, -1.058, -0.150]"
        ],
        [
          "p",
          "The <code>-0.150</code> is the carrot&apos;s height difference: the camera is 0.15 m <b>above</b> the carrot&apos;s plane. Now view the whole tree:"
        ],
        [
          "cmd",
          "ros2 run tf2_tools view_frames",
          "Terminal 4 (Ubuntu)"
        ],
        [
          "out",
          "[INFO] [...] [view_frames]: Result:tf2_msgs.srv.FrameGraph_Response(frame_yaml=\"base_link: \\n  parent: 'world'\\n  broadcaster: 'default_authority'\\n  rate: 10000.000 ... (shortened)\\ncamera: \\n  parent: 'base_link' ... carrot: \\n  parent: 'world'\\n  broadcaster: 'default_authority'\\n  rate: 20.199 ..."
        ],
        [
          "p",
          "Two things to read from it. The <b>parents</b> form a tree: <code>world</code> at the top, with <code>base_link</code> and <code>carrot</code> hanging off it, and <code>camera</code> under <code>base_link</code>. And the <b>rate</b> column says <code>10000</code> for the static frames (a placeholder for &quot;static&quot;) and about <code>20</code> for the carrot, which is the 20 times a second you coded."
        ],
        [
          "warn",
          "Stop everything with <code>Ctrl+C</code> in each terminal. Leftover broadcasters keep publishing frames and confuse the next experiment."
        ],
        [
          "try",
          "Change <code>RADIUS</code> to <code>1.0</code> in <code>carrot_broadcaster.py</code> and <code>SPEED</code> to <code>1.0</code>, restart it, and watch the listener. Then change the camera in <code>static_frames.py</code> to be 0.2 m to the <b>left</b> (<code>y = 0.2</code>) and see how the bearing changes."
        ],
        [
          "quiz",
          {
            "q": "<code>lookup_transform(&quot;camera&quot;, &quot;carrot&quot;, Time())</code> returns...",
            "options": [
              "The position of the camera, in the carrot frame",
              "The position of the carrot, in the camera frame",
              "The time of the carrot",
              "The size of the carrot"
            ],
            "answer": 1,
            "why": "The first frame is the one the answer is expressed in (target), and the second is the frame you are asking about (source). The result says where <b>carrot</b> is, as seen from <b>camera</b>."
          }
        ],
        [
          "quiz",
          {
            "q": "Which broadcaster do you use for a frame that never changes, like a camera bolted to the robot?",
            "options": [
              "TransformBroadcaster",
              "StaticTransformBroadcaster",
              "Buffer",
              "TransformListener"
            ],
            "answer": 1,
            "why": "<code>StaticTransformBroadcaster</code> publishes once and is remembered. A moving frame needs <code>TransformBroadcaster</code>, called again each time the frame changes."
          }
        ]
      ]
    },
    {
      "id": "7.5",
      "title": "Quaternions and debugging TF problems",
      "minutes": 35,
      "blocks": [
        [
          "p",
          "Two things have been waiting for an explanation. The four-number rotations you have seen in <code>/odom</code> (lesson 4.10) and in your broadcasters, and the cryptic errors TF2 gives you when something is wrong. Here are both."
        ],
        [
          "h",
          "Quaternions in one page"
        ],
        [
          "p",
          "A <b>quaternion</b> is four numbers <code>(x, y, z, w)</code> that describe a 3D rotation. ROS uses them because they are compact, never get &quot;stuck&quot; (the problem called gimbal lock with roll, pitch and yaw), and are easy to combine. But they are unreadable for humans: nobody sees <code>z = 0.7071, w = 0.7071</code> and thinks &quot;a quarter turn&quot;."
        ],
        [
          "p",
          "For a robot on a flat floor, there is only <b>one</b> rotation that matters: <b>yaw</b>, the heading, a turn around the vertical axis. Then <code>x</code> and <code>y</code> are always zero, and you only need two simple formulas:"
        ],
        [
          "ul",
          [
            "<b>Heading to quaternion</b>: <code>z = sin(yaw / 2)</code>, <code>w = cos(yaw / 2)</code>.",
            "<b>Quaternion to heading</b>: <code>yaw = atan2(2(w z + x y), 1 − 2(y² + z²))</code>."
          ]
        ],
        [
          "p",
          "Put them in a small file you can import in any project:"
        ],
        [
          "cmd",
          "nano quat_tools.py",
          "Terminal 1 (Ubuntu)"
        ],
        [
          "code",
          "import math\n\n\ndef yaw_to_quaternion(yaw):\n    \"\"\"Return (x, y, z, w) for a rotation of `yaw` radians around the vertical axis.\"\"\"\n    return (0.0, 0.0, math.sin(yaw / 2), math.cos(yaw / 2))\n\n\ndef quaternion_to_yaw(x, y, z, w):\n    \"\"\"Return the heading (rotation around the vertical axis) in radians.\"\"\"\n    return math.atan2(2 * (w * z + x * y), 1 - 2 * (y * y + z * z))\n\n\nif __name__ == \"__main__\":\n    for degrees in (0, 45, 90, 180, -90):\n        yaw = math.radians(degrees)\n        x, y, z, w = yaw_to_quaternion(yaw)\n        back = math.degrees(quaternion_to_yaw(x, y, z, w))\n        print(f\"{degrees:5d} deg -> z={z:.4f} w={w:.4f} -> back to {back:.1f} deg\")\n\n    # the turn from lesson 4.10\n    heading = math.degrees(quaternion_to_yaw(0.0, 0.0, 0.7898948293674187, 0.6132423326374108))\n    print(f\"mybot turned {heading:.1f} degrees\")",
          "quat_tools.py"
        ],
        [
          "cmd",
          "python3 quat_tools.py",
          "Terminal 1 (Ubuntu)"
        ],
        [
          "out",
          "    0 deg -> z=0.0000 w=1.0000 -> back to 0.0 deg\n   45 deg -> z=0.3827 w=0.9239 -> back to 45.0 deg\n   90 deg -> z=0.7071 w=0.7071 -> back to 90.0 deg\n  180 deg -> z=1.0000 w=0.0000 -> back to 180.0 deg\n  -90 deg -> z=-0.7071 w=0.7071 -> back to -90.0 deg\nmybot turned 104.4 degrees"
        ],
        [
          "ul",
          [
            "<b>No rotation</b> is <code>w = 1</code> and everything else 0, which is what you wrote as <code>rotation.w = 1.0</code> in lesson 7.4.",
            "A <b>quarter turn</b> (90 degrees) has <code>z = w = 0.7071</code>, the square root of one half.",
            "A <b>half turn</b> (180 degrees) is <code>z = 1</code> and <code>w = 0</code>. The numbers use <b>half</b> the angle, which is why the formula divides yaw by 2.",
            "The last line decodes the odometry of <code>mybot</code> from lesson 4.10 (<code>z = 0.79</code>, <code>w = 0.61</code>): the robot turned <b>104.4 degrees</b>. That was the &quot;about 100 degrees&quot; promised there."
          ]
        ],
        [
          "p",
          "ROS also ships a ready-made helper that handles all three rotation axes. It is useful when you have a full 3D rotation, for instance from a drone or an arm:"
        ],
        [
          "cmd",
          "python3 -c \"import math; from tf_transformations import quaternion_from_euler, euler_from_quaternion; q = quaternion_from_euler(0, 0, math.radians(90)); print([round(float(v), 4) for v in q]); print([round(math.degrees(v), 1) for v in euler_from_quaternion(q)])\"",
          "Terminal 1 (Ubuntu)"
        ],
        [
          "out",
          "[0.0, 0.0, 0.7071, 0.7071]\n[0.0, -0.0, 90.0]"
        ],
        [
          "p",
          "The same <code>0.7071, 0.7071</code> as your hand-made function, and 90 degrees back. <code>quaternion_from_euler</code> takes roll, pitch and yaw. For a flat floor your two-line functions are enough, and easier to read."
        ],
        [
          "warn",
          "A new <code>Quaternion</code> (and so a new <code>TransformStamped</code>) starts as <code>(0, 0, 0, 1)</code>, which is &quot;no rotation&quot;, so you only need to fill in the rotation when you actually turn. The trap is setting <b>only part</b> of it. If you write <code>rotation.z = sin(yaw / 2)</code> and forget <code>rotation.w</code>, <code>w</code> stays at 1 and you get <code>(0, 0, z, 1)</code>, which is not a proper rotation, and the angles come out wrong. Always set <b>both</b> <code>z</code> and <code>w</code>, as the carrot broadcaster does."
        ],
        [
          "h",
          "When TF2 complains"
        ],
        [
          "p",
          "Most TF problems are one of four things. This script triggers each one on purpose (with the static frames and the carrot from lesson 7.4 running), so you can recognise the message:"
        ],
        [
          "cmd",
          "nano tf_errors.py",
          "Terminal 2 (Ubuntu)"
        ],
        [
          "code",
          "import rclpy\nfrom rclpy.duration import Duration\nfrom rclpy.node import Node\nfrom rclpy.time import Time\nfrom tf2_ros.buffer import Buffer\nfrom tf2_ros.transform_listener import TransformListener\n\n\nclass Errors(Node):\n    def __init__(self):\n        super().__init__(\"tf_errors\")\n        self.buffer = Buffer()\n        self.listener = TransformListener(self.buffer, self)\n\n    def attempt(self, label, target, source, when):\n        try:\n            self.buffer.lookup_transform(target, source, when)\n            print(f\"{label}: OK\")\n        except Exception as error:\n            print(f\"{label}: {type(error).__name__}: {error}\")\n\n\ndef main():\n    rclpy.init()\n    node = Errors()\n    end = node.get_clock().now() + Duration(seconds=3)\n    while node.get_clock().now() < end:\n        rclpy.spin_once(node, timeout_sec=0.1)\n    now = node.get_clock().now()\n    node.attempt(\"1 normal      \", \"world\", \"carrot\", Time())\n    node.attempt(\"2 no such frame\", \"world\", \"banana\", Time())\n    node.attempt(\"3 future      \", \"world\", \"carrot\", now + Duration(seconds=5))\n    node.attempt(\"4 long ago    \", \"world\", \"carrot\", now - Duration(seconds=60))\n    node.destroy_node()\n    rclpy.shutdown()\n\n\nmain()",
          "tf_errors.py"
        ],
        [
          "cmd",
          "python3 tf_errors.py",
          "Terminal 2 (Ubuntu)"
        ],
        [
          "out",
          "1 normal      : OK\n2 no such frame: LookupException: \"banana\" passed to lookupTransform argument source_frame does not exist.\n3 future      : ExtrapolationException: Lookup would require extrapolation into the future.  Requested time 1791292068.876410 but the latest data is at time 1791292063.874413, when looking up transform from frame [carrot] to frame [world]\n4 long ago    : ExtrapolationException: Lookup would require extrapolation into the past.  Requested time 1791292003.876410 but the earliest data is at time 1791292060.874286, when looking up transform from frame [carrot] to frame [world]"
        ],
        [
          "ul",
          [
            "<b>LookupException: ... does not exist</b>: the <b>frame name is not known</b>. Either nothing is broadcasting it (yet), or you misspelled it. Notice that the message says which argument was wrong: <code>source_frame</code> or <code>target_frame</code>.",
            "<b>ExtrapolationException ... into the future</b>: you asked for a time <b>later than the latest data</b>. Use <code>Time()</code> (&quot;latest&quot;), or ask for a time slightly in the past. This is the most common error when a node asks for &quot;now&quot; just before the transform has arrived.",
            "<b>ExtrapolationException ... into the past</b>: the buffer only keeps about the last <b>10 seconds</b>, and you asked for older data.",
            "<b>Could not find a connection ... not part of the same tree</b>: the frames <b>exist but are not connected</b>. Described next."
          ]
        ],
        [
          "p",
          "To see the fourth error, publish a frame that hangs off a parent nobody else knows, and ask for a transform to it:"
        ],
        [
          "cmd",
          "ros2 run tf2_ros static_transform_publisher --x 1 --frame-id island_parent --child-frame-id island",
          "Terminal 3 (Ubuntu)"
        ],
        [
          "cmd",
          "ros2 run tf2_ros tf2_echo world island",
          "Terminal 4 (Ubuntu)"
        ],
        [
          "out",
          "[INFO] [...] [tf2_echo]: Waiting for transform world ->  island: Could not find a connection between 'world' and 'island' because they are not part of the same tree.Tf has two or more unconnected trees."
        ],
        [
          "p",
          "<code>island</code> hangs from <code>island_parent</code>, and <code>island_parent</code> has no link to <code>world</code>, so there are <b>two separate trees</b>. The fix is to make sure one of the broadcasters connects the trees, for example by publishing <code>world</code> to <code>island_parent</code>."
        ],
        [
          "h",
          "A debugging checklist"
        ],
        [
          "ul",
          [
            "<b>1. See the tree.</b> <code>ros2 run tf2_tools view_frames</code> and look at the parents. Is the frame there? Is it connected to the one you ask about?",
            "<b>2. Ask TF2 yourself.</b> <code>ros2 run tf2_ros tf2_echo A B</code> asks the same question your code asks. If the command works but your code does not, the problem is in your code (frame order, timing).",
            "<b>3. Check the frame names.</b> A single typo (<code>base_link</code> vs <code>base_footprint</code>) is the most common problem.",
            "<b>4. Check the timestamps and the clock.</b> In the simulator, every node must agree on the time (<code>use_sim_time</code>, lessons 5.1 and 4.10). Mixed clocks cause future and past errors that do not make sense.",
            "<b>5. Check the health of the broadcasters.</b> <code>ros2 run tf2_ros tf2_monitor</code> listens for about 10 seconds, then reports for each frame how often it is published and how late it arrives (<code>Average Delay</code>, <code>Max Delay</code>). A frame that is missing, slow or very late is your culprit."
          ]
        ],
        [
          "try",
          "Run <code>tf_errors.py</code> yourself and read each message. Then change the order in <code>frame_listener.py</code> from (<code>&quot;camera&quot;, &quot;carrot&quot;</code>) to (<code>&quot;carrot&quot;, &quot;camera&quot;</code>) and compare the numbers. Which way round is the answer the reverse of the other?"
        ],
        [
          "quiz",
          {
            "q": "A transform for <code>world</code> to <code>carrot</code> is broadcast once at the start. Later your listener asks for a time 5 seconds in the <b>future</b>. What happens?",
            "options": [
              "TF2 predicts the position",
              "ExtrapolationException: it cannot look into the future",
              "It returns zero",
              "It waits 5 seconds and then answers"
            ],
            "answer": 1,
            "why": "TF2 only interpolates between times it has data for. Asking beyond the latest data raises an ExtrapolationException. Use <code>Time()</code> for the latest, or a time slightly in the past."
          }
        ],
        [
          "quiz",
          {
            "q": "<code>tf2_echo</code> says <i>they are not part of the same tree</i>. What does that mean?",
            "options": [
              "The two frames are connected, but only one-way",
              "Both frames exist, but nothing connects them, so TF2 cannot work out a transform",
              "The frame names are the same",
              "The computer has run out of memory"
            ],
            "answer": 1,
            "why": "TF2 keeps a tree of frames. Two groups of frames with no common parent cannot be compared until something links them."
          }
        ]
      ]
    },
    {
      "id": "7.6",
      "title": "Capstone: the turtle that chases a carrot",
      "minutes": 60,
      "blocks": [
        [
          "p",
          "In this capstone you build the classic ROS 2 follow-me program: a turtle that <b>chases a moving target</b>, using TF2 to work out where the target is relative to itself. Everything comes from this module: broadcasting frames, listening, quaternions, and (from Module 6) publishers and subscribers."
        ],
        [
          "h",
          "The setup"
        ],
        [
          "p",
          "Turtlesim&apos;s turtle does not publish TF frames, only a <code>Pose</code> message. Your program must turn it into a frame. The target is a <b>carrot</b> frame that circles the middle of the turtlesim window. Here is the carrot broadcaster, which is provided (it is the one from lesson 7.4, moved to the middle of the window):"
        ],
        [
          "cmd",
          "nano turtle_carrot.py",
          "Terminal 3 (Ubuntu)"
        ],
        [
          "code",
          "import math\n\nimport rclpy\nfrom geometry_msgs.msg import TransformStamped\nfrom rclpy.node import Node\nfrom tf2_ros import TransformBroadcaster\n\nCENTER = (5.5, 5.5)\nRADIUS = 2.5\nSPEED = 0.5\n\n\nclass CarrotBroadcaster(Node):\n    def __init__(self):\n        super().__init__(\"carrot_broadcaster\")\n        self.broadcaster = TransformBroadcaster(self)\n        self.start = self.get_clock().now()\n        self.create_timer(0.05, self.tick)\n        self.get_logger().info(\"Publishing frame: world -> carrot, circling around (5.5, 5.5)\")\n\n    def tick(self):\n        now = self.get_clock().now()\n        angle = SPEED * (now - self.start).nanoseconds / 1e9\n        yaw = angle + math.pi / 2\n\n        t = TransformStamped()\n        t.header.stamp = now.to_msg()\n        t.header.frame_id = \"world\"\n        t.child_frame_id = \"carrot\"\n        t.transform.translation.x = CENTER[0] + RADIUS * math.cos(angle)\n        t.transform.translation.y = CENTER[1] + RADIUS * math.sin(angle)\n        t.transform.rotation.z = math.sin(yaw / 2)\n        t.transform.rotation.w = math.cos(yaw / 2)\n        self.broadcaster.sendTransform(t)\n\n\ndef main():\n    rclpy.init()\n    node = CarrotBroadcaster()\n    try:\n        rclpy.spin(node)\n    except KeyboardInterrupt:\n        pass\n    finally:\n        node.destroy_node()\n        if rclpy.ok():\n            rclpy.shutdown()\n\n\nif __name__ == \"__main__\":\n    main()",
          "turtle_carrot.py"
        ],
        [
          "p",
          "Turtlesim&apos;s window is 11 by 11 units, so (5.5, 5.5) is the middle. The frame called <code>world</code> uses the <b>same coordinates as turtlesim</b>, so the carrot goes round the turtle&apos;s starting spot."
        ],
        [
          "h",
          "The task"
        ],
        [
          "p",
          "Write <code>turtle_follower.py</code>, one node that does the following:"
        ],
        [
          "ul",
          [
            "<b>Turn the pose into a frame.</b> Subscribe to <code>/turtle1/pose</code> (<code>turtlesim/msg/Pose</code>). Each time a pose arrives, broadcast a transform from <code>world</code> to a child frame called <code>turtle1</code>, at the pose&apos;s <code>x</code> and <code>y</code>, with its <code>theta</code> as the rotation. The rotation formula is in lesson 7.5, and remember that a <code>TransformStamped</code> needs a proper quaternion.",
            "<b>Find the carrot.</b> Ten times a second, ask TF2 for the position of <code>carrot</code> <b>in the</b> <code>turtle1</code> frame. That tells you where the carrot is <i>relative to the turtle</i>: <code>x</code> is straight ahead and <code>y</code> is to the left. Skip the cycle (<code>return</code>) when the lookup fails, because the first few lookups happen before the frames exist.",
            "<b>Chase it.</b> Publish a <code>Twist</code> to <code>/turtle1/cmd_vel</code>. A simple rule works well: <code>angular.z = 4.0 × atan2(y, x)</code> (turn towards the carrot) and <code>linear.x = 0.5 × distance</code> (go faster when it is far).",
            "<b>Report.</b> Log the distance to the carrot, at most once every 3 seconds.",
            "<b>Stop cleanly.</b> On <code>Ctrl+C</code>, publish a zero <code>Twist</code> before exiting, with the guard you used in lesson 4.6 (<code>if rclpy.ok()</code>)."
          ]
        ],
        [
          "p",
          "Setup: turtlesim in terminal 1, the carrot in terminal 3, your program in terminal 2. Start the carrot first, and your follower second."
        ],
        [
          "h",
          "What good looks like"
        ],
        [
          "p",
          "The turtle should swing round, set off towards the circling carrot, and follow it around the window, always a little behind. The log looks like this (exact numbers vary):"
        ],
        [
          "out",
          "[INFO] [...] [turtle_follower]: carrot is 2.44 units away\n[INFO] [...] [turtle_follower]: carrot is 1.56 units away\n[INFO] [...] [turtle_follower]: carrot is 1.88 units away\n[INFO] [...] [turtle_follower]: carrot is 1.90 units away\n[INFO] [...] [turtle_follower]: carrot is 1.85 units away\n[INFO] [...] [turtle_follower]: carrot is 1.83 units away"
        ],
        [
          "p",
          "The distance falls quickly and then <b>settles around 1.8 to 1.9 units</b>. The turtle never catches the carrot, because this rule only turns and speeds up in proportion to how far away the carrot is, so it trails behind by a steady gap. If your distance keeps growing instead, check the sign of the angle, and the order of the two names in your lookup."
        ],
        [
          "note",
          "You can also check your frames with the tools from 7.4 and 7.5: <code>ros2 run tf2_ros tf2_echo turtle1 carrot</code> should show the same numbers your program uses, and <code>ros2 run tf2_ros tf2_monitor</code> should list both <code>turtle1</code> and <code>carrot</code> as frames, publishing 80 or so times a second together."
        ],
        [
          "h",
          "Stretch goals"
        ],
        [
          "ul",
          [
            "<b>Catch it.</b> Change the rule so the turtle gets closer. What happens with a bigger multiplier for <code>linear.x</code>? What if you make the turtle slower than the carrot?",
            "<b>A second follower.</b> Spawn <code>turtle2</code> (the service from lesson 6.1) and make it follow <b>turtle1</b> instead of the carrot, by broadcasting a frame for each turtle.",
            "<b>Record it.</b> Record <code>/turtle1/pose</code> and <code>/tf</code> in a bag (lesson 7.1) while the chase runs, then use <code>read_bag.py</code> as a template to compute the average distance travelled.",
            "<b>Use your helper.</b> Replace the two quaternion formulas with <code>yaw_to_quaternion</code> from your <code>quat_tools.py</code> (lesson 7.5).",
            "<b>Log levels.</b> Add a DEBUG message with the angle you command, and show it with <code>--ros-args --log-level turtle_follower:=debug</code> (lesson 7.2)."
          ]
        ],
        [
          "note",
          "No solution is given on purpose. Everything you need is in lessons 6.1, 7.4 and 7.5. If you get stuck, paste your code and the error to Claude and ask for a hint, not the answer."
        ],
        [
          "warn",
          "Restart turtlesim before each run if the turtle ends up in a corner or facing the wall. Press <code>Ctrl+C</code> in every terminal when you finish, so no broadcaster keeps running."
        ],
        [
          "try",
          "Do the capstone. When the turtle chases the carrot and your log shows the distance settling to a steady value, mark this quest complete."
        ],
        [
          "quiz",
          {
            "q": "To know where the carrot is <i>relative to the turtle</i>, which lookup do you make?",
            "options": [
              "lookup_transform(&quot;carrot&quot;, &quot;turtle1&quot;, Time())",
              "lookup_transform(&quot;turtle1&quot;, &quot;carrot&quot;, Time())",
              "lookup_transform(&quot;world&quot;, &quot;world&quot;, Time())",
              "lookup_transform(&quot;turtle1&quot;, &quot;turtle1&quot;, Time())"
            ],
            "answer": 1,
            "why": "The first frame is the one the answer is in. So (<code>turtle1</code>, <code>carrot</code>) gives the carrot&apos;s position in the turtle&apos;s own frame: <code>x</code> ahead, <code>y</code> to the left."
          }
        ],
        [
          "h",
          "Module complete"
        ],
        [
          "p",
          "You can now record and replay data, control and filter your logs, check a system&apos;s health, and manage TF frames in Python, with the tools to debug them. Together with Modules 4 to 6, you have the full toolkit for everyday ROS 2 development in simulation."
        ]
      ]
    }
  ]
});
