package com.offershow.job.wiz.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.offershow.job.wiz.dal.entity.UserFeature;
import com.offershow.job.wiz.dal.mapper.UserFeatureMapper;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Objects;

/**
 * 用户特征信息服务类
 */
@Service
public class UserFeatureService extends ServiceImpl<UserFeatureMapper, UserFeature> {

    /**
     * 根据用户 ID 获取用户特征
     *
     * @param userId 用户 ID
     * @return 用户特征信息
     */
    public UserFeature getByUserId(Long userId) {
        if (Objects.isNull(userId)) {
            return null;
        }
        LambdaQueryWrapper<UserFeature> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(UserFeature::getUserId, userId);
        return getOne(wrapper);
    }

    /**
     * 保存或更新用户特征
     *
     * @param userFeature 用户特征信息
     * @return 是否成功
     */
    public boolean saveOrUpdateUserFeature(UserFeature userFeature) {
        if (Objects.isNull(userFeature)) {
            return false;
        }

        // 如果已有记录，则更新
        UserFeature existing = getByUserId(userFeature.getUserId());
        if (Objects.nonNull(existing)) {
            userFeature.setId(existing.getId());
            userFeature.setGmtModified(new Date());
            return updateById(userFeature);
        } else {
            // 否则新增
            userFeature.setGmtCreate(new Date());
            userFeature.setGmtModified(new Date());
            return save(userFeature);
        }
    }

    /**
     * 插入用户特征
     *
     * @param userFeature 用户特征信息
     * @return 是否成功
     */
    public boolean insertUserFeature(UserFeature userFeature) {
        if (Objects.isNull(userFeature)) {
            return false;
        }
        userFeature.setGmtCreate(new Date());
        userFeature.setGmtModified(new Date());
        return save(userFeature);
    }

    /**
     * 更新用户特征
     *
     * @param userFeature 用户特征信息
     * @return 是否成功
     */
    public boolean updateUserFeature(UserFeature userFeature) {
        if (Objects.isNull(userFeature) || Objects.isNull(userFeature.getId())) {
            return false;
        }
        userFeature.setGmtModified(new Date());
        return updateById(userFeature);
    }

    /**
     * 根据条件查询用户特征列表
     *
     * @param userId          用户 ID
     * @param targetPosition  意向岗位
     * @param targetCity      意向城市
     * @param education       学历
     * @return 用户特征列表
     */
    public List<UserFeature> listUserFeatures(Long userId, String targetPosition, String targetCity, String education) {
        LambdaQueryWrapper<UserFeature> wrapper = new LambdaQueryWrapper<>();
        
        if (Objects.nonNull(userId)) {
            wrapper.eq(UserFeature::getUserId, userId);
        }
        if (StringUtils.isNotBlank(targetPosition)) {
            wrapper.like(UserFeature::getTargetPosition, targetPosition);
        }
        if (StringUtils.isNotBlank(targetCity)) {
            wrapper.eq(UserFeature::getTargetCity, targetCity);
        }
        if (StringUtils.isNotBlank(education)) {
            wrapper.eq(UserFeature::getEducation, education);
        }
        
        wrapper.orderByDesc(UserFeature::getGmtModified);
        return list(wrapper);
    }
}
