from flask import Flask
from flask_cors import CORS
from timeline import timeline_tab
from configure_env import Config
from websocket_utils import SocketManager
from runner_utils import controller
import logging
import os, sys

app = Flask(__name__)
DEFAULT_PORT = 5000
CLIENT_PORT = 5173

app.config.from_object(Config)
Config.configure_paths()

socket_manager = SocketManager(app=app)
socket_manager.configure_socket()

controller.configure_socket(sio=socket_manager.get_sio())
CORS(app, resources={r"/*": {"origins": f"http://localhost:{CLIENT_PORT}"}})

app.register_blueprint(timeline_tab)

if __name__ == "__main__":
    socket_manager.run(port=DEFAULT_PORT, debug=True, use_reloader=False)