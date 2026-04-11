# MySQL → SQLite 引擎切换

## §0 元信息

| 字段 | 值 |
|------|-----|
| Task | MySQL → SQLite 引擎切换 |
| Goal | 新增 SQLite 数据库支持，与现有 MySQL 共存，通过 Spring Profile 实现可切换 |
| Phase | Review |
| Approval Status | 待批准 |
| Created | 2026-04-11 |

## §1 Context Sources

- 代码库全量扫描（backend 四个模块的 pom.xml、Java 源码、SQL 脚本、application.yml）

## §2 Codemap Used

- 手动扫描，无 codemap 文件

## §3 In Scope

1. Maven 依赖：**新增** `sqlite-jdbc`（保留 `mysql-connector-j`）
2. 配置类：保留 `JobWizMybatisPlusConfig`（MySQL 版本），新建 `JobWizSqliteConfig`（SQLite 版本），通过 `@Profile` 隔离
3. `MysqlConfig.java`：保留不动
4. `application.yml`：拆分为 `application-mysql.yml`（默认）+ `application-sqlite.yml`，通过 `spring.profiles.active` 切换
5. DDL 脚本：保留原 MySQL 版本，新增 SQLite 版本 `user_feature_sqlite.sql`
6. 数据脚本：保留原 MySQL 版本，新增 SQLite 版本 `user_feature_data_sqlite.sql`

## §4 Out of Scope

- 业务逻辑变更（Service / Controller 层不变）
- Entity 类变更（MyBatis Plus 的 `IdType.AUTO` 与 SQLite AUTOINCREMENT 兼容，无需改）
- Mapper 接口变更
- 前端变更
- 数据迁移（从 MySQL 到 SQLite 的数据迁移不在本次范围）

## §5 Research Findings

### 5.1 影响文件清单

| 文件路径 | 改动类型 |
|----------|---------|
| `backend/pom.xml` | 依赖新增 |
| `backend/job-wiz-dal/pom.xml` | 依赖新增 |
| `backend/job-wiz-dal/.../dal/MysqlConfig.java` | 不动 |
| `backend/job-wiz-dal/.../config/JobWizMybatisPlusConfig.java` | 加 `@Profile("mysql")` |
| `backend/job-wiz-dal/.../config/JobWizSqliteConfig.java` | 新建，`@Profile("sqlite")` |
| `backend/job-wiz-start/.../resources/application.yml` | 保留公共配置，数据源部分移入 profile |
| `backend/job-wiz-start/.../resources/application-mysql.yml` | 新建，MySQL 数据源配置 |
| `backend/job-wiz-start/.../resources/application-sqlite.yml` | 新建，SQLite 数据源配置 |
| `backend/job-wiz-dal/.../resources/sql/user_feature_sqlite.sql` | 新建，SQLite DDL |
| `backend/job-wiz-dal/.../resources/sql/user_feature_data_sqlite.sql` | 新建，SQLite DML |

### 5.2 关键技术决策

1. **驱动**：`org.xerial:sqlite-jdbc:3.45.1.0`
2. **连接池**：SQLite 单写者模型，`maxPool=2`, `minIdle=1`，关闭 idle/maxLifetime 限制
3. **MyBatis Plus**：`DbType.SQLITE` 内置分页支持，`IdType.AUTO` 兼容
4. **SQLite 不支持**：`ON UPDATE CURRENT_TIMESTAMP` → Service 层已手动设置 updateTime，无需额外处理
5. **数据文件**：`./data/job_wiz.db`，首次启动自动创建
6. **切换机制**：Spring Profile（`mysql` / `sqlite`），默认激活 `mysql` profile
7. **配置类隔离**：`JobWizMybatisPlusConfig` 加 `@Profile("mysql")`，新建 `JobWizSqliteConfig` 加 `@Profile("sqlite")`
8. **YAML 拆分**：`application.yml` 保留公共配置，数据源部分放入 `application-mysql.yml` 和 `application-sqlite.yml`

### 5.3 风险

