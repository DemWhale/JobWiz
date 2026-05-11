# Spec: 社保上下限实时查询 Agent

## 当前理解

用户希望基于现有 AgentScope / AG-UI 能力，新增一个可查询中国各城市社保缴费基数上下限的 agent。该 agent 必须具备 research 能力，运行时实时检索官方或可靠社保资料，并输出可溯源、尽量准确的社保上下限数据。

## 核心目标

新增一个 `social-security` AGUI agent：用户输入城市、年份或社保年度、险种诉求后，agent 通过百炼模型原生 `websearch` 能力实时检索资料，优先使用官方人社/医保/税务/公积金等站点，其次使用可信社保服务平台资料，最后给出结构化查询结果、来源链接、发布日期/适用期间、可靠性说明与不确定项。

## Research 能力调研结论

本项目最终采用“百炼模型原生 websearch + AgentScope ReActAgent”的方式提供 research 能力：

- 百炼模型支持通过 `enable_search` 打开原生联网搜索。
- 现有 `AgentScope 1.0.11` 的 `DashScopeChatModel.Builder` 已支持 `.enableSearch(Boolean)`。
- `GenerateOptions.additionalBodyParam(...)` 可把 `search_options` 透传到 DashScope 请求体 `parameters` 中。

因此 research 能力来源不是自研抓取工具，而是：

1. AgentScope 负责 agent 运行时、会话和 AGUI 输出。
2. DashScope/百炼模型负责联网搜索与检索增强。
3. Agent prompt 负责约束：优先官方来源、区分社保/医保/公积金、无可靠来源不编造数值。

本轮实现建议：

- 新增一个专用 `qwen35FlashSearchModel` Bean。
- 开启 `.enableSearch(true)`。
- 通过 `GenerateOptions.additionalBodyParam("search_options", ...)` 透传 `forced_search=true`、`enable_source=true`、`search_strategy=turbo`。
- 不新增 Maven 依赖，不引入额外 MCP、不接第三方搜索 API。

## 范围

- 新增后端 AgentScope ReActAgent，不新增前端页面。
- 复用现有 `POST /agui/run/{agentId}` 通道，目标路径为 `/agui/run/social-security`。
- 新增一个开启百炼原生 `websearch` 的模型 Bean，并由社保 Agent 使用。
- 修改 agent builder 路由，使 `agentId=social-security` 进入新 agent。
- 更新 `scripts/agui.http` 增加手工请求样例。
- 首页新增“社保查询”入口与结果展示区，用户可直接输入查询内容并查看 AGUI 流式输出。
- 不引入数据库表，不落库，不主动新增外部依赖，不修改锁文件。

## 数据口径

- 主要查询“社会保险缴费基数上限/下限”，包括养老、失业、工伤等统一社保基数；若城市医保、生育或公积金单独发布，需明确区分。
- 输出必须标注适用年度或执行期间，例如 `2025社保年度`、`2025-07 至 2026-06`。
- 若来源只提供平均工资或计算规则，允许给出推导值，但必须显式标注“按来源规则推导”，不得伪装成原文直接公布值。

## 可靠性策略

来源优先级：

1. 官方站点：人社局、社保中心、医保局、税务局、住房公积金中心、政府门户。
2. 官方转载或政策库：地方政务服务网、政策文件库。
3. 可靠社保服务平台或媒体：仅作为补充或交叉验证，不能覆盖官方口径。

Agent 输出规则：

- 至少尝试检索官方来源。
- 有官方来源时，以官方来源为准。
- 多来源冲突时，展示冲突并说明采用依据。
- 没有足够证据时，输出“未找到可靠官方数据”，并列出已查来源，不编造数值。

## 最小实现方案

1. 修改 `DashScopeModelConfig`
   - 新增 `qwen35FlashSearchModel`。
   - 开启 `enableSearch(true)`。
   - 透传 `search_options`：`forced_search=true`、`enable_source=true`、`search_strategy=turbo`。

2. 新增 `SocialSecurityAgent`
   - 使用 `qwen35FlashSearchModel`。
   - 不注册本地 research 工具，直接依赖模型原生联网。
   - system prompt 强制先联网检索后回答，禁止无来源输出数值。
   - 输出结构包含：城市、适用期、基数下限、基数上限、险种口径、来源列表、可靠性说明、更新时间。

3. 修改 `ReActAgentBuilder`
   - 当 `agentId` 为 `social-security` 时创建 `SocialSecurityAgent`。

4. 更新 `scripts/agui.http`
   - 增加查询“上海 2025 社保缴费基数上下限”的请求样例。

5. 首页接入
   - 在首页服务卡片中新增“社保查询”入口。
   - 点击入口后在首页展开一个轻量查询面板。
   - 用户输入自然语言后，前端通过现有 `aguiClient.connect()` 调用 `social-security` agent。
   - 页面流式展示摘要文本；请求完成后保留完整结果，便于人工检查。

## Done Contract

- `POST /agui/run/social-security` 能路由到新 agent。
- agent 的 prompt 和模型配置要求必须先联网检索，且回答中包含来源与可靠性说明。
- 不提供无来源的社保上下限数值。
- 至少提供一个手工 AGUI 请求样例用于验证。

