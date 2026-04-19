# 前端 AGUI 消费层 Spec

## §0 Metadata

- **Created**: 2026-04-19
- **Phase**: Plan
- **Approval Status**: Pending
- **Task**: 前端 AGUI 消费层实现
- **Dependency**: 依赖 `2026-04-19_ai-interactive-resume-creation.md` (后端 AGUI 基础设施已完成)
- **Goal**: 实现前端 AGUI 协议完整消费能力,包括 SSE 流解析、AI 简历创建工作流页面、流式对话面板
- **In-Scope**:
  1. `agui.js` - AGUI 协议消费层(SSE 流解析、事件分发)
  2. `AIResumeWorkflow.jsx` - AI 简历创建工作流页面(分阶段、可回退)
  3. `AIChatPanel.jsx` - AI 对话面板(流式渲染)
  4. `App.jsx` - 添加路由
  5. `Home.jsx` - 添加"创建简历"卡片跳转
- **Out-of-Scope**:
  1. 简历保存逻辑(复用现有 `POST /api/resume/create`)
  2. 简历渲染引擎(复用 Spec D 的渲染能力)
  3. 后端 AGUI 端点(已在主 Spec 完成)

---

## §1 Research Findings

### 1.1 前端现状

**技术栈**:
- React 19 + Vite 8 + React Router v7
- 纯 CSS(无 Tailwind/CSS-in-JS)
- axios(用于普通 HTTP 请求)

**现有组件**:
- `ChatWindow.jsx` - 仅展示服务卡片,无真实对话能力
- `Home.jsx` - 已实现 `onCardClick` 回调,但 `create-resume` 未绑定路由
- `App.jsx` - 现有路由: `/login`, `/profile`, `/`, `/resume/list`, `/resume/edit/:id`

**缺失能力**:
- ❌ SSE 流消费(EventSource / fetch + ReadableStream)
- ❌ AGUI 事件解析(text_chunk/tool_call/state_event)
- ❌ 分阶段工作流页面
- ❌ 流式文本渲染

### 1.2 AGUI 协议分析

**后端端点**: `POST /agui/run/resume-generate`

**请求格式**:
```json
{
  "forwardedProps": {
    "agentContext": {
      "userId": 1001,
      "templateId": 1,
      "currentStep": "generate",
      "extraParams": {
        "industry": "互联网"
      }
    }
  },
  "message": "帮我生成一份后端开发工程师的简历"
}
```

**响应格式**(SSE 事件流):
```
event: start
data: {"sessionId": "sess_xxx", "timestamp": "..."}

event: text_chunk
data: {"content": "正在生成...", "timestamp": "..."}

event: complete
data: {"sessionId": "sess_xxx", "content": "{...简历JSON...}"}

event: error
data: {"error": "...", "timestamp": "..."}
```

### 1.3 前端草稿先行策略

**核心决策**(来自主 Spec §1.4):
- 用户在 workflow 页面的一切操作均为**前端缓存**
- 仅当点击"保存简历"时才调用后端 API 持久化
- 前端需维护 `resumeDraft` 状态(符合 data.json schema)

### 1.4 技术选型

| 能力 | 方案 | 理由 |
|------|------|------|
| SSE 消费 | `fetch + ReadableStream` | 更灵活,支持 POST + 自定义 Headers |
| 状态管理 | React `useState` + `useReducer` | 无需引入 Redux/Zustand,保持轻量 |
| 流式渲染 | 逐 chunk 拼接 + `dangerouslySetInnerHTML` | AGUI 返回 HTML 格式内容 |
| 防抖保存 | `lodash/debounce` 或自定义 | 避免频繁状态更新 |

---

## §2 Plan (Contract)

### 2.1 File Changes

