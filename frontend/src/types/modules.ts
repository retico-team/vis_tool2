import type { DefaultCardProps } from '@/types/allTypes';

type ModuleTypes = "Producing Modules" | "Consuming Modules" | "Trigger Modules";

interface Module {
    id: string,
    name: string;
    description: string;
    type: ModuleTypes;
    enabled?: boolean;
    link?: Module;
}

interface ModuleCardProps extends DefaultCardProps {
  module: Module;
}

interface ModuleCategoryProps extends DefaultCardProps {
  type: ModuleTypes;
  modules: Module[];
}

interface ModuleData {
    name: string;
    base_class: string;
    params: string[];
}

interface ModulesMap {
    [moduleName: string]: ModuleData;
}