//package com.offershow.job.wiz.start.config;
//
//import com.offershow.job.wiz.common.agents.BaseInfoAgent;
//import com.offershow.job.wiz.common.agents.EduBackgroundAgent;
//import com.offershow.job.wiz.common.agents.InterestAgent;
//import io.agentscope.spring.boot.agui.common.AguiAgentRegistryCustomizer;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//
///**
// * AGUI 协议配置
// */
//@Configuration
//public class AguiConfig {
//
//    private final BaseInfoAgent baseInfoAgent;
//    private final InterestAgent interestAgent;
//    private final EduBackgroundAgent eduBackgroundAgent;
//
//    public AguiConfig(BaseInfoAgent baseInfoAgent,
//                      InterestAgent interestAgent,
//                      EduBackgroundAgent eduBackgroundAgent) {
//        this.baseInfoAgent = baseInfoAgent;
//        this.interestAgent = interestAgent;
//        this.eduBackgroundAgent = eduBackgroundAgent;
//    }
//
//    @Bean
//    public AguiAgentRegistryCustomizer aguiAgentRegistryCustomizer() {
//        AguiAgentRegistryCustomizer customizer = registry -> {
//            // 注册基础信息修改 Agent（每次请求创建新实例，无状态）
//            registry.registerFactory("baseinfo", baseInfoAgent::create);
//
//            // 注册求职意向修改 Agent
//            registry.registerFactory("interest", interestAgent::create);
//
//            // 注册教育背景修改 Agent
//            registry.registerFactory("edubackground", eduBackgroundAgent::create);
//        };
//
//        System.out.println("Registered agents with AG-UI registry: baseinfo, interest, edubackground");
//        System.out.println("Access agents via:");
//        System.out.println("  - POST /agui/run/baseinfo (基础信息修改)");
//        System.out.println("  - POST /agui/run/interest (求职意向修改)");
//        System.out.println("  - POST /agui/run/edubackground (教育背景修改)");
//        System.out.println("  - POST /agui/run with X-Agent-Id header");
//
//        return customizer;
//    }
//}
