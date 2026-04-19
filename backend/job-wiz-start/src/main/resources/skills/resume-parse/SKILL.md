---
name: resume-parse
description: Parse user's free-form career description text into standardized resume JSON structure. Extract work experience, education, skills, achievements, and career objectives from unstructured text. Use when users input career descriptions, work history summaries, or resume drafts that need to be converted to structured resume format.
---

# 简历解析技能

## 任务说明

将用户输入的自由格式职业描述文本，解析并转换为标准化的简历 JSON 结构。

## 输入格式

用户可能提供以下信息：
- 求职阶段/经验年限（实习/应届、1-3年、3-5年、5-10年、10年以上）
- 目标岗位/方向（产品经理、前端工程师、后端工程师等）
- 简要履历（从业经历、项目经验、核心亮点）
- 其他自由文本描述

## 输出格式

必须严格遵循以下 JSON Schema：

```json
{
  "content": {
    "modules": [
      {
        "name": "baseinfo",
        "modulename": "基础信息",
        "is_open": true,
        "child": [{
          "name": "用户姓名（如未提供则留空）",
          "phone": "手机号（如未提供则留空）",
          "email": "邮箱（如未提供则留空）",
          "major": "专业（如未提供则留空）",
          "edu": "学历（如未提供则留空）"
        }]
      },
      {
        "name": "interestabout",
        "modulename": "求职意向",
        "is_open": true,
        "child": [{
          "intended_job": "目标岗位",
          "intended_city": "期望城市（如未提供则留空）",
          "intended_industry": "期望行业（如未提供则留空）"
        }]
      },
      {
        "name": "eduabout",
        "modulename": "教育背景",
        "is_open": true,
        "child": [{
          "school": "学校名称（如未提供则合理推断或留空）",
          "major": "专业",
          "edu": "学历",
          "start_time": "开始时间（如未提供则留空）",
          "end_time": "结束时间（如未提供则留空）"
        }]
      },
      {
        "name": "workbg",
        "modulename": "工作经历",
        "is_open": true,
        "child": [
          {
            "company": "公司名称",
            "position": "职位",
            "start_time": "开始时间（如未提供则合理推断）",
            "end_time": "结束时间（如未提供则填写'至今'）",
            "job_detail": "工作详情（使用HTML格式，包含具体职责、成果和数据）"
          }
        ]
      },
      {
        "name": "projectabout",
        "modulename": "项目经历",
        "is_open": true,
        "child": [
          {
            "project_title": "项目名称",
            "project_role": "项目角色",
            "start_time": "开始时间",
            "end_time": "结束时间",
            "project_detail": "项目详情（使用HTML格式）"
          }
        ]
      },
      {
        "name": "self_comment",
        "modulename": "自我评价",
        "is_open": true,
        "child": [{
          "self_comment": "基于用户描述提炼的自我评价（使用HTML格式）"
        }]
      },
      {
        "name": "skills",
        "modulename": "专业技能",
        "is_open": true,
        "child": [{
          "skills": "从描述中提取的技能列表（使用HTML格式）"
        }]
      }
    ]
  }
}
```

## 解析规则

### 1. 信息提取
- 从用户描述中识别公司名称、职位、时间范围
- 提取核心职责、关键成果、量化指标
- 识别专业技能、工具、方法论
- 提炼核心亮点和竞争优势

### 2. 内容扩写
- 使用 STAR 法则（Situation, Task, Action, Result）重组经历描述
- 将简单描述扩写为专业的简历语言
- 增加合理的量化指标（如"管理20+人团队"、"提升35%增长率"）
- 突出战略洞察、管理能力、业务价值

### 3. HTML 格式要求
- 使用 `<p>` 标签包裹每个段落
- 使用 `<br>` 标签进行换行
- 使用 `<strong>` 标签强调关键数据
- 示例：
  ```html
  <p>统筹 <strong>4条产品线</strong> 的长期路线图，牵头年度战略规划与资源配置</p>
  <p>管理 <strong>20+人</strong> 产品团队，建立用户研究、数据增长、商业化三大中台</p>
  <p>驱动年度 ARR 复合增长 <strong>35%</strong></p>
  ```

