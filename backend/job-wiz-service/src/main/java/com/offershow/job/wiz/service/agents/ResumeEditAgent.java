package com.offershow.job.wiz.service.agents;

import com.alibaba.fastjson.JSON;
import com.offershow.job.wiz.common.dto.context.AgentContext;
import com.offershow.job.wiz.common.tools.ResumeEditTool;
import io.agentscope.core.ReActAgent;
import io.agentscope.core.memory.InMemoryMemory;
import io.agentscope.core.model.DashScopeChatModel;
import io.agentscope.core.skill.SkillBox;
import io.agentscope.core.tool.ToolExecutionContext;
import io.agentscope.core.tool.Toolkit;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * AI 交互式简历编辑 Agent
 * 输出解释文本 + 结构化 resume_patch JSON
 */
@Slf4j
@Component
public class ResumeEditAgent {

    private final DashScopeChatModel model;
    private final ResumeEditTool resumeEditTool;
    private final SkillBox resumeGenerateSkillBox;

    public ResumeEditAgent(@Qualifier("qwen35FlashModel") DashScopeChatModel model,
                           ResumeEditTool resumeEditTool,
                           ObjectProvider<SkillBox> resumeGenerateSkillBoxProvider) {
        this.model = model;
        this.resumeEditTool = resumeEditTool;
        this.resumeGenerateSkillBox = resumeGenerateSkillBoxProvider.getIfAvailable();
    }

    public ReActAgent create(AgentContext context) {
        Toolkit toolkit = new Toolkit();
        toolkit.registerTool(resumeEditTool);
        ToolExecutionContext toolExecutionContext = ToolExecutionContext.builder()
                .register(context)
                .build();

        ReActAgent.Builder builder = ReActAgent.builder()
                .name("ResumeEditOrchestratorAgent")
                .sysPrompt(buildSystemPrompt(context))
                .model(model)
                .toolkit(toolkit)
                .toolExecutionContext(toolExecutionContext)
                .memory(new InMemoryMemory())
                .maxIters(8);

        if (resumeGenerateSkillBox != null) {
            builder.skillBox(resumeGenerateSkillBox);
        }

        return builder.build();
    }

    private String buildSystemPrompt(AgentContext context) {
        Map<String, Object> reqParams = context.getReqParams();
        Object activeTarget = reqParams.get("activeTarget");
        Object resumeDraft = reqParams.get("resumeDraft");
        Object persistedResume = reqParams.get("persistedResume");

        return """
                你是 JobWiz 的 ResumeEditOrchestratorAgent，当前工作模式是“交互式 AI 简历编辑”，不是整份重写。

                你的目标：
                1. 理解用户的编辑诉求
                2. 尽量只修改一个明确 section
                3. 使用工具规划本轮 todo、解析目标、读取模块知识、校验 patch
                4. 先用自然语言简洁说明你正在做什么和会改哪里
                5. 然后输出一个严格结构化的 resume_patch JSON，放在 ```json 代码块``` 中

                可用工具：
                - resolveResumeTarget：确认编辑目标。用户已经在右侧选择模块时，优先相信 activeTarget。
                - makeResumeEditTodo：生成本轮用户可见编辑计划。
                - getResumeSectionKnowledge：获取工作经历、项目经历、自评、技能等模块的编辑规则。
                - validateResumePatchPlan：输出 patch 前校验 section、itemIndex、field。
                - read_skill：读取更长的技能说明；处理简历解析、润色规则或模块知识不足时使用。

                当前上下文：
                - 用户ID：%s
                - 会话线程：%s
                - 当前编辑目标：%s

                当前草稿简历：
                %s

                最近已保存版本：
                %s

                patch 约束：
                - type 固定为 "resume_patch"
                - operations 目前仅使用 replace
                - path 格式固定为：content.modules[name=SECTION].child[INDEX].FIELD
                - 工作经历使用 section=workbg，默认字段 job_detail
                - 项目经历使用 section=projectabout，默认字段 project_detail
                - 自我评价使用 section=self_comment，默认字段 self_comment
                - 专业技能使用 section=skills，默认字段 skills
                - 一轮默认只修改一个 section；如果 activeTarget 有 itemIndex，只修改该条目
                - 若无法确定修改目标，先用自然语言追问，不要输出 patch
                - 不要返回整份简历 JSON
                - 不要向用户展示裸工具 JSON；你可以把工具结论转成一句自然语言说明

                输出格式示例：
                先输出解释：
                我已经优化了这段项目经历，更突出后端职责与性能收益。

                然后输出：
                ```json
                {
                  "type": "resume_patch",
                  "target": {
                    "section": "projectabout",
                    "itemIndex": 0
                  },
                  "summary": "强化项目经历中的后端开发职责与性能成果",
                  "previewText": "我把这段项目描述改得更偏后端开发岗位。",
                  "needsConfirmation": true,
                  "operations": [
                    {
                      "op": "replace",
                      "path": "content.modules[name=projectabout].child[0].project_detail",
                      "value": "<p>优化后的内容</p>"
                    }
                  ]
                }
                ```
                """.formatted(
                context.getUserId(),
                context.getThreadId(),
                activeTarget == null ? "整份简历" : JSON.toJSONString(activeTarget),
                JSON.toJSONString(resumeDraft),
                JSON.toJSONString(persistedResume)
        );
    }
}
