export const MODULE_IDS = [
  "module_1",
  "module_2",
  "module_3",
  "module_4",
  "module_5",
] as const;

export type ModuleId = (typeof MODULE_IDS)[number];

export const MODULE_LABELS: Record<ModuleId, string> = {
  module_1: "中国哲学常识",
  module_2: "中国历史学常识",
  module_3: "中国文学常识",
  module_4: "中国艺术常识",
  module_5: "中国古代科技常识",
};

export function isModuleId(s: string): s is ModuleId {
  return (MODULE_IDS as readonly string[]).includes(s);
}
