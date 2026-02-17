import threading
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, TextStreamer, TextIteratorStreamer
from websocket_utils import SocketManager
from collections import defaultdict

class RunnerController(SocketManager):
    def __init__(self):
        super().__init__()
        self.stop_event = threading.Event()
        self.runner_thread = None
        self.initialized = threading.Event()
        self.timeout = 180
    
    def runner(self):
        self._import_all_classes()
        from retico_core import network
        
        unique_modules = set(self.connections.keys())
        instantiated = defaultdict()
        
        for conns in self.connections.values():
            unique_modules.update(conns)
        
        for module in unique_modules:
            params = {}
            if module in self.modules_with_params:
                params = self.modules_with_params[module].params.copy()
            
            if module == "LoggerModule":
                params = {"sio": self.sio, "route": 'data'}
                
            elif module in self.param_overrides:
                user_params = self.param_overrides[module]
                for key, value in user_params.items():
                    if key in params:
                        original_value = params[key]
                        try:
                            if isinstance(original_value, bool):
                                params[key] = value.lower() in ('true', '1')
                            elif isinstance(original_value, int):
                                params[key] = int(value)
                            elif isinstance(original_value, float):
                                params[key] = float(value)
                            else:
                                params[key] = value
                        except (ValueError, AttributeError):
                            params[key] = value
                    else:
                        params[key] = value
                        
            try:
                instantiated[module] = self.all_classes[module](**params)
                self.app.logger.info(f"Instantiated {module} with params: {params}")
            except TypeError as e:
                self.app.logger.warning(f"Failed to instantiate {module} with params {params}: {e}")
                instantiated[module] = self.all_classes[module]()
            
        
        last_computed = None

        for module in self.connections:
            self.app.logger.info(f"Module: {module}, Connected to: {self.connections[module]}")
            for conn in self.connections[module]:
                source = instantiated[module]
                target = instantiated[conn]
                last_computed = target
                source.subscribe(target)
                self.app.logger.info(f"  - {conn}")
        
        self.app.logger.info(f"Full network {network.discover(last_computed)}")
        network_starter = instantiated[list(self.connections.keys())[0]]
        
        network.run(network_starter)
        
        self.initialized.set()
        
        self.stop_event.wait()
        
        network.stop(network_starter)
        
    def zmq_runner(self):
        self._import_all_classes()
        from retico_core import network
        
        ip2 = "127.0.0.1" #use writer's ip
        
        reader = ReaderSingleton(ip=ip2, port='6002')
        tts = GoogleTTSModule()
        speaker = StreamingSpeakerModule(frame_length=0.2)
        debug = DebugModule()
        logger = LoggerModule(sio=self.sio, route='data')
        
        reader.add(topic='asr', target_iu_type=SpeechRecognitionIU)

        reader.subscribe(debug)
        reader.subscribe(logger)
        reader.subscribe(tts)
        tts.subscribe(speaker)        
        network.run(reader)
        
        self.app.logger.info("RUNNING!")

        self.initialized.set()
        
        self.stop_event.wait()

        network.stop(reader)
    
    def start(self):
        if not self.is_running():
            self.initialized.clear()
            self.stop_event.clear()
            self.runner_thread = threading.Thread(target=self.runner, daemon=True, name="RunnerController")
            self.runner_thread.start()
            
            if self.initialized.wait(timeout=self.timeout):
                return True
            
        return False
    
    def stop(self):
        self.stop_event.set()
    
    def is_running(self):
        return self.runner_thread is not None and self.runner_thread.is_alive()
        

controller = RunnerController()