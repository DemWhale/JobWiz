# Context Bundle: 简历功能开发

## Source Index
- `mydocs/prd/AI Agent 简历功能 Prd.md` — PRD 主文档（含设计稿引用、数据结构、功能描述）
- `mydocs/prd/image-1.png` — 登录后引导页设计稿
- `mydocs/prd/image-3.png` — 简历列表页设计稿
- `mydocs/prd/image-4.png` — 手动编辑简历页设计稿
- `mydocs/prd/image-5.png` — 新建简历页设计稿
- `mydocs/prd/image-6.png` — 快速锚定功能设计稿
- `mydocs/prd/image.png` — 原始页面（改版前）
- `mydocs/specs/2026-04-12_resume-agents-agui.md` — 已有 AGUI Agent Spec

## Requirement Facts

### 功能一：欢迎页改版
1. **移除原有欢迎页面全部内容**，重新设计
2. **个人信息放到左下角**，供用户查看和编辑
3. **保留聊天输入框**，默认引导文案需与设计稿一致
4. **"创建简历"为默认可点击项**，点击后跳转到简历列表页
5. 后续会接入 AGUI 协议实现功能

### 功能二：简历列表
1. **新增简历列表页面**，基于用户维度查询所有简历
2. **需要新建数据库表**管理用户简历
3. **支持新建或导入简历**
4. **hover 时显示两个操作按钮**：手动编辑、AI编辑
5. 简历数据结构参考 PRD 中的 JSON Schema

### 功能三：新建简历
1. **后端维护简历模板**标准信息
2. **前端获取并展示模板列表**供用户选择
3. 选择模板后进入表单页（与手动编辑共用）
4. 模板数据结构参考 PRD 中的 JSON Schema

### 功能四：手动编辑简历
1. **左右分栏**：左侧表单 + 右侧实时预览
2. **右侧预览使用选定模板渲染**
3. **反向锚定**：右侧模块可点击定位到左侧对应表单区域
4. 新建和编辑共用同一页面，区别在于是否已有数据
5. 参考样例：`/Users/xudemin/Downloads/HaopengXu_SQL 开发_2026_4_12 - Lw3SYN.html`

## Business Rules
1. 简历标题格式：`{姓名}_{岗位}_{日期}`（如 `HaopengXu_SQL 开发_2026/4/12`）
2. 简历可见性：`visibility` 字段（private/public）
3. 简历语言：`language` 字段（CHINESE）
4. 简历来源：`source` 字段（ORIGINAL / AI_GENERATED）
5. 模板权限：`permission` 字段（free / vip）
6. 简历标准数据结构包含：basics, metadata, sections（awards, skills, summary, profiles, projects, education, interests, languages, volunteer, experience, references, publications, certifications）

## Constraints
1. 前端技术栈：React 19 + Vite 8 + 纯 CSS（不引入新框架）
2. 后端技术栈：Java 21 + Spring Boot 4 + MyBatis Plus
3. 数据库：SQLite（testing）/ MySQL（pre/product），需同时兼容
4. 简历核心数据（sections）以 JSON 格式存储
5. 模板元数据（meta）以 JSON 格式存储
6. 需兼容现有 AGUI Agent 体系
7. 前端需 1:1 还原设计稿

## Conflicts & Ambiguities
1. **设计稿图片无法直接查看**：无法确认精确的 UI 细节（颜色、间距、字体等），需用户确认
2. **简历渲染引擎**：PRD 提到"通过 CSS + HTML 拼接完成简历可视化"，但未指定具体的渲染方案
3. **AI 编辑入口**：PRD 提到 hover 时显示"AI编辑"，但未详细说明 AI 编辑的交互流程
4. **简历导入**：PRD 提到"导入简历"，但未说明导入格式（PDF/Word/JSON）
5. **模板管理**：PRD 提到后端维护模板，但未说明模板的 CRUD 管理界面
6. **参考样例文件**：PRD 提到本地 HTML 样例，需确认是否可用

## Open Questions
1. 设计稿中欢迎页的具体布局和文案是什么？需确认"创建简历"按钮的位置和样式
2. 简历渲染方案如何选择？纯前端渲染 vs 后端渲染（PDF）
3. AI 编辑功能的交互流程是什么？是否使用现有 AGUI Agent？
4. 简历导入支持哪些格式？本期是否实现？
5. 模板管理是平台内部管理还是需要管理后台？本期需要几套模板？
6. 本期开发范围是否包含简历在线渲染的完整实现？还是仅搭建数据结构和页面骨架？

## Next Actions
1. 创建首版 Spec，确认开发范围和优先级
2. 与用户确认 Open Questions
3. 进入 Research 阶段深入分析
