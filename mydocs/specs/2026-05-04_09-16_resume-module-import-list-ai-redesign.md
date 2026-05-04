# Spec: 简历模块整体升级（导入解析 / 列表预览 / 颗粒度编辑 / Agent & AGUI / UI 重构）

## 当前理解

本轮目标是把简历模块从“能编辑的页面”升级成“交互式 AI 简历助手产品”。用户强调的核心不是堆功能，而是体验闭环：

- 用户可以导入 PDF / Word 简历，系统识别内容并用大模型提槽，创建一份结构化后一比一还原的简历。
- 简历列表和模板列表要像真实产品，支持删除，并直接展示简历/模板预览图。
- 工作经历和项目经历不能只按整个 section 锚定，要能按某一段经历锚定表单、预览和 AI 修改目标。
- AI 编辑区要有认真设计的 Resume Agent、模块 skills/tools、可见的 AGUI 思考/工具/待办过程，而不是单薄文本聊天。
- 整个简历模块 UI 需要统一重构，包括普通编辑、AI 编辑、列表、导入、聊天室和 AGUI 过程展示。

## 核心产品原则

1. 左侧 AI 聊天框始终是 AI 助手本体，不被表单挤占。
2. 用户在右侧简历上选择模块或某段经历后，围绕该目标弹出气泡/浮层动作。
3. 用户可以快速选择“改什么”和“怎么改”，AI 要先规划、执行、展示过程、给出可确认改动。
4. 普通手动编辑仍然存在，但以模块/条目级表单呈现，和 AI 编辑目标共享同一个锚点系统。
5. 导入简历的目标不是简单上传文件，而是解析、提槽、还原、确认、创建。

## 范围

In-Scope:

- PDF / Word 简历上传与文本抽取。
- 大模型结构化提槽并创建简历。
- 简历列表删除功能。
- 简历列表、模板列表预览图展示。
- 工作经历、项目经历条目级锚定。
- AI 编辑目标选择交互优化。
- Resume Agent 的 orchestrator + skills/tools 设计与实现。
- AGUI 前端展示思考、工具调用、todo list、patch 结果。
- 简历模块 UI 统一重构。

Out-of-Scope:

- 暂不做企业级文件存储和复杂权限。
- 暂不做 OCR 图片简历的完整能力；若 PDF/DOCX 无文本可抽取，先给用户明确失败提示。
- 暂不做在线支付、简历投递、外部招聘平台同步。
- 暂不做模板编辑器。

## 当前代码事实

- 前端已有：
  - `ResumeList.jsx / ResumeList.css`
  - `TemplateSelector.jsx / TemplateSelector.css`
  - `ResumeEdit.jsx / ResumeEdit.css`
  - `ResumePreview.jsx / ResumePreview.css`
  - `ResumeForm.jsx`
  - `AIChatPanel.tsx`
  - `services/api.js` 中已有 `resumeApi.delete`
- 后端已有：
  - `ResumeController.delete`
  - `ResumeService.deleteResume`
  - `ResumeEditAgent`
  - `ResumePatchDTO`
  - `resume-parse` skill 文档
  - AGUI handler 已能补发 `resume_patch`
- 重要偏差：
  - 当前 AI 编辑 agent 仍偏 prompt-only，缺少真正模块级 skill/tool 编排。
  - AGUI 前端主要展示文本，缺少思考/工具/待办/执行进度的产品化呈现。
  - 预览图没有标准化生成/缓存策略。
  - 工作/项目经历的目标粒度停留在 section 级。

## 数据与交互模型

### 1. 导入简历流程

用户路径：

1. 简历列表页点击 `导入简历`。
2. 上传 PDF / DOCX。
3. 后端抽取文本。
4. 调用 `resume-import` agent：
   - 解析简历文本。
   - 映射到当前 `content.modules` schema。
   - 保留原文顺序和尽量一比一内容。
   - 输出结构化简历 JSON、缺失字段、置信度、解析日志。
5. 前端进入“导入确认页/弹窗”：
   - 左侧显示识别摘要与缺失项。
   - 右侧实时预览结构化简历。
   - 用户确认后创建简历。

Done:

- 上传 PDF/DOCX 后能创建一份可编辑、可预览的结构化简历。
- 失败时明确告诉用户是文件格式、文本抽取还是 LLM 提槽失败。

### 2. 列表与预览图

简历列表卡片：

- 预览图在卡片上方，直接渲染该简历当前内容。
- 卡片动作：`编辑`、`AI 编辑`、`复制`（可后置）、`删除`。
- 删除需要二次确认。

模板列表卡片：

- 展示模板预览图。
- 保留模板名、风格标签、选择按钮。

预览图策略：

- MVP 优先前端渲染缩略预览，不新增图片存储字段。
- 后续可增加 `previewImageUrl` 或服务端截图缓存。

### 3. 条目级锚定

目标结构：

```ts
type EditTarget = {
  section: 'workbg' | 'projectabout' | 'eduabout' | 'skills' | 'self_comment' | ...;
  itemIndex?: number;
  field?: string;
};
```

交互：

- 点击 `工作经历` section 标题：选中整个工作经历模块。
- 点击某一段公司经历：选中 `workbg / 第 N 条`。
- 点击某一段项目经历：选中 `projectabout / 第 N 条`。
- 选中后右侧出现气泡：
  - `AI 润色`
  - `量化成果`
  - `匹配岗位`
  - `缩短`
  - `手动编辑`

Done:

