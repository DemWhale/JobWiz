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

    @Bean
    public AguiProperties aguiProperties() {
        AguiProperties aguiProperties = new AguiProperties();
        aguiProperties.setPathPrefix("/agui");

        return aguiProperties;
    }

    @Bean("jsonSession")
    public JsonSession jsonSession(@Value("${agui.session.path:../.cache/session}") String sessionPath) {
        return new JsonSession(Path.of(sessionPath));
    }

    @Bean
    public AguiAdapterConfig aguiAdapterConfig() {
        return AguiAdapterConfig.builder()
                .toolMergeMode(ToolMergeMode.MERGE_FRONTEND_PRIORITY)
                .runTimeout(Duration.ofMinutes(10))
                .emitStateEvents(true)
                .emitToolCallArgs(true)
                .enableReasoning(true)
                .build();
    }

    @Bean
    public AguiEventEncoder aguiEventEncoder() {
        return new AguiEventEncoder();
    }

    @Bean
    public RouterFunction<ServerResponse> aguiRoutes(JobWizAguiWebFluxHandler handler,
                                                     AguiProperties aguiProperties) {
        return RouterFunctions.route()
                .POST(aguiProperties.getPathPrefix() + "/run", handler::handle)
                .POST(aguiProperties.getPathPrefix() + "/run/{agentId}", handler::handle)
                .build();
    }


}
