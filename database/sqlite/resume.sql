-- 简历信息表（SQLite 版本）
CREATE TABLE IF NOT EXISTS resume
(
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    gmt_create      TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    gmt_modified    TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    slug            TEXT,
    title           TEXT,
    user_id         INTEGER,
    resume_detail   TEXT,
    visibility      TEXT,
    locked          INTEGER,
    source          TEXT,
    source_resume_id INTEGER,
    language        TEXT,
    template_id     INTEGER
);

-- 用户 ID 索引
CREATE INDEX IF NOT EXISTS idx_user_id ON resume (user_id);
