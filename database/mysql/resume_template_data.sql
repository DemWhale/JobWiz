-- 简历模板初始化数据（MySQL 版本）
-- 9 套预置模板

INSERT INTO `resume_template` (`id`, `name`, `title`, `preview`, `permission`, `meta`, `columns`, `is_vip`, `description`) VALUES
(1, 'rhyhorn', '经典', '/templates/rhyhorn.jpg', '["free"]',
 '{"css":{"value":"","visible":false},"page":{"format":"a4","margin":28,"options":{"breakLine":true,"pageNumbers":true}},"theme":{"text":"#242424","primary":"#2563eb","background":"#fffefe"},"layout":[[["education","profiles","experience","projects","summary","volunteer","references"],["languages","skills","interests","certifications","awards","publications"]]],"template":"rhyhorn","typography":{"font":{"size":13,"family":"Noto Sans SC","subset":"chinese-simplified","variants":["regular"]},"hideIcons":false,"lineHeight":1.3,"underlineLinks":false}}',
 1, 0, '经典双栏模板，适合大多数求职场景'),

(2, 'glalie', '简约', '/templates/glalie.jpg', '["free"]',
 '{"css":{"value":"","visible":false},"page":{"format":"a4","margin":24,"options":{"breakLine":true,"pageNumbers":false}},"theme":{"text":"#333333","primary":"#4a5568","background":"#ffffff"},"layout":[[["summary","experience","projects","education"],["skills","languages","certifications","interests"]]],"template":"glalie","typography":{"font":{"size":12,"family":"Noto Sans SC","subset":"chinese-simplified","variants":["regular"]},"hideIcons":true,"lineHeight":1.4,"underlineLinks":false}}',
 1, 0, '简约风格，内容为主，适合技术岗位'),

(3, 'onyx', '人事简历', '/templates/onyx.jpg', '["free"]',
 '{"css":{"value":"","visible":false},"page":{"format":"a4","margin":30,"options":{"breakLine":true,"pageNumbers":true}},"theme":{"text":"#1a1a2e","primary":"#0f3460","background":"#ffffff"},"layout":[[["summary","experience","education","projects"],["skills","languages","certifications","interests"]]],"template":"onyx","typography":{"font":{"size":13,"family":"Noto Sans SC","subset":"chinese-simplified","variants":["regular"]},"hideIcons":false,"lineHeight":1.3,"underlineLinks":true}}',
 1, 0, '人事岗位专用模板，突出沟通与组织能力'),

(4, 'pikachu', '社招通用', '/templates/pikachu.jpg', '["free"]',
 '{"css":{"value":"","visible":false},"page":{"format":"a4","margin":28,"options":{"breakLine":true,"pageNumbers":true}},"theme":{"text":"#2d3748","primary":"#e53e3e","background":"#ffffff"},"layout":[[["summary","experience","projects","education"],["skills","languages","certifications","awards"]]],"template":"pikachu","typography":{"font":{"size":13,"family":"Noto Sans SC","subset":"chinese-simplified","variants":["regular"]},"hideIcons":false,"lineHeight":1.3,"underlineLinks":false}}',
 1, 0, '社会招聘通用模板，突出工作经验'),

(5, 'gengar', '财务简历', '/templates/gengar.jpg', '["free"]',
 '{"css":{"value":"","visible":false},"page":{"format":"a4","margin":28,"options":{"breakLine":true,"pageNumbers":true}},"theme":{"text":"#1a202c","primary":"#2b6cb0","background":"#ffffff"},"layout":[[["summary","experience","education","certifications"],["skills","languages","awards","interests"]]],"template":"gengar","typography":{"font":{"size":12,"family":"Noto Sans SC","subset":"chinese-simplified","variants":["regular"]},"hideIcons":false,"lineHeight":1.35,"underlineLinks":false}}',
 1, 0, '财务岗位模板，突出证书与专业能力'),

(6, 'leafish', '产品经理', '/templates/leafish.jpg', '["free"]',
 '{"css":{"value":"","visible":false},"page":{"format":"a4","margin":28,"options":{"breakLine":true,"pageNumbers":true}},"theme":{"text":"#2d3748","primary":"#38a169","background":"#ffffff"},"layout":[[["summary","experience","projects","education"],["skills","languages","certifications","interests"]]],"template":"leafish","typography":{"font":{"size":13,"family":"Noto Sans SC","subset":"chinese-simplified","variants":["regular"]},"hideIcons":false,"lineHeight":1.3,"underlineLinks":true}}',
 1, 0, '产品经理模板，突出项目经验与数据驱动'),

(7, 'inkypo', '程序员简历', '/templates/inkypo.jpg', '["free"]',
 '{"css":{"value":"","visible":false},"page":{"format":"a4","margin":24,"options":{"breakLine":true,"pageNumbers":false}},"theme":{"text":"#e2e8f0","primary":"#63b3ed","background":"#1a202c"},"layout":[[["summary","experience","projects","education"],["skills","languages","certifications","interests"]]],"template":"inkypo","typography":{"font":{"size":12,"family":"JetBrains Mono","subset":"latin","variants":["regular"]},"hideIcons":true,"lineHeight":1.4,"underlineLinks":true}}',
 1, 0, '程序员暗色模板，突出技术栈与项目'),

(8, 'chikorita', '校招通用', '/templates/chikorita.jpg', '["free"]',
 '{"css":{"value":"","visible":false},"page":{"format":"a4","margin":28,"options":{"breakLine":true,"pageNumbers":true}},"theme":{"text":"#2d3748","primary":"#48bb78","background":"#ffffff"},"layout":[[["education","projects","experience","summary"],["skills","languages","certifications","awards","interests"]]],"template":"chikorita","typography":{"font":{"size":13,"family":"Noto Sans SC","subset":"chinese-simplified","variants":["regular"]},"hideIcons":false,"lineHeight":1.3,"underlineLinks":false}}',
 1, 0, '校园招聘模板，突出教育背景与项目经验'),

(9, 'bruxish', '实习通用', '/templates/bruxish.jpg', '["free"]',
 '{"css":{"value":"","visible":false},"page":{"format":"a4","margin":28,"options":{"breakLine":true,"pageNumbers":true}},"theme":{"text":"#2d3748","primary":"#ed8936","background":"#ffffff"},"layout":[[["education","projects","experience","summary"],["skills","languages","certifications","interests"]]],"template":"bruxish","typography":{"font":{"size":13,"family":"Noto Sans SC","subset":"chinese-simplified","variants":["regular"]},"hideIcons":false,"lineHeight":1.3,"underlineLinks":false}}',
 1, 0, '实习生模板，突出学习能力与项目实践');