- AI prompt 和 patch 都能携带 `section + itemIndex`。
- 表单浮层可以只打开该条经历，而不是整个 section。

### 4. AI 编辑 Agent 设计

对外仍然是 `resume-edit` 一个 AGUI agent。

内部改成：

- `ResumeEditOrchestratorAgent`
  - 识别目标和意图。
  - 管理 todo list。
  - 调用模块工具。
  - 组装用户可读解释与结构化 patch。
- `ResumeTargetResolverTool`
  - 根据 activeTarget、用户文本、简历 schema 找到 section/item/field。
- `ResumeTodoTool`
  - 生成本轮编辑待办：分析目标、提取原文、应用模块知识、生成 patch、校验排版。
- `ResumeSectionKnowledgeTool`
  - 返回模块编辑规则，如工作经历重成果、项目经历重技术职责和指标、自评重可信度。
- `ResumePatchBuilderTool`
  - 把编辑结果转换成 `ResumePatchDTO`。
- `ResumePatchValidatorTool`
  - 校验路径、条目索引、空值、过长文本、HTML 格式。
- `ResumeImportAgent`
  - 专门处理 PDF/DOCX 文本提槽。

模块 skills:

- `BaseInfoEditSkill`
- `WorkExperienceEditSkill`
- `ProjectExperienceEditSkill`
- `EducationEditSkill`
- `SkillsEditSkill`
- `SummaryEditSkill`
- `ResumeImportParseSkill`

### 5. AGUI 前端展示

AI 聊天消息需要展示四类内容：

- `thinking`：折叠的分析过程摘要，例如“正在判断目标模块和优化方向”。
- `tool_call`：工具调用折叠卡片，例如“读取项目经历第 2 条”、“校验 patch 路径”。
- `todo_list`：本轮编辑计划，包括进行中、完成、失败状态。
- `resume_patch`：最终改动摘要和接受/撤销按钮。

注意：

- 不展示裸 JSON。
- 不展示冗长内部 prompt。
- 工具结果默认折叠，用户想看时展开。

### 6. UI 重构方向

页面组：

- `ResumeListPage`
  - 顶部操作：新建、导入。
  - 卡片网格：预览图 + 基础信息 + 操作菜单。
- `TemplateSelector`
  - 模板预览图网格。
- `ResumeEditPage`
  - 普通编辑：左侧模块/条目导航 + 中间表单 + 右侧预览。
  - AI 编辑：左侧聊天 + 右侧预览；右侧气泡/浮层承接目标动作和手动编辑。
- `AIChatPanel`
  - 消息流、输入、快捷动作、AGUI 过程卡片。

视觉基调：

- 工具型、清爽、稳定。
- 避免大面积单一蓝色；主色保持蓝，但用中性色和少量绿色/琥珀色表达状态。
- 卡片半径不超过 8px，浮层可 12-16px。

## 实施顺序

### Phase 1: 列表和预览基础

- 简历列表增加删除。
- 简历列表直接渲染缩略预览。
- 模板列表展示模板预览。

### Phase 2: 条目级锚定

- `ResumeSectionWrapper` 支持 item 级 id。
- `ResumeExperience` 和 `ResumeProjects` 每条经历可点击。
- `EditTarget` 扩展 `itemIndex`。
- 表单浮层支持只编辑某条经历。

### Phase 3: AI 交互优化

- 右侧气泡动作重做为“目标 + 优化方式”。
- 左侧聊天展示 AGUI todo / tool / thinking 卡片。
- patch 卡片更清晰地展示改动范围和结果。

### Phase 4: Agent 工程化

- 新增 tools / skills。
- 改造 `ResumeEditAgent` 为 orchestrator。
- AGUI 事件补发 todo/tool/thinking。

### Phase 5: 导入简历

- 上传接口。
- 文本抽取。
- `ResumeImportAgent` 提槽。
- 前端导入确认和创建简历。

### Phase 6: 统一 UI 收尾与全链路自测

- 普通编辑、AI 编辑、列表、模板、导入统一视觉。
- 自测导入、删除、预览、条目锚定、AI 修改、保存。

## Done Contract

本轮大目标完成的证据：

- 用户能导入 PDF/DOCX 简历并生成结构化简历。
- 简历列表能删除简历，并展示已有简历预览。
- 模板选择能展示模板预览。
- 工作经历/项目经历能按单条经历锚定 AI 和表单。
- AI 编辑能展示待办、工具调用、思考摘要和 patch 结果。
- `ResumeEditAgent` 不再是单薄 prompt，而是有模块知识和工具编排。
- 普通编辑、AI 编辑、聊天室、AGUI 展示在视觉上统一，并通过浏览器自测。

## 风险

- 文件解析能力依赖 PDF/DOCX 文本是否可抽取；扫描件需要 OCR，MVP 暂不覆盖。
- 前端缩略预览如果直接渲染大量简历，可能有性能问题，需要虚拟化或懒加载。
- Agent 工具化需要确认 AgentScope 当前工具接口写法，避免只做 prompt 伪工具。
- 改动范围很大，必须分 phase 小步落地，每个 phase 都浏览器自测。

## Checkpoint

建议先执行 Phase 1 + Phase 2 的最小链路：

1. 简历列表删除 + 简历/模板缩略预览。
2. 工作经历/项目经历条目级点击锚定。
3. AI 气泡基于 `section + itemIndex` 更新输入框和浮层表单。

这三步完成后，再进入后端导入和 Agent 工具化，避免 UI 基座不稳时继续叠复杂能力。
