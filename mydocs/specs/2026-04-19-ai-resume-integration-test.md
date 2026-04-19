# AI 简历功能联调与测试 Spec

## §0 Metadata

- **Created**: 2026-04-19
- **Phase**: Plan
- **Approval Status**: Pending
- **Task**: AI 交互式简历功能端到端联调与测试
- **Dependency**: 
  - `2026-04-19_ai-interactive-resume-creation.md` (后端 AGUI 基础设施)
  - `2026-04-19_frontend-agui-consumer.md` (前端 AGUI 消费层)
- **Goal**: 验证 AI 简历创建全链路功能正常,包括 AGUI SSE 流、Session 持久化、简历保存、前后端协同
- **In-Scope**:
  1. 端到端功能测试(完整用户旅程)
  2. AGUI SSE 流测试(事件类型、流式渲染)
  3. Session 持久化测试(恢复、超时清理)
  4. 性能测试(响应时间、渲染延迟)
  5. 边界场景测试(错误处理、网络中断)
- **Out-of-Scope**:
  1. 单元测试(不在此 Spec 范围)
  2. 压力测试(并发场景)
  3. 安全测试(鉴权、XSS)

---

## §1 Research Findings

### 1.1 测试环境

**后端**:
- Spring Boot 4.0.4 + AgentScope 1.0.11
- SQLite(testing profile)
- DashScope API(qwen3.5-flash)
- 端口: 8080

**前端**:
- React 19 + Vite 8
- 开发服务器: http://localhost:5173
- 后端 API: http://localhost:8080

**测试数据**:
- 测试用户 ID: 1001
- 测试模板 ID: 1
- Session 存储: `.cache/sessions/`

### 1.2 关键测试场景

| 场景 | 优先级 | 验证点 |
|------|--------|--------|
| 完整用户旅程 | P0 | 首页 → AI创建 → 填写信息 → 生成 → 润色 → 保存 → 列表页 |
| AGUI SSE 流 | P0 | text_chunk 流式渲染、complete 事件、error 事件 |
| Session 持久化 | P1 | 刷新页面后恢复对话、30 分钟超时清理 |
| 前端草稿策略 | P1 | 未保存前草稿仅在前端、刷新后丢失 |
| 错误处理 | P1 | 网络中断、AGUI 超时、JSON 解析失败 |
| 性能 | P2 | SSE 首字节 < 2s、流式渲染 < 100ms/chunk |

### 1.3 测试工具

- **后端**: HTTP 测试文件(`scripts/agui.http`)
- **前端**: 浏览器开发者工具(Network Console)
- **手动测试**: 用户旅程走查
- **日志**: 后端日志(`logs/job-wiz.log`) + 前端 Console

---

## §2 Plan (Contract)

### 2.1 测试 Checklist

#### 测试场景 1: 端到端功能测试(完整用户旅程)

- [ ] 1.1 从首页点击"创建简历"卡片
  - **预期**: 跳转到 `/resume/ai-create`,显示 Step1_CollectInfo
  
- [ ] 1.2 填写基础信息(姓名、行业、期望职位、期望城市)
  - **预期**: 表单验证通过,按钮变为可点击
  
- [ ] 1.3 点击"AI 生成"按钮
  - **预期**: 
    - 跳转到 Step2_AIGenerate
    - 显示加载状态("正在生成简历...")
    - AGUI SSE 流开始接收数据
  
- [ ] 1.4 等待 AI 生成完成
  - **预期**:
    - 左侧表单显示生成的简历内容
    - 右侧预览实时渲染(HTML + CSS)
    - 顶部显示"生成完成"提示
  
- [ ] 1.5 检查表单数据完整性
  - **预期**: 
    - 基础信息模块完整
    - 工作经历至少 2 条
    - 项目经历至少 1 条
    - 自我评价、专业技能非空
  
- [ ] 1.6 进入润色阶段(Step3_Polish)
  - **预期**: 显示 AIChatPanel 对话面板
  
- [ ] 1.7 发送润色请求(如"帮我优化工作经历,突出技术领导力")
  - **预期**:
    - AI 流式返回修改建议
    - 左侧表单实时更新工作经历模块
    - 右侧预览同步更新
  
- [ ] 1.8 点击"保存简历"按钮
  - **预期**:
    - 调用 `POST /api/resume/create`
    - 返回 200 状态码
    - 跳转到 `/resume/list`
    - 列表页显示新创建的简历
  
- [ ] 1.9 验证数据库持久化
  - **预期**:
    - SQLite 中 `resume` 表新增记录
    - `resume_detail` 字段为完整 JSON
    - `source` 字段为 "AI_GENERATED"

#### 测试场景 2: AGUI SSE 流测试

- [ ] 2.1 验证 SSE 连接建立
  - **工具**: 浏览器 Network 面板
  - **预期**: 
    - Request URL: `http://localhost:8080/agui/run/resume-generate`
    - Request Method: POST
    - Response Headers: `Content-Type: text/event-stream`
  
