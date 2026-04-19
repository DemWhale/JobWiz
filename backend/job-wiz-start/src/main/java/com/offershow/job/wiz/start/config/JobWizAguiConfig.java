package com.offershow.job.wiz.start.config;

import com.offershow.job.wiz.start.handler.JobWizAguiWebFluxHandler;
import io.agentscope.core.agui.adapter.AguiAdapterConfig;
import io.agentscope.core.agui.encoder.AguiEventEncoder;
import io.agentscope.core.agui.model.ToolMergeMode;
import io.agentscope.core.session.JsonSession;
import io.agentscope.spring.boot.agui.common.AguiProperties;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.server.RouterFunction;
import org.springframework.web.reactive.function.server.RouterFunctions;
import org.springframework.web.reactive.function.server.ServerResponse;

import java.nio.file.Path;
import java.time.Duration;

/**
 * 自定义 AGUI 配置
 * 注册 AGUI 路由和 Bean
 */
@Slf4j
@Configuration
public class JobWizAguiConfig {

    /**
     * 配置 AGUI 基础属性
     * 设置 AGUI 端点的路径前缀为 /agui
     * 客户端可通过 POST /agui/run 或 POST /agui/run/{agentId} 访问
     */
    @Bean
    public AguiProperties aguiProperties() {
        AguiProperties aguiProperties = new AguiProperties();
        aguiProperties.setPathPrefix("/agui");
        return aguiProperties;
    }

    /**
     * 创建 JSON 文件会话存储 Bean
     * 使用 AgentScope 原生的 JsonSession 实现,将会话状态持久化到文件系统
     * 
     * @param sessionPath 会话存储路径,默认值 .cache/sessions
     * @return JsonSession 实例,用于读写会话 JSON 文件
     */
    @Bean("jsonSession")
    public JsonSession jsonSession(@Value("${agentscope.session.storage-path:.cache/sessions}") String sessionPath) {
        log.info("Initializing JsonSession with storage path: {}", sessionPath);
        return new JsonSession(Path.of(sessionPath));
    }

    /**
     * 配置 AGUI 适配器参数
     * 控制 AGUI 协议的行为特性:
     * - toolMergeMode: 工具合并模式(MERGE_FRONTEND_PRIORITY 表示前端优先)
     * - runTimeout: Agent 执行超时时间(10 分钟)
     * - emitStateEvents: 是否发送状态事件(用于前端追踪进度)
     * - emitToolCallArgs: 是否在事件中输出工具调用参数(用于调试)
     * - enableReasoning: 是否启用推理过程输出(用于展示思考链)
     */
    @Bean
    public AguiAdapterConfig aguiAdapterConfig() {
        return AguiAdapterConfig.builder()
                .toolMergeMode(ToolMergeMode.MERGE_FRONTEND_PRIORITY)
                .runTimeout(Duration.ofMinutes(10))
                .emitStateEvents(true)
                .emitToolCallArgs(true)
                .enableReasoning(false) // 关闭推理输出,避免返回过长内容
                .build();
    }

    /**
     * 创建 AGUI 事件编码器
     * 负责将 AGUI 事件对象编码为 JSON 字符串,用于 SSE 传输
     */
    @Bean
    public AguiEventEncoder aguiEventEncoder() {
        return new AguiEventEncoder();
    }

    /**
     * 注册 AGUI 路由
     * 支持两种访问方式:
     * 1. POST /agui/run - 使用默认 Agent(通过 forwardedProps.agentId 指定)
     * 2. POST /agui/run/{agentId} - 通过路径变量指定 Agent
     * 
     * 所有请求统一由 JobWizAguiWebFluxHandler 处理
     */
    @Bean
    public RouterFunction<ServerResponse> aguiRoutes(JobWizAguiWebFluxHandler handler,
                                                     AguiProperties aguiProperties) {
        log.info("Registering AGUI routes with prefix: {}", aguiProperties.getPathPrefix());
        return RouterFunctions.route()
                .POST(aguiProperties.getPathPrefix() + "/run", handler::handle)
                .POST(aguiProperties.getPathPrefix() + "/run/{agentId}", handler::handle)
                .build();
    }


}
