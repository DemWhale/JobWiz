package com.offershow.job.wiz.start.handler;

import com.offershow.job.wiz.common.dto.context.AgentContext;
import com.offershow.job.wiz.common.dto.context.UserSessionKey;
import com.offershow.job.wiz.service.builder.ReActAgentBuilder;
import com.offershow.job.wiz.service.session.UserSessionManager;
import io.agentscope.core.ReActAgent;
import io.agentscope.core.agui.adapter.AguiAdapterConfig;
import io.agentscope.core.agui.adapter.AguiAgentAdapter;
import io.agentscope.core.agui.encoder.AguiEventEncoder;
import io.agentscope.core.agui.event.AguiEvent;
import io.agentscope.core.agui.model.RunAgentInput;
import io.agentscope.core.session.JsonSession;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.server.ServerRequest;
import org.springframework.web.reactive.function.server.ServerResponse;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.Map;
import java.util.Objects;

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


    /**
     * 处理 AGUI 请求入口
     * 请求流程: 解析请求体 → 处理输入 → 错误处理
     *
     * @param request WebFlux 请求对象,包含 HTTP Headers 和 Body
     * @return SSE 事件流响应
     */
    public Mono<ServerResponse> handle(ServerRequest request) {
        return request.bodyToMono(RunAgentInput.class)
                .flatMap(input -> processInput(input, request))
                .onErrorResume(this::handleParseError);
    }

    /**
     * 核心处理逻辑: 构建上下文 → 创建 Agent → 管理会话 → 执行 → 编码 SSE
     * <p>
     * 执行步骤:
     * 1. 构建 AgentContext: 从请求中提取 userId、threadId、runId 等上下文信息
     * 2. 创建 Agent: 使用 ReActAgentBuilder 根据上下文构建合适的 Agent
     * 3. 创建会话管理器: 使用 UserSessionManager 管理会话状态
     * 4. 恢复会话: 如果存在历史会话,加载之前的对话状态
     * 5. 执行 Agent: 使用 AguiAgentAdapter 运行 Agent,获取 AGUI 事件流
     * 6. 编码 SSE: 将 AGUI 事件编码为 ServerSentEvent 格式返回
     * 7. 持久化会话: 在流完成或取消时保存会话状态
     *
     * @param input   AGUI 运行输入(包含 threadId、runId、forwardedProps 等)
     * @param request HTTP 请求对象
     * @return SSE 事件流响应
     */
    private Mono<ServerResponse> processInput(RunAgentInput input, ServerRequest request) {
        try {
            // 1. 构建 AgentContext(提取用户上下文)
            AgentContext context = buildAgentContext(input, request);

            // 2. 创建 Agent(根据上下文构建合适的 Agent)
            ReActAgent agent = reActAgentBuilder.buildAgent(context);

            // 3. 创建会话管理器(链式 API: 指定会话ID + 使用 JsonSession + 注册 Agent 组件)
            UserSessionManager userSessionManager = UserSessionManager
                    .forSessionId(context.getUserSessionKey())
                    .withSession(jsonSession)
                    .addComponent(agent);

            // 4. 恢复会话(如果存在历史会话,加载对话状态)
            userSessionManager.loadIfExists();

            // 5. 创建 AGUI 适配器并执行 Agent,获取事件流
            AguiAgentAdapter adapter = new AguiAgentAdapter(agent, aguiAdapterConfig);
            Flux<AguiEvent> events = adapter.run(input);

            // 6. 编码为 SSE 格式,并添加会话持久化逻辑
            Flux<ServerSentEvent<String>> sseStream = events
                    .map(event -> ServerSentEvent.<String>builder()
                            .data(encoder.encodeToJson(event).trim()) // 编码为 JSON
                            .build())
                    .doOnComplete(() -> {
                        // 流完成时保存会话
                        log.info("SSE stream completed for run {}", input.getRunId());
                        userSessionManager.saveSession();
                    })
                    .doOnCancel(() -> {
                        // 流取消时中断 Agent 并保存会话
                        log.info("SSE stream cancelled for run {}, interrupting agent", input.getRunId());
                        agent.interrupt();
                        userSessionManager.saveSession();
                    });

            // 7. 返回 SSE 响应流
            return ServerResponse.ok()
                    .contentType(MediaType.TEXT_EVENT_STREAM)
                    .body(sseStream, ServerSentEvent.class);

        } catch (Exception e) {
            log.error("Error processing AG-UI request: {}", e.getMessage());
            return createErrorResponse(input.getThreadId(), input.getRunId(), "Failed to parse request: " + e.getMessage());
        }
    }

    /**
     * 构建 Agent 上下文
     * 从 RunAgentInput 和 HTTP 请求中提取关键信息:
     * - userId: 用户 ID(当前硬编码为 "1",后续从鉴权信息获取)
     * - threadId: 会话线程 ID(由前端传递,用于标识一轮对话)
     * - runId: 运行 ID(由前端传递,用于标识单次请求)
     * - userSessionKey: 用户会话键(userId + threadId 的组合,用于唯一标识会话)
     * - reqParams: 前端传递的额外参数(如 agentContext 等)
     *
     * @param input   AGUI 运行输入
     * @param request HTTP 请求
     * @return AgentContext 实例
     */
    private AgentContext buildAgentContext(RunAgentInput input, ServerRequest request) {
        // TODO: 从鉴权信息中获取真实 userId
        String userId = "1";
        String threadId = input.getThreadId();
        String runId = input.getRunId();
        String agentId = resolveAgentId(input, request);
        UserSessionKey userSessionKey = UserSessionKey.of(userId, threadId);

        return AgentContext.builder()
                .userId(userId)
                .agentId(agentId)
                .threadId(threadId)
                .runId(runId)
                .userSessionKey(userSessionKey)
                .reqParams(input.getForwardedProps())
                .build();
    }

    private String resolveAgentId(RunAgentInput input, ServerRequest request) {
        String pathAgentId = request.pathVariables().get("agentId");
        String headerAgenId = request.headers().firstHeader("X-Agent-Id");
        return ObjectUtils.firstNonNull(pathAgentId, headerAgenId);
    }

    /**
     * 处理请求解析错误
     * 当请求体无法解析为 RunAgentInput 时调用
     *
     * @param error 解析异常
     * @return 包含错误信息的 SSE 响应
     */
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

    /**
     * 创建错误响应
     * 返回包含错误信息的 SSE 事件流
     *
     * @param threadId     会话 ID
     * @param runId        运行 ID
     * @param errorMessage 错误信息
     * @return SSE 错误响应
     */
    private Mono<ServerResponse> createErrorResponse(
            String threadId, String runId, String errorMessage) {
        return ServerResponse.ok()
                .contentType(MediaType.TEXT_EVENT_STREAM)
                .body(createErrorEventStream(threadId, runId, errorMessage), ServerSentEvent.class);
    }

    /**
     * 创建错误事件流
     * 生成两个 SSE 事件: 错误事件 + 完成事件
     *
     * @param threadId     会话 ID
     * @param runId        运行 ID
     * @param errorMessage 错误信息
     * @return 包含错误和完成事件的 SSE 流
     */
    private Flux<ServerSentEvent<String>> createErrorEventStream(
            String threadId, String runId, String errorMessage) {
        // 创建错误事件
        String errorEvent =
                encoder.encodeToJson(
                                new io.agentscope.core.agui.event.AguiEvent.Raw(threadId, runId, Map.of("error", errorMessage)))
                        .trim();
        // 创建完成事件(标记流结束)
        String finishEvent =
                encoder.encodeToJson(new io.agentscope.core.agui.event.AguiEvent.RunFinished(threadId, runId)).trim();
        return Flux.just(
                ServerSentEvent.<String>builder().data(errorEvent).build(),
                ServerSentEvent.<String>builder().data(finishEvent).build());
    }


}
