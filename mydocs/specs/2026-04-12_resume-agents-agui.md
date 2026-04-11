# 简历修改 ReActAgent 与 AGUI 接口 Spec

## 目标

创建三个 ReActAgent（基础信息修改 + 求职意向修改 + 教育背景修改），并通过 AGUI 协议暴露给前端接入。

## 关键设计决策

1. **Agent 数量**：3 个独立 Agent，职责单一
2. **路由方式**：URL path 路由（`/agui/run/baseinfo` 等）
3. **运行模式**：纯对话，无工具调用，返回 JSON 格式建议
4. **模型选择**：`qwen3.5-flash`（快速、低成本，方便后续自行调整）
5. **无状态设计**：每次请求创建全新 Agent 实例，确保对话隔离
6. **依赖管理**：统一在 `job-wiz-common` 模块管理
7. **配置类命名**：`AguiConfig`（遵循 AGUI 协议命名规范）
8. **测试策略**：单一 `agui.http` 文件集中测试所有 Agent
9. **Model Bean 复用**：通过 `@Qualifier("qwen35FlashModel")` 注入现有 Bean，不重复创建模型实例

---

## 技术方案

### 1. 项目结构

```
backend/job-wiz-common/src/main/java/com/offershow/job/wiz/common/
└── agents/
    ├── BaseInfoAgent.java        # 基础信息修改 Agent
    ├── InterestAgent.java        # 求职意向修改 Agent
    └── EduBackgroundAgent.java   # 教育背景修改 Agent

backend/job-wiz-service/src/main/java/com/offershow/job/wiz/service/
└── config/
    └── AguiConfig.java           # AGUI 注册配置

backend/job-wiz-start/src/main/resources/
└── application.yml               # 添加 AGUI 配置

test/agui/
└── agui.http                     # AGUI 接口测试（所有 Agent）
```

### 2. 依赖添加

**job-wiz-common/pom.xml** 添加（统一管理）：
```xml
<dependency>
    <groupId>io.agentscope</groupId>
    <artifactId>agentscope-agui-spring-boot-starter</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-webflux</artifactId>
</dependency>
```

> **注意**：依赖统一在 common 模块管理，service 和 start 模块无需重复添加。

### 3. Agent 实现

> **关键设计**：
> 1. 所有 Agent 使用 `qwen3.5-flash` 模型，纯对话模式，无工具调用
> 2. **无状态设计**：每次调用 `create()` 方法返回全新的 Agent 实例，确保对话隔离
> 3. Agent 放在 `job-wiz-common` 模块，供全项目复用
> 4. **复用现有 Model Bean**：通过构造函数注入 `qwen35FlashModel`，不重复创建模型实例

#### 3.1 BaseInfoAgent（基础信息）

```java
package com.offershow.job.wiz.common.agents;

import io.agentscope.core.agent.Agent;
import io.agentscope.core.agent.ReActAgent;
import io.agentscope.core.memory.InMemoryMemory;
import io.agentscope.core.model.DashScopeChatModel;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

@Component
public class BaseInfoAgent {
    
    private final DashScopeChatModel model;
    
    public BaseInfoAgent(@Qualifier("qwen35FlashModel") DashScopeChatModel model) {
        this.model = model;
    }
    
    /**
     * 每次调用创建全新的无状态 Agent 实例（复用 model Bean）
     */
    public Agent create() {
        return ReActAgent.builder()
                .name("BaseInfoAgent")
                .sysPrompt(buildSysPrompt())
                .model(model)
                .memory(new InMemoryMemory())
                .maxIters(1)
                .build();
    }
    
    private String buildSysPrompt() {
        return """
            你是一个简历基础信息修改助手。
            
            你可以协助用户修改以下字段：
            - nickname（姓名/昵称）
            - school（学校）
            - major（专业）
            - gender（性别）
            - graduation_date（毕业时间）
            - email（邮箱）
            
            规则：
            1. 与用户确认要修改的具体内容
            2. 返回 JSON 格式的修改结果，例如：{"nickname": "张三", "email": "zhangsan@example.com"}
            3. 只包含用户要求修改的字段
            4. 保持友好、专业的对话风格
            """;
    }
}
```

#### 3.2 InterestAgent（求职意向）

