# DashScope 百炼模型配置 Spec

## 目标

在 `DashScopeModelConfig` 中通过 AgentScope `DashScopeChatModel.builder()` 配置两个百炼模型 Bean，供后续 Agent 和 Service 注入使用。

## 模型清单

| Bean 名称 | 模型名 | 定位 |
|-----------|--------|------|
| `qwen36PlusModel` | `qwen3.6-plus` | 效果/速度/成本均衡 |
| `qwen35FlashModel` | `qwen3.5-flash` | 速度快、成本低 |

> 模型名称中的点号不可省略或替换为连字符。

## 改动清单

### 1. `job-wiz-start/pom.xml` — 补齐 AgentScope 依赖

添加两个依赖（版本由 parent pom `dependencyManagement` 管理，不写 version）：

```xml
<dependency>
    <groupId>io.agentscope</groupId>
    <artifactId>agentscope-spring-boot-starter</artifactId>
</dependency>
<dependency>
    <groupId>io.agentscope</groupId>
    <artifactId>agentscope</artifactId>
</dependency>
```

### 2. `application.yml` — 添加 DashScope API Key 占位

在现有 `spring.profiles.active` 下方新增：

```yaml
agentscope:
  core:
    model:
      dashscope:
        api-key: your-api-key-here
```

- 放公共配置文件，跨环境通用
- 用户自行替换 `your-api-key-here` 为真实 AK

### 3. `DashScopeModelConfig.java` — 配置两个模型 Bean

```java
import io.agentscope.core.model.DashScopeChatModel;

@Configuration
public class DashScopeModelConfig {

    @Bean("qwen36PlusModel")
    public DashScopeChatModel qwen36PlusModel(
            @Value("${agentscope.core.model.dashscope.api-key}") String apiKey) {
        return DashScopeChatModel.builder()
                .apiKey(apiKey)
                .modelName("qwen3.6-plus")
                .build();
    }

    @Bean("qwen35FlashModel")
    public DashScopeChatModel qwen35FlashModel(
            @Value("${agentscope.core.model.dashscope.api-key}") String apiKey) {
        return DashScopeChatModel.builder()
                .apiKey(apiKey)
                .modelName("qwen3.5-flash")
                .build();
    }
}
```

## Done Contract

- 代码编译通过
- 两个 Bean 可通过 `@Qualifier("qwen36PlusModel")` / `@Qualifier("qwen35FlashModel")` 注入
- AK 从 YAML 读取，用户替换后即可使用
