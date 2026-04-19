-- 简历信息表
-- 严格对齐 data.json 顶层字段,不多不少
CREATE TABLE IF NOT EXISTS `resume`
(
    `id`              bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT '主键',
    `gmt_create`      datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `gmt_modified`    datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
    
    -- data.json 中的 11 个字段
    `uuid`            VARCHAR(64)  DEFAULT NULL COMMENT 'uuid',
    `user_id`         BIGINT(20)   DEFAULT NULL COMMENT 'user_id',
    `user_uuid`       VARCHAR(64)  DEFAULT NULL COMMENT 'user_uuid',
    `title`           VARCHAR(200) DEFAULT NULL COMMENT 'title',
    `template_id`     BIGINT(20)   DEFAULT NULL COMMENT 'template_id',
    `module_id`       BIGINT(20)   DEFAULT NULL COMMENT 'module_id',
    `content`         TEXT         DEFAULT NULL COMMENT 'content (JSON)',
    `css_config`      TEXT         DEFAULT NULL COMMENT 'css_config (JSON)',
    `preview_img`     VARCHAR(500) DEFAULT NULL COMMENT 'preview_img',
    `detail_img`      VARCHAR(500) DEFAULT NULL COMMENT 'detail_img',
    `share_status`    TINYINT(1)   DEFAULT 0 COMMENT 'share_status',
    
    PRIMARY KEY (`id`),
    INDEX `idx_user_id` (`user_id`) COMMENT '用户 ID 索引',
    UNIQUE INDEX `idx_uuid` (`uuid`) COMMENT 'UUID 唯一索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='简历信息表';
