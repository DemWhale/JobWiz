package com.offershow.job.wiz.common.dto;

import java.io.Serial;
import java.io.Serializable;
import java.util.List;
import java.util.Map;

/**
 * 简历内容 DTO
 * 对应 data.json 中的 content 字段: { "modules": [...] }
 * 
 * 存储方式:
 * - 数据库: resume.content 字段 (TEXT JSON)
 * - 前端: resumeData.content 对象
 */
public class ResumeContentDTO implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /** 模块列表 */
    private List<Module> modules;

    /**
     * 模块定义
     */
    public record Module(
            String name,                    // baseinfo, interestabout, eduabout, workbg, projectabout, self_comment, skills, awardsabout, productabout
            String modulename,              // 模块中文名
            boolean is_open,                // 是否可见
            List<Map<String, Object>> child // 模块数据
    ) implements Serializable {}

    // ==================== Getters/Setters ====================

    public List<Module> getModules() { return modules; }
    public void setModules(List<Module> modules) { this.modules = modules; }
}
