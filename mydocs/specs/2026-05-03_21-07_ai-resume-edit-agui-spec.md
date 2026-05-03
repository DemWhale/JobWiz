# Spec: AI 交互式简历编辑（基于 AGUI）

## 当前理解

本轮目标不是继续做传统表单编辑，而是把 `/resume/edit/:id?mode=ai` 做成一个真正可用的 AI 交互式简历编辑工作台：

- 左侧是面向编辑任务的对话区，而不是泛聊天区
- 右侧是实时渲染的简历预览区
- AI 的每次修改先落在前端草稿态，用户确认/保存后再持久化
- 后端 agent 设计必须建立在现有 AGUI 协议之上，而不是绕开 AGUI 另起一套接口

## 范围

In-Scope:
- AI 编辑模式的前端交互设计
- AI 编辑模式的前端状态流与组件边界
- 基于现有 AGUI 协议的后端 agent 架构设计
- AI 修改简历时的数据契约、事件契约和确认机制

Out-of-Scope:
- 本轮不直接实现 PDF 导出
- 本轮不设计新的非 AGUI 通讯协议
- 本轮不做多 agent 可视化编排平台
- 本轮不做复杂权限系统

## 依赖上下文

- `mydocs/specs/2026-04-12_resume-agents-agui.md`
- `mydocs/specs/2026-04-19_frontend-agui-consumer.md`
- `mydocs/specs/2026-04-19_ai-interactive-resume-creation.md`
- `mydocs/specs/2026-04-12_22-30_SpecE-简历编辑页与AI对话.md`
- 当前已存在页面：`/resume/edit/:id?mode=ai`
- 当前已存在组件：`ResumeEdit.jsx`、`AIChatPanel.tsx`、`ResumePreview.jsx`

## 产品目标

### 1. 用户体验目标

用户可以通过自然语言对话来修改简历，并且始终清楚：

- AI 正在修改哪一块
- AI 具体改了什么
- 修改是否已经正式保存
- 是否可以撤销、重试或进一步优化

### 2. 交互目标

AI 编辑模式应体现为“协作编辑”而不是“黑盒改稿”：

- 用户发出编辑意图
- AI 识别作用范围（section / item / field）
- AI 产出修改结果和改动摘要
- 右侧实时渲染修改后的草稿
- 用户继续追问、接受、撤销或保存

### 3. 技术目标

- 保持 AGUI 为唯一对话执行通道
- 前端维护草稿态，避免每个 chunk 都落库
- agent 输出可解析、可合并、可回滚的结构化修改结果

## 交互设计

### A. 总体布局

AI 编辑页维持左右双栏，但语义要和手动编辑模式明显区分：

- 左侧：`AI 编辑对话工作区`
- 右侧：`简历预览工作区`

左侧不再承担完整表单编辑职责，而是承担：

- 消息历史
- 当前编辑目标提示
- 快捷编辑动作
- AI 改动摘要
- 接受 / 撤销 / 保存

右侧承担：

- 实时渲染当前草稿简历
- 高亮本轮改动区域
- 支持点击 section 反向设置“当前编辑目标”

### B. 左侧对话区结构

建议从上到下分 4 层：

1. 会话头部
- 当前简历标题
- 当前模式：`AI 编辑`
- 保存状态：`未保存 / 保存中 / 已保存`

2. 当前编辑目标条
- 显示：`正在编辑：项目经历 / 第 2 条`
- 支持清空目标，回到“整份简历”

3. 对话消息区
- 用户消息
- AI 消息
- AI 改动摘要卡片
- 错误 / 重试卡片

4. 输入与快捷操作区
- 多行输入框
- 快捷按钮：`润色当前内容`、`更像目标岗位`、`压缩`、`量化成果`
- 发送按钮

### C. AI 消息卡片设计

AI 的一条有效编辑回复不应该只有文本，而应拆成：

1. `explanation`
- AI 做了什么、为什么这么改

2. `change summary`
- 修改 section
- 修改条目数
- 是否新增/删除/改写

3. `actions`
- `接受本次修改`
- `撤销本次修改`
- `再优化`
- `换一种表达`

### D. 右侧预览联动

右侧预览需要新增两种反馈：

1. 本轮改动高亮
- AI 修改了 `projectabout`，则右侧项目经历 section 高亮 1-2 秒

2. 当前编辑目标高亮
- 用户点中某个 section 后，左侧目标条更新为该 section
- 之后的 prompt 默认带上该上下文

### E. 保存策略

AI 编辑模式必须取消自动保存，采用“草稿先行”：

- 对话期间所有改动只更新前端 `resumeDraft`
- 点击“保存”才调用 `resumeApi.update`
- 保存前允许多轮试改和撤销

## 前端状态设计

## 核心状态

