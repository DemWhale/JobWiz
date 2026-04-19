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
 * 
 * 严格对齐 data.json 顶层字段,不多不少:
 * {
 *   "content": { "modules": [...] },
 *   "css_config": { "global": {...} },
 *   "detail_img": "",
 *   "module_id": 24,
 *   "preview_img": "url",
 *   "share_status": 1,
 *   "template_id": 18,
 *   "title": "简历标题",
 *   "user_id": 14,
 *   "user_uuid": "uuid",
 *   "uuid": "uuid"
 * }
 */
@Data
@TableName("resume")
public class Resume implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 主键 ID (数据库自增,不在 data.json 中)
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 对应 data.json 中的 uuid
     */
    private String uuid;

    /**
     * 对应 data.json 中的 user_id
     */
    private Long userId;

    /**
     * 对应 data.json 中的 user_uuid
     */
    private String userUuid;

    /**
     * 对应 data.json 中的 title
     */
    private String title;

    /**
     * 对应 data.json 中的 template_id
     */
    private Long templateId;

    /**
     * 对应 data.json 中的 module_id
     */
    private Long moduleId;

    /**
     * 对应 data.json 中的 content
     * JSON 格式: { "modules": [...] }
     */
    private String content;

    /**
     * 对应 data.json 中的 css_config
     * JSON 格式: { "global": {...} }
     */
    private String cssConfig;

    /**
     * 对应 data.json 中的 preview_img
     */
    private String previewImg;

    /**
     * 对应 data.json 中的 detail_img
     */
    private String detailImg;

    /**
     * 对应 data.json 中的 share_status
     */
    private Integer shareStatus;

    /**
     * 创建时间 (数据库字段,不在 data.json 中)
     */
    private Date gmtCreate;

    /**
     * 修改时间 (数据库字段,不在 data.json 中)
     */
    private Date gmtModified;
}
