import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { resumeApi, resumeTemplateApi } from '../services/api';
import ResumePreview from '../components/resume/ResumePreview';
import ResumeForm from '../components/resume/ResumeForm';
import './ResumeEdit.css';

const ResumeEdit = ({ userId }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resume, setResume] = useState(null);
  const [templateMeta, setTemplateMeta] = useState(null);
  const [resumeData, setResumeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'error'
  const saveTimerRef = useRef(null);

  useEffect(() => {
    if (!id) return;
    fetchResume();
  }, [id]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  const fetchResume = async () => {
    try {
      const data = await resumeApi.getById(id);
      setResume(data);

      // 解析简历数据
      let parsed = { basics: {}, sections: {} };
      if (data?.resumeDetail) {
        try {
          parsed = JSON.parse(data.resumeDetail);
        } catch (e) {
          console.error('解析简历数据失败:', e);
        }
      }
      setResumeData(parsed);

      // 获取模板 meta
      if (data?.templateId) {
        try {
          const template = await resumeTemplateApi.getById(data.templateId);
          if (template?.meta) {
            setTemplateMeta(JSON.parse(template.meta));
          }
        } catch (e) {
          console.log('获取模板信息失败，使用默认布局');
        }
      }
    } catch (error) {
      console.error('获取简历失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 防抖保存
  const debouncedSave = useCallback((data) => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    setSaveStatus('saving');

    saveTimerRef.current = setTimeout(async () => {
      try {
        await resumeApi.update({
          id: Number(id),
          resumeDetail: JSON.stringify(data),
        });
        setSaveStatus('saved');
        // 2秒后清除保存状态
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch (error) {
        console.error('保存简历失败:', error);
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    }, 500);
  }, [id]);

  const handleFormChange = useCallback((newData) => {
    setResumeData(newData);
    debouncedSave(newData);
  }, [debouncedSave]);

  const handleSectionClick = (sectionId) => {
    // TODO: Spec E — 反向锚定到左侧表单
    console.log('Section clicked:', sectionId);
  };

  const handleBack = () => {
    navigate('/resumes');
  };

  if (loading) {
    return <div className="resume-edit-loading">加载中...</div>;
  }

  return (
    <div className="resume-edit-container">
      <div className="resume-edit-header">
        <button className="back-btn" onClick={handleBack}>
          ← 返回列表
        </button>
        <h1 className="resume-edit-title">
          {resume?.title || '未命名简历'}
        </h1>
        <div className="save-status">
          {saveStatus === 'saving' && <span className="status-saving">保存中...</span>}
          {saveStatus === 'saved' && <span className="status-saved">✓ 已保存</span>}
          {saveStatus === 'error' && <span className="status-error">✗ 保存失败</span>}
        </div>
      </div>
      <div className="resume-edit-body">
        {/* 左侧：编辑表单 */}
        <div className="resume-edit-left">
          {resumeData && (
            <ResumeForm
              resumeData={resumeData}
              onChange={handleFormChange}
            />
          )}
        </div>
        {/* 右侧：渲染预览 */}
        <div className="resume-edit-right">
          <ResumePreview
            resumeData={resumeData}
            templateMeta={templateMeta}
            onSectionClick={handleSectionClick}
          />
        </div>
      </div>
    </div>
  );
};

export default ResumeEdit;