```java
package com.offershow.job.wiz.common.agents;

import io.agentscope.core.agent.Agent;
import io.agentscope.core.agent.ReActAgent;
import io.agentscope.core.memory.InMemoryMemory;
import io.agentscope.core.model.DashScopeChatModel;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

@Component
public class InterestAgent {
    
    private final DashScopeChatModel model;
    
    public InterestAgent(@Qualifier("qwen35FlashModel") DashScopeChatModel model) {
        this.model = model;
    }
    
    /**
     * 每次调用创建全新的无状态 Agent 实例（复用 model Bean）
     */
    public Agent create() {
        return ReActAgent.builder()
                .name("InterestAgent")
                .sysPrompt(buildSysPrompt())
                .model(model)
                .memory(new InMemoryMemory())
                .maxIters(1)
                .build();
    }
    
    private String buildSysPrompt() {
        return """
            你是一个简历求职意向修改助手。
            
            你可以协助用户修改以下字段：
            - target_position（目标职位）
            - target_city（目标城市）
            - description（个人简介/求职意向描述）
            
            规则：
            1. 与用户确认要修改的具体内容
            2. 返回 JSON 格式的修改结果，例如：{"target_position": "Java开发工程师", "target_city": "杭州"}
            3. 只包含用户要求修改的字段
            4. 保持友好、专业的对话风格
            """;
    }
}
```

#### 3.3 EduBackgroundAgent（教育背景）

```java
package com.offershow.job.wiz.common.agents;

import io.agentscope.core.agent.Agent;
import io.agentscope.core.agent.ReActAgent;
import io.agentscope.core.memory.InMemoryMemory;
import io.agentscope.core.model.DashScopeChatModel;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

@Component
public class EduBackgroundAgent {
    
    private final DashScopeChatModel model;
    
    public EduBackgroundAgent(@Qualifier("qwen35FlashModel") DashScopeChatModel model) {
        this.model = model;
    }
    
    /**
     * 每次调用创建全新的无状态 Agent 实例（复用 model Bean）
     */
    public Agent create() {
        return ReActAgent.builder()
                .name("EduBackgroundAgent")
                .sysPrompt(buildSysPrompt())
                .model(model)
                .memory(new InMemoryMemory())
                .maxIters(1)
                .build();
    }
    
    private String buildSysPrompt() {
        return """
            你是一个简历教育背景修改助手。
            
            你可以协助用户修改以下字段：
            - school（学校名称）
            - education（学历层次：本科/硕士/博士等）
            - major（专业）
            - graduation_date（毕业时间）
            
            规则：
            1. 与用户确认要修改的具体内容
            2. 返回 JSON 格式的修改结果，例如：{"school": "浙江大学", "education": "硕士"}
            3. 只包含用户要求修改的字段
            4. 保持友好、专业的对话风格
            """;
    }
}
```

### 4. AGUI 配置

```java
package com.offershow.job.wiz.service.config;

import com.offershow.job.wiz.common.agents.BaseInfoAgent;
import com.offershow.job.wiz.common.agents.EduBackgroundAgent;
import com.offershow.job.wiz.common.agents.InterestAgent;
import io.agentscope.agui.AguiAgentRegistryCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AguiConfig {
    
    private final BaseInfoAgent baseInfoAgent;
    private final InterestAgent interestAgent;
    private final EduBackgroundAgent eduBackgroundAgent;
    
    public AguiConfig(BaseInfoAgent baseInfoAgent, 
                      InterestAgent interestAgent,
                      EduBackgroundAgent eduBackgroundAgent) {
        this.baseInfoAgent = baseInfoAgent;
        this.interestAgent = interestAgent;
        this.eduBackgroundAgent = eduBackgroundAgent;
    }
    
    @Bean
    public AguiAgentRegistryCustomizer aguiAgentRegistryCustomizer() {
        AguiAgentRegistryCustomizer customizer = registry -> {
            // 注册基础信息修改 Agent（每次请求创建新实例，无状态）
            registry.registerFactory("baseinfo", baseInfoAgent::create);
            
            // 注册求职意向修改 Agent
            registry.registerFactory("interest", interestAgent::create);
            
            // 注册教育背景修改 Agent
            registry.registerFactory("edubackground", eduBackgroundAgent::create);
        };
        
        System.out.println("Registered agents with AG-UI registry: baseinfo, interest, edubackground");
        System.out.println("Access agents via:");
        System.out.println("  - POST /agui/run/baseinfo (基础信息修改)");
        System.out.println("  - POST /agui/run/interest (求职意向修改)");
        System.out.println("  - POST /agui/run/edubackground (教育背景修改)");
        System.out.println("  - POST /agui/run with X-Agent-Id header");
        
        return customizer;
    }
}
```

### 5. application.yml 配置

在 `job-wiz-start/src/main/resources/application.yml` 添加：

```yaml
agentscope:
  agui:
    path-prefix: /agui
    cors-enabled: true
    server-side-memory: true
```

