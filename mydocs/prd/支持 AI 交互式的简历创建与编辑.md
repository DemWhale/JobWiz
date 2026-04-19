下面只列举修改列表
# 简历模型修改
1. 简历的模型做一下修改,一个简历的标准 schema 为 ./data.json
2. 对应的简历数据表需要做修改，以使用上面的数据格式，并为后续的简历渲染做准备

# 创表SQL语句调整
1. 为保障后续的 CURD 都正常，现将所有表中的对于时间的字段都写为 DateTime 类型，即便 SQLlite 不支持，你也要如此创建表结果，只有这样 SQLlite 在插入数据的时候才会 使用 yyyymmdd hhmmss 的字符串格式存储数据

# 完善AGUI的后端能力，依赖 agentScope 来实现
1. 服务端 session 管理： 新建一个 JsonSession 的 Bean，使用我们的.cache/sessions 做存储地
2. 注册 AGUI 路由，aguiRoutes，来控制 Flux 的路由，到我们的 Handler
3. 新建 AguiWebFluxHandler，来承接aguiRoutes的实际处理诉求
- 实现上需参考 AguiWebFluxHandler，不同的点在于 ProcessInput 的时候，需要我们按照1. 确认 agentid 2 构建上下文(需要在 common 模块下新增 AgentContext 类，以后续集中管理 agent 的调用时的额外上下文) 3. 创建 agent，也就是 agentBuild 器，对于我们这里，我们需要一个创建简历的 agent 4 创建会话管理器，该会话管理器，同样参考 SessionManager 来实现一个自定义的，做到每次 agui 请求过来，并到了 hander 方法后，能够为每一次的对话构建一个 sessionManagr 5 恢复对话状态 6 运行 agent，得到 agui 事件流 7 编码为 sse，并持久化记忆

# 前端需要制定一套具备兼容AGUI协议的AI对话能力，并消费后端接口
1. 前端新建 chat 相关能力，与后端的 AI Agent 对话交流，后端后返回标准的 AGUI 协议内容

# AI创建简历能力重构
1. AI 创建简历能力改版，用户点击后，进入一个 新页面
2. 新页面为一个 workflow 类型的页面，分阶段执行，并支持快速回退至某某一步
3. 第一步：收集用户的基础信息，以为需要 AI 创建简历，则我们需要快速解析或者是提炼用户的基础，也即简历 schema的填充
4. 用户点击 AI 创建后，将信息给我们简历生成 agent，让简历生成 agent 来生成简历的标准 schema，生成好 JSON 结构后，需要开始渲染我们的简历内容，依旧分为左右两部分，左为简历表单，右为实时简历渲染结果（结合了 html 后的）
5. 简历初步生成完毕后，势必需要结合 agent 能力做重复修改及 review


# 简历生成Agent详细设计
1. systemPmt 你来设计一下
2. 需要具备的工具为 拉起 xx 行业的优秀简历，这个先 mock 即可
3. 需要具备的 Skills 为 简历初生成 skills(其实就是一个提槽 skills)，我们使用 classpath 来管理 skills 即可，该 skill的任务为在有限的信息中结合行业优秀简历生成初始简历内容，需符合我们的 schema
4. 简历润色 skill，用户会提及某某模块需要润色，则我们应该额外提供简历润色的 skills，此技能需结合用户的诉求，来灵活调整简历内容。


