import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { resumeApi } from '../services/api';
import TemplateSelector from '../components/TemplateSelector';
import ResumePreview from '../components/resume/ResumePreview';
import './ResumeList.css';

const parseJsonMaybe = (value, fallback) => {
  if (!value) return fallback;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const buildResumeData = (resume) => {
  const content = parseJsonMaybe(resume.content, null);
  if (content?.modules) {
    return {
      content,
      css_config: parseJsonMaybe(resume.cssConfig, {}),
      template_id: resume.templateId,
      title: resume.title,
      user_id: resume.userId,
    };
  }

  const oldDetail = parseJsonMaybe(resume.resumeDetail, null);
  if (oldDetail?.content?.modules) return oldDetail;
  return null;
};

const ResumeList = ({ userId }) => {
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [importing, setImporting] = useState(false);
  const [creatingImported, setCreatingImported] = useState(false);
  const [importError, setImportError] = useState('');

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
    const data = buildResumeData(resume);
    const baseinfo = data?.content?.modules?.find((module) => module.name === 'baseinfo')?.child?.[0];
    if (baseinfo?.name) return `${baseinfo.name}的简历`;
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
    const resumeData = buildResumeData(resume);
    if (resumeData) {
      return (
        <div className="resume-thumbnail">
          <ResumePreview resumeData={resumeData} compact />
        </div>
      );
    }

    return (
      <div className="resume-thumbnail">
        <div className="thumbnail-preview empty">
          <span>暂无预览</span>
        </div>
      </div>
    );
  };

  const handleCreate = () => {
    setShowTemplateSelector(true);
  };

  const handleTemplateSelect = (draftInfo) => {
    setShowTemplateSelector(false);
    // 草稿模式：跳转到编辑页，通过 navigate state 传递草稿数据
    navigate('/resume/edit/new', {
      state: {
        templateId: draftInfo.templateId,
        resumeData: draftInfo.resumeData,
      },
    });
  };

  const handleAICreate = () => {
    // 跳转到 AI 信息收集表单页
    navigate('/resume/ai-create');
  };

  const handleImport = () => {
    setImportOpen(true);
    setImportFile(null);
    setImportResult(null);
    setImportError('');
  };

  const handleEdit = (resume, type) => {
    if (type === 'manual') {
      navigate(`/resume/edit/${resume.id}`);
    } else {
      // AI 编辑，后续 Spec E 实现
      navigate(`/resume/edit/${resume.id}?mode=ai`);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await resumeApi.delete(deleteTarget.id);
      setResumes((prev) => prev.filter((resume) => resume.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (error) {
      console.error('删除简历失败:', error);
      alert('删除失败，请稍后重试');
    } finally {
      setDeleting(false);
    }
  };

  const handleImportParse = async () => {
    if (!importFile) return;
    setImporting(true);
    setImportError('');
    try {
      const result = await resumeApi.parseImport(importFile);
      setImportResult(result);
    } catch (error) {
      setImportError(error.response?.data?.message || error.message || '解析失败，请换一个 PDF / Word 文件重试');
    } finally {
      setImporting(false);
    }
  };

  const handleCreateImportedResume = async () => {
    if (!importResult) return;
    setCreatingImported(true);
    setImportError('');
    try {
      const created = await resumeApi.create({
        userId: Number(userId),
        templateId: null,
        title: importResult.title || '导入简历',
        content: JSON.stringify(importResult.content),
        cssConfig: JSON.stringify(importResult.cssConfig || {}),
      });
      setImportOpen(false);
      navigate(`/resume/edit/${created.id}`);
    } catch (error) {
      setImportError(error.response?.data?.message || error.message || '创建导入简历失败');
    } finally {
      setCreatingImported(false);
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
              >
                {renderThumbnail(resume)}
                <div className="resume-info">
                  <h3 className="resume-title">{getResumeTitle(resume)}</h3>
                  <p className="resume-time">
                    最后更新于 {formatRelativeTime(resume.gmtModified)}
                  </p>
                </div>
                <div className="resume-actions">
                  <button
                    className="action-btn edit-btn"
                    onClick={() => handleEdit(resume, 'manual')}
                  >
                    手动编辑
                  </button>
                  <button
                    className="action-btn ai-edit-btn"
                    onClick={() => handleEdit(resume, 'ai')}
                  >
                    AI 编辑
                  </button>
                  <button
                    className="action-btn delete-btn"
                    onClick={(event) => {
                      event.stopPropagation();
                      setDeleteTarget(resume);
                    }}
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 右下角浮动新建按钮 */}
      <button className="fab-button" onClick={handleCreate}>
        +
      </button>

      {/* 模板选择弹窗 */}
      <TemplateSelector
        open={showTemplateSelector}
        onClose={() => setShowTemplateSelector(false)}
        userId={userId}
        onSelect={handleTemplateSelect}
      />

      {deleteTarget && (
        <div className="delete-dialog-backdrop" onClick={() => !deleting && setDeleteTarget(null)}>
          <div className="delete-dialog" onClick={(event) => event.stopPropagation()}>
            <h2>删除简历</h2>
            <p>确定删除「{getResumeTitle(deleteTarget)}」吗？删除后无法恢复。</p>
            <div className="delete-dialog-actions">
              <button type="button" onClick={() => setDeleteTarget(null)} disabled={deleting}>
                取消
              </button>
              <button type="button" className="danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? '删除中...' : '确认删除'}
              </button>
            </div>
          </div>
        </div>
      )}

      {importOpen && (
        <div className="import-dialog-backdrop" onClick={() => !importing && !creatingImported && setImportOpen(false)}>
          <div className="import-dialog" onClick={(event) => event.stopPropagation()}>
            <div className="import-dialog-header">
              <div>
                <h2>导入现有简历</h2>
                <p>支持 PDF、DOCX、DOC。解析后会生成一份可继续编辑的结构化简历。</p>
              </div>
              <button type="button" onClick={() => setImportOpen(false)} disabled={importing || creatingImported}>
                关闭
              </button>
            </div>

            <div className="import-uploader">
              <input
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={(event) => {
                  const file = event.target.files?.[0] || null;
                  setImportFile(file);
                  setImportResult(null);
                  setImportError('');
                }}
              />
              <button type="button" onClick={handleImportParse} disabled={!importFile || importing}>
                {importing ? '解析中...' : '开始解析'}
              </button>
            </div>

            {importError && <div className="import-error">{importError}</div>}

            {importResult && (
              <div className="import-result">
                <div className="import-summary">
                  <span>文件：{importResult.fileName}</span>
                  <span>文本：{importResult.textLength || 0} 字</span>
                  <span>置信度：{Math.round((importResult.confidence || 0) * 100)}%</span>
                </div>
                <div className="import-sections">
                  {(importResult.extractedSections || []).map((section) => (
                    <span key={section}>{section}</span>
                  ))}
                  {(importResult.missingFields || []).map((field) => (
                    <span key={field} className="missing">缺少 {field}</span>
                  ))}
                </div>
                <div className="import-preview">
                  <ResumePreview
                    resumeData={{
                      content: importResult.content,
                      css_config: importResult.cssConfig || {},
                      title: importResult.title,
                      user_id: userId,
                    }}
                    compact
                  />
                </div>
                <div className="import-dialog-actions">
                  <button type="button" onClick={() => setImportResult(null)} disabled={creatingImported}>
                    重新选择
                  </button>
                  <button type="button" className="primary" onClick={handleCreateImportedResume} disabled={creatingImported}>
                    {creatingImported ? '创建中...' : '创建这份简历'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeList;
