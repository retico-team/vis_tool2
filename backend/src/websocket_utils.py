from flask_socketio import SocketIO

class SocketManager:
    def __init__(self, app):
        self.sio = None
        self.app = app
    
    def configure_socket(self):
        self.sio = SocketIO(
            app=self.app,
            cors_allowed_origins='*',
        )
        
        self.register_handlers()
        
    def register_handlers(self):
        @self.sio.on('connect')
        def handle_connect():
            self.app.logger.info('SUCCESSFULLY CONNECTED TO CLIENT')
            
        @self.sio.on('disconnect')
        def handle_disconnect():
            self.app.logger.info('CLIENT DISCONNECTED')
            
    def get_sio(self):
        return self.sio
            
    def run(self, **kwargs):
        if self.sio:
            self.sio.run(self.app, **kwargs)