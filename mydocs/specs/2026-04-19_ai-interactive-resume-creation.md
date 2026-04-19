# AI 交互式简历创建与编辑功能 Spec

## §0 Metadata

- **Created**: 2026-04-19
- **Phase**: Plan
- **Approval Status**: Pending Review
- **Task**: AI 交互式简历创建与编辑
- **Goal**: 实现基于 AGUI 协议的 AI 交互式简历创建工作流,包括分阶段信息收集、AI 生成简历 schema、实时预览、多轮修改润色
- **In-Scope**:
  1. 简历数据模型改造(对齐 data.json schema)
  2. 数据库表结构调整(resume 表字段升级)
  3. 后端 AGUI 能力完善(JsonSession、AguiWebFluxHandler、自定义 SessionManager)
  4. 简历生成 Agent 设计(systemPrompt、Skills、Tools)
  5. 前端 AI 简历创建工作流页面(分阶段、可回退、左右分栏)
  6. 前端 AGUI 协议消费能力(Chat 组件)
- **Out-of-Scope**:
  1. 简历 PDF 导出
  2. 多语言翻译
  3. 模板管理后台
  4. 简历导入(PDF/Word)

### §0.1 Context Sources

- `mydocs/prd/支持 AI 交互式的简历创建与编辑.md` — 本次需求 PRD
- `mydocs/prd/data.json` — 简历标准 schema 定义
- `mydocs/codemap/2026-04-12_22-30_简历功能前后端项目总图.md` — 现有项目架构
- `mydocs/context/2026-04-12_22-30_简历功能_context_bundle.md` — 历史上下文
- `mydocs/specs/2026-04-12_resume-agents-agui.md` — 已有 AGUI Agent Spec
- `mydocs/specs/2026-04-12_22-30_SpecB~E.md` — 已有简历功能 Specs

### §0.2 Codemap Used

- `mydocs/codemap/2026-04-12_22-30_简历功能前后端项目总图.md`

---

## §1 Research Findings

### 1.1 现状分析

#### 数据库层
- **Resume 表**: 当前 `resume_detail` 字段以 TEXT 存储 JSON,但未对齐 `data.json` 的完整 schema
- **时间字段**: 已使用 `DateTime` 类型(SQLite 用 `TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP`)
- **Resume Entity**: 包含基础字段(id, slug, title, userId, resumeDetail, visibility, locked, source, templateId 等)

#### AGUI 能力
- **现有实现**: `AgentConfiguration.java` 注册了 default/chat/calculator 三个示例 Agent
- **历史 Agent**: `AguiConfig.java` 被注释,原 baseinfo/interest/edubackground Agent 未启用
- **Session 管理**: 使用 AgentScope 内置的 `InMemoryMemory`,无持久化
- **路由配置**: `application.yml` 已配置 AGUI 路由(`/agui/run/{agentId}`)
- **缺失能力**: 无 JsonSession Bean、无自定义 AguiWebFluxHandler、无持久化 SessionManager

#### 前端能力
- **ChatWindow**: 仅展示服务卡片,无真实对话能力
- **路由**: 已有 `/resume/edit/:id` 编辑页,但无 AI 创建简历专属页面
- **AGUI 消费**: 前端未实现 AGUI SSE 流消费逻辑

#### 简历 Schema(data.json)
- **结构**: `{ content: { modules: [...] }, css_config: {...}, module_id, template_id, title, user_id, uuid }`
- **Modules**: baseinfo(基础信息), interestabout(求职意向), eduabout(教育背景), workbg(工作经历), projectabout(项目经历), self_comment(自我评价), skills(专业技能), awardsabout(荣誉奖项), productabout(作品集)
- **每个 Module**: `{ name, modulename, is_open, child: [{...具体字段}] }`

### 1.2 技术约束

