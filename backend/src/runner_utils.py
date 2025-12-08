import threading

class RunnerController:
    def __init__(self):
        self.stop_event = threading.Event()
        self.runner_thread = None
        self.initialized = threading.Event()
        self.timeout = 180
        self.sio = None
    
    def runner(self):
        
        import retico_core
        from retico_core.debug import DebugModule, LoggerModule
        from retico_whisperasr.whisperasr import WhisperASRModule
        from retico_googleasr.googleasr import GoogleASRModule
        from retico_zmq.zmq import WriterSingleton, ZeroMQWriter, ReaderSingleton
        from retico_core.audio import MicrophoneModule
        from retico_wav2vecasr.wav2vecasr import Wav2VecASRModule
        
        
        microphone = MicrophoneModule()
        # gasr = GoogleASRModule()
        asr = WhisperASRModule(language="english")
        logger = LoggerModule(sio=self.sio, route='data')
        debug = DebugModule()
        wav2vec_asr = Wav2VecASRModule()

        ip = '127.0.0.1'
        WriterSingleton(ip=ip, port='6002')
        # reader = ReaderSingleton(ip=ip, port='6002')
        zmqwriter = ZeroMQWriter(topic='asr')
        # reader.add(topic='asr', target_iu_type=IncrementalUnit)
        
        microphone.subscribe(asr)
        microphone.subscribe(wav2vec_asr)
        # microphone.subscribe(gasr)
        wav2vec_asr.subscribe(zmqwriter)
        asr.subscribe(zmqwriter)
        
        # reader.subscribe(logger)
        # reader.subscribe(debug)
        # gasr.subscribe(logger)
        asr.subscribe(debug)
        wav2vec_asr.subscribe(debug)
        
        asr.subscribe(logger)
        wav2vec_asr.subscribe(logger)

        microphone.run()
        # gasr.run()
        wav2vec_asr.run()
        asr.run()
        zmqwriter.run()
        # reader.run()
        debug.run()
        logger.run()
        
        self.initialized.set()
        
        self.stop_event.wait()
        
        asr.stop()
        # gasr.stop()
        wav2vec_asr.stop()
        microphone.stop()
        zmqwriter.stop()
        # reader.stop()
        logger.stop()
        debug.stop()
        
    
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
    
    def configure_socket(self, sio):
        self.sio = sio
        
    
controller = RunnerController()