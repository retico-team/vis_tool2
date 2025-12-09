import os
import sys

class Config:
    # IMPORTANT: update this path to where your retico modules are located
    RETICO_BASE_PATH = 'C:/Users/jason/retico/'
    RETICO_MODULES = [
        'retico-googleasr',
        'retico-core',
        'retico-whisperasr',
        'retico-wav2vecasr',
        'retico-zmq',
        'retico-vision',
        'retico-huggingfacelm',
    ]
    
    @staticmethod
    def configure_paths():
        """Configure sys.path with retico module paths"""
        for module in Config.RETICO_MODULES:
            path = os.path.join(Config.RETICO_BASE_PATH, module)
            if path not in sys.path:
                sys.path.append(path)