### 4. 智能推断
- 如果用户提到"产品副总裁"，推断具备战略规划、团队管理、产品路线图等能力
- 如果用户提到"10年以上经验"，突出资深专家/管理者的定位
- 根据目标岗位，调整技能和工作经历的侧重点

## 处理流程

1. **分析输入文本**：识别关键信息（公司、职位、时间、成果、技能）
2. **结构化提取**：将信息映射到对应的简历模块
3. **内容扩写优化**：使用专业简历语言重写，增加量化指标
4. **格式化输出**：严格按照 JSON Schema 输出，确保所有字段完整

## 示例

### 输入
```
当前求职阶段：10年以上
目标岗位：产品总监

部分过往从业经历：在「数能集团」担任产品副总裁（2011-至今）
- 统筹4条产品线的长期路线图，牵头年度战略规划与资源配置，管理20+人产品团队
- 建立用户研究、数据增长、商业化三大中台，推动国内外市场同步上线
- 负责重大客户共创与生态伙伴联盟，驱动年度ARR复合增长35%

核心亮点：具备战略洞察、组织搭建与复杂stakeholder管理能力，可平衡创新与商业结果
```

### 输出
```json
{
  "content": {
    "modules": [
      {
        "name": "baseinfo",
        "modulename": "基础信息",
        "is_open": true,
        "child": [{
          "name": "",
          "phone": "",
          "email": "",
          "major": "",
          "edu": ""
        }]
      },
      {
        "name": "interestabout",
        "modulename": "求职意向",
        "is_open": true,
        "child": [{
          "intended_job": "产品总监",
          "intended_city": "",
          "intended_industry": "互联网/科技"
        }]
      },
      {
        "name": "eduabout",
        "modulename": "教育背景",
        "is_open": true,
        "child": [{
          "school": "",
          "major": "",
          "edu": "",
          "start_time": "",
          "end_time": ""
        }]
      },
      {
        "name": "workbg",
        "modulename": "工作经历",
        "is_open": true,
        "child": [
          {
            "company": "数能集团",
            "position": "产品副总裁",
            "start_time": "2011",
            "end_time": "至今",
            "job_detail": "<p>统筹 <strong>4条产品线</strong> 的长期路线图，牵头年度战略规划与资源配置，管理 <strong>20+人</strong> 产品团队</p><p>建立用户研究、数据增长、商业化三大中台，推动国内外市场同步上线</p><p>负责重大客户共创与生态伙伴联盟，驱动年度 ARR 复合增长 <strong>35%</strong></p><p>构建产品管理体系与标准化流程，提升产品交付效率与质量</p>"
          }
        ]
      },
      {
        "name": "projectabout",
        "modulename": "项目经历",
        "is_open": true,
        "child": []
      },
      {
        "name": "self_comment",
        "modulename": "自我评价",
        "is_open": true,
        "child": [{
          "self_comment": "<p>具备 <strong>10年以上</strong> 产品管理经验，深耕互联网产品战略规划与团队建设</p><p>拥有卓越的战略洞察力、组织搭建能力与复杂 stakeholder 管理能力</p><p>善于平衡创新与商业结果，驱动产品增长与业务突破</p><p>擅长用户研究、数据驱动决策与商业化变现</p>"
        }]
      },
      {
        "name": "skills",
        "modulename": "专业技能",
        "is_open": true,
        "child": [{
          "skills": "<p>产品战略规划 | 产品路线图设计 | 团队管理与搭建</p><p>用户研究 | 数据增长 | 商业化策略</p><p>跨部门协作 | 生态合作 | 客户共创</p><p>敏捷开发 | OKR管理 | 资源配置</p>"
        }]
      }
    ]
  }
}
```

## 注意事项

1. **所有字段必须存在**：即使信息缺失也要保留字段（值为空字符串）
2. **保持事实准确性**：不编造用户未提及的公司、职位、时间
3. **合理扩写**：在用户描述基础上，使用专业简历语言优化表达
4. **量化优先**：尽可能提取和突出数字、百分比、团队规模等量化指标
5. **HTML格式**：job_detail、project_detail、self_comment、skills 必须使用 HTML 格式