| # | 文件路径 | 操作 | 说明 |
|---|---------|------|------|
| 1 | `frontend/.../services/agui.js` | 新建 | AGUI 协议消费层 |
| 2 | `frontend/.../components/AIResumeWorkflow.jsx` | 新建 | 工作流主页面 |
| 3 | `frontend/.../components/AIResumeWorkflow.css` | 新建 | 工作流页面样式 |
| 4 | `frontend/.../components/AIChatPanel.jsx` | 新建 | AI 对话面板 |
| 5 | `frontend/.../components/AIChatPanel.css` | 新建 | 对话面板样式 |
| 6 | `frontend/.../App.jsx` | 修改 | 添加 `/resume/ai-create` 路由 |
| 7 | `frontend/.../pages/Home.jsx` | 修改 | "创建简历"卡片跳转 |

### 2.2 Signatures

#### agui.js - AGUI 协议消费层

```javascript
export class AguiClient {
  constructor(baseUrl = 'http://localhost:8080');
  
  /**
   * 连接 AGUI 端点,返回 SSE 流
   * @param {string} agentId - Agent ID (resume-generate)
   * @param {object} context - AgentContext (userId, templateId, currentStep)
   * @param {string} message - 用户输入
   * @param {object} callbacks - 事件回调 { onStart, onChunk, onComplete, onError }
   * @returns {string} sessionId
   */
  connect(agentId, context, message, callbacks);
  
  /**
   * 解析 SSE 事件
   */
  parseSSEEvent(chunk);
}
```

#### AIResumeWorkflow.jsx - 工作流主页面

```javascript
export default function AIResumeWorkflow() {
  // 状态
  const [currentStep, setCurrentStep] = useState('collect_info'); // collect_info | generate | polish
  const [userInfo, setUserInfo] = useState({}); // 用户填写的基础信息
  const [resumeDraft, setResumeDraft] = useState(null); // AI 生成的简历草稿
  const [sessionId, setSessionId] = useState(null); // AGUI 会话 ID
  const [isGenerating, setIsGenerating] = useState(false); // 是否正在生成
  
  // 步骤组件
  const Step1_CollectInfo = () => {...}; // 收集用户信息
  const Step2_AIGenerate = () => {...}; // AI 生成 + 左右分栏预览
  const Step3_Polish = () => {...}; // 润色修改
  
  // 核心方法
  const handleGenerate = () => {...}; // 调用 AGUI 生成简历
  const handleSave = () => {...}; // 保存简历到后端
  const handleStepBack = (targetStep) => {...}; // 回退到指定步骤
}
```

#### AIChatPanel.jsx - AI 对话面板

```javascript
export default function AIChatPanel({ onMessage, sessionId }) {
  // 状态
  const [messages, setMessages] = useState([]); // 对话历史
  const [input, setInput] = useState(''); // 输入框
  const [isStreaming, setIsStreaming] = useState(false); // 是否正在流式输出
  const [streamingContent, setStreamingContent] = useState(''); // 当前流式内容
  
  // 核心方法
  const handleSend = () => {...}; // 发送消息到 AGUI
  const handleStreamChunk = (chunk) => {...}; // 处理流式 chunk
}
```

### 2.3 Checklist

#### 任务 1: agui.js - AGUI 协议消费层
- [ ] 1a. 实现 `AguiClient` 类,封装 fetch + ReadableStream
- [ ] 1b. 实现 SSE 事件解析(`parseSSEEvent`),支持 text_chunk/tool_call/state_event/error
- [ ] 1c. 实现事件回调机制(onStart/onChunk/onComplete/onError)
- [ ] 1d. 添加错误处理和重试逻辑
- [ ] 1e. 导出单例 `aguiClient`

#### 任务 2: AIResumeWorkflow.jsx - 工作流主页面
- [ ] 2a. 实现 Step1_CollectInfo: 表单收集(姓名、行业、期望职位、期望城市)
- [ ] 2b. 实现 Step2_AIGenerate: 调用 AGUI + 左右分栏(表单 + 预览)
- [ ] 2c. 实现 Step3_Polish: 集成 AIChatPanel + 简历实时更新
- [ ] 2d. 实现步骤导航(前进/回退/快速跳转)
- [ ] 2e. 实现前端草稿状态管理(resumeDraft 符合 data.json schema)
- [ ] 2f. 实现"保存简历"按钮(调用 `POST /api/resume/create`)
- [ ] 2g. 实现加载状态、错误提示、成功反馈