```ts
type AiEditState = {
  sessionId: string | null;
  messages: ChatMessage[];
  resumeDraft: ResumeDraft;
  persistedResume: ResumeDraft;
  activeTarget: EditTarget | null;
  pendingPatch: ResumePatch | null;
  changeHistory: ResumePatch[];
  saveStatus: 'idle' | 'dirty' | 'saving' | 'saved' | 'error';
  streamStatus: 'idle' | 'streaming' | 'waiting_confirm' | 'error';
};
```

### 状态含义

- `resumeDraft`: 当前右侧正在渲染的草稿
- `persistedResume`: 最近一次成功落库的版本
- `pendingPatch`: AI 最近一轮产出、但尚未确认的 patch
- `changeHistory`: 用户已接受的 patch 历史，用于撤销
- `activeTarget`: 当前编辑目标，例如某个 section 或某条经历

### 推荐状态流

1. 进入 AI 编辑页
- 拉取已有简历
- 初始化 `persistedResume`
- `resumeDraft = persistedResume`

2. 用户发消息
- 带上 `activeTarget`、当前草稿摘要、用户意图调用 AGUI

3. AGUI 流式返回
- 左侧显示解释文本 chunk
- 完成后返回结构化 patch
- 前端先把 patch 应用到 `resumeDraft`
- 右侧立即重渲染
- `saveStatus = dirty`

4. 用户点击保存
- 将 `resumeDraft` 持久化到后端
- 成功后 `persistedResume = resumeDraft`

## 数据契约建议

### 不建议 agent 直接输出整份简历

整份 `resumeDraft` 重新生成有两个问题：

- token 成本高
- 多轮编辑时容易把未修改部分意外覆盖

### 建议 agent 输出 `patch contract`

```json
{
  "type": "resume_patch",
  "target": {
    "section": "projectabout",
    "itemIndex": 0
  },
  "intent": "polish",
  "summary": "强化项目中的后端职责描述，并补充性能收益表达",
  "operations": [
    {
      "op": "replace",
      "path": "content.modules[name=projectabout].child[0].project_detail",
      "value": "优化后的项目描述..."
    }
  ],
  "previewText": "我已经将项目描述改得更突出后端开发和性能优化。",
  "needsConfirmation": true
}
```

### 为什么用 patch

- 前端容易局部合并
- 容易做撤销
- 容易高亮变更区域
- 更适合 AGUI 流式文本 + 完成态结构化结果的组合

## AGUI 事件契约建议

在你现有 AGUI 基础上，建议把 AI 编辑场景统一抽象为以下事件：

### 1. `text_chunk`

用途：
- 流式展示 AI 的解释、思考结果、澄清问题

前端行为：
- 追加到当前 AI 消息

### 2. `state_event`

用途：
- 通知当前阶段，如：
  - `intent_recognized`
  - `target_locked`
  - `patch_generated`
  - `awaiting_confirmation`

前端行为：
- 更新左侧状态条与按钮状态

### 3. `tool_call`

如果 agent 内部使用工具（如 schema 查找、section 定位、岗位分析工具），保留该事件用于调试或折叠展示。

前端行为：
- 默认折叠显示，不抢主视图

### 4. `complete`

用途：
- 返回本轮最终结构化 patch

建议 data:

```json
{
  "messageType": "resume_patch",
  "patch": { "...": "..." }
}
```

### 5. `error`

用途：
- 返回可展示错误

前端行为：
- 当前消息变为错误卡片，并提供“重试本轮”

## Agent 设计建议

### A. 不建议 1 个万能 Agent 裸跑

如果 AI 编辑简历完全靠一个无边界的单 Agent，自然语言效果会有，但工程上会出问题：

- 无法稳定约束输出 patch
- 不容易定位当前编辑目标
- 容易整份重写
- 不利于前端做可控联动

### B. 推荐设计：`Orchestrator + Editor Skills/Tools`

建议保留一个主入口 Agent，但内部职责分层：

1. `ResumeEditOrchestratorAgent`
- 唯一 AGUI 对外入口
- 负责理解用户意图
- 识别编辑目标
- 决定调用哪个编辑技能或工具
- 最终组装统一 patch 响应

2. `Section Edit Skills`
- `BaseInfoEditSkill`
- `SummaryEditSkill`
- `EducationEditSkill`
- `WorkEditSkill`
- `ProjectEditSkill`
- `SkillsEditSkill`

这些不一定是独立对外 Agent，可以是内部 skills 或 tools。

### C. Agent 输入上下文

AGUI `forwardedProps.agentContext` 建议扩展为：

```json
{
  "userId": 1001,
  "resumeId": 1,
  "templateId": 1,
  "currentStep": "ai_edit",
  "activeTarget": {
    "section": "projectabout",
    "itemIndex": 0
  },
  "extraParams": {
    "jobTitle": "后端开发工程师",
    "editMode": "interactive"
  }
}
```

