from flask import Flask
from flask_cors import CORS
from timeline import timeline_tab
from runner_utils import controller

app = Flask(__name__)
DEFAULT_PORT = 5000
CLIENT_PORT = 5173

controller.configure_app(app)

CORS(app, resources={r"/*": {"origins": f"http://localhost:{CLIENT_PORT}"}})

app.register_blueprint(timeline_tab)

if __name__ == "__main__":
    controller.run(port=DEFAULT_PORT, debug=True, use_reloader=False)