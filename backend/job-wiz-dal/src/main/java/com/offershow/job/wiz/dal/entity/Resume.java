package com.offershow.job.wiz.dal.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.util.Date;

/**
 * 简历信息实体类
 */
@Data
@TableName("resume")
public class Resume implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 主键 ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 短链接标识
     */
    private String slug;

    /**
     * 简历标题
     */
    private String title;

    /**
     * 用户 ID
     */
    private Long userId;

    /**
     * 完整简历结构数据（JSON 格式）
     */
    private String resumeDetail;

    /**
     * 可见性：private/public
     */
    private String visibility;

    /**
     * 是否锁定
     */
    private Boolean locked;

    /**
     * 来源：ORIGINAL/AI_GENERATED
     */
    private String source;

    /**
     * 来源简历 ID
     */
    private Long sourceResumeId;

    /**
     * 语言：CHINESE/ENGLISH
     */
    private String language;

    /**
     * 关联模板 ID
     */
    private Long templateId;

    /**
     * 创建时间
     */
    private Date gmtCreate;

    /**
     * 修改时间
     */
    private Date gmtModified;
}
