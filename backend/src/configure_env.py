import os
import sys
from pathlib import Path

class Config:
    RETICO_BASE_PATH = Path.cwd().parents[2]
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