-- 简历模板表（SQLite 版本）
CREATE TABLE IF NOT EXISTS resume_template
(
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL,                   -- 模板标识名（rhyhorn, glalie 等）
    title       TEXT NOT NULL,                   -- 模板显示名（经典、简约 等）
    preview     TEXT,                            -- 预览图 URL
    permission  TEXT DEFAULT '["free"]',         -- JSON: ["free"] / ["vip"]
    meta        TEXT,                            -- JSON: 模板配置(layout/theme/typography/css/page)
    columns     INTEGER DEFAULT 1,              -- 栏数
    is_vip      INTEGER DEFAULT 0,              -- 是否 VIP 模板
    description TEXT DEFAULT '',                 -- 模板描述
    created_at  TEXT DEFAULT (datetime('now', 'localtime')),
    updated_at  TEXT DEFAULT (datetime('now', 'localtime'))
);
