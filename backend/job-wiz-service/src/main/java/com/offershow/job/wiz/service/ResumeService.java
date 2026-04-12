package com.offershow.job.wiz.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.offershow.job.wiz.dal.entity.Resume;
import com.offershow.job.wiz.dal.mapper.ResumeMapper;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Objects;

/**
 * 简历信息服务类
 */
@Service
public class ResumeService extends ServiceImpl<ResumeMapper, Resume> {

    /**
     * 根据用户 ID 查询简历列表
     *
     * @param userId 用户 ID
     * @return 简历列表
     */
    public List<Resume> listByUserId(Long userId) {
        if (Objects.isNull(userId)) {
            return List.of();
        }
        LambdaQueryWrapper<Resume> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Resume::getUserId, userId)
                .orderByDesc(Resume::getUpdatedAt);
        return list(wrapper);
    }

    /**
     * 根据 ID 获取简历
     *
     * @param id 简历 ID
     * @return 简历信息
     */
    public Resume getById(Long id) {
        if (Objects.isNull(id)) {
            return null;
        }
        return baseMapper.selectById(id);
    }

    /**
     * 创建简历
     *
     * @param resume 简历信息
     * @return 创建后的简历
     */
    public Resume createResume(Resume resume) {
        if (Objects.isNull(resume)) {
            return null;
        }
        Date now = new Date();
        resume.setCreatedAt(now);
        resume.setUpdatedAt(now);
        if (resume.getVisibility() == null) {
            resume.setVisibility("private");
        }
        if (resume.getLocked() == null) {
            resume.setLocked(false);
        }
        if (resume.getSource() == null) {
            resume.setSource("ORIGINAL");
        }
        save(resume);
        return resume;
    }

    /**
     * 更新简历
     *
     * @param resume 简历信息
     * @return 是否成功
     */
    public boolean updateResume(Resume resume) {
        if (Objects.isNull(resume) || Objects.isNull(resume.getId())) {
            return false;
        }
        resume.setUpdatedAt(new Date());
        return updateById(resume);
    }

    /**
     * 删除简历
     *
     * @param id 简历 ID
     * @return 是否成功
     */
    public boolean deleteResume(Long id) {
        if (Objects.isNull(id)) {
            return false;
        }
        return removeById(id);
    }
}
