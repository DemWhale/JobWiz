package com.offershow.job.wiz.common.tools;

import io.agentscope.core.tool.Tool;
import io.agentscope.core.tool.ToolParam;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Mock 工具: 拉起指定行业的优秀简历模板
 * 用于简历生成 Agent 参考行业最佳实践
 */
@Slf4j
@Component
public class IndustryResumeTool {

    /**
     * 获取指定行业的优秀简历模板
     *
     * @param industry 行业名称(如 "互联网", "金融", "制造")
     * @return 优秀简历模板 JSON 字符串
     */
    @Tool(name = "getIndustryResume",
            description = "获取指定行业的优秀简历模板,用于参考行业最佳实践")
    public String getIndustryResume(
            @ToolParam(name = "industry", description = "行业名称(如 \"互联网\", \"金融\", \"制造\")") String industry) {
        log.info("Fetching industry resume template for: {}", industry);

        // Mock 数据 - 后续可替换为真实数据库查询
        String mockTemplate = switch (industry.toLowerCase()) {
            case "互联网", "internet" -> getInternetResume();
            case "金融", "finance" -> getFinanceResume();
            case "制造", "manufacturing" -> getManufacturingResume();
            default -> getGenericResume();
        };

        return mockTemplate;
    }

    /**
     * 互联网行业优秀简历模板
     */
    private String getInternetResume() {
        return """
                {
                  "industry": "互联网",
                  "highlights": [
                    "主导分布式系统设计,支撑千万级 DAU",
                    "优化核心链路性能,响应时间降低 50%",
                    "推动微服务架构转型,部署效率提升 10 倍"
                  ],
                  "techStack": ["Java", "Spring Cloud", "Kubernetes", "Redis", "MySQL"],
                  "description": "这份简历展示了优秀的技术深度和业务影响力,值得参考"
                }
                """;
    }

    /**
     * 金融行业优秀简历模板
     */
    private String getFinanceResume() {
        return """
                {
                  "industry": "金融",
                  "highlights": [
                    "设计高可用交易系统,可用性 99.99%",
                    "实现风控引擎,拦截欺诈交易率 99.5%",
                    "通过等保三级认证"
                  ],
                  "techStack": ["Java", "微服务", "消息队列", "分布式数据库"],
                  "description": "强调系统稳定性、安全性和合规性"
                }
                """;
    }

    /**
     * 制造行业优秀简历模板
     */
    private String getManufacturingResume() {
        return """
                {
                  "industry": "制造",
                  "highlights": [
                    "开发 MES 系统,生产效率提升 30%",
                    "实现 IoT 设备监控,故障预测准确率 95%",
                    "推动数字化转型,减少纸质流程 80%"
                  ],
                  "techStack": ["Java", "IoT", "时序数据库", "边缘计算"],
                  "description": "突出工业数字化和效率提升"
                }
                """;
    }

    /**
     * 通用简历模板
     */
    private String getGenericResume() {
        return """
                {
                  "industry": "通用",
                  "highlights": [
                    "主导核心系统开发",
                    "优化业务流程,提升效率",
                    "推动技术创新和团队协作"
                  ],
                  "techStack": ["Java", "Spring Boot", "数据库"],
                  "description": "通用优秀简历模板,可根据具体行业调整"
                }
                """;
    }
}
