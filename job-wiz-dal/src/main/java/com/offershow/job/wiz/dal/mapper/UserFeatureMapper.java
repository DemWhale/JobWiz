package com.offershow.job.wiz.dal.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.offershow.job.wiz.dal.entity.UserFeature;
import org.apache.ibatis.annotations.Mapper;

/**
 * 用户特征信息 Mapper 接口
 */
@Mapper
public interface UserFeatureMapper extends BaseMapper<UserFeature> {
    
}
