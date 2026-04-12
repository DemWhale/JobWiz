package com.offershow.job.wiz.start.controller;

import com.offershow.job.wiz.common.enums.BizCodeEnum;
import com.offershow.job.wiz.common.model.ApiResponse;
import com.offershow.job.wiz.dal.entity.UserFeature;
import com.offershow.job.wiz.service.UserFeatureService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
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

    @GetMapping("/user")
    public ApiResponse<UserFeature> getByUserId(@RequestParam("userId") Long userId) {
        UserFeature feature = userFeatureService.getByUserId(userId);
        return feature != null ? ApiResponse.ok(feature) : ApiResponse.fail(BizCodeEnum.PARAM_ERROR.getCode(), "用户信息不存在");
    }

    @PostMapping("/save-or-update")
    public ApiResponse<Boolean> saveOrUpdate(@RequestBody UserFeature userFeature) {
        boolean result = userFeatureService.saveOrUpdateUserFeature(userFeature);
        return result ? ApiResponse.ok(result) : ApiResponse.fail("保存失败");
    }

    @PostMapping("/insert")
    public ApiResponse<Boolean> insert(@RequestBody UserFeature userFeature) {
        boolean result = userFeatureService.insertUserFeature(userFeature);
        return result ? ApiResponse.ok(result) : ApiResponse.fail("插入失败");
    }

    @PutMapping("/update")
    public ApiResponse<Boolean> update(@RequestBody UserFeature userFeature) {
        boolean result = userFeatureService.updateUserFeature(userFeature);
        return result ? ApiResponse.ok(result) : ApiResponse.fail("更新失败");
    }

    @GetMapping("/list")
    public ApiResponse<List<UserFeature>> list(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String targetPosition,
            @RequestParam(required = false) String targetCity,
            @RequestParam(required = false) String education) {
        List<UserFeature> list = userFeatureService.listUserFeatures(userId, targetPosition, targetCity, education);
        return ApiResponse.ok(list);
    }

    @DeleteMapping("/delete")
    public ApiResponse<Boolean> deleteById(@RequestParam("id") Long id) {
        boolean result = userFeatureService.removeById(id);
        return result ? ApiResponse.ok(result) : ApiResponse.fail("删除失败");
    }
}
