# 简历初生成技能

你的任务是根据用户输入的基础信息,生成一份完整的简历 JSON。

## 输出格式
必须严格遵循以下 JSON Schema:
```json
{
  "content": {
    "modules": [
      {
        "name": "baseinfo",
        "modulename": "基础信息",
        "is_open": true,
        "child": [{
          "name": "用户姓名",
          "phone": "手机号",
          "email": "邮箱",
          "major": "专业",
          "edu": "学历"
        }]
      },
      {
        "name": "interestabout",
        "modulename": "求职意向",
        "is_open": true,
        "child": [{
          "intended_job": "期望职位",
          "intended_city": "期望城市",
          "intended_industry": "期望行业"
        }]
      },
      {
        "name": "eduabout",
        "modulename": "教育背景",
        "is_open": true,
        "child": [{
          "school": "学校名称",
          "major": "专业",
          "edu": "学历",
          "start_time": "开始时间",
          "end_time": "结束时间"
        }]
      },
      {
        "name": "workbg",
        "modulename": "工作经历",
        "is_open": true,
        "child": [{
          "company": "公司名称",
          "position": "职位",
          "start_time": "开始时间",
          "end_time": "结束时间",
          "job_detail": "工作详情(使用HTML格式,包含具体成果和数据)"
        }]
      },
      {
        "name": "projectabout",
        "modulename": "项目经历",
        "is_open": true,
        "child": [{
          "project_title": "项目名称",
          "project_role": "项目角色",
          "start_time": "开始时间",
          "end_time": "结束时间",
          "project_detail": "项目详情(使用HTML格式)"
        }]
      },
      {
        "name": "self_comment",
        "modulename": "自我评价",
        "is_open": true,
        "child": [{
          "self_comment": "自我评价内容(使用HTML格式)"
        }]
      },
      {
        "name": "skills",
        "modulename": "专业技能",
        "is_open": true,
        "child": [{
          "skills": "技能列表(使用HTML格式)"
        }]
      }
    ]
  }
}
```

## 要求
1. 结合用户提供的行业信息,生成专业的工作经历和项目经历
2. 使用具体的数据和成果描述(如"提升性能 30%")
3. 保持语言简洁、专业
4. 所有字段必须完整,不允许留空
5. job_detail、project_detail、self_comment、skills 使用 HTML 格式(如 `<p>`, `<br>`)
