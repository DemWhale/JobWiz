package com.offershow.job.wiz.common.skills;

import lombok.extern.slf4j.Slf4j;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

/**
 * 简历初生成 Skill
 * 从 classpath 加载模板,指导 LLM 生成符合 schema 的简历 JSON
 */
@Slf4j
public class ResumeInitSkill {

    private static final String TEMPLATE_PATH = "skills/resume-init/template.md";

    /**
     * 获取 Skill 名称
     */
    public String getName() {
        return "resume_init";
    }

    /**
     * 加载 Skill 模板
     */
    public String loadTemplate() {
        try (InputStream is = getClass().getClassLoader().getResourceAsStream(TEMPLATE_PATH)) {
            if (is == null) {
                log.error("Skill template not found: {}", TEMPLATE_PATH);
                return getDefaultTemplate();
            }
            return new String(is.readAllBytes(), StandardCharsets.UTF_8);
        } catch (IOException e) {
            log.error("Failed to load skill template: {}", TEMPLATE_PATH, e);
            return getDefaultTemplate();
        }
    }

    /**
     * 默认模板(降级方案)
     */
    private String getDefaultTemplate() {
        return """
            # 简历初生成技能
            
            你的任务是根据用户输入的基础信息,生成一份完整的简历 JSON。
            
            ## 输出格式
            必须严格遵循以下 JSON Schema:
            ```json
            {
              "content": {
                "modules": [
                  {
                    "name": "baseinfo",
                    "modulename": "基础信息",
                    "is_open": true,
                    "child": [{...}]
                  }
                ]
              }
            }
            ```
            
            ## 要求
            1. 结合用户提供的行业信息,生成专业的工作经历和项目经历
            2. 使用具体的数据和成果描述(如"提升性能 30%")
            3. 保持语言简洁、专业
            4. 所有字段必须完整,不允许留空
            """;
    }
}
