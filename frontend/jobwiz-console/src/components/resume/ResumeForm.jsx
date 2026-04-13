import { useState, useCallback, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import FormToolbar from './FormToolbar';
import SectionFormItem from './SectionFormItem';
import './ResumeForm.css';

const ResumeForm = forwardRef(({ resumeData, onChange }, ref) => {
  const [basics, setBasics] = useState(resumeData?.basics || {});
  const [sections, setSections] = useState(resumeData?.sections || {});
  const formRef = useRef(null);

  // 暴露 scrollToSection 方法给父组件
  useImperativeHandle(ref, () => ({
    scrollToSection: (sectionId) => {
      if (!formRef.current) return;
      // 查找目标 section 元素
      const target = formRef.current.querySelector(`[data-section-id="${sectionId}"]`);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // 添加高亮动画
        target.classList.add('section-anchor-highlight');
        setTimeout(() => {
          target.classList.remove('section-anchor-highlight');
        }, 1500);
      }
    },
  }));

  // 同步外部 resumeData 变化（如从后端加载预填充数据）
  useEffect(() => {
    if (resumeData) {
      setBasics(resumeData.basics || {});
      setSections(resumeData.sections || {});
    }
  }, [resumeData]);

  // 确保 sections 有默认结构
  const safeSections = {
    summary: sections.summary || { content: '' },
    education: sections.education || [],
    experience: sections.experience || [],
    projects: sections.projects || [],
    skills: sections.skills || [],
    certifications: sections.certifications || [],
    ...sections,
  };

  // 更新 basics 并通知父组件
  const updateBasics = useCallback((field, value) => {
    const newBasics = { ...basics, [field]: value };
    setBasics(newBasics);
    onChange({ basics: newBasics, sections: safeSections });
  }, [basics, safeSections, onChange]);

  // 更新 summary
  const updateSummary = useCallback((content) => {
    const newSummary = { ...safeSections.summary, content };
    const newSections = { ...safeSections, summary: newSummary };
    setSections(newSections);
    onChange({ basics, sections: newSections });
  }, [basics, safeSections, onChange]);

  // 通用数组更新方法
  const updateSectionArray = useCallback((sectionKey, index, field, value) => {
    const newArray = [...(safeSections[sectionKey] || [])];
    newArray[index] = { ...newArray[index], [field]: value };
    const newSections = { ...safeSections, [sectionKey]: newArray };
    setSections(newSections);
    onChange({ basics, sections: newSections });
  }, [basics, safeSections, onChange]);

  // 添加条目
  const addSectionItem = useCallback((sectionKey, defaultItem) => {
    const newArray = [...(safeSections[sectionKey] || []), defaultItem];
    const newSections = { ...safeSections, [sectionKey]: newArray };
    setSections(newSections);
    onChange({ basics, sections: newSections });
  }, [basics, safeSections, onChange]);

  // 删除条目
  const removeSectionItem = useCallback((sectionKey, index) => {
    const newArray = (safeSections[sectionKey] || []).filter((_, i) => i !== index);
    const newSections = { ...safeSections, [sectionKey]: newArray };
    setSections(newSections);
    onChange({ basics, sections: newSections });
  }, [basics, safeSections, onChange]);

  return (
    <div className="resume-form" ref={formRef}>
      {/* 基本信息 */}
      <SectionFormItem sectionId="basics" title="基本信息" removable={false}>
        <div className="form-avatar-section">
          <div className="avatar-placeholder">
            <span>📷</span>
          </div>
          <button className="btn-add-avatar">添加头像</button>
        </div>

        <div className="form-quick-actions">
          <button className="quick-action-btn">当前状态</button>
          <button className="quick-action-btn">性别</button>
          <button className="quick-action-btn">籍贯</button>
          <button className="quick-action-btn">主页链接</button>
          <button className="quick-action-btn">GitHub</button>
          <button className="quick-action-btn">自定义</button>
        </div>

        <div className="form-grid-2col">
          <div className="form-field">
            <label>姓名</label>
            <input
              type="text"
              value={basics.name || ''}
              onChange={(e) => updateBasics('name', e.target.value)}
              placeholder="请输入姓名"
            />
          </div>
          <div className="form-field">
            <label>电话</label>
            <input
              type="text"
              value={basics.phone || ''}
              onChange={(e) => updateBasics('phone', e.target.value)}
              placeholder="请输入电话"
            />
          </div>
          <div className="form-field">
            <label>邮箱</label>
            <input
              type="email"
              value={basics.email || ''}
              onChange={(e) => updateBasics('email', e.target.value)}
              placeholder="请输入邮箱"
            />
          </div>
          <div className="form-field">
            <label>城市</label>
            <input
              type="text"
              value={basics.location || ''}
              onChange={(e) => updateBasics('location', e.target.value)}
              placeholder="请输入城市"
            />
          </div>
        </div>

        <div className="form-field">
          <label>求职意向</label>
          <input
            type="text"
            value={basics.headline || ''}
            onChange={(e) => updateBasics('headline', e.target.value)}
            placeholder="例如：数据分析师"
          />
        </div>
      </SectionFormItem>

      {/* 个人总结 */}
      <SectionFormItem sectionId="summary" title="个人总结" removable={false}>
        <FormToolbar />
        <textarea
          className="form-textarea"
          value={safeSections.summary.content || ''}
          onChange={(e) => updateSummary(e.target.value)}
          placeholder="简要介绍自己的专业背景、技能特长和职业目标..."
          rows={5}
        />
      </SectionFormItem>

      {/* 教育经历 */}
      {(safeSections.education.length === 0 ? [{}] : safeSections.education).map((edu, index) => (
        <SectionFormItem
          key={edu.id || index}
          sectionId="education"
          title="教育经历"
          onAdd={() => addSectionItem('education', { id: Date.now(), institution: '', area: '', studyType: '', date: '' })}
          onRemove={safeSections.education.length > 1 ? () => removeSectionItem('education', index) : undefined}
          removable={safeSections.education.length > 1}
        >
          <FormToolbar />
          <div className="form-field">
            <label>学校名称</label>
            <input
              type="text"
              value={edu.institution || ''}
              onChange={(e) => updateSectionArray('education', index, 'institution', e.target.value)}
              placeholder="例如：上海财经大学"
            />
          </div>
          <div className="form-field">
            <label>专业</label>
            <input
              type="text"
              value={edu.area || ''}
              onChange={(e) => updateSectionArray('education', index, 'area', e.target.value)}
              placeholder="例如：统计学"
            />
          </div>
          <div className="form-field">
            <label>学历</label>
            <select
              value={edu.studyType || ''}
              onChange={(e) => updateSectionArray('education', index, 'studyType', e.target.value)}
            >
              <option value="">请选择</option>
              <option value="本科学士">本科学士</option>
              <option value="硕士">硕士</option>
              <option value="博士">博士</option>
              <option value="专科">专科</option>
              <option value="其他">其他</option>
            </select>
          </div>
          <div className="form-field">
            <label>起止时间</label>
            <input
              type="text"
              value={edu.date || ''}
              onChange={(e) => updateSectionArray('education', index, 'date', e.target.value)}
              placeholder="例如：2021-09 - 2025-06"
            />
          </div>
        </SectionFormItem>
      ))}

      {/* 实习经历 */}
      {(safeSections.experience.length === 0 ? [{}] : safeSections.experience).map((exp, index) => (
        <SectionFormItem
          key={exp.id || index}
          sectionId="experience"
          title="实习经历"
          onAdd={() => addSectionItem('experience', { id: Date.now(), company: '', position: '', date: '', summary: '' })}
          onRemove={safeSections.experience.length > 1 ? () => removeSectionItem('experience', index) : undefined}
          removable={safeSections.experience.length > 1}
        >
          <FormToolbar />
          <div className="form-field">
            <label>公司名称</label>
            <input
              type="text"
              value={exp.company || ''}
              onChange={(e) => updateSectionArray('experience', index, 'company', e.target.value)}
              placeholder="例如：百度"
            />
          </div>
          <div className="form-field">
            <label>职位</label>
            <input
              type="text"
              value={exp.position || ''}
              onChange={(e) => updateSectionArray('experience', index, 'position', e.target.value)}
              placeholder="例如：SQL 开发"
            />
          </div>
          <div className="form-field">
            <label>起止时间</label>
            <input
              type="text"
              value={exp.date || ''}
              onChange={(e) => updateSectionArray('experience', index, 'date', e.target.value)}
              placeholder="例如：2026-01 - 至今"
            />
          </div>
          <div className="form-field">
            <label>工作内容</label>
            <textarea
              className="form-textarea"
              value={exp.summary || ''}
              onChange={(e) => updateSectionArray('experience', index, 'summary', e.target.value)}
              placeholder="描述你的工作职责和成就..."
              rows={4}
            />
          </div>
        </SectionFormItem>
      ))}

      {/* 项目经历 */}
      {(safeSections.projects.length === 0 ? [{}] : safeSections.projects).map((proj, index) => (
        <SectionFormItem
          key={proj.id || index}
          sectionId="projects"
          title="项目经历"
          onAdd={() => addSectionItem('projects', { id: Date.now(), name: '', date: '', summary: '' })}
          onRemove={safeSections.projects.length > 1 ? () => removeSectionItem('projects', index) : undefined}
          removable={safeSections.projects.length > 1}
        >
          <FormToolbar />
          <div className="form-field">
            <label>项目名称</label>
            <input
              type="text"
              value={proj.name || ''}
              onChange={(e) => updateSectionArray('projects', index, 'name', e.target.value)}
              placeholder="例如：电商平台用户流失预测"
            />
          </div>
          <div className="form-field">
            <label>起止时间</label>
            <input
              type="text"
              value={proj.date || ''}
              onChange={(e) => updateSectionArray('projects', index, 'date', e.target.value)}
              placeholder="例如：2023-11 - 2024-01"
            />
          </div>
          <div className="form-field">
            <label>项目描述</label>
            <textarea
              className="form-textarea"
              value={proj.summary || ''}
              onChange={(e) => updateSectionArray('projects', index, 'summary', e.target.value)}
              placeholder="描述项目背景、你的职责和成果..."
              rows={4}
            />
          </div>
        </SectionFormItem>
      ))}

      {/* 技能 */}
      {(safeSections.skills.length === 0 ? [{}] : safeSections.skills).map((skill, index) => (
        <SectionFormItem
          key={skill.id || index}
          sectionId="skills"
          title="技能"
          onAdd={() => addSectionItem('skills', { id: Date.now(), name: '', level: 3, keywords: [] })}
          onRemove={safeSections.skills.length > 1 ? () => removeSectionItem('skills', index) : undefined}
          removable={safeSections.skills.length > 1}
        >
          <div className="form-field">
            <label>技能名称</label>
            <input
              type="text"
              value={skill.name || ''}
              onChange={(e) => updateSectionArray('skills', index, 'name', e.target.value)}
              placeholder="例如：SQL数据库"
            />
          </div>
          <div className="form-field">
            <label>熟练度（1-5）</label>
            <input
              type="range"
              min="1"
              max="5"
              value={skill.level || 3}
              onChange={(e) => updateSectionArray('skills', index, 'level', parseInt(e.target.value))}
            />
            <span className="level-display">{skill.level || 3} / 5</span>
          </div>
          <div className="form-field">
            <label>关键词（回车添加）</label>
            <input
              type="text"
              placeholder="输入关键词后按回车"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.target.value.trim()) {
                  const newKeywords = [...(skill.keywords || []), e.target.value.trim()];
                  updateSectionArray('skills', index, 'keywords', newKeywords);
                  e.target.value = '';
                }
              }}
            />
            <div className="keywords-tags">
              {(skill.keywords || []).map((kw, kwIndex) => (
                <span key={kwIndex} className="keyword-tag">
                  {kw}
                  <button
                    className="tag-remove"
                    onClick={() => {
                      const newKeywords = (skill.keywords || []).filter((_, i) => i !== kwIndex);
                      updateSectionArray('skills', index, 'keywords', newKeywords);
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </SectionFormItem>
      ))}

      {/* 证书 */}
      {(safeSections.certifications.length === 0 ? [{}] : safeSections.certifications).map((cert, index) => (
        <SectionFormItem
          key={cert.id || index}
          sectionId="certifications"
          title="证书"
          onAdd={() => addSectionItem('certifications', { id: Date.now(), name: '', issuer: '', date: '' })}
          onRemove={safeSections.certifications.length > 1 ? () => removeSectionItem('certifications', index) : undefined}
          removable={safeSections.certifications.length > 1}
        >
          <div className="form-field">
            <label>证书名称</label>
            <input
              type="text"
              value={cert.name || ''}
              onChange={(e) => updateSectionArray('certifications', index, 'name', e.target.value)}
              placeholder="例如：SQL认证专家"
            />
          </div>
          <div className="form-field">
            <label>颁发机构</label>
            <input
              type="text"
              value={cert.issuer || ''}
              onChange={(e) => updateSectionArray('certifications', index, 'issuer', e.target.value)}
              placeholder="例如：教育部考试中心"
            />
          </div>
          <div className="form-field">
            <label>获取日期</label>
            <input
              type="text"
              value={cert.date || ''}
              onChange={(e) => updateSectionArray('certifications', index, 'date', e.target.value)}
              placeholder="例如：2023-03"
            />
          </div>
        </SectionFormItem>
      ))}
    </div>
  );
});

export default ResumeForm;
