package com.offershow.job.wiz.service.builder;


import com.offershow.job.wiz.common.dto.context.AgentContext;
import com.offershow.job.wiz.service.agents.ResumeGenerateAgent;
import io.agentscope.core.ReActAgent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class ReActAgentBuilder {


    @Autowired
    private ResumeGenerateAgent resumeGenerateAgent;

    public ReActAgent buildAgent(AgentContext context) {
        String agentId = context.getAgentId();

        return resumeGenerateAgent.create(context);
    }

}
