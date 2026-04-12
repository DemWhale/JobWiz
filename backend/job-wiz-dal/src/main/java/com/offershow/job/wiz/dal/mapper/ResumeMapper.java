package com.offershow.job.wiz.dal.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.offershow.job.wiz.dal.entity.Resume;
import org.apache.ibatis.annotations.Mapper;

/**
 * 简历信息 Mapper 接口
 */
@Mapper
public interface ResumeMapper extends BaseMapper<Resume> {
}