- [ ] 2.2 验证事件类型
  - **预期**: 按顺序接收到以下事件:
    1. `start` - 包含 sessionId
    2. `text_chunk` - 多个,流式文本
    3. `complete` - 包含完整 JSON
    4. (可选)`tool_call` - 如果 Agent 调用了 IndustryResumeTool
  
- [ ] 2.3 验证流式渲染
  - **预期**: 
    - 文本逐字显示,无卡顿
    - 无丢字、乱码
    - HTML 标签正确渲染
  
- [ ] 2.4 测试错误事件
  - **操作**: 断开网络或停止后端
  - **预期**: 接收到 `error` 事件,显示友好提示

#### 测试场景 3: Session 持久化测试

- [ ] 3.1 验证 Session 文件创建
  - **操作**: 完成一次 AGUI 对话
  - **预期**: `.cache/sessions/` 目录下生成 `{sessionId}.json` 文件
  
- [ ] 3.2 验证 Session 内容
  - **操作**: 打开 session JSON 文件
  - **预期**: 
    - 包含 `sessionId`, `agentId`, `messages[]`
    - `messages` 数组包含用户消息和 AI 回复
  
- [ ] 3.3 验证 Session 恢复(可选,如果前端实现)
  - **操作**: 刷新页面,传递 sessionId
  - **预期**: 对话历史恢复
  
- [ ] 3.4 验证 Session 超时清理
  - **操作**: 
    1. 修改 `session-timeout-minutes` 为 1
    2. 等待 2 分钟
    3. 重启应用
  - **预期**: 过期 session 文件被删除

#### 测试场景 4: 前端草稿策略测试

- [ ] 4.1 验证草稿仅在前端
  - **操作**: 
    1. 完成 AI 生成,但不点击"保存"
    2. 检查数据库
  - **预期**: `resume` 表无新增记录
  
- [ ] 4.2 验证刷新后草稿丢失
  - **操作**: 
    1. 完成 AI 生成
    2. 刷新浏览器
  - **预期**: 回到 Step1,草稿清空
  
- [ ] 4.3 验证保存后持久化
  - **操作**: 点击"保存简历"
  - **预期**: 数据库新增记录,刷新页面后可在列表页看到

#### 测试场景 5: 错误处理测试

- [ ] 5.1 AGUI 连接超时
  - **操作**: 模拟网络延迟(Chrome DevTools > Network > Slow 3G)
  - **预期**: 显示"生成超时,请重试"提示
  
- [ ] 5.2 JSON 解析失败
  - **操作**: 修改后端返回非法 JSON
  - **预期**: 捕获解析错误,显示"生成失败,请重试"
  
- [ ] 5.3 后端服务不可用
  - **操作**: 停止 Spring Boot 应用
  - **预期**: 前端显示"服务不可用,请稍后重试"
  
- [ ] 5.4 表单验证失败
  - **操作**: 留空必填字段
  - **预期**: 显示验证错误,按钮禁用

#### 测试场景 6: 性能测试

- [ ] 6.1 SSE 首字节响应时间
  - **工具**: 浏览器 Network 面板
  - **预期**: TTFB < 2 秒
  
- [ ] 6.2 流式渲染延迟
  - **工具**: Console 日志时间戳
  - **预期**: chunk 间隔 < 100ms
  
- [ ] 6.3 表单渲染延迟
  - **工具**: React Profiler
  - **预期**: 表单首次渲染 < 500ms

### 2.2 HTTP 测试脚本

创建 `scripts/ai-resume.http` 用于后端 AGUI 端点测试:

```http
### 测试 AGUI 简历生成端点
POST http://localhost:8080/agui/run/resume-generate
Content-Type: application/json
X-Session-Id: test-session-001

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
  "message": "帮我生成一份后端开发工程师的简历,3年工作经验,熟悉 Java 和 Spring Boot"
}

### 测试润色端点
POST http://localhost:8080/agui/run/resume-generate
Content-Type: application/json
X-Session-Id: test-session-001

{
  "forwardedProps": {
    "agentContext": {
      "userId": 1001,
      "templateId": 1,
      "currentStep": "polish"
    }
  },
  "message": "帮我优化工作经历部分,突出技术领导力和量化成果"
}
```

### 2.3 验收标准

1. **P0 测试全部通过**: 场景 1(端到端)和场景 2(SSE 流)所有用例通过
2. **P1 测试通过率 ≥ 90%**: 场景 3/4/5 至少 9/10 通过
3. **P2 性能达标**: 场景 6 所有指标满足要求
4. **无阻塞性 Bug**: 无 P0/P1 级别的未修复 Bug

---

## §3 Open Questions

1. **自动化测试**: 是否需要编写 Playwright/Cypress E2E 测试脚本?还是仅手动测试?
2. **Session 恢复**: 前端是否需要实现刷新后恢复草稿的功能?(当前 Spec 定义为丢失)
3. **日志级别**: 测试期间是否需要开启 DEBUG 日志?

---

## §4 Change Log

| Timestamp | Phase | Change Description | Author |
|-----------|-------|--------------------|--------|
| 2026-04-19 | Plan | 创建联调与测试 Spec | AI |
