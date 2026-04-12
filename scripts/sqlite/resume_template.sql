-- 简历模板表（SQLite 版本）
CREATE TABLE IF NOT EXISTS resume_template
(
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    gmt_create  TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    gmt_modified TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    name        TEXT NOT NULL,
    title       TEXT NOT NULL,
    preview     TEXT,
    permission  TEXT DEFAULT '["free"]',
    meta        TEXT,
    columns     INTEGER DEFAULT 1,
    is_vip      INTEGER DEFAULT 0,
    description TEXT DEFAULT ''
);
