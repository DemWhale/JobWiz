package com.offershow.job.wiz.common.skills;

import lombok.extern.slf4j.Slf4j;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

/**
 * 简历润色 Skill
 * 根据用户指定的模块和修改诉求,优化简历内容
 */
@Slf4j
public class ResumePolishSkill {

    private static final String TEMPLATE_PATH = "skills/resume-polish/template.md";

    /**
     * 获取 Skill 名称
     */
    public String getName() {
        return "resume_polish";
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
            # 简历润色技能
            
            你的任务是根据用户的修改诉求,优化指定模块的简历内容。
            
            ## 输入
            - 当前简历 JSON
            - 需要修改的模块名称(如 "workbg" 工作经历)
            - 用户的具体诉求(如 "帮我优化工作经历,突出技术领导力")
            
            ## 输出
            仅返回修改后的模块 JSON,格式如下:
            ```json
            {
              "moduleName": "workbg",
              "updatedChild": [{...}]
            }
            ```
            
            ## 润色原则
            1. 使用 STAR 法则(Situation, Task, Action, Result)重写经历描述
            2. 增加量化指标(如"处理日均 100 万交易量")
            3. 突出技术深度和业务价值
            4. 保持与用户诉求一致的风格和重点
            5. 不改变事实,仅优化表达方式
            """;
    }
}
