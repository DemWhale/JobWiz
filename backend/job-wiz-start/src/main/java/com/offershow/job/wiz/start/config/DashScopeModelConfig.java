package com.offershow.job.wiz.start.config;

import io.agentscope.core.model.DashScopeChatModel;
import io.agentscope.core.model.GenerateOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Map;

@Configuration
public class DashScopeModelConfig {

    @Value("${agentscope.core.model.dashscope.api-key}")
    private String apiKey;

    @Bean("qwen36PlusModel")
    public DashScopeChatModel qwen36PlusModel() {
        return DashScopeChatModel.builder()
                .apiKey(apiKey)
                .modelName("qwen3.6-plus")
                .build();
    }

    @Bean("qwen35FlashModel")
    public DashScopeChatModel qwen35FlashModel() {
        return DashScopeChatModel.builder()
                .apiKey(apiKey)
                .modelName("qwen3.5-flash")
                .build();
    }

    @Bean("qwen35FlashSearchModel")
    public DashScopeChatModel qwen35FlashSearchModel() {
        return DashScopeChatModel.builder()
                .apiKey(apiKey)
                .modelName("qwen3.5-flash")
                .enableSearch(true)
                .defaultOptions(GenerateOptions.builder()
                        .additionalBodyParam("search_options", Map.of(
                                "forced_search", true,
                                "enable_source", true,
                                "search_strategy", "turbo"
                        ))
                        .build())
                .build();
    }
}
