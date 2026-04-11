package com.offershow.job.wiz.start;

import com.baomidou.mybatisplus.autoconfigure.MybatisPlusAutoConfiguration;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;


@SpringBootApplication(
        scanBasePackages = {"com.offershow.job.wiz"},
        exclude = {MybatisPlusAutoConfiguration.class}
)
public class JobWizApplication {

    public static void main(String[] args) {
        SpringApplication.run(JobWizApplication.class, args);
    }

}
