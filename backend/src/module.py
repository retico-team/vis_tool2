from dataclasses import dataclass

@dataclass
class Module:
    name: str
    base_class: str
    params: dict
    serializable_params: dict
    
    def to_dict(self):
        return {
            "name": self.name,
            "base_class": self.base_class,
            "params": self.serializable_params
        }