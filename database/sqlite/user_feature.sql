-- 用户特征信息表（SQLite 版本）
-- 字段类型与 UserFeature 实体一一对应
CREATE TABLE IF NOT EXISTS user_feature
(
    id              INTEGER PRIMARY KEY AUTOINCREMENT,  -- Long / IdType.AUTO
    user_id         INTEGER,                            -- Long
    nickname        TEXT,                               -- String
    school          TEXT,                               -- String
    education       TEXT,                               -- String
    major           TEXT,                               -- String
    gender          TEXT,                               -- String
    graduation_date TEXT,                               -- LocalDate (格式: yyyy-MM-dd)
    email           TEXT,                               -- String
    target_position TEXT,                               -- String
    target_city     TEXT,                               -- String
    description     TEXT,                               -- String
    avatar_url      TEXT,                               -- String
    extend_fields   TEXT,                               -- String (JSON)
    create_time     TEXT DEFAULT (datetime('now', 'localtime')),  -- Date (格式: yyyy-MM-dd HH:mm:ss)
    update_time     TEXT DEFAULT (datetime('now', 'localtime'))   -- Date (格式: yyyy-MM-dd HH:mm:ss)
);

-- 用户 ID 唯一索引
CREATE UNIQUE INDEX IF NOT EXISTS uk_user_id ON user_feature (user_id);
