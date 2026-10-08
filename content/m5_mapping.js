window.MODULES = window.MODULES || [];
window.MODULES.push({
  "order": 5,
  "title": "5 · Mapping your world",
  "lessons": [
    {
      "id": "5.1",
      "title": "What is SLAM?",
      "minutes": 30,
      "blocks": [
        [
          "p",
          "In Module 4 the robot navigated on a map that somebody else had made. A robot arriving somewhere new has no map, so it has to <b>build one while it explores</b>. That is called <b>SLAM</b>: <b>S</b>imultaneous <b>L</b>ocalization <b>A</b>nd <b>M</b>apping. &quot;Simultaneous&quot; is the hard part. To draw the map you must know where you are, and to know where you are you need the map."
        ],
        [
          "p",
          "Two sensors make it possible:"
        ],
        [
          "ul",
          [
            "<b>Wheel odometry</b> says how far the wheels turned. It is smooth but <b>drifts</b>: wheels slip, and small errors pile up until the robot thinks it is somewhere it is not.",
            "<b>The lidar</b> sees the walls accurately, but a single scan does not say where the robot is."
          ]
        ],
        [
          "p",
          "SLAM combines them. Each new lidar scan is <b>matched against the map built so far</b>, and the match corrects the drift. The correction is published as the <code>map</code> to <code>odom</code> transform, exactly the one AMCL published in lesson 4.7, except now the node is building the map instead of using a finished one. The node that does this is <b>slam_toolbox</b>."
        ],
        [
          "h",
          "Start the world, SLAM and RViz"
        ],
        [
          "p",
          "Use the same setup as Module 4 (software rendering and <code>TURTLEBOT3_MODEL=burger</code> from <code>~/.bashrc</code>). In <b>terminal 1</b>, start the pillar world:"
        ],
        [
          "cmd",
          "ros2 launch turtlebot3_gazebo turtlebot3_world.launch.py",
          "Terminal 1 (Ubuntu)"
        ],
        [
          "p",
          "Wait for the Gazebo window and the robot. In <b>terminal 2</b>, start SLAM:"
        ],
        [
          "cmd",
          "ros2 launch slam_toolbox online_async_launch.py use_sim_time:=True",
          "Terminal 2 (Ubuntu)"
        ],
        [
          "out",
          "[async_slam_toolbox_node-1] [INFO] [...] [slam_toolbox]: Node using stack size 40000000\n[async_slam_toolbox_node-1] [INFO] [...] [slam_toolbox]: Using solver plugin solver_plugins::CeresSolver\n[async_slam_toolbox_node-1] [INFO] [...] [slam_toolbox]: CeresSolver: Using SCHUR_JACOBI preconditioner."
        ],
        [
          "ul",
          [
            "<code>online</code> means it works live while the robot drives. <code>async</code> means it does not make the robot wait for each scan to be processed, which keeps things smooth.",
            "<code>use_sim_time:=True</code> tells the node to use <b>Gazebo&apos;s clock</b> instead of the computer&apos;s. If the simulator and SLAM disagree about the time, their data cannot be lined up and nothing works. SLAM needs this when it works with the simulator.",
            "<code>CeresSolver</code> is the maths library that does the scan-matching and drift correction."
          ]
        ],
        [
          "note",
          "You will also see a warning about the minimum laser range setting. It is harmless: SLAM just clips the setting to what this lidar can actually do."
        ],
        [
          "p",
          "In <b>terminal 3</b>, open RViz with the TurtleBot3 map view. It is already set up to show the map, the lidar scan and the robot&apos;s frames:"
        ],
        [
          "cmd",
          "rviz2 -d $(ros2 pkg prefix turtlebot3_cartographer)/share/turtlebot3_cartographer/rviz/tb3_cartographer.rviz --ros-args -p use_sim_time:=true",
          "Terminal 3 (Ubuntu)"
        ],
        [
          "warn",
          "<code>slam_toolbox</code> has an RViz file of its own, but on this install it is almost empty: only a grid and a side panel, no map. If you open it you will think nothing works. Use the TurtleBot3 file above."
        ],
        [
          "p",
          "In RViz you will see:"
        ],
        [
          "ul",
          [
            "A <b>small patch of light grey</b> around the robot: floor the lidar has seen. <b>Black</b> lines are walls. The <b>dark teal</b> everywhere else is <b>unknown</b>, not yet seen.",
            "<b>Red dots</b>: the live lidar scan.",
            "The robot&apos;s <b>coloured axes</b> (TF frames, lesson 4.4)."
          ]
        ],
        [
          "h",
          "What did SLAM add to the system?"
        ],
        [
          "cmd",
          "ros2 topic list | grep -E \"map|slam|scan|^/tf\"",
          "Terminal 4 (Ubuntu)"
        ],
        [
          "out",
          "/map\n/map_metadata\n/scan\n/slam_toolbox/feedback\n/slam_toolbox/graph_visualization\n/slam_toolbox/scan_visualization\n/slam_toolbox/update\n/tf\n/tf_static"
        ],
        [
          "cmd",
          "ros2 topic info /map",
          "Terminal 4 (Ubuntu)"
        ],
        [
          "out",
          "Type: nav_msgs/msg/OccupancyGrid\nPublisher count: 1\nSubscription count: ..."
        ],
        [
          "p",
          "<code>/map</code> is the map itself, as an <b>OccupancyGrid</b>: a grid of cells, each one marked free, occupied, or unknown. This is the same message type Nav2&apos;s map server publishes in Module 4."
        ],
        [
          "cmd",
          "ros2 node list | grep -iE \"slam|gazebo|robot_state\"",
          "Terminal 4 (Ubuntu)"
        ],
        [
          "out",
          "/gazebo\n/robot_state_publisher\n/slam_toolbox"
        ],
        [
          "cmd",
          "ros2 run tf2_ros tf2_echo map odom",
          "Terminal 4 (Ubuntu)"
        ],
        [
          "out",
          "At time 13.913000000\n- Translation: [0.000, 0.000, 0.006]\n... (press Ctrl+C)"
        ],
        [
          "p",
          "At the start <code>map</code> and <code>odom</code> coincide. As the robot drives and odometry drifts, SLAM adjusts this transform so the robot&apos;s position <i>on the map</i> stays right. That adjustment is the &quot;localization&quot; half of SLAM."
        ],
        [
          "h",
          "Drive and watch it grow"
        ],
        [
          "p",
          "In <b>terminal 4</b> (press <code>Ctrl+C</code> in it first if <code>tf2_echo</code> is still running), drive with the keyboard. The program prints its own list of keys, and you must keep that terminal selected while typing:"
        ],
        [
          "cmd",
          "ros2 run turtlebot3_teleop teleop_keyboard",
          "Terminal 4 (Ubuntu)"
        ],
        [
          "p",
          "Drive slowly: <code>w</code> to speed up, <code>a</code> and <code>d</code> to turn, <code>s</code> to stop. In RViz, the light-grey area spreads and new walls appear as the lidar sees them."
        ],
        [
          "warn",
          "Close everything cleanly when you finish: <code>Ctrl+C</code> in every terminal, then check <code>pgrep -f \"gzserver|slam_toolbox|rviz2\"</code> prints nothing (see lessons 4.5 and 4.7). Leftover processes make the next launch fail or lag."
        ],
        [
          "try",
          "Drive the robot once around the room with the keyboard, going slowly, and watch the map grow in RViz. Notice how the map only fills in where the lidar has actually seen."
        ],
        [
          "quiz",
          {
            "q": "Why can&apos;t a robot simply build a map using only its wheel odometry?",
            "options": [
              "Odometry does not work indoors",
              "Odometry drifts, so small errors add up and the map would smear and bend",
              "Odometry only works in simulation",
              "Odometry cannot measure distance"
            ],
            "answer": 1,
            "why": "Wheels slip and measurement errors accumulate. SLAM uses the lidar to <b>correct</b> that drift by matching each scan to the map built so far."
          }
        ],
        [
          "quiz",
          {
            "q": "Which transform does <code>slam_toolbox</code> publish to correct for odometry drift?",
            "options": [
              "base_link to head",
              "map to odom",
              "odom to base_link",
              "camera to base_link"
            ],
            "answer": 1,
            "why": "<code>odom</code> to <code>base_link</code> comes from the wheels. SLAM publishes <code>map</code> to <code>odom</code>, the correction that ties the drifting odometry to the map."
          }
        ]
      ]
    },
    {
      "id": "5.2",
      "title": "Driving a good map",
      "minutes": 30,
      "blocks": [
        [
          "p",
          "A map is only as good as the driving that produced it. Some habits make a big difference, on real robots even more than in the simulator:"
        ],
        [
          "ul",
          [
            "<b>Go slowly and smoothly.</b> Fast turns smear the scan and make matching harder.",
            "<b>Keep walls in view.</b> The lidar has to see something it can recognise. A long empty hall with smooth parallel walls is hard, because every scan looks the same.",
            "<b>Cover the whole space.</b> Anything the lidar has not seen stays <b>unknown</b>.",
            "<b>Come back to places you have already been.</b> When the robot recognises a place it saw earlier, SLAM can correct the error built up since then. This is called <b>loop closure</b>."
          ]
        ],
        [
          "p",
          "Driving by hand is slow, so let the robot drive itself. You will write a small program that wanders and avoids obstacles, using exactly the lidar skills from lesson 4.6."
        ],
        [
          "h",
          "A wandering robot"
        ],
        [
          "cmd",
          "cd ~/robot_practice && nano wander.py",
          "Terminal 4 (Ubuntu)"
        ],
        [
          "code",
          "import math\nimport time\n\nimport rclpy\nfrom rclpy.node import Node\nfrom rclpy.qos import qos_profile_sensor_data\nfrom geometry_msgs.msg import Twist\nfrom sensor_msgs.msg import LaserScan\n\nRUN_SECONDS = 170\n\n\nclass Wander(Node):\n    def __init__(self):\n        super().__init__(\"wander\")\n        self.publisher = self.create_publisher(Twist, \"/cmd_vel\", 10)\n        self.create_subscription(LaserScan, \"/scan\", self.on_scan, qos_profile_sensor_data)\n        self.create_timer(0.1, self.drive)\n        self.front = 9.0\n        self.left = 9.0\n        self.right = 9.0\n        self.turning = False\n        self.direction = 1.0\n\n    def on_scan(self, msg):\n        def nearest(beams):\n            seen = [r for r in beams if math.isfinite(r) and r > msg.range_min]\n            return min(seen) if seen else 9.0\n\n        ranges = list(msg.ranges)\n        self.front = nearest(ranges[:20] + ranges[-20:])\n        self.left = nearest(ranges[60:120])\n        self.right = nearest(ranges[240:300])\n\n    def drive(self):\n        cmd = Twist()\n        if self.turning:\n            cmd.angular.z = 0.6 * self.direction\n            if self.front > 0.9:\n                self.turning = False\n        elif self.front < 0.55:\n            self.turning = True\n            self.direction = 1.0 if self.left > self.right else -1.0\n        else:\n            cmd.linear.x = 0.18\n        self.publisher.publish(cmd)\n\n\ndef main():\n    rclpy.init()\n    node = Wander()\n    start = time.time()\n    try:\n        while rclpy.ok() and time.time() - start < RUN_SECONDS:\n            rclpy.spin_once(node, timeout_sec=0.1)\n    except KeyboardInterrupt:\n        pass\n    finally:\n        if rclpy.ok():\n            node.publisher.publish(Twist())\n        node.destroy_node()\n        if rclpy.ok():\n            rclpy.shutdown()\n\n\nif __name__ == \"__main__\":\n    main()",
          "wander.py"
        ],
        [
          "p",
          "How it decides what to do:"
        ],
        [
          "ul",
          [
            "<code>on_scan</code> measures the nearest obstacle in three sectors: <b>front</b> (20 beams either side of straight ahead), <b>left</b> (beams 60 to 119) and <b>right</b> (beams 240 to 299). <code>nearest</code> is the same filtering you wrote in 4.6, and it returns <code>9.0</code> when nothing is seen.",
            "<code>drive</code> runs 10 times a second. Normally it drives forward at 0.18 m/s.",
            "If something is closer than <b>0.55 m</b> ahead, it starts <b>turning</b>, towards whichever side (left or right) has more room.",
            "It keeps turning until the front is clear to <b>0.9 m</b>. Two different numbers (0.55 to start, 0.9 to stop) stop the robot flicking back and forth at the edge. This trick is called <b>hysteresis</b>.",
            "After <code>RUN_SECONDS</code> (170) the program stops the robot and exits."
          ]
        ],
        [
          "h",
          "Measure the map as it grows"
        ],
        [
          "p",
          "A second small node can count how much of the map is known. It subscribes to <code>/map</code> and prints every 20 seconds."
        ],
        [
          "cmd",
          "nano mapstat.py",
          "Terminal 5 (Ubuntu)"
        ],
        [
          "code",
          "import time\n\nimport rclpy\nfrom rclpy.node import Node\nfrom rclpy.qos import QoSProfile, DurabilityPolicy\nfrom nav_msgs.msg import OccupancyGrid\n\n\nclass MapStat(Node):\n    def __init__(self):\n        super().__init__(\"mapstat\")\n        self.last_print = 0\n        latched = QoSProfile(depth=1, durability=DurabilityPolicy.TRANSIENT_LOCAL)\n        self.create_subscription(OccupancyGrid, \"/map\", self.on_map, latched)\n\n    def on_map(self, msg):\n        if time.time() - self.last_print < 20:\n            return\n        self.last_print = time.time()\n        known = sum(1 for cell in msg.data if cell != -1)\n        print(f\"map {msg.info.width}x{msg.info.height}, known cells {known}\", flush=True)\n\n\ndef main():\n    rclpy.init()\n    node = MapStat()\n    try:\n        rclpy.spin(node)\n    except KeyboardInterrupt:\n        pass\n    finally:\n        node.destroy_node()\n        if rclpy.ok():\n            rclpy.shutdown()\n\n\nif __name__ == \"__main__\":\n    main()",
          "mapstat.py"
        ],
        [
          "p",
          "<code>OccupancyGrid.data</code> holds one number per cell: <code>-1</code> for unknown, <code>0</code> for free, up to <code>100</code> for occupied. So counting the cells that are <b>not</b> <code>-1</code> counts everything the robot has seen. The odd-looking <code>QoSProfile</code> with <code>TRANSIENT_LOCAL</code> means &quot;also give me the latest map that was published before I started&quot;. A map is published rarely, so a new subscriber would otherwise wait."
        ],
        [
          "h",
          "Run it all"
        ],
        [
          "p",
          "Start the world (terminal 1), SLAM (terminal 2) and RViz (terminal 3) as in lesson 5.1. Then in terminal 5 start the counter, and in terminal 4 start the wanderer:"
        ],
        [
          "cmd",
          "cd ~/robot_practice && python3 mapstat.py",
          "Terminal 5 (Ubuntu)"
        ],
        [
          "cmd",
          "python3 wander.py",
          "Terminal 4 (Ubuntu)"
        ],
        [
          "p",
          "Watch RViz: the robot trundles around, turns away from walls and pillars, and the light-grey area spreads. In terminal 5 you will see the map grow, then level off:"
        ],
        [
          "out",
          "map 81x102, known cells 1040\nmap 111x103, known cells 6247\nmap 111x103, known cells 7869\nmap 111x103, known cells 8281\nmap 111x103, known cells 8497\nmap 111x103, known cells 8556\nmap 111x103, known cells 8554\nmap 112x103, known cells 8577"
        ],
        [
          "p",
          "Your numbers will differ a little, but the shape will not. The map first <b>grows in size</b> (81x102 cells, then 111x103, and one column more at the end), then the known-cell count climbs quickly and <b>flattens</b> at around 8500. It can even dip by a couple of cells, because SLAM keeps refining the map. When the count stops rising, there is nothing new to find: the robot has seen everything it can reach. The cells are 5 cm each, so 111x103 cells is about 5.5 by 5 metres."
        ],
        [
          "warn",
          "Do not close SLAM or Gazebo yet. In the next lesson you save this map, and the map exists only while <code>slam_toolbox</code> is running."
        ],
        [
          "try",
          "Run the wanderer and the counter together. Note the final known-cell count. Then change <code>0.55</code> to <code>0.8</code> in <code>wander.py</code> so the robot keeps a bigger distance from walls, run it on a fresh simulation, and compare."
        ],
        [
          "quiz",
          {
            "q": "The known-cell count rises, then stops changing. What does that tell you?",
            "options": [
              "SLAM crashed",
              "There is nothing new left to see, so the reachable space has been explored",
              "The map is full of walls",
              "The lidar broke"
            ],
            "answer": 1,
            "why": "Known cells only increase when the lidar sees somewhere new. A flat count means the robot is only re-seeing places it already knows."
          }
        ],
        [
          "quiz",
          {
            "q": "Why does <code>wander.py</code> use 0.55 m to start turning but 0.9 m to stop turning?",
            "options": [
              "It is a coincidence",
              "Two different thresholds stop the robot from flicking between turning and driving at the boundary",
              "0.9 is the maximum range of the lidar",
              "Python needs two numbers"
            ],
            "answer": 1,
            "why": "This is called hysteresis. With a single threshold, noise around that distance would make the robot jitter. A gap between the &quot;start&quot; and &quot;stop&quot; values makes the behaviour steady."
          }
        ]
      ]
    },
    {
      "id": "5.3",
      "title": "Saving and reading your map",
      "minutes": 30,
      "blocks": [
        [
          "p",
          "The map lives inside <code>slam_toolbox</code> and disappears when you close it. To keep it, you <b>save it to files</b>. With the world, SLAM and RViz still running from lesson 5.2, make a folder and save:"
        ],
        [
          "cmd",
          "mkdir -p ~/maps",
          "Terminal 4 (Ubuntu)"
        ],
        [
          "cmd",
          "ros2 run nav2_map_server map_saver_cli -f ~/maps/mymap",
          "Terminal 4 (Ubuntu)"
        ],
        [
          "out",
          "[INFO] [...] [map_io]: Map saved\n[INFO] [...] [map_saver]: Map saved successfully\n[INFO] [...] [map_saver]: Destroying"
        ],
        [
          "p",
          "<code>map_saver_cli</code> listens to <code>/map</code> for a moment and writes what it hears. <code>-f</code> is the file name <b>without</b> an ending. It makes two files:"
        ],
        [
          "cmd",
          "ls ~/maps",
          "Terminal 4 (Ubuntu)"
        ],
        [
          "out",
          "mymap.pgm  mymap.yaml"
        ],
        [
          "ul",
          [
            "<code>mymap.pgm</code>: the map as a picture, one pixel per cell.",
            "<code>mymap.yaml</code>: a small text file that says <b>how to read</b> the picture."
          ]
        ],
        [
          "h",
          "The picture"
        ],
        [
          "p",
          "A <code>.pgm</code> is a plain grey-scale image. Only three grey levels are used in the default <i>trinary</i> mode:"
        ],
        [
          "ul",
          [
            "<b>254</b> (almost white): <b>free</b> floor.",
            "<b>0</b> (black): an <b>occupied</b> cell, a wall or obstacle.",
            "<b>205</b> (mid-grey): <b>unknown</b>, never seen."
          ]
        ],
        [
          "cmd",
          "head -c 15 ~/maps/mymap.pgm | head -2",
          "Terminal 4 (Ubuntu)"
        ],
        [
          "out",
          "P5\n111 103"
        ],
        [
          "p",
          "<code>P5</code> says it is a binary grey-scale picture, and <code>111 103</code> is its width and height in pixels. Windows cannot open <code>.pgm</code> files, so make a bigger PNG copy that you can look at. Each map cell becomes a 6x6 block of pixels:"
        ],
        [
          "cmd",
          "cd ~/maps && python3 -c \"from PIL import Image; im = Image.open('mymap.pgm'); im.resize((im.width * 6, im.height * 6), Image.NEAREST).save('mymap.png')\"",
          "Terminal 4 (Ubuntu)"
        ],
        [
          "p",
          "Open Windows File Explorer, paste this into the address bar (replace <code>student</code> with your Linux user name) and double-click <code>mymap.png</code>:"
        ],
        [
          "code",
          "\\\\wsl.localhost\\Ubuntu-22.04\\home\\student\\maps",
          "File Explorer address bar"
        ],
        [
          "p",
          "You should see the hexagonal room in white, its walls as a black outline, the nine round pillars as small black rings with grey centres (the robot can only see the outside of a pillar), and everything the robot never saw in mid-grey."
        ],
        [
          "h",
          "The settings file"
        ],
        [
          "cmd",
          "cat ~/maps/mymap.yaml",
          "Terminal 4 (Ubuntu)"
        ],
        [
          "out",
          "image: mymap.pgm\nmode: trinary\nresolution: 0.05\norigin: [-2.96, -2.58, 0]\nnegate: 0\noccupied_thresh: 0.65\nfree_thresh: 0.25"
        ],
        [
          "ul",
          [
            "<code>image</code>: which picture file belongs to this map.",
            "<code>resolution</code>: the size of one cell in <b>metres</b>. 0.05 means each pixel is 5 cm.",
            "<code>origin</code>: the map position of the <b>bottom-left corner</b> of the picture, as x, y and rotation. Your numbers will differ, because they depend on how far the robot drove.",
            "<code>occupied_thresh</code> and <code>free_thresh</code>: how likely a cell must be to count as a wall or as free floor when the picture is made.",
            "<code>negate</code> and <code>mode</code>: how to interpret the grey levels. Leave them alone."
          ]
        ],
        [
          "h",
          "Read your map with Python"
        ],
        [
          "p",
          "Write a small tool that reads the two files and tells you about the map. It uses the same image library (<code>PIL</code>) and a YAML reader."
        ],
        [
          "cmd",
          "cd ~/robot_practice && nano map_info.py",
          "Terminal 4 (Ubuntu)"
        ],
        [
          "code",
          "import os\nimport sys\n\nimport yaml\nfrom PIL import Image\n\n\ndef main():\n    yaml_path = sys.argv[1]\n    with open(yaml_path) as f:\n        info = yaml.safe_load(f)\n\n    image_path = os.path.join(os.path.dirname(yaml_path), info[\"image\"])\n    image = Image.open(image_path)\n    res = info[\"resolution\"]\n    width, height = image.size\n\n    pixels = list(image.getdata())\n    free = sum(1 for p in pixels if p >= 250)\n    wall = sum(1 for p in pixels if p <= 10)\n    unknown = len(pixels) - free - wall\n\n    print(f\"map file: {info['image']}\")\n    print(f\"size: {width} x {height} cells = {width * res:.1f} x {height * res:.1f} m\")\n    print(f\"origin (bottom-left corner): x={info['origin'][0]}, y={info['origin'][1]}\")\n    print(f\"free: {free}, walls: {wall}, unknown: {unknown}\")\n    print(f\"mapped floor area: {free * res * res:.1f} m2\")\n\n\nif __name__ == \"__main__\":\n    main()",
          "map_info.py"
        ],
        [
          "cmd",
          "python3 map_info.py ~/maps/mymap.yaml",
          "Terminal 4 (Ubuntu)"
        ],
        [
          "out",
          "map file: mymap.pgm\nsize: 111 x 103 cells = 5.6 x 5.2 m\norigin (bottom-left corner): x=-2.96, y=-2.58\nfree: 7816, walls: 742, unknown: 2875\nmapped floor area: 19.5 m2"
        ],
        [
          "ul",
          [
            "<code>sys.argv[1]</code> is the first thing you type after the script name, here the path to the <code>.yaml</code> file.",
            "<code>list(image.getdata())</code> turns the picture into a flat list of grey values, which <code>sum(1 for ...)</code> then counts. Free is 250 or above, a wall is 10 or below, and unknown is everything else.",
            "<b>Area</b> is cells times cell size squared: <code>7816 × 0.05 × 0.05 = 19.5</code> square metres."
          ]
        ],
        [
          "note",
          "About a quarter of the picture is unknown. Look at the PNG: the unknown parts are the corners <i>outside</i> the room, which the robot can never see. That is normal and fine."
        ],
        [
          "warn",
          "Save the map <b>before</b> you close <code>slam_toolbox</code>. Once SLAM stops, nothing publishes <code>/map</code>, and <code>map_saver_cli</code> has nothing to save."
        ],
        [
          "try",
          "Save your map, make the PNG, open it in Windows, then run <code>map_info.py</code> on it and compare the free area with what you see. Delete nothing: you need the map in the next lesson."
        ],
        [
          "quiz",
          {
            "q": "In the map&apos;s <code>.yaml</code> file, what does <code>resolution: 0.05</code> mean?",
            "options": [
              "The picture is 0.05 megapixels",
              "Each pixel (map cell) is 5 cm wide",
              "The robot drove 0.05 m per second",
              "The map is 0.05 m wide in total"
            ],
            "answer": 1,
            "why": "<code>resolution</code> is metres per cell. Multiply the picture&apos;s width in pixels by 0.05 to get the map&apos;s width in metres."
          }
        ],
        [
          "quiz",
          {
            "q": "In a trinary map picture, which grey value means <b>unknown</b>?",
            "options": [
              "0 (black)",
              "254 (white)",
              "205 (mid-grey)",
              "255"
            ],
            "answer": 2,
            "why": "Free floor is 254, an occupied cell is 0, and unknown is 205. That is why unknown areas look grey in a viewer."
          }
        ]
      ]
    },
    {
      "id": "5.4",
      "title": "Navigate on your own map",
      "minutes": 35,
      "blocks": [
        [
          "p",
          "Now the whole chain comes together. You mapped the room yourself. Next you will tell Nav2 to use <b>your map</b> instead of the built-in one, and check that the robot can drive on it."
        ],
        [
          "h",
          "Close the mapping session"
        ],
        [
          "p",
          "Press <code>Ctrl+C</code> in every terminal from lessons 5.1 to 5.3 (world, SLAM, RViz, wanderer and counter) and check nothing is left running:"
        ],
        [
          "cmd",
          "pgrep -f \"gzserver|slam_toolbox|rviz2|component_container\"",
          "Terminal 1 (Ubuntu)"
        ],
        [
          "p",
          "It must print nothing. If it prints numbers, run <code>pkill -9 -f &quot;gzserver|slam_toolbox|rviz2|component_container&quot;</code>."
        ],
        [
          "h",
          "Launch Nav2 with your map"
        ],
        [
          "p",
          "This is the Nav2 launch from lesson 4.7 with one extra argument, <code>map:=</code>, that points at your <code>.yaml</code> file. (It needs the <code>GAZEBO_MODEL_PATH</code> line from lesson 4.7 in your <code>~/.bashrc</code>.)"
        ],
        [
          "cmd",
          "ros2 launch nav2_bringup tb3_simulation_launch.py map:=$HOME/maps/mymap.yaml headless:=True",
          "Terminal 1 (Ubuntu)"
        ],
        [
          "out",
          "[component_container_isolated-5] [INFO] [...] [map_io]: Loading yaml file: /home/<you>/maps/mymap.yaml\n[component_container_isolated-5] [INFO] [...] [map_io]: Read map /home/<you>/maps/mymap.pgm: 111 X 103 map @ 0.05 m/cell"
        ],
        [
          "warn",
          "Type <code>$HOME</code>, not <code>~</code>, after <code>map:=</code>. The shell only expands <code>~</code> at the start of a word, so <code>map:=~/maps/...</code> reaches Nav2 as a literal <code>~</code> and the map is not found."
        ],
        [
          "p",
          "The &quot;Read map&quot; line is the proof that Nav2 loaded <i>your</i> file. Your cell counts will match your own map."
        ],
        [
          "h",
          "Tell it where the robot is, then send a goal"
        ],
        [
          "p",
          "In this simulator the robot starts at <code>x = -2.0, y = -0.5</code>. Set that pose with RViz&apos;s <b>2D Pose Estimate</b> button, or from a second terminal exactly as in lesson 4.7:"
        ],
        [
          "cmd",
          "ros2 topic pub --times 5 -r 1 /initialpose geometry_msgs/msg/PoseWithCovarianceStamped \"{header: {frame_id: map}, pose: {pose: {position: {x: -2.0, y: -0.5, z: 0.0}, orientation: {w: 1.0}}, covariance: [0.25,0,0,0,0,0, 0,0.25,0,0,0,0, 0,0,0,0,0,0, 0,0,0,0,0,0, 0,0,0,0,0,0, 0,0,0,0,0,0.07]}}\"",
          "Terminal 2 (Ubuntu)"
        ],
        [
          "cmd",
          "ros2 action send_goal /navigate_to_pose nav2_msgs/action/NavigateToPose \"{pose: {header: {frame_id: map}, pose: {position: {x: 0.55, y: 0.55, z: 0.0}, orientation: {w: 1.0}}}}\"",
          "Terminal 2 (Ubuntu)"
        ],
        [
          "out",
          "Goal accepted with ID: 0ff0d7b1a4eb4084a2bda0101910fb9f\n\nResult:\n    result: {}\n\nGoal finished with status: SUCCEEDED"
        ],
        [
          "p",
          "The robot drove across <b>a map you made yourself</b> to the goal. Your <code>go_to_goal.py</code> from lesson 4.8 works on your map without any change, because it only talks to Nav2 and never cares which map is loaded. Restart the simulation first, then run it:"
        ],
        [
          "cmd",
          "cd ~/robot_practice && python3 go_to_goal.py",
          "Terminal 2 (Ubuntu)"
        ],
        [
          "out",
          "...\nDistance remaining: 0.92 m\nDistance remaining: 0.67 m\nDistance remaining: 0.42 m\nGoal reached!"
        ],
        [
          "h",
          "A trap: where is (0, 0)?"
        ],
        [
          "p",
          "Here is something that surprises people. In <b>this simulator</b>, the map&apos;s coordinates match the Gazebo world&apos;s coordinates exactly, because the simulated TurtleBot reports its odometry in world coordinates. So the numbers you used in Module 4 still work, and <code>(0, 0)</code> is the middle of the room, <b>which is the middle pillar</b>."
        ],
        [
          "p",
          "On a <b>real</b> robot it is different: the map&apos;s <code>(0, 0)</code> is wherever the robot <b>was when you started mapping</b>. Always look at where the robot really is, and set the initial pose to match."
        ],
        [
          "warn",
          "A wrong initial pose is the most common reason for goals that fail or abort. If you set the start pose at <code>(0, 0)</code> in this simulator, you tell Nav2 the robot is inside the middle pillar, and goals end with <code>Goal finished with status: ABORTED</code>. Check the pose first, then the goal."
        ],
        [
          "try",
          "Launch Nav2 with your own map, set the pose at <code>(-2.0, -0.5)</code> and send the robot to three different places around the pillars. Compare how the RViz map looks with the built-in one from lesson 4.7. Can you tell the difference?"
        ],
        [
          "quiz",
          {
            "q": "You launch Nav2 with <code>map:=~/maps/mymap.yaml</code> and it cannot find the map. What is the fix?",
            "options": [
              "Rename the file",
              "Use <code>$HOME</code> instead of <code>~</code>, because the shell does not expand <code>~</code> after <code>map:=</code>",
              "Use a bigger map",
              "Run SLAM again"
            ],
            "answer": 1,
            "why": "The shell expands <code>~</code> only at the start of a word. After <code>map:=</code> it is passed through literally, but <code>$HOME</code> is always expanded."
          }
        ],
        [
          "quiz",
          {
            "q": "Your goals keep ending with <code>ABORTED</code>. What should you check first?",
            "options": [
              "That the initial pose matches where the robot really is",
              "That the computer has enough RAM",
              "That the PNG file exists",
              "That Python is installed"
            ],
            "answer": 0,
            "why": "If Nav2 believes the robot is somewhere impossible (such as inside a pillar), it cannot plan a route. Fix the initial pose before anything else."
          }
        ]
      ]
    },
    {
      "id": "5.5",
      "title": "Capstone: map it, save it, measure it",
      "minutes": 60,
      "blocks": [
        [
          "p",
          "In this capstone you automate the whole mapping job. You will write <b>one program</b> that explores the room, saves the map, and reports how much floor it found. This is how a real mapping robot is used: you press go, and when it finishes the map is on disk."
        ],
        [
          "h",
          "The task"
        ],
        [
          "p",
          "Write <code>explore_and_save.py</code>. When you run it on a fresh world with SLAM running, it must:"
        ],
        [
          "ul",
          [
            "<b>Explore</b> by wandering and avoiding obstacles for a fixed time. Start from the <code>wander.py</code> you wrote in lesson 5.2, and make the time a constant at the top of the file (for example <code>DURATION = 110</code> seconds).",
            "<b>Stop the robot</b> when the time is up.",
            "<b>Save the map</b> by calling <code>map_saver_cli</code> from Python. Use the <code>subprocess</code> module: <code>subprocess.run([...])</code> takes the command as a list of words, such as <code>[&quot;ros2&quot;, &quot;run&quot;, &quot;nav2_map_server&quot;, &quot;map_saver_cli&quot;, &quot;-f&quot;, MAP_NAME]</code>. Write the map into your <code>~/maps</code> folder, with a full path (<code>~</code> is not expanded inside a list).",
            "<b>Read the saved picture</b> with <code>PIL</code>, as you did in <code>map_info.py</code> (lesson 5.3).",
            "<b>Print a report</b>: the number of free, wall and unknown cells, and the mapped floor area in square metres."
          ]
        ],
        [
          "p",
          "Setup for each run: terminal 1 has the world, terminal 2 has <code>slam_toolbox</code> (<code>use_sim_time:=True</code>), RViz is optional, and the program runs in terminal 3."
        ],
        [
          "h",
          "What good looks like"
        ],
        [
          "p",
          "After about two minutes of exploring, the program should print something like this (the exact numbers vary from run to run):"
        ],
        [
          "out",
          "Exploring finished, saving the map...\nfree cells: 7820, wall cells: 697, unknown: 2916\nmapped floor area: 19.6 m2"
        ],
        [
          "p",
          "A result between <b>19 and 20 square metres</b> means the robot saw essentially the whole room. A much smaller number means it did not explore enough: run it longer, or check that the robot is really moving."
        ],
        [
          "h",
          "Stretch goals"
        ],
        [
          "ul",
          [
            "<b>Stop early.</b> Reuse the idea from <code>mapstat.py</code>: subscribe to <code>/map</code> in the same node, count known cells, and stop exploring when the count has not grown for 20 seconds.",
            "<b>Percentage explored.</b> Print known cells as a percentage of the cells inside the walls.",
            "<b>Pick the file name.</b> Take the map name from the command line (<code>sys.argv</code>) so each run saves a different map.",
            "<b>Close the loop.</b> After saving, launch Nav2 with your new map and run <code>go_to_goal.py</code> from lesson 4.8. The robot should navigate on a map your own program produced."
          ]
        ],
        [
          "note",
          "No solution is given on purpose. Every piece comes from lessons 4.6, 5.2 and 5.3: the wandering node, calling another program with <code>subprocess</code>, and reading the map picture. If you get stuck, paste your code and the error to Claude and ask for a hint, not the answer."
        ],
        [
          "warn",
          "Common traps: (1) forgetting <code>use_sim_time:=True</code> on SLAM (lesson 5.1 explains why it is needed); (2) saving the map after you closed SLAM; (3) testing on a world you have already driven around, so the robot starts in the wrong place (restart the world each run); (4) writing the map name with <code>~</code> inside a Python list."
        ],
        [
          "try",
          "Do the capstone. When your program explores, saves a map into <code>~/maps</code>, and prints a mapped area close to 19 to 20 square metres, mark this quest complete."
        ],
        [
          "quiz",
          {
            "q": "In Python, which module lets your program run another command such as <code>map_saver_cli</code>?",
            "options": [
              "math",
              "subprocess",
              "time",
              "yaml"
            ],
            "answer": 1,
            "why": "<code>subprocess.run([...])</code> starts another program and can wait for it to finish. It takes the command as a list of separate words."
          }
        ],
        [
          "h",
          "What comes next"
        ],
        [
          "p",
          "You now have the full loop: <b>describe</b> a robot, <b>simulate</b> it, <b>sense</b> the world, <b>map</b> it, and <b>navigate</b> in it. Everything you did in the simulator is the same set of ideas used on real robots."
        ],
        [
          "ul",
          [
            "<b>Real hardware.</b> The same nodes, topics and launch files run on a real TurtleBot3. The differences are the ones you already know about: sensor QoS, a messier map, and a start pose that is wherever the robot happens to be.",
            "<b>Better maps.</b> Real rooms have glass, people and long corridors. <code>slam_toolbox</code> can save and reload its internal pose graph so you can continue mapping later, and it has a mode that only localizes on a finished map.",
            "<b>Vision.</b> Add a camera and detect objects with a model such as YOLO, then send the robot to what it finds."
          ]
        ]
      ]
    }
  ]
});