#### 任务 3: AIChatPanel.jsx - AI 对话面板
- [ ] 3a. 实现对话消息列表 UI(用户消息 + AI 消息)
- [ ] 3b. 实现流式文本渲染(逐 chunk 显示)
- [ ] 3c. 实现消息输入框(支持 Enter 发送)
- [ ] 3d. 实现 AGUI 连接(传递 sessionId + 润色诉求)
- [ ] 3e. 实现解析 AGUI 返回的 JSON 并更新 resumeDraft

#### 任务 4: 路由与入口
- [ ] 4a. 修改 `App.jsx`: 添加 `/resume/ai-create` 路由
- [ ] 4b. 修改 `Home.jsx`: `create-resume` 卡片跳转到 `/resume/ai-create`

### 2.4 Contract Interfaces

#### AGUI 端点契约(复用主 Spec)

```
POST /agui/run/resume-generate
Headers: 
  Content-Type: application/json
  X-Session-Id: {sessionId} (可选,首次不传)
Body:
{
  "forwardedProps": {
    "agentContext": {
      "userId": Long,
      "templateId": Long,
      "currentStep": "generate" | "polish",
      "extraParams": { "industry": String }
    }
  },
  "message": String
}
Response: SSE Stream
```

#### 简历保存端点(复用现有)

```
POST /api/resume/create
Body:
{
  "userId": Long,
  "title": String, // "{姓名}_{岗位}_{日期}"
  "resumeDetail": String, // data.json 格式的 JSON 字符串
  "templateId": Long,
  "source": "AI_GENERATED",
  "visibility": "private",
  "language": "CHINESE"
}
```

#### 前端状态流转契约

```
Step 1 (CollectInfo)
  → 用户填写基础信息
  → 点击 "AI 生成"
  → Step 2 (AIGenerate)
  → 调用 AGUI SSE 流
  → 实时渲染 resumeDraft
  → 显示左右分栏(表单 + 预览)
  → Step 3 (Polish)
  → 用户通过 AIChatPanel 发起润色请求
  → Agent 返回修改后 JSON
  → 更新 resumeDraft
  → 用户点击 "保存简历"
  → 调用 POST /api/resume/create
  → 跳转到 /resume/list
```

### 2.5 验收标准

1. **功能完整性**:
   - 用户可从首页点击"创建简历"进入 `/resume/ai-create`
   - 分阶段页面支持快速回退到任意步骤
   - AI 生成简历后,左侧表单 + 右侧实时预览正常渲染
   - 润色功能可针对指定模块修改
   - 点击"保存"后,简历数据持久化到数据库并跳转列表页

2. **AGUI 协议消费**:
   - 前端完整解析 SSE 事件流(text_chunk/tool_call/state_event)
   - 流式文本渲染无卡顿、无丢字
   - 错误事件显示友好提示

3. **前端草稿策略**:
   - 用户在页面上的一切操作均为前端缓存
   - 刷新页面后草稿丢失(符合预期)
   - 仅点击"保存"后才调用后端 API

4. **性能要求**:
   - SSE 首字节响应时间 < 2 秒
   - 流式渲染延迟 < 100ms/chunk
   - 表单渲染延迟 < 500ms(防抖优化)

---

## §3 Open Questions

1. **简历预览组件复用**: 是否复用 Spec D 的 `ResumePreview` 组件?还是新建简化版?
2. **表单组件复用**: Step2 的左侧表单是否复用 `ResumeEdit.jsx` 的表单组件?
3. **错误边界**: AGUI 连接失败时,是否提供"重试"按钮还是引导用户重新填写?

---

## §4 Change Log

| Timestamp | Phase | Change Description | Author |
|-----------|-------|--------------------|--------|
| 2026-04-19 | Plan | 创建前端 AGUI 消费层 Spec | AI |