## 对外接口契约

沿用现有 AGUI SSE 接口：

```http
POST /agui/run/social-security
Content-Type: application/json
```

请求体沿用 `RunAgentInput`，示例：

```json
{
  "threadId": "social-security-demo-thread",
  "runId": "social-security-demo-run",
  "messages": [
    {
      "id": "msg-1",
      "role": "user",
      "content": "查询上海 2025 社保缴费基数上下限，优先官方来源"
    }
  ],
  "forwardedProps": {
    "userId": "1",
    "agentContext": {
      "city": "上海",
      "period": "2025",
      "insuranceType": "社保"
    }
  }
}
```

Agent 最终回答必须包含一段 Markdown 面向用户的解释，并附带一个 JSON 代码块，结构如下：

```json
{
  "type": "social_security_limits",
  "city": "上海",
  "period": "2025",
  "insuranceType": "社保",
  "limits": [
    {
      "category": "养老/失业/工伤等统一社保基数",
      "lower": "数值或 unknown",
      "upper": "数值或 unknown",
      "unit": "元/月",
      "effectivePeriod": "来源中的执行期间",
      "derivation": "direct|calculated|unknown",
      "note": "必要说明"
    }
  ],
  "sources": [
    {
      "title": "来源标题",
      "url": "https://...",
      "publisher": "发布机构",
      "publishedDate": "发布日期或 unknown",
      "sourceLevel": "official|official_repost|trusted_secondary",
      "evidence": "用于支撑结论的短摘要"
    }
  ],
  "confidence": "high|medium|low",
  "warnings": []
}
```

## 首页交互契约

- 首页服务卡片新增 `社保查询` 按钮，点击后不跳路由，在当前首页展开查询区。
- 查询区包含：
  - 一个简短标题与说明
  - 一个多行输入框
  - 一个“开始查询”按钮
  - 一个流式结果面板
- 结果面板至少展示三类状态：
  - 空态：提示用户输入城市、年份、险种
  - 进行中：逐字展示 AGUI 返回文本，并显示“查询中”
  - 完成态：展示完整文本；若失败则展示错误信息
- 本轮优先展示文本流，不强制首屏解析 JSON 并做复杂结构化渲染。

## Agent Prompt 契约

`SocialSecurityAgent` system prompt 必须覆盖：

- 角色：你是中国社保缴费基数上下限 research agent。
- 必须先使用模型原生联网搜索，不得仅凭模型记忆回答。
- 优先官方来源；没有官方来源时降低置信度并说明。
- 必须区分社保、医保、公积金口径，不把公积金上下限混作社保上下限。
- 必须输出适用期、单位、来源链接、发布日期/发布机构、置信度。
- 来源冲突时列出冲突，不强行合并。
- 找不到可靠数据时返回 unknown，不编造。
- 最终必须输出用户可读摘要 + `social_security_limits` JSON。

## 风险与约束

- 模型原生联网搜索的结果质量受模型与搜索供应能力影响；实现中需要保留“未找到可靠官方数据”的安全退路。
- 如果后续需要更强可控性，可再补自研 research tool 或 MCP 搜索通道；本轮不新增依赖。
- 各地社保、医保、公积金口径可能分开发布，agent 必须区分来源与适用范围。

## 待执行文件

- `backend/job-wiz-start/src/main/java/com/offershow/job/wiz/start/config/DashScopeModelConfig.java`
- `backend/job-wiz-service/src/main/java/com/offershow/job/wiz/service/agents/SocialSecurityAgent.java`
- `backend/job-wiz-service/src/main/java/com/offershow/job/wiz/service/builder/ReActAgentBuilder.java`
- `scripts/agui.http`

## Change Log

- 已新增 `qwen35FlashSearchModel`，启用百炼原生 `enable_search`，并透传 `search_options`。
- 已新增 `SocialSecurityAgent`，使用联网搜索模型并固化社保查询 prompt 与 JSON 输出契约。
- 已修改 `ReActAgentBuilder`，支持 `agentId=social-security` 路由。
- 已更新 `scripts/agui.http`，补充社保查询 AGUI 请求样例。
- 已补充首页接入约束，要求复用现有 AGUI 客户端完成流式输出。
- 已在首页新增 `社保查询` 服务卡片，并接入首页内联查询面板与流式结果展示。

## Validation

- 已做静态检查，确认 `qwen35FlashSearchModel` Bean 名称与 `SocialSecurityAgent` 注入名一致。
- 已做静态检查，确认 `ReActAgentBuilder` 在 `social-security` 路由下返回 `SocialSecurityAgent`。
- 已做静态检查，确认 `scripts/agui.http` 中存在 `POST /agui/run/social-security` 示例。
- 已做静态检查，确认首页 `social-security` 入口、查询面板、流式文本回调和错误态文案已接通。
- 本轮未运行编译、启动或联网实测，符合当前“不要主动运行高开销命令”的约束。

## Resume / Handoff

- 若下一步需要联调，只需启动现有后端后调用 `POST /agui/run/social-security`。
- 若百炼账号侧未开通联网搜索能力，运行时可能返回普通模型回答或搜索失败，需要再检查模型配额与服务开关。
