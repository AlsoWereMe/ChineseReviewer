# 中华文化常识复习工具

一个基于React + TypeScript + Vite的前端单页应用，用于学习港澳台研究生统考的中华文化常识部分。

## 功能特性

- **模块化学习**：按知识模块进入练习。
- **随机抽题练习**：每轮学习会随机抽取20道题目，答题后显示正误和解析。
- **学习进度保护**：离开学习页时可选择保存进度，下次可继续。
- **错题本**：自动记录错题，支持按模块筛选和一键清空。
- **题库总览**：查看全部题目并按关键词搜索题干、选项、解析。
- **循环练习机制**：单模块的所有题目作答完毕后，自动重置做题记录并开启新一轮答题。

## 技术栈

- React 19
- TypeScript 5
- React Router 7
- Vite 6

## 本地开发

### 1) 安装依赖

```bash
npm install
```

### 2) 启动开发环境

```bash
npm run dev
```

默认会启动本地开发服务器`http://localhost:5173`。

### 3) 构建生产版本

```bash
npm run build
```

构建产物在 `dist/` 目录。

### 4) 本地预览构建结果

```bash
npm run preview
```

## 题库数据说明

项目通过`src/data/loadQuestions.ts`加载模块题库，题目类型定义在 `src/data/types.ts`。

### 单题数据结构

```json
{
  "id": "mX_qYY",
  "module": "module_X",
  "question": "以下哪位思想家提出“仁者爱人”？",
  "options": ["老子", "孔子", "墨子", "韩非子"],
  "correct_answer": "B",
  "description": "“仁者爱人”是儒家核心思想之一，典出孔子。"
}
```

字段要求：

- `id`: 题目唯一 ID（建议全局唯一）
- `module`: 所属模块 ID（如 `module_1`）
- `question`: 题干
- `options`: 四个选项（按 A/B/C/D 顺序）
- `correct_answer`: 正确答案（`A` / `B` / `C` / `D`）
- `description`: 题目解析

## 模块配置

模块定义位于 `src/config/modules.ts`，包括：

- 模块ID（`module_1` ~ `module_5`）
- 模块中文名称（用于首页、学习页和错题页展示）

如需新增/调整模块，请同步更新：

- `src/config/modules.ts`
- `src/data/loadQuestions.ts` 中的模块数据映射

## 进度与错题存储

本项目所有学习状态均保存在浏览器 `localStorage`，不依赖后端：

- 学习草稿进度
- 主动保存的学习进度
- 已练习题目记录（用于避免重复）
- 错题本数据

清除浏览器站点数据后，以上信息会被清空。

## 部署

仓库已包含 GitHub Pages 工作流，详见 `.github/workflows/deploy.yml`：

- 推送到 `main` 自动触发构建与部署
- Vite `base` 会根据 `GITHUB_REPOSITORY` 自动适配仓库名

部署前请确认：

1. 仓库已启用 GitHub Pages
2. Source选择GitHub Actions
3. `npm run build`在本地可成功通过

## 项目结构（核心目录）

```text
src/
  components/      # 通用组件（如确认弹窗）
  config/          # 模块配置
  data/            # 题目类型与加载逻辑
  lib/             # 题目抽样、进度存储、错题存储
  pages/           # 页面：主页/学习/错题/题库
```
