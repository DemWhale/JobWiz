import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AIResumeWorkflow.css';

/** 用户信息接口 */
interface UserInfo {
  name: string;
  industry: string;
  targetPosition: string;
  targetCity: string;
}

/**
 * AI 简历入口组件
 * 
 * 新流程: 直接跳转到编辑页(AI 模式),不再显示表单
 */
export default function AIResumeWorkflow() {
  const navigate = useNavigate();

  // 默认测试数据
  const defaultResumeData = {
    content: {
      modules: [
        {
          name: 'baseinfo',
          modulename: '基础信息',
          is_open: true,
          child: [
            { name: '张三', title: '后端开发工程师', email: 'zhangsan@example.com', phone: '13800138000' }
          ]
        },
        {
          name: 'eduabout',
          modulename: '教育经历',
          is_open: true,
          child: [
            {
              school: '北京大学',
              major: '计算机科学与技术',
              time: '2022-09 - 2026-06',
              degree: '本科',
              description: '主修课程包括数据结构与算法、操作系统、计算机网络、数据库系统、软件工程、人工智能导论等，平均学分绩点（GPA）达到 3.8/4.0。\n\n积极参与学院组织的科研项目和技术讲座，拓宽专业视野，提升解决复杂问题的能力。\n\n荣获校级三好学生荣誉称号，并在 ACM 程序设计竞赛中获得二等奖。'
            }
          ]
        },
        {
          name: 'projectabout',
          modulename: '项目经历',
          is_open: true,
          child: [
            {
              projectname: '基于深度学习的智能推荐系统',
              time: '2024-03 - 2024-08',
              description: '负责系统架构设计和核心算法实现，基于 Python 与 TensorFlow 构建深度学习模型，实现用户行为预测与商品推荐。\n\n收集并处理了超过 10 万条用户行为数据，通过特征工程将数据维度提升 20%，有效提升模型训练效率。\n\n优化推荐算法，使系统推荐准确率提升了 15%，用户点击率提高了 8%，并在期末项目评比中获得 A+。\n\n撰写项目报告，详细阐述了模型原理、实验过程与结果分析，展示了扎实的理论基础和实践能力。'
            },
            {
              projectname: '校园二手交易平台开发',
              time: '2023-09 - 2024-01',
              description: '独立设计并开发了基于 Spring Boot 后端框架和 Vue.js 前端框架的校园二手交易平台。\n\n实现了用户注册登录、商品发布、浏览搜索、在线聊天、订单管理等核心功能模块。\n\n采用 MySQL 数据库进行数据存储，并设计了高效的数据库表结构，确保数据访问速度和系统稳定性。\n\n通过压力测试，系统支持 500+并发用户，并在校内小范围测试中获得师生一致好评，用户反馈积极，日均活跃用户达[XX]人。'
            }
          ]
        }
      ]
    },
    css_config: {
      global: {
        fontColor: '#363636',
        fontFamily: 'PingFang SC,Microsoft Yahei',
        fontSize: 12,
        lineHeight: 1.45,
        themeColor: '#001a66'
      }
    },
    template_id: 1,
    title: '张三_后端开发工程师',
    user_id: 1,
    share_status: 0
  };

  // 直接跳转到编辑页
  navigate('/resume/edit/new', {
    state: {
      mode: 'ai',
      userInfo: {
        name: '张三',
        industry: '互联网',
        targetPosition: '后端开发工程师',
        targetCity: '北京',
        prefillMessage: `请帮我基于以下信息创建一份简历：\n\n教育经历\n北京大学 计算机科学与技术 2022-09 - 2026-06 本科\n主修课程包括数据结构与算法、操作系统、计算机网络、数据库系统、软件工程、人工智能导论等，平均学分绩点（GPA）达到 3.8/4.0。\n积极参与学院组织的科研项目和技术讲座，拓宽专业视野，提升解决复杂问题的能力。\n荣获校级三好学生荣誉称号，并在 ACM 程序设计竞赛中获得二等奖。\n\n项目经历\n1. 基于深度学习的智能推荐系统 2024-03 - 2024-08\n负责系统架构设计和核心算法实现，基于 Python 与 TensorFlow 构建深度学习模型，实现用户行为预测与商品推荐。\n收集并处理了超过 10 万条用户行为数据，通过特征工程将数据维度提升 20%，有效提升模型训练效率。\n优化推荐算法，使系统推荐准确率提升了 15%，用户点击率提高了 8%，并在期末项目评比中获得 A+。\n撰写项目报告，详细阐述了模型原理、实验过程与结果分析，展示了扎实的理论基础和实践能力。\n\n2. 校园二手交易平台开发 2023-09 - 2024-01\n独立设计并开发了基于 Spring Boot 后端框架和 Vue.js 前端框架的校园二手交易平台。\n实现了用户注册登录、商品发布、浏览搜索、在线聊天、订单管理等核心功能模块。\n采用 MySQL 数据库进行数据存储，并设计了高效的数据库表结构，确保数据访问速度和系统稳定性。\n通过压力测试，系统支持 500+并发用户，并在校内小范围测试中获得师生一致好评，用户反馈积极，日均活跃用户达[XX]人。`,
        autoSend: true  // 标记需要自动发送
      },
      resumeData: defaultResumeData,
      templateId: 1
    }
  });

  return null;
}
