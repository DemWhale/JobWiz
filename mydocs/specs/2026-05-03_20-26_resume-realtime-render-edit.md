# Spec: 简历实时渲染及编辑

## 当前理解

本轮目标是先完成简历编辑页的核心体验：左侧可编辑简历内容，右侧实时渲染预览，并确保编辑数据不会破坏现有新 schema 结构。后端 agentscope/AI 流程暂不进入本轮。

## 范围

In-Scope:
- 修复 `ResumeForm` 编辑回传时丢失 `css_config/title/template_id/user_id` 等顶层字段的问题。
- 修复模块不存在时更新失败的问题，保证基础信息、自我评价、教育、工作、项目、技能模块可编辑。
- 保持 `ResumeEdit` 左右分栏和 `ResumePreview` 数据驱动实时更新。
- 保持现有防抖保存逻辑，不新增依赖、不改锁文件、不做大范围重构。

Out-of-Scope:
- AI 对话/agentscope 后端接入。
- PDF/DOCX 导出。
- 富文本编辑器真实能力接入。
- 模板样式编辑器、拖拽排序、头像上传。

## 相关文件

- `frontend/jobwiz-console/src/pages/ResumeEdit.jsx`
- `frontend/jobwiz-console/src/components/resume/ResumeForm.jsx`
- `frontend/jobwiz-console/src/components/resume/ResumePreview.jsx`
- 必要时小范围调整对应 CSS。

## Done Contract

完成标准:
- 用户在左侧表单修改基础信息、自我评价、教育、工作、项目、技能时，右侧预览立即同步。
- `onChange` 返回的新数据保留原 `resumeData` 顶层字段和 `css_config`。
- 目标模块不存在时，第一次输入能创建模块并参与预览/保存。
- 不运行构建、测试、安装依赖，除非用户另行明确要求。

## 实施计划

1. 先修 `ResumeForm` 的数据更新函数：基于完整 `resumeData` 合并，而不是只返回 `{ content: { modules } }`。
2. 补齐模块 upsert 行为：找不到模块时插入默认模块，再更新 `child`。
3. 如发现预览字段映射有明显断点，仅做小范围修正。

## 风险

- 现有数据使用 `content.modules` 新 schema，不能回退到旧的 `basics/sections` 结构。
- 防抖保存会把 `content` 和 `css_config` 分别序列化，表单回传必须保留这两个字段。

## Change Log

- 已修改 `ResumeForm.jsx`：`updateModule` 现在保留完整 `resumeData` 顶层字段和 `content` 其他字段，仅替换 `content.modules`。
- 已修改 `ResumeForm.jsx`：目标模块不存在时会按模块名创建默认模块，解决首次输入不生效的问题。
- 已修改 `ResumeProjects.jsx`：项目预览兼容新 schema 字段 `project_title/project_role/start_time/end_time/project_detail`，同时保留旧字段兼容。
- 已修改 `resume.css`：自我评价、技能、经历详情预览保留 textarea 换行。

## Validation

- 已做静态 diff 检查，确认改动集中在 `ResumeForm.jsx`、`ResumeProjects.jsx`、`resume.css` 和本 spec。
- 按用户命令边界，未主动运行构建、测试、安装依赖。
- 建议人工验证：进入简历编辑页，分别修改姓名、自我评价、教育、工作、项目、技能，观察右侧预览是否即时同步；保存后刷新页面确认内容仍在。

## Resume / Handoff

本轮核心目标已完成代码侧最小修复，下一步可进行人工页面验证；若验证发现某个模块不显示，优先检查该模块表单字段与对应预览组件字段映射。
