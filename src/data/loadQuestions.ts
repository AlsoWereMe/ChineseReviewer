import type { Question } from "./types";
import type { ModuleId } from "../config/modules";
import module1 from "./modules/module_1.json";
import module2 from "./modules/module_2.json";
import module3 from "./modules/module_3.json";
import module4 from "./modules/module_4.json";
import module5 from "./modules/module_5.json";

const BY_MODULE: Record<ModuleId, Question[]> = {
  module_1: module1 as Question[],
  module_2: module2 as Question[],
  module_3: module3 as Question[],
  module_4: module4 as Question[],
  module_5: module5 as Question[],
};

export function getQuestionsForModule(moduleId: ModuleId): Question[] {
  return BY_MODULE[moduleId] ?? [];
}
