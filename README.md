# 中华文化常识复习工具

一个基于React + TypeScript + Vite的前端单页应用，用于学习港澳台研究生统考的中华文化常识部分。

## 功能特性

- **模块化学习**：按知识模块进入练习。
- **双学习模式**：支持随机复习（可指定 10~30 题）和顺序浏览全题作答。
- **题号显示与跳转**：顺序模式下可查看数据库题号，并按题号或顺序号跳题。
- **考试模式**：先选卷再开考，每套试卷固定 20 题，考试过程中不显示对错与解析，提交后统一出分并查看错题分析。
- **错题本**：自动记录错题，支持按模块筛选和一键清空。
- **题库总览**：查看全部题目并按关键词搜索题干、选项、解析。
- **重新选择模式**：练习结束后返回模式选择，不再使用旧的“再来一次不重复”机制。

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
考试题库通过 `src/data/loadExams.ts` 从 `src/data/exams/` 目录加载。

### 单题数据结构

```json
{
  "id": "mX_qYY",
  "module": "XX",
  "question": "以下哪位思想家提出“仁者爱人”？",
  "options": ["老子", "孔子", "墨子", "韩非子"],
  "correct_answer": "B",
  "description": "“仁者爱人”是儒家核心思想之一，典出孔子。"
}
```

字段要求：

- `id`: 题目唯一 ID（建议全局唯一）
- `module`: 所属模块 ID（如 `中国艺术常识`）
- `question`: 题干
- `options`: 四个选项（按 A/B/C/D 顺序）
- `correct_answer`: 正确答案（`A` / `B` / `C` / `D`）
- `description`: 题目解析

### 考试试卷规则

- 目录：`src/data/exams/`
- 文件：每个 JSON 文件对应一套试卷，文件名会作为试卷编号
- 结构：与单题数据结构一致（题目数组）
- 约束：
  - 每套试卷必须固定 20 题
  - 每题必须是 4 个选项
  - `correct_answer` 必须为 `A/B/C/D`

考试流程说明：

1. 用户在考试列表选择试卷并开始考试
2. 考试过程中仅记录作答，不显示正误和解析
3. 用户可随时跳转任意题号，答完 20 题后才可提交
4. 提交后统一显示分数、正确/错误统计与错题解析

## 模块配置

模块定义位于 `src/config/modules.ts`，包括：

- 模块ID
- 模块中文名称（用于首页、学习页和错题页展示）

如需新增/调整模块，请同步更新：

- `src/config/modules.ts`
- `src/data/loadQuestions.ts` 中的模块数据映射

## 错题存储

错题保存在浏览器 `localStorage`。

所以，清除浏览器站点数据后，这些信息会被清空。

## 部署

仓库已包含 GitHub Pages 工作流，详见 `.github/workflows/deploy.yml`：

部署前请确认：

1. 仓库已启用 GitHub Pages
2. Source选择GitHub Actions
3. `npm run build`在本地可成功通过

## 项目结构

```text
src/
  components/      # 通用组件（如确认弹窗）
  config/          # 模块配置
  data/            # 题目类型与加载逻辑
  lib/             # 题目抽样、进度存储、错题存储
  pages/           # 页面：主页/学习/错题/题库
```