- **后端**: Java 21 + Spring Boot 4.0.4 + AgentScope 1.0.11 + WebFlux
- **前端**: React 19 + Vite 8 + 纯 CSS
- **数据库**: SQLite(testing) / MySQL(pre/product),需兼容
- **AGUI 协议**: AgentScope 提供 `agentscope-agui-spring-boot-starter`
- **AgentScope Session**: 需参考 `SessionManager` 实现自定义持久化版本

### 1.3 关键发现

1. **AguiWebFluxHandler 完全自定义**: AgentScope starter 的默认 Handler 无法满足需求(自定义上下文、持久化 Session、AgentContext 注入),需完全重写
2. **JsonSession 存储**: 使用 `.cache/sessions` 目录,以 JSON 文件持久化会话状态,需实现 SessionManager 接口
3. **AgentScope Skills 原生支持**: AgentScope 1.0.11 提供 Skills 管理机制(需调研具体类名,如 `SkillManager`/`AgentSkill`),可通过 classpath 加载 skill 模板
4. **前端草稿先行策略**: 用户在 workflow 页面的一切操作均为前端缓存,仅当点击"保存简历"时才调用后端 API 持久化
5. **完整 AGUI 协议消费**: 前端需解析 SSE 事件流(text_chunk/tool_call/state_event/error),实现流式渲染

### 1.4 关键技术决策(已确认)

| 决策点 | 方案 | 理由 |
|--------|------|------|
| AguiWebFluxHandler | **完全自定义** | Starter 默认 Handler 无法实现自定义上下文、Session 持久化、AgentContext 注入 |
| Workflow 状态管理 | **前端维护** | 用户点击"保存"前所有操作均为前端缓存,降低后端压力 |
| Skills 实现 | **AgentScope 原生 Skills** | 框架已支持 Skills 仓库管理类,通过 classpath 加载模板 |
| 中间数据结构 | **LLM 提炼** | Agent 接收用户基础信息 → Skills 提供模板 → LLM 生成符合 schema 的 JSON |
| 前端 AGUI 消费 | **完整解析** | 需支持 text_chunk(流式文本)、tool_call(工具调用)、state_event(状态事件) |

---

## §2 Innovate

### 2.1 AguiWebFluxHandler 方案对比

| 方案 | 优点 | 缺点 | 决策 |
|------|------|------|------|
| **A. 完全自定义 Handler** | 完全控制请求处理流程、可注入 AgentContext、可集成自定义 SessionManager | 需手动实现 AGUI 协议编码(SSE)、工作量大 | ✅ **采用** |
| B. 扩展 Starter Handler | 工作量小、复用 AGUI 编码逻辑 | 无法完全控制上下文注入、Session 管理受限 | ❌ 不满足需求 |

### 2.2 Skills 管理方案

**AgentScope Skills 机制**:
- AgentScope 提供 `Skill` 抽象类,支持通过 `SkillManager` 注册和管理
- Skills 可加载 classpath 资源文件(如 `skills/resume-init/template.md`)
- 本次需实现 2 个 Skills:
  1. **ResumeInitSkill**(简历初生成): 接收用户基础信息 + 行业模板 → 生成完整 resumeDetail JSON
  2. **ResumePolishSkill**(简历润色): 接收指定模块修改诉求 → 输出优化后的模块 JSON

### 2.3 Session 持久化方案

**JsonSession + FileSessionManager**:
- `JsonSession`: POJO 类,存储 sessionId、agentId、messages[]、createdAt、lastAccessedAt
- `FileSessionManager`: 实现 AgentScope 的 SessionManager 接口,读写 `.cache/sessions/{sessionId}.json`
- 会话超时: 30 分钟(与 application.yml 配置一致)
- 自动清理: 启动时扫描过期 session 文件并删除*

---

## §3 Plan (Contract)

### 3.1 File Changes

#### 后端改动(按执行顺序)

