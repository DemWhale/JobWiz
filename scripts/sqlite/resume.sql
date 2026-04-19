-- 简历信息表（SQLite 版本）
-- 严格对齐 data.json 顶层字段,不多不少
CREATE TABLE IF NOT EXISTS resume
(
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    gmt_create      TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    gmt_modified    TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- data.json 中的 11 个字段
    uuid            TEXT,                           -- uuid
    user_id         INTEGER,                        -- user_id
    user_uuid       TEXT,                           -- user_uuid
    title           TEXT,                           -- title
    template_id     INTEGER,                        -- template_id
    module_id       INTEGER,                        -- module_id
    content         TEXT,                           -- content (JSON)
    css_config      TEXT,                           -- css_config (JSON)
    preview_img     TEXT,                           -- preview_img
    detail_img      TEXT,                           -- detail_img
    share_status    INTEGER DEFAULT 0               -- share_status
);

-- 用户 ID 索引
CREATE INDEX IF NOT EXISTS idx_user_id ON resume (user_id);

-- UUID 唯一索引
CREATE UNIQUE INDEX IF NOT EXISTS idx_uuid ON resume (uuid);
