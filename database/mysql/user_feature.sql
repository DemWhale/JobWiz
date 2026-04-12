-- 用户特征信息表
CREATE TABLE IF NOT EXISTS `user_feature`
(
    `id`              bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT '主键',
    `gmt_create`      datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `gmt_modified`    datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
    `user_id`         BIGINT(20)   DEFAULT NULL COMMENT '用户 ID',
    `nickname`        VARCHAR(50)  DEFAULT NULL COMMENT '用户昵称',
    `school`          VARCHAR(100) DEFAULT NULL COMMENT '学校',
    `education`       VARCHAR(50)  DEFAULT NULL COMMENT '学历',
    `major`           VARCHAR(100) DEFAULT NULL COMMENT '专业',
    `gender`          VARCHAR(10)  DEFAULT NULL COMMENT '性别',
    `graduation_date` DATE         DEFAULT NULL COMMENT '毕业时间',
    `email`           VARCHAR(100) DEFAULT NULL COMMENT '邮箱',
    `target_position` VARCHAR(100) DEFAULT NULL COMMENT '意向岗位',
    `target_city`     VARCHAR(50)  DEFAULT NULL COMMENT '意向城市',
    `description`     TEXT         DEFAULT NULL COMMENT '自我描述',
    `avatar_url`      VARCHAR(500) DEFAULT NULL COMMENT '头像 URL',
    `extend_fields`   TEXT         DEFAULT NULL COMMENT '扩展字段 (JSON 格式)',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_user_id` (`user_id`) COMMENT '用户 ID 唯一索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户特征信息表';
