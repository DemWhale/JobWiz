package com.offershow.job.wiz.dal.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 用户特征信息实体类
 */
@Data
@TableName("user_feature")
public class UserFeature implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 主键 ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 用户 ID
     */
    private Long userId;

    /**
     * 用户昵称
     */
    private String nickname;

    /**
     * 学校
     */
    private String school;

    /**
     * 学历
     */
    private String education;

    /**
     * 专业
     */
    private String major;

    /**
     * 性别
     */
    private String gender;

    /**
     * 毕业时间
     */
    private LocalDateTime graduationDate;

    /**
     * 邮箱
     */
    private String email;

    /**
     * 意向岗位
     */
    private String targetPosition;

    /**
     * 意向城市
     */
    private String targetCity;

    /**
     * 自我描述
     */
    private String description;

    /**
     * 创建时间
     */
    private LocalDateTime createTime;

    /**
     * 更新时间
     */
    private LocalDateTime updateTime;
}
