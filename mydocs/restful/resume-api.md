# 简历接口文档

## 基本信息
- **Base URL**: `http://localhost:8080/api/resume`
- **Controller**: `ResumeController`
- **描述**: 简历信息的增删改查接口

---

## 1. 获取用户简历列表

### 接口信息
- **URL**: `/api/resume/list`
- **Method**: `GET`
- **描述**: 根据用户 ID 获取该用户的所有简历列表

### 请求参数
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| userId | Long | 是 | 用户 ID |

### 请求示例
```http
GET /api/resume/list?userId=1001
```

### 响应参数
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "slug": null,
      "title": "未命名简历",
      "userId": 1001,
      "resumeDetail": "{\"basics\":{\"name\":\"\",\"headline\":\"\",\"email\":\"\",\"phone\":\"\",\"location\":\"\",\"url\":\"\"},\"sections\":{}}",
      "visibility": null,
      "locked": false,
      "source": null,
      "sourceResumeId": null,
      "language": null,
      "templateId": 1,
      "gmtCreate": "2026-04-12T10:30:00.000+00:00",
      "gmtModified": "2026-04-12T10:30:00.000+00:00"
    }
  ],
  "success": true
}
```

### 响应字段说明

**外层字段**：
| 字段名 | 类型 | 说明 |
|--------|------|------|
| code | int | 响应状态码（200 成功） |
| message | String | 响应消息 |
| data | Array/Object/Boolean | 响应数据 |
| success | boolean | 请求是否成功 |

**data 数组元素字段**（Resume 对象）：
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | Long | 简历 ID |
| slug | String | 短链接标识 |
| title | String | 简历标题 |
| userId | Long | 用户 ID |
| resumeDetail | String | 完整简历结构数据（JSON 格式） |
| visibility | String | 可见性：private/public |
| locked | Boolean | 是否锁定 |
| source | String | 来源：ORIGINAL/AI_GENERATED |
| sourceResumeId | Long | 来源简历 ID |
| language | String | 语言：CHINESE/ENGLISH |
| templateId | Long | 关联模板 ID |
| gmtCreate | Date | 创建时间 |
| gmtModified | Date | 修改时间 |

---

## 2. 根据 ID 获取简历

### 接口信息
- **URL**: `/api/resume/{id}`
- **Method**: `GET`
- **描述**: 根据简历 ID 获取简历详情

### 请求参数
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | Long | 是 | 简历 ID（路径参数） |

### 请求示例
```http
GET /api/resume/1
```

### 响应参数
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "slug": null,
    "title": "未命名简历",
    "userId": 1001,
    "resumeDetail": "{\"basics\":{\"name\":\"\",\"headline\":\"\",\"email\":\"\",\"phone\":\"\",\"location\":\"\",\"url\":\"\"},\"sections\":{}}",
    "visibility": null,
    "locked": false,
    "source": null,
    "sourceResumeId": null,
    "language": null,
    "templateId": 1,
    "gmtCreate": "2026-04-12T10:30:00.000+00:00",
    "gmtModified": "2026-04-12T10:30:00.000+00:00"
  }
}
```

### 错误响应
```json
{
  "code": 500,
  "message": "简历不存在",
  "data": null
}
```

---

## 3. 创建简历

### 接口信息
- **URL**: `/api/resume/create`
- **Method**: `POST`
- **描述**: 创建新简历

### 请求参数
**Content-Type**: `application/json`

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| userId | Long | 是 | 用户 ID |
| templateId | Long | 否 | 关联模板 ID |
| title | String | 否 | 简历标题（默认"未命名简历"） |
| resumeDetail | String | 否 | 简历数据 JSON 字符串 |
| visibility | String | 否 | 可见性：private/public |
| locked | Boolean | 否 | 是否锁定 |
| source | String | 否 | 来源：ORIGINAL/AI_GENERATED |
| sourceResumeId | Long | 否 | 来源简历 ID |
| language | String | 否 | 语言：CHINESE/ENGLISH |

### 请求示例
```json
{
  "userId": 1001,
  "templateId": 1,
  "title": "未命名简历",
  "resumeDetail": "{\"basics\":{\"name\":\"\",\"headline\":\"\",\"email\":\"\",\"phone\":\"\",\"location\":\"\",\"url\":\"\"},\"sections\":{}}"
}
```

### 响应参数
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 2,
    "slug": null,
    "title": "未命名简历",
    "userId": 1001,
    "resumeDetail": "{\"basics\":{\"name\":\"\",\"headline\":\"\",\"email\":\"\",\"phone\":\"\",\"location\":\"\",\"url\":\"\"},\"sections\":{}}",
    "visibility": null,
    "locked": false,
    "source": null,
    "sourceResumeId": null,
    "language": null,
    "templateId": 1,
    "gmtCreate": "2026-04-12T10:30:00.000+00:00",
    "gmtModified": "2026-04-12T10:30:00.000+00:00"
  }
}
```

---

## 4. 更新简历

### 接口信息
- **URL**: `/api/resume/update`
- **Method**: `PUT`
- **描述**: 更新简历信息

### 请求参数
**Content-Type**: `application/json`

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | Long | 是 | 简历 ID |
| title | String | 否 | 简历标题 |
| resumeDetail | String | 否 | 简历数据 JSON 字符串 |
| visibility | String | 否 | 可见性 |
| locked | Boolean | 否 | 是否锁定 |
| templateId | Long | 否 | 关联模板 ID |
| language | String | 否 | 语言 |

### 请求示例
```json
{
  "id": 1,
  "resumeDetail": "{\"basics\":{\"name\":\"张三\",\"headline\":\"数据分析师\",\"email\":\"test@example.com\",\"phone\":\"13800138000\",\"location\":\"上海\",\"url\":\"\"},\"sections\":{\"summary\":{\"content\":\"个人总结内容\"}}}"
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
  "message": "更新失败",
  "data": null
}
```

---

## 5. 删除简历

### 接口信息
- **URL**: `/api/resume/{id}`
- **Method**: `DELETE`
- **描述**: 根据 ID 删除简历

### 请求参数
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | Long | 是 | 简历 ID（路径参数） |

### 请求示例
```http
DELETE /api/resume/1
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
