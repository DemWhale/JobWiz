package com.offershow.job.wiz.service.skills;

import io.agentscope.core.skill.AgentSkill;
import io.agentscope.core.skill.SkillBox;
import io.agentscope.core.skill.repository.ClasspathSkillRepository;
import io.agentscope.core.tool.Toolkit;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.List;

@Component
public class ResumeGenerateSkillConfig {

    @Bean
    public ClasspathSkillRepository skillRepository() throws IOException {
        return new ClasspathSkillRepository("skills");
    }

    @Bean
    public SkillBox resumeGenerateSkillBox(ClasspathSkillRepository skillRepository) {
        Toolkit toolkit = new Toolkit();
        SkillBox skillBox = new SkillBox(toolkit);
        List<AgentSkill> skills = skillRepository.getAllSkills();
        for (AgentSkill skill : skills) {
            skillBox.registration().skill(skill).apply();
        }
        return skillBox;
    }
}
