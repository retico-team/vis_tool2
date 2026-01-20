import os
import sys
from pathlib import Path
import importlib
import pkgutil
import inspect

class Config:    
    def __init__(self):
        self.RETICO_BASE_PATH = Path.cwd().parents[2]
        self.RETICO_MODULES = set(dir.name for dir in self.RETICO_BASE_PATH.iterdir() if dir.is_dir() and dir.name.startswith('retico-'))
        self.RESTRICTED_MODULES = ['IncrementalUnit', 'object', 'Queue', 'Enum']
        self.all_modules = dict()
        self.all_classes = dict()
        self.all_base_classes = dict()
        self._configure_env()
    
    def get_all_valid_base_classes(self):
        """Return all valid imported classes with base classes from retico modules"""
        for name, class_obj in self.all_classes.items():
            base_class = inspect.getmro(class_obj)[-2].__name__ if len(inspect.getmro(class_obj)) > 2 else inspect.getmro(class_obj)[-1].__name__
            
            if base_class in self.RESTRICTED_MODULES:
                continue
            else:
                print(f"  + {name}: base class: {base_class}")
                self.all_base_classes[name] = base_class
            
        print(f"\n{'='*60}")
        print(f"\nTotal valid classes with base classes: {len(self.all_base_classes)}\n")
        print(f"{'='*60}\n")
        return self.all_base_classes
        
    
    def import_all_classes(self):
        """Import all classes from retico modules and their submodules into the caller's global namespace"""
        
        print(f"\n{'='*60}")
        print("Importing classes into caller's global namespace...")
        print(f"{'='*60}")
        
        caller_globals = inspect.currentframe().f_back.f_globals
        for name, obj in self.all_classes.items():
            caller_globals[name] = obj
            print(f"  - Imported: {name}")
                
        print(f"\nImported {len(self.all_classes)} unique classes into caller's global namespace\n")
        
    def _configure_env(self):
        """Configure environment for retico modules"""
        self._configure_paths()
        self._import_all_modules()
        self._extract_classes()
            
    def _configure_paths(self):
        """Configure sys.path with retico module paths"""
        for module in self.RETICO_MODULES:
            path = os.path.join(self.RETICO_BASE_PATH, module)
            if path not in sys.path:
                sys.path.append(path)
                
    def _import_all_modules(self):
        """Import all modules from retico packages and their submodules"""
        
        for m in self.RETICO_MODULES:
            module_name = m.replace('-', '_')
            print(f"\n{'='*60}")
            print(f"Processing: {m} (as {module_name})")
            print(f"{'='*60}")
            
            imported = self._import_submodules(module_name)
            self.all_modules.update(imported)
        
        print(f"{'='*60}\n")
        print(f"Imported {len(self.all_modules)} modules")
        print(f"{'='*60}\n")

    def _import_submodules(self, package_name):
        """Recursively import all submodules of a package"""
        try:
            package = importlib.import_module(package_name)
        except ImportError as e:
            print(f"Failed to import {package_name}: {e}")
            return {}
        
        results = {package_name: package}
        
        # Check if package has __path__ (is a package, not just a module)
        if hasattr(package, '__path__'):
            for importer, modname, ispkg in pkgutil.walk_packages(path=package.__path__, prefix=package.__name__ + '.', onerror=lambda x: None):
                try:
                    if modname == f"{package_name}.version" or modname == f"{package_name}.__init__":
                        continue
                    else:
                        module = importlib.import_module(modname)
                        results[modname] = module
                        print(f"Imported submodule: {modname}")
                except Exception as e:
                    print(f"Failed to import {modname}: {e}")
        
        return results
    
    def _extract_classes(self):
        """Extract all classes from imported modules"""
        
        for module_name, module in self.all_modules.items():
            # Get all members of the module
            for name, obj in inspect.getmembers(module):
                if inspect.isclass(obj):
                    if obj.__module__ == module_name:
                        self.all_classes[name] = obj
        
        return self.all_classes
    
config = Config()