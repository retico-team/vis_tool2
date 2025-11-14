from flask import Blueprint, jsonify
from runner_utils import controller
import time

timeline_tab = Blueprint('timeline', __name__)

@timeline_tab.route('/run_modules', methods=['POST'])
def run_modules():
    if controller.start():
        return jsonify({"status": "started"}), 200
    return jsonify({"status": "already running"}), 400

@timeline_tab.route('/stop_modules', methods=['POST'])
def stop_runner():
    controller.stop()
    time.sleep(5)
    return jsonify({"status": "stopping"}), 200