# MySQL → SQLite 引擎切换（可切换模式）

## §0 元信息

| 字段 | 值 |
|------|-----|
| Task | MySQL → SQLite 引擎切换（可切换模式） |
| Goal | 新增 SQLite 数据库支持，与现有 MySQL 共存，通过 Spring Profile 实现 testing/pre/product 三环境切换 |
| Phase | Review |
| Approval Status | 执行完成，Review 中 |
| Created | 2026-04-11 |

## §1 Context Sources

- 代码库全量扫描（backend 四个模块的 pom.xml、Java 源码、SQL 脚本、application.yml）

## §2 Codemap Used

- 手动扫描，无 codemap 文件

## §3 In Scope

1. Maven 依赖：**新增** `sqlite-jdbc`（保留 `mysql-connector-j`）
2. 配置类：保留 `JobWizMybatisPlusConfig`（MySQL 版本，`@Profile({"pre", "product"})`），新建 `JobWizSqliteConfig`（SQLite 版本，`@Profile("testing")`）
3. `MysqlConfig.java`：保留不动
4. YAML 配置：`application.yml` 保留公共配置 + `spring.profiles.active: testing`；三环境独立文件
5. DDL 脚本：保留原 MySQL 版本，新增 SQLite 版本 `user_feature_sqlite.sql`
6. 数据脚本：保留原 MySQL 版本，新增 SQLite 版本 `user_feature_data_sqlite.sql`

## §4 Out of Scope

- 业务逻辑变更（Service / Controller 层不变）
- Entity 类变更
- Mapper 接口变更
- 前端变更
- 数据迁移

## §5 Research Findings

### 5.1 最终文件改动清单

| # | 文件路径 | 操作 | 改动说明 |
|---|----------|------|---------|
| 1 | `backend/pom.xml` | 改 | 新增 `sqlite.version=3.45.1.0` + `sqlite-jdbc` 依赖管理 |
| 2 | `backend/job-wiz-dal/pom.xml` | 改 | 新增 `sqlite-jdbc` 依赖（保留 mysql-connector-j） |
| 3 | `backend/job-wiz-dal/.../dal/MysqlConfig.java` | 不动 | 空壳类保留 |
| 4 | `backend/job-wiz-dal/.../config/JobWizMybatisPlusConfig.java` | 改 | 添加 `@Profile({"pre", "product"})`，注释更新为 MySQL |
| 5 | `backend/job-wiz-dal/.../config/JobWizSqliteConfig.java` | 新建 | `@Profile("testing")`，`DbType.SQLITE`，SQLite 连接池（maxPool=2） |
| 6 | `backend/job-wiz-start/.../resources/application.yml` | 改 | 公共配置 + `spring.profiles.active: testing` |
| 7 | `backend/job-wiz-start/.../resources/application-testing.yml` | 新建 | 本地测试 → SQLite（`jdbc:sqlite:./data/job_wiz.db`） |
| 8 | `backend/job-wiz-start/.../resources/application-pre.yml` | 新建 | 预发布 → MySQL |
| 9 | `backend/job-wiz-start/.../resources/application-product.yml` | 新建 | 生产 → MySQL（密码用环境变量） |
| 10 | `backend/job-wiz-dal/.../resources/sql/user_feature_sqlite.sql` | 新建 | SQLite DDL |
| 11 | `backend/job-wiz-dal/.../resources/sql/user_feature_data_sqlite.sql` | 新建 | SQLite DML |

### 5.2 环境与数据库映射

| 环境 Profile | 数据库 | 数据源配置文件 |
|-------------|--------|---------------|
| `testing`（默认） | SQLite | `application-testing.yml` |
| `pre` | MySQL | `application-pre.yml` |
| `product` | MySQL | `application-product.yml` |

### 5.3 关键技术决策

1. **驱动**：`org.xerial:sqlite-jdbc:3.45.1.0`
2. **连接池**：SQLite 单写者模型，`maxPool=2`, `minIdle=1`
3. **MyBatis Plus**：`DbType.SQLITE` 内置分页支持，`IdType.AUTO` 兼容
4. **SQLite 不支持 `ON UPDATE CURRENT_TIMESTAMP`** → Service 层已手动设置 updateTime，无需额外处理
5. **数据文件**：`./data/job_wiz.db`
6. **Profile 隔离**：`@Profile` 确保同一时刻只激活一个数据源配置类
7. **生产环境安全**：`application-product.yml` 使用 `${DB_USERNAME}` / `${DB_PASSWORD}` 环境变量

### 5.4 风险

| 风险 | 等级 | 缓解 |
|------|------|------|
| SQLite 并发写性能有限 | 低 | 当前为单用户本地测试，可接受 |
| `./data/` 目录需手动创建 | 中 | 首次使用 SQLite 前需 `mkdir -p data` |
| 启动时需先执行 SQLite DDL 建表 | 中 | 手动执行 `user_feature_sqlite.sql` |

## §6 Open Questions

无未解决问题

## §7 Next Actions

- 验证 testing profile 启动是否正常
- 如有问题继续排查修复

## §8 Change Log

| 时间 | 阶段 | 内容 |
|------|------|------|
| 2026-04-11 | Research | 首版 Spec，完成影响面分析与技术决策 |
| 2026-04-11 | Plan | 方案调整：保留 MySQL 配置，新增 SQLite 配置，通过 Spring Profile 可切换；产出 9 步 Checklist |
| 2026-04-11 | Execute | 完成 C1-C9：依赖新增、配置类 @Profile、YAML 拆分、SQL 脚本 |
| 2026-04-11 | Execute | YAML 按环境重组：testing(SQLite)/pre(MySQL)/product(MySQL)，Profile 映射同步更新 |
| 2026-04-11 | Fix | 修复启动问题：排除 DataSourceAutoConfiguration、HikariCP 适配 SQLite（后被用户回退） |
| 2026-04-11 | Review | Spec 全面同步至代码实际状态 |
