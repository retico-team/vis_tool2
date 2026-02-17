from flask_socketio import SocketIO
from collections import defaultdict
from configure_env import Config
from module import Module

class SocketManager(Config):
    def __init__(self):
        super().__init__()
        self.sio = None
        self.app = None
        self.initial_data = dict()
        self.connections = defaultdict(list)
        self.route = 'module'
        self.param_overrides = defaultdict(dict)
        self._set_initial_data()
        
    def get_sio(self):
        return self.sio
            
    def run(self, **kwargs):
        if self.sio:
            self.sio.run(self.app, **kwargs)
            
    def _set_initial_data(self):
        serialized_modules = {
            name: module.to_dict()
            for name, module in self.modules_with_params.items()
        }
        self.initial_data[self.route] = serialized_modules
        
        
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
            
        @self.sio.on('add_edge')
        def handle_add_edge(data):
            source = data['source'].split('-')[0]
            target = data['target'].split('-')[0]
            
            if target not in self.connections[source]:
                self.connections[source].append(target)
                self.app.logger.info(f"Updated connections: {self.connections}")
            else:
                self.app.logger.info(f"Connection from {source} to {target} already exists.")
                
        @self.sio.on('delete_node')
        def handle_delete_node(data):
            node_id = data.get('nodeId', '')
            module_name = node_id.split('-')[0]
            
            # remove all connections to and from this module
            if module_name in self.connections:
                del self.connections[module_name]
                self.app.logger.info(f"Deleted connections from {module_name}")
                
            for source, targets in self.connections.items():
                if module_name in targets:
                    targets.remove(module_name)
                    self.app.logger.info(f"Deleted connection from {source} to {module_name}")
                    
        @self.sio.on('update_params')
        def handle_update_params(data):
            node_id = data.get('nodeId', '')
            module_name = node_id.split('-')[0]
            params = data.get('params', {})
            
            if module_name in self.modules_with_params:
                self.param_overrides[module_name].update(params)
                self.app.logger.info(f"Module state {module_name}: {self.param_overrides[module_name]}")
            else:
                self.app.logger.info(f"Module {module_name} not found for updating params.")
            
    def configure_app(self, app):
        self.app = app
        self.sio = SocketIO(
            app=self.app,
            cors_allowed_origins='*',
        )
        self._register_handlers()