| # | 文件路径 | 操作 | 说明 |
|---|---------|------|------|
| 1 | `job-wiz-common/.../agent/AgentContext.java` | 新建 | Agent 调用上下文类(包含 userId、templateId、currentStep 等) |
| 2 | `job-wiz-common/.../session/JsonSession.java` | 新建 | Session POJO(sessionId、agentId、messages[]、时间戳) |
| 3 | `job-wiz-common/.../session/FileSessionManager.java` | 新建 | 基于文件的 SessionManager 实现 |
| 4 | `job-wiz-common/.../skills/ResumeInitSkill.java` | 新建 | 简历初生成 Skill(classpath 模板加载) |
| 5 | `job-wiz-common/.../skills/ResumePolishSkill.java` | 新建 | 简历润色 Skill |
| 6 | `job-wiz-common/.../agents/ResumeGenerateAgent.java` | 新建 | 简历生成 Agent(ReActAgent builder) |
| 7 | `job-wiz-common/.../tools/IndustryResumeTool.java` | 新建 | Mock 工具: 拉起行业优秀简历 |
| 8 | `job-wiz-start/.../handler/AguiWebFluxHandler.java` | 新建 | 自定义 AGUI Handler(核心处理逻辑) |
| 9 | `job-wiz-start/.../config/CustomAguiConfig.java` | 新建 | AGUI 路由注册 + Bean 配置 |
| 10 | `job-wiz-common/src/main/resources/skills/resume-init/template.md` | 新建 | 简历初生成 Skill 模板 |
| 11 | `job-wiz-common/src/main/resources/skills/resume-polish/template.md` | 新建 | 简历润色 Skill 模板 |
| 12 | `job-wiz-start/src/main/resources/application.yml` | 修改 | 添加 session 存储路径配置 |

#### 前端改动(按执行顺序)

| # | 文件路径 | 操作 | 说明 |
|---|---------|------|------|
| 13 | `frontend/.../services/agui.js` | 新建 | AGUI 协议消费层(SSE 流解析、事件分发) |
| 14 | `frontend/.../components/AIResumeWorkflow.jsx` | 新建 | AI 简历创建工作流页面(分阶段) |
| 15 | `frontend/.../components/AIResumeWorkflow.css` | 新建 | 工作流页面样式 |
| 16 | `frontend/.../components/AIChatPanel.jsx` | 新建 | AI 对话面板(流式渲染) |
| 17 | `frontend/.../components/AIChatPanel.css` | 新建 | 对话面板样式 |
| 18 | `frontend/.../pages/Home.jsx` | 修改 | 添加 "创建简历" 卡片路由跳转 |
| 19 | `frontend/.../App.jsx` | 修改 | 添加 `/resume/ai-create` 路由 |

### 3.2 Signatures

#### 后端核心类签名

```java
// 1. AgentContext.java
public class AgentContext {
    private Long userId;
    private Long templateId;
    private String currentStep; // "collect_info" | "generate" | "polish"
    private Map<String, Object> extraParams;
}

// 2. JsonSession.java
public class JsonSession {
    private String sessionId;
    private String agentId;
    private List<AguiMessage> messages;
    private Instant createdAt;
    private Instant lastAccessedAt;
}

// 3. FileSessionManager.java
public class FileSessionManager implements SessionManager {
    private final String storagePath;
    private final Duration timeout;
    
    @Override
    public Session createSession(String agentId);
    @Override
    public Session restoreSession(String sessionId);
    @Override
    public void saveSession(Session session);
}

// 4. ResumeInitSkill.java
public class ResumeInitSkill extends AgentSkill {
    @Override
    public String getName(); // "resume_init"
    @Override
    public String loadTemplate(); // 从 classpath 加载 template.md
}

// 5. ResumePolishSkill.java
public class ResumePolishSkill extends AgentSkill {
    @Override
    public String getName(); // "resume_polish"
}

// 6. ResumeGenerateAgent.java
@Component
public class ResumeGenerateAgent {
    private final DashScopeChatModel model;
    
    public Agent create(AgentContext context);
    private String buildSystemPrompt(AgentContext context);
}

// 7. IndustryResumeTool.java
@Component
public class IndustryResumeTool {
    @Tool(description = "获取指定行业的优秀简历模板")
    public String getIndustryResume(String industry);
}

// 8. AguiWebFluxHandler.java
@Component
public class AguiWebFluxHandler {
    private final FileSessionManager sessionManager;
    private final ResumeGenerateAgent resumeGenerateAgent;
    
    public Flux<ServerSentEvent<String>> handleRun(ServerHttpRequest request);
    private Flux<AguiEvent> processInput(String agentId, AgentContext context, String userInput);
    private Flux<ServerSentEvent<String>> encodeToSse(Flux<AguiEvent> events);
}

// 9. CustomAguiConfig.java
@Configuration
public class CustomAguiConfig {
    @Bean
    public FileSessionManager fileSessionManager(@Value("${agui.session-storage-path}") String path);
    
    @Bean
    public RouterFunction<ServerResponse> aguiRoutes(AguiWebFluxHandler handler);
}
```

