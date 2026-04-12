# JobWiz Console (OfferShow)

> 智能求职助手 Web 控制台 — 从简历打磨到面试准备，陪你从简历到 Offer。

## 项目概述

JobWiz Console 是 [JobWiz](https://github.com/your-org/jobwiz) 项目的前端控制台应用，代号 **OfferShow**。它为求职者提供一站式服务：简历创建与编辑、AI 智能助手对话、校招信息推荐、面试准备指导等。

### 核心功能

| 功能模块 | 说明 |
|---------|------|
| **AI 助手** | 首页对话式交互，通过服务卡片快速触达核心功能 |
| **简历管理** | 简历列表、创建、编辑、预览；支持多模板选择 |
| **用户画像** | 个人基本信息管理（学历、经历、求职意向等） |
| **未来扩展** | 数据分析、代码工具、职业洞察（路由已预留） |

---

## 技术栈

| 类别 | 技术 | 版本 |
|-----|------|------|
| 构建工具 | [Vite](https://vitejs.dev/) | ^8.0.1 |
| 前端框架 | [React](https://react.dev/) | ^19.2.4 |
| 路由 | [React Router](https://reactrouter.com/) | ^7.13.2 |
| HTTP 客户端 | [Axios](https://axios-http.com/) | ^1.14.0 |
| 图标 | [Lucide React](https://lucide.dev/) | ^1.8.0 |
| 代码检查 | [ESLint](https://eslint.org/) + Flat Config | ^9.39.4 |

---

## 项目结构

```
jobwiz-console/
├── public/                    # 静态公共资源
│   ├── favicon.svg            # 网站 favicon
│   └── icons.svg              # 图标集
├── src/
│   ├── main.jsx               # 应用入口，React 18+ createRoot
│   ├── App.jsx                # 根组件：路由配置、全局状态、布局
│   ├── App.css
│   ├── index.css              # 全局 CSS 变量、样式重置
│   │
│   ├── components/            # 通用 UI 组件
│   │   ├── Sidebar.jsx        # 左侧导航栏（深色主题，图标导航）
│   │   ├── ChatWindow.jsx     # 首页服务卡片展示区
│   │   ├── InputArea.jsx      # 底部消息输入框
│   │   ├── QuickActions.jsx   # 快捷操作按钮组
│   │   ├── UserAvatar.jsx     # 用户头像 + 下拉菜单
│   │   ├── TemplateSelector.jsx  # 新建简历时的模板选择弹窗
│   │   │
│   │   └── resume/            # 简历编辑相关组件
│   │       ├── ResumeForm.jsx       # 左侧编辑表单（basics + 多个 sections）
│   │       ├── ResumePreview.jsx    # 右侧实时预览
│   │       ├── FormToolbar.jsx      # 表单工具栏（富文本预留）
│   │       ├── SectionFormItem.jsx  # 可折叠的表单区块包装器
│   │       ├── ResumeHeader.jsx      # 简历头部（姓名、联系方式）
│   │       ├── ResumeEducation.jsx  # 教育经历区块
│   │       ├── ResumeExperience.jsx # 实习/工作经历区块
│   │       ├── ResumeProjects.jsx   # 项目经历区块
│   │       ├── ResumeSkills.jsx      # 技能区块
│   │       ├── ResumeCertifications.jsx # 证书区块
│   │       └── ...                   # 其他简历区块（Languages, Awards, etc.）
│   │
│   ├── pages/                 # 页面级组件
│   │   ├── Login.jsx           # 登录页（输入 userId，直接登录）
│   │   ├── Home.jsx            # 首页（AI 助手 + 服务入口）
│   │   ├── Profile.jsx         # 用户画像编辑页
│   │   ├── ResumeList.jsx      # 简历列表页
│   │   └── ResumeEdit.jsx      # 简历编辑页（左侧表单 + 右侧预览）
│   │
│   └── services/              # API 抽象层
│       └── api.js             # Axios 实例 + userFeatureApi / resumeApi / resumeTemplateApi
│
├── index.html                 # HTML 模板
├── vite.config.js             # Vite 配置
├── eslint.config.js           # ESLint Flat Config 配置
├── package.json
└── start.sh                   # 一键启动脚本（检查端口 + 安装依赖 + 启动 dev server）
```

---

## 架构设计

### 路由结构

React Router v7 路由，**登录页公开**，其余路由受 `ProtectedRoute` 保护：

```
/login          → Login              (公开)
/              → Home               (需登录)
/profile        → Profile            (需登录)
/resumes        → ResumeList        (需登录)
/resume/new     → Placeholder        (需登录，Spec C 预留)
/resume/edit/:id → ResumeEdit        (需登录)
```

> **路由守卫逻辑**：App 在 `useEffect` 中检查 `localStorage.userId`。有则自动恢复登录态并拉取用户画像；无则跳转 `/login`。

### 布局模式

除登录页外，所有页面使用 `AppLayout` 外壳：

```
┌──────────┬────────────────────────────────┐
│          │                                │
│ Sidebar  │         main content           │
│  (72px)  │         (flex: 1)             │
│          │                                │
└──────────┴────────────────────────────────┘
```

### 状态管理

- **用户态**：App 组件通过 props + callback 向下传递 `userId` / `userFeature` / `isLoggedIn`
- **简历数据**：ResumeEdit 页面本地管理 `resumeData`（JSON 结构），通过防抖自动保存到后端
- **localStorage**：仅持久化 `userId`（最小化敏感数据）

### API 层设计

统一 Axios 实例（`baseURL: http://localhost:8080/api`），按业务域拆分为：

| API 模块 | 封装方法 |
|---------|---------|
| `userFeatureApi` | `getUserFeature`, `saveOrUpdate`, `list` |
| `resumeApi` | `listByUserId`, `getById`, `create`, `update`, `delete` |
| `resumeTemplateApi` | `list`, `getById` |

所有接口均返回 `response.data.data`（统一响应包装），`resumeTemplateApi` 除外（部分接口直接返回数据）。

### 简历数据模型

简历内容以 JSON 字符串存储在 `resume.resumeDetail` 字段：

```json
{
  "basics": {
    "name": "张明",
    "headline": "数据分析师",
    "email": "zhang@example.com",
    "phone": "138xxxx8888",
    "location": "上海",
    "url": ""
  },
  "sections": {
    "summary": { "content": "..." },
    "education": [{ "institution": "...", "area": "...", "studyType": "...", "date": "..." }],
    "experience": [{ "company": "...", "position": "...", "date": "...", "summary": "..." }],
    "projects": [{ "name": "...", "date": "...", "summary": "..." }],
    "skills": [{ "name": "...", "level": 3, "keywords": ["SQL", "Python"] }],
    "certifications": [{ "name": "...", "issuer": "...", "date": "..." }]
  }
}
```

---

## 快速开始

### 环境要求

- Node.js >= 18
- npm >= 9
- 后端服务运行于 `http://localhost:8080`（API 端口）

### 启动步骤

**方式一：一键启动（推荐）**

```bash
./start.sh
```

脚本会自动：
1. 检查并清理 5173 端口占用
2. 安装 npm 依赖
3. 启动 Vite 开发服务器（热更新）

**方式二：手动启动**

```bash
npm install
npm run dev
```

### 构建生产版本

```bash
npm run build    # 构建到 dist/
npm run preview  # 预览构建结果
```

### 代码检查

```bash
npm run lint      # ESLint 检查
```

---

## 开发指南

### 添加新页面

1. 在 `src/pages/` 下创建组件（如 `Analytics.jsx`）
2. 在 `App.jsx` 的 `<Routes>` 中添加路由

```jsx
<Route
  path="/analytics"
  element={
    <ProtectedRoute>
      <Analytics />
    </ProtectedRoute>
  }
/>
```

3. 在 `Sidebar.jsx` 的 `navItems` 中添加导航项

### 添加简历新 Section

1. 在 `src/components/resume/` 创建新组件（如 `ResumeNewSection.jsx`）
2. 在 `ResumeForm.jsx` 中导入并渲染
3. 在 `ResumePreview.jsx` 中添加对应的预览渲染逻辑

### API 调用规范

```js
import { resumeApi } from '../services/api';

// 获取数据
const resumes = await resumeApi.listByUserId(userId);

// 创建/更新（自动处理响应包装）
await resumeApi.create({ userId: 1001, title: '我的简历', ... });
```

---

## 环境变量

| 变量 | 默认值 | 说明 |
|-----|-------|------|
| `VITE_API_BASE_URL` | `http://localhost:8080/api` | API 基础路径（预留） |

> 当前 API 地址硬编码在 `services/api.js` 中，后续可通过 `.env` 文件配置。

---

## 配色方案

```css
--color-primary:        #2563eb   /* 品牌蓝 */
--color-primary-hover:  #1d4ed8
--color-success:        #22c55e   /* 成功绿 */
--color-warning:        #f59e0b   /* 警告橙 */
--color-danger:         #ef4444   /* 危险红 */

--text-primary:         #1e293b   /* 主文本 */
--text-secondary:       #64748b   /* 次要文本 */
--text-tertiary:        #94a3b8   /* 占位符 */

--sidebar-bg:           #1e293b   /* 侧边栏背景（深色） */
--sidebar-width:        72px      /* 侧边栏宽度 */
```

---

## 测试账号

| 用户 ID | 姓名 | 说明 |
|-------|------|------|
| `1001` | 张明 | 测试账号，预设完整用户画像 |
| `1002` | 李雨欣 | 测试账号 |

直接登录页输入 userId 即可登录，无需密码。

---

## 后续规划（TODO）

| 功能 | 状态 | 说明 |
|-----|------|------|
| Spec C — 新建简历完整流程 | 建设中 | `/resume/new` 页面 |
| Spec D — AI 对话功能 | 待开发 | 消息发送与 AI 回复 |
| Spec E — AI 辅助编辑简历 | 待开发 | 输入法联动、反向锚定 |
| `/analytics` 数据分析页 | 预留路由 | — |
| `/code` 代码工具页 | 预留路由 | — |
| `/insights` 职业洞察页 | 预留路由 | — |

---

## 相关项目

- **JobWiz Backend** — 后端 API 服务（Spring Boot）：`jobwiz-backend`
- **JobWiz Mobile** — 移动端应用（React Native）：`jobwiz-mobile`（规划中）

---

## 许可证

MIT License
