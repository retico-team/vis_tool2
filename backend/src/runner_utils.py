import threading
import time
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, TextStreamer, TextIteratorStreamer
from configure_env import config

class RunnerController:
    def __init__(self):
        self.stop_event = threading.Event()
        self.runner_thread = None
        self.initialized = threading.Event()
        self.timeout = 180
        self.sio = None
    
    def runner(self):
        config.import_all_classes()
        
        microphone = MicrophoneModule()
        asr = WhisperASRModule(language="english")
        logger = LoggerModule(sio=self.sio, route='data')
        debug = DebugModule()
        wav2vec_asr = Wav2VecASRModule()
        # gasr = GoogleASRModule()

        ip = '127.0.0.1'
        WriterSingleton(ip=ip, port='12345')
        # reader = ReaderSingleton(ip=ip, port='12346')
        zmqwriter = ZeroMQWriter(topic='asr')
        # reader.add(topic='asr', target_iu_type=IncrementalUnit)
        
        microphone.subscribe(asr)
        microphone.subscribe(wav2vec_asr)
        # microphone.subscribe(gasr)
        
        wav2vec_asr.subscribe(zmqwriter)
        asr.subscribe(zmqwriter)
        # gasr.subscribe(zmqwriter)
        
        # reader.subscribe(debug)
        # reader.subscribe(logger)
        
        # gasr.subscribe(debug)
        asr.subscribe(debug)
        wav2vec_asr.subscribe(debug)
        
        # gasr.subscribe(logger)
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
        
    def runner2(self):
        config.import_all_classes()

        device = "cuda" if torch.cuda.is_available() else "cpu"

        """ HuggingFace Model, Tokenzier, Model """
        checkpoint = "HuggingFaceTB/SmolLM2-135M-Instruct"
        tokenizer = AutoTokenizer.from_pretrained(checkpoint, trust_remote_code=True)
        model = AutoModelForCausalLM.from_pretrained(checkpoint, trust_remote_code=True).to(device)
        streamer = TextStreamer(tokenizer, skip_prompt=True, skip_special_tokens=True)

        ip = '127.0.0.1'

        mic = MicrophoneModule()
        asr = WhisperASRModule(language='english')
        debug = DebugModule(print_payload_only=True)
        lm = HuggingfaceLM(device, tokenizer, model, streamer)
        
        WriterSingleton(ip=ip, port='12345')
        # asr_writer = ZeroMQWriter(topic='asr')
        lm_writer = ZeroMQWriter(topic='lm')
        # reader = ReaderSingleton(ip=ip, port='12346')
        # reader.add(topic='asr', target_iu_type=SpeechRecognitionIU)
        # reader.add(topic='lm', target_iu_type=TextIU)
        
        logger = LoggerModule(sio=self.sio, route='data')

        mic.subscribe(asr)
        asr.subscribe(lm)
        lm.subscribe(lm_writer)
        
        asr.subscribe(debug)
        lm.subscribe(debug)
        asr.subscribe(logger)
        lm.subscribe(logger)

        # reader.subscribe(debug)
        # reader.subscribe(logger)

        mic.run()
        asr.run()
        print(f"Hugging Face Model: {checkpoint}")
        lm.run()
        # asr_writer.run()
        lm_writer.run()
        # reader.run()
        debug.run()
        logger.run()

        print("Runner initialized...")
        self.initialized.set()
        
        self.stop_event.wait()

        mic.stop()
        asr.stop()
        lm.stop()
        # asr_writer.stop()
        lm_writer.stop()
        # reader.stop()
        debug.stop()
        logger.stop()
        
    
    def start(self):
        if not self.is_running():
            self.initialized.clear()
            self.stop_event.clear()
            self.runner_thread = threading.Thread(target=self.runner2, daemon=True, name="RunnerController")
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