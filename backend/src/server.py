from flask import Flask
from flask_cors import CORS
from test import test_tab
from configure_env import Config
from websocket_utils import SocketManager

import os, sys

app = Flask(__name__)
DEFAULT_PORT = 5000

app.config.from_object(Config)


Config.configure_paths()

socket_manager = SocketManager(app=app)
socket_manager.configure_socket()

CORS(app)

app.register_blueprint(test_tab)

if __name__ == "__main__":
    socket_manager.run(port=DEFAULT_PORT, debug=True, use_reloader=False)