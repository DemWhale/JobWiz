import { useMemo } from 'react';
import ResumeHeader from './ResumeHeader';
import ResumeSectionWrapper from './ResumeSectionWrapper';
import ResumeSummary from './ResumeSummary';
import ResumeEducation from './ResumeEducation';
import ResumeExperience from './ResumeExperience';
import ResumeProjects from './ResumeProjects';
import ResumeSkills from './ResumeSkills';
import ResumeCertifications from './ResumeCertifications';
import './ResumePreview.css';
import './resume.css';

// 模块名称映射 (新 schema)
const MODULE_NAMES = {
  self_comment: '自我评价',
  eduabout: '教育背景',
  workbg: '工作经历',
  projectabout: '项目经历',
  skills: '专业技能',
  awardsabout: '荣誉奖项',
  interestabout: '求职意向',
};

// 模块渲染组件映射
const MODULE_COMPONENTS = {
  self_comment: ResumeSummary,
  eduabout: ResumeEducation,
  workbg: ResumeExperience,
  projectabout: ResumeProjects,
  skills: ResumeSkills,
  awardsabout: ResumeCertifications,
};

/**
 * 简历预览组件 - 对齐新 schema
 * @param {Object} resumeData - { content: { modules: [] }, css_config: {} }
 * @param {Object} templateMeta - 模板元数据 (可选,向后兼容)
 * @param {Function} onSectionClick - 模块点击回调
 */
const ResumePreview = ({ resumeData, templateMeta, onSectionClick }) => {
  // 查找模块
  const findModule = (name) => {
    return resumeData?.content?.modules?.find(m => m.name === name);
  };

  // 解析 CSS 变量样式 (优先使用 resumeData.css_config)
  const cssVars = useMemo(() => {
    const cssConfig = resumeData?.css_config?.global || {};
    const theme = templateMeta?.theme || {};
    const typography = templateMeta?.typography || {};
    const page = templateMeta?.page || {};
    
    return {
      '--resume-theme-text': cssConfig.fontColor || theme.text || '#242424',
      '--resume-theme-primary': cssConfig.themeColor || theme.primary || '#2563eb',
      '--resume-theme-background': theme.background || '#fffefe',
      '--resume-font-size': `${cssConfig.fontSize || typography.font?.size || 13}px`,
      '--resume-font-family': cssConfig.fontFamily || typography.font?.family || "'Noto Sans SC', sans-serif",
      '--resume-line-height': cssConfig.lineHeight || typography.lineHeight || 1.3,
      '--resume-page-margin': `${page.margin || 28}px`,
    };
  }, [resumeData, templateMeta]);

  // 获取所有可见模块
  const visibleModules = useMemo(() => {
    if (!resumeData?.content?.modules) return [];
    return resumeData.content.modules.filter(m => m.is_open !== false);
  }, [resumeData]);

  // 渲染单个模块
  const renderModule = (module) => {
    const Component = MODULE_COMPONENTS[module.name];
    if (!Component) return null;

    const moduleName = MODULE_NAMES[module.name] || module.modulename || module.name;
    const childData = module.child || [];

    // 根据不同模块传递不同的 props
    let props = {};
    switch (module.name) {
      case 'self_comment':
        props = { htmlContent: childData[0]?.self_comment };
        break;
      case 'eduabout':
        props = { items: childData };
        break;
      case 'workbg':
        props = { items: childData };
        break;
      case 'projectabout':
        props = { items: childData };
        break;
      case 'skills':
        props = { htmlContent: childData[0]?.skills };
        break;
      case 'awardsabout':
        props = { items: childData };
        break;
      default:
        props = { items: childData };
    }

    return (
      <ResumeSectionWrapper
        key={module.name}
        sectionId={module.name}
        name={moduleName}
        visible={module.is_open !== false}
        onAnchorClick={onSectionClick}
      >
        <Component {...props} />
      </ResumeSectionWrapper>
    );
  };

  // 获取基础信息
  const baseinfo = findModule('baseinfo');
  const baseinfoData = baseinfo?.child?.[0] || {};

  return (
    <div className="resume-preview-container">
      <div className="resume-preview-a4">
        <div className="resume-render resume-a4" style={cssVars}>
          {/* Header */}
          <ResumeHeader baseinfoData={baseinfoData} />

          {/* 单栏布局 (新 schema 不区分主侧栏) */}
          <div className="resume-single-column">
            {visibleModules.map(renderModule)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumePreview;
