package com.offershow.job.wiz.common.agents;

import io.agentscope.core.ReActAgent;
import io.agentscope.core.agent.Agent;
import io.agentscope.core.memory.InMemoryMemory;
import io.agentscope.core.model.DashScopeChatModel;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

/**
 * 简历求职意向修改 Agent
 */
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
