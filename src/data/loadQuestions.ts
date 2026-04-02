import type { Question } from "./types";
import type { ModuleId } from "../config/modules";
import module1 from "./modules/chinese_philosophy_basics.json";
import module2 from "./modules/chinese_history_basics.json";
import module3 from "./modules/chinese_literature_basics.json";
import module4 from "./modules/chinese_art_basics.json";
import module5 from "./modules/ancient_chinese_science_basics.json";

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
