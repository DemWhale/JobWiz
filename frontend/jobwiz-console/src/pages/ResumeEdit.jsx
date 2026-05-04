import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { resumeApi, resumeTemplateApi } from '../services/api';
import ResumePreview from '../components/resume/ResumePreview';
import ResumeForm from '../components/resume/ResumeForm';
import AIChatPanel from '../components/resume/AIChatPanel';
import './ResumeEdit.css';

const SECTION_LABELS = {
  baseinfo: '基本信息',
  interestabout: '求职意向',
  eduabout: '教育背景',
  workbg: '工作经历',
  projectabout: '项目经历',
  self_comment: '自我评价',
  skills: '专业技能',
  awardsabout: '荣誉奖项',
};

const ResumeEdit = ({ userId }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isNewDraft = id === 'new'; // 草稿模式标记
  const isAIMode = location.state?.mode === 'ai' || new URLSearchParams(location.search).get('mode') === 'ai'; // AI 模式
  const [resume, setResume] = useState(null);
  const [templateMeta, setTemplateMeta] = useState(null);
  const [resumeData, setResumeData] = useState(null);
  const [persistedResume, setPersistedResume] = useState(null);
  const [pendingPatch, setPendingPatch] = useState(null);
  const [activeTarget, setActiveTarget] = useState(null);
  const [sectionEditorOpen, setSectionEditorOpen] = useState(false);
  const [draftPrompt, setDraftPrompt] = useState('');
  const [, setChangeHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'dirty' | 'saving' | 'saved' | 'error' | 'draft'
  const [savedResumeId, setSavedResumeId] = useState(null);
  const formRef = useRef(null);
  
  // 拖拽分割线状态
  const [leftWidth, setLeftWidth] = useState(40); // 百分比
  const isDragging = useRef(false);

  // 已持久化的简历 ID（草稿首次保存后才有）
  const effectiveId = savedResumeId || (!isNewDraft ? id : null);

  const fetchTemplateMeta = useCallback(async (templateId) => {
    try {
      const template = await resumeTemplateApi.getById(templateId);
      if (template?.meta) {
        setTemplateMeta(JSON.parse(template.meta));
      }
    } catch {
      console.log('获取模板信息失败，使用默认布局');
    }
  }, []);

  const fetchResume = useCallback(async () => {
    try {
      const data = await resumeApi.getById(id);
      setResume(data);

      let parsed = { content: { modules: [] }, css_config: {} };
      if (data) {
        parsed = {
          content: data.content ? (typeof data.content === 'string' ? JSON.parse(data.content) : data.content) : { modules: [] },
          css_config: data.cssConfig ? (typeof data.cssConfig === 'string' ? JSON.parse(data.cssConfig) : data.cssConfig) : {},
          template_id: data.templateId,
          title: data.title,
          user_id: data.userId,
          uuid: data.uuid,
          share_status: data.shareStatus
        };
      }
      setResumeData(parsed);
      setPersistedResume(parsed);
      setPendingPatch(null);
      setActiveTarget(null);
      setSectionEditorOpen(false);
      setChangeHistory([]);

      if (data?.templateId) {
        fetchTemplateMeta(data.templateId);
      }
    } catch (error) {
      console.error('获取简历失败:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchTemplateMeta, id]);

  useEffect(() => {
    if (isNewDraft) {
      // 草稿模式：从 location.state 初始化，无需后端加载
      const state = location.state;
      
      if (isAIMode) {
        // AI 模式：使用传入的 resumeData 和 userInfo
        if (state?.resumeData) {
          setResumeData(state.resumeData);
          setPersistedResume(state.resumeData);
        }
        if (state?.templateId) {
          fetchTemplateMeta(state.templateId);
        }
        setSaveStatus('draft');
        setLoading(false);
        return;
      }
      
      // 普通草稿模式
      if (state?.resumeData) {
        setResumeData(state.resumeData);
        setPersistedResume(state.resumeData);
      }
      if (state?.templateId) {
        fetchTemplateMeta(state.templateId);
      }
      setSaveStatus('draft');
      setLoading(false); // 草稿模式直接完成加载
      return;
    }

    if (!id) return;
    fetchResume();
  }, [fetchResume, fetchTemplateMeta, id, isAIMode, isNewDraft, location.state]);

  // 拖拽分割线逻辑
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging.current) return;
      
      const container = document.querySelector('.resume-edit-body');
      if (!container) return;
      
      const rect = container.getBoundingClientRect();
      const percentage = ((e.clientX - rect.left) / rect.width) * 100;
      
      // 限制在 30%-70% 之间
      setLeftWidth(Math.min(Math.max(percentage, 30), 70));
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const handleMouseDown = (e) => {
    isDragging.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    e.preventDefault();
  };

  // 手动保存（立即执行，不走防抖）
  const handleManualSave = useCallback(async () => {
    if (!resumeData) return;

    setSaveStatus('saving');
    try {
      if (!effectiveId) {
        // 草稿首次保存：调用 create 创建简历
        const state = location.state || {};
        const created = await resumeApi.create({
          userId: Number(userId),
          templateId: state.templateId || null,
          title: '未命名简历',
          // 直接存储 content 和 css_config
          content: JSON.stringify(resumeData.content || resumeData),
          cssConfig: JSON.stringify(resumeData.css_config || {}),
        });
        setSavedResumeId(created.id);
        setResume(created);
        setPersistedResume(resumeData);
        setPendingPatch(null);
        setSaveStatus('saved');
        // 更新 URL 为正式的编辑页（不刷新页面）
        navigate(`/resume/edit/${created.id}`, { replace: true, state: null });
      } else {
        // 已有 ID，直接 update
        await resumeApi.update({
          id: Number(effectiveId),
          // 直接存储 content 和 css_config
          content: JSON.stringify(resumeData.content || resumeData),
          cssConfig: JSON.stringify(resumeData.css_config || {}),
        });
        setPersistedResume(resumeData);
        setPendingPatch(null);
        setSaveStatus('saved');
      }
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('保存简历失败:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  }, [effectiveId, resumeData, userId, location.state, navigate]);

  const handleFormChange = useCallback((newData) => {
    setResumeData(newData);
    setPendingPatch(null);
    setSaveStatus((prev) => (prev === 'saving' ? prev : 'dirty'));
  }, []);

  const handleSectionClick = (sectionId) => {
    if (isAIMode) {
      setActiveTarget({ section: sectionId });
      setSectionEditorOpen(false);
      return;
    }

    if (formRef.current) {
      formRef.current.scrollToSection(sectionId);
    }
  };

  const handleBack = () => {
    navigate('/resumes');
  };

  const activeSectionLabel = activeTarget?.section ? (SECTION_LABELS[activeTarget.section] || activeTarget.section) : null;

  const handleBubbleAction = (action) => {
    if (!activeSectionLabel) return;
    setDraftPrompt(`针对${activeSectionLabel}${action}`);
  };

  if (loading) {
    return <div className="resume-edit-loading">加载中...</div>;
  }

  return (
    <div className={`resume-edit-container ${isAIMode ? 'ai-mode' : ''}`}>
      {/* AI 模式不需要 header */}
      {!isAIMode && (
        <div className="resume-edit-header">
          <button className="back-btn" onClick={handleBack}>
            ← 返回列表
          </button>
          <h1 className="resume-edit-title">
            {resume?.title || resumeData?.title || '未命名简历'}
          </h1>
          <div className="save-status">
            {saveStatus === 'draft' && <span className="status-draft">草稿（未保存）</span>}
            {saveStatus === 'dirty' && <span className="status-dirty">未保存</span>}
            {saveStatus === 'saving' && <span className="status-saving">保存中...</span>}
            {saveStatus === 'saved' && <span className="status-saved">✓ 已保存</span>}
            {saveStatus === 'error' && <span className="status-error">✗ 保存失败</span>}
          </div>
          <button
            className="save-btn"
            onClick={handleManualSave}
            disabled={saveStatus === 'saving'}
          >
            {saveStatus === 'saving' ? '保存中...' : (isNewDraft && !savedResumeId ? '保存草稿' : '保存')}
          </button>
        </div>
      )}
      <div className="resume-edit-body">
        {isAIMode ? (
          /* AI 模式: 左侧聊天流 + 右侧简历预览 */
          <>
            {/* 左侧 Chat 区 */}
            <div className="resume-edit-left" style={{ width: `${leftWidth}%`, minWidth: `${leftWidth}%` }}>
              <AIChatPanel
                userInfo={location.state?.userInfo}
                resumeData={resumeData}
                persistedResume={persistedResume}
                pendingPatch={pendingPatch}
                activeTarget={activeTarget}
                saveStatus={saveStatus}
                draftPrompt={draftPrompt}
                onDraftPromptConsumed={() => setDraftPrompt('')}
                onPendingPatchChange={setPendingPatch}
                onActiveTargetChange={setActiveTarget}
                onChangeHistory={setChangeHistory}
                onUpdateResumeData={handleFormChange}
              />
            </div>
            
            {/* 拖拽分割线 */}
            <div 
              className="resize-handle"
              onMouseDown={handleMouseDown}
            />
            
            {/* 右侧简历区 */}
            <div className="resume-edit-right" style={{ width: `${100 - leftWidth}%`, minWidth: `${100 - leftWidth}%` }}>
              <div className="resume-preview-header">
                <h2 className="resume-preview-title">
                  {resume?.title || resumeData?.title || '未命名简历'}
                </h2>
                <button
                  className="save-btn"
                  onClick={handleManualSave}
                  disabled={saveStatus === 'saving'}
                >
                  {saveStatus === 'saving' ? '保存中...' : (isNewDraft && !savedResumeId ? '保存草稿' : '保存')}
                </button>
              </div>
              <div className="resume-preview-content">
                {activeTarget && (
                  <div className="ai-section-bubble">
                    <div className="ai-section-bubble-main">
                      <span className="ai-section-bubble-kicker">已选中</span>
                      <strong>{activeSectionLabel}</strong>
                    </div>
                    <div className="ai-section-bubble-actions">
                      <button type="button" onClick={() => handleBubbleAction('润色当前内容')}>
                        AI 润色
                      </button>
                      <button type="button" onClick={() => handleBubbleAction('补充量化成果')}>
                        量化成果
                      </button>
                      <button type="button" onClick={() => handleBubbleAction('压缩为更简洁版本')}>
                        压缩
                      </button>
                      <button type="button" className="ghost" onClick={() => setSectionEditorOpen(true)}>
                        手动编辑
                      </button>
                    </div>
                  </div>
                )}
                <ResumePreview
                  resumeData={resumeData}
                  templateMeta={templateMeta}
                  activeSectionId={activeTarget?.section}
                  onSectionClick={handleSectionClick}
                />
                {sectionEditorOpen && activeTarget && resumeData && (
                  <div className="ai-floating-editor">
                    <div className="ai-floating-editor-header">
                      <div>
                        <span>手动编辑</span>
                        <h3>{activeSectionLabel}</h3>
                      </div>
                      <button type="button" onClick={() => setSectionEditorOpen(false)}>
                        关闭
                      </button>
                    </div>
                    <div className="ai-floating-editor-body">
                      <ResumeForm
                        resumeData={resumeData}
                        onChange={handleFormChange}
                        visibleSections={[activeTarget.section]}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          /* 普通模式: 左侧表单 + 右侧预览 */
          <>
            <div className="resume-edit-left">
              <div className="resume-workspace-panel resume-form-panel">
                {resumeData && (
                  <ResumeForm
                    ref={formRef}
                    resumeData={resumeData}
                    onChange={handleFormChange}
                  />
                )}
              </div>
            </div>
            <div className="resume-edit-right">
              <div className="resume-workspace-panel resume-preview-panel">
                <ResumePreview
                  resumeData={resumeData}
                  templateMeta={templateMeta}
                  onSectionClick={handleSectionClick}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ResumeEdit;
