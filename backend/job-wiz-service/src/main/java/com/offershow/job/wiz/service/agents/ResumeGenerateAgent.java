package com.offershow.job.wiz.service.agents;

import com.offershow.job.wiz.common.dto.context.AgentContext;
import com.offershow.job.wiz.common.skills.ResumeInitSkill;
import com.offershow.job.wiz.common.skills.ResumePolishSkill;
import com.offershow.job.wiz.common.tools.IndustryResumeTool;
import io.agentscope.core.ReActAgent;
import io.agentscope.core.memory.InMemoryMemory;
import io.agentscope.core.model.DashScopeChatModel;
import io.agentscope.core.skill.SkillBox;
import io.agentscope.core.tool.Toolkit;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

/**
 * 简历生成 Agent
 * 负责根据用户输入生成和优化简历
 */
@Slf4j
@Component
public class ResumeGenerateAgent {

    private final DashScopeChatModel model;
    private final IndustryResumeTool industryResumeTool;
    private final ResumeInitSkill resumeInitSkill;
    private final ResumePolishSkill resumePolishSkill;

    public ResumeGenerateAgent(
            @Qualifier("qwen35FlashModel") DashScopeChatModel model,
            IndustryResumeTool industryResumeTool) {
        this.model = model;
        this.industryResumeTool = industryResumeTool;
        this.resumeInitSkill = new ResumeInitSkill();
        this.resumePolishSkill = new ResumePolishSkill();
    }

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

        // skills
        SkillBox skillBox = new SkillBox(toolkit);
//        skillBox.registerSkill(resumeInitSkill);
//        skillBox.registerSkill(resumePolishSkill);

        // 构建系统提示
        String systemPrompt = buildSystemPrompt(context);

        // 创建 Agent
        return ReActAgent.builder()
                .name("ResumeGenerateAgent")
                .sysPrompt(systemPrompt)
                .model(model)
                .toolkit(toolkit)
                .skillBox(skillBox)
                .memory(new InMemoryMemory())
                .maxIters(10)
                .build();
    }

    /**
     * 构建系统提示词
     */
    private String buildSystemPrompt(AgentContext context) {
        StringBuilder prompt = new StringBuilder();

        // 基础角色定义
        prompt.append("""
                你是 JobWiz 的简历生成专家 Agent,负责帮助用户创建和优化专业简历。
                
                ## 核心职责
                1. 根据用户输入的基础信息,生成完整的简历 JSON
                2. 根据用户的修改诉求,润色指定模块的内容
                3. 参考行业优秀简历,提供专业建议
                
                ## 输出格式
                你必须严格输出 JSON 格式,符合以下 Schema:
                
                """);


        // 添加通用规则
        prompt.append("""
                
                ## 通用规则
                1. 使用专业、简洁的语言
                2. 量化成果(如"提升性能 30%")
                3. 突出技术深度和业务价值
                4. 严格遵循 JSON Schema,不遗漏字段
                5. 不要输出 JSON 之外的任何内容
                
                ## 当前用户信息
                - 用户 ID: """ + context.getUserId() + """
                
                - 模板 ID: """ + "99" + """
                
                """);

        return prompt.toString();
    }
}
