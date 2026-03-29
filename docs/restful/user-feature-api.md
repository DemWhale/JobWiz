# UserFeature 用户特征信息 - RESTful API 接口文档

## 概述

本文档描述了用户特征信息管理模块的 RESTful API 接口，用于前端开发人员参考使用。

**基础路径**: `/api/user-feature`

---

## 接口列表

### 1. 根据用户 ID 获取用户特征

**接口地址**: `GET /api/user-feature/user`

**描述**: 根据用户 ID 查询用户的详细特征信息

**查询参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| userId | Long | 是 | 用户唯一标识 |

**请求示例**:
```http
GET /api/user-feature/user?userId=1001 HTTP/1.1
Content-Type: application/json
```

**响应示例** (成功):
```json
{
  "id": 1,
  "userId": 1001,
  "nickname": "张明",
  "school": "清华大学",
  "education": "本科",
  "major": "计算机科学与技术",
  "gender": "男",
  "graduationDate": "2024-06-30",
  "email": "zhangming@example.com",
  "targetPosition": "Java 开发工程师",
  "targetCity": "北京",
  "description": "热爱编程，熟悉 Java 技术栈，有扎实的算法基础...",
  "avatarUrl": "https://example.com/avatars/zhangming.jpg",
  "extendFields": "{\"skills\": [\"Java\", \"Spring Boot\"], \"certificates\": [\"英语六级\"]}",
  "createTime": "2026-03-29T10:00:00",
  "updateTime": "2026-03-29T10:00:00"
}
```

**响应示例** (用户不存在):
```json
null
```

---

### 2. 保存或更新用户特征

**接口地址**: `POST /api/user-feature/save-or-update`

**描述**: 智能判断：如果用户已存在特征信息则更新，否则新增

**请求参数**: 
- Content-Type: `application/json`

**请求体**:
```json
{
  "userId": 1001,
  "nickname": "张明",
  "school": "清华大学",
  "education": "本科",
  "major": "计算机科学与技术",
  "gender": "男",
  "graduationDate": "2024-06-30",
  "email": "zhangming@example.com",
  "targetPosition": "Java 开发工程师",
  "targetCity": "北京",
  "description": "热爱编程，熟悉 Java 技术栈",
  "avatarUrl": "https://example.com/avatars/zhangming.jpg",
  "extendFields": "{\"skills\": [\"Java\", \"Spring Boot\"]}"
}
```

**字段说明**:
| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| userId | Long | 是 | 用户唯一标识 |
| nickname | String | 否 | 用户昵称 (最大 50 字符) |
| school | String | 否 | 学校名称 (最大 100 字符) |
| education | String | 否 | 学历 (如：本科、硕士、博士) |
| major | String | 否 | 专业名称 (最大 100 字符) |
| gender | String | 否 | 性别 (男/女) |
| graduationDate | String | 否 | 毕业时间 (格式：yyyy-MM-dd) |
| email | String | 否 | 邮箱地址 (最大 100 字符) |
| targetPosition | String | 否 | 意向岗位 (最大 100 字符) |
| targetCity | String | 否 | 意向城市 (最大 50 字符) |
| description | String | 否 | 自我描述 |
| avatarUrl | String | 否 | 头像 URL(最大 500 字符) |
| extendFields | String | 否 | 扩展字段 (JSON 格式) |

**响应示例**:
```json
true
```

**说明**: 返回 `true` 表示操作成功，`false` 表示失败

---

### 3. 插入用户特征

**接口地址**: `POST /api/user-feature/insert`

**描述**: 新增一条用户特征记录（如果用户已存在会失败）

**请求参数**: 
- Content-Type: `application/json`

**请求体**: 同"保存或更新"接口

**响应示例**:
```json
true
```

---

### 4. 更新用户特征

**接口地址**: `PUT /api/user-feature/update`

**描述**: 更新已有的用户特征记录

**请求参数**: 
- Content-Type: `application/json`

**请求体**:
```json
{
  "id": 1,
  "userId": 1001,
  "nickname": "张明",
  "school": "清华大学",
  "education": "硕士",
  "targetPosition": "高级 Java 开发工程师",
  "targetCity": "上海"
}
```

**字段说明**:
| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | Long | 是 | 主键 ID |
| 其他字段 | - | 否 | 需要更新的字段 |

**响应示例**:
```json
true
```

---

### 5. 查询用户特征列表

**接口地址**: `GET /api/user-feature/list`

**描述**: 支持多条件筛选查询用户特征列表

**查询参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| userId | Long | 否 | 按用户 ID 精确匹配 |
| targetPosition | String | 否 | 按意向岗位模糊查询 |
| targetCity | String | 否 | 按意向城市精确匹配 |
| education | String | 否 | 按学历精确匹配 |

**请求示例**:
```http
GET /api/user-feature/list?userId=1001&targetPosition=Java&targetCity=北京&education=本科 HTTP/1.1
Content-Type: application/json
```

**响应示例**:
```json
[
  {
    "id": 1,
    "userId": 1001,
    "nickname": "张明",
    "school": "清华大学",
    "education": "本科",
    "major": "计算机科学与技术",
    "gender": "男",
    "graduationDate": "2024-06-30",
    "email": "zhangming@example.com",
    "targetPosition": "Java 开发工程师",
    "targetCity": "北京",
    "description": "热爱编程，熟悉 Java 技术栈",
    "avatarUrl": "https://example.com/avatars/zhangming.jpg",
    "extendFields": "{\"skills\": [\"Java\", \"Spring Boot\"]}",
    "createTime": "2026-03-29T10:00:00",
    "updateTime": "2026-03-29T10:00:00"
  },
  {
    "id": 2,
    "userId": 1003,
    "nickname": "王小强",
    "school": "北京大学",
    "education": "本科",
    "targetPosition": "Java 开发",
    "targetCity": "北京"
  }
]
```

**说明**: 返回结果按更新时间降序排列

---

### 6. 根据 ID 删除用户特征

**接口地址**: `DELETE /api/user-feature/delete`

**描述**: 根据主键 ID 删除用户特征记录

**查询参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | Long | 是 | 主键 ID |

**请求示例**:
```http
DELETE /api/user-feature/delete?id=1 HTTP/1.1
Content-Type: application/json
```

**响应示例**:
```json
true
```

**说明**: 返回 `true` 表示删除成功，`false` 表示删除失败（记录不存在）

---

## 错误处理

所有接口在发生错误时会返回相应的 HTTP 状态码：

- `200 OK`: 请求成功
- `400 Bad Request`: 请求参数错误
- `404 Not Found`: 资源不存在
- `500 Internal Server Error`: 服务器内部错误

## 数据格式说明

### 日期时间格式
- 请求和响应中的日期时间字段采用 ISO 8601 格式
- 示例：`"2024-06-30T00:00:00"` 或 `"2024-06-30"`

### 扩展字段格式
`extendFields` 字段使用 JSON 字符串格式存储额外信息，建议结构：
```json
{
  "skills": ["技能 1", "技能 2"],
  "certificates": ["证书 1", "证书 2"],
  "projects": ["项目 1", "项目 2"],
  "internship": "实习经历描述"
}
```

## 测试数据

系统预置了两个测试用户：

1. **张明** (userId: 1001)
   - 学校：清华大学
   - 岗位：Java 开发工程师
   - 城市：北京

2. **李雨欣** (userId: 1002)
   - 学校：浙江大学
   - 岗位：前端开发工程师
   - 城市：杭州

## 联系方式

如有问题，请联系后端开发团队。
