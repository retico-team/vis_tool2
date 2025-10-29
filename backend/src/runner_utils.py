import os, sys
import threading
import time

class RunnerController:
    def __init__(self):
        self.stop_event = threading.Event()
        self.runner_thread = None
        self.initialized = threading.Event()
        self.timeout = 30
    
    def runner(self):
        
        import retico_core
        from retico_core.debug import DebugModule
        from retico_whisperasr.whisperasr import WhisperASRModule
        from retico_zmq.zmq import WriterSingleton, ZeroMQWriter
        from retico_core.audio import MicrophoneModule
        from retico_wav2vecasr.wav2vecasr import Wav2VecASRModule
        
        
        microphone = MicrophoneModule()
        asr = WhisperASRModule(language="english")
        debug = DebugModule(print_payload_only=False)
        wav2vec_asr = Wav2VecASRModule()

        ip = '127.0.0.1'
        WriterSingleton(ip=ip, port='6002')
        zmqwriter = ZeroMQWriter(topic='asr')
        
        microphone.subscribe(asr)
        microphone.subscribe(wav2vec_asr)
        asr.subscribe(zmqwriter)
        zmqwriter.subscribe(debug)
        asr.subscribe(debug)

        microphone.run()
        wav2vec_asr.run()
        asr.run()
        zmqwriter.run()
        debug.run()
        
        self.initialized.set()
        
        self.stop_event.wait()
        
        asr.stop()
        wav2vec_asr.stop()
        microphone.stop()
        zmqwriter.stop()
        debug.stop()
        
    
    def start(self):
        if self.runner_thread is None or not self.runner_thread.is_alive():
            self.initialized.clear()
            self.stop_event.clear()
            self.runner_thread = threading.Thread(target=self.runner, daemon=True)
            self.runner_thread.start()
            
            if self.initialized.wait(timeout=self.timeout):
                return True
            
        return False
    
    def stop(self):
        self.stop_event.set()
    
    def is_running(self):
        return self.runner_thread is not None and self.runner_thread.is_alive()
    
controller = RunnerController()