#### 前端核心组件签名

```javascript
// 1. agui.js - AGUI 协议消费层
export class AguiClient {
  constructor(baseUrl);
  connect(agentId, sessionId, userInput); // 返回 ReadableStream
  parseSSEEvent(chunk); // 解析 text_chunk/tool_call/state_event
}

// 2. AIResumeWorkflow.jsx - 工作流页面
export default function AIResumeWorkflow() {
  // State: currentStep, userInfo, resumeDraft, isGenerating
  // Steps: Step1_CollectInfo → Step2_AIGenerate → Step3_Polish
}

// 3. AIChatPanel.jsx - AI 对话面板
export default function AIChatPanel({ onMessage, onStreamChunk }) {
  // 流式渲染 AGUI 事件
}
```

### 3.3 Checklist

#### Phase 1: 后端 AGUI 基础设施
- [ ] 1. 创建 `AgentContext.java` (userId, templateId, currentStep, extraParams)
- [ ] 2. 创建 `JsonSession.java` (sessionId, agentId, messages, timestamps)
- [ ] 3. 创建 `FileSessionManager.java` (实现 SessionManager 接口,读写 `.cache/sessions`)
- [ ] 4. 创建 `ResumeInitSkill.java` (classpath 模板加载)
- [ ] 5. 创建 `ResumePolishSkill.java` (润色技能)
- [ ] 6. 创建 `IndustryResumeTool.java` (Mock 工具)
- [ ] 7. 创建 `ResumeGenerateAgent.java` (ReActAgent builder, systemPrompt 设计)
- [ ] 8. 创建 `AguiWebFluxHandler.java` (核心处理: 解析请求 → 构建上下文 → 创建 Agent → 恢复 Session → 运行 → SSE 编码)
- [ ] 9. 创建 `CustomAguiConfig.java` (注册 aguiRoutes + Bean 配置)
- [ ] 10. 创建 classpath skills 模板文件 (`skills/resume-init/template.md`, `skills/resume-polish/template.md`)
- [ ] 11. 修改 `application.yml` (添加 `agui.session-storage-path: .cache/sessions`)

#### Phase 2: 前端 AGUI 消费层
- [ ] 12. 创建 `agui.js` (SSE 流解析、事件类型分发、错误处理)
- [ ] 13. 创建 `AIChatPanel.jsx` + `.css` (对话 UI、流式渲染、消息历史)
- [ ] 14. 创建 `AIResumeWorkflow.jsx` + `.css` (分阶段页面: 收集信息 → AI 生成 → 润色修改)
- [ ] 15. 修改 `App.jsx` (添加 `/resume/ai-create` 路由)
- [ ] 16. 修改 `Home.jsx` ("创建简历" 卡片跳转到 `/resume/ai-create`)

#### Phase 3: 联调与测试
- [ ] 17. 端到端测试: 点击 "AI 创建简历" → 填写基础信息 → Agent 生成简历 → 前端渲染 → 润色修改 → 点击保存 → 调用 `POST /api/resume/create`
- [ ] 18. AGUI SSE 流测试: 验证 text_chunk 流式渲染、tool_call 事件处理、state_event 状态同步
- [ ] 19. Session 持久化测试: 刷新页面后恢复对话历史、超时清理机制

