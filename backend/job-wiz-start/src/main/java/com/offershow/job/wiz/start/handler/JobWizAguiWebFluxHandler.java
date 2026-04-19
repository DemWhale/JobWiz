package com.offershow.job.wiz.start.handler;

import com.offershow.job.wiz.common.dto.context.AgentContext;
import com.offershow.job.wiz.common.dto.context.UserSessionKey;
import com.offershow.job.wiz.service.agent.ReActAgentBuilder;
import com.offershow.job.wiz.service.session.UserSessionManager;
import io.agentscope.core.ReActAgent;
import io.agentscope.core.agui.adapter.AguiAdapterConfig;
import io.agentscope.core.agui.adapter.AguiAgentAdapter;
import io.agentscope.core.agui.encoder.AguiEventEncoder;
import io.agentscope.core.agui.event.AguiEvent;
import io.agentscope.core.agui.model.RunAgentInput;
import io.agentscope.core.session.JsonSession;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.server.ServerRequest;
import org.springframework.web.reactive.function.server.ServerResponse;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.Map;

/**
 * 自定义 AGUI WebFlux Handler
 * 完整控制 AGUI 请求处理流程:
 * 1. 解析请求,提取 agentId
 * 2. 构建 AgentContext
 * 3. 创建/恢复 Session
 * 4. 运行 Agent,获取事件流
 * 5. 编码为 SSE 格式
 * 6. 持久化 Session
 */
@Slf4j
@Component
public class JobWizAguiWebFluxHandler {

    @Autowired
    private AguiEventEncoder encoder;
    @Autowired
    private ReActAgentBuilder reActAgentBuilder;
    @Autowired
    private JsonSession jsonSession;
    @Autowired
    private AguiAdapterConfig aguiAdapterConfig;


    public Mono<ServerResponse> handle(ServerRequest request) {
        return request.bodyToMono(RunAgentInput.class)
                .flatMap(input -> processInput(input, request))
                .onErrorResume(this::handleParseError);
    }

    private Mono<ServerResponse> processInput(RunAgentInput input, ServerRequest request) {
        try {
            // 构建 AgentContext
            AgentContext context = buildAgentContext(input, request);
            // 创建 agent
            ReActAgent agent = reActAgentBuilder.buildAgent(context);
            // 创建会话管理器
            UserSessionManager userSessionManager = UserSessionManager
                    .forSessionId(context.getUserSessionKey())
                    .withSession(jsonSession)
                    .addComponent(agent);
            // 恢复会话
            userSessionManager.loadIfExists();
            // 执行 agent，得到 AGUI 流
            // Create adapter and run
            AguiAgentAdapter adapter = new AguiAgentAdapter(agent, aguiAdapterConfig);
            Flux<AguiEvent> events = adapter.run(input);
            // 编码为 SSE 返回，并持久化会话
            // Create SSE stream using ServerSentEvent for proper streaming behavior
            Flux<ServerSentEvent<String>> sseStream = events
                    .map(event -> ServerSentEvent.<String>builder()
                            .data(encoder.encodeToJson(event).trim())
                            .build())
                    .doOnComplete(() -> {
                        log.info("SSE stream completed for run {}", input.getRunId());
                        userSessionManager.saveSession();
                    })
                    .doOnCancel(() -> {
                        log.info("SSE stream cancelled for run {}, interrupting" + " agent", input.getRunId());
                        agent.interrupt();
                        userSessionManager.saveSession();
                    });

            return ServerResponse.ok()
                    .contentType(MediaType.TEXT_EVENT_STREAM)
                    .body(sseStream, ServerSentEvent.class);

        } catch (Exception e) {
            log.error("Error processing AG-UI request: {}", e.getMessage());
            return createErrorResponse(input.getThreadId(), input.getRunId(), "Failed to parse request: " + e.getMessage());
        }
    }

    private AgentContext buildAgentContext(RunAgentInput input, ServerRequest request) {
        String userId = "1";
        String threadId = input.getThreadId();
        String runId = input.getRunId();
        UserSessionKey userSessionKey = UserSessionKey.of(userId, threadId);

        return AgentContext.builder()
                .userId(userId)
                .threadId(threadId)
                .runId(runId)
                .userSessionKey(userSessionKey)
                .reqParams(input.getForwardedProps())
                .build();
    }

    private Mono<ServerResponse> handleParseError(Throwable error) {
        log.error("Error parsing AG-UI request: {}", error.getMessage());
        return ServerResponse.badRequest()
                .contentType(MediaType.TEXT_EVENT_STREAM)
                .body(
                        createErrorEventStream(
                                "unknown",
                                "unknown",
                                "Failed to parse request: " + error.getMessage()),
                        ServerSentEvent.class);
    }

    private Mono<ServerResponse> createErrorResponse(
            String threadId, String runId, String errorMessage) {
        return ServerResponse.ok()
                .contentType(MediaType.TEXT_EVENT_STREAM)
                .body(createErrorEventStream(threadId, runId, errorMessage), ServerSentEvent.class);
    }

    private Flux<ServerSentEvent<String>> createErrorEventStream(
            String threadId, String runId, String errorMessage) {
        String errorEvent =
                encoder.encodeToJson(
                                new io.agentscope.core.agui.event.AguiEvent.Raw(threadId, runId, Map.of("error", errorMessage)))
                        .trim();
        String finishEvent =
                encoder.encodeToJson(new io.agentscope.core.agui.event.AguiEvent.RunFinished(threadId, runId)).trim();
        return Flux.just(
                ServerSentEvent.<String>builder().data(errorEvent).build(),
                ServerSentEvent.<String>builder().data(finishEvent).build());
    }


}
