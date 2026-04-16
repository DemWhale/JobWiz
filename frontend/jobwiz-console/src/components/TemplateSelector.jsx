import { useState, useEffect } from 'react';
import { resumeTemplateApi } from '../services/api';
import './TemplateSelector.css';

// 预填充简历数据（基于 .cache/resume.json）
const DEFAULT_RESUME_DATA = {
  basics: {
    name: '得敏',
    headline: 'JAVA',
    email: 'xiaou.up@example.com',
    phone: '+86 138-XXXX-XXXX',
    location: '北京',
    url: '',
    customFields: [
      { name: '性别', value: '男' },
      { name: '籍贯', value: '河北' },
      { name: 'GitHub', value: '' },
      { name: '当前状态', value: '待业' },
      { name: '主页链接', value: '991230' },
      { name: '个性', value: '外向' },
    ],
  },
  sections: {
    summary: {
      content: '作为一名充满热情和求知欲的应届毕业生，我具备扎实的计算机科学基础和出色的学习能力。在校期间，我积极参与多个项目，熟练掌握了Java、Python等编程语言，并积累了丰富的项目开发和团队协作经验。我渴望将所学知识应用于实际工作，通过持续学习和不懈努力，为企业创造价值，实现个人职业成长。',
    },
    education: [
      {
        id: 'edu1',
        institution: '北京大学',
        studyType: '本科',
        area: '计算机科学与技术',
        date: '2022-09 - 2026-06',
        summary: '主修课程包括数据结构与算法、操作系统、计算机网络、数据库系统、软件工程、人工智能导论等，平均学分绩点（GPA）达到3.8/4.0。积极参与学院组织的科研项目和技术讲座，拓宽专业视野，提升解决复杂问题的能力。荣获校级三好学生荣誉称号，并在ACM程序设计竞赛中获得二等奖。',
      },
    ],
    experience: [],
    projects: [
      {
        id: 'proj1',
        name: '基于深度学习的智能推荐系统',
        date: '2024-03 - 2024-08',
        summary: '负责系统架构设计和核心算法实现，基于Python与TensorFlow构建深度学习模型，实现用户行为预测与商品推荐。收集并处理了超过10万条用户行为数据，通过特征工程将数据维度提升20%，有效提升模型训练效率。优化推荐算法，使系统推荐准确率提升了15%，用户点击率提高了8%，并在期末项目评比中获得A+。',
      },
      {
        id: 'proj2',
        name: '校园二手交易平台开发',
        date: '2023-09 - 2024-01',
        summary: '独立设计并开发了基于Spring Boot后端框架和Vue.js前端框架的校园二手交易平台。实现了用户注册登录、商品发布、浏览搜索、在线聊天、订单管理等核心功能模块。采用MySQL数据库进行数据存储，并设计了高效的数据库表结构，确保数据访问速度和系统稳定性。通过压力测试，系统支持500+并发用户，并在校内小范围测试中获得师生一致好评。',
      },
    ],
    skills: [
      { id: 'skill1', name: '编程语言', level: 3, keywords: ['Java', 'Python', 'C++', 'JavaScript'] },
      { id: 'skill2', name: '前端技术', level: 3, keywords: ['Vue.js', 'HTML5', 'CSS3', 'Element UI'] },
      { id: 'skill3', name: '后端技术', level: 3, keywords: ['Spring Boot', 'MyBatis', 'RESTful API', 'Tomcat'] },
      { id: 'skill4', name: '数据库', level: 3, keywords: ['MySQL', 'Redis', 'MongoDB'] },
      { id: 'skill5', name: '开发工具与平台', level: 3, keywords: ['Git', 'Maven', 'IntelliJ IDEA', 'VS Code', 'Linux'] },
      { id: 'skill6', name: '机器学习', level: 3, keywords: ['TensorFlow', 'Scikit-learn', '数据分析', '模型优化'] },
    ],
    certifications: [
      { id: 'cert1', name: '大学英语四级证书', issuer: '教育部考试中心', date: '2023-03' },
      { id: 'cert2', name: '全国计算机等级考试二级C++', issuer: '教育部考试中心', date: '2022-12' },
    ],
    awards: [
      { id: 'award1', title: '校级三好学生', awarder: '北京大学', date: '2023-09' },
      { id: 'award2', title: 'ACM程序设计竞赛二等奖', awarder: '北京大学', date: '2023-05' },
    ],
    volunteer: [
      {
        id: 'vol1',
        organization: '北京大学学生会',
        position: '技术部部长',
        date: '2023-09 - 2024-09',
        summary: '负责学生会官方网站的日常维护与功能迭代，主导完成了网站前端界面优化，提升用户体验。组织并指导部门成员进行编程技能培训，如Python入门、Web开发基础等，成功培训20余名学生。策划并实施了3场大型校园技术分享活动，邀请行业专家进行讲座，参与人数累计超过500人次，极大地促进了校园技术交流氛围。',
      },
    ],
  },
};

const TemplateSelector = ({ open, onClose, userId, onSelect }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    if (open) {
      fetchTemplates();
      setSelectedId(null);
    }
  }, [open]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const data = await resumeTemplateApi.list();
      setTemplates(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('加载模板失败:', error);
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (id) => {
    setSelectedId(id);
  };

  const handleConfirm = () => {
    if (!selectedId || !userId) return;
    // 不调后端，仅传递草稿数据
    if (onSelect) {
      onSelect({
        templateId: selectedId,
        resumeData: DEFAULT_RESUME_DATA,
      });
    }
  };

  const handleBlankCreate = () => {
    if (!userId) return;
    // 不调后端，仅传递草稿数据
    if (onSelect) {
      onSelect({
        templateId: null,
        resumeData: DEFAULT_RESUME_DATA,
      });
    }
  };

  if (!open) return null;

  return (
    <div className="template-selector-overlay" onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <div className="template-selector">
        <div className="template-selector-header">
          <h2>推荐简历模板</h2>
          <button className="template-selector-close" onClick={onClose}>×</button>
        </div>

        <div className="template-selector-content">
          {loading ? (
            <div className="template-selector-loading">加载模板中...</div>
          ) : (
            <div className="template-grid">
              {/* 新建空白简历 */}
              <div
                className="template-card template-card-blank"
                onClick={handleBlankCreate}
              >
                <div className="template-card-preview">+</div>
                <div className="template-card-title">新建空白简历</div>
              </div>

              {/* 模板列表 */}
              {templates.map((template) => (
                <div
                  key={template.id}
                  className={`template-card ${selectedId === template.id ? 'selected' : ''}`}
                  onClick={() => handleSelect(template.id)}
                >
                  <div className="template-card-preview">
                    {template.preview ? (
                      <img src={template.preview} alt={template.title} />
                    ) : (
                      <span style={{ color: '#999', fontSize: '13px' }}>
                        {template.title}
                      </span>
                    )}
                  </div>
                  <div className="template-card-title">{template.title}</div>
                  {template.description && (
                    <div className="template-card-desc">{template.description}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="template-selector-footer">
          <button className="btn-cancel" onClick={onClose}>取消</button>
          <button
            className="btn-confirm"
            disabled={!selectedId}
            onClick={handleConfirm}
          >
            使用此模板
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplateSelector;
