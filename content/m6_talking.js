window.MODULES = window.MODULES || [];
window.MODULES.push({
  "order": 6,
  "title": "6 · Talking in code",
  "lessons": [
    {
      "id": "6.1",
      "title": "Services in Python: a server and a client",
      "minutes": 35,
      "blocks": [
        [
          "p",
          "In lesson 2.4 you <i>called</i> services from the terminal. Now you will <b>write</b> both sides yourself: a <b>server</b> that answers requests, and a <b>client</b> that asks. A service is a question with one quick answer: &quot;what is 2 + 3?&quot; &quot;5&quot;. The caller waits for the reply."
        ],
        [
          "h",
          "The interface"
        ],
        [
          "p",
          "Every service has a type that defines the <b>request</b> (above the <code>---</code> line) and the <b>response</b> (below it). ROS 2 ships a ready-made one for adding two numbers:"
        ],
        [
          "cmd",
          "ros2 interface show example_interfaces/srv/AddTwoInts",
          "Terminal 1 (Ubuntu)"
        ],
        [
          "out",
          "int64 a\nint64 b\n---\nint64 sum"
        ],
        [
          "p",
          "So the request carries two integers, <code>a</code> and <code>b</code>, and the response carries one, <code>sum</code>."
        ],
        [
          "h",
          "The server"
        ],
        [
          "cmd",
          "cd ~/ros2_practice && nano add_server.py",
          "Terminal 1 (Ubuntu)"
        ],
        [
          "code",
          "import rclpy\nfrom rclpy.node import Node\nfrom example_interfaces.srv import AddTwoInts\n\n\nclass AddServer(Node):\n    def __init__(self):\n        super().__init__(\"add_server\")\n        self.create_service(AddTwoInts, \"add_two_ints\", self.handle_add)\n        self.get_logger().info(\"Ready: call /add_two_ints\")\n\n    def handle_add(self, request, response):\n        response.sum = request.a + request.b\n        self.get_logger().info(f\"Request: {request.a} + {request.b} = {response.sum}\")\n        return response\n\n\ndef main():\n    rclpy.init()\n    node = AddServer()\n    try:\n        rclpy.spin(node)\n    except KeyboardInterrupt:\n        pass\n    finally:\n        node.destroy_node()\n        if rclpy.ok():\n            rclpy.shutdown()\n\n\nif __name__ == \"__main__\":\n    main()",
          "add_server.py"
        ],
        [
          "ul",
          [
            "<code>from example_interfaces.srv import AddTwoInts</code> imports the service type, just as you imported <code>Twist</code> for topics.",
            "<code>create_service(AddTwoInts, &quot;add_two_ints&quot;, self.handle_add)</code> says: &quot;I answer requests of this type on the service called <code>add_two_ints</code>, and <code>handle_add</code> does the work.&quot; It is the service twin of <code>create_subscription</code>.",
            "<code>handle_add(self, request, response)</code> is a <b>callback</b>. ROS gives it the incoming <code>request</code> and an empty <code>response</code>. You fill in the response and <b>return</b> it. Forgetting to return it is a classic mistake.",
            "The rest is the familiar <code>main</code> pattern: <code>rclpy.spin(node)</code> keeps the server alive, waiting for requests."
          ]
        ],
        [
          "cmd",
          "python3 add_server.py",
          "Terminal 1 (Ubuntu)"
        ],
        [
          "out",
          "[INFO] [...] [add_server]: Ready: call /add_two_ints"
        ],
        [
          "p",
          "Leave it running. In <b>terminal 2</b>, check that ROS can see the new service, then call it from the command line the way you did in lesson 2.4:"
        ],
        [
          "cmd",
          "ros2 service list -t | grep add_two",
          "Terminal 2 (Ubuntu)"
        ],
        [
          "out",
          "/add_two_ints [example_interfaces/srv/AddTwoInts]"
        ],
        [
          "cmd",
          "ros2 service call /add_two_ints example_interfaces/srv/AddTwoInts \"{a: 7, b: 8}\"",
          "Terminal 2 (Ubuntu)"
        ],
        [
          "out",
          "waiting for service to become available...\nrequester: making request: example_interfaces.srv.AddTwoInts_Request(a=7, b=8)\n\nresponse:\nexample_interfaces.srv.AddTwoInts_Response(sum=15)"
        ],
        [
          "p",
          "Your own code answered. Terminal 1 logs each request it handles."
        ],
        [
          "h",
          "The client"
        ],
        [
          "cmd",
          "nano add_client.py",
          "Terminal 2 (Ubuntu)"
        ],
        [
          "code",
          "import sys\n\nimport rclpy\nfrom rclpy.node import Node\nfrom example_interfaces.srv import AddTwoInts\n\n\nclass AddClient(Node):\n    def __init__(self):\n        super().__init__(\"add_client\")\n        self.client = self.create_client(AddTwoInts, \"add_two_ints\")\n\n    def ask(self, a, b):\n        while not self.client.wait_for_service(timeout_sec=1.0):\n            self.get_logger().info(\"Waiting for the add_two_ints service...\")\n        request = AddTwoInts.Request()\n        request.a = a\n        request.b = b\n        future = self.client.call_async(request)\n        rclpy.spin_until_future_complete(self, future)\n        return future.result()\n\n\ndef main():\n    if len(sys.argv) != 3:\n        print(\"Usage: python3 add_client.py NUMBER NUMBER\")\n        return\n    rclpy.init()\n    node = AddClient()\n    try:\n        a, b = int(sys.argv[1]), int(sys.argv[2])\n        result = node.ask(a, b)\n        print(f\"{a} + {b} = {result.sum}\")\n    except KeyboardInterrupt:\n        pass\n    finally:\n        node.destroy_node()\n        if rclpy.ok():\n            rclpy.shutdown()\n\n\nif __name__ == \"__main__\":\n    main()",
          "add_client.py"
        ],
        [
          "ul",
          [
            "<code>create_client(AddTwoInts, &quot;add_two_ints&quot;)</code> prepares a connection to that service. It does not send anything yet.",
            "<code>wait_for_service(timeout_sec=1.0)</code> returns <code>False</code> if the server is not up. The <code>while</code> loop keeps trying, logging a message each second. This makes the client safe to start <b>before</b> the server.",
            "<code>AddTwoInts.Request()</code> creates an empty request, and you set <code>a</code> and <code>b</code> on it.",
            "<code>call_async(request)</code> sends it and returns a <b>future</b>: a promise that an answer will arrive later. <code>spin_until_future_complete(self, future)</code> runs ROS until the promise is kept, and <code>future.result()</code> is the response.",
            "<code>sys.argv</code> holds what you typed after the script name, so <code>python3 add_client.py 2 3</code> gives <code>a = 2</code> and <code>b = 3</code>. If you type the wrong number of arguments, the script prints its usage and stops."
          ]
        ],
        [
          "cmd",
          "python3 add_client.py 2 3",
          "Terminal 2 (Ubuntu)"
        ],
        [
          "out",
          "2 + 3 = 5"
        ],
        [
          "cmd",
          "python3 add_client.py 40 2",
          "Terminal 2 (Ubuntu)"
        ],
        [
          "out",
          "40 + 2 = 42"
        ],
        [
          "p",
          "Terminal 1, where the server runs, shows what it did for you:"
        ],
        [
          "out",
          "[INFO] [...] [add_server]: Request: 2 + 3 = 5\n[INFO] [...] [add_server]: Request: 40 + 2 = 42"
        ],
        [
          "h",
          "What if the server is not running?"
        ],
        [
          "p",
          "Stop the server with <code>Ctrl+C</code> in terminal 1, then run the client again:"
        ],
        [
          "cmd",
          "python3 add_client.py 2 3",
          "Terminal 2 (Ubuntu)"
        ],
        [
          "out",
          "[INFO] [...] [add_client]: Waiting for the add_two_ints service...\n[INFO] [...] [add_client]: Waiting for the add_two_ints service...\n..."
        ],
        [
          "p",
          "It waits politely. Start the server again in terminal 1 and the client finishes by itself. <code>Ctrl+C</code> stops the waiting."
        ],
        [
          "warn",
          "Why <code>call_async</code> and not a plain blocking call? ROS 2 nodes do everything through callbacks, and a client that simply <i>blocked</i> inside a callback could freeze the whole node, including the reply it is waiting for. Always use <code>call_async</code> and wait on the future, as above."
        ],
        [
          "try",
          "Run the server and call it with <code>python3 add_client.py</code> using big numbers and negative numbers (try <code>-5 3</code>). Then change <code>handle_add</code> to multiply instead of add. You will also need to change what you log. Restart the server and call it again: what does the client print now?"
        ],
        [
          "quiz",
          {
            "q": "In the server callback <code>handle_add(self, request, response)</code>, what must you do with <code>response</code>?",
            "options": [
              "Nothing, ROS fills it in",
              "Fill in its fields and <code>return</code> it",
              "Print it",
              "Delete it"
            ],
            "answer": 1,
            "why": "ROS passes you an empty response. You set its fields (<code>response.sum = ...</code>) and return it, and that is the answer the client receives."
          }
        ],
        [
          "quiz",
          {
            "q": "What does <code>call_async</code> return?",
            "options": [
              "The response immediately",
              "A future, which will hold the response once the server answers",
              "An error",
              "A new service"
            ],
            "answer": 1,
            "why": "A future is a promise of a result. <code>spin_until_future_complete</code> waits for it, and <code>future.result()</code> then gives the real response."
          }
        ]
      ]
    },
    {
      "id": "6.2",
      "title": "Actions from the terminal",
      "minutes": 25,
      "blocks": [
        [
          "p",
          "You already know two ways for nodes to talk. A <b>topic</b> is a continuous stream. A <b>service</b> is a question with one quick answer. But what about a job that takes <b>time</b>, like &quot;turn the robot to face north&quot; or, as you saw in Nav2, &quot;drive to that spot&quot;? For that, ROS 2 has <b>actions</b>."
        ],
        [
          "p",
          "An action has three parts:"
        ],
        [
          "ul",
          [
            "<b>Goal</b>: what you want done (&quot;rotate to 1.57 radians&quot;).",
            "<b>Feedback</b>: progress reports while it works (&quot;1.2 radians to go...&quot;).",
            "<b>Result</b>: the final outcome when it finishes (&quot;done, turned this much&quot;)."
          ]
        ],
        [
          "p",
          "You can also <b>cancel</b> a goal part-way. In Module 4 you sent Nav2 a <code>NavigateToPose</code> goal, watched the distance remaining fall, and got <code>SUCCEEDED</code>. Those were the goal, the feedback and the result."
        ],
        [
          "note",
          "Rule of thumb: use a <b>topic</b> for streams, a <b>service</b> for quick answers, and an <b>action</b> for anything slow where you want progress or the ability to cancel."
        ],
        [
          "h",
          "Find an action"
        ],
        [
          "p",
          "Turtlesim has one built in. In <b>terminal 1</b>, start it:"
        ],
        [
          "cmd",
          "ros2 run turtlesim turtlesim_node",
          "Terminal 1 (Ubuntu)"
        ],
        [
          "p",
          "In <b>terminal 2</b>, list the actions:"
        ],
        [
          "cmd",
          "ros2 action list -t",
          "Terminal 2 (Ubuntu)"
        ],
        [
          "out",
          "/turtle1/rotate_absolute [turtlesim/action/RotateAbsolute]"
        ],
        [
          "cmd",
          "ros2 action info /turtle1/rotate_absolute -t",
          "Terminal 2 (Ubuntu)"
        ],
        [
          "out",
          "Action: /turtle1/rotate_absolute\nAction clients: 0\nAction servers: 1\n    /turtlesim [turtlesim/action/RotateAbsolute]"
        ],
        [
          "p",
          "The server is the <code>/turtlesim</code> node, and nobody is asking it for anything yet (0 clients). Now look inside the action type:"
        ],
        [
          "cmd",
          "ros2 interface show turtlesim/action/RotateAbsolute",
          "Terminal 2 (Ubuntu)"
        ],
        [
          "out",
          "# The desired heading in radians\nfloat32 theta\n---\n# The angular displacement in radians to the starting position\nfloat32 delta\n---\n# The remaining rotation in radians\nfloat32 remaining"
        ],
        [
          "p",
          "An action type has <b>three sections</b>, separated by <code>---</code>: the <b>goal</b> (<code>theta</code>, the heading you want), the <b>result</b> (<code>delta</code>) and the <b>feedback</b> (<code>remaining</code>). A service only has two."
        ],
        [
          "h",
          "Send a goal"
        ],
        [
          "cmd",
          "ros2 action send_goal /turtle1/rotate_absolute turtlesim/action/RotateAbsolute \"{theta: 1.57}\" --feedback",
          "Terminal 2 (Ubuntu)"
        ],
        [
          "out",
          "Waiting for an action server to become available...\nSending goal:\n     theta: 1.57\n\nGoal accepted with ID: 0ebdae7cab0746248c51919e1ef4160e\n\nFeedback:\n    remaining: 1.5700000524520874\n\nFeedback:\n    remaining: 1.5540000200271606\n\nFeedback:\n    remaining: 1.5380001068115234\n...\n    remaining: 0.018000006675720215\n\nResult:\n    delta: -1.5520000457763672\n\nGoal finished with status: SUCCEEDED"
        ],
        [
          "p",
          "Watch the turtle in its window: it turns smoothly while the numbers in terminal 2 count down. Without <code>--feedback</code> you would only see the start and the end. Read the output in order:"
        ],
        [
          "ul",
          [
            "<b>Goal accepted</b>: the server said yes and gave the goal an ID.",
            "A stream of <b>Feedback</b> messages: <code>remaining</code> shrinks towards zero as the turtle turns.",
            "The <b>Result</b>: <code>delta</code> is how far the turtle reports it turned.",
            "<b>Status SUCCEEDED</b>: the goal ended well. Other endings are <code>CANCELED</code> and <code>ABORTED</code>."
          ]
        ],
        [
          "note",
          "You have now seen the same three-part pattern twice: here, and with Nav2&apos;s <code>/navigate_to_pose</code> in lesson 4.7. Every ROS 2 action works like this, so once you can read one, you can read them all."
        ],
        [
          "warn",
          "Close turtlesim with <code>Ctrl+C</code> in terminal 1 when you finish. You will use it again in lesson 6.5."
        ],
        [
          "try",
          "Send three goals in a row with different <code>theta</code> values (for example 3.14, then -1.57, then 0.0) and watch the turtle. Which direction does it choose each time? Then run <code>ros2 action list -t</code> again while a goal is running, in a third terminal."
        ],
        [
          "quiz",
          {
            "q": "Which of these is best suited to an <b>action</b>?",
            "options": [
              "Reading a temperature once a second",
              "Asking for the robot&apos;s name",
              "Driving to a far-away goal, with progress reports and the option to cancel",
              "Setting a parameter value"
            ],
            "answer": 2,
            "why": "Actions are for long-running jobs. Streams use topics, and instant questions use services."
          }
        ],
        [
          "quiz",
          {
            "q": "An action type definition has how many sections, separated by <code>---</code>?",
            "options": [
              "One",
              "Two",
              "Three: goal, result and feedback",
              "Four"
            ],
            "answer": 2,
            "why": "Goal, then result, then feedback. A service has only two sections (request and response), and a message has one."
          }
        ]
      ]
    },
    {
      "id": "6.3",
      "title": "Actions in Python: a server and a client",
      "minutes": 45,
      "blocks": [
        [
          "p",
          "Now you write an action yourself. ROS 2 comes with a ready-made action type called <b>Fibonacci</b>: you ask for a sequence of a given length and the server builds it <b>one number at a time</b>, reporting progress as it goes. It is a good stand-in for any slow job."
        ],
        [
          "cmd",
          "ros2 interface show example_interfaces/action/Fibonacci",
          "Terminal 1 (Ubuntu)"
        ],
        [
          "out",
          "# Goal\nint32 order\n---\n# Result\nint32[] sequence\n---\n# Feedback\nint32[] sequence"
        ],
        [
          "p",
          "The goal is a number (<code>order</code>). The feedback and the result are both a list of numbers (<code>sequence</code>)."
        ],
        [
          "h",
          "The server"
        ],
        [
          "cmd",
          "cd ~/ros2_practice && nano fib_server.py",
          "Terminal 1 (Ubuntu)"
        ],
        [
          "code",
          "import time\n\nimport rclpy\nfrom rclpy.action import ActionServer\nfrom rclpy.node import Node\nfrom example_interfaces.action import Fibonacci\n\n\nclass FibServer(Node):\n    def __init__(self):\n        super().__init__(\"fib_server\")\n        self.server = ActionServer(self, Fibonacci, \"fibonacci\", self.execute)\n        self.get_logger().info(\"Action server ready: /fibonacci\")\n\n    def execute(self, goal_handle):\n        order = goal_handle.request.order\n        self.get_logger().info(f\"Goal received: order {order}\")\n        feedback = Fibonacci.Feedback()\n        feedback.sequence = [0, 1]\n        for i in range(1, order):\n            feedback.sequence.append(feedback.sequence[i] + feedback.sequence[i - 1])\n            goal_handle.publish_feedback(feedback)\n            time.sleep(1.0)\n        goal_handle.succeed()\n        result = Fibonacci.Result()\n        result.sequence = feedback.sequence\n        return result\n\n\ndef main():\n    rclpy.init()\n    node = FibServer()\n    try:\n        rclpy.spin(node)\n    except KeyboardInterrupt:\n        pass\n    finally:\n        node.destroy_node()\n        if rclpy.ok():\n            rclpy.shutdown()\n\n\nif __name__ == \"__main__\":\n    main()",
          "fib_server.py"
        ],
        [
          "ul",
          [
            "<code>ActionServer(self, Fibonacci, &quot;fibonacci&quot;, self.execute)</code> creates the server: the type, the action name, and the function that does the work.",
            "<code>execute(self, goal_handle)</code> runs <b>once per goal</b>. <code>goal_handle.request</code> is the goal the client sent, here <code>order</code>.",
            "The loop builds the sequence. Each pass appends the next number, then <code>goal_handle.publish_feedback(feedback)</code> sends progress to the client. <code>time.sleep(1.0)</code> pretends the work is slow, so you can see the feedback arrive.",
            "<code>goal_handle.succeed()</code> tells ROS that the goal finished well. You must call it <b>before</b> returning.",
            "Finally the function <b>returns the result</b>. Forgetting <code>succeed()</code> makes the goal end as <code>ABORTED</code>."
          ]
        ],
        [
          "cmd",
          "python3 fib_server.py",
          "Terminal 1 (Ubuntu)"
        ],
        [
          "out",
          "[INFO] [...] [fib_server]: Action server ready: /fibonacci"
        ],
        [
          "p",
          "From <b>terminal 2</b>, check the server exists and see who is on each side:"
        ],
        [
          "cmd",
          "ros2 action list -t",
          "Terminal 2 (Ubuntu)"
        ],
        [
          "out",
          "/fibonacci [example_interfaces/action/Fibonacci]"
        ],
        [
          "cmd",
          "ros2 action info /fibonacci",
          "Terminal 2 (Ubuntu)"
        ],
        [
          "out",
          "Action: /fibonacci\nAction clients: 0\nAction servers: 1\n    /fib_server"
        ],
        [
          "p",
          "Send a goal from the command line, the same way as for turtlesim. Your own server answers:"
        ],
        [
          "cmd",
          "ros2 action send_goal /fibonacci example_interfaces/action/Fibonacci \"{order: 4}\" --feedback",
          "Terminal 2 (Ubuntu)"
        ],
        [
          "out",
          "Sending goal:\n     order: 4\n\nGoal accepted with ID: 42ebe9ea6fcb45f7b832f453a16cf471\n\nFeedback:\n    sequence:\n- 0\n- 1\n- 1\n\nFeedback:\n    sequence:\n- 0\n- 1\n- 1\n- 2\n\nFeedback:\n    sequence:\n- 0\n- 1\n- 1\n- 2\n- 3\n\nResult:\n    sequence:\n- 0\n- 1\n- 1\n- 2\n- 3\n\nGoal finished with status: SUCCEEDED"
        ],
        [
          "p",
          "One new number per second, and the final result is the last list. Terminal 1 logs <code>Goal received: order 4</code>."
        ],
        [
          "h",
          "The client"
        ],
        [
          "cmd",
          "nano fib_client.py",
          "Terminal 2 (Ubuntu)"
        ],
        [
          "code",
          "import sys\n\nimport rclpy\nfrom rclpy.action import ActionClient\nfrom rclpy.node import Node\nfrom example_interfaces.action import Fibonacci\n\n\nclass FibClient(Node):\n    def __init__(self):\n        super().__init__(\"fib_client\")\n        self.client = ActionClient(self, Fibonacci, \"fibonacci\")\n\n    def on_feedback(self, feedback_msg):\n        self.get_logger().info(f\"Feedback: {list(feedback_msg.feedback.sequence)}\")\n\n    def run(self, order):\n        self.client.wait_for_server()\n        goal = Fibonacci.Goal()\n        goal.order = order\n        send_future = self.client.send_goal_async(goal, feedback_callback=self.on_feedback)\n        rclpy.spin_until_future_complete(self, send_future)\n        goal_handle = send_future.result()\n        if not goal_handle.accepted:\n            self.get_logger().info(\"Goal was rejected\")\n            return None\n        result_future = goal_handle.get_result_async()\n        rclpy.spin_until_future_complete(self, result_future)\n        return result_future.result().result\n\n\ndef main():\n    if len(sys.argv) != 2:\n        print(\"Usage: python3 fib_client.py ORDER\")\n        return\n    rclpy.init()\n    node = FibClient()\n    try:\n        result = node.run(int(sys.argv[1]))\n        if result is not None:\n            print(f\"Result: {list(result.sequence)}\")\n    except KeyboardInterrupt:\n        pass\n    finally:\n        node.destroy_node()\n        if rclpy.ok():\n            rclpy.shutdown()\n\n\nif __name__ == \"__main__\":\n    main()",
          "fib_client.py"
        ],
        [
          "p",
          "An action client has <b>two waiting steps</b>, one more than a service client:"
        ],
        [
          "ul",
          [
            "<code>ActionClient(self, Fibonacci, &quot;fibonacci&quot;)</code> prepares the connection, and <code>wait_for_server()</code> waits for the server to exist.",
            "<code>send_goal_async(goal, feedback_callback=self.on_feedback)</code> sends the goal and returns a future. The <code>feedback_callback</code> is a function ROS calls <b>every time</b> feedback arrives, which is how you get progress while the goal runs.",
            "The first future gives you the <code>goal_handle</code>. Check <code>goal_handle.accepted</code>: a server can refuse a goal.",
            "<code>goal_handle.get_result_async()</code> returns the <b>second</b> future, which completes when the whole job is finished. Its <code>.result().result</code> is the final answer."
          ]
        ],
        [
          "cmd",
          "python3 fib_client.py 5",
          "Terminal 2 (Ubuntu)"
        ],
        [
          "out",
          "[INFO] [...] [fib_client]: Feedback: [0, 1, 1]\n[INFO] [...] [fib_client]: Feedback: [0, 1, 1, 2]\n[INFO] [...] [fib_client]: Feedback: [0, 1, 1, 2, 3]\n[INFO] [...] [fib_client]: Feedback: [0, 1, 1, 2, 3, 5]\nResult: [0, 1, 1, 2, 3, 5]"
        ],
        [
          "note",
          "For <code>order = 5</code> the result has <b>six</b> numbers. The sequence starts with <code>[0, 1]</code>, and the loop adds four more. It is just how this example is written, not a bug."
        ],
        [
          "warn",
          "This server does <b>not</b> handle cancel requests: it is the minimum needed to see goals, feedback and results. Real servers (like Nav2&apos;s) also check for cancellation inside their loop. You will see the idea in the capstone&apos;s stretch goals."
        ],
        [
          "warn",
          "<code>time.sleep</code> blocks the whole node, which is acceptable in a tiny demo. A real robot action should do its work in small steps, so that other callbacks can keep running."
        ],
        [
          "try",
          "Change <code>time.sleep(1.0)</code> to <code>0.2</code> and restart the server. Send <code>order: 10</code>. How does the feedback rate change? Then change what the server logs when it receives a goal."
        ],
        [
          "quiz",
          {
            "q": "Which method of an action client gives you progress updates while the goal is running?",
            "options": [
              "get_result_async",
              "The feedback_callback you pass to send_goal_async",
              "wait_for_server",
              "destroy_node"
            ],
            "answer": 1,
            "why": "ROS calls your <code>feedback_callback</code> each time the server publishes feedback. <code>get_result_async</code> only completes at the end."
          }
        ],
        [
          "quiz",
          {
            "q": "What happens if the action server&apos;s <code>execute</code> returns the result but never calls <code>goal_handle.succeed()</code>?",
            "options": [
              "Nothing, it works the same",
              "The goal does not end as SUCCEEDED (it is aborted)",
              "The client crashes immediately",
              "The server restarts"
            ],
            "answer": 1,
            "why": "<code>succeed()</code> is how the server reports a good outcome. Without it, ROS treats the goal as aborted."
          }
        ]
      ]
    },
    {
      "id": "6.4",
      "title": "Quality of Service (QoS)",
      "minutes": 35,
      "blocks": [
        [
          "p",
          "In lesson 4.6 you used a strange extra argument, <code>qos_profile_sensor_data</code>, and a warning said that using the wrong one on a real robot gives you <i>nothing, silently</i>. This lesson explains why, and shows it happening on purpose."
        ],
        [
          "p",
          "<b>QoS</b> (quality of service) is a set of rules that each publisher and subscriber states about how they want messages delivered. The main ones:"
        ],
        [
          "ul",
          [
            "<b>Reliability</b>: <code>RELIABLE</code> means &quot;resend lost messages until they arrive&quot; (slower, nothing is lost). <code>BEST_EFFORT</code> means &quot;send once and move on&quot; (faster, may drop a message). Sensors that send many readings a second use best effort: an old reading is worthless anyway.",
            "<b>Durability</b>: <code>VOLATILE</code> means &quot;only deliver to those listening right now&quot;. <code>TRANSIENT_LOCAL</code> means &quot;keep the last message, and give it to subscribers that join <i>later</i>&quot;. It is like a noticeboard.",
            "<b>History and depth</b>: how many unread messages to keep in the queue (the <code>10</code> you have been passing to <code>create_publisher</code>)."
          ]
        ],
        [
          "p",
          "Publisher and subscriber must <b>agree</b>. The rule of thumb: <b>a subscriber cannot ask for more than the publisher offers</b>. A best-effort publisher cannot satisfy a subscriber that demands reliability."
        ],
        [
          "h",
          "A publisher and a subscriber you can configure"
        ],
        [
          "cmd",
          "cd ~/ros2_practice && nano qos_talker.py",
          "Terminal 1 (Ubuntu)"
        ],
        [
          "code",
          "import sys\n\nimport rclpy\nfrom rclpy.node import Node\nfrom rclpy.qos import QoSProfile, ReliabilityPolicy\nfrom std_msgs.msg import String\n\n\nclass Talker(Node):\n    def __init__(self, reliability):\n        super().__init__(\"talker\")\n        qos = QoSProfile(depth=10, reliability=reliability)\n        self.publisher = self.create_publisher(String, \"chatter\", qos)\n        self.count = 0\n        self.create_timer(0.5, self.tick)\n\n    def tick(self):\n        msg = String()\n        msg.data = f\"message {self.count}\"\n        self.publisher.publish(msg)\n        self.count += 1\n\n\ndef main():\n    modes = {\"reliable\": ReliabilityPolicy.RELIABLE, \"best_effort\": ReliabilityPolicy.BEST_EFFORT}\n    if len(sys.argv) != 2 or sys.argv[1] not in modes:\n        print(\"Usage: python3 qos_talker.py reliable|best_effort\")\n        return\n    rclpy.init()\n    node = Talker(modes[sys.argv[1]])\n    try:\n        rclpy.spin(node)\n    except KeyboardInterrupt:\n        pass\n    finally:\n        node.destroy_node()\n        if rclpy.ok():\n            rclpy.shutdown()\n\n\nif __name__ == \"__main__\":\n    main()",
          "qos_talker.py"
        ],
        [
          "cmd",
          "nano qos_listener.py",
          "Terminal 2 (Ubuntu)"
        ],
        [
          "code",
          "import sys\n\nimport rclpy\nfrom rclpy.node import Node\nfrom rclpy.qos import QoSProfile, ReliabilityPolicy\nfrom std_msgs.msg import String\n\n\nclass Listener(Node):\n    def __init__(self, reliability):\n        super().__init__(\"listener\")\n        qos = QoSProfile(depth=10, reliability=reliability)\n        self.create_subscription(String, \"chatter\", self.on_message, qos)\n\n    def on_message(self, msg):\n        self.get_logger().info(f\"Heard: {msg.data}\")\n\n\ndef main():\n    modes = {\"reliable\": ReliabilityPolicy.RELIABLE, \"best_effort\": ReliabilityPolicy.BEST_EFFORT}\n    if len(sys.argv) != 2 or sys.argv[1] not in modes:\n        print(\"Usage: python3 qos_listener.py reliable|best_effort\")\n        return\n    rclpy.init()\n    node = Listener(modes[sys.argv[1]])\n    try:\n        rclpy.spin(node)\n    except KeyboardInterrupt:\n        pass\n    finally:\n        node.destroy_node()\n        if rclpy.ok():\n            rclpy.shutdown()\n\n\nif __name__ == \"__main__\":\n    main()",
          "qos_listener.py"
        ],
        [
          "p",
          "Both scripts take one word on the command line, <code>reliable</code> or <code>best_effort</code>, and build a <code>QoSProfile</code> from it. The talker publishes <code>message 0</code>, <code>message 1</code>... twice a second."
        ],
        [
          "h",
          "Experiment 1: a mismatch"
        ],
        [
          "p",
          "Start a <b>best-effort</b> talker in terminal 1, and a <b>reliable</b> listener in terminal 2:"
        ],
        [
          "cmd",
          "python3 qos_talker.py best_effort",
          "Terminal 1 (Ubuntu)"
        ],
        [
          "cmd",
          "python3 qos_listener.py reliable",
          "Terminal 2 (Ubuntu)"
        ],
        [
          "out",
          "[WARN] [...] [listener]: New publisher discovered on topic 'chatter', offering incompatible QoS. No messages will be received from it. Last incompatible policy: RELIABILITY"
        ],
        [
          "p",
          "Nothing else ever appears. The talker is publishing happily, the listener is running happily, and <b>no message arrives</b>. The only clue is that one warning line. Read it: the publisher offers incompatible QoS, and the policy at fault is <code>RELIABILITY</code>. Stop both with <code>Ctrl+C</code>."
        ],
        [
          "warn",
          "This is the silent bug. On a real robot the camera or lidar publishes best effort, and a subscriber written with the default reliable setting simply never hears it. If your callback never runs and there is no error, check the QoS and look for this warning."
        ],
        [
          "h",
          "Experiment 2: all four combinations"
        ],
        [
          "p",
          "Try each pair (talker in terminal 1, listener in terminal 2). These are the results for all four:"
        ],
        [
          "ul",
          [
            "talker <code>best_effort</code> with listener <code>best_effort</code>: <b>works</b>.",
            "talker <code>reliable</code> with listener <code>best_effort</code>: <b>works</b>. A reliable publisher can satisfy a relaxed subscriber.",
            "talker <code>reliable</code> with listener <code>reliable</code>: <b>works</b>.",
            "talker <code>best_effort</code> with listener <code>reliable</code>: <b>fails</b>, as you just saw."
          ]
        ],
        [
          "out",
          "[INFO] [...] [listener]: Heard: message 4\n[INFO] [...] [listener]: Heard: message 5\n[INFO] [...] [listener]: Heard: message 6"
        ],
        [
          "p",
          "That output is what a working pair looks like. The first few messages (0 to 3 here) are missed because the listener started a couple of seconds after the talker."
        ],
        [
          "p",
          "The safe habit for sensors: <b>subscribe with best effort</b>, because it works against both kinds of publisher. That is exactly what <code>qos_profile_sensor_data</code> gives you."
        ],
        [
          "h",
          "Look at the settings of a live topic"
        ],
        [
          "p",
          "With a best-effort talker and listener running, ask ROS what each side asked for:"
        ],
        [
          "cmd",
          "ros2 topic info /chatter --verbose",
          "Terminal 3 (Ubuntu)"
        ],
        [
          "out",
          "Node name: talker\nNode namespace: /\nEndpoint type: PUBLISHER\n  Reliability: BEST_EFFORT\n  History (Depth): UNKNOWN\n  Durability: VOLATILE\n...\nNode name: listener\nNode namespace: /\nEndpoint type: SUBSCRIPTION\n  Reliability: BEST_EFFORT\n  History (Depth): UNKNOWN\n  Durability: VOLATILE"
        ],
        [
          "p",
          "<code>--verbose</code> lists every publisher and subscriber and the QoS each one requested. It is the first command to run when messages go missing."
        ],
        [
          "h",
          "Experiment 3: the late joiner (durability)"
        ],
        [
          "p",
          "Some information is published <b>once</b> and must reach everyone, even nodes that start later: a map, a robot description, or a status like &quot;ready&quot;. That is what <code>TRANSIENT_LOCAL</code> is for. You used it in <code>mapstat.py</code> in lesson 5.2 to receive a map published before the script started."
        ],
        [
          "cmd",
          "nano status_talker.py",
          "Terminal 1 (Ubuntu)"
        ],
        [
          "code",
          "import rclpy\nfrom rclpy.node import Node\nfrom rclpy.qos import QoSProfile, DurabilityPolicy, ReliabilityPolicy\nfrom std_msgs.msg import String\n\n\nclass StatusTalker(Node):\n    def __init__(self):\n        super().__init__(\"status_talker\")\n        qos = QoSProfile(depth=1, reliability=ReliabilityPolicy.RELIABLE, durability=DurabilityPolicy.TRANSIENT_LOCAL)\n        self.publisher = self.create_publisher(String, \"status\", qos)\n        msg = String()\n        msg.data = \"Robot is ready\"\n        self.publisher.publish(msg)\n        self.get_logger().info(\"Published once: Robot is ready\")\n\n\ndef main():\n    rclpy.init()\n    node = StatusTalker()\n    try:\n        rclpy.spin(node)\n    except KeyboardInterrupt:\n        pass\n    finally:\n        node.destroy_node()\n        if rclpy.ok():\n            rclpy.shutdown()\n\n\nif __name__ == \"__main__\":\n    main()",
          "status_talker.py"
        ],
        [
          "cmd",
          "nano status_listener.py",
          "Terminal 2 (Ubuntu)"
        ],
        [
          "code",
          "import sys\n\nimport rclpy\nfrom rclpy.node import Node\nfrom rclpy.qos import QoSProfile, DurabilityPolicy, ReliabilityPolicy\nfrom std_msgs.msg import String\n\n\nclass StatusListener(Node):\n    def __init__(self, durability):\n        super().__init__(\"status_listener\")\n        qos = QoSProfile(depth=1, reliability=ReliabilityPolicy.RELIABLE, durability=durability)\n        self.create_subscription(String, \"status\", self.on_status, qos)\n\n    def on_status(self, msg):\n        self.get_logger().info(f\"Status: {msg.data}\")\n\n\ndef main():\n    modes = {\"volatile\": DurabilityPolicy.VOLATILE, \"transient_local\": DurabilityPolicy.TRANSIENT_LOCAL}\n    if len(sys.argv) != 2 or sys.argv[1] not in modes:\n        print(\"Usage: python3 status_listener.py volatile|transient_local\")\n        return\n    rclpy.init()\n    node = StatusListener(modes[sys.argv[1]])\n    try:\n        rclpy.spin(node)\n    except KeyboardInterrupt:\n        pass\n    finally:\n        node.destroy_node()\n        if rclpy.ok():\n            rclpy.shutdown()\n\n\nif __name__ == \"__main__\":\n    main()",
          "status_listener.py"
        ],
        [
          "p",
          "Start the talker. It publishes one message and then just waits:"
        ],
        [
          "cmd",
          "python3 status_talker.py",
          "Terminal 1 (Ubuntu)"
        ],
        [
          "out",
          "[INFO] [...] [status_talker]: Published once: Robot is ready"
        ],
        [
          "p",
          "Wait a few seconds, then start a <b>late</b> listener, first the ordinary kind. It hears nothing, because the message was sent before it existed:"
        ],
        [
          "cmd",
          "python3 status_listener.py volatile",
          "Terminal 2 (Ubuntu)"
        ],
        [
          "p",
          "Stop it with <code>Ctrl+C</code> and start one that asks for a kept message:"
        ],
        [
          "cmd",
          "python3 status_listener.py transient_local",
          "Terminal 2 (Ubuntu)"
        ],
        [
          "out",
          "[INFO] [...] [status_listener]: Status: Robot is ready"
        ],
        [
          "p",
          "The same message arrives immediately, although it was published seconds earlier. The talker is still running and holding the last message for latecomers. Confirm it with <code>ros2 topic info /status --verbose</code>: the publisher shows <code>Durability: TRANSIENT_LOCAL</code>."
        ],
        [
          "h",
          "Which setting for what?"
        ],
        [
          "ul",
          [
            "<b>Sensor streams</b> (lidar, camera, IMU): best effort, volatile. Use <code>qos_profile_sensor_data</code>.",
            "<b>Commands and ordinary data</b> (like <code>/cmd_vel</code>): the default, reliable and volatile.",
            "<b>One-off information for latecomers</b> (map, status): reliable and <code>TRANSIENT_LOCAL</code>."
          ]
        ],
        [
          "try",
          "Run all four reliability combinations yourself and write down which fail. Then change the listener in <code>status_listener.py</code> so that it asks for <code>TRANSIENT_LOCAL</code> but the talker uses <code>VOLATILE</code>. Does that work? (Remember the rule: a subscriber cannot ask for more than the publisher offers.)"
        ],
        [
          "quiz",
          {
            "q": "A lidar publishes with best-effort reliability. Your subscriber uses the default (reliable) QoS. What happens?",
            "options": [
              "Everything works normally",
              "The messages are never delivered, and only a QoS warning is printed",
              "ROS crashes",
              "The messages arrive slower"
            ],
            "answer": 1,
            "why": "A subscriber cannot ask for more than the publisher offers. The connection is refused silently, apart from one warning line, so your callback never runs."
          }
        ],
        [
          "quiz",
          {
            "q": "You want a node that starts <i>late</i> to still receive the last <code>/map</code> message. Which durability setting?",
            "options": [
              "VOLATILE",
              "TRANSIENT_LOCAL",
              "BEST_EFFORT",
              "KEEP_ALL"
            ],
            "answer": 1,
            "why": "<code>TRANSIENT_LOCAL</code> keeps the last message(s) at the publisher and hands them to subscribers that join later."
          }
        ]
      ]
    },
    {
      "id": "6.5",
      "title": "Capstone: the turtle show",
      "minutes": 50,
      "blocks": [
        [
          "p",
          "You can now write a service client, an action client, and you understand QoS. In this capstone you combine them in <b>one program</b> that puts on a small show in turtlesim: it creates a second turtle with a <b>service</b>, then turns the first turtle through several headings with an <b>action</b>, reporting progress as it goes."
        ],
        [
          "h",
          "The task"
        ],
        [
          "p",
          "Write <code>turtle_show.py</code>, one node with these jobs, in order:"
        ],
        [
          "ul",
          [
            "<b>Spawn a turtle.</b> Call turtlesim&apos;s <code>/spawn</code> service to create a turtle named <code>turtle2</code> at x = 8.0, y = 8.0. Log the name the service returns. (Look at the interface first: <code>ros2 interface show turtlesim/srv/Spawn</code>.)",
            "<b>Rotate turtle1.</b> For each heading in a list at the top of your file (<code>HEADINGS = [1.57, 3.14, -1.57]</code>), send a goal to the <code>/turtle1/rotate_absolute</code> action (type <code>turtlesim/action/RotateAbsolute</code>) and wait for it to finish.",
            "<b>Report progress.</b> In the feedback callback, log the <code>remaining</code> angle, but <b>at most once per second</b> (you used <code>throttle_duration_sec</code> in lessons 4.6 and 2.7).",
            "<b>Report each result.</b> When a rotation finishes, log which heading was reached and how far the turtle turned (the result&apos;s <code>delta</code>).",
            "<b>Exit cleanly</b> with the usual <code>try</code> / <code>except KeyboardInterrupt</code> / <code>finally</code> pattern."
          ]
        ],
        [
          "p",
          "Setup: turtlesim runs in terminal 1 (<code>ros2 run turtlesim turtlesim_node</code>), your program runs in terminal 2."
        ],
        [
          "h",
          "What good looks like"
        ],
        [
          "p",
          "Your log should look like this (times and exact angles vary):"
        ],
        [
          "out",
          "[INFO] [...] [turtle_show]: Spawned turtle2\n[INFO] [...] [turtle_show]:   remaining: 3.12 rad\n[INFO] [...] [turtle_show]:   remaining: 2.11 rad\n[INFO] [...] [turtle_show]:   remaining: 1.11 rad\n[INFO] [...] [turtle_show]:   remaining: 0.10 rad\n[INFO] [...] [turtle_show]: Rotated to 1.57, turned -3.10 rad in total\n[INFO] [...] [turtle_show]:   remaining: 0.68 rad\n[INFO] [...] [turtle_show]: Rotated to 3.14, turned -1.58 rad in total\n[INFO] [...] [turtle_show]:   remaining: 1.26 rad\n[INFO] [...] [turtle_show]:   remaining: 0.25 rad\n[INFO] [...] [turtle_show]: Rotated to -1.57, turned -1.57 rad in total"
        ],
        [
          "p",
          "In the turtlesim window you should see a second turtle appear at the top right while the first one swings through its three headings. The numbers will not match exactly: they depend on where the first turtle was facing when you started."
        ],
        [
          "note",
          "A hint about structure, not code: your node needs <b>two</b> clients, one made with <code>create_client(...)</code> and one made with <code>ActionClient(...)</code>. Both need a <code>wait_for_...</code> call before you use them. Everything else is the patterns from lessons 6.1 and 6.3."
        ],
        [
          "warn",
          "Restart turtlesim between runs. A turtle called <code>turtle2</code> can only exist once. Spawning a name that is already taken fails, and the service answers with an empty name."
        ],
        [
          "h",
          "Stretch goals"
        ],
        [
          "ul",
          [
            "<b>Move turtle2 too.</b> Send the same rotations to <code>/turtle2/rotate_absolute</code> after the first turtle finishes.",
            "<b>Teleport with a service.</b> Use <code>/turtle1/teleport_absolute</code> (type <code>turtlesim/srv/TeleportAbsolute</code>) to jump turtle1 to the middle of the window between headings.",
            "<b>Take headings from the command line.</b> <code>python3 turtle_show.py 1.0 2.0 3.0</code> should use those angles (<code>sys.argv</code>).",
            "<b>Listen to the pose.</b> Subscribe to <code>/turtle1/pose</code> and log the heading at the end. Which QoS settings does that topic use? Find out with <code>ros2 topic info /turtle1/pose --verbose</code> and match them.",
            "<b>Handle failure.</b> If the spawn returns an empty name, log a warning and carry on."
          ]
        ],
        [
          "note",
          "No solution is given on purpose. The two clients and the callbacks are exactly what you wrote in 6.1 and 6.3. If you get stuck, paste your code and the error to Claude and ask for a hint, not the answer."
        ],
        [
          "try",
          "Do the capstone. When your program spawns <code>turtle2</code> and rotates turtle1 through all three headings with progress logs, mark this quest complete."
        ],
        [
          "quiz",
          {
            "q": "To make turtle1 turn to a heading and report progress while doing it, you use:",
            "options": [
              "A service client, because it is a question",
              "An action client, because it takes time and reports feedback",
              "A topic subscription only",
              "A parameter"
            ],
            "answer": 1,
            "why": "Turning takes time and you want progress, which is what actions are for. Spawning a turtle is a quick one-off question, so it is a service."
          }
        ],
        [
          "h",
          "What comes next"
        ],
        [
          "p",
          "You now know all three ways ROS 2 nodes communicate (topics, services and actions), how to write each side in Python, and how QoS decides whether messages arrive. Together with Modules 4 and 5, that is the core of everyday ROS 2 work."
        ]
      ]
    }
  ]
});
