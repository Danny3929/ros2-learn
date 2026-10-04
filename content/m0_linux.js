window.MODULES = window.MODULES || [];
window.MODULES.push({
  order: 0,
  title: "0 · Linux terminal basics",
  lessons: [
    {
      id: "0.1", title: "Your Ubuntu terminal", minutes: 10,
      blocks: [
        ["p", "ROS 2 is driven from a <b>terminal</b>: a window where you type commands instead of clicking. Your ROS 2 install lives inside <b>Ubuntu</b>, a Linux system that runs inside Windows through WSL. So you will always be in one of two worlds:"],
        ["ul", [
          "<b>Windows</b> (PowerShell, File Explorer): where this app and your usual programs live.",
          "<b>Ubuntu</b> (the WSL terminal): where ROS 2 runs. Every command in this course goes here, unless a box says otherwise."
        ]],
        ["h", "Open the Ubuntu terminal"],
        ["p", "Press the Windows key, type <code>Ubuntu 22.04</code> and press Enter. If you prefer, open <b>Windows Terminal</b> and pick the Ubuntu 22.04 tab. A black window opens with a line ending in <code>$</code>. That line is the <b>prompt</b>: it means the terminal is waiting for you to type."],
        ["p", "A prompt looks like <code>daniel@LAPTOP-NAME:~$</code>. Read it as <i>user</i>@<i>computer</i>:<i>current folder</i>. The <code>~</code> means your home folder."],
        ["h", "Your first commands"],
        ["p", "Type a command, then press <b>Enter</b>. Do not type the <code>$</code>; the Copy button leaves it out."],
        ["cmd", "whoami"],
        ["out", "daniel"],
        ["cmd", "lsb_release -d"],
        ["out", "Description:\tUbuntu 22.04.5 LTS"],
        ["cmd", "ros2 --help"],
        ["p", "That last one prints a list of ROS 2 commands. If it does, ROS 2 is installed and ready."],
        ["note", "Pasting into the Ubuntu terminal: <b>right-click</b> or <b>Ctrl+Shift+V</b>. Plain Ctrl+V may not work in older terminals."],
        ["try", "Run all three commands. If <code>ros2 --help</code> says <i>command not found</i>, tell Claude and paste what you see."],
        ["quiz", {
          q: "A command in this course has no label saying otherwise. Where do you run it?",
          options: ["In Windows PowerShell", "In the Ubuntu (WSL) terminal", "In this web page", "In File Explorer"],
          answer: 1,
          why: "ROS 2 is installed inside Ubuntu, so its commands only exist there."
        }]
      ]
    },
    {
      id: "0.2", title: "Finding your way around", minutes: 15,
      blocks: [
        ["p", "Linux organises everything in <b>folders</b> (also called directories), arranged like a tree. The terminal is always <i>inside</i> one folder, called the <b>current directory</b>. Three commands let you see and move around."],
        ["h", "Where am I? What is here?"],
        ["cmd", "pwd"],
        ["out", "/home/daniel"],
        ["p", "<code>pwd</code> (<i>print working directory</i>) shows your current location as a <b>path</b>. Paths use <code>/</code> between folder names, never <code>\\</code>."],
        ["cmd", "ls"],
        ["p", "<code>ls</code> lists what is in the current folder. Useful variations:"],
        ["cmd", "ls -l"],
        ["cmd", "ls -a"],
        ["ul", [
          "<code>ls -l</code>: one item per line with sizes and dates.",
          "<code>ls -a</code>: also shows <i>hidden</i> items. Names starting with a dot, like <code>.bashrc</code>, are hidden."
        ]],
        ["h", "Moving"],
        ["cmd", "cd /opt/ros"],
        ["cmd", "ls"],
        ["out", "humble"],
        ["cmd", "cd humble"],
        ["cmd", "pwd"],
        ["out", "/opt/ros/humble"],
        ["p", "<code>cd</code> means <i>change directory</i>. A few shortcuts you will use constantly:"],
        ["ul", [
          "<code>cd ..</code>: go up one folder.",
          "<code>cd ~</code> or just <code>cd</code>: go back to your home folder.",
          "<code>cd -</code>: jump back to where you just were."
        ]],
        ["cmd", "cd .."],
        ["cmd", "pwd"],
        ["out", "/opt/ros"],
        ["cmd", "cd ~"],
        ["h", "Two time-savers"],
        ["ul", [
          "<b>Tab</b> completes names. Type <code>cd /op</code> and press Tab: it becomes <code>cd /opt/</code>. Press Tab twice to see all options.",
          "<b>Up arrow</b> brings back your previous commands, so you never retype."
        ]],
        ["warn", "Your Windows files are visible at <code>/mnt/c/Users/hp</code>, but work there is slow and can cause odd problems for ROS. Keep all your ROS projects in your Linux home folder (<code>~</code>)."],
        ["try", "Go to <code>/opt/ros/humble</code>, run <code>ls</code> to see what is inside, then return home with <code>cd ~</code> and confirm with <code>pwd</code>."],
        ["quiz", {
          q: "You are in <code>/opt/ros/humble</code>. Which command takes you to <code>/opt/ros</code>?",
          options: ["cd ~", "cd ..", "cd -a", "ls .."],
          answer: 1,
          why: "<code>..</code> means the parent folder. <code>cd ~</code> would go to your home folder instead."
        }]
      ]
    },
    {
      id: "0.3", title: "Creating and managing files", minutes: 20,
      blocks: [
        ["p", "ROS 2 projects are folders full of files, so you need to create, copy, move and delete them from the terminal. Start in a clean place:"],
        ["cmd", "cd ~"],
        ["cmd", "mkdir practice"],
        ["cmd", "cd practice"],
        ["p", "<code>mkdir</code> makes a folder. Now create files:"],
        ["cmd", "touch a.txt"],
        ["cmd", "echo \"hello linux\" > b.txt"],
        ["cmd", "ls"],
        ["out", "a.txt  b.txt"],
        ["ul", [
          "<code>touch a.txt</code> creates an empty file.",
          "<code>echo \"text\" > file</code> writes text into a file, replacing what was there. <code>>></code> appends instead."
        ]],
        ["cmd", "cat b.txt"],
        ["out", "hello linux"],
        ["p", "<code>cat</code> prints a file's contents."],
        ["h", "Copy, move, rename"],
        ["cmd", "cp b.txt c.txt"],
        ["cmd", "mv c.txt notes.txt"],
        ["cmd", "ls"],
        ["out", "a.txt  b.txt  notes.txt"],
        ["ul", [
          "<code>cp source destination</code>: copy.",
          "<code>mv source destination</code>: move <i>or rename</i>. Linux has no separate rename command."
        ]],
        ["h", "Delete (carefully)"],
        ["cmd", "rm a.txt"],
        ["cmd", "cd .."],
        ["cmd", "rm -r practice"],
        ["warn", "There is <b>no Recycle Bin</b>. <code>rm</code> deletes permanently. <code>rm -r</code> deletes a folder and everything inside it. Always check with <code>pwd</code> and <code>ls</code> first, and never run <code>rm -r</code> on something you have not read."],
        ["h", "Editing files with nano"],
        ["p", "<code>nano</code> is a simple text editor that runs in the terminal. You will use it to tweak ROS 2 files."],
        ["cmd", "nano hello.txt"],
        ["p", "Type some text. Save with <b>Ctrl+O</b> then Enter. Exit with <b>Ctrl+X</b>. The shortcuts are listed along the bottom of the screen (<code>^</code> means Ctrl)."],
        ["cmd", "rm hello.txt"],
        ["try", "Make a folder <code>practice</code>, create two files inside, copy one, rename the copy, view it with <code>cat</code>, then delete the whole folder with <code>rm -r</code>."],
        ["quiz", {
          q: "How do you rename <code>old.txt</code> to <code>new.txt</code>?",
          options: ["rename old.txt new.txt", "cp old.txt new.txt", "mv old.txt new.txt", "touch new.txt"],
          answer: 2,
          why: "<code>mv</code> moves a file, and moving to a new name in the same folder is a rename. <code>cp</code> would leave the old file behind."
        }]
      ]
    },
    {
      id: "0.4", title: "Environment variables and source", minutes: 20,
      blocks: [
        ["p", "This is the Linux idea that trips up most ROS 2 beginners, and the one that explains most &quot;command not found&quot; errors. Take your time here."],
        ["h", "Variables"],
        ["p", "The terminal remembers settings called <b>environment variables</b>. Their names are conventionally uppercase, and you read one by putting <code>$</code> in front."],
        ["cmd", "echo $HOME"],
        ["out", "/home/daniel"],
        ["cmd", "export GREETING=hi"],
        ["cmd", "echo $GREETING"],
        ["out", "hi"],
        ["p", "<code>export NAME=value</code> sets a variable. Careful: <b>no spaces</b> around the <code>=</code>. The variable exists only in <i>this terminal window</i>. Open a second window and <code>echo $GREETING</code> prints nothing."],
        ["h", "PATH: how the terminal finds programs"],
        ["cmd", "echo $PATH"],
        ["p", "<code>PATH</code> is a list of folders separated by <code>:</code>. When you type <code>ls</code>, the terminal searches those folders for a program called <code>ls</code>. If the program is not in any of them, you get <i>command not found</i>."],
        ["h", "source: loading settings from a file"],
        ["p", "ROS 2 comes with a file full of <code>export</code> lines that add ROS 2's programs and libraries to your <code>PATH</code> and other variables. Running a file's lines in your <i>current</i> terminal is what <code>source</code> does:"],
        ["cmd", "source /opt/ros/humble/setup.bash"],
        ["cmd", "printenv | grep ROS"],
        ["out", "ROS_VERSION=2\nROS_PYTHON_VERSION=3\nROS_LOCALHOST_ONLY=0\nROS_DISTRO=humble"],
        ["p", "<code>printenv</code> lists all variables, and <code>| grep ROS</code> keeps only lines containing &quot;ROS&quot;. The <code>|</code> (pipe) hands one command's output to the next."],
        ["h", "Why you did not have to do this in lesson 0.1"],
        ["p", "Claude added a <code>source</code> line to a hidden file called <code>~/.bashrc</code>. Every new terminal runs that file automatically at start-up."],
        ["cmd", "tail -n 2 ~/.bashrc"],
        ["out", "source /opt/ros/humble/setup.bash\nsource /usr/share/colcon_cd/function/colcon_cd.sh"],
        ["note", "Later you will build your own ROS 2 workspace, and each workspace has its own <code>setup.bash</code> that you must source in every terminal. Forgetting this is the number one cause of &quot;package not found&quot; errors. We will return to it."],
        ["try", "Open a second Ubuntu window. Run <code>echo $GREETING</code> in it (prints nothing), then <code>printenv | grep ROS_DISTRO</code> (prints <code>humble</code>). Why the difference?"],
        ["quiz", {
          q: "You get <code>ros2: command not found</code> in a brand-new terminal. What is the most likely cause?",
          options: [
            "ROS 2 was uninstalled",
            "The ROS 2 setup file has not been sourced in this terminal",
            "The file is hidden",
            "You typed a space after the <code>$</code>"
          ],
          answer: 1,
          why: "The ROS 2 program exists, but its folder is not on <code>PATH</code> until you <code>source /opt/ros/humble/setup.bash</code>."
        }]
      ]
    },
    {
      id: "0.5", title: "Running, stopping and getting help", minutes: 15,
      blocks: [
        ["p", "ROS 2 runs many programs at once, and most never finish by themselves. You need to know how to start, stop and look up commands."],
        ["h", "Stopping a program: Ctrl+C"],
        ["p", "A program that keeps running holds your terminal until you stop it. Try one:"],
        ["cmd", "ping -c 3 localhost"],
        ["p", "That one stops itself after 3 tries. Now one that does not:"],
        ["cmd", "ping localhost"],
        ["p", "Press <b>Ctrl+C</b> to stop it. This is the universal &quot;stop&quot; key, and you will use it on every ROS 2 node."],
        ["warn", "In the terminal, <b>Ctrl+C is stop, not copy</b>. To copy selected text, use <b>Ctrl+Shift+C</b>."],
        ["h", "One terminal per program"],
        ["p", "In ROS 2 you usually run each program in its <b>own terminal window</b>, for example a publisher in one and a subscriber in another. Open extra tabs in Windows Terminal with <b>Ctrl+Shift+T</b>, or open another Ubuntu window from the Start menu. Remember each new terminal sources ROS 2 automatically."],
        ["h", "Getting help"],
        ["cmd", "ls --help"],
        ["cmd", "man ls"],
        ["p", "<code>--help</code> prints a short summary. <code>man</code> opens the full manual: scroll with arrow keys and press <b>q</b> to quit. ROS 2 tools have help too, for example <code>ros2 topic --help</code>."],
        ["h", "sudo and installing software"],
        ["p", "Some actions change the whole system and need administrator rights. You put <code>sudo</code> in front, and it asks for your Ubuntu password (nothing shows as you type; that is normal)."],
        ["cmd", "sudo apt update"],
        ["p", "<code>apt</code> is Ubuntu's app installer. <code>sudo apt update</code> refreshes its list of available software, and <code>sudo apt install name</code> installs something. ROS 2 packages are installed this way, for example <code>sudo apt install ros-humble-turtlesim</code>."],
        ["note", "If you do not remember your Ubuntu password, tell Claude. It can be reset from Windows."],
        ["h", "Clear the screen"],
        ["cmd", "clear"],
        ["try", "Run <code>ping localhost</code> and stop it with Ctrl+C. Then run <code>ros2 topic --help</code> and read the list of subcommands. You will meet most of them soon."],
        ["quiz", {
          q: "A program keeps running and your terminal seems stuck. What do you press?",
          options: ["Ctrl+Z", "Ctrl+V", "Ctrl+C", "Ctrl+Shift+C"],
          answer: 2,
          why: "Ctrl+C sends a stop signal to the running program. Ctrl+Shift+C is copy."
        }]
      ]
    }
  ]
});
