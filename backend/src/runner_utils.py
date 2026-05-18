import threading
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
            obj = module.split('-')[0]
            params = {}
            
            if obj in self.modules_with_params:
                params = self.modules_with_params[obj].params.copy()
            
            if self.all_classes[obj].__name__ == "LoggerModule":
                params = {"sio": self.sio, "route": 'data'}
                
            elif obj in self.param_overrides:
                user_params = self.param_overrides[obj]
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
                            elif value in self.all_classes.keys():
                                params[key] = self.all_classes[value]
                            else:
                                params[key] = value
                        except (ValueError, AttributeError):
                            params[key] = value
                    else:
                        params[key] = value
                 
            try:
                print(f"Instantiating {self.all_classes[obj].__name__} with params: {params}")
                instantiated[module] = self.all_classes[obj](**params)
            except TypeError as e:
                self.app.logger.warning(f"Failed to instantiate {self.all_classes[obj].__name__} with params {params}: {e}")
                instantiated[module] = self.all_classes[obj]()
        last_computed = None

        for module in self.connections:
            mod_split = module.split('-')
            mod_name = f'{instantiated[module].__class__.__name__}-{mod_split[1]}' if len(mod_split) > 1 else instantiated[module].__class__.__name__
            for conn in self.connections[module]:
                source = instantiated[module]
                target = instantiated[conn]
                last_computed = target
                source.subscribe(target)
                conn_split = conn.split('-')
                conn_name = f'{instantiated[conn].__class__.__name__}-{conn_split[1]}' if len(conn_split) > 1 else instantiated[conn].__class__.__name__
                self.app.logger.info(f" {mod_name} -> {conn_name}")
        
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
        
        reader = ZMQReaderModule(ip=ip2, port='6002', topic='asr')
        tts = GoogleTTSModule()
        speaker = StreamingSpeakerModule(frame_length=0.2)
        debug = DebugModule()
        logger = LoggerModule(sio=self.sio, route='data')

        reader.subscribe(debug)
        reader.subscribe(logger)
        reader.subscribe(tts)
        tts.subscribe(speaker)        
        network.run(reader)
        
        self.app.logger.info("RUNNING!")

        self.initialized.set()
        
        self.stop_event.wait()

        network.stop(reader)
        
    def custom(self):
        pass
        # self._import_all_classes()
        
        # import os
        # import sys
        # import torch
        # from transformers import AutoModelForCausalLM, AutoTokenizer, TextStreamer, TextIteratorStreamer

        # device = "cuda" if torch.cuda.is_available() else "cpu"

        # """ HuggingFace Model, Tokenzier, Model """
        # checkpoint = "HuggingFaceTB/SmolLM2-135M-Instruct"
        # tokenizer = AutoTokenizer.from_pretrained(checkpoint,  trust_remote_code=True)
        # model = AutoModelForCausalLM.from_pretrained(checkpoint,  trust_remote_code=True).to(device)
        # streamer = TextStreamer(tokenizer, skip_prompt=True, skip_special_tokens=True)

        # mic = MicrophoneModule()
        # asr = WhisperASRModule(language='english')
        # debug = DebugModule(print_payload_only=True)
        # lm = HuggingfaceLM(device, tokenizer, model, streamer)
        # logger = LoggerModule(sio=self.sio, route='data')

        # mic.subscribe(asr)
        # asr.subscribe(debug)
        # asr.subscribe(lm)
        # lm.subscribe(logger)

        # mic.run()
        # asr.run()
        # debug.run()
        # print(f"Hugging Face Model: {checkpoint}")
        # lm.run()
        # logger.run()

        # self.initialized.set()
        
        # self.stop_event.wait()

        # mic.stop()
        # asr.stop()
        # lm.stop()
        # debug.stop()
        # logger.stop()
        
    
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