| 风险 | 等级 | 缓解 |
|------|------|------|
| SQLite 并发写性能有限 | 低 | 当前为单用户本地应用，可接受 |
| 两个 Profile 的配置类 Bean 名称冲突 | 中 | 两个 Config 类的 Bean 名称不同（`jobWizMysql*` / `jobWizSqlite*`），@Profile 确保只激活一个 |
| 默认不激活任何 Profile 时两个数据源都不加载 | 中 | `application.yml` 中设置 `spring.profiles.active: mysql` 作为默认 |

## §6 Open Questions

1. `MysqlConfig.java`：保留不动（用户确认）
2. SQLite 数据文件路径：`./data/job_wiz.db`（用户确认）
3. 切换机制：Spring Profile（`mysql` / `sqlite`），默认 `mysql`（用户确认）

## §7 Next Actions

- 等待用户批准 Plan 后，进入 Execute 阶段

## §9 Plan

### 文件改动签名

| # | 文件 | 操作 | 改动说明 |
|---|------|------|---------|
| 1 | `backend/pom.xml` | 改 | properties 区新增 `sqlite.version`；dependencyManagement 新增 `sqlite-jdbc` |
| 2 | `backend/job-wiz-dal/pom.xml` | 改 | dependencies 新增 `sqlite-jdbc`（保留 mysql-connector-j） |
| 3 | `backend/job-wiz-dal/.../config/JobWizMybatisPlusConfig.java` | 改 | 类上添加 `@Profile("mysql")` |
| 4 | `backend/job-wiz-dal/.../config/JobWizSqliteConfig.java` | 新建 | `@Profile("sqlite")`，`DbType.SQLITE`，适配 SQLite 的连接池参数，Bean 名称加 `Sqlite` 前缀避免冲突 |
| 5 | `backend/job-wiz-start/.../resources/application.yml` | 改 | 移除数据源配置，保留公共配置 + `spring.profiles.active: mysql` |
| 6 | `backend/job-wiz-start/.../resources/application-mysql.yml` | 新建 | MySQL 数据源配置（从原 application.yml 迁出） |
| 7 | `backend/job-wiz-start/.../resources/application-sqlite.yml` | 新建 | SQLite 数据源配置 |
| 8 | `backend/job-wiz-dal/.../resources/sql/user_feature_sqlite.sql` | 新建 | SQLite DDL |
| 9 | `backend/job-wiz-dal/.../resources/sql/user_feature_data_sqlite.sql` | 新建 | SQLite DML |

### 原子化 Checklist

- [ ] **C1**: `backend/pom.xml` - 新增 `sqlite.version` 属性 + `sqlite-jdbc` 依赖管理
- [ ] **C2**: `backend/job-wiz-dal/pom.xml` - 新增 `sqlite-jdbc` 依赖
- [ ] **C3**: `JobWizMybatisPlusConfig.java` - 添加 `@Profile("mysql")`
- [ ] **C4**: 新建 `JobWizSqliteConfig.java` - `@Profile("sqlite")` + `DbType.SQLITE` + SQLite 连接池
- [ ] **C5**: `application.yml` - 移除数据源配置，添加 `spring.profiles.active: mysql`
- [ ] **C6**: 新建 `application-mysql.yml` - MySQL 数据源配置
- [ ] **C7**: 新建 `application-sqlite.yml` - SQLite 数据源配置
- [ ] **C8**: 新建 `user_feature_sqlite.sql` - SQLite 建表脚本
- [ ] **C9**: 新建 `user_feature_data_sqlite.sql` - SQLite 示例数据

### 验证方式

1. 默认启动（mysql profile）→ 行为与改动前一致
2. 激活 sqlite profile 启动 → 自动创建 `./data/job_wiz.db`，API 可正常 CRUD

## §8 Change Log

| 时间 | 阶段 | 内容 |
|------|------|------|
| 2026-04-11 | Research | 首版 Spec，完成影响面分析与技术决策 |
| 2026-04-11 | Plan | 方案调整：保留 MySQL 配置，新增 SQLite 配置，通过 Spring Profile 可切换；产出 9 步 Checklist |
| 2026-04-11 | Execute | 完成 C1-C9 全部执行 |
| 2026-04-11 | Execute | YAML 按环境重组：testing(SQLite)/pre(MySQL)/product(MySQL)，Profile 映射同步更新 |
