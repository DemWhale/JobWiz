package com.offershow.job.wiz.start.controller;

import com.offershow.job.wiz.dal.entity.ResumeTemplate;
import com.offershow.job.wiz.service.ResumeTemplateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 简历模板控制器
 */
@RestController
@RequestMapping("/api/resume-template")
public class ResumeTemplateController {

    @Autowired
    private ResumeTemplateService resumeTemplateService;

    /**
     * 获取所有模板列表
     *
     * @return 模板列表
     */
    @GetMapping("/list")
    public List<ResumeTemplate> list() {
        return resumeTemplateService.listAll();
    }

    /**
     * 根据 ID 获取模板
     *
     * @param id 模板 ID
     * @return 模板信息
     */
    @GetMapping("/{id}")
    public ResumeTemplate getById(@PathVariable("id") Long id) {
        return resumeTemplateService.getById(id);
    }
}
