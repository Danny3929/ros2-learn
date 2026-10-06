// The story that runs through the course. Each module is a chapter in the life of Pip, your robot.
// "text" appears as a mission briefing at the start of the module; "done" is shown when you finish it.
window.STORY = {
  0: {
    icon: "🐧", title: "Chapter 1: Wake up Pip",
    text: "Meet Pip, your robot. Before it can do anything, you need to know its home: a Linux computer. Learn to move around the terminal, make files and run programs, and Pip will finally understand what you say.",
    done: "Pip's brain has booted, and you can talk to it."
  },
  1: {
    icon: "🐍", title: "Chapter 2: Teach Pip to think",
    text: "Pip's brain speaks Python. Learn its words (variables, loops, functions, classes) and Pip can follow real instructions instead of just blinking its lights.",
    done: "Pip can follow a program. It even said thanks, in Python."
  },
  2: {
    icon: "🐢", title: "Chapter 3: Practice runs with Turtle",
    text: "Nobody hands a new pilot a real robot on day one. Practise on a cartoon one first: drive the turtle, listen to its topics, call its services and write your first nodes. These are the very same ideas Pip will use.",
    done: "You have flown the turtle. Pip's controls will feel familiar."
  },
  3: {
    icon: "📦", title: "Chapter 4: Pack Pip's skills",
    text: "A real robot has dozens of skills. Pack them neatly into packages with colcon, start them together with launch files, and teach them to talk with your own messages.",
    done: "Pip's skills are packed, labelled and ready to launch."
  },
  4: {
    icon: "🤖", title: "Chapter 5: Give Pip a body",
    text: "Time to build Pip. Describe it in URDF, look at it in RViz, give it mass and wheels, drop it into Gazebo, then send it across a map with Nav2.",
    done: "Pip has a body, it moves, and it can find its own way to a goal."
  },
  5: {
    icon: "🗺️", title: "Chapter 6: Pip explores",
    text: "Pip wakes up in a room it has never seen. Use SLAM to draw its map as it explores, save that map, and then send Pip to goals on the map it made itself.",
    done: "Pip drew its own map and drove across it."
  },
  6: {
    icon: "💬", title: "Chapter 7: Wire up Pip's nerves",
    text: "Topics are Pip's reflexes. Now add services for quick questions and actions for long jobs, and learn the quality-of-service rules that decide whether a message gets through.",
    done: "Pip's nervous system is wired: topics, services and actions."
  },
  7: {
    icon: "🔧", title: "Chapter 8: Pip's black box",
    text: "Robots break in the field. Record data with bags, read the logs, check the system's health and trace the frames. These are the tools you use to find out what went wrong, and to fix it.",
    done: "You can now record, inspect and debug Pip. Well done, Roboticist."
  }
};