### 3.4 Contract Interfaces

#### 后端 API 契约

**AGUI 端点** (新增):
```
POST /agui/run/resume-generate
Headers: X-Session-Id (可选,首次不传)
Body: {
  "forwardedProps": {
    "agentContext": {
      "userId": 1001,
      "templateId": 1,
      "currentStep": "generate"
    }
  },
  "message": "帮我生成一份后端开发工程师的简历"
}
Response: SSE Stream (text_chunk/tool_call/state_event)
```

**简历保存端点** (复用现有):
```
POST /api/resume/create
Body: {
  "userId": 1001,
  "title": "张三_后端开发_2026/4/19",
  "resumeDetail": "...data.json 格式的 JSON 字符串...",
  "templateId": 1,
  "source": "AI_GENERATED"
}
```

#### 前端组件契约

**AIResumeWorkflow 状态流转**:
```
Step 1 (CollectInfo) 
  → 用户填写基础信息 
  → 点击 "AI 生成" 
  → Step 2 (AIGenerate)
  → 调用 AGUI SSE 流 
  → 实时渲染 resumeDetail JSON 
  → 显示左右分栏(表单+预览)
  → Step 3 (Polish)
  → 用户通过 AIChatPanel 发起润色请求 
  → Agent 返回修改后 JSON 
  → 用户点击 "保存简历" 
  → 调用 POST /api/resume/create
```

### 3.5 验收标准

1. **功能完整性**:
   - 用户可从首页点击 "创建简历" 进入 AI 工作流页面
   - 分阶段页面支持快速回退到任意步骤
   - AI 生成简历后,左侧表单 + 右侧实时预览正常渲染
   - 润色功能可针对指定模块修改(如 "帮我优化工作经历部分")
   - 点击 "保存" 后,简历数据持久化到数据库

2. **AGUI 协议消费**:
   - 前端完整解析 SSE 事件流(text_chunk/tool_call/state_event)
   - 流式文本渲染无卡顿、无丢字
   - Tool call 事件显示工具调用状态

3. **Session 持久化**:
   - 刷新页面后,对话历史可从 `.cache/sessions` 恢复
   - 30 分钟超时后,session 文件自动清理

4. **数据一致性**:
   - AI 生成的 resumeDetail JSON 严格符合 `data.json` schema
   - 保存后,通过 `GET /api/resume/{id}` 可完整读取

5. **性能要求**:
   - AGUI SSE 流首字节响应时间 < 2 秒
   - 前端表单渲染延迟 < 500ms (防抖优化)

---

## §4 Execute

### §4.1 Validation

*(待补充)*

---

## §5 Review

*(待补充)*

---

## §6 Change Log

| Timestamp | Phase | Change Description | Author |
|-----------|-------|--------------------|--------|
| 2026-04-19 | Research | 首版 Spec 创建,完成 Pre-Research 和 Research Findings | AI |
| 2026-04-19 | Plan | 确认 5 个关键决策、补充 Innovate 方案对比、生成完整 Plan(文件路径/签名/Checklist) | AI |
| 2026-04-19 | Execute | Phase 1 后端 AGUI 基础设施完成(11/11),编译通过 | AI |
| 2026-04-19 | Spec Split | 拆分为 3 个独立 Spec: 后端(当前)、前端消费层、联调测试 | AI |

---

## §7 Open Questions

*(已全部解决,见 §1.4 关键技术决策)*

---

## §8 Next Actions

1. **确认 Open Questions**: 与用户确认上述 5 个关键问题
2. **深化 Research**: 调研 AgentScope SessionManager 源码、Skills 机制
3. **方案创新(Innovate)**: 提出 2-3 套实现方案(完整自定义 Handler vs 扩展 starter)
4. **填充 Plan**: 明确文件路径、方法签名、原子 checklist
5. **执行 review_spec**: 评审 Spec 质量后再进入 Execute

---

## §9 Debug Log

*(待补充)*
