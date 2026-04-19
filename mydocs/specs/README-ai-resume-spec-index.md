# AI 交互式简历功能 Spec 索引

## 概览

AI 交互式简历创建与编辑功能已按**功能维度**拆分为 3 个独立 Spec,每个 Spec 自包含、可独立执行。

---

## Spec 列表

### 1️⃣ 后端 AGUI 基础设施 (主 Spec)

**文件**: [2026-04-19_ai-interactive-resume-creation.md](./2026-04-19_ai-interactive-resume-creation.md)

**状态**: ✅ Phase 1 已完成(编译通过)

**范围**:
- AgentContext、JsonSession、FileSessionManager
- ResumeInitSkill、ResumePolishSkill、IndustryResumeTool
- ResumeGenerateAgent、AguiWebFluxHandler、CustomAguiConfig
- Classpath Skills 模板、application.yml 配置

**关键决策**:
- AguiWebFluxHandler 完全自定义
- 前端草稿先行策略
- AgentScope 原生 Skills 机制
- 完整 AGUI 协议消费

---

### 2️⃣ 前端 AGUI 消费层

**文件**: [2026-04-19_frontend-agui-consumer.md](./2026-04-19_frontend-agui-consumer.md)

**状态**: ⏳ Pending Approval

**范围**:
- `agui.js` - SSE 流解析、事件分发
- `AIResumeWorkflow.jsx` - 分阶段工作流页面
- `AIChatPanel.jsx` - 流式对话面板
- 路由配置、入口跳转

**依赖**: 后端 AGUI 基础设施(已完成)

---

### 3️⃣ 联调与测试

**文件**: [2026-04-19-ai-resume-integration-test.md](./2026-04-19-ai-resume-integration-test.md)

**状态**: ⏳ Pending Approval

**范围**:
- 端到端功能测试(6 大场景)
- AGUI SSE 流测试
- Session 持久化测试
- 错误处理测试
- 性能测试

**依赖**: 前端 AGUI 消费层 + 后端 AGUI 基础设施

---

## 依赖关系图

```
Spec 1: 后端 AGUI 基础设施 ✅
    ↓
Spec 2: 前端 AGUI 消费层 ⏳
    ↓
Spec 3: 联调与测试 ⏳
```

---

## 执行建议

### 方案 A: 顺序执行(推荐)
1. 先完成 Spec 2(前端)的编码
2. 再执行 Spec 3(联调测试)
3. 优势: 符合依赖顺序,问题早发现

### 方案 B: 并行开发
1. Spec 2 前端开发 + Spec 3 测试脚本编写同步进行
2. 前端完成后直接运行测试
3. 优势: 缩短总工期,但需协调

---

## Spec 拆分原则

✅ **功能内聚**: 每个 Spec 聚焦单一功能域  
✅ **前后端共置**: Spec 2 同时包含前后端文件变更  
✅ **上下文自包含**: 每个 Spec 嵌入需求、设计稿、约束、验收标准  
✅ **依赖显式声明**: 清晰标注前置依赖与执行顺序  
✅ **原子化 Checklist**: 每项为可验证、不可再分的实施单元  

---

## 下一步

1. **确认 Spec 2 & Spec 3**: 审阅后回复 "Plan Approved"
2. **选择执行方案**: 顺序执行 or 并行开发
3. **开始编码**: 按 Checklist 逐步推进
