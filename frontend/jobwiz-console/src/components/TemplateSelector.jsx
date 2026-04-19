import { useState, useEffect } from 'react';
import { resumeTemplateApi } from '../services/api';
import './TemplateSelector.css';

// 预填充简历数据（基于 data.json schema）
const DEFAULT_RESUME_DATA = {
  content: {
    modules: [
      {
        name: 'baseinfo',
        modulename: '基础信息',
        is_open: true,
        child: [{
          name: '待填',
          email: '',
          phone: '',
          edu: '',
          major: '',
          intro: '',
          avatar_url: '',
          political_status: '',
          working_age: ''
        }]
      },
      {
        name: 'interestabout',
        modulename: '求职意向',
        is_open: true,
        child: [{
          intended_city: '',
          intended_industry: '',
          intended_job: '',
          job_seeking_status: ''
        }]
      },
      {
        name: 'eduabout',
        modulename: '教育背景',
        is_open: true,
        child: []
      },
      {
        name: 'workbg',
        modulename: '工作经历',
        is_open: true,
        child: []
      },
      {
        name: 'projectabout',
        modulename: '项目经历',
        is_open: true,
        child: []
      },
      {
        name: 'self_comment',
        modulename: '自我评价',
        is_open: true,
        child: [{ self_comment: '' }]
      },
      {
        name: 'skills',
        modulename: '专业技能',
        is_open: false,
        child: [{ skills: '' }]
      },
      {
        name: 'awardsabout',
        modulename: '荣誉奖项',
        is_open: false,
        child: [{ award_title: '', award_level: '', award_time: '' }]
      },
      {
        name: 'productabout',
        modulename: '作品集',
        is_open: false,
        child: [{ product_title: '', product_url: '', product_img: '' }]
      }
    ]
  },
  css_config: {
    global: {
      fontColor: '#363636',
      fontFamily: 'PingFang SC,Microsoft Yahei',
      fontSize: 12,
      is_english: false,
      lineHeight: 1.45,
      moduleDistance: 7,
      paddingx: 20,
      paddingy: 20,
      textDistance: 1,
      themeColor: '#001a66',
      titleBottom: 1
    }
  },
  template_id: 18,
  title: '新建简历',
  share_status: 1
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
