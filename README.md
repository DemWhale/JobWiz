# JobWiz (OfferShow)

> AI 智能招聘求职助手 — 从简历打磨到面试准备，陪你从简历到 Offer。

[![Java Version](https://img.shields.io/badge/Java-21-blue.svg)](https://adoptium.net/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0.4-green.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19.2.4-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.0.1-yellow.svg)](https://vitejs.dev/)
[![AgentScope](https://img.shields.io/badge/AgentScope-AG--UI-orange.svg)](https://agentscope.io/)

---

## 项目简介

JobWiz（代号 OfferShow）是一个**全栈 AI 求职助手**，面向大学生与研究生，以 Java + Spring AI + React 为核心技术栈，围绕大模型、RAG、Rerank、Skills、ReAct Agent、AGUI 构建实战体系，完成陪伴式 AI 求职助手的落地。

### 核心功能

| 模块 | 功能 | 状态 |
|-----|------|------|
| **AI 助手** | 首页对话式交互 + 服务卡片入口（简历诊断/创建简历/校招推荐/面试准备/职业规划） | ✅ 已完成 |
| **用户画像** | 基本信息管理（学历、经历、求职意向） | ✅ 已完成 |
| **简历管理** | 列表、创建、编辑、预览；支持多模板 | ✅ 已完成 |
| **简历编辑** | 左侧表单编辑 + 右侧实时预览，防抖自动保存 | ✅ 已完成 |
| **AI Agent** | 基于 AgentScope/AG-UI 的简历修改 Agent | ✅ 已完成 |
| **AI 对话编辑** | AI 辅助编辑简历（Spec E） | 🔨 建设中 |
| **校招推荐** | 多路召回 + RAG 匹配 | 📋 规划中 |
| **模拟面试** | RAG + Rerank 题库推荐 | 📋 规划中 |

---

## 技术架构

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│                   React 19 + Vite + React Router 7           │
│                         Port: 5173                          │
└─────────────────────────────┬───────────────────────────────┘
                              │ HTTP / AG-UI (WebSocket)
┌─────────────────────────────▼───────────────────────────────┐
│                         Backend                              │
│              Spring Boot 4.0 + AgentScope AG-UI              │
│                         Port: 8080                           │
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐  │
│  │ job-wiz-    │  job-wiz-   │ job-wiz-    │  job-wiz-   │  │
│  │   start     │   common    │   dal       │   service   │  │
│  │ (启动器+    │ (公共模型+   │ (MyBatis+   │ (业务逻辑)   │  │
│  │  Controller)│   Agent)     │   实体)     │             │  │
│  └─────────────┴─────────────┴─────────────┴─────────────┘  │
└─────────────────────────────┬───────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              │        Database               │
              │   MySQL (生产) / SQLite (开发) │
              └───────────────────────────────┘
```

### 技术栈

#### Frontend
| 技术 | 版本 | 用途 |
|-----|------|------|
| [Vite](https://vitejs.dev/) | ^8.0.1 | 构建工具 |
| [React](https://react.dev/) | ^19.2.4 | UI 框架 |
| [React Router](https://reactrouter.com/) | ^7.13.2 | 路由管理 |
| [Axios](https://axios-http.com/) | ^1.14.0 | HTTP 客户端 |
| [Lucide React](https://lucide.dev/) | ^1.8.0 | 图标库 |
| [ESLint](https://eslint.org/) | ^9.39.4 | 代码检查 |

#### Backend
| 技术 | 版本 | 用途 |
|-----|------|------|
| Java | 21 | 运行时 |
| [Spring Boot](https://spring.io/projects/spring-boot) | 4.0.4 | Web 框架 |
| [AgentScope](https://agentscope.io/) | 1.0.11 | AI Agent 框架 |
| [AG-UI Protocol](https://agentscope.io/) | — | Agent UI 通信协议 |
| [MyBatis Plus](https://baomidou.com/) | 3.5.5 | ORM 框架 |
| [MySQL](https://www.mysql.com/) | 8.0.33 | 生产数据库 |
| [SQLite](https://www.sqlite.org/) | 3.45.1.0 | 开发数据库 |
| DashScope (阿里云) | — | 大模型 API |

---

## 项目结构

```
JobWiz/
├── frontend/                          # 前端应用 (React)
│   └── jobwiz-console/               # OfferShow 控制台
│       ├── src/
│       │   ├── main.jsx             # 入口
│       │   ├── App.jsx             # 根组件 + 路由 + 全局状态
│       │   ├── components/         # UI 组件
│       │   │   ├── Sidebar.jsx     # 左侧导航栏
│       │   │   ├── ChatWindow.jsx  # 首页 AI 服务卡片
│       │   │   ├── InputArea.jsx    # 消息输入框
│       │   │   ├── TemplateSelector.jsx  # 模板选择弹窗
│       │   │   ├── UserAvatar.jsx  # 用户头像
│       │   │   └── resume/         # 简历编辑组件
│       │   │       ├── ResumeForm.jsx    # 左侧编辑表单
│       │   │       ├── ResumePreview.jsx # 右侧预览
│       │   │       └── ...               # 各区块组件
│       │   ├── pages/              # 页面
│       │   │   ├── Login.jsx        # 登录页
│       │   │   ├── Home.jsx         # 首页
│       │   │   ├── Profile.jsx      # 用户画像
│       │   │   ├── ResumeList.jsx   # 简历列表
│       │   │   └── ResumeEdit.jsx   # 简历编辑
│       │   └── services/
│       │       └── api.js          # API 封装 (Axios)
│       ├── start.sh                # 一键启动脚本
│       └── package.json
│
├── backend/                          # 后端应用 (Spring Boot Maven 多模块)
│   ├── pom.xml                     # 父 POM (版本与依赖管理)
│   ├── job-wiz-start/              # 启动模块
│   │   └── src/main/java/com/offershow/job/wiz/start/
│   │       ├── JobWizApplication.java   # 启动类
│   │       ├── config/
│   │       │   ├── AgentConfiguration.java  # AgentScope Agent 注册
│   │       │   ├── AguiConfig.java           # AG-UI 配置
│   │       │   ├── CorsConfig.java           # 跨域配置
│   │       │   ├── DashScopeModelConfig.java # 大模型配置
│   │       │   └── ExampleTools.java          # Agent Tools 示例
│   │       └── controller/
│   │           ├── GlobalExceptionHandler.java
│   │           ├── ResumeController.java      # 简历 CRUD
│   │           ├── ResumeTemplateController.java
│   │           └── UserFeatureController.java # 用户画像
│   │
│   ├── job-wiz-common/              # 公共模块
│   │   └── src/main/java/com/offershow/job/wiz/common/
│   │       ├── model/
│   │       │   └── ApiResponse.java      # 统一响应结构
│   │       ├── dto/
│   │       │   └── ResumeDetailDTO.java   # 简历详情 DTO
│   │       ├── enums/
│   │       │   └── BizCodeEnum.java       # 业务码枚举
│   │       ├── agents/                     # Agent 定义
│   │       │   ├── BaseInfoAgent.java     # 基础信息修改 Agent
│   │       │   ├── InterestAgent.java     # 兴趣分析 Agent
│   │       │   └── EduBackgroundAgent.java
│   │       └── utils/
│   │           └── StringUtils.java
│   │
│   ├── job-wiz-dal/                 # 数据访问层
│   │   └── src/main/java/com/offershow/job/wiz/dal/
│   │       ├── entity/              # 实体类
│   │       │   ├── Resume.java      # 简历实体
│   │       │   ├── ResumeTemplate.java
│   │       │   └── UserFeature.java # 用户画像实体
│   │       ├── mapper/             # MyBatis Mapper
│   │       └── config/              # 数据库配置
│   │           ├── JobWizMybatisPlusConfig.java
│   │           └── JobWizSqliteConfig.java
│   │
│   └── job-wiz-service/             # 业务逻辑层
│       └── src/main/java/com/offershow/job/wiz/service/
│           ├── ResumeService.java
│           ├── ResumeTemplateService.java
│           └── UserFeatureService.java
│
├── database/                        # 数据库脚本
│   ├── mysql/                      # MySQL 初始化脚本
│   └── sqlite/                      # SQLite 初始化脚本
│
├── scripts/                        # 工具脚本
│   ├── agui.http                   # AG-UI 接口测试
│   └── biz_methond.http           # 业务接口测试
│
├── mydocs/                        # 项目文档
│   ├── specs/                     # 功能规格文档 (Spec A/B/C/D/E)
│   ├── restful/                   # REST API 接口文档
│   │   ├── resume-api.md
│   │   ├── resume-template-api.md
│   │   └── user-feature-api.md
│   ├── context/                   # 需求上下文
│   ├── codemap/                   # 代码地图
│   └── prd/                       # 产品需求文档
│
├── AGENTS.md                      # AI Agent 工作指南
├── README.md                      # 本文件
└── pom.xml                        # 根 Maven 配置 (modules 定义)
```

---

## 快速开始

### 环境要求

| 组件 | 版本要求 |
|-----|---------|
| Node.js | >= 18 |
| npm | >= 9 |
| Java | 21 |
| Maven | >= 3.9 |
| MySQL | 8.0 (可选，生产环境) |
| SQLite | 3.45 (开发环境内置) |

### 1. 启动后端

```bash
cd backend

# 方式一：使用 Maven 启动（开发环境使用 SQLite）
mvn clean compile
mvn spring-boot:run -pl job-wiz-start

# 方式二：打包后启动
mvn clean package -DskipTests
java -jar job-wiz-start/target/job-wiz-start-*.jar
```

后端启动后运行在 `http://localhost:8080`

### 2. 启动前端

```bash
cd frontend/jobwiz-console

# 一键启动（推荐）
./start.sh

# 或手动
npm install
npm run dev
```

前端启动后运行在 `http://localhost:5173`

### 3. 访问应用

打开浏览器访问 `http://localhost:5173`，使用测试账号登录：

| 用户 ID | 姓名 |
|-------|------|
| `1001` | 张明 |
| `1002` | 李雨欣 |

---

## API 文档

### 统一响应结构

```json
{
  "code": 200,
  "message": "success",
  "data": { ... },
  "success": true
}
```

### 简历接口 `/api/resume`

| Method | Endpoint | 说明 |
|--------|----------|------|
| GET | `/api/resume/list?userId={id}` | 获取用户简历列表 |
| GET | `/api/resume/{id}` | 获取简历详情 |
| POST | `/api/resume/create` | 创建简历 |
| PUT | `/api/resume/update` | 更新简历 |
| DELETE | `/api/resume/{id}` | 删除简历 |

### 用户画像接口 `/api/user-feature`

| Method | Endpoint | 说明 |
|--------|----------|------|
| GET | `/api/user-feature/user?userId={id}` | 获取用户画像 |
| POST | `/api/user-feature/save-or-update` | 保存/更新用户画像 |
| GET | `/api/user-feature/list` | 查询用户列表 |

### 简历模板接口 `/api/resume-template`

| Method | Endpoint | 说明 |
|--------|----------|------|
| GET | `/api/resume-template/list` | 获取模板列表 |
| GET | `/api/resume-template/{id}` | 获取模板详情 |

### AG-UI Agent 接口 `/agui`

| Method | Endpoint | 说明 |
|--------|----------|------|
| POST | `/agui/run/{agentId}` | 运行指定 Agent |
| POST | `/agui/run` | 运行默认 Agent |

Agent 可通过 URL 路径、HTTP Header (`X-Agent-Id`) 或请求体中选择。

详细接口文档见 [`mydocs/restful/`](mydocs/restful/)

---

## 数据模型

### 简历数据 (ResumeDetailDTO)

简历内容以 JSON 存储在 `resume.resumeDetail` 字段：

```json
{
  "basics": {
    "name": "张明",
    "headline": "数据分析师",
    "email": "zhang@example.com",
    "phone": "138xxxx8888",
    "location": "上海"
  },
  "sections": {
    "summary": { "content": "个人总结..." },
    "education": [{ "institution": "上海财经大学", "area": "统计学", "studyType": "硕士", "date": "2021-09 - 2025-06" }],
    "experience": [{ "company": "字节跳动", "position": "数据分析师", "date": "2024-06 - 2024-12", "summary": "负责..." }],
    "projects": [{ "name": "用户流失预测", "date": "2023-11 - 2024-01", "summary": "基于..." }],
    "skills": [{ "name": "SQL", "level": 4, "keywords": ["MySQL", "ClickHouse"] }],
    "certifications": [{ "name": "CDA level III", "issuer": "CDA", "date": "2023-03" }]
  }
}
```

### 核心实体

| 实体 | 说明 | 主要字段 |
|-----|------|---------|
| `Resume` | 简历 | id, userId, title, resumeDetail, templateId, source, language |
| `UserFeature` | 用户画像 | userId, nickname, school, major, education, targetPosition, ... |
| `ResumeTemplate` | 简历模板 | id, title, description, preview, meta |

---

## AgentScope Agent

JobWiz 使用 [AgentScope](https://agentscope.io/) 框架实现 AI Agent，基于 **AG-UI** 协议提供流式对话能力。

### 已注册 Agent

| Agent ID | 名称 | 用途 |
|---------|------|------|
| `default` | AG-UI Assistant | 默认助手 |
| `chat` | Chat Assistant | 纯对话 |
| `calculator` | Calculator Agent | 计算专家 |

### 简历领域 Agent (job-wiz-common)

| Agent | 用途 |
|-------|------|
| `BaseInfoAgent` | 简历基础信息修改（姓名、学校、专业、学历等） |
| `InterestAgent` | 求职意向分析 |
| `EduBackgroundAgent` | 教育背景分析 |

### 开发自定义 Agent

参考 `job-wiz-common/src/main/java/com/offershow/job/wiz/common/agents/` 中的示例实现。

---

## 开发指南

### 添加新页面 (Frontend)

1. 在 `src/pages/` 创建组件
2. 在 `App.jsx` 的 `<Routes>` 中注册路由
3. 在 `Sidebar.jsx` 的 `navItems` 中添加导航项

### 添加简历新 Section

1. 在 `src/components/resume/` 创建组件（如 `ResumeNewSection.jsx`）
2. 在 `ResumeForm.jsx` 中导入并渲染
3. 在 `ResumePreview.jsx` 中添加预览逻辑

### 添加新 API

1. 后端：在对应 `Controller` 添加接口方法
2. 前端：在 `src/services/api.js` 中封装调用方法

### 添加新 Agent

1. 在 `job-wiz-common/.../agents/` 创建 Agent 类
2. 在 `AgentConfiguration.java` 中注册 Agent Factory
3. 前端通过 AG-UI 协议调用

---

## 配置说明

### 后端配置

配置文件：`backend/job-wiz-start/src/main/resources/application.yml`

```yaml
spring:
  profiles:
    active: testing  # testing=SQLite, mysql=MySQL

agentscope:
  core:
    model:
      dashscope:
        api-key: ${DASHSCOPE_API_KEY}  # 阿里云 DashScope API Key
  agui:
    path-prefix: /agui
    cors-enabled: true
    cors-allowed-origins:
      - "*"
    session-timeout-minutes: 30
    enable-reasoning: false
```

### 前端 API 地址

配置：`frontend/jobwiz-console/src/services/api.js`

```javascript
const api = axios.create({
  baseURL: 'http://localhost:8080/api',  // 后端 API 地址
  timeout: 10000,
});
```

---

## 数据库

### 开发环境 (SQLite)

开发环境默认使用 SQLite，数据库文件位于：
`backend/job-wiz-start/src/main/resources/job_wiz.db`

切换到 MySQL：`spring.profiles.active=mysql`

### 生产环境 (MySQL)

初始化脚本位于 `database/mysql/` 目录。

---

## 项目规范

详见 [AGENTS.md](AGENTS.md)，核心规则：

- **No Spec, No Code** — 无规格文档不写代码
- **No Approval, No Execute** — 无确认不执行
- **Spec is Truth** — 规格文档是真理
- 使用中文交流
- 代码修改前先提交方案并等待确认
- 文档修改可直接执行

---

## 相关资源

- [AgentScope 文档](https://agentscope.io/)
- [AG-UI 协议](https://agentscope.io/docs/ag-ui/)
- [Spring Boot 文档](https://spring.io/projects/spring-boot)
- [React Router 文档](https://reactrouter.com/)
- [MyBatis Plus 文档](https://baomidou.com/)

---

## 许可证

MIT License
