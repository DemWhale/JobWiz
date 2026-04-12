# 简历模板接口文档

## 基本信息
- **Base URL**: `http://localhost:8080/api/resume-template`
- **Controller**: `ResumeTemplateController`
- **描述**: 简历模板的查询接口（只读）

---

## 1. 获取所有模板列表

### 接口信息
- **URL**: `/api/resume-template/list`
- **Method**: `GET`
- **描述**: 获取所有简历模板列表

### 请求参数
无

### 请求示例
```http
GET /api/resume-template/list
```

### 响应参数
```json
[
  {
    "id": 1,
    "name": "rhyhorn",
    "title": "经典",
    "preview": "/templates/rhyhorn.jpg",
    "permission": "[\"free\"]",
    "meta": "{\"css\":{\"value\":\"\",\"visible\":false},\"page\":{\"format\":\"a4\",\"margin\":28,\"options\":{\"breakLine\":true,\"pageNumbers\":true}},\"theme\":{\"text\":\"#242424\",\"primary\":\"#2563eb\",\"background\":\"#fffefe\"},\"layout\":[[[\"education\",\"profiles\",\"experience\",\"projects\",\"summary\",\"volunteer\",\"references\"],[\"languages\",\"skills\",\"interests\",\"certifications\",\"awards\",\"publications\"]]],\"template\":\"rhyhorn\",\"typography\":{\"font\":{\"size\":13,\"family\":\"Noto Sans SC\",\"subset\":\"chinese-simplified\",\"variants\":[\"regular\"]},\"hideIcons\":false,\"lineHeight\":1.3,\"underlineLinks\":false}}",
    "columns": 1,
    "isVip": false,
    "description": "经典双栏模板，适合大多数求职场景",
    "gmtCreate": "2026-04-12T07:42:27.000+00:00",
    "gmtModified": "2026-04-12T07:42:27.000+00:00"
  }
]
```

### 响应字段说明
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | Long | 模板 ID |
| name | String | 模板标识名（rhyhorn, glalie 等） |
| title | String | 模板显示名（经典、简约 等） |
| preview | String | 预览图 URL |
| permission | String | JSON 数组字符串：["free"] / ["vip"] |
| meta | String | JSON 字符串：模板配置（layout/theme/typography/css/page） |
| columns | Integer | 栏数 |
| isVip | Boolean | 是否 VIP 模板 |
| description | String | 模板描述 |
| gmtCreate | Date | 创建时间 |
| gmtModified | Date | 修改时间 |

### meta 字段结构
`meta` 是 JSON 字符串，解析后结构如下：
```json
{
  "css": {
    "value": "",
    "visible": false
  },
  "page": {
    "format": "a4",
    "margin": 28,
    "options": {
      "breakLine": true,
      "pageNumbers": true
    }
  },
  "theme": {
    "text": "#242424",
    "primary": "#2563eb",
    "background": "#fffefe"
  },
  "layout": [
    [
      ["education", "profiles", "experience", "projects", "summary", "volunteer", "references"],
      ["languages", "skills", "interests", "certifications", "awards", "publications"]
    ]
  ],
  "template": "rhyhorn",
  "typography": {
    "font": {
      "size": 13,
      "family": "Noto Sans SC",
      "subset": "chinese-simplified",
      "variants": ["regular"]
    },
    "hideIcons": false,
    "lineHeight": 1.3,
    "underlineLinks": false
  }
}
```

---

## 2. 根据 ID 获取模板

### 接口信息
- **URL**: `/api/resume-template/{id}`
- **Method**: `GET`
- **描述**: 根据模板 ID 获取模板详情

### 请求参数
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | Long | 是 | 模板 ID（路径参数） |

### 请求示例
```http
GET /api/resume-template/1
```

### 响应参数
```json
{
  "id": 1,
  "name": "rhyhorn",
  "title": "经典",
  "preview": "/templates/rhyhorn.jpg",
  "permission": "[\"free\"]",
  "meta": "{\"css\":{\"value\":\"\",\"visible\":false},\"page\":{\"format\":\"a4\",\"margin\":28,\"options\":{\"breakLine\":true,\"pageNumbers\":true}},\"theme\":{\"text\":\"#242424\",\"primary\":\"#2563eb\",\"background\":\"#fffefe\"},\"layout\":[[[\"education\",\"profiles\",\"experience\",\"projects\",\"summary\",\"volunteer\",\"references\"],[\"languages\",\"skills\",\"interests\",\"certifications\",\"awards\",\"publications\"]]],\"template\":\"rhyhorn\",\"typography\":{\"font\":{\"size\":13,\"family\":\"Noto Sans SC\",\"subset\":\"chinese-simplified\",\"variants\":[\"regular\"]},\"hideIcons\":false,\"lineHeight\":1.3,\"underlineLinks\":false}}",
  "columns": 1,
  "isVip": false,
  "description": "经典双栏模板，适合大多数求职场景",
  "gmtCreate": "2026-04-12T07:42:27.000+00:00",
  "gmtModified": "2026-04-12T07:42:27.000+00:00"
}
```

### 响应字段说明
同"获取所有模板列表"接口的响应字段说明。
