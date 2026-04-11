package com.offershow.job.wiz.common.agents;

import io.agentscope.core.agent.Agent;
import io.agentscope.core.ReActAgent;
import io.agentscope.core.memory.InMemoryMemory;
import io.agentscope.core.model.DashScopeChatModel;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

/**
 * 简历教育背景修改 Agent
 */
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
