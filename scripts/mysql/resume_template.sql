-- 简历模板表
CREATE TABLE IF NOT EXISTS `resume_template`
(
    `id`          bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT '主键',
    `gmt_create`  datetime      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `gmt_modified` datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
    `name`        VARCHAR(50)   NOT NULL COMMENT '模板标识名（rhyhorn, glalie 等）',
    `title`       VARCHAR(100)  NOT NULL COMMENT '模板显示名（经典、简约 等）',
    `preview`     VARCHAR(500)  DEFAULT NULL COMMENT '预览图 URL',
    `permission`  VARCHAR(100)  DEFAULT '["free"]' COMMENT 'JSON: ["free"] / ["vip"]',
    `meta`        TEXT          DEFAULT NULL COMMENT 'JSON: 模板配置(layout/theme/typography/css/page)',
    `columns`     INT           DEFAULT 1 COMMENT '栏数',
    `is_vip`      TINYINT(1)    DEFAULT 0 COMMENT '是否 VIP 模板',
    `description` VARCHAR(500)  DEFAULT '' COMMENT '模板描述',
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='简历模板表';
