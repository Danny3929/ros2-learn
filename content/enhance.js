// Extra blocks added to existing lessons without editing them: pictures of the real programs,
// and "predict first" questions. Each entry says which lesson, where (the first block of that kind
// that contains the text), whether to go "before" or "after" it, and the blocks to add.
// The keys of these blocks are made from the id, so saved answers never move.
window.ENHANCE = [
  // ---------- pictures ----------
  { id: "img21", lesson: "2.1", at: { kind: "p", text: "Click on terminal 2" }, blocks: [
    ["img", "images/turtle_circle.jpg", "The turtlesim window with a curved line behind the turtle",
      "Turtlesim draws the path the turtle has travelled. Your turtle picture will look different: it is random each time."]
  ] },
  { id: "img42", lesson: "4.2", at: { kind: "note", text: "The sliders window may open behind RViz" }, blocks: [
    ["img", "images/rviz_mybot.jpg", "mybot in RViz with its coordinate frames",
      "mybot in RViz: the blue body, the white head and a black wheel, with a small set of red, green and blue arrows (a coordinate frame) on every link. The slider window is separate and may open behind RViz."]
  ] },
  { id: "img45a", lesson: "4.5", at: { kind: "out", text: "Successfully spawned entity [burger]" }, blocks: [
    ["img", "images/gazebo_turtlebot.jpg", "Gazebo showing the TurtleBot3 with blue lidar rays",
      "Gazebo with the TurtleBot3 Burger in the middle of an empty world. The blue lines are its lidar beams."]
  ] },
  { id: "img45b", lesson: "4.5", at: { kind: "p", text: "Look at the Gazebo window: the blue lidar rays now stop" }, blocks: [
    ["img", "images/gazebo_pillars.jpg", "Gazebo showing pillars and lidar rays",
      "The pillar world: the lidar rays now stop at the pillars and the walls instead of flying off into nothing."]
  ] },
  { id: "img47", lesson: "4.7", at: { kind: "ul", text: "A <b>green line</b>: the global plan" }, blocks: [
    ["img", "images/nav2_costmaps.jpg", "RViz with Nav2 costmaps and the Navigation 2 panel",
      "RViz while Nav2 runs: coloured costmaps around the walls and pillars, the cloud of green guesses around the robot, and the Navigation 2 panel at the bottom left (here it reads Navigation active, Localization active)."]
  ] },
  { id: "img410", lesson: "4.10", at: { kind: "p", text: "A Gazebo window opens with an empty grey floor" }, blocks: [
    ["img", "images/gazebo_mybot.jpg", "mybot standing on the Gazebo floor",
      "mybot standing on the Gazebo floor: blue body, white head and a black wheel."]
  ] },
  { id: "img51", lesson: "5.1", at: { kind: "ul", text: "A <b>small patch of light grey</b>" }, blocks: [
    ["img", "images/slam_building_map.jpg", "RViz showing the map built by SLAM",
      "RViz once the robot has explored the whole room: light grey is floor the lidar has seen, black lines are walls, and the dark teal is still unknown. At the very start you only see a small patch around the robot."]
  ] },
  { id: "img53", lesson: "5.3", at: { kind: "p", text: "You should see the hexagonal room in white" }, blocks: [
    ["img", "images/saved_map.jpg", "A saved map shown as a picture",
      "A saved map opened as a picture: white floor, black walls and pillars, and grey for the places never seen."]
  ] },
  { id: "img65", lesson: "6.5", at: { kind: "p", text: "In the turtlesim window you should see a second turtle" }, blocks: [
    ["img", "images/turtle_two.jpg", "Two turtles in the turtlesim window",
      "After the show starts: turtle2 has appeared at the top right (position 8, 8), and turtle1 has turned to a new heading."]
  ] },
  { id: "img72", lesson: "7.2", at: { kind: "ul", text: "<b>Exclude Messages</b>" }, blocks: [
    ["img", "images/rqt_console.jpg", "The rqt_console window",
      "rqt_console: each message has a severity icon (light bulb for Info, triangle for Warn, red sign for Error), and the panels below let you hide severities or highlight words."]
  ] },
  { id: "img76", lesson: "7.6", at: { kind: "p", text: "The distance falls quickly and then" }, blocks: [
    ["img", "images/turtle_chase.jpg", "A turtle with a looping trail",
      "The trail from a chase: the turtle swings round, spirals in towards the circling carrot, and then follows it round in a loop."]
  ] },

  // ---------- predict first ----------
  { id: "pr14", lesson: "1.4", at: { kind: "cmd", text: "python3 loops.py" }, place: "before", blocks: [
    ["predict", { q: "Look at the code you just wrote. What will the <code>for</code> loop print?",
      options: ["step 0, step 1, step 2", "step 1, step 2, step 3", "step 0, step 1, step 2, step 3", "Nothing, it needs a <code>while</code>"],
      answer: 0, why: "<code>range(3)</code> gives 0, 1, 2: it starts at 0 and stops <i>before</i> 3. That is why computers count from zero." }]
  ] },
  { id: "pr16", lesson: "1.6", at: { kind: "cmd", text: "python3 collections_demo.py" }, place: "before", blocks: [
    ["predict", { q: "After <code>waypoints.append(\"charger\")</code>, what does <code>print(waypoints[0], len(waypoints))</code> print?",
      options: ["door 4", "door 3", "desk 4", "waypoints 4"],
      answer: 0, why: "<code>waypoints[0]</code> is the first item, <code>door</code>. The list started with 3 items and <code>append</code> added a 4th, so its length is 4." }]
  ] },
  { id: "pr23", lesson: "2.3", at: { kind: "cmd", text: "ros2 topic info /turtle1/cmd_vel" }, place: "before", blocks: [
    ["predict", { q: "Only turtlesim is running. How many <b>publishers</b> does <code>/turtle1/cmd_vel</code> have?",
      options: ["0", "1", "2", "The topic does not exist"],
      answer: 0, why: "Nobody is sending commands yet. Turtlesim only <i>listens</i> to this topic (1 subscription). A publisher appears when you start the keyboard controller or publish from a terminal." }]
  ] },
  { id: "pr31", lesson: "3.1", at: { kind: "cmd", text: "ls", exact: true }, place: "before", blocks: [
    ["predict", { q: "You ran <code>colcon build</code> in an empty workspace. Which folders will <code>ls</code> show?",
      options: ["Only <code>src</code>", "<code>build</code>, <code>install</code>, <code>log</code> and <code>src</code>", "<code>build</code> and <code>install</code> only", "Nothing, the folder is empty"],
      answer: 1, why: "Colcon creates its three working folders even when there is nothing to build, next to your <code>src</code> folder." }]
  ] },
  { id: "pr46", lesson: "4.6", at: { kind: "cmd", text: "python3 drive_forward.py" }, place: "before", blocks: [
    ["predict", { q: "The script sends <code>linear.x = 0.2</code> (0.2 metres per second) for 3 seconds. About how far will the robot move?",
      options: ["About 2 cm", "About 60 cm", "About 6 m", "It depends on the lidar"],
      answer: 1, why: "Distance is speed times time: 0.2 × 3 = 0.6 m. In a test the robot moved 0.59 m." }]
  ] },
  { id: "pr410", lesson: "4.10", at: { kind: "cmd", text: "ros2 topic list" }, place: "before", blocks: [
    ["predict", { q: "<code>mybot</code> has a body, a head, wheels and a caster, but no sensors. Will <code>/scan</code> appear in the topic list?",
      options: ["Yes, every robot has one", "No, there is no lidar in its description", "Only after you drive", "Only in RViz"],
      answer: 1, why: "Topics come from what the robot actually has. <code>mybot</code> has no lidar, so nothing publishes <code>/scan</code>. You would have to add a lidar to the file first." }]
  ] },
  { id: "pr52", lesson: "5.2", at: { kind: "cmd", text: "python3 mapstat.py" }, place: "before", blocks: [
    ["predict", { q: "The wanderer drives around while the counter prints how many map cells are known. What will the count do over time?",
      options: ["Rise steadily forever", "Rise quickly, then level off", "Jump to the maximum at once", "Fall back to zero"],
      answer: 1, why: "Every new area adds known cells, but a room is finite. Once the robot has seen everything it can reach, the count stops growing." }]
  ] },
  { id: "pr61", lesson: "6.1", at: { kind: "p", text: "Stop the server with" }, place: "before", blocks: [
    ["predict", { q: "The server is switched off and you run <code>python3 add_client.py 2 3</code>. What does the client do?",
      options: ["Crashes with an error", "Waits politely, printing that it is waiting for the service", "Prints 5 anyway", "Prints 0"],
      answer: 1, why: "The client calls <code>wait_for_service</code> in a loop, so it keeps logging <i>Waiting for the add_two_ints service...</i> until a server appears." }]
  ] },
  { id: "pr64", lesson: "6.4", at: { kind: "p", text: "Start a <b>best-effort</b> talker in terminal 1" }, place: "before", blocks: [
    ["predict", { q: "A <b>best-effort</b> talker and a <b>reliable</b> listener. What does the listener print?",
      options: ["All the messages", "Only some of the messages", "No messages, just one warning about incompatible QoS", "An error, and it exits"],
      answer: 2, why: "A subscriber cannot ask for more than the publisher offers. The connection is refused silently, and the only clue is one warning line." }]
  ] },
  { id: "pr71", lesson: "7.1", at: { kind: "cmd", text: "ros2 bag play drive_bag --topics /turtle1/cmd_vel" }, place: "before", blocks: [
    ["predict", { q: "You replay the recorded commands after resetting the turtle. Will it end exactly where the live drive ended?",
      options: ["Yes, exactly", "Somewhere similar, but not exactly", "It will not move", "It will go backwards"],
      answer: 1, why: "The bag replays the messages faithfully, but the turtle reacts with its own timing, which is never exactly the same twice." }]
  ] },
  { id: "pr72", lesson: "7.2", at: { kind: "cmd", text: "python3 log_demo.py --ros-args --log-level warn" }, place: "before", blocks: [
    ["predict", { q: "You run <code>log_demo.py</code> with <code>--log-level warn</code>. Which lines appear?",
      options: ["Only DEBUG", "INFO, WARN and ERROR", "Only WARN and ERROR", "Nothing at all"],
      answer: 2, why: "A level means this one and everything more serious. WARN hides DEBUG and INFO." }]
  ] },
  { id: "pr73", lesson: "7.3", at: { kind: "cmd", text: "ROS_DOMAIN_ID=6 ros2 topic echo --once /hello" }, place: "before", blocks: [
    ["predict", { q: "A message is being published in domain 5. Will a listener in <b>domain 6</b> hear it?",
      options: ["Yes", "No, programs in different domains cannot see each other", "Only if it is on the same computer", "Only half the messages"],
      answer: 1, why: "Programs only discover each other within the same domain ID. In domain 6 the topic does not even exist." }]
  ] },
  { id: "pr75", lesson: "7.5", at: { kind: "cmd", text: "ros2 run tf2_ros tf2_echo world island" }, place: "before", blocks: [
    ["predict", { q: "<code>island</code> hangs from a parent that has no link to <code>world</code>. What will TF2 say?",
      options: ["It gives a transform of zero", "It could not find a connection: they are not part of the same tree", "The frame <code>world</code> is missing", "It guesses"],
      answer: 1, why: "Both frames exist, but nothing connects the two groups, so TF2 cannot work out where one is relative to the other." }]
  ] }
];
