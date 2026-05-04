package com.offershow.job.wiz.common.tools;

import io.agentscope.core.tool.Tool;
import io.agentscope.core.tool.ToolParam;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * 简历编辑 Agent 的模块知识与规划工具。
 */
@Slf4j
@Component
public class ResumeEditTool {

    @Tool(name = "resolveResumeTarget",
            description = "根据用户需求和当前选中目标,确认本轮应该修改的简历模块、条目和字段")
    public String resolveResumeTarget(
            @ToolParam(name = "activeTarget", description = "前端当前选中的目标 JSON,可能为空") String activeTarget,
            @ToolParam(name = "userRequest", description = "用户本轮修改诉求") String userRequest) {
        log.info("Resolving resume edit target. activeTarget={}, userRequest={}", activeTarget, userRequest);
        return """
                {
                  "decision": "prefer_active_target",
                  "activeTarget": %s,
                  "fallbackRules": [
                    "用户提到公司、岗位、职责、成果时优先定位 workbg",
                    "用户提到项目、系统、技术方案时优先定位 projectabout",
                    "用户提到简介、自我评价、优势时优先定位 self_comment",
                    "用户提到技能栈、关键词时优先定位 skills",
                    "如果无法唯一定位,先追问,不要生成 patch"
                  ]
                }
                """.formatted(activeTarget == null || activeTarget.isBlank() ? "null" : activeTarget);
    }

    @Tool(name = "makeResumeEditTodo",
            description = "为一次简历修改生成用户可见的执行待办")
    public String makeResumeEditTodo(
            @ToolParam(name = "targetLabel", description = "目标模块名称,如 工作经历 第2条") String targetLabel,
            @ToolParam(name = "intent", description = "用户希望如何优化") String intent) {
        return """
                {
                  "type": "todo_list",
                  "title": "本轮编辑计划",
                  "items": [
                    {"label": "确认编辑目标: %s", "status": "done"},
                    {"label": "读取原始内容并识别可强化信息", "status": "done"},
                    {"label": "套用模块编辑规则: %s", "status": "doing"},
                    {"label": "生成最小范围 patch", "status": "pending"},
                    {"label": "校验字段路径、条目索引和排版长度", "status": "pending"}
                  ]
                }
                """.formatted(emptyToDefault(targetLabel, "当前目标"), emptyToDefault(intent, "通用润色"));
    }

    @Tool(name = "getResumeSectionKnowledge",
            description = "获取某个简历模块的编辑策略和字段约束")
    public String getResumeSectionKnowledge(
            @ToolParam(name = "section", description = "模块 name,如 workbg、projectabout、self_comment、skills") String section) {
        String normalized = section == null ? "" : section.toLowerCase();
        return switch (normalized) {
            case "workbg" -> """
                    {
                      "section": "workbg",
                      "field": "job_detail",
                      "strategy": "工作经历按单段经历改写,优先保留公司/岗位/时间;正文突出职责、动作、技术栈、量化结果。",
                      "rules": [
                        "不要编造公司、职位、时间",
                        "每段用 2-4 个 <p> 呈现",
                        "优先把泛泛职责改成 动作 + 技术/方法 + 指标/业务价值",
                        "如果用户要求压缩,保留最强 2 个成果"
                      ]
                    }
                    """;
            case "projectabout" -> """
                    {
                      "section": "projectabout",
                      "field": "project_detail",
                      "strategy": "项目经历强调项目背景、个人角色、技术方案、结果指标,避免写成团队介绍。",
                      "rules": [
                        "保留项目名称、角色、时间",
                        "用技术方案和结果闭环表达贡献",
                        "不要把不确定指标写死,可使用保守表达",
                        "每段用 <p> 标签"
                      ]
                    }
                    """;
            case "self_comment" -> """
                    {
                      "section": "self_comment",
                      "field": "self_comment",
                      "strategy": "自我评价要可信、克制、和岗位匹配,用能力画像替代空泛形容词。",
                      "rules": [
                        "减少热情、认真、负责等空词",
                        "强调技术领域、协作方式、业务结果",
                        "控制在 80-150 字",
                        "使用 <p> 标签"
                      ]
                    }
                    """;
            case "skills" -> """
                    {
                      "section": "skills",
                      "field": "skills",
                      "strategy": "技能模块按能力域分组,让关键词可扫描。",
                      "rules": [
                        "按语言/框架/数据库/工程化/云原生等分类",
                        "避免堆砌重复关键词",
                        "优先匹配目标岗位 JD 关键词",
                        "使用 <p> 或 <br> 保持紧凑"
                      ]
                    }
                    """;
            case "eduabout" -> """
                    {
                      "section": "eduabout",
                      "strategy": "教育背景以事实为主,只在必要时补充课程、荣誉或研究方向。",
                      "rules": [
                        "不改学校、学历和时间事实",
                        "缺少信息时不要编造",
                        "应届或实习简历可补充相关课程/竞赛"
                      ]
                    }
                    """;
            default -> """
                    {
                      "section": "%s",
                      "strategy": "先识别字段语义,只做最小必要修改。",
                      "rules": [
                        "不编造事实",
                        "不返回整份简历",
                        "仅输出可安全应用的 replace patch"
                      ]
                    }
                    """.formatted(section);
        };
    }

    @Tool(name = "validateResumePatchPlan",
            description = "在输出 resume_patch 前校验 patch 计划是否安全")
    public String validateResumePatchPlan(
            @ToolParam(name = "section", description = "模块 name") String section,
            @ToolParam(name = "itemIndex", description = "条目索引,没有则传 -1") Integer itemIndex,
            @ToolParam(name = "field", description = "要替换的字段名") String field) {
        boolean hasSection = section != null && !section.isBlank();
        boolean hasField = field != null && !field.isBlank();
        boolean indexSafe = itemIndex == null || itemIndex >= -1;
        return """
                {
                  "valid": %s,
                  "checks": [
                    {"name": "section_present", "passed": %s},
                    {"name": "field_present", "passed": %s},
                    {"name": "item_index_safe", "passed": %s},
                    {"name": "operation_scope", "passed": true}
                  ],
                  "advice": "如果 valid 为 false,先追问或改为文本建议;如果 valid 为 true,输出一个最小 replace patch。"
                }
                """.formatted(hasSection && hasField && indexSafe, hasSection, hasField, indexSafe);
    }

    private String emptyToDefault(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }
}
