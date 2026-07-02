# 项目初始化助手技能 — 任务

## Block 0: 规范与设计（编码前）
- [x] `doc-coauthoring`: spec.md + plan.md 已评审
- [x] `test_plan.md`: 测试场景已文档化
- [ ] `evals/evals.json`: 评估用例和断言已创建

## Block 1: 技能文件

- [ ] **Task 1.1**: 编写 SKILL.md + references + assets
  - 文件: `features/init-chat/skill/project-initializer/SKILL.md`, `references/form-fields.md`, `references/config.md`, `references/output-schema.json`, `assets/state-schema.json`
  - 构建: 验证文件存在性（`ls skill/project-initializer/`）
  - 测试: `npm test`（验证 schema JSON 合法性）

## Block 2: 评估定义

- [ ] **Task 2.1**: 创建 evals/evals.json（4 个测试用例 + 9 个断言）
  - 文件: `features/init-chat/skill/project-initializer/evals/evals.json`
  - 构建: 验证 JSON 合法性
  - 测试: `npm test`

## Block 3: 评估运行

- [ ] **Task 3.1**: 并行运行 8 个子代理（4 with skill + 4 without skill）
  - 输出: `features/init-chat/skill/project-initializer-workspace/iteration-1/`
  - 构建: 所有子代理完成
  - 测试: 检查每个输出目录存在 timing.json

- [ ] **Task 3.2**: 评分 + 聚合 + 启动评审查看器
  - 输出: `grading.json`, `benchmark.json`, `benchmark.md`
  - 构建: `python -m scripts.aggregate_benchmark`
  - 测试: benchmark.json 包含有效的 pass_rate

## Block 4: 迭代

- [ ] **Task 4.1**: 根据评估反馈优化技能
  - 文件: `features/init-chat/skill/project-initializer/SKILL.md`（优化版）
  - 构建: 验证文件存在
  - 测试: 重新运行评估（通过率提升）

## Block 5: 发布

- [ ] **Task 5.1**: 编写 takeaways.md，合入 MEMORY.md，更新 index.md、README.md、AGENTS.md
  - 文件: `specs/002-project-initializer-skill/takeaways.md`, `MEMORY.md`, `specs/index.md`, `README.md`, `AGENTS.md`
  - 构建: `npm run build`（项目根目录）
  - 测试: `npm test`
