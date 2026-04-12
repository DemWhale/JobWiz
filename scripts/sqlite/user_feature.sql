-- 用户特征信息表（SQLite 版本）
CREATE TABLE IF NOT EXISTS user_feature
(
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    gmt_create      TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    gmt_modified    TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_id         INTEGER,
    nickname        TEXT,
    school          TEXT,
    education       TEXT,
    major           TEXT,
    gender          TEXT,
    graduation_date TEXT,
    email           TEXT,
    target_position TEXT,
    target_city     TEXT,
    description     TEXT,
    avatar_url      TEXT,
    extend_fields   TEXT
);

-- 用户 ID 唯一索引
CREATE UNIQUE INDEX IF NOT EXISTS uk_user_id ON user_feature (user_id);
