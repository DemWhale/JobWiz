package com.offershow.job.wiz.common.dto.context;

import io.agentscope.core.state.SessionKey;
import io.agentscope.core.util.JsonUtils;

public record UserSessionKey(String userId, String threadId) implements SessionKey {

    public static UserSessionKey of(String userId, String threadId) {
        return new UserSessionKey(userId, threadId);
    }


    @Override
    public String toIdentifier() {
        return userId + "#" + threadId;
    }

}