### 6. HTTP 测试文件

#### agui.http

```http
### 测试基础信息修改 Agent
POST http://localhost:8080/agui/run/baseinfo
Content-Type: application/json

{
  "threadId": "test-baseinfo-{{{{$timestamp}}}}",
  "runId": "run-baseinfo-{{{{$timestamp}}}}",
  "messages": [
    {
      "id": "msg-1",
      "role": "user",
      "content": "把姓名改为张三，邮箱改为 zhangsan@example.com"
    }
  ]
}

### 测试求职意向修改 Agent
POST http://localhost:8080/agui/run/interest
Content-Type: application/json

{
  "threadId": "test-interest-{{{{$timestamp}}}}",
  "runId": "run-interest-{{{{$timestamp}}}}",
  "messages": [
    {
      "id": "msg-1",
      "role": "user",
      "content": "我想找Java开发工程师的工作，目标城市是杭州"
    }
  ]
}

### 测试教育背景修改 Agent
POST http://localhost:8080/agui/run/edubackground
Content-Type: application/json

{
  "threadId": "test-edubackground-{{{{$timestamp}}}}",
  "runId": "run-edubackground-{{{{$timestamp}}}}",
  "messages": [
    {
      "id": "msg-1",
      "role": "user",
      "content": "我的学校是浙江大学，学历是硕士"
    }
  ]
}
```

---

## 改动清单

### 文件修改

| 文件 | 操作 | 说明 |
|------|------|------|
| `job-wiz-common/pom.xml` | 修改 | 添加 agui-spring-boot-starter + webflux 依赖 |
| `job-wiz-common/.../agents/BaseInfoAgent.java` | 新建 | 基础信息修改 Agent |
| `job-wiz-common/.../agents/InterestAgent.java` | 新建 | 求职意向修改 Agent |
| `job-wiz-common/.../agents/EduBackgroundAgent.java` | 新建 | 教育背景修改 Agent |
| `job-wiz-service/.../config/AguiConfig.java` | 新建 | AGUI 注册配置 |
| `job-wiz-start/.../application.yml` | 修改 | 添加 AGUI 配置 |
| `test/agui/agui.http` | 新建 | AGUI 接口测试文件 |

### 方法签名

```java
// BaseInfoAgent.java (common 模块)
@Component
public class BaseInfoAgent {
    public BaseInfoAgent(@Qualifier("qwen35FlashModel") DashScopeChatModel model);
    public Agent create();  // 每次调用返回全新实例，复用 model Bean
}

// InterestAgent.java (common 模块)
@Component
public class InterestAgent {
    public InterestAgent(@Qualifier("qwen35FlashModel") DashScopeChatModel model);
    public Agent create();  // 每次调用返回全新实例，复用 model Bean
}

// EduBackgroundAgent.java (common 模块)
@Component
public class EduBackgroundAgent {
    public EduBackgroundAgent(@Qualifier("qwen35FlashModel") DashScopeChatModel model);
    public Agent create();  // 每次调用返回全新实例，复用 model Bean
}

// AguiConfig.java (service 模块)
@Configuration
public class AguiConfig {
    public AguiConfig(BaseInfoAgent, InterestAgent, EduBackgroundAgent);
    public AguiAgentRegistryCustomizer aguiAgentRegistryCustomizer();
}
```

---

## 验收标准

1. **编译通过**：`mvn clean compile` 无错误
2. **启动成功**：Spring Boot 应用正常启动，控制台打印 AGUI 注册信息
3. **AGUI 端点可用**：`POST /agui/run/baseinfo` 返回正确响应
4. **三个 Agent 注册成功**：可通过 URL path 路由访问
   - `POST /agui/run/baseinfo`
   - `POST /agui/run/interest`
   - `POST /agui/run/edubackground`
5. **无状态验证**：每次请求创建新 Agent 实例，对话互不干扰
6. **HTTP 测试通过**：test/agui/http 下的测试文件可正常执行

---

## Open Questions

~~1. **Agent 数量**：确认是 2 个还是 3 个？（✅ 已确认：3 个）~~
~~2. **Agent 路由方式**：前端如何指定使用哪个 Agent？（✅ 已确认：URL path 路由）~~
~~3. **是否需要工具调用**：Agent 是否需要直接操作数据库？（✅ 已确认：纯对话，不需要）~~
~~4. **模型选择**：使用 `qwen3.6-plus` 还是 `qwen3.5-flash`？（✅ 已确认：qwen3.5-flash）~~

---

## Next Actions

1. ✅ 用户确认 Open Questions
2. ⏳ 用户审批 Plan
3. 进入 Execute 阶段
