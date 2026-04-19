package com.offershow.job.wiz.common.dto.context;

import lombok.Builder;
import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;

/**
 * Agent 调用上下文类
 * 用于在 AGUI 请求中传递额外上下文信息(用户ID、模板ID、当前步骤等)
 */
@Builder
@Data
public class AgentContext implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 用户 ID
     */
    private String userId;

    /**
     *
     */
    private String threadId;

    /**
     *
     */
    private String runId;


    /**
     * 用户会话键
     */
    private UserSessionKey userSessionKey;

    /**
     * 前端参数,前端传入
     */
    private Map<String, Object> reqParams = new HashMap<>();

    /**
     * 扩展参数
     */
    private Map<String, Object> extParams = new HashMap<>();
}
