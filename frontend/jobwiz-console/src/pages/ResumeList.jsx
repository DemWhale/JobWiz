import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { resumeApi } from '../services/api';
import './ResumeList.css';

const ResumeList = ({ userId }) => {
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredResumeId, setHoveredResumeId] = useState(null);

  // 加载简历列表
  useEffect(() => {
    if (!userId) return;
    const fetchResumes = async () => {
      try {
        const data = await resumeApi.listByUserId(userId);
        setResumes(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('加载简历列表失败:', error);
        setResumes([]);
      } finally {
        setLoading(false);
      }
    };
    fetchResumes();
  }, [userId]);

  // 格式化相对时间
  const formatRelativeTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return `${diffMins} 分钟前`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} 小时前`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `${diffDays} 天前`;
    return date.toLocaleDateString('zh-CN');
  };

  // 从 resume_detail 解析标题（如果没有 title 字段）
  const getResumeTitle = (resume) => {
    if (resume.title) return resume.title;
    try {
      const detail = JSON.parse(resume.resumeDetail || '{}');
      const name = detail.basics?.name || '未命名';
      const headline = detail.basics?.headline || '';
      const date = new Date().toLocaleDateString('zh-CN');
      return `${name}_${headline}_${date}`;
    } catch {
      return '未命名简历';
    }
  };

  // 渲染简历缩略图
  const renderThumbnail = (resume) => {
    try {
      const detail = JSON.parse(resume.resumeDetail || '{}');
      return (
        <div className="resume-thumbnail">
          <div className="thumbnail-preview">
            <div className="thumbnail-name">{detail.basics?.name || ''}</div>
            <div className="thumbnail-headline">{detail.basics?.headline || ''}</div>
          </div>
        </div>
      );
    } catch {
      return (
        <div className="resume-thumbnail">
          <div className="thumbnail-preview empty">
            <span>暂无预览</span>
          </div>
        </div>
      );
    }
  };

  const handleCreate = () => {
    navigate('/resume/new');
  };

  const handleAICreate = () => {
    // TODO: AI 创建简历，后续 Spec E 实现
    console.log('AI 创建简历');
  };

  const handleImport = () => {
    // 导入现有简历，本期不实现
    console.log('导入现有简历');
  };

  const handleEdit = (resume, type) => {
    if (type === 'manual') {
      navigate(`/resume/edit/${resume.id}`);
    } else {
      // AI 编辑，后续 Spec E 实现
      navigate(`/resume/edit/${resume.id}?mode=ai`);
    }
  };

  return (
    <div className="resume-list-container">
      <div className="resume-list-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate('/')}>
            ← 返回
          </button>
          <div className="header-titles">
            <h1 className="page-title">简历</h1>
            <p className="page-subtitle">管理和创建你的专业简历</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn-import" onClick={handleImport}>
            <span className="btn-icon">↓</span>
            导入现有简历
          </button>
          <button className="btn-create" onClick={handleCreate}>
            + 新建简历
          </button>
          <button className="btn-ai-create" onClick={handleAICreate}>
            &lt;/&gt; AI 创建简历
          </button>
        </div>
      </div>

      <div className="resume-list-content">
        {loading ? (
          <div className="loading-state">加载中...</div>
        ) : resumes.length === 0 ? (
          <div className="empty-state">
            <p>还没有简历，请点击"新建简历"开始创建</p>
          </div>
        ) : (
          <div className="resume-grid">
            {resumes.map((resume) => (
              <div
                key={resume.id}
                className="resume-card"
                onMouseEnter={() => setHoveredResumeId(resume.id)}
                onMouseLeave={() => setHoveredResumeId(null)}
              >
                {renderThumbnail(resume)}
                <div className="resume-info">
                  <h3 className="resume-title">{getResumeTitle(resume)}</h3>
                  <p className="resume-time">
                    最后更新于 {formatRelativeTime(resume.updatedAt)}
                  </p>
                </div>
                {hoveredResumeId === resume.id && (
                  <div className="resume-actions">
                    <button
                      className="action-btn edit-btn"
                      onClick={() => handleEdit(resume, 'manual')}
                    >
                      ✏️ 手动编辑
                    </button>
                    <button
                      className="action-btn ai-edit-btn"
                      onClick={() => handleEdit(resume, 'ai')}
                    >
                      ✨ AI 编辑
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 右下角浮动新建按钮 */}
      <button className="fab-button" onClick={handleCreate}>
        +
      </button>
    </div>
  );
};

export default ResumeList;
