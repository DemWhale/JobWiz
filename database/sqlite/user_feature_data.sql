-- 插入示例用户数据（SQLite 版本）
-- 用户 1: 清华大学 - 计算机科学与技术专业
INSERT INTO user_feature (
    user_id, nickname, school, education, major, gender,
    graduation_date, email, target_position, target_city,
    description, avatar_url, extend_fields, create_time, update_time
) VALUES (
    1001,
    '张明',
    '清华大学',
    '本科',
    '计算机科学与技术',
    '男',
    '2024-06-30',
    'zhangming@example.com',
    'Java 开发工程师',
    '北京',
    '热爱编程，熟悉 Java 技术栈，有扎实的算法基础。在校期间参与多个开源项目，获得 ACM 竞赛省级奖项。期望在一线互联网公司从事后端开发工作。',
    'https://example.com/avatars/zhangming.jpg',
    '{"skills": ["Java", "Spring Boot", "MySQL", "Redis"], "certificates": ["英语六级", "软件设计师"], "internship": "某互联网大厂后端开发实习"}',
    datetime('now', 'localtime'),
    datetime('now', 'localtime')
);

-- 用户 2: 浙江大学 - 软件工程专业
INSERT INTO user_feature (
    user_id, nickname, school, education, major, gender,
    graduation_date, email, target_position, target_city,
    description, avatar_url, extend_fields, create_time, update_time
) VALUES (
    1002,
    '李雨欣',
    '浙江大学',
    '硕士',
    '软件工程',
    '女',
    '2025-03-31',
    'liyuxin@example.com',
    '前端开发工程师',
    '杭州',
    '对前端开发充满热情，精通 Vue.js 和 React 框架。注重用户体验，有良好的设计审美。研究生期间研究方向为人机交互，发表过相关论文。',
    'https://example.com/avatars/liyuxin.jpg',
    '{"skills": ["JavaScript", "Vue.js", "React", "TypeScript", "CSS"], "certificates": ["英语六级", "前端工程师认证"], "projects": ["电商平台重构", "可视化数据大屏"]}',
    datetime('now', 'localtime'),
    datetime('now', 'localtime')
);
