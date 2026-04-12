import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { resumeApi, resumeTemplateApi } from '../services/api';
import ResumePreview from '../components/resume/ResumePreview';
import './ResumeEdit.css';

const ResumeEdit = ({ userId }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resume, setResume] = useState(null);
  const [templateMeta, setTemplateMeta] = useState(null);
  const [resumeData, setResumeData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetchResume();
  }, [id]);

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
      </div>
      <div className="resume-edit-body">
        {/* 左侧：编辑区（Spec E 实现） */}
        <div className="resume-edit-left">
          <div className="resume-edit-placeholder">
            <p>简历编辑区（Spec E 实现）</p>
            <p className="placeholder-hint">当前为只读预览模式，编辑功能将在后续版本中提供</p>
          </div>
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
