package com.offershow.job.wiz.start.controller;

import com.offershow.job.wiz.dal.entity.UserFeature;
import com.offershow.job.wiz.service.UserFeatureService;
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
 * 用户特征信息控制器
 */
@RestController
@RequestMapping("/api/user-feature")
public class UserFeatureController {

    @Autowired
    private UserFeatureService userFeatureService;

    /**
     * 根据用户 ID 获取用户特征
     *
     * @param userId 用户 ID
     * @return 用户特征信息
     */
    @GetMapping("/user/{userId}")
    public UserFeature getByUserId(@PathVariable Long userId) {
        return userFeatureService.getByUserId(userId);
    }

    /**
     * 保存或更新用户特征
     *
     * @param userFeature 用户特征信息
     * @return 是否成功
     */
    @PostMapping("/save-or-update")
    public boolean saveOrUpdate(@RequestBody UserFeature userFeature) {
        return userFeatureService.saveOrUpdateUserFeature(userFeature);
    }

    /**
     * 插入用户特征
     *
     * @param userFeature 用户特征信息
     * @return 是否成功
     */
    @PostMapping("/insert")
    public boolean insert(@RequestBody UserFeature userFeature) {
        return userFeatureService.insertUserFeature(userFeature);
    }

    /**
     * 更新用户特征
     *
     * @param userFeature 用户特征信息
     * @return 是否成功
     */
    @PutMapping("/update")
    public boolean update(@RequestBody UserFeature userFeature) {
        return userFeatureService.updateUserFeature(userFeature);
    }

    /**
     * 根据条件查询用户特征列表
     *
     * @param userId         用户 ID
     * @param targetPosition 意向岗位
     * @param targetCity     意向城市
     * @param education      学历
     * @return 用户特征列表
     */
    @GetMapping("/list")
    public List<UserFeature> list(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String targetPosition,
            @RequestParam(required = false) String targetCity,
            @RequestParam(required = false) String education) {
        return userFeatureService.listUserFeatures(userId, targetPosition, targetCity, education);
    }

    /**
     * 根据 ID 删除用户特征
     *
     * @param id 主键 ID
     * @return 是否成功
     */
    @DeleteMapping("/{id}")
    public boolean deleteById(@PathVariable Long id) {
        return userFeatureService.removeById(id);
    }
}
