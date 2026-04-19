package com.offershow.job.wiz.service.agents;

import com.offershow.job.wiz.common.dto.context.AgentContext;
import com.offershow.job.wiz.common.skills.ResumeInitSkill;
import com.offershow.job.wiz.common.skills.ResumePolishSkill;
import com.offershow.job.wiz.common.tools.IndustryResumeTool;
import io.agentscope.core.ReActAgent;
import io.agentscope.core.memory.InMemoryMemory;
import io.agentscope.core.model.DashScopeChatModel;
import io.agentscope.core.skill.AgentSkill;
import io.agentscope.core.skill.SkillBox;
import io.agentscope.core.skill.repository.ClasspathSkillRepository;
import io.agentscope.core.tool.ToolExecutionContext;
import io.agentscope.core.tool.Toolkit;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.List;

/**
 * 简历生成 Agent
 * 负责根据用户输入生成和优化简历
 */
@Slf4j
@Component
public class ResumeGenerateAgent {

    private static final String SYSTEM_PROMPT = """
            你是 JobWiz 的简历生成专家 Agent,负责帮助用户创建和优化专业简历。.
            使用 read_skill tool 时，请提供详细的任务描述或业务逻辑，以便获取特定领域的详细信息。
            """;

    @Autowired
    @Qualifier("qwen35FlashModel")
    private DashScopeChatModel qwen35FlashModel;
    @Autowired
    private IndustryResumeTool industryResumeTool;
    @Autowired
    private SkillBox resumeGenerateSkillBox;

    /**
     * 创建 Agent 实例
     *
     * @param context Agent 上下文
     * @return ReActAgent 实例
     */
    public ReActAgent create(AgentContext context) {
        // 创建工具集
        Toolkit toolkit = new Toolkit();
        toolkit.registerTool(industryResumeTool);
        ToolExecutionContext toolExecutionContext = ToolExecutionContext.builder()
                .register(context)
                .build();
        // 创建 Agent
        return ReActAgent.builder()
                .name("ResumeGenerateAgent")
                .sysPrompt(SYSTEM_PROMPT)
                .model(qwen35FlashModel)
                .toolkit(toolkit)
                .toolExecutionContext(toolExecutionContext)
                .skillBox(resumeGenerateSkillBox)
                .memory(new InMemoryMemory())
                .maxIters(10)
                .build();
    }
}
