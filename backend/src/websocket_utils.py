from flask_socketio import SocketIO, emit
from flask import current_app

class SocketManager:
    def __init__(self, app):
        self.socketio = None
        self.app = app
    
    def configure_socket(self):
        self.socketio = SocketIO(
            app=self.app,
            cors_allowed_origins='*',
        )
        
        self.register_handlers()
        
    def register_handlers(self):
        @self.socketio.on('connect')
        def handle_connect():
            self.app.logger.info('SUCCESSFULLY CONNECTED TO CLIENT')
            
        @self.socketio.on('disconnect')
        def handle_disconnect():
            self.app.logger.info('CLIENT DISCONNECTED')
            
    def run(self, **kwargs):
        if self.socketio:
            self.socketio.run(self.app, **kwargs)