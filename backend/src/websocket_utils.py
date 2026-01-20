from flask_socketio import SocketIO

class SocketManager:
    def __init__(self, app):
        self.sio = None
        self.app = app
        self.initial_data = dict()
        self._configure_socket()
            
    def get_sio(self):
        return self.sio
            
    def run(self, **kwargs):
        if self.sio:
            self.sio.run(self.app, **kwargs)
            
    def set_initial_data(self, route, data):
        self.initial_data[route] = data
        
    def _register_handlers(self):
        @self.sio.on('connect')
        def handle_connect():
            self.app.logger.info('SUCCESSFULLY CONNECTED TO CLIENT')
            if self.initial_data:
                for route, data in self.initial_data.items():
                    self.sio.emit(route, data)
                    self.app.logger.info(f"SENT INITIAL DATA TO {route} route.")
            
        @self.sio.on('disconnect')
        def handle_disconnect():
            self.app.logger.info('CLIENT DISCONNECTED')
            
    def _configure_socket(self):
        self.sio = SocketIO(
            app=self.app,
            cors_allowed_origins='*',
        )
        self._register_handlers()