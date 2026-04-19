package com.offershow.job.wiz.service.agent;


import com.offershow.job.wiz.common.agents.ResumeGenerateAgent;
import com.offershow.job.wiz.common.dto.context.AgentContext;
import io.agentscope.core.ReActAgent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class ReActAgentBuilder {


    @Autowired
    private ResumeGenerateAgent resumeGenerateAgent;

    public ReActAgent buildAgent(AgentContext context) {
        return resumeGenerateAgent.create(context);
    }

}
