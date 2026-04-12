package com.offershow.job.wiz.start.controller;

import com.offershow.job.wiz.dal.entity.Resume;
import com.offershow.job.wiz.service.ResumeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 简历信息控制器
 */
@RestController
@RequestMapping("/api/resume")
public class ResumeController {

    @Autowired
    private ResumeService resumeService;

    /**
     * 根据用户 ID 获取简历列表
     *
     * @param userId 用户 ID
     * @return 简历列表
     */
    @GetMapping("/list")
    public List<Resume> listByUserId(@RequestParam("userId") Long userId) {
        return resumeService.listByUserId(userId);
    }

    /**
     * 根据 ID 获取简历
     *
     * @param id 简历 ID
     * @return 简历信息
     */
    @GetMapping("/{id}")
    public Resume getById(@PathVariable("id") Long id) {
        return resumeService.getById(id);
    }

    /**
     * 创建简历
     *
     * @param resume 简历信息
     * @return 创建后的简历
     */
    @PostMapping("/create")
    public Resume create(@RequestBody Resume resume) {
        return resumeService.createResume(resume);
    }

    /**
     * 更新简历
     *
     * @param resume 简历信息
     * @return 是否成功
     */
    @PutMapping("/update")
    public boolean update(@RequestBody Resume resume) {
        return resumeService.updateResume(resume);
    }

    /**
     * 删除简历
     *
     * @param id 简历 ID
     * @return 是否成功
     */
    @DeleteMapping("/{id}")
    public boolean delete(@PathVariable("id") Long id) {
        return resumeService.deleteResume(id);
    }
}