### D. Agent 内部最小能力拆分

#### 1. Intent Router

识别用户是在做哪类操作：

- `polish`
- `rewrite`
- `shorten`
- `expand`
- `quantify`
- `append`
- `delete`
- `clarify`

#### 2. Target Resolver

识别编辑目标：

- 整份简历
- 某个 section
- 某个 item
- 某个 field

#### 3. Patch Builder

把 LLM 结果收束成结构化 patch，而不是自由文本

#### 4. Validation Layer

在返回前检查：

- patch path 是否合法
- section 是否存在
- itemIndex 是否越界
- value 是否为空或异常

### E. 是否需要多 Agent

建议结论：

- 对前端和 AGUI 暴露：`1 个主 Agent`
- 对后端内部实现：`1 个 orchestrator + 多个 skills/tools`

这样既保留统一会话体验，也保留工程可控性。

## 前后端组件建议

### 前端

- `ResumeEdit.jsx`
  - 继续作为 AI 模式入口容器

- `AIChatPanel.tsx`
  - 升级为 AI 编辑主工作区

- `ResumePreview.jsx`
  - 增加 section 高亮与 active target 能力

- 新增建议：
  - `resumePatch.ts`
  - `aiEditState.ts`
  - `changeSummary.ts`

### 后端

- `ResumeGenerateAgent` 不建议直接承担 AI 编辑
- 新增建议：
  - `ResumeEditAgent`
  - `ResumePatchDTO`
  - `ResumePatchValidator`
  - `ResumePatchApplyService`

## 实施顺序建议

### Phase 1
- 去掉 AI 编辑模式下自动保存
- 固化前端草稿态
- 左侧聊天区 + 右侧预览区跑通

### Phase 2
- 主 AGUI agent 输出结构化 patch
- 前端接 patch 并更新 `resumeDraft`
- 支持 section 高亮和改动摘要

### Phase 3
- 接受 / 撤销 / 重试
- 保存简历
- 错误恢复和多轮上下文优化

## Done Contract

本 spec 认为 AI 编辑 MVP 完成的标准是：

- 用户在 AI 模式下输入修改诉求
- AGUI agent 能识别编辑目标并返回结构化 patch
- 前端将 patch 应用到 `resumeDraft`
- 右侧实时渲染修改结果
- 左侧显示改动摘要与后续动作
- 点击保存后才落库

## Open Questions

1. patch path 是否采用字符串路径，还是直接用 `{ section, itemIndex, field }` 结构表达？
2. 用户“撤销”是撤销最后一次 accepted patch，还是撤销当前 pending patch？
3. 是否允许 agent 在一轮中同时修改多个 section？

## 当前建议答案

1. 第一版优先用结构化 target + operations，不直接暴露复杂路径语法给模型。
2. MVP 先支持“撤销当前 pending patch”和“撤销最后一次 accepted patch”两层。
3. MVP 默认限制一轮只修改一个 section，降低不可控性。

## Resume / Handoff

如果下一步进入实现，建议先做：

1. 去掉 AI 模式下自动保存
2. 固化 `resumeDraft / persistedResume / pendingPatch`
3. 升级 `AIChatPanel` 为 patch 驱动的消息与动作面板

## Change Log

- 已修改 `ResumeEdit.jsx`：移除编辑后的自动保存触发，改为仅在点击保存按钮时调用持久化。
- 已修改 `ResumeEdit.jsx`：增加 `persistedResume`、`pendingPatch` 和 `dirty saveStatus` 的前端状态骨架。
- 已修改 `AIChatPanel.tsx` 与 `AIChatPanel.css`：接入 AI 模式下的保存状态展示，为后续 patch 驱动交互做准备。
- 已修改 `ResumeEdit.jsx`、`ResumePreview.jsx`、`ResumeSectionWrapper.jsx` 与 `resume.css`：支持 AI 模式下点击右侧 section 锁定当前编辑目标，并在预览中高亮。
- 已修改 `AIChatPanel.tsx` 与 `AIChatPanel.css`：升级为 AI 编辑工作区，增加目标条、快捷动作、pending patch 卡片、接受/撤销入口。
- 已修改 `AIChatPanel.tsx`：支持从 AGUI `CUSTOM / STATE_DELTA / STATE_SNAPSHOT` 以及文本中的 JSON code block 解析 `resume_patch`。
- 已完成前端 `npm run lint` 与 `npm run build` 验证，通过。

## Validation

- 待验证：
  - 编辑简历内容时右侧仍实时渲染
  - 不再自动向后端保存
  - AI 模式左侧显示 `草稿未保存 / 保存中 / 已保存`
  - 点击右侧 section 后，左侧目标条切换并高亮当前编辑目标
  - 若 AGUI 返回结构化 patch，右侧草稿自动更新，左侧出现待确认改动卡片
