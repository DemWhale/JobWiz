import { useState, useEffect } from 'react';
import { resumeTemplateApi, resumeApi } from '../services/api';
import './TemplateSelector.css';

const TemplateSelector = ({ open, onClose, userId, onSelect }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [creating, setCreating] = useState(false);

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

  const handleConfirm = async () => {
    if (!selectedId || !userId) return;
    setCreating(true);
    try {
      // 创建空简历，关联模板 ID
      const resume = await resumeApi.create({
        userId: Number(userId),
        templateId: selectedId,
        title: '未命名简历',
        resumeDetail: JSON.stringify({
          basics: { name: '', headline: '', email: '', phone: '', location: '', url: '' },
          sections: {}
        }),
      });

      if (onSelect) {
        onSelect(resume.id);
      }
    } catch (error) {
      console.error('创建简历失败:', error);
      alert('创建简历失败，请重试');
    } finally {
      setCreating(false);
    }
  };

  const handleBlankCreate = async () => {
    if (!userId) return;
    setCreating(true);
    try {
      const resume = await resumeApi.create({
        userId: Number(userId),
        templateId: null,
        title: '未命名简历',
        resumeDetail: JSON.stringify({
          basics: { name: '', headline: '', email: '', phone: '', location: '', url: '' },
          sections: {}
        }),
      });

      if (onSelect) {
        onSelect(resume.id);
      }
    } catch (error) {
      console.error('创建空白简历失败:', error);
      alert('创建简历失败，请重试');
    } finally {
      setCreating(false);
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
            disabled={!selectedId || creating}
            onClick={handleConfirm}
          >
            {creating ? '创建中...' : '使用此模板'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplateSelector;
