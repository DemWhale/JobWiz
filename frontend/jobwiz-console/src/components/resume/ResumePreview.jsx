import { useEffect, useMemo, useRef, useState } from 'react';
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

const ZOOM_OPTIONS = [
  { label: '适应', value: 'fit' },
  { label: '80%', value: 0.8 },
  { label: '100%', value: 1 },
  { label: '120%', value: 1.2 },
];

const MIN_ZOOM = 0.4;
const MAX_ZOOM = 1.4;

const DEFAULT_PAPER_SIZE = {
  width: 794,
  height: 1123,
};

/**
 * 简历预览组件 - 对齐新 schema
 * @param {Object} resumeData - { content: { modules: [] }, css_config: {} }
 * @param {Object} templateMeta - 模板元数据 (可选,向后兼容)
 * @param {Function} onSectionClick - 模块点击回调
 */
const ResumePreview = ({
  resumeData,
  templateMeta,
  onSectionClick,
  onItemClick,
  activeSectionId,
  activeTarget,
  compact = false,
}) => {
  const containerRef = useRef(null);
  const paperRef = useRef(null);
  const [zoomMode, setZoomMode] = useState('fit');
  const [fitScale, setFitScale] = useState(1);
  const [manualScale, setManualScale] = useState(1);
  const [paperSize, setPaperSize] = useState(DEFAULT_PAPER_SIZE);

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

  useEffect(() => {
    const container = containerRef.current;
    const paper = paperRef.current;
    if (!container || !paper) return;

    const updateScale = () => {
      const nextPaperSize = {
        width: paper.offsetWidth,
        height: paper.offsetHeight,
      };
      setPaperSize((prev) => (
        prev.width === nextPaperSize.width && prev.height === nextPaperSize.height
          ? prev
          : nextPaperSize
      ));

      if (zoomMode !== 'fit') return;

      const availableWidth = Math.max(container.clientWidth - 48, 320);
      const availableHeight = Math.max(container.clientHeight - 48, 320);
      const widthScale = availableWidth / nextPaperSize.width;
      const heightScale = availableHeight / nextPaperSize.height;
      const nextScale = Math.min(widthScale, heightScale, 1);
      setFitScale(Number.isFinite(nextScale) ? Math.max(nextScale, 0.35) : 1);
    };

    updateScale();

    const observer = new ResizeObserver(() => {
      updateScale();
    });

    observer.observe(container);
    observer.observe(paper);

    return () => {
      observer.disconnect();
    };
  }, [resumeData, templateMeta, zoomMode]);

  const scale = zoomMode === 'fit' ? fitScale : manualScale;
  const scaledWidth = paperSize.width ? paperSize.width * scale : undefined;
  const scaledHeight = paperSize.height ? paperSize.height * scale : undefined;
  const sliderValue = Math.round((zoomMode === 'fit' ? fitScale : manualScale) * 100);

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
        props = {
          items: childData,
          activeIndex: activeTarget?.section === module.name ? activeTarget.itemIndex : undefined,
          onItemClick: (index) => onItemClick?.(module.name, index),
        };
        break;
      case 'projectabout':
        props = {
          items: childData,
          activeIndex: activeTarget?.section === module.name ? activeTarget.itemIndex : undefined,
          onItemClick: (index) => onItemClick?.(module.name, index),
        };
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
        active={activeSectionId === module.name && activeTarget?.itemIndex === undefined}
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
    <div className={`resume-preview-container ${compact ? 'is-compact' : ''}`}>
      {!compact && (
      <div className="resume-preview-toolbar">
        <div className="resume-preview-toolbar-label">预览缩放</div>
        <div className="resume-preview-zoom-group">
          {ZOOM_OPTIONS.map((option) => {
            const active = option.value === 'fit'
              ? zoomMode === 'fit'
              : zoomMode !== 'fit' && Math.abs(manualScale - option.value) < 0.001;
            return (
              <button
                key={String(option.value)}
                type="button"
                className={`resume-preview-zoom-btn ${active ? 'active' : ''}`}
                onClick={() => {
                  if (option.value === 'fit') {
                    setZoomMode('fit');
                    return;
                  }
                  setManualScale(option.value);
                  setZoomMode('manual');
                }}
              >
                {option.label}
              </button>
            );
          })}
        </div>
        <div className="resume-preview-slider-group">
          <input
            className="resume-preview-slider"
            type="range"
            min={Math.round(MIN_ZOOM * 100)}
            max={Math.round(MAX_ZOOM * 100)}
            step="1"
            value={sliderValue}
            onChange={(e) => {
              setManualScale(Number(e.target.value) / 100);
              setZoomMode('manual');
            }}
            aria-label="预览缩放百分比"
          />
        </div>
        <div className="resume-preview-zoom-indicator">
          {`${Math.round(scale * 100)}%`}
        </div>
      </div>
      )}

      <div className="resume-preview-stage" ref={containerRef}>
        <div
          className="resume-preview-canvas"
          style={{
            width: scaledWidth,
            height: scaledHeight,
          }}
        >
          <div
            className="resume-preview-a4"
            style={{
              transform: `scale(${scale})`,
            }}
          >
            <div className="resume-render resume-a4" ref={paperRef} style={cssVars}>
              <ResumeHeader baseinfoData={baseinfoData} />

              <div className="resume-single-column">
                {visibleModules.map(renderModule)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumePreview;
