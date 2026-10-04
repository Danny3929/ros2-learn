window.MODULES = window.MODULES || [];
window.MODULES.push({
  order: 1,
  title: "1 · Python basics",
  lessons: [
    {
      id: "1.1", title: "Running your first Python", minutes: 20,
      blocks: [
        ["p", "ROS 2 nodes in this course are written in <b>Python</b>. You do not need to become a programmer first: this module teaches exactly the parts ROS 2 uses. Everything runs in your Ubuntu terminal."],
        ["h", "Two ways to run Python"],
        ["p", "First, the <b>interactive prompt</b>, good for trying one line at a time. Start it:"],
        ["cmd", "python3"],
        ["p", "The prompt changes to <code>&gt;&gt;&gt;</code>. Type these, pressing Enter after each:"],
        ["repl", ">>> 2 + 3\n5\n>>> \"robot\" * 3\n'robotrobotrobot'"],
        ["p", "Leave with <code>exit()</code> or <b>Ctrl+D</b>."],
        ["h", "Second: save code in a file and run it"],
        ["p", "Real programs live in files ending in <code>.py</code>. Make a practice folder, then create a file with <code>nano</code> (you met it in lesson 0.3):"],
        ["cmd", "mkdir -p ~/python_practice && cd ~/python_practice"],
        ["cmd", "nano hello.py"],
        ["p", "Copy the code below, paste it into nano (<b>right-click</b>), save with <b>Ctrl+O</b> then Enter, and exit with <b>Ctrl+X</b>."],
        ["code", "print(\"Hello, ROS 2!\")\nprint(\"2 + 3 =\", 2 + 3)", "hello.py"],
        ["cmd", "python3 hello.py"],
        ["out", "Hello, ROS 2!\n2 + 3 = 5"],
        ["p", "<code>print(...)</code> shows something on the screen. Text goes inside quotes. Several things separated by commas are printed with a space between them."],
        ["warn", "<b>Never name your file after a Python built-in</b> such as <code>types.py</code>, <code>math.py</code>, <code>random.py</code> or <code>test.py</code>. Python finds your file first and breaks with strange errors, even on unrelated programs. If that ever happens, rename the file and delete the <code>__pycache__</code> folder next to it."],
        ["try", "Change the text in <code>hello.py</code> to print your own name, and run it again. (Open it with <code>nano hello.py</code>.)"],
        ["quiz", {
          q: "What does <code>python3 hello.py</code> do?",
          options: ["Opens the interactive <code>&gt;&gt;&gt;</code> prompt", "Runs the code saved in hello.py", "Installs hello.py", "Edits hello.py"],
          answer: 1,
          why: "Giving python3 a filename runs that file. With no filename it opens the interactive prompt."
        }]
      ]
    },
    {
      id: "1.2", title: "Variables and types", minutes: 20,
      blocks: [
        ["p", "A <b>variable</b> is a name that holds a value. You create it with <code>=</code>. Each value has a <b>type</b>. The four you will use most:"],
        ["ul", [
          "<code>str</code>: text, in quotes, like <code>\"turtle1\"</code>.",
          "<code>int</code>: whole numbers, like <code>4</code>.",
          "<code>float</code>: decimal numbers, like <code>1.5</code>.",
          "<code>bool</code>: <code>True</code> or <code>False</code> (capital first letter)."
        ]],
        ["cmd", "cd ~/python_practice && nano variables.py"],
        ["code", "name = \"turtle1\"\nspeed = 1.5\nsteps = 4\nmoving = True\nprint(name, type(name))\nprint(speed, type(speed))\nprint(steps, type(steps))\nprint(moving, type(moving))\ndistance = speed * steps\nprint(f\"{name} travels {distance} metres\")", "variables.py"],
        ["cmd", "python3 variables.py"],
        ["out", "turtle1 <class 'str'>\n1.5 <class 'float'>\n4 <class 'int'>\nTrue <class 'bool'>\nturtle1 travels 6.0 metres"],
        ["p", "The last line uses an <b>f-string</b>: put <code>f</code> before the quotes and write variable names inside <code>{ }</code> to drop their values into the text. You will use this for ROS 2 log messages."],
        ["note", "Maths works as you expect: <code>+ - * /</code>. Note that <code>speed * steps</code> gave <code>6.0</code>, not <code>6</code>, because one side was a float."],
        ["warn", "<code>=</code> means <i>store this value</i>, not &quot;equals&quot;. To <i>compare</i> you will use <code>==</code> in the next lesson."],
        ["try", "Add a variable <code>battery = 90</code> and print an f-string like <code>Battery at {battery} percent</code>."],
        ["quiz", {
          q: "What type is the value <code>3.0</code>?",
          options: ["int", "str", "float", "bool"],
          answer: 2,
          why: "A number with a decimal point is a float, even if the decimal part is zero."
        }]
      ]
    },
    {
      id: "1.3", title: "Making decisions", minutes: 20,
      blocks: [
        ["p", "Robots constantly decide: obstacle ahead? battery low? In Python you decide with <code>if</code>, <code>elif</code> (else if) and <code>else</code>."],
        ["cmd", "cd ~/python_practice && nano decide.py"],
        ["code", "battery = 35\nif battery > 80:\n    print(\"Plenty of charge\")\nelif battery > 20:\n    print(\"Okay, keep an eye on it\")\nelse:\n    print(\"Return to charger\")\n\nspeed = 0.5\nobstacle = False\nif speed > 0 and not obstacle:\n    print(\"Driving\")", "decide.py"],
        ["cmd", "python3 decide.py"],
        ["out", "Okay, keep an eye on it\nDriving"],
        ["h", "The rules"],
        ["ul", [
          "End each condition line with a colon <code>:</code>.",
          "The lines <b>indented</b> underneath belong to that condition. Use <b>4 spaces</b>. Indentation is how Python knows what is inside what, so it must be consistent.",
          "Comparisons: <code>==</code> equal, <code>!=</code> not equal, <code>&gt;</code> <code>&lt;</code> <code>&gt;=</code> <code>&lt;=</code>.",
          "Combine with <code>and</code>, <code>or</code>, <code>not</code>."
        ]],
        ["warn", "The most common beginner error is <code>IndentationError</code>. If you see it, check that lines under an <code>if</code> are indented by the same amount, and that you did not mix tabs and spaces."],
        ["try", "Change <code>battery</code> to 90, then to 10, and run the file each time. Which message appears?"],
        ["quiz", {
          q: "<code>battery = 20</code>. Using the code above, what prints?",
          options: ["Plenty of charge", "Okay, keep an eye on it", "Return to charger", "Nothing"],
          answer: 2,
          why: "<code>20 &gt; 80</code> is false, and <code>20 &gt; 20</code> is also false (it is not strictly greater), so Python reaches <code>else</code>."
        }]
      ]
    },
    {
      id: "1.4", title: "Loops", minutes: 15,
      blocks: [
        ["p", "A <b>loop</b> repeats code. This is central to ROS 2: a node is essentially a program that loops, waiting for and reacting to messages."],
        ["cmd", "cd ~/python_practice && nano loops.py"],
        ["code", "for i in range(3):\n    print(\"step\", i)\n\ncount = 0\nwhile count < 3:\n    print(\"count is\", count)\n    count += 1", "loops.py"],
        ["cmd", "python3 loops.py"],
        ["out", "step 0\nstep 1\nstep 2\ncount is 0\ncount is 1\ncount is 2"],
        ["ul", [
          "<code>for i in range(3)</code> runs the indented block 3 times, with <code>i</code> being 0, 1, 2. Computers usually count from <b>0</b>.",
          "<code>while condition:</code> repeats for as long as the condition stays true.",
          "<code>count += 1</code> is shorthand for <code>count = count + 1</code>."
        ]],
        ["warn", "A <code>while</code> loop whose condition never becomes false runs forever. Stop it with <b>Ctrl+C</b> (lesson 0.5). ROS 2 nodes deliberately run until you press Ctrl+C."],
        ["try", "Change the <code>for</code> loop to <code>range(5)</code>, and make the <code>while</code> loop count to 10."],
        ["quiz", {
          q: "How many times does <code>for i in range(4):</code> run its block?",
          options: ["3", "4", "5", "Forever"],
          answer: 1,
          why: "<code>range(4)</code> gives 0, 1, 2, 3: four values."
        }]
      ]
    },
    {
      id: "1.5", title: "Functions", minutes: 20,
      blocks: [
        ["p", "A <b>function</b> is a named, reusable block of code. You define it with <code>def</code> and call it by name. ROS 2 uses functions called <b>callbacks</b>: you write a function, and ROS 2 calls it when a message arrives."],
        ["cmd", "cd ~/python_practice && nano funcs.py"],
        ["code", "def drive(distance, speed=1.0):\n    time_needed = distance / speed\n    return time_needed\n\nprint(drive(10))\nprint(drive(10, speed=2.5))", "funcs.py"],
        ["cmd", "python3 funcs.py"],
        ["out", "10.0\n4.0"],
        ["ul", [
          "<code>def drive(distance, speed=1.0):</code> defines a function with two <b>parameters</b>. <code>speed</code> has a <b>default</b> of 1.0, so you may leave it out.",
          "<code>return</code> sends a result back to whoever called the function.",
          "The body is indented, just like <code>if</code> and loops."
        ]],
        ["note", "Defining a function does not run it. Nothing happens until you <b>call</b> it, like <code>drive(10)</code>."],
        ["try", "Write a function <code>double(x)</code> that returns <code>x * 2</code>, and print <code>double(21)</code>."],
        ["quiz", {
          q: "In <code>drive(10, speed=2.5)</code>, what is <code>speed</code> inside the function?",
          options: ["1.0", "10", "2.5", "It is an error"],
          answer: 2,
          why: "A value you pass in replaces the default. The default 1.0 only applies when you leave it out."
        }]
      ]
    },
    {
      id: "1.6", title: "Lists and dictionaries", minutes: 20,
      blocks: [
        ["p", "Two ways to hold several values together. A <b>list</b> is an ordered sequence. A <b>dictionary</b> pairs names (keys) with values. ROS 2 messages are built from both ideas."],
        ["cmd", "cd ~/python_practice && nano collections_demo.py"],
        ["code", "waypoints = [\"door\", \"desk\", \"window\"]\nwaypoints.append(\"charger\")\nprint(waypoints[0], len(waypoints))\nfor w in waypoints:\n    print(\"go to\", w)\n\nrobot = {\"name\": \"turtle1\", \"speed\": 1.5}\nrobot[\"speed\"] = 2.0\nrobot[\"battery\"] = 90\nprint(robot[\"name\"], robot)", "collections_demo.py"],
        ["cmd", "python3 collections_demo.py"],
        ["out", "door 4\ngo to door\ngo to desk\ngo to window\ngo to charger\nturtle1 {'name': 'turtle1', 'speed': 2.0, 'battery': 90}"],
        ["ul", [
          "<b>Lists</b> use <code>[ ]</code>. <code>waypoints[0]</code> is the <i>first</i> item (counting starts at 0). <code>.append(x)</code> adds to the end, and <code>len(x)</code> gives the length.",
          "<code>for w in waypoints:</code> visits each item in turn.",
          "<b>Dictionaries</b> use <code>{ }</code> with <code>key: value</code> pairs. Look a value up with <code>robot[\"name\"]</code>, and set or add one with <code>robot[\"battery\"] = 90</code>."
        ]],
        ["try", "Add a fifth waypoint, and add a <code>\"color\"</code> key to the dictionary. Print both."],
        ["quiz", {
          q: "<code>colors = [\"red\", \"green\", \"blue\"]</code>. What is <code>colors[1]</code>?",
          options: ["\"red\"", "\"green\"", "\"blue\"", "An error"],
          answer: 1,
          why: "Counting starts at 0, so index 0 is red, index 1 is green."
        }]
      ]
    },
    {
      id: "1.7", title: "Classes and objects", minutes: 25,
      blocks: [
        ["p", "<b>This is the most important lesson in the module.</b> Every ROS 2 node you write will be a <b>class</b>. A class is a blueprint, and an <b>object</b> is one thing built from it. A <code>Robot</code> class could produce many individual robots, each with its own name and position."],
        ["cmd", "cd ~/python_practice && nano robot.py"],
        ["code", "class Robot:\n    def __init__(self, name):\n        self.name = name\n        self.position = 0\n\n    def move(self, distance):\n        self.position += distance\n        print(f\"{self.name} is now at {self.position}\")\n\n\nclass FastRobot(Robot):\n    def __init__(self, name):\n        super().__init__(name)\n        self.boost = 2\n\n    def move(self, distance):\n        super().move(distance * self.boost)\n\n\nr = Robot(\"turtle1\")\nr.move(2)\nr.move(3)\nf = FastRobot(\"zoom\")\nf.move(3)", "robot.py"],
        ["cmd", "python3 robot.py"],
        ["out", "turtle1 is now at 2\nturtle1 is now at 5\nzoom is now at 6"],
        ["h", "Reading the code"],
        ["ul", [
          "<code>class Robot:</code> defines the blueprint.",
          "<code>__init__</code> runs automatically when you create an object (<code>Robot(\"turtle1\")</code>). It sets up the object's starting data.",
          "<code>self</code> means &quot;this particular object&quot;. <code>self.name</code> is data stored on it. Every method must list <code>self</code> first.",
          "A function inside a class is called a <b>method</b>, such as <code>move</code>. You call it with a dot: <code>r.move(2)</code>.",
          "<code>class FastRobot(Robot):</code> is <b>inheritance</b>: FastRobot gets everything Robot has and can change parts. <code>super()</code> reaches back to the parent class's version."
        ]],
        ["note", "Soon you will write <code>class MyNode(Node):</code>, inheriting from ROS 2's <code>Node</code> class, and call <code>super().__init__(\"my_node\")</code> in its <code>__init__</code>. It is exactly this pattern. If you understand this file, you are ready."],
        ["try", "Add a <code>say_hello</code> method to <code>Robot</code> that prints <code>Hi, I am </code> followed by the name, and call it on <code>r</code>."],
        ["quiz", {
          q: "In <code>class FastRobot(Robot):</code>, what does the <code>(Robot)</code> mean?",
          options: [
            "FastRobot must be given a Robot as an argument",
            "FastRobot inherits everything from Robot",
            "FastRobot deletes Robot",
            "Nothing, it is a comment"
          ],
          answer: 1,
          why: "The parent class in brackets means FastRobot inherits Robot's data and methods, and can override them."
        }]
      ]
    },
    {
      id: "1.8", title: "Imports, errors and main", minutes: 20,
      blocks: [
        ["p", "Last lesson of the module: the three remaining patterns you will see in every ROS 2 Python file."],
        ["cmd", "cd ~/python_practice && nano errors.py"],
        ["code", "import math\n\nprint(math.sqrt(16))\n\ntry:\n    number = int(\"abc\")\nexcept ValueError:\n    print(\"That is not a number\")\n\n\ndef main():\n    print(\"running main\")\n\n\nif __name__ == \"__main__\":\n    main()", "errors.py"],
        ["cmd", "python3 errors.py"],
        ["out", "4.0\nThat is not a number\nrunning main"],
        ["h", "1. import"],
        ["p", "<code>import math</code> loads a library of ready-made code, and you use it as <code>math.sqrt(...)</code>. Every ROS 2 program starts with imports like <code>import rclpy</code>. Check that ROS 2's Python library is available:"],
        ["cmd", "python3 -c \"import rclpy; print('rclpy OK')\""],
        ["out", "rclpy OK"],
        ["h", "2. try / except"],
        ["p", "<code>try:</code> runs code that might fail. If it raises the named error, <code>except</code> handles it instead of crashing. Here, converting <code>\"abc\"</code> to a number fails, so the message prints."],
        ["h", "3. main and __name__"],
        ["p", "<code>if __name__ == \"__main__\":</code> means &quot;run this only when the file is executed directly&quot;. ROS 2 Python packages use a <code>main()</code> function like this as their entry point."],
        ["h", "Reading an error message"],
        ["p", "When Python crashes it prints a <b>traceback</b>. Read it <b>from the bottom</b>: the last line says what went wrong, and the lines above show where."],
        ["cmd", "python3 -c \"print(1/0)\""],
        ["out", "Traceback (most recent call last):\n  File \"<string>\", line 1, in <module>\nZeroDivisionError: division by zero"],
        ["note", "When you get stuck, copy the whole traceback and paste it to Claude. The bottom line and the file and line number are the most important parts."],
        ["try", "Add a <code>try</code>/<code>except ZeroDivisionError</code> around <code>10 / 0</code> that prints <code>Cannot divide by zero</code>."],
        ["quiz", {
          q: "Where in a traceback is the actual error type and message?",
          options: ["The first line", "The last line", "The middle", "It is never shown"],
          answer: 1,
          why: "Python prints the call path first and ends with the error, such as <code>ZeroDivisionError: division by zero</code>."
        }]
      ]
    }
  ]
});
