import { useMemo } from 'react';
import ResumeHeader from './ResumeHeader';
import ResumeSectionWrapper from './ResumeSectionWrapper';
import ResumeSummary from './ResumeSummary';
import ResumeEducation from './ResumeEducation';
import ResumeExperience from './ResumeExperience';
import ResumeProjects from './ResumeProjects';
import ResumeSkills from './ResumeSkills';
import ResumeCertifications from './ResumeCertifications';
import ResumeVolunteer from './ResumeVolunteer';
import ResumeLanguages from './ResumeLanguages';
import ResumeInterests from './ResumeInterests';
import ResumeAwards from './ResumeAwards';
import ResumePublications from './ResumePublications';
import ResumeReferences from './ResumeReferences';
import ResumeProfiles from './ResumeProfiles';
import './ResumePreview.css';
import './resume.css';

// Section 名称映射
const SECTION_NAMES = {
  summary: '个人总结',
  education: '教育经历',
  experience: '工作经历',
  projects: '项目经历',
  skills: '技能',
  certifications: '证书',
  volunteer: '社团组织',
  languages: '语言能力',
  interests: '兴趣爱好',
  awards: '荣誉奖项',
  publications: '出版物',
  references: '推荐信',
  profiles: '社交主页',
  custom: '自定义',
};

// Section 组件映射
const SECTION_COMPONENTS = {
  summary: ResumeSummary,
  education: ResumeEducation,
  experience: ResumeExperience,
  projects: ResumeProjects,
  skills: ResumeSkills,
  certifications: ResumeCertifications,
  volunteer: ResumeVolunteer,
  languages: ResumeLanguages,
  interests: ResumeInterests,
  awards: ResumeAwards,
  publications: ResumePublications,
  references: ResumeReferences,
  profiles: ResumeProfiles,
};

const ResumePreview = ({ resumeData, templateMeta, onSectionClick }) => {
  // 解析 CSS 变量样式
  const cssVars = useMemo(() => {
    if (!templateMeta) return {};
    const theme = templateMeta.theme || {};
    const typography = templateMeta.typography || {};
    const page = templateMeta.page || {};
    return {
      '--resume-theme-text': theme.text || '#242424',
      '--resume-theme-primary': theme.primary || '#2563eb',
      '--resume-theme-background': theme.background || '#fffefe',
      '--resume-font-size': `${typography.font?.size || 13}px`,
      '--resume-font-family': typography.font?.family || "'Noto Sans SC', sans-serif",
      '--resume-line-height': typography.lineHeight || 1.3,
      '--resume-page-margin': `${page.margin || 28}px`,
    };
  }, [templateMeta]);

  // 解析 layout 双栏分配
  const { mainSections, sideSections } = useMemo(() => {
    if (!templateMeta?.layout) {
      // 默认布局
      return {
        mainSections: ['summary', 'experience', 'projects', 'education'],
        sideSections: ['skills', 'languages', 'certifications', 'interests', 'awards'],
      };
    }
    // layout 格式: [[[主栏sections], [侧栏sections]]]
    const layout = templateMeta.layout;
    if (Array.isArray(layout) && layout.length > 0) {
      const columns = layout[0];
      if (Array.isArray(columns) && columns.length >= 2) {
        return {
          mainSections: columns[0] || [],
          sideSections: columns[1] || [],
        };
      }
      if (Array.isArray(columns) && columns.length === 1) {
        return { mainSections: columns[0] || [], sideSections: [] };
      }
    }
    return { mainSections: [], sideSections: [] };
  }, [templateMeta]);

  const sections = resumeData?.sections || {};
  const basics = resumeData?.basics || {};

  // 渲染单个 section
  const renderSection = (sectionId) => {
    const Component = SECTION_COMPONENTS[sectionId];
    if (!Component) return null;
    const sectionData = sections[sectionId];
    if (!sectionData) return null;
    const items = Array.isArray(sectionData) ? sectionData : sectionData.items || [];
    if (items.length === 0) return null;

    // 检查整体可见性
    const visible = sectionData.visible !== undefined ? sectionData.visible : true;
    if (!visible) return null;

    return (
      <ResumeSectionWrapper
        key={sectionId}
        sectionId={sectionId}
        name={SECTION_NAMES[sectionId] || sectionId}
        onAnchorClick={onSectionClick}
      >
        <Component items={items} />
      </ResumeSectionWrapper>
    );
  };

  return (
    <div className="resume-preview-container">
      <div className="resume-preview-a4">
        <div className="resume-render resume-a4" style={cssVars}>
          {/* Header */}
          <ResumeHeader basics={basics} />

          {/* 双栏布局 */}
          <div className="resume-columns">
            {/* 主栏 */}
            <div className="resume-column-main">
              {mainSections.map(renderSection)}
            </div>

            {/* 侧栏 */}
            <div className="resume-column-side">
              {sideSections.map(renderSection)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumePreview;
