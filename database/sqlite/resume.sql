-- 简历信息表（SQLite 版本）
CREATE TABLE IF NOT EXISTS resume
(
    id              INTEGER PRIMARY KEY AUTOINCREMENT,  -- Long / IdType.AUTO
    slug            TEXT,                               -- String: 短链接标识
    title           TEXT,                               -- String: 简历标题
    user_id         INTEGER,                            -- Long: 用户 ID
    resume_detail   TEXT,                               -- String (JSON): 完整简历结构数据
    visibility      TEXT,                               -- String: private/public
    locked          INTEGER,                            -- Boolean: 是否锁定
    source          TEXT,                               -- String: ORIGINAL/AI_GENERATED
    source_resume_id INTEGER,                           -- Long: 来源简历 ID
    language        TEXT,                               -- String: CHINESE/ENGLISH
    template_id     INTEGER,                            -- Long: 关联模板 ID
    created_at      TEXT DEFAULT (datetime('now', 'localtime')),  -- Date (格式: yyyy-MM-dd HH:mm:ss)
    updated_at      TEXT DEFAULT (datetime('now', 'localtime'))    -- Date (格式: yyyy-MM-dd HH:mm:ss)
);

-- 用户 ID 索引
CREATE INDEX IF NOT EXISTS idx_user_id ON resume (user_id);
