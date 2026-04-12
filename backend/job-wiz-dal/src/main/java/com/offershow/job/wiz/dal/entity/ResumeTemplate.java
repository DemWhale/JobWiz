package com.offershow.job.wiz.dal.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.util.Date;

/**
 * 简历模板实体类
 */
@Data
@TableName("resume_template")
public class ResumeTemplate implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 主键 ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 模板标识名（rhyhorn, glalie 等）
     */
    private String name;

    /**
     * 模板显示名（经典、简约 等）
     */
    private String title;

    /**
     * 预览图 URL
     */
    private String preview;

    /**
     * JSON: ["free"] / ["vip"]
     */
    private String permission;

    /**
     * JSON: 模板配置(layout/theme/typography/css/page)
     */
    private String meta;

    /**
     * 栏数
     */
    private Integer columns;

    /**
     * 是否 VIP 模板
     */
    private Boolean isVip;

    /**
     * 模板描述
     */
    private String description;

    /**
     * 创建时间
     */
    private Date createdAt;

    /**
     * 更新时间
     */
    private Date updatedAt;
}
