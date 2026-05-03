package com.offershow.job.wiz.service.agents;

import com.alibaba.fastjson.JSON;
import com.offershow.job.wiz.common.dto.context.AgentContext;
import io.agentscope.core.ReActAgent;
import io.agentscope.core.memory.InMemoryMemory;
import io.agentscope.core.model.DashScopeChatModel;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
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

    public ResumeEditAgent(@Qualifier("qwen35FlashModel") DashScopeChatModel model) {
        this.model = model;
    }

    public ReActAgent create(AgentContext context) {
        return ReActAgent.builder()
                .name("ResumeEditAgent")
                .sysPrompt(buildSystemPrompt(context))
                .model(model)
                .memory(new InMemoryMemory())
                .maxIters(4)
                .build();
    }

    private String buildSystemPrompt(AgentContext context) {
        Map<String, Object> reqParams = context.getReqParams();
        Object activeTarget = reqParams.get("activeTarget");
        Object resumeDraft = reqParams.get("resumeDraft");
        Object persistedResume = reqParams.get("persistedResume");

        return """
                你是 JobWiz 的 AI 简历编辑助手，当前工作模式是“交互式编辑”，不是整份重写。

                你的目标：
                1. 理解用户的编辑诉求
                2. 尽量只修改一个明确 section
                3. 先用自然语言简洁说明你做了什么
                4. 然后输出一个严格结构化的 resume_patch JSON，放在 ```json 代码块``` 中

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
                - 一轮默认只修改一个 section
                - 若无法确定修改目标，先用自然语言追问，不要输出 patch
                - 不要返回整份简历 JSON

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
