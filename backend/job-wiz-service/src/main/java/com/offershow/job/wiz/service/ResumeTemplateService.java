package com.offershow.job.wiz.service;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.offershow.job.wiz.dal.entity.ResumeTemplate;
import com.offershow.job.wiz.dal.mapper.ResumeTemplateMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

/**
 * 简历模板服务类
 */
@Service
public class ResumeTemplateService extends ServiceImpl<ResumeTemplateMapper, ResumeTemplate> {

    /**
     * 获取所有模板列表
     *
     * @return 模板列表
     */
    public List<ResumeTemplate> listAll() {
        return list();
    }

    /**
     * 根据 ID 获取模板
     *
     * @param id 模板 ID
     * @return 模板信息
     */
    public ResumeTemplate getById(Long id) {
        if (Objects.isNull(id)) {
            return null;
        }
        return baseMapper.selectById(id);
    }
}
