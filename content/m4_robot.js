window.MODULES = window.MODULES || [];
(function () {
  // Join file lines so the XML can be written without escaping every quote.
  function L() { return Array.prototype.slice.call(arguments).join("\n"); }

  var MYBOT = L(
    '<?xml version="1.0"?>',
    '<robot name="mybot">',
    '  <link name="base_link">',
    '    <visual>',
    '      <geometry><box size="0.4 0.2 0.1"/></geometry>',
    '      <material name="blue"><color rgba="0.2 0.4 0.9 1"/></material>',
    '    </visual>',
    '  </link>',
    '  <link name="head">',
    '    <visual>',
    '      <geometry><sphere radius="0.07"/></geometry>',
    '      <material name="white"><color rgba="1 1 1 1"/></material>',
    '    </visual>',
    '  </link>',
    '  <joint name="head_joint" type="fixed">',
    '    <parent link="base_link"/>',
    '    <child link="head"/>',
    '    <origin xyz="0.1 0 0.12"/>',
    '  </joint>',
    '</robot>'
  );

  var WHEELS = L(
    '  <link name="left_wheel">',
    '    <visual>',
    '      <origin rpy="1.5708 0 0"/>',
    '      <geometry><cylinder radius="0.06" length="0.04"/></geometry>',
    '      <material name="black"><color rgba="0.1 0.1 0.1 1"/></material>',
    '    </visual>',
    '  </link>',
    '  <joint name="left_wheel_joint" type="continuous">',
    '    <parent link="base_link"/>',
    '    <child link="left_wheel"/>',
    '    <origin xyz="-0.1 0.12 -0.02"/>',
    '    <axis xyz="0 1 0"/>',
    '  </joint>',
    '',
    '  <link name="right_wheel">',
    '    <visual>',
    '      <origin rpy="1.5708 0 0"/>',
    '      <geometry><cylinder radius="0.06" length="0.04"/></geometry>',
    '      <material name="black"/>',
    '    </visual>',
    '  </link>',
    '  <joint name="right_wheel_joint" type="continuous">',
    '    <parent link="base_link"/>',
    '    <child link="right_wheel"/>',
    '    <origin xyz="-0.1 -0.12 -0.02"/>',
    '    <axis xyz="0 1 0"/>',
    '  </joint>'
  );

  var XACRO = L(
    '<?xml version="1.0"?>',
    '<robot name="mybot" xmlns:xacro="http://www.ros.org/wiki/xacro">',
    '  <xacro:property name="wheel_radius" value="0.06"/>',
    '  <xacro:property name="wheel_width" value="0.04"/>',
    '',
    '  <material name="blue"><color rgba="0.2 0.4 0.9 1"/></material>',
    '  <material name="white"><color rgba="1 1 1 1"/></material>',
    '  <material name="black"><color rgba="0.1 0.1 0.1 1"/></material>',
    '',
    '  <link name="base_link">',
    '    <visual>',
    '      <geometry><box size="0.4 0.2 0.1"/></geometry>',
    '      <material name="blue"/>',
    '    </visual>',
    '  </link>',
    '',
    '  <link name="head">',
    '    <visual>',
    '      <geometry><sphere radius="0.07"/></geometry>',
    '      <material name="white"/>',
    '    </visual>',
    '  </link>',
    '  <joint name="head_joint" type="fixed">',
    '    <parent link="base_link"/>',
    '    <child link="head"/>',
    '    <origin xyz="0.1 0 0.12"/>',
    '  </joint>',
    '',
    '  <xacro:macro name="wheel" params="name y">',
    '    <link name="${name}_wheel">',
    '      <visual>',
    '        <origin rpy="${pi/2} 0 0"/>',
    '        <geometry><cylinder radius="${wheel_radius}" length="${wheel_width}"/></geometry>',
    '        <material name="black"/>',
    '      </visual>',
    '    </link>',
    '    <joint name="${name}_wheel_joint" type="continuous">',
    '      <parent link="base_link"/>',
    '      <child link="${name}_wheel"/>',
    '      <origin xyz="-0.1 ${y} -0.02"/>',
    '      <axis xyz="0 1 0"/>',
    '    </joint>',
    '  </xacro:macro>',
    '',
    '  <xacro:wheel name="left" y="0.12"/>',
    '  <xacro:wheel name="right" y="-0.12"/>',
    '</robot>'
  );

  window.MODULES.push({
    order: 4,
    title: "4 · Robot simulation",
    lessons: [
      {
        id: "4.1", title: "Describing a robot (URDF)", minutes: 20,
        blocks: [
          ["p", "Before ROS 2 can show or simulate a robot, it needs to know what the robot <b>looks like and how it fits together</b>. That description is written in a file format called <b>URDF</b> (Unified Robot Description Format). It is plain XML, so you can read it and edit it in any text editor."],
          ["p", "A URDF has only two kinds of building block:"],
          ["ul", [
            "<b>link</b>: a rigid part of the robot (a body, a wheel, a head).",
            "<b>joint</b>: a connection between <b>two</b> links. It says which one is the <code>parent</code>, which is the <code>child</code>, and how the child may move."
          ]],
          ["p", "Together they form a <b>tree</b>. One link is the root (usually <code>base_link</code>) and every other link hangs off it through a joint."],
          ["note", "Units are always <b>metres</b> and <b>radians</b>. Axes follow the ROS convention: <b>x</b> points forward, <b>y</b> points left, <b>z</b> points up."],
          ["h", "Write your first robot"],
          ["p", "Make a practice folder in your Linux home (not in <code>/mnt/c</code>), then create the file below."],
          ["cmd", "mkdir -p ~/robot_practice"],
          ["cmd", "cd ~/robot_practice"],
          ["cmd", "nano mybot.urdf", "Ubuntu (WSL) terminal. Paste the file, then Ctrl+O, Enter, Ctrl+X"],
          ["code", MYBOT, "mybot.urdf"],
          ["p", "Read it from the top. The robot is named <code>mybot</code>. It has two links: <code>base_link</code>, a blue box 0.4 m long, 0.2 m wide and 0.1 m tall, and <code>head</code>, a white sphere of radius 0.07 m. The <code>head_joint</code> glues the head onto the base. Its <code>origin</code> puts the head 0.1 m forward and 0.12 m up from the base."],
          ["p", "The joint type is <code>fixed</code>, meaning the head never moves relative to the base. You will meet a moving type in the next lesson."],
          ["h", "Check it"],
          ["p", "ROS 2 ships a checker that parses a URDF and prints the tree it found:"],
          ["cmd", "check_urdf mybot.urdf"],
          ["out", "robot name is: mybot\n---------- Successfully Parsed XML ---------------\nroot Link: base_link has 1 child(ren)\n    child(1):  head"],
          ["p", "That reads: the root is <code>base_link</code>, and it has one child, <code>head</code>. This is the tree you described."],
          ["h", "When it goes wrong"],
          ["p", "The checker tells you exactly what is broken. If you misspell a link name in a joint (say <code>hed</code> instead of <code>head</code>) you get:"],
          ["out", "Error:   Failed to build tree: child link [hed] of joint [head_joint] not found\n         at line 252 in ./urdf_parser/src/model.cpp\nERROR: Model Parsing the xml failed"],
          ["p", "And if you forget to close a tag such as <code>&lt;/robot&gt;</code>:"],
          ["out", "Error:   Error reading end tag.\n         at line 100 in ./urdf_parser/src/model.cpp\nERROR: Model Parsing the xml failed"],
          ["note", "The line number in these messages points into the ROS parser's own source code, not into your file. Read the sentence, not the number: it names the joint and the link that are wrong."],
          ["try", "Run <code>check_urdf</code> on your file. Then change <code>head</code> to <code>hed</code> in the joint only, run it again and read the error. Undo the typo."],
          ["quiz", {
            q: "In a URDF, what connects two links together?",
            options: ["A material", "A joint", "A geometry", "Another robot tag"],
            answer: 1,
            why: "A <code>joint</code> names a <code>parent</code> link and a <code>child</code> link and says how the child can move. Links never connect to each other directly."
          }]
        ]
      },
      {
        id: "4.2", title: "Seeing it in RViz and adding wheels", minutes: 25,
        blocks: [
          ["p", "A description you cannot see is hard to trust. <b>RViz</b> is ROS 2's 3D viewer. It draws your robot straight from the URDF, so you can check the shape before you ever simulate it."],
          ["h", "One-time setup for graphics in WSL"],
          ["p", "On some laptops (including this one), the graphics driver that WSL uses crashes when RViz or Gazebo ask it for 3D (the log says <code>D3D12: Removing Device</code>). The fix is to ask for <b>software rendering</b>. It is slower but reliable. Add it to <code>~/.bashrc</code> <b>once</b>:"],
          ["cmd", "echo \"export LIBGL_ALWAYS_SOFTWARE=1\" >> ~/.bashrc"],
          ["warn", "Run that line only once, then <b>open a new terminal</b> so it takes effect. If RViz or Gazebo closes by itself seconds after opening, this is the first thing to check: <code>echo $LIBGL_ALWAYS_SOFTWARE</code> should print <code>1</code>."],
          ["h", "Open your robot"],
          ["p", "The <code>urdf_tutorial</code> package has a ready-made launch file that starts RViz, a state publisher and a slider window. You only give it the path to your file:"],
          ["cmd", "cd ~/robot_practice"],
          ["cmd", "ros2 launch urdf_tutorial display.launch.py model:=$HOME/robot_practice/mybot.urdf"],
          ["p", "Give it about 15 to 20 seconds. An RViz window opens showing a blue box with a white ball on top, and small red, green and blue arrows. Those arrows are <b>coordinate frames</b>, one per link: red is x, green is y, blue is z. You will study them properly later in this module."],
          ["ul", [
            "<b>Left-drag</b> in the 3D view to rotate, <b>middle-drag</b> to slide, <b>scroll</b> to zoom.",
            "In the <b>Displays</b> panel, tick <b>RobotModel</b> and <b>TF</b> on and off to see what each one draws.",
            "Close RViz or press <code>Ctrl+C</code> in the terminal when you are done."
          ]],
          ["h", "Give it wheels"],
          ["p", "A fixed joint cannot spin. A wheel needs a <code>continuous</code> joint, which rotates forever around an axis. Open <code>mybot.urdf</code> again and paste the block below <b>just before</b> the final <code>&lt;/robot&gt;</code> line."],
          ["code", WHEELS, "add to mybot.urdf, before </robot>"],
          ["p", "Three new ideas here:"],
          ["ul", [
            "<code>type=\"continuous\"</code>: the joint spins without limit. The axis <code>0 1 0</code> means &quot;around y&quot;, which is the sideways axis, so the wheel rolls forwards.",
            "<code>rpy=\"1.5708 0 0\"</code>: roll, pitch, yaw in radians. A cylinder stands upright by default, so we roll it by 1.5708 (a quarter turn, about 90 degrees) to lie on its side.",
            "The right wheel reuses <code>&lt;material name=\"black\"/&gt;</code> with no colour. Once a material has been defined, you can refer to it by name."
          ]],
          ["cmd", "check_urdf mybot.urdf"],
          ["out", "robot name is: mybot\n---------- Successfully Parsed XML ---------------\nroot Link: base_link has 3 child(ren)\n    child(1):  head\n    child(2):  left_wheel\n    child(3):  right_wheel"],
          ["p", "Now launch it again. This time a second small window appears with <b>sliders</b>, one for each wheel joint. That window is <code>joint_state_publisher_gui</code>. Dragging a slider publishes a joint angle, and the wheel turns in RViz."],
          ["cmd", "ros2 launch urdf_tutorial display.launch.py model:=$HOME/robot_practice/mybot.urdf"],
          ["note", "The sliders window may open behind RViz. Check the Windows taskbar if you cannot find it."],
          ["try", "Launch the robot with wheels and drag the <code>left_wheel_joint</code> slider. Watch the left wheel turn. Then change the left wheel&apos;s <code>origin</code> y value, run <code>check_urdf</code>, relaunch, and see the wheel move."],
          ["quiz", {
            q: "You want a wheel that can spin around forever. Which joint type do you use?",
            options: ["fixed", "continuous", "static", "floating"],
            answer: 1,
            why: "<code>continuous</code> rotates without limits around its axis. <code>fixed</code> never moves. (There is also <code>revolute</code>, which turns but only between limits, like an elbow.)"
          }]
        ]
      },
      {
        id: "4.3", title: "Less typing with xacro", minutes: 25,
        blocks: [
          ["p", "Look at the two wheels in your URDF. They are almost identical: only the name and one number change. Real robots have dozens of repeated parts, and copy-pasting is how typos get in. <b>xacro</b> (XML macros) fixes this. It is the same XML with three extra features, and a tool turns it into a normal URDF."],
          ["ul", [
            "<b>Properties</b>: named values, like <code>wheel_radius</code>, defined once and used anywhere.",
            "<b>Macros</b>: a reusable block with parameters, like a function.",
            "<b>Maths</b>: <code>${...}</code> expressions, including the constant <code>pi</code>."
          ]],
          ["h", "Your robot as xacro"],
          ["cmd", "nano mybot.xacro", "Ubuntu (WSL) terminal. Paste the file, then Ctrl+O, Enter, Ctrl+X"],
          ["code", XACRO, "mybot.xacro"],
          ["p", "Compare it with the URDF:"],
          ["ul", [
            "The <code>xmlns:xacro</code> part on the first <code>robot</code> line switches the xacro features on. Without it, <code>xacro:</code> tags are an error.",
            "<code>wheel_radius</code> and <code>wheel_width</code> are properties. To make bigger wheels, change <b>one</b> number at the top.",
            "The <code>wheel</code> macro takes a <code>name</code> and a <code>y</code> position. The last two lines <b>use</b> it: one call makes the left wheel, one makes the right.",
            "<code>${name}_wheel</code> pastes the parameter into a name, so you get <code>left_wheel</code> and <code>right_wheel</code>. <code>${pi/2}</code> is a quarter turn, so you no longer type 1.5708.",
            "The materials are defined once at the top, then referred to by name everywhere."
          ]],
          ["h", "Turn it into URDF"],
          ["p", "ROS 2 tools want plain URDF. The <code>xacro</code> command expands your macros and prints the result:"],
          ["cmd", "xacro mybot.xacro > mybot_generated.urdf"],
          ["cmd", "check_urdf mybot_generated.urdf"],
          ["out", "robot name is: mybot\n---------- Successfully Parsed XML ---------------\nroot Link: base_link has 3 child(ren)\n    child(1):  head\n    child(2):  left_wheel\n    child(3):  right_wheel"],
          ["p", "The same tree as your hand-written URDF, from a file that is much shorter to extend. Open <code>mybot_generated.urdf</code> and look at how the macro was expanded into two full wheels."],
          ["note", "You do not have to run <code>xacro</code> yourself to view a robot. The <code>urdf_tutorial</code> launch file accepts a <code>.xacro</code> file directly and expands it for you."],
          ["cmd", "ros2 launch urdf_tutorial display.launch.py model:=$HOME/robot_practice/mybot.xacro"],
          ["p", "You should see the same robot as before: blue body, white head, two black wheels, and sliders for the two wheel joints."],
          ["warn", "Never edit <code>mybot_generated.urdf</code>. It is output. Edit <code>mybot.xacro</code> and regenerate, otherwise your changes vanish the next time you run <code>xacro</code>."],
          ["try", "Change <code>wheel_radius</code> to <code>0.09</code> in <code>mybot.xacro</code>, relaunch with the <code>.xacro</code> file, and see both wheels grow. Then add a third call, <code>&lt;xacro:wheel name=\"spare\" y=\"0.3\"/&gt;</code>, and see a new wheel appear (and a new slider)."],
          ["quiz", {
            q: "You want all four wheels of a robot to be 8 cm in radius, and to change that later in one place. What do you use in xacro?",
            options: [
              "Copy and paste the number four times",
              "A property such as <code>wheel_radius</code>, used with <code>${wheel_radius}</code>",
              "A joint of type fixed",
              "A second URDF file"
            ],
            answer: 1,
            why: "A <code>xacro:property</code> stores the value once, and every <code>${wheel_radius}</code> reads it. Change the property and every wheel changes."
          }]
        ]
      },
      {
        id: "4.4", title: "Coordinate frames (TF2)", minutes: 25,
        blocks: [
          ["p", "In lesson 4.2 you saw little red, green and blue arrows on every part of your robot. Each set of arrows is a <b>coordinate frame</b>: an origin and three axes attached to one link. Robots live and die by frames. A lidar says &quot;obstacle 1 metre ahead&quot;, but ahead of <i>what</i>? The lidar? The robot body? The map? To combine information you must convert between frames."],
          ["p", "<b>TF2</b> is the ROS 2 system that does this. It keeps a <b>tree of frames</b>, the same tree as your URDF links, and can work out the position of any frame relative to any other by walking the tree."],
          ["ul", [
            "<code>/tf</code>: transforms that <b>change</b> over time, such as a spinning wheel.",
            "<code>/tf_static</code>: transforms that <b>never change</b>, such as the head glued to the body. They are sent once and remembered."
          ]],
          ["h", "Publish the frames of your robot"],
          ["p", "In lesson 4.2 the launch file started the helper nodes for you. Now start them yourself so you can see what they do. You need three terminals. In <b>terminal 1</b>, run <code>robot_state_publisher</code>. It reads your robot description and publishes a frame for every link:"],
          ["cmd", "cd ~/robot_practice", "Terminal 1 (Ubuntu)"],
          ["cmd", "ros2 run robot_state_publisher robot_state_publisher --ros-args -p robot_description:=\"$(xacro mybot.xacro)\"", "Terminal 1 (Ubuntu)"],
          ["p", "The <code>$(xacro ...)</code> part runs xacro first and hands the finished URDF to the node as a parameter. In <b>terminal 2</b>, start the node that supplies joint angles for the moving wheels (all zero, until a slider or program says otherwise):"],
          ["cmd", "ros2 run joint_state_publisher joint_state_publisher", "Terminal 2 (Ubuntu)"],
          ["note", "Without <code>joint_state_publisher</code>, <code>robot_state_publisher</code> can still publish the <b>fixed</b> frames (the head), but it has no angle for the wheel joints, so the wheel frames do not exist at all."],
          ["p", "In <b>terminal 3</b>, look at what is now being published:"],
          ["cmd", "ros2 topic list", "Terminal 3 (Ubuntu)"],
          ["out", "/joint_states\n/parameter_events\n/robot_description\n/rosout\n/tf\n/tf_static"],
          ["h", "Ask TF2 a question"],
          ["p", "<code>tf2_echo</code> answers &quot;where is frame B, measured from frame A?&quot;. Where is the head, relative to the base?"],
          ["cmd", "ros2 run tf2_ros tf2_echo base_link head", "Terminal 3 (Ubuntu)"],
          ["out", "At time 0.0\n- Translation: [0.100, 0.000, 0.120]\n- Rotation: in Quaternion (xyzw) [0.000, 0.000, 0.000, 1.000]\n- Rotation: in RPY (radian) [0.000, -0.000, 0.000]\n- Rotation: in RPY (degree) [0.000, -0.000, 0.000]\n- Matrix:\n  1.000  0.000  0.000  0.100\n  0.000  1.000  0.000  0.000\n  0.000  0.000  1.000  0.120\n  0.000  0.000  0.000  1.000"],
          ["p", "That is exactly the <code>origin xyz=&quot;0.1 0 0.12&quot;</code> you wrote in the URDF: 0.1 m forward, 0.12 m up, and no rotation. The rotation is shown three ways. A <b>quaternion</b> is four numbers that ROS uses internally, where <code>[0, 0, 0, 1]</code> means &quot;not rotated&quot;. <b>RPY</b> is roll, pitch and yaw, in radians and in degrees, which is easier for humans."],
          ["note", "You may see a line first that says <i>Waiting for transform ... frame does not exist</i>. That is normal: the tool started a moment before the first transform arrived. Press <code>Ctrl+C</code> to stop <code>tf2_echo</code>, because it keeps printing."],
          ["p", "Try the left wheel too:"],
          ["cmd", "ros2 run tf2_ros tf2_echo base_link left_wheel", "Terminal 3 (Ubuntu)"],
          ["out", "At time 1791285316.968771596\n- Translation: [-0.100, 0.120, -0.020]\n- Rotation: in Quaternion (xyzw) [0.000, 0.000, 0.000, 1.000]"],
          ["p", "The time is a big number rather than 0.0 because this frame is <b>moving</b> (it can spin), so it arrives on <code>/tf</code> over and over with fresh timestamps, whereas the head is static."],
          ["h", "Draw the whole tree"],
          ["cmd", "ros2 run tf2_tools view_frames", "Terminal 3 (Ubuntu)"],
          ["out", "[INFO] [view_frames]: Listening to tf data for 5.0 seconds...\n[INFO] [view_frames]: Generating graph in frames.pdf file...\n[INFO] [view_frames]: Result:tf2_msgs.srv.FrameGraph_Response(frame_yaml=\"left_wheel: \\n  parent: 'base_link'\\n  broadcaster: 'default_authority'\\n  rate: 10.200 ... (shortened)"],
          ["cmd", "ls frames_*", "Terminal 3 (Ubuntu)"],
          ["out", "frames_2026-10-06_14.15.23.gv\nframes_2026-10-06_14.15.23.pdf"],
          ["p", "The file names carry the date and time, so yours will differ. The <code>.pdf</code> is a diagram of the tree: <code>base_link</code> at the top with <code>head</code>, <code>left_wheel</code> and <code>right_wheel</code> hanging below it. To open it from Windows, paste this into the File Explorer address bar (replace <code>student</code> with your Linux user name):"],
          ["code", "\\\\wsl.localhost\\Ubuntu-22.04\\home\\student\\robot_practice", "File Explorer address bar"],
          ["h", "Add a frame yourself"],
          ["p", "Suppose you bolt a camera onto the robot, 0.2 m forward and 0.15 m up. You can announce a new fixed frame without touching the URDF:"],
          ["cmd", "ros2 run tf2_ros static_transform_publisher --x 0.2 --y 0 --z 0.15 --frame-id base_link --child-frame-id camera", "Terminal 3 (Ubuntu)"],
          ["p", "Leave that running, open <b>terminal 4</b> and ask:"],
          ["cmd", "ros2 run tf2_ros tf2_echo base_link camera", "Terminal 4 (Ubuntu)"],
          ["out", "At time 0.0\n- Translation: [0.200, 0.000, 0.150]\n- Rotation: in Quaternion (xyzw) [0.000, 0.000, 0.000, 1.000]"],
          ["p", "TF2 now knows about a <code>camera</code> frame. Anything that sees something in the camera frame can ask TF2 for its position in <code>base_link</code>, and the answer will be right."],
          ["note", "Later, in the navigation lesson, you will meet a longer chain: <code>map</code> to <code>odom</code> to <code>base_link</code>. It is the same idea: each link in the chain is a transform, and TF2 multiplies them for you."],
          ["warn", "Stop everything with <code>Ctrl+C</code> in each terminal when you finish. Leftover ROS nodes keep running in the background, use CPU, and make later <code>ros2 topic list</code> output confusing."],
          ["try", "Run <code>robot_state_publisher</code> and <code>joint_state_publisher</code>, then use <code>tf2_echo</code> to find where <code>right_wheel</code> is relative to <code>base_link</code>. It should match your URDF. Then run <code>view_frames</code> and open the PDF."],
          ["quiz", {
            q: "A camera is welded to your robot and never moves relative to it. Which topic carries that transform?",
            options: ["/tf_static", "/cmd_vel", "/joint_states", "/scan"],
            answer: 0,
            why: "Transforms that never change go on <code>/tf_static</code> and are sent once. Moving parts, such as wheels, publish on <code>/tf</code> continuously."
          }]
        ]
      },
      {
        id: "4.5", title: "Gazebo and the TurtleBot3", minutes: 35,
        blocks: [
          ["p", "RViz <i>shows</i> a robot. <b>Gazebo</b> <i>simulates</i> one: it adds gravity, wheels that grip the floor, collisions, and fake sensors that produce data like real hardware. You will use it with the <b>TurtleBot3 Burger</b>, a small, popular, two-wheeled robot with a 360-degree lidar. The simulated robot has the same topics as the real one, so what you learn transfers directly."],
          ["note", "Gazebo shows a banner saying this version reaches end-of-life in January 2025. That is expected. ROS 2 Humble works with this version (Gazebo 11, called &quot;Classic&quot;), and the banner can be ignored."],
          ["h", "One-time setup"],
          ["p", "First, tell the TurtleBot3 packages which model you want. Add it to <code>~/.bashrc</code> <b>once</b>, then open a new terminal:"],
          ["cmd", "echo \"export TURTLEBOT3_MODEL=burger\" >> ~/.bashrc"],
          ["p", "You should already have <code>LIBGL_ALWAYS_SOFTWARE=1</code> from lesson 4.2. Check it:"],
          ["cmd", "echo $LIBGL_ALWAYS_SOFTWARE $TURTLEBOT3_MODEL"],
          ["out", "1 burger"],
          ["p", "Second, Gazebo needs two basic models, the <b>ground plane</b> and the <b>sun</b>. It normally downloads them the first time, but that download can stall and leave you with a black window. Download them yourself, once:"],
          ["cmd", "mkdir -p ~/.gazebo/models"],
          ["cmd", "cd ~/.gazebo/models"],
          ["cmd", "curl -sL -o /tmp/ground_plane.tgz http://models.gazebosim.org/ground_plane/model.tar.gz && tar xzf /tmp/ground_plane.tgz"],
          ["cmd", "curl -sL -o /tmp/sun.tgz http://models.gazebosim.org/sun/model.tar.gz && tar xzf /tmp/sun.tgz"],
          ["cmd", "ls ~/.gazebo/models"],
          ["out", "ground_plane  sun"],
          ["h", "Launch the simulation"],
          ["cmd", "ros2 launch turtlebot3_gazebo empty_world.launch.py", "Terminal 1 (Ubuntu)"],
          ["p", "Be patient: the first start can take a minute or more. When it works you will see this line in the terminal, and a <b>Gazebo window</b> opens with a flat grey floor and a small robot with <b>blue rays</b> fanning out from it. Those rays are the lidar beams."],
          ["out", "[spawn_entity.py-4] [INFO] ... [spawn_entity]: Spawn status: SpawnEntity: Successfully spawned entity [burger]"],
          ["p", "Rotate the view with the left mouse button, slide it with the middle button and zoom with the scroll wheel, just like RViz."],
          ["warn", "Software rendering is slow and Gazebo is heavy. Close other big programs (browsers with many tabs, Docker, other simulators) before launching. If the picture looks jerky, that is normal, and the robot is still being simulated correctly."],
          ["warn", "<b>Always close Gazebo properly.</b> Press <code>Ctrl+C</code> in terminal 1 and wait. Then check that nothing is left behind: <code>pgrep gzserver</code> should print <b>nothing</b>. If it prints a number, run <code>killall -9 gzserver gzclient</code>. A leftover server keeps Gazebo&apos;s network port busy, and the <i>next</i> launch silently hangs with <code>Service /spawn_entity unavailable</code> in the log."],
          ["h", "What is the robot publishing?"],
          ["p", "Leave Gazebo running and open <b>terminal 2</b>:"],
          ["cmd", "ros2 topic list", "Terminal 2 (Ubuntu)"],
          ["out", "/clock\n/cmd_vel\n/imu\n/joint_states\n/odom\n/parameter_events\n/performance_metrics\n/robot_description\n/rosout\n/scan\n/tf\n/tf_static"],
          ["cmd", "ros2 topic list -t | grep -E \"cmd_vel|odom|scan|imu\"", "Terminal 2 (Ubuntu)"],
          ["out", "/cmd_vel [geometry_msgs/msg/Twist]\n/imu [sensor_msgs/msg/Imu]\n/odom [nav_msgs/msg/Odometry]\n/scan [sensor_msgs/msg/LaserScan]"],
          ["ul", [
            "<code>/cmd_vel</code> (<code>Twist</code>): the robot <b>listens</b> here. You publish a velocity and it drives. It is the same message type you used to move the turtle in lesson 2.6.",
            "<code>/odom</code> (<code>Odometry</code>): the robot&apos;s estimate of its own position, from counting wheel turns.",
            "<code>/scan</code> (<code>LaserScan</code>): the lidar. Distances to the nearest obstacle in every direction.",
            "<code>/imu</code> (<code>Imu</code>): a motion sensor, for tilt and turning speed."
          ]],
          ["cmd", "ros2 node list", "Terminal 2 (Ubuntu)"],
          ["out", "/gazebo\n/robot_state_publisher\n/turtlebot3_diff_drive\n/turtlebot3_imu\n/turtlebot3_joint_state\n/turtlebot3_laserscan"],
          ["p", "Each sensor and the wheel drive is its own node, created by plugins inside the simulator. The robot is made of the same pieces you have been learning."],
          ["h", "Drive it"],
          ["p", "Read where the robot is now:"],
          ["cmd", "ros2 topic echo --once --field pose.pose.position /odom", "Terminal 2 (Ubuntu)"],
          ["out", "x: 5.810263146661501e-05\ny: -9.940400327789326e-07\nz: 0.008526358832711942\n---"],
          ["p", "It starts essentially at (0, 0). The tiny numbers are simulation noise. Now publish a forward speed of 0.2 metres per second, 5 times a second, 12 times in a row:"],
          ["cmd", "ros2 topic pub --times 12 -r 5 /cmd_vel geometry_msgs/msg/Twist \"{linear: {x: 0.2}, angular: {z: 0.0}}\"", "Terminal 2 (Ubuntu)"],
          ["p", "In the Gazebo window the robot rolls forward. Stop it and read the position again:"],
          ["cmd", "ros2 topic pub --once /cmd_vel geometry_msgs/msg/Twist \"{}\"", "Terminal 2 (Ubuntu)"],
          ["cmd", "ros2 topic echo --once --field pose.pose.position /odom", "Terminal 2 (Ubuntu)"],
          ["out", "x: 0.6800609128902806\ny: -1.076680794312546e-06\nz: 0.008511148177147793\n---"],
          ["p", "<code>x</code> grew to about 0.68 m and <code>y</code> stayed near zero, so it drove straight. Your exact number will differ a little, because the simulation does not run in perfect real time. The empty message <code>{}</code> is a Twist of all zeros, which means &quot;stop&quot;."],
          ["warn", "Always send a zero Twist when you finish driving. A robot does what its last command said, and on a real robot forgetting to stop it can be expensive."],
          ["p", "To drive by hand with the keyboard, run this in a terminal and press its keys while that terminal is selected (it prints its own help list when it starts). Press <code>Ctrl+C</code> to quit:"],
          ["cmd", "ros2 run teleop_twist_keyboard teleop_twist_keyboard", "Terminal 2 (Ubuntu)"],
          ["h", "Read the lidar"],
          ["p", "A <code>LaserScan</code> describes a ring of distance measurements. Ask for its settings:"],
          ["cmd", "ros2 topic echo --once --field range_min /scan", "Terminal 2 (Ubuntu)"],
          ["out", "0.11999999731779099"],
          ["cmd", "ros2 topic echo --once --field range_max /scan", "Terminal 2 (Ubuntu)"],
          ["out", "3.5"],
          ["cmd", "ros2 topic echo --once --field angle_increment /scan", "Terminal 2 (Ubuntu)"],
          ["out", "0.01749303564429283"],
          ["p", "So the lidar sees from 0.12 m out to 3.5 m. The beams are 0.0175 radians (one degree) apart, and a full turn is about 6.28 radians, so one scan holds <b>360 distances</b> in a list called <code>ranges</code>. Beam 0 points straight ahead, and the rest go counter-clockwise. A reading of <code>inf</code> means &quot;nothing within 3.5 m in that direction&quot;. In the empty world almost everything is <code>inf</code>."],
          ["note", "Do not echo <code>ranges</code> directly. ROS shortens long lists to <code>'...'</code> in the terminal. In the next lesson you will read the whole list with Python."],
          ["cmd", "ros2 topic hz /odom", "Terminal 2 (Ubuntu)"],
          ["out", "average rate: 29.297\n\tmin: 0.032s max: 0.037s std dev: 0.00108s window: 31"],
          ["p", "Odometry arrives about 30 times a second. The scan arrives much slower, around 5 times a second, which is normal for a lidar. Press <code>Ctrl+C</code> to stop <code>topic hz</code>."],
          ["h", "A world with obstacles"],
          ["p", "Close the empty world properly (see the warning above), then launch the world with nine pillars. This is the same layout that the navigation lesson will use:"],
          ["cmd", "ros2 launch turtlebot3_gazebo turtlebot3_world.launch.py", "Terminal 1 (Ubuntu)"],
          ["p", "Look at the Gazebo window: the blue lidar rays now stop at the pillars instead of flying off into nothing. Almost all of the 360 beams now hit something, and the nearest object is about half a metre away."],
          ["try", "Launch the empty world, drive the robot forward with the <code>/cmd_vel</code> command, stop it, and check that <code>/odom</code> changed. Then close Gazebo with <code>Ctrl+C</code> and confirm <code>pgrep gzserver</code> prints nothing."],
          ["quiz", {
            q: "Which topic do you publish a <code>Twist</code> to, in order to drive the simulated TurtleBot3?",
            options: ["/scan", "/odom", "/cmd_vel", "/imu"],
            answer: 2,
            why: "<code>/cmd_vel</code> (command velocity) is the robot&apos;s input. <code>/scan</code>, <code>/odom</code> and <code>/imu</code> are outputs that it publishes."
          }]
        ]
      },
      {
        "id": "4.6",
        "title": "Drive and sense with Python",
        "minutes": 40,
        "blocks": [
          [
            "p",
            "So far you have driven the robot with typed commands. Real robots are driven by <b>programs</b>: code that reads sensors and decides what to do. In this lesson you write three small nodes. The first drives, the second reads the lidar, and the third combines them into a robot that <b>stops before it hits a wall</b>. Everything you learned about nodes, publishers and subscribers in Module 2 applies unchanged."
          ],
          [
            "h",
            "Start the world"
          ],
          [
            "p",
            "In <b>terminal 1</b>, launch the TurtleBot3 world with its pillars and walls. It takes a minute or more to load."
          ],
          [
            "cmd",
            "ros2 launch turtlebot3_gazebo turtlebot3_world.launch.py",
            "Terminal 1 (Ubuntu)"
          ],
          [
            "p",
            "You write and run your scripts in <b>terminal 2</b>, inside your practice folder:"
          ],
          [
            "cmd",
            "mkdir -p ~/robot_practice && cd ~/robot_practice",
            "Terminal 2 (Ubuntu)"
          ],
          [
            "h",
            "Script 1: drive forward, then stop"
          ],
          [
            "cmd",
            "nano drive_forward.py",
            "Terminal 2 (Ubuntu)"
          ],
          [
            "code",
            "import rclpy\nfrom rclpy.node import Node\nfrom geometry_msgs.msg import Twist\n\n\nclass DriveForward(Node):\n    def __init__(self):\n        super().__init__(\"drive_forward\")\n        self.publisher = self.create_publisher(Twist, \"/cmd_vel\", 10)\n        self.timer = self.create_timer(0.1, self.tick)\n        self.ticks = 0\n        self.done = False\n\n    def tick(self):\n        msg = Twist()\n        if self.ticks < 30:\n            msg.linear.x = 0.2\n        self.publisher.publish(msg)\n        self.ticks += 1\n        if self.ticks == 40:\n            self.get_logger().info(\"Finished: the robot has been told to stop\")\n            self.done = True\n\n\ndef main():\n    rclpy.init()\n    node = DriveForward()\n    try:\n        while rclpy.ok() and not node.done:\n            rclpy.spin_once(node, timeout_sec=0.1)\n    except KeyboardInterrupt:\n        pass\n    finally:\n        if rclpy.ok():\n            node.publisher.publish(Twist())\n        node.destroy_node()\n        if rclpy.ok():\n            rclpy.shutdown()\n\n\nif __name__ == \"__main__\":\n    main()",
            "drive_forward.py"
          ],
          [
            "p",
            "This is the publisher pattern from lesson 2.6, with three changes:"
          ],
          [
            "ul",
            [
              "The topic is <code>/cmd_vel</code> and the timer runs <b>10 times a second</b> (every 0.1 s). A robot expects a steady stream of commands, not a single one.",
              "<code>self.ticks</code> counts the timer calls. For the first 30 ticks (3 seconds) the command is <code>linear.x = 0.2</code>, so the robot covers about <code>0.2 × 3 = 0.6</code> metres. After that the message is an empty <code>Twist()</code>, which is all zeros: <b>stop</b>.",
              "Instead of <code>rclpy.spin(node)</code>, the loop <code>while rclpy.ok() and not node.done</code> with <code>spin_once</code> lets the node <b>finish by itself</b> after 40 ticks. In <code>finally</code>, a last zero <code>Twist</code> is sent as a safety net. The <code>if rclpy.ok()</code> check matters: after Ctrl+C, ROS has already shut down and publishing would crash."
            ]
          ],
          [
            "cmd",
            "python3 drive_forward.py",
            "Terminal 2 (Ubuntu)"
          ],
          [
            "out",
            "[INFO] [1791286104.427509548] [drive_forward]: Finished: the robot has been told to stop"
          ],
          [
            "p",
            "In the Gazebo window the robot rolls forward and stops. Check how far it went:"
          ],
          [
            "cmd",
            "ros2 topic echo --once --field pose.pose.position /odom",
            "Terminal 2 (Ubuntu)"
          ],
          [
            "out",
            "x: -1.4083368624960655\ny: -0.5000009243039826\n... (a z value and a --- line follow)"
          ],
          [
            "p",
            "In this world the robot starts at <code>x = -2.0</code>, so it moved about 0.59 m, almost exactly the 0.6 m you calculated. <code>y</code> did not change, so it drove straight."
          ],
          [
            "h",
            "Script 2: read the lidar"
          ],
          [
            "cmd",
            "nano lidar_reader.py",
            "Terminal 2 (Ubuntu)"
          ],
          [
            "code",
            "import math\n\nimport rclpy\nfrom rclpy.node import Node\nfrom rclpy.qos import qos_profile_sensor_data\nfrom sensor_msgs.msg import LaserScan\n\n\nclass LidarReader(Node):\n    def __init__(self):\n        super().__init__(\"lidar_reader\")\n        self.create_subscription(LaserScan, \"/scan\", self.on_scan, qos_profile_sensor_data)\n\n    def on_scan(self, msg):\n        front = list(msg.ranges[:15]) + list(msg.ranges[-15:])\n        seen = [r for r in front if math.isfinite(r) and r > msg.range_min]\n        if seen:\n            self.get_logger().info(f\"Nearest thing ahead: {min(seen):.2f} m\", throttle_duration_sec=1.0)\n        else:\n            self.get_logger().info(\"Nothing ahead within range\", throttle_duration_sec=1.0)\n\n\ndef main():\n    rclpy.init()\n    node = LidarReader()\n    try:\n        rclpy.spin(node)\n    except KeyboardInterrupt:\n        pass\n    finally:\n        node.destroy_node()\n        if rclpy.ok():\n            rclpy.shutdown()\n\n\nif __name__ == \"__main__\":\n    main()",
            "lidar_reader.py"
          ],
          [
            "p",
            "This is the subscriber pattern from lesson 2.7. The new parts:"
          ],
          [
            "ul",
            [
              "<code>msg.ranges</code> is a list of 360 distances, one per degree. Beam <b>0 points straight ahead</b> and the numbers rise counter-clockwise, so beams 345 to 359 are just to the right of ahead.",
              "<code>msg.ranges[:15]</code> takes the <b>first</b> 15 beams (0 to 14 degrees, left of centre) and <code>msg.ranges[-15:]</code> the <b>last</b> 15 (the 15 degrees to the right). Together they form a 30-degree cone straight ahead.",
              "<code>math.isfinite(r)</code> throws away the <code>inf</code> readings that mean &quot;nothing within range&quot;, and <code>r &gt; msg.range_min</code> throws away readings too close to be trustworthy. What remains are real obstacles.",
              "<code>min(seen)</code> is the distance to the closest one. The <code>f&quot;...{min(seen):.2f}...&quot;</code> string puts it in the log with 2 decimals.",
              "<code>throttle_duration_sec=1.0</code> limits the log to one line per second, otherwise the 5 scans a second would flood the terminal.",
              "<code>qos_profile_sensor_data</code> replaces the usual <code>10</code>. It is the <b>QoS</b> (quality of service) setting that real sensors use: &quot;newest data matters, don't resend old data&quot;."
            ]
          ],
          [
            "warn",
            "Use <code>qos_profile_sensor_data</code> for every sensor topic. In the simulator a plain <code>10</code> happens to work too (I tested both), but on a <b>real robot</b> the same code with <code>10</code> silently receives <i>nothing</i>: no error, just an empty callback. It is one of the most common ROS 2 bugs."
          ],
          [
            "cmd",
            "python3 lidar_reader.py",
            "Terminal 2 (Ubuntu)"
          ],
          [
            "out",
            "[INFO] [1791286090.462808512] [lidar_reader]: Nearest thing ahead: 1.93 m\n[INFO] [1791286091.467734489] [lidar_reader]: Nearest thing ahead: 1.95 m\n[INFO] [1791286092.478523329] [lidar_reader]: Nearest thing ahead: 1.94 m"
          ],
          [
            "p",
            "The numbers wobble by a few millimetres because the simulated lidar has a little noise, just like a real one. Stop it with <code>Ctrl+C</code>."
          ],
          [
            "h",
            "Script 3: stop before the wall"
          ],
          [
            "p",
            "Now join the two. The robot drives forward slowly and stops when something is closer than 0.5 m. Notice how the code is split in two: <code>on_scan</code> only <b>senses</b> (it updates the <code>blocked</code> flag) and <code>drive</code> only <b>acts</b> (it publishes a command based on that flag). Keeping sensing and acting apart makes robot code much easier to debug."
          ],
          [
            "cmd",
            "nano obstacle_stop.py",
            "Terminal 2 (Ubuntu)"
          ],
          [
            "code",
            "import math\n\nimport rclpy\nfrom rclpy.node import Node\nfrom rclpy.qos import qos_profile_sensor_data\nfrom geometry_msgs.msg import Twist\nfrom sensor_msgs.msg import LaserScan\n\nSTOP_DISTANCE = 0.5\nSPEED = 0.15\n\n\nclass ObstacleStop(Node):\n    def __init__(self):\n        super().__init__(\"obstacle_stop\")\n        self.publisher = self.create_publisher(Twist, \"/cmd_vel\", 10)\n        self.create_subscription(LaserScan, \"/scan\", self.on_scan, qos_profile_sensor_data)\n        self.create_timer(0.1, self.drive)\n        self.blocked = False\n\n    def on_scan(self, msg):\n        front = list(msg.ranges[:15]) + list(msg.ranges[-15:])\n        seen = [r for r in front if math.isfinite(r) and r > msg.range_min]\n        blocked = bool(seen) and min(seen) < STOP_DISTANCE\n        if blocked and not self.blocked:\n            self.get_logger().info(f\"Obstacle at {min(seen):.2f} m, stopping\")\n        self.blocked = blocked\n\n    def drive(self):\n        msg = Twist()\n        if not self.blocked:\n            msg.linear.x = SPEED\n        self.publisher.publish(msg)\n\n\ndef main():\n    rclpy.init()\n    node = ObstacleStop()\n    try:\n        rclpy.spin(node)\n    except KeyboardInterrupt:\n        pass\n    finally:\n        if rclpy.ok():\n            node.publisher.publish(Twist())\n        node.destroy_node()\n        if rclpy.ok():\n            rclpy.shutdown()\n\n\nif __name__ == \"__main__\":\n    main()",
            "obstacle_stop.py"
          ],
          [
            "cmd",
            "python3 obstacle_stop.py",
            "Terminal 2 (Ubuntu)"
          ],
          [
            "out",
            "[INFO] [1791286287.890910303] [obstacle_stop]: Obstacle at 0.49 m, stopping"
          ],
          [
            "p",
            "The robot crawls forward (slowly, at 0.15 m/s) and stops in front of the wall after about half a minute. You may see the stop message twice: the robot coasts a few millimetres and the distance crosses the 0.5 m line again. Press <code>Ctrl+C</code> when it has stopped. It sends a final zero <code>Twist</code> and exits cleanly."
          ],
          [
            "note",
            "You can see the robot did stop: run <code>ros2 topic echo --once --field pose.pose.position /odom</code> twice a couple of seconds apart. The <code>x</code> values match to about six decimal places."
          ],
          [
            "warn",
            "Close Gazebo with <code>Ctrl+C</code> in terminal 1 when you are done, then check that <code>pgrep gzserver</code> prints nothing (lesson 4.5). The robot is now parked at the wall, so a new launch is also the quickest way to put it back at the start."
          ],
          [
            "try",
            "In <code>obstacle_stop.py</code>, change <code>STOP_DISTANCE</code> to <code>1.0</code> and relaunch the world. Does the robot stop earlier? Then try <code>SPEED = 0.3</code>. Does it still stop at the right place, or does it overshoot? Why might a faster robot need a bigger stopping distance?"
          ],
          [
            "quiz",
            {
              "q": "A lidar reading in <code>msg.ranges</code> is <code>inf</code>. What does that mean?",
              "options": [
                "The lidar is broken",
                "Nothing was detected within the lidar's maximum range in that direction",
                "The obstacle is exactly touching the robot",
                "The robot is moving too fast"
              ],
              "answer": 1,
              "why": "<code>inf</code> means &quot;no echo within <code>range_max</code>&quot; (3.5 m for this lidar). That is why the scripts filter with <code>math.isfinite</code> before taking the minimum."
            }
          ],
          [
            "quiz",
            {
              "q": "Why does <code>drive_forward.py</code> publish an empty <code>Twist()</code> at the end?",
              "options": [
                "To reset the simulator",
                "A zero Twist is the command &quot;stop&quot;. Without it the robot might keep following its last speed",
                "To delete the topic",
                "Python requires it"
              ],
              "answer": 1,
              "why": "A robot does what its last command said. Always finish a movement program with an explicit zero velocity."
            }
          ]
        ]
      },
      {
        "id": "4.7",
        "title": "Autonomous navigation with Nav2",
        "minutes": 45,
        "blocks": [
          [
            "p",
            "Until now you told the robot exactly how to move. <b>Nav2</b> (Navigation 2) is the standard ROS 2 system that lets you say only <b>where</b> to go. You give it a goal on a map, and it works out a route, drives it, and steers around anything in the way, including things that were not on the map. It is the biggest piece of software you will use in this course, so first meet its parts."
          ],
          [
            "ul",
            [
              "<b>map_server</b>: loads a saved map, a picture where white is free floor and black is wall.",
              "<b>AMCL</b> (localization): answers &quot;where am I on the map?&quot; by matching the lidar scan against the map. It also publishes the <code>map</code> to <code>odom</code> transform you met in lesson 4.4.",
              "<b>costmaps</b>: grids that mark how risky each spot is. Obstacles are &quot;inflated&quot; so the robot keeps a safe distance. There is a <b>global</b> one (the whole map) and a <b>local</b> one (the area around the robot, updated live from the lidar).",
              "<b>planner_server</b>: draws the best path from here to the goal across the global costmap.",
              "<b>controller_server</b>: follows that path by publishing velocities on <code>/cmd_vel</code> (the same topic you drove by hand), dodging obstacles seen in the local costmap.",
              "<b>bt_navigator</b>: the manager. It runs a behaviour tree that calls the planner and controller, and tries recovery moves (back up, spin) when the robot gets stuck."
            ]
          ],
          [
            "note",
            "The TF chain from lesson 4.4 now makes sense: <code>map</code> to <code>odom</code> is published by AMCL, and <code>odom</code> to <code>base_link</code> comes from the wheel odometry. TF2 multiplies the two so everything can be expressed on the map."
          ],
          [
            "h",
            "One-time setup"
          ],
          [
            "p",
            "Nav2&apos;s launch file loads the TurtleBot3 world by model name, and Gazebo needs to know where those models live. Without this, Gazebo hangs looking for them online, and you see <code>Spawn service failed</code> after a long wait (the same kind of stall as in lesson 4.5). Add the folder to <code>~/.bashrc</code> <b>once</b>, then open a new terminal:"
          ],
          [
            "cmd",
            "echo 'export GAZEBO_MODEL_PATH=$GAZEBO_MODEL_PATH:/opt/ros/humble/share/turtlebot3_gazebo/models' >> ~/.bashrc"
          ],
          [
            "note",
            "Nav2&apos;s launch file spawns its own TurtleBot3 (the &quot;waffle&quot; type), whatever <code>TURTLEBOT3_MODEL</code> says. You do not need to change that setting."
          ],
          [
            "p",
            "Before launching, make sure no earlier Gazebo is still running. This must print nothing:"
          ],
          [
            "cmd",
            "pgrep gzserver",
            "Terminal 1 (Ubuntu)"
          ],
          [
            "h",
            "Launch Nav2 with the simulator"
          ],
          [
            "cmd",
            "ros2 launch nav2_bringup tb3_simulation_launch.py headless:=True",
            "Terminal 1 (Ubuntu)"
          ],
          [
            "p",
            "<code>headless:=True</code> means &quot;do not open the Gazebo window&quot;. The simulation still runs, but you skip the heaviest part of the picture, which matters with software rendering. You will watch everything in <b>RViz</b> instead, which opens by itself."
          ],
          [
            "warn",
            "Be patient. Nav2 plus the simulator usually needs about a minute to come up (the first launch after restarting your PC can take longer), and your PC will be working hard. While it loads, RViz shows a red <i>Global Status: Error</i>. That is normal until you set the initial pose in step 1."
          ],
          [
            "h",
            "Step 1: tell the robot where it is"
          ],
          [
            "p",
            "Nav2 does not know where the robot starts. Until you tell it, the <b>Navigation 2</b> panel at the bottom left of RViz says <i>inactive</i>. The TurtleBot starts at <code>x = -2.0, y = -0.5</code>, pointing along the <code>x</code> axis (to the right on the map)."
          ],
          [
            "ul",
            [
              "Click the <b>2D Pose Estimate</b> button in the RViz toolbar.",
              "Click on the map where the robot is, hold the mouse button, and <b>drag in the direction the robot faces</b>, then let go.",
              "A cloud of small green arrows appears around the robot. These are AMCL&apos;s guesses. Within a few seconds they tighten up as the lidar matches the map.",
              "The Navigation 2 panel changes to <b>Navigation: active</b> and <b>Localization: active</b>."
            ]
          ],
          [
            "p",
            "If you prefer typing, this sends the same pose from a second terminal:"
          ],
          [
            "cmd",
            "ros2 topic pub --times 5 -r 1 /initialpose geometry_msgs/msg/PoseWithCovarianceStamped \"{header: {frame_id: map}, pose: {pose: {position: {x: -2.0, y: -0.5, z: 0.0}, orientation: {w: 1.0}}, covariance: [0.25,0,0,0,0,0, 0,0.25,0,0,0,0, 0,0,0,0,0,0, 0,0,0,0,0,0, 0,0,0,0,0,0, 0,0,0,0,0,0.07]}}\"",
            "Terminal 2 (Ubuntu)"
          ],
          [
            "p",
            "Now ask TF2 where the robot is on the map. It should be very close to where you said:"
          ],
          [
            "cmd",
            "ros2 run tf2_ros tf2_echo map base_link",
            "Terminal 2 (Ubuntu)"
          ],
          [
            "out",
            "At time 9.427000000\n- Translation: [-1.967, -0.494, 0.010]\n... (more lines, press Ctrl+C)"
          ],
          [
            "p",
            "The small difference from (-2.0, -0.5) is AMCL&apos;s own estimate. It is never exact."
          ],
          [
            "h",
            "Step 2: send it somewhere"
          ],
          [
            "p",
            "Click <b>Nav2 Goal</b> in the toolbar, then click on a patch of free floor (a white or light area, not on a black wall or a pillar), and drag to choose the direction the robot should face when it arrives. The robot sets off. You will see:"
          ],
          [
            "ul",
            [
              "A <b>green line</b>: the global plan, the route to the goal.",
              "The <b>costmaps</b> as coloured halos around the walls and pillars. Warm colours (red, purple) are dangerous cells close to obstacles, cool cyan is the inflated safety margin. The planner avoids the warm cells.",
              "The <b>Navigation 2</b> panel counting down distance remaining, and finally <b>Feedback: reached</b>."
            ]
          ],
          [
            "p",
            "You can send a goal from the terminal too. This is the same thing the RViz button does:"
          ],
          [
            "cmd",
            "ros2 action send_goal /navigate_to_pose nav2_msgs/action/NavigateToPose \"{pose: {header: {frame_id: map}, pose: {position: {x: 0.55, y: 0.55, z: 0.0}, orientation: {w: 1.0}}}}\"",
            "Terminal 2 (Ubuntu)"
          ],
          [
            "out",
            "Goal accepted with ID: 82447c63c6644649b9d51784252aaef0\n\nResult:\n    result: {}\n\nGoal finished with status: SUCCEEDED"
          ],
          [
            "p",
            "Notice <code>ros2 action</code>. A goal is not a topic message: it is an <b>action</b>, a request that takes a while, reports progress and ends with a result. The robot counts the goal as reached once it is within a small tolerance of it (about a quarter of a metre by default), so it may stop a little short of the exact point."
          ],
          [
            "warn",
            "If you see <code>Goal was rejected</code>, Nav2 is not active yet. Either the initial pose was never set, or the system is still starting. Check the Navigation 2 panel and try again."
          ],
          [
            "h",
            "Look inside"
          ],
          [
            "cmd",
            "ros2 action list",
            "Terminal 2 (Ubuntu)"
          ],
          [
            "out",
            "/assisted_teleop\n/backup\n/compute_path_through_poses\n/compute_path_to_pose\n/drive_on_heading\n/follow_path\n/follow_waypoints\n/navigate_through_poses\n/navigate_to_pose\n/smooth_path\n/spin\n/wait"
          ],
          [
            "p",
            "<code>/navigate_to_pose</code> is the one you used. <code>/follow_waypoints</code> visits a list of goals in order, and you will use it in the capstone. <code>/spin</code> and <code>/backup</code> are the recovery moves."
          ],
          [
            "cmd",
            "ros2 topic list | grep -E \"^/(plan|local_plan|map|scan|cmd_vel|goal_pose|initialpose|amcl_pose|odom)$\"",
            "Terminal 2 (Ubuntu)"
          ],
          [
            "out",
            "/amcl_pose\n/cmd_vel\n/goal_pose\n/initialpose\n/local_plan\n/map\n/odom\n/plan\n/scan"
          ],
          [
            "ul",
            [
              "<code>/plan</code> and <code>/local_plan</code> are the green paths you see in RViz.",
              "<code>/cmd_vel</code> is the same topic your Python drove with in lesson 4.6. Nav2 is just another node publishing velocities, which is why nothing about the robot had to change.",
              "<code>/initialpose</code> and <code>/goal_pose</code> are what the RViz buttons publish."
            ]
          ],
          [
            "cmd",
            "ros2 node list | grep -E \"amcl|planner|controller|bt_navigator|map_server|costmap\"",
            "Terminal 2 (Ubuntu)"
          ],
          [
            "out",
            "/amcl\n/bt_navigator\n/controller_server\n/global_costmap/global_costmap\n/local_costmap/local_costmap\n/map_server\n/planner_server"
          ],
          [
            "p",
            "Every part from the list at the top of the lesson is a node you can see. Nothing is hidden."
          ],
          [
            "h",
            "Shutting down"
          ],
          [
            "p",
            "Press <code>Ctrl+C</code> in terminal 1 and wait. Nav2 runs several background processes, and one of them can survive. Check for leftovers:"
          ],
          [
            "cmd",
            "pgrep -f \"gzserver|component_container\"",
            "Terminal 2 (Ubuntu)"
          ],
          [
            "p",
            "It should print nothing. If it prints numbers, stop them with <code>pkill -9 -f component_container</code> and <code>killall -9 gzserver</code>. A leftover Nav2 container uses a lot of CPU and confuses the next run."
          ],
          [
            "try",
            "Launch Nav2, set the initial pose, then send <b>three different goals in a row</b> with the Nav2 Goal button, one after the other, to places around the pillars. Watch the green path change shape to avoid them."
          ],
          [
            "quiz",
            {
              "q": "What is AMCL&apos;s job in Nav2?",
              "options": [
                "Planning the path to the goal",
                "Working out where the robot is on the map, using the lidar and the map",
                "Driving the wheels",
                "Drawing the map in RViz"
              ],
              "answer": 1,
              "why": "AMCL is the <b>localization</b> part: it compares the lidar scan with the map to estimate the robot&apos;s position. The planner draws the path and the controller drives."
            }
          ],
          [
            "quiz",
            {
              "q": "You send a Nav2 goal and get <code>Goal was rejected</code>. What is the most likely cause?",
              "options": [
                "The goal is too close to the robot",
                "Nav2 is not active yet, for example because the initial pose was not set",
                "The map is too large",
                "ROS 2 does not support goals"
              ],
              "answer": 1,
              "why": "Nav2 only accepts goals when its navigation nodes are active, and that needs a known starting pose first. Set the pose with 2D Pose Estimate and check the Navigation 2 panel."
            }
          ]
        ]
      },
      {
        "id": "4.8",
        "title": "Capstone: your own goal sender",
        "minutes": 60,
        "blocks": [
          [
            "p",
            "In lesson 4.7 you clicked in RViz to send the robot places. Now you will replace the mouse with <b>your own program</b>. This is what real robot applications look like: a delivery robot, a warehouse cart or a security patrol is a Python or C++ node that sends Nav2 a list of goals, not a person clicking."
          ],
          [
            "p",
            "Nav2 comes with a friendly Python helper called <b>nav2_simple_commander</b>. Its <code>BasicNavigator</code> class wraps the actions you used from the terminal (<code>/navigate_to_pose</code>, <code>/follow_waypoints</code>) into a few simple methods."
          ],
          [
            "h",
            "A worked example: go to one goal"
          ],
          [
            "p",
            "Start the simulation in <b>terminal 1</b>, exactly as in lesson 4.7. You do <b>not</b> need to click anything in RViz this time, the script will set the starting pose for you."
          ],
          [
            "cmd",
            "ros2 launch nav2_bringup tb3_simulation_launch.py headless:=True",
            "Terminal 1 (Ubuntu)"
          ],
          [
            "p",
            "In <b>terminal 2</b>, write the script:"
          ],
          [
            "cmd",
            "cd ~/robot_practice && nano go_to_goal.py",
            "Terminal 2 (Ubuntu)"
          ],
          [
            "code",
            "import time\n\nimport rclpy\nfrom geometry_msgs.msg import PoseStamped\nfrom nav2_simple_commander.robot_navigator import BasicNavigator, TaskResult\n\nSTART = (-2.0, -0.5)\nGOAL = (0.55, 0.55)\n\n\ndef make_pose(x, y):\n    pose = PoseStamped()\n    pose.header.frame_id = \"map\"\n    pose.pose.position.x = x\n    pose.pose.position.y = y\n    pose.pose.orientation.w = 1.0\n    return pose\n\n\ndef main():\n    rclpy.init()\n    navigator = BasicNavigator()\n    navigator.setInitialPose(make_pose(*START))\n    navigator.waitUntilNav2Active()\n\n    navigator.goToPose(make_pose(*GOAL))\n    while not navigator.isTaskComplete():\n        feedback = navigator.getFeedback()\n        if feedback:\n            print(f\"Distance remaining: {feedback.distance_remaining:.2f} m\")\n        time.sleep(1.0)\n\n    result = navigator.getResult()\n    if result == TaskResult.SUCCEEDED:\n        print(\"Goal reached!\")\n    elif result == TaskResult.CANCELED:\n        print(\"Goal was canceled\")\n    else:\n        print(\"Goal failed\")\n    rclpy.shutdown()\n\n\nif __name__ == \"__main__\":\n    main()",
            "go_to_goal.py"
          ],
          [
            "ul",
            [
              "<code>make_pose(x, y)</code> builds a <code>PoseStamped</code>, ROS&apos;s &quot;a position and direction, in a named frame&quot;. The frame is <code>map</code>, the same map as in RViz. <code>orientation.w = 1.0</code> means &quot;facing along the map&apos;s x axis&quot; (no rotation). The <code>*START</code> unpacks the pair <code>(-2.0, -0.5)</code> into the two arguments.",
              "<code>BasicNavigator()</code> is itself a node. <code>setInitialPose(...)</code> does the job of RViz&apos;s <b>2D Pose Estimate</b> button.",
              "<code>waitUntilNav2Active()</code> waits until localization and navigation are both ready, so the goal will not be rejected.",
              "<code>goToPose(...)</code> sends the goal and returns <b>immediately</b>. The robot is still driving, so the program loops: <code>isTaskComplete()</code> says whether it has finished, and <code>getFeedback()</code> reports progress. Here you print the <code>distance_remaining</code> once a second.",
              "<code>getResult()</code> gives a <code>TaskResult</code>: <code>SUCCEEDED</code>, <code>CANCELED</code> or <code>FAILED</code>. A good program always checks which one it got."
            ]
          ],
          [
            "cmd",
            "python3 go_to_goal.py",
            "Terminal 2 (Ubuntu)"
          ],
          [
            "out",
            "[INFO] [...] [basic_navigator]: Publishing Initial Pose\n[INFO] [...] [basic_navigator]: Setting initial pose\n[INFO] [...] [basic_navigator]: Waiting for amcl_pose to be received\n... (these three lines repeat a few times)\n[INFO] [...] [basic_navigator]: Nav2 is ready for use!\n[INFO] [...] [basic_navigator]: Navigating to goal: 0.55 0.55...\nDistance remaining: 3.39 m\nDistance remaining: 3.27 m\nDistance remaining: 3.10 m\nDistance remaining: 2.75 m\n...\nDistance remaining: 0.72 m\nDistance remaining: 0.45 m\nGoal reached!"
          ],
          [
            "p",
            "The whole thing took about half a minute here. In RViz the robot drove across the map to the goal, with the distance falling steadily to zero."
          ],
          [
            "warn",
            "The script <b>assumes the robot is standing at <code>START</code></b>, because that is the pose it tells Nav2. That is true only on a <b>freshly launched</b> simulation. If you run it a second time without restarting, Nav2 believes the wrong position, and the planner may fail with <code>Goal failed</code> (the terminal running Nav2 will say <i>failed to generate a valid path</i>). This is a very common trap. Between runs, close the simulation with <code>Ctrl+C</code>, check <code>pgrep -f &quot;gzserver|component_container&quot;</code> is empty, and launch again."
          ],
          [
            "h",
            "The capstone: a patrol"
          ],
          [
            "p",
            "Your task: write <code>patrol.py</code>, a program that sends the robot on a <b>lap around the middle pillar</b>, visiting four waypoints in order, then reports whether the lap succeeded."
          ],
          [
            "p",
            "The four waypoints are the four open gaps around the central pillar. In map coordinates, in order:"
          ],
          [
            "ul",
            [
              "<code>(-0.55, 0.55)</code>",
              "<code>(0.55, 0.55)</code>",
              "<code>(0.55, -0.55)</code>",
              "<code>(-0.55, -0.55)</code>"
            ]
          ],
          [
            "p",
            "Requirements:"
          ],
          [
            "ul",
            [
              "Start from <code>go_to_goal.py</code> and copy it to <code>patrol.py</code>. The robot starts at <code>(-2.0, -0.5)</code> on a fresh simulation, as before.",
              "Keep a Python <b>list</b> of waypoint tuples at the top of the file, and build the poses from it with a <b>list comprehension</b> (lesson 1.6).",
              "Instead of <code>goToPose</code>, use the navigator method <b><code>followWaypoints(poses)</code></b>, which visits a list of poses in order.",
              "While it runs, <code>getFeedback()</code> has a field <code>current_waypoint</code> (counting from 0). Print <code>Heading to waypoint 1 of 4</code>, <code>2 of 4</code> and so on, but <b>only when the number changes</b>, so the screen does not fill with repeats.",
              "When the task is complete, print the result."
            ]
          ],
          [
            "p",
            "<b>Stretch goals</b>, once the basic lap works:"
          ],
          [
            "ul",
            [
              "Do <b>three laps</b>, using a <code>for</code> loop and printing the lap number and how long each lap took (<code>time.time()</code>). Remember the starting position changes after the first lap, so set the initial pose only once.",
              "Make <code>Ctrl+C</code> stop the robot cleanly: catch <code>KeyboardInterrupt</code> and call <code>navigator.cancelTask()</code> before shutting down.",
              "Read the waypoints from the command line, so you can change them without editing the file (<code>sys.argv</code>)."
            ]
          ],
          [
            "note",
            "No solution is given on purpose. You have seen every piece: Python lists, nodes, the Nav2 map and the commands. The one new thing is <code>followWaypoints</code>, and it works almost exactly like <code>goToPose</code>. If you get stuck, paste your code and the error to Claude and ask for a hint, not the answer."
          ],
          [
            "warn",
            "Test on a <b>fresh simulation</b> every time (see the warning above). If the robot refuses to move or the result is <code>FAILED</code>, check three things in order: is the simulation freshly launched, do the coordinates in your list match the table above, and did you set the initial pose?"
          ],
          [
            "try",
            "Do the capstone. When <code>python3 patrol.py</code> makes the robot drive the whole lap and your program prints that all four waypoints were visited, mark this quest complete."
          ],
          [
            "quiz",
            {
              "q": "Which <code>BasicNavigator</code> method sends a <b>list</b> of goals that the robot should visit in order?",
              "options": [
                "goToPose",
                "followWaypoints",
                "setInitialPose",
                "waitUntilNav2Active"
              ],
              "answer": 1,
              "why": "<code>goToPose</code> sends one goal. <code>followWaypoints</code> takes a list of poses and visits them one after another. The other two set up the start and wait for Nav2."
            }
          ],
          [
            "quiz",
            {
              "q": "Your script says <code>Goal failed</code>. You are running it a second time without restarting the simulation. What is the likely reason?",
              "options": [
                "Python forgot the goal",
                "The script told Nav2 the robot is at START, but the robot is somewhere else, so planning goes wrong",
                "Gazebo does not support goals",
                "You must use a bigger map"
              ],
              "answer": 1,
              "why": "<code>setInitialPose</code> tells Nav2 where the robot is. If the real robot is elsewhere, its idea of the world is wrong. Restart the simulation so the robot really is at <code>START</code>."
            }
          ],
          [
            "h",
            "You made it"
          ],
          [
            "p",
            "Look at what you can do now, starting from a blank terminal: use Linux, write Python, run and inspect ROS 2 nodes, topics, services and parameters, build packages, describe a robot in URDF and xacro, view it in RViz, understand coordinate frames, simulate it in Gazebo, drive it and read its lidar from Python, and send it autonomous navigation goals from your own code."
          ],
          [
            "p",
            "Good next steps, when you want them: build <b>your own map</b> with SLAM (the robot drives around and the lidar draws the map as it goes), tune Nav2&apos;s costmaps and planner, add a camera and detect objects with a vision model such as YOLO, or run your code on a real robot."
          ]
        ]
      },
      {
        "id": "4.9",
        "title": "Mass, inertia and collision for a physics simulator",
        "minutes": 35,
        "blocks": [
          [
            "p",
            "Your <code>mybot</code> from lessons 4.1 to 4.3 looks right in RViz, but RViz only <i>draws</i> it. To <b>simulate</b> the robot in Gazebo you must also tell the physics engine what it is made of. Two things are missing from your file:"
          ],
          [
            "ul",
            [
              "<code>&lt;collision&gt;</code>: the shape used for <b>touching</b> things. It decides when the robot hits the floor or a wall. It is often a simpler shape than the <code>&lt;visual&gt;</code>, because collision maths is expensive. Here it is the same box, sphere and cylinders.",
              "<code>&lt;inertial&gt;</code>: the <b>mass</b> and the <b>inertia</b>, a measure of how hard the part is to push and to spin. Without it the physics engine has nothing to work with."
            ]
          ],
          [
            "warn",
            "Gazebo does <b>not</b> complain when these are missing. In a test, a copy of <code>mybot</code> without collision shapes and inertia was spawned with no error and no warning. It simply hung in mid-air exactly where it was placed, 0.1 m up, and never fell. If your robot floats in Gazebo, check for missing <code>&lt;inertial&gt;</code> blocks first."
          ],
          [
            "h",
            "Inertia without the maths"
          ],
          [
            "p",
            "Inertia is six numbers, but for simple shapes there are standard formulas. With mass <code>m</code>:"
          ],
          [
            "ul",
            [
              "<b>Box</b> of size x, y, z: <code>ixx = m(y² + z²)/12</code>, <code>iyy = m(x² + z²)/12</code>, <code>izz = m(x² + y²)/12</code>.",
              "<b>Cylinder</b> of radius r and length h (axis along z): <code>ixx = iyy = m(3r² + h²)/12</code>, <code>izz = m r²/2</code>.",
              "<b>Sphere</b> of radius r: all three are <code>2 m r² / 5</code>."
            ]
          ],
          [
            "p",
            "The other three numbers (<code>ixy</code>, <code>ixz</code>, <code>iyz</code>) are zero for these shapes. Rather than work the numbers by hand, you will write the formulas <b>once</b> as xacro macros (lesson 4.3) and let xacro compute them. The macros below are <code>box_inertia</code>, <code>cylinder_inertia</code> and <code>sphere_inertia</code>."
          ],
          [
            "h",
            "A simulation-ready robot file"
          ],
          [
            "p",
            "Make a new file instead of editing the old one, so your RViz version keeps working. It is long, but every piece is something you already know or is explained below."
          ],
          [
            "cmd",
            "cd ~/robot_practice && nano mybot_sim.xacro",
            "Terminal 1 (Ubuntu)"
          ],
          [
            "code",
            "<?xml version=\"1.0\"?>\n<robot name=\"mybot\" xmlns:xacro=\"http://www.ros.org/wiki/xacro\">\n  <xacro:property name=\"wheel_radius\" value=\"0.06\"/>\n  <xacro:property name=\"wheel_width\" value=\"0.04\"/>\n\n  <material name=\"blue\"><color rgba=\"0.2 0.4 0.9 1\"/></material>\n  <material name=\"white\"><color rgba=\"1 1 1 1\"/></material>\n  <material name=\"black\"><color rgba=\"0.1 0.1 0.1 1\"/></material>\n\n  <!-- Inertia formulas for simple shapes (m = mass in kg) -->\n  <xacro:macro name=\"box_inertia\" params=\"m x y z\">\n    <inertial>\n      <mass value=\"${m}\"/>\n      <inertia ixx=\"${m * (y * y + z * z) / 12}\" ixy=\"0\" ixz=\"0\"\n               iyy=\"${m * (x * x + z * z) / 12}\" iyz=\"0\"\n               izz=\"${m * (x * x + y * y) / 12}\"/>\n    </inertial>\n  </xacro:macro>\n\n  <xacro:macro name=\"cylinder_inertia\" params=\"m r h\">\n    <inertial>\n      <origin rpy=\"${pi / 2} 0 0\"/>\n      <mass value=\"${m}\"/>\n      <inertia ixx=\"${m * (3 * r * r + h * h) / 12}\" ixy=\"0\" ixz=\"0\"\n               iyy=\"${m * (3 * r * r + h * h) / 12}\" iyz=\"0\"\n               izz=\"${m * r * r / 2}\"/>\n    </inertial>\n  </xacro:macro>\n\n  <xacro:macro name=\"sphere_inertia\" params=\"m r\">\n    <inertial>\n      <mass value=\"${m}\"/>\n      <inertia ixx=\"${2 * m * r * r / 5}\" ixy=\"0\" ixz=\"0\"\n               iyy=\"${2 * m * r * r / 5}\" iyz=\"0\"\n               izz=\"${2 * m * r * r / 5}\"/>\n    </inertial>\n  </xacro:macro>\n\n  <!-- Body -->\n  <link name=\"base_link\">\n    <visual>\n      <geometry><box size=\"0.4 0.2 0.1\"/></geometry>\n      <material name=\"blue\"/>\n    </visual>\n    <collision>\n      <geometry><box size=\"0.4 0.2 0.1\"/></geometry>\n    </collision>\n    <xacro:box_inertia m=\"2.0\" x=\"0.4\" y=\"0.2\" z=\"0.1\"/>\n  </link>\n\n  <!-- Head -->\n  <link name=\"head\">\n    <visual>\n      <geometry><sphere radius=\"0.07\"/></geometry>\n      <material name=\"white\"/>\n    </visual>\n    <collision>\n      <geometry><sphere radius=\"0.07\"/></geometry>\n    </collision>\n    <xacro:sphere_inertia m=\"0.2\" r=\"0.07\"/>\n  </link>\n  <joint name=\"head_joint\" type=\"fixed\">\n    <parent link=\"base_link\"/>\n    <child link=\"head\"/>\n    <origin xyz=\"0.1 0 0.12\"/>\n  </joint>\n\n  <!-- Wheels -->\n  <xacro:macro name=\"wheel\" params=\"name y\">\n    <link name=\"${name}_wheel\">\n      <visual>\n        <origin rpy=\"${pi / 2} 0 0\"/>\n        <geometry><cylinder radius=\"${wheel_radius}\" length=\"${wheel_width}\"/></geometry>\n        <material name=\"black\"/>\n      </visual>\n      <collision>\n        <origin rpy=\"${pi / 2} 0 0\"/>\n        <geometry><cylinder radius=\"${wheel_radius}\" length=\"${wheel_width}\"/></geometry>\n      </collision>\n      <xacro:cylinder_inertia m=\"0.3\" r=\"${wheel_radius}\" h=\"${wheel_width}\"/>\n    </link>\n    <joint name=\"${name}_wheel_joint\" type=\"continuous\">\n      <parent link=\"base_link\"/>\n      <child link=\"${name}_wheel\"/>\n      <origin xyz=\"-0.1 ${y} -0.02\"/>\n      <axis xyz=\"0 1 0\"/>\n    </joint>\n  </xacro:macro>\n\n  <xacro:wheel name=\"left\" y=\"0.12\"/>\n  <xacro:wheel name=\"right\" y=\"-0.12\"/>\n\n  <!-- A small ball at the front so the robot does not tip over -->\n  <link name=\"caster\">\n    <visual>\n      <geometry><sphere radius=\"0.03\"/></geometry>\n      <material name=\"black\"/>\n    </visual>\n    <collision>\n      <geometry><sphere radius=\"0.03\"/></geometry>\n    </collision>\n    <xacro:sphere_inertia m=\"0.1\" r=\"0.03\"/>\n  </link>\n  <joint name=\"caster_joint\" type=\"fixed\">\n    <parent link=\"base_link\"/>\n    <child link=\"caster\"/>\n    <origin xyz=\"0.15 0 -0.05\"/>\n  </joint>\n\n  <!-- Gazebo-only settings (colours, friction and the drive plugin) -->\n  <gazebo reference=\"base_link\"><material>Gazebo/Blue</material></gazebo>\n  <gazebo reference=\"head\"><material>Gazebo/White</material></gazebo>\n  <gazebo reference=\"left_wheel\">\n    <material>Gazebo/Black</material>\n    <mu1>1.0</mu1>\n    <mu2>1.0</mu2>\n  </gazebo>\n  <gazebo reference=\"right_wheel\">\n    <material>Gazebo/Black</material>\n    <mu1>1.0</mu1>\n    <mu2>1.0</mu2>\n  </gazebo>\n  <gazebo reference=\"caster\">\n    <material>Gazebo/Black</material>\n    <mu1>0.0</mu1>\n    <mu2>0.0</mu2>\n  </gazebo>\n\n  <gazebo>\n    <plugin name=\"diff_drive\" filename=\"libgazebo_ros_diff_drive.so\">\n      <update_rate>30</update_rate>\n      <left_joint>left_wheel_joint</left_joint>\n      <right_joint>right_wheel_joint</right_joint>\n      <wheel_separation>0.24</wheel_separation>\n      <wheel_diameter>${2 * wheel_radius}</wheel_diameter>\n      <max_wheel_torque>20</max_wheel_torque>\n      <max_wheel_acceleration>1.0</max_wheel_acceleration>\n      <command_topic>cmd_vel</command_topic>\n      <odometry_topic>odom</odometry_topic>\n      <odometry_frame>odom</odometry_frame>\n      <robot_base_frame>base_link</robot_base_frame>\n      <publish_odom>true</publish_odom>\n      <publish_odom_tf>true</publish_odom_tf>\n      <publish_wheel_tf>true</publish_wheel_tf>\n    </plugin>\n  </gazebo>\n</robot>",
            "mybot_sim.xacro"
          ],
          [
            "h",
            "What changed"
          ],
          [
            "ul",
            [
              "<b>Inertia macros</b> at the top. Each one takes the mass and the size and writes a full <code>&lt;inertial&gt;</code> block. The wheel macro rotates its inertia the same way as the wheel (<code>rpy=&quot;${pi / 2} 0 0&quot;</code>), so the cylinder&apos;s spin axis lines up with the joint axis.",
              "Every link now has <b>collision</b> and <b>inertial</b> parts. Masses are guesses that are about right: 2 kg body, 0.2 kg head, 0.3 kg for each wheel and 0.1 kg for the ball.",
              "A new <b>caster</b> link: a small ball at the front. A robot standing on only two wheels would just tip forward or backward, so a third point of contact holds it up. It is a plain fixed joint, so the ball does not roll as a wheel would.",
              "<b>&lt;gazebo reference=&quot;...&quot;&gt;</b> blocks hold settings that only Gazebo reads. RViz and <code>check_urdf</code> ignore them. Here they set the <b>colours</b> (Gazebo has its own colour names), and the <b>friction</b> of the wheels and the caster. <code>mu1</code> and <code>mu2</code> are friction coefficients: the wheels grip (1.0) and the ball slides freely (0.0).",
              "A <b>plugin</b> at the bottom, the one part that makes the robot <i>move</i>. It is described next."
            ]
          ],
          [
            "h",
            "The drive plugin"
          ],
          [
            "p",
            "Gazebo does not know your robot has wheels that should respond to <code>/cmd_vel</code>. A <b>plugin</b>, a piece of code loaded into the simulator, does that job. <code>libgazebo_ros_diff_drive.so</code> implements a <b>differential drive</b> robot: two wheels that turn at different speeds to move and steer. Its settings:"
          ],
          [
            "ul",
            [
              "<code>left_joint</code> and <code>right_joint</code>: which of your joints are the drive wheels (the names from the file).",
              "<code>wheel_separation</code> (0.24) and <code>wheel_diameter</code> (0.12): the geometry, which must match the wheels you built. The distance between the two wheels is 0.12 + 0.12 = 0.24 m. The diameter uses <code>${2 * wheel_radius}</code>, an xacro calculation.",
              "<code>command_topic</code> (<code>cmd_vel</code>): the topic it <b>listens</b> to for <code>Twist</code> commands, the same one you used for the TurtleBot3.",
              "<code>odometry_topic</code>, <code>odometry_frame</code> and <code>robot_base_frame</code>: where it <b>publishes</b> the odometry (<code>/odom</code>), and between which two frames.",
              "<code>publish_odom_tf</code> and <code>publish_wheel_tf</code>: also publish the <code>odom</code> to <code>base_link</code> transform and the wheel frames, so TF2 (lesson 4.4) works."
            ]
          ],
          [
            "p",
            "Check that the file is still valid and has the tree you expect:"
          ],
          [
            "cmd",
            "xacro mybot_sim.xacro > mybot_sim.urdf",
            "Terminal 1 (Ubuntu)"
          ],
          [
            "cmd",
            "check_urdf mybot_sim.urdf",
            "Terminal 1 (Ubuntu)"
          ],
          [
            "out",
            "robot name is: mybot\n---------- Successfully Parsed XML ---------------\nroot Link: base_link has 4 child(ren)\n    child(1):  caster\n    child(2):  head\n    child(3):  left_wheel\n    child(4):  right_wheel"
          ],
          [
            "p",
            "There is one more child than before: the caster. The file also still opens in RViz with <code>ros2 launch urdf_tutorial display.launch.py model:=$HOME/robot_practice/mybot_sim.xacro</code>. You may see a warning from <code>robot_state_publisher</code> saying the root link has an inertia and that KDL does not support that. It is a known limitation of one ROS library, and the robot works anyway, so you can ignore it."
          ],
          [
            "try",
            "Work out the inertia of the body by hand with the box formulas: m = 2.0, x = 0.4, y = 0.2, z = 0.1. Then change the body mass in <code>mybot_sim.xacro</code> to 4.0, run <code>xacro mybot_sim.xacro</code> and find the new <code>ixx</code> in the output. Does it match your calculation?"
          ],
          [
            "quiz",
            {
              "q": "Which element gives a link its <b>mass</b>, and which gives the <b>shape used for touching</b>?",
              "options": [
                "&lt;visual&gt; for both",
                "&lt;inertial&gt; for mass, &lt;collision&gt; for the touching shape",
                "&lt;collision&gt; for mass, &lt;inertial&gt; for the touching shape",
                "&lt;gazebo&gt; for both"
              ],
              "answer": 1,
              "why": "<code>&lt;inertial&gt;</code> holds the mass and inertia. <code>&lt;collision&gt;</code> holds the geometry the physics engine uses for contact. <code>&lt;visual&gt;</code> is only for drawing."
            }
          ],
          [
            "quiz",
            {
              "q": "A robot&apos;s URDF has no <code>&lt;inertial&gt;</code> or <code>&lt;collision&gt;</code> elements. What happens when you spawn it in Gazebo?",
              "options": [
                "Gazebo refuses to spawn it and prints an error",
                "It spawns without any error, but hangs in mid-air and never falls",
                "It falls through the floor and disappears",
                "It drives by itself"
              ],
              "answer": 1,
              "why": "Gazebo gives no warning. With no mass and no collision shape the robot is not part of the physics, so it stays where it was spawned."
            }
          ]
        ]
      },
      {
        "id": "4.10",
        "title": "Your own robot in Gazebo",
        "minutes": 40,
        "blocks": [
          [
            "p",
            "Time to bring <code>mybot</code> to life. In lesson 4.5 you launched a ready-made TurtleBot3. Now you will launch <b>your own robot</b> and drive it with the same commands. You will need three things: Gazebo itself, a node that publishes the robot&apos;s description, and a node that <b>spawns</b> the robot into the world."
          ],
          [
            "h",
            "Why a launch file?"
          ],
          [
            "p",
            "You could start all three by hand, but there is a trap. The robot description is an XML text of several hundred lines, and the quick way of passing it to a node on the command line (<code>-p robot_description:=&quot;$(xacro ...)&quot;</code>) hands it to a parser that reads the text as <b>YAML</b>. A single <i>colon followed by a space</i> in an XML comment (for example <code>&lt;!-- Settings: colours --&gt;</code>) is enough to break it, and <code>robot_state_publisher</code> crashes with <code>Couldn&apos;t parse parameter override rule</code>. A launch file avoids the problem, because it passes the value as plain <b>text</b>. It also starts everything with one command."
          ],
          [
            "cmd",
            "cd ~/robot_practice && nano mybot_gazebo.launch.py",
            "Terminal 1 (Ubuntu)"
          ],
          [
            "code",
            "import os\n\nfrom ament_index_python.packages import get_package_share_directory\nfrom launch import LaunchDescription\nfrom launch.actions import IncludeLaunchDescription\nfrom launch.launch_description_sources import PythonLaunchDescriptionSource\nfrom launch.substitutions import Command\nfrom launch_ros.actions import Node\nfrom launch_ros.parameter_descriptions import ParameterValue\n\nHERE = os.path.dirname(os.path.abspath(__file__))\n\n\ndef generate_launch_description():\n    gazebo = IncludeLaunchDescription(\n        PythonLaunchDescriptionSource(\n            os.path.join(get_package_share_directory(\"gazebo_ros\"), \"launch\", \"gazebo.launch.py\")\n        )\n    )\n\n    robot_description = ParameterValue(\n        Command([\"xacro \", os.path.join(HERE, \"mybot_sim.xacro\")]), value_type=str\n    )\n    state_publisher = Node(\n        package=\"robot_state_publisher\",\n        executable=\"robot_state_publisher\",\n        parameters=[{\"robot_description\": robot_description, \"use_sim_time\": True}],\n    )\n\n    spawn = Node(\n        package=\"gazebo_ros\",\n        executable=\"spawn_entity.py\",\n        arguments=[\"-topic\", \"robot_description\", \"-entity\", \"mybot\", \"-z\", \"0.1\"],\n        output=\"screen\",\n    )\n\n    return LaunchDescription([gazebo, state_publisher, spawn])",
            "mybot_gazebo.launch.py"
          ],
          [
            "p",
            "This is the launch-file pattern from lesson 3.4, with some new pieces:"
          ],
          [
            "ul",
            [
              "<code>HERE = os.path.dirname(os.path.abspath(__file__))</code> is the folder this file lives in, so the launch file finds <code>mybot_sim.xacro</code> next to it wherever you run it from.",
              "<code>IncludeLaunchDescription(...)</code> <b>runs another launch file</b>, here the one in the <code>gazebo_ros</code> package that starts the simulator. <code>get_package_share_directory</code> finds where that package is installed.",
              "<code>Command([&quot;xacro &quot;, path])</code> is a <b>substitution</b>: a value that is worked out <i>when the launch starts</i>, here by running the <code>xacro</code> command and taking its output. Note the space after <code>xacro</code> inside the quotes.",
              "<code>ParameterValue(..., value_type=str)</code> says &quot;this is a plain string, do not try to read it as anything else&quot;. This is what dodges the YAML trap above.",
              "<code>robot_state_publisher</code> gets the description and <code>use_sim_time: True</code> (it must use Gazebo&apos;s clock, as in lesson 5.1). It publishes the description on the <code>/robot_description</code> topic.",
              "<code>spawn_entity.py</code> reads that topic (<code>-topic robot_description</code>), and creates a model called <code>mybot</code> (<code>-entity mybot</code>) <b>0.1 m above the floor</b> (<code>-z 0.1</code>), so it settles gently onto its wheels."
            ]
          ],
          [
            "h",
            "Launch it"
          ],
          [
            "p",
            "Gazebo needs the same one-time setup as in lesson 4.5 (software rendering, and the <code>ground_plane</code> and <code>sun</code> models in <code>~/.gazebo/models</code>). Then:"
          ],
          [
            "cmd",
            "ros2 launch mybot_gazebo.launch.py",
            "Terminal 1 (Ubuntu)"
          ],
          [
            "out",
            "[spawn_entity.py-4] [INFO] [...] [spawn_entity]: Spawn status: SpawnEntity: Successfully spawned entity [mybot]"
          ],
          [
            "p",
            "A Gazebo window opens with an empty grey floor and your <b>blue body with a white head and black wheels</b> standing on it. The terminal also shows the drive plugin starting up and reading your settings:"
          ],
          [
            "out",
            "[gzserver-1] [INFO] [...] [diff_drive]: Wheel pair 1 separation set to [0.240000m]\n[gzserver-1] [INFO] [...] [diff_drive]: Wheel pair 1 diameter set to [0.120000m]\n[gzserver-1] [INFO] [...] [diff_drive]: Subscribed to [/cmd_vel]\n[gzserver-1] [INFO] [...] [diff_drive]: Advertise odometry on [/odom]\n[gzserver-1] [INFO] [...] [diff_drive]: Publishing odom transforms between [odom] and [base_link]\n[gzserver-1] [INFO] [...] [diff_drive]: Publishing wheel transforms between [base_link], [left_wheel_joint] and [right_wheel_joint]"
          ],
          [
            "p",
            "Those are exactly the numbers you wrote in the file. Now look at what your robot offers to ROS, from <b>terminal 2</b>:"
          ],
          [
            "cmd",
            "ros2 topic list",
            "Terminal 2 (Ubuntu)"
          ],
          [
            "out",
            "/cmd_vel\n/joint_states\n/odom\n/robot_description\n/tf\n/tf_static"
          ],
          [
            "ul",
            [
              "<code>/cmd_vel</code>: send velocity commands here.",
              "<code>/odom</code>: where the robot thinks it is.",
              "<code>/joint_states</code> and <code>/tf</code>: the wheel angles and the frames.",
              "<code>/robot_description</code>: the XML, so any node (RViz, for instance) can read it."
            ]
          ],
          [
            "note",
            "There is no <code>/scan</code>, because <code>mybot</code> has no lidar. The robot has only what you put in its file."
          ],
          [
            "warn",
            "The first launch can take a minute or more. If the log shows <code>Service /spawn_entity unavailable</code> or the Gazebo window stays black, a leftover <code>gzserver</code> from an earlier run is usually the cause (lesson 4.5). Close everything, check that <code>pgrep gzserver</code> prints nothing, and launch again."
          ],
          [
            "h",
            "Drive it"
          ],
          [
            "cmd",
            "ros2 topic echo --once --field pose.pose.position /odom",
            "Terminal 2 (Ubuntu)"
          ],
          [
            "out",
            "x: 0.0011892337373105022\ny: 8.674532217482978e-05\nz: 0.08000003263020337\n---"
          ],
          [
            "p",
            "The robot is at the origin. Note <code>z: 0.08</code>: the centre of the body is 8 cm above the floor, which is exactly what you designed (wheel radius 0.06 plus 0.02 below the body centre), so your wheels really are carrying the robot. Now drive forward:"
          ],
          [
            "cmd",
            "ros2 topic pub --times 15 -r 5 /cmd_vel geometry_msgs/msg/Twist \"{linear: {x: 0.2}}\"",
            "Terminal 2 (Ubuntu)"
          ],
          [
            "cmd",
            "ros2 topic pub --once /cmd_vel geometry_msgs/msg/Twist \"{}\"",
            "Terminal 2 (Ubuntu)"
          ],
          [
            "cmd",
            "ros2 topic echo --once --field pose.pose.position /odom",
            "Terminal 2 (Ubuntu)"
          ],
          [
            "out",
            "x: 0.8924364334996211\ny: -0.0003467613860239741\nz: 0.08000002415991204\n---"
          ],
          [
            "p",
            "It rolled forward in a straight line (<code>y</code> hardly changed), and it stayed level (<code>z</code> is still 0.08). Your exact <code>x</code> will differ, because the simulation does not run in perfect real time. Now turn on the spot:"
          ],
          [
            "cmd",
            "ros2 topic pub --times 15 -r 5 /cmd_vel geometry_msgs/msg/Twist \"{angular: {z: 0.5}}\"",
            "Terminal 2 (Ubuntu)"
          ],
          [
            "cmd",
            "ros2 topic pub --once /cmd_vel geometry_msgs/msg/Twist \"{}\"",
            "Terminal 2 (Ubuntu)"
          ],
          [
            "cmd",
            "ros2 topic echo --once --field pose.pose.orientation /odom",
            "Terminal 2 (Ubuntu)"
          ],
          [
            "out",
            "x: -2.0648153447698785e-07\ny: 2.9853589151005396e-08\nz: 0.7898948293674187\nw: 0.6132423326374108\n---"
          ],
          [
            "p",
            "The orientation is a <b>quaternion</b>, four numbers. Only <code>z</code> and <code>w</code> are significant because the robot turned only around the vertical axis. Quaternions get their own lesson (7.5), but you can already see that <code>z</code> grew from 0 to 0.79 as the robot turned, about 100 degrees in this run."
          ],
          [
            "h",
            "Your own Python works on it"
          ],
          [
            "p",
            "The script you wrote in lesson 4.6 needs no change, because <code>mybot</code> listens to the same topic:"
          ],
          [
            "cmd",
            "python3 drive_forward.py",
            "Terminal 2 (Ubuntu)"
          ],
          [
            "out",
            "[INFO] [...] [drive_forward]: Finished: the robot has been told to stop"
          ],
          [
            "p",
            "On <code>mybot</code> it moved about 0.57 m (the script commands 0.2 m/s for 3 seconds). This is the point of ROS: the software above the robot does not care what is underneath."
          ],
          [
            "warn",
            "Close Gazebo with <code>Ctrl+C</code> and check that <code>pgrep gzserver</code> prints nothing, as in lessons 4.5 and 4.7."
          ],
          [
            "try",
            "Make <code>mybot</code> drive a rough square with your own Python: forward for 3 seconds, turn left for about 3 seconds at 0.5 rad/s, repeat four times. Reuse the timer pattern from <code>drive_forward.py</code>. Then change a number in <code>mybot_sim.xacro</code> (the wheel radius, for instance), relaunch, and see how the robot&apos;s behaviour changes."
          ],
          [
            "quiz",
            {
              "q": "Why does the launch file use <code>ParameterValue(..., value_type=str)</code> for the robot description?",
              "options": [
                "To make Gazebo run faster",
                "To pass the long XML text as a plain string, so it is not misread as YAML",
                "To rename the robot",
                "To change the colours"
              ],
              "answer": 1,
              "why": "Passing the XML on the command line makes it get parsed as YAML, which breaks on things like a colon followed by a space in a comment. A launch file with a string parameter value avoids that."
            }
          ],
          [
            "quiz",
            {
              "q": "Which part of <code>mybot_sim.xacro</code> makes the robot respond to <code>/cmd_vel</code> in Gazebo?",
              "options": [
                "The head link",
                "The <code>&lt;visual&gt;</code> elements",
                "The diff_drive plugin inside a <code>&lt;gazebo&gt;</code> block",
                "The caster"
              ],
              "answer": 2,
              "why": "The plugin <code>libgazebo_ros_diff_drive.so</code> subscribes to <code>cmd_vel</code>, turns the two wheel joints, and publishes <code>/odom</code>."
            }
          ]
        ]
      }
    ]
  });
})();
