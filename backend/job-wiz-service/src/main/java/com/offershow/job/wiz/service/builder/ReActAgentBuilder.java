package com.offershow.job.wiz.service.builder;


import com.offershow.job.wiz.common.dto.context.AgentContext;
import com.offershow.job.wiz.service.agents.ResumeEditAgent;
import com.offershow.job.wiz.service.agents.ResumeGenerateAgent;
import com.offershow.job.wiz.service.agents.SocialSecurityAgent;
import io.agentscope.core.ReActAgent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class ReActAgentBuilder {


    @Autowired
    private ResumeGenerateAgent resumeGenerateAgent;
    @Autowired
    private ResumeEditAgent resumeEditAgent;
    @Autowired
    private SocialSecurityAgent socialSecurityAgent;

    public ReActAgent buildAgent(AgentContext context) {
        String agentId = context.getAgentId();

        if ("resume-edit".equalsIgnoreCase(agentId)) {
            return resumeEditAgent.create(context);
        }

        if ("social-security".equalsIgnoreCase(agentId)) {
            return socialSecurityAgent.create(context);
        }

        return resumeGenerateAgent.create(context);
    }

}
