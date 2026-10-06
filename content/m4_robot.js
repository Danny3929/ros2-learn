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
    planned: ["Coordinate frames (TF2)", "Gazebo and TurtleBot3", "Drive a simulated robot", "Nav2 autonomous navigation", "Capstone: your own goal sender"],
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
      }
    ]
  });
})();
