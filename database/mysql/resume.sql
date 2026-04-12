-- 简历信息表
CREATE TABLE IF NOT EXISTS `resume`
(
    `id`              BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键 ID',
    `slug`            VARCHAR(50)  DEFAULT NULL COMMENT '短链接标识',
    `title`           VARCHAR(200) DEFAULT NULL COMMENT '简历标题',
    `user_id`         BIGINT(20)   DEFAULT NULL COMMENT '用户 ID',
    `resume_detail`   TEXT         DEFAULT NULL COMMENT '完整简历结构数据 (JSON)',
    `visibility`      VARCHAR(20)  DEFAULT 'private' COMMENT '可见性：private/public',
    `locked`          TINYINT(1)   DEFAULT 0 COMMENT '是否锁定',
    `source`          VARCHAR(30)  DEFAULT 'ORIGINAL' COMMENT '来源：ORIGINAL/AI_GENERATED',
    `source_resume_id` BIGINT(20)  DEFAULT NULL COMMENT '来源简历 ID',
    `language`        VARCHAR(20)  DEFAULT 'CHINESE' COMMENT '语言：CHINESE/ENGLISH',
    `template_id`    BIGINT(20)   DEFAULT NULL COMMENT '关联模板 ID',
    `created_at`      DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at`      DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    INDEX `idx_user_id` (`user_id`) COMMENT '用户 ID 索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='简历信息表';
