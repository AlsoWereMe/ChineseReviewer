import type { Question } from "./types";
import type { ModuleId } from "../config/modules";
import module1 from "./modules/philosophy.json";
import module2 from "./modules/history.json";
import module3 from "./modules/literature.json";
import module4 from "./modules/art.json";
import module5 from "./modules/science.json";

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
