# Visual Tool Setup

### Installation

1. Git clone this repo (make sure to place this repo in the directory of where your other Retico modules are).
2. In order to run and match the dependencies for the frontend you will need to install [npm](https://nodejs.org/en/download).
3. After installing check with ```npm -v``` to make sure you installed it correctly.
4. In order to match the dependences for the backend you need to install [uv](https://docs.astral.sh/uv/getting-started/installation/).
5. Check if uv is installed correctly with ```uv --version```.
6. Run ```uv sync``` within the terminal to get all backend dependencies.
7. Activate your environment

Note: You can also skip step 6 and run ```uv pip install .``` or ```pip install .``` if you already have an existing environment.

Note: As of 05/16/2026, LoggerModule is located in another branch of retico-core named "jason_vis_tool". Please make sure you use that branch when using this tool, as this is the main mechanism for visualizing IUs and the network.

### How to Run
1. Run "**./run_tool.sh**" within the terminal.
2. Use the module selection UI to connect different modules together with adjustable parameters (refer to video for demonstration).
3. Go to timeline tab and press the "Record" button.

This might take a while on the first start up...

### Visualizing your own network without module selection UI

1. Go to vis_tool2/backend/src/runner_utils.py
2. You will see a function named "custom" (you can also create your own) defined within the RunnerController class
3. Copy + paste your network / runner file into the custom function
4. Use ```self._import_all_classes()``` at the very top to automatically import all Retico modules defined with the naming convention of "retico-" (You will still have to import external packages or any packages that do not follow the naming convention)
5. Choose any Retico modules to subscribe to the LoggerModule to visualize them within the timeline tab (refer to the note below)
6. Use ```self.initialized.set()``` and ```self.stop_event.wait()``` if using ```input()``` to simulate the blocking mechanism (This should go in place of ```input()```)
7. Switch the runner thread's target to use the "custom" function instead of runner (e.g. ```self.runner_thread = threading.Thread(target=self.runner, daemon=True, name="RunnerController")``` TO ```self.runner_thread = threading.Thread(target=self.custom, daemon=True, name="RunnerController")```)
8. Go back to the vis_tool2 directory and run "**./run_tool.sh**" within the terminal and press the "Record" button on the timeline tab.

Note: There is a pre-defined network in the "custom" function for you to follow.

### Current Limitations

You cannot use any Retico modules that require external instantiation outside the module itself for any modules through the module selection UI (e.g. HuggingfaceLM)

Solution: Please follow the section above.

### Video Guide

[![Youtube link to Retico Visual Tool Video](https://img.youtube.com/vi/ZoOLo9lukLQ/0.jpg)](https://youtu.be/vjsSoLZ2en4)

##### This tool was made with:
* [React](https://github.com/facebook/react)
* [Flask](https://github.com/pallets/flask)
* [TailwindCSS](https://github.com/tailwindlabs/tailwindcss)
* [ReactFlow](https://github.com/xyflow/xyflow)