# 用户特征接口文档

## 基本信息
- **Base URL**: `http://localhost:8080/api/user-feature`
- **Controller**: `UserFeatureController`
- **描述**: 用户特征信息的增删改查接口

---

## 1. 根据用户 ID 获取用户特征

### 接口信息
- **URL**: `/api/user-feature/user`
- **Method**: `GET`
- **描述**: 根据用户 ID 获取用户特征信息

### 请求参数
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| userId | Long | 是 | 用户 ID |

### 请求示例
```http
GET /api/user-feature/user?userId=1001
```

### 响应参数
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "userId": 1001,
    "nickname": "张三",
    "school": "上海财经大学",
    "education": "本科",
    "major": "统计学",
    "gender": "男",
    "graduationDate": "2025-06-30T00:00:00.000+00:00",
    "email": "zhangsan@example.com",
    "targetPosition": "数据分析师",
    "targetCity": "上海",
    "description": "数据分析师方向学生，具备扎实的数据处理能力",
    "avatarUrl": "https://example.com/avatar.jpg",
    "extendFields": null,
    "gmtCreate": "2026-04-12T10:00:00.000+00:00",
    "gmtModified": "2026-04-12T10:00:00.000+00:00"
  }
}
```

### 响应字段说明
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | Long | 主键 ID |
| userId | Long | 用户 ID |
| nickname | String | 用户昵称 |
| school | String | 学校 |
| education | String | 学历 |
| major | String | 专业 |
| gender | String | 性别 |
| graduationDate | Date | 毕业时间 |
| email | String | 邮箱 |
| targetPosition | String | 意向岗位 |
| targetCity | String | 意向城市 |
| description | String | 自我描述 |
| avatarUrl | String | 头像 URL |
| extendFields | String | 扩展字段（JSON 格式） |
| gmtCreate | Date | 创建时间 |
| gmtModified | Date | 修改时间 |

### 错误响应
```json
{
  "code": 400,
  "message": "用户信息不存在",
  "data": null
}
```

---

## 2. 保存或更新用户特征

### 接口信息
- **URL**: `/api/user-feature/save-or-update`
- **Method**: `POST`
- **描述**: 保存或更新用户特征信息（根据 userId 判断新增或更新）

### 请求参数
**Content-Type**: `application/json`

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| userId | Long | 是 | 用户 ID |
| nickname | String | 否 | 用户昵称 |
| school | String | 否 | 学校 |
| education | String | 否 | 学历 |
| major | String | 否 | 专业 |
| gender | String | 否 | 性别 |
| graduationDate | Date | 否 | 毕业时间 |
| email | String | 否 | 邮箱 |
| targetPosition | String | 否 | 意向岗位 |
| targetCity | String | 否 | 意向城市 |
| description | String | 否 | 自我描述 |
| avatarUrl | String | 否 | 头像 URL |
| extendFields | String | 否 | 扩展字段（JSON 格式） |

### 请求示例
```json
{
  "userId": 1001,
  "nickname": "张三",
  "school": "上海财经大学",
  "education": "本科",
  "major": "统计学",
  "gender": "男",
  "graduationDate": "2025-06-30T00:00:00.000+00:00",
  "email": "zhangsan@example.com",
  "targetPosition": "数据分析师",
  "targetCity": "上海",
  "description": "数据分析师方向学生，具备扎实的数据处理能力"
}
```

### 响应参数
```json
{
  "code": 200,
  "message": "success",
  "data": true
}
```

### 错误响应
```json
{
  "code": 500,
  "message": "保存失败",
  "data": null
}
```

---

## 3. 插入用户特征

### 接口信息
- **URL**: `/api/user-feature/insert`
- **Method**: `POST`
- **描述**: 插入新的用户特征记录

### 请求参数
**Content-Type**: `application/json`

字段同"保存或更新用户特征"接口。

### 请求示例
```json
{
  "userId": 1002,
  "nickname": "李四",
  "school": "北京大学",
  "education": "硕士",
  "major": "计算机科学",
  "gender": "女",
  "targetPosition": "前端开发工程师",
  "targetCity": "北京"
}
```

### 响应参数
```json
{
  "code": 200,
  "message": "success",
  "data": true
}
```

---

## 4. 更新用户特征

### 接口信息
- **URL**: `/api/user-feature/update`
- **Method**: `PUT`
- **描述**: 更新用户特征信息（需要提供 id）

### 请求参数
**Content-Type**: `application/json`

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | Long | 是 | 主键 ID |
| nickname | String | 否 | 用户昵称 |
| school | String | 否 | 学校 |
| education | String | 否 | 学历 |
| major | String | 否 | 专业 |
| gender | String | 否 | 性别 |
| graduationDate | Date | 否 | 毕业时间 |
| email | String | 否 | 邮箱 |
| targetPosition | String | 否 | 意向岗位 |
| targetCity | String | 否 | 意向城市 |
| description | String | 否 | 自我描述 |
| avatarUrl | String | 否 | 头像 URL |
| extendFields | String | 否 | 扩展字段（JSON 格式） |

### 请求示例
```json
{
  "id": 1,
  "nickname": "张三（更新）",
  "targetPosition": "高级数据分析师",
  "targetCity": "深圳"
}
```

### 响应参数
```json
{
  "code": 200,
  "message": "success",
  "data": true
}
```

---

## 5. 查询用户特征列表

### 接口信息
- **URL**: `/api/user-feature/list`
- **Method**: `GET`
- **描述**: 查询用户特征列表（支持多条件筛选）

### 请求参数
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| userId | Long | 否 | 用户 ID |
| targetPosition | String | 否 | 意向岗位 |
| targetCity | String | 否 | 意向城市 |
| education | String | 否 | 学历 |

### 请求示例
```http
GET /api/user-feature/list?userId=1001&targetPosition=数据分析师
```

### 响应参数
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "userId": 1001,
      "nickname": "张三",
      "school": "上海财经大学",
      "education": "本科",
      "major": "统计学",
      "gender": "男",
      "graduationDate": "2025-06-30T00:00:00.000+00:00",
      "email": "zhangsan@example.com",
      "targetPosition": "数据分析师",
      "targetCity": "上海",
      "description": "数据分析师方向学生，具备扎实的数据处理能力",
      "avatarUrl": "https://example.com/avatar.jpg",
      "extendFields": null,
      "gmtCreate": "2026-04-12T10:00:00.000+00:00",
      "gmtModified": "2026-04-12T10:00:00.000+00:00"
    }
  ]
}
```

---

## 6. 删除用户特征

### 接口信息
- **URL**: `/api/user-feature/delete`
- **Method**: `DELETE`
- **描述**: 根据 ID 删除用户特征记录

### 请求参数
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | Long | 是 | 主键 ID |

### 请求示例
```http
DELETE /api/user-feature/delete?id=1
```

### 响应参数
```json
{
  "code": 200,
  "message": "success",
  "data": true
}
```

### 错误响应
```json
{
  "code": 500,
  "message": "删除失败",
  "data": null
}
```
