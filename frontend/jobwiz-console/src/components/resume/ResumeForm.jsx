import { useState, useCallback, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import FormToolbar from './FormToolbar';
import SectionFormItem from './SectionFormItem';
import './ResumeForm.css';

const ResumeForm = forwardRef(({ resumeData, onChange }, ref) => {
  const [modules, setModules] = useState(resumeData?.content?.modules || []);
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
    if (resumeData?.content?.modules) {
      setModules(resumeData.content.modules);
    }
  }, [resumeData]);

  // 查找模块
  const findModule = useCallback((name) => {
    return modules.find(m => m.name === name) || { name, modulename: '', is_open: true, child: [] };
  }, [modules]);

  // 更新模块的 child 数据
  const updateModule = useCallback((name, child) => {
    const newModules = modules.map(m => 
      m.name === name ? { ...m, child } : m
    );
    setModules(newModules);
    onChange({ content: { modules: newModules } });
  }, [modules, onChange]);

  // 更新基础信息单个字段
  const updateBaseinfo = useCallback((field, value) => {
    const baseinfo = findModule('baseinfo');
    const newChild = baseinfo.child.length > 0 
      ? [{ ...baseinfo.child[0], [field]: value }]
      : [{ [field]: value }];
    updateModule('baseinfo', newChild);
  }, [findModule, updateModule]);

  // 更新自我评价
  const updateSelfComment = useCallback((htmlContent) => {
    const selfComment = findModule('self_comment');
    const newChild = selfComment.child.length > 0
      ? [{ ...selfComment.child[0], self_comment: htmlContent }]
      : [{ self_comment: htmlContent }];
    updateModule('self_comment', newChild);
  }, [findModule, updateModule]);

  // 更新数组类型模块的单个字段
  const updateModuleItem = useCallback((moduleName, index, field, value) => {
    const module = findModule(moduleName);
    const newChild = [...module.child];
    newChild[index] = { ...newChild[index], [field]: value };
    updateModule(moduleName, newChild);
  }, [findModule, updateModule]);

  // 添加条目
  const addModuleItem = useCallback((moduleName, defaultItem) => {
    const module = findModule(moduleName);
    const newChild = [...module.child, defaultItem];
    updateModule(moduleName, newChild);
  }, [findModule, updateModule]);

  // 删除条目
  const removeModuleItem = useCallback((moduleName, index) => {
    const module = findModule(moduleName);
    const newChild = module.child.filter((_, i) => i !== index);
    updateModule(moduleName, newChild);
  }, [findModule, updateModule]);

  // 获取安全的数据
  const baseinfo = findModule('baseinfo').child[0] || {};
  const selfComment = findModule('self_comment').child[0]?.self_comment || '';
  const eduabout = findModule('eduabout').child;
  const workbg = findModule('workbg').child;
  const projectabout = findModule('projectabout').child;
  const skills = findModule('skills').child[0]?.skills || '';

  return (
    <div className="resume-form" ref={formRef}>
      {/* 基本信息 */}
      <SectionFormItem sectionId="baseinfo" title="基本信息" removable={false}>
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
              value={baseinfo.name || ''}
              onChange={(e) => updateBaseinfo('name', e.target.value)}
              placeholder="请输入姓名"
            />
          </div>
          <div className="form-field">
            <label>电话</label>
            <input
              type="text"
              value={baseinfo.phone || ''}
              onChange={(e) => updateBaseinfo('phone', e.target.value)}
              placeholder="请输入电话"
            />
          </div>
          <div className="form-field">
            <label>邮箱</label>
            <input
              type="email"
              value={baseinfo.email || ''}
              onChange={(e) => updateBaseinfo('email', e.target.value)}
              placeholder="请输入邮箱"
            />
          </div>
          <div className="form-field">
            <label>专业</label>
            <input
              type="text"
              value={baseinfo.major || ''}
              onChange={(e) => updateBaseinfo('major', e.target.value)}
              placeholder="请输入专业"
            />
          </div>
        </div>

        <div className="form-field">
          <label>个人简介</label>
          <input
            type="text"
            value={baseinfo.intro || ''}
            onChange={(e) => updateBaseinfo('intro', e.target.value)}
            placeholder="例如：数据分析师"
          />
        </div>
      </SectionFormItem>

      {/* 自我评价 */}
      <SectionFormItem sectionId="self_comment" title="自我评价" removable={false}>
        <FormToolbar />
        <textarea
          className="form-textarea"
          value={selfComment}
          onChange={(e) => updateSelfComment(e.target.value)}
          placeholder="简要介绍自己的专业背景、技能特长和职业目标..."
          rows={5}
        />
      </SectionFormItem>

      {/* 教育背景 */}
      {(eduabout.length === 0 ? [{}] : eduabout).map((edu, index) => (
        <SectionFormItem
          key={index}
          sectionId="eduabout"
          title="教育背景"
          onAdd={() => addModuleItem('eduabout', { school: '', major: '', edu: '', start_time: '', end_time: '' })}
          onRemove={eduabout.length > 1 ? () => removeModuleItem('eduabout', index) : undefined}
          removable={eduabout.length > 1}
        >
          <FormToolbar />
          <div className="form-field">
            <label>学校名称</label>
            <input
              type="text"
              value={edu.school || ''}
              onChange={(e) => updateModuleItem('eduabout', index, 'school', e.target.value)}
              placeholder="例如：上海财经大学"
            />
          </div>
          <div className="form-field">
            <label>专业</label>
            <input
              type="text"
              value={edu.major || ''}
              onChange={(e) => updateModuleItem('eduabout', index, 'major', e.target.value)}
              placeholder="例如：统计学"
            />
          </div>
          <div className="form-field">
            <label>学历</label>
            <select
              value={edu.edu || ''}
              onChange={(e) => updateModuleItem('eduabout', index, 'edu', e.target.value)}
            >
              <option value="">请选择</option>
              <option value="本科">本科</option>
              <option value="硕士">硕士</option>
              <option value="博士">博士</option>
              <option value="专科">专科</option>
              <option value="其他">其他</option>
            </select>
          </div>
          <div className="form-grid-2col">
            <div className="form-field">
              <label>开始时间</label>
              <input
                type="text"
                value={edu.start_time || ''}
                onChange={(e) => updateModuleItem('eduabout', index, 'start_time', e.target.value)}
                placeholder="例如：2021-09"
              />
            </div>
            <div className="form-field">
              <label>结束时间</label>
              <input
                type="text"
                value={edu.end_time || ''}
                onChange={(e) => updateModuleItem('eduabout', index, 'end_time', e.target.value)}
                placeholder="例如：2025-06"
              />
            </div>
          </div>
          <div className="form-field">
            <label>校园经历</label>
            <textarea
              className="form-textarea"
              value={edu.school_experience || ''}
              onChange={(e) => updateModuleItem('eduabout', index, 'school_experience', e.target.value)}
              placeholder="描述你的校园经历和成就..."
              rows={3}
            />
          </div>
        </SectionFormItem>
      ))}

      {/* 工作经历 */}
      {(workbg.length === 0 ? [{}] : workbg).map((exp, index) => (
        <SectionFormItem
          key={index}
          sectionId="workbg"
          title="工作经历"
          onAdd={() => addModuleItem('workbg', { company: '', position: '', start_time: '', end_time: '', job_detail: '' })}
          onRemove={workbg.length > 1 ? () => removeModuleItem('workbg', index) : undefined}
          removable={workbg.length > 1}
        >
          <FormToolbar />
          <div className="form-field">
            <label>公司名称</label>
            <input
              type="text"
              value={exp.company || ''}
              onChange={(e) => updateModuleItem('workbg', index, 'company', e.target.value)}
              placeholder="例如：百度"
            />
          </div>
          <div className="form-field">
            <label>职位</label>
            <input
              type="text"
              value={exp.position || ''}
              onChange={(e) => updateModuleItem('workbg', index, 'position', e.target.value)}
              placeholder="例如：SQL 开发"
            />
          </div>
          <div className="form-grid-2col">
            <div className="form-field">
              <label>开始时间</label>
              <input
                type="text"
                value={exp.start_time || ''}
                onChange={(e) => updateModuleItem('workbg', index, 'start_time', e.target.value)}
                placeholder="例如：2026-01"
              />
            </div>
            <div className="form-field">
              <label>结束时间</label>
              <input
                type="text"
                value={exp.end_time || ''}
                onChange={(e) => updateModuleItem('workbg', index, 'end_time', e.target.value)}
                placeholder="例如：至今"
              />
            </div>
          </div>
          <div className="form-field">
            <label>工作内容</label>
            <textarea
              className="form-textarea"
              value={exp.job_detail || ''}
              onChange={(e) => updateModuleItem('workbg', index, 'job_detail', e.target.value)}
              placeholder="描述你的工作职责和成就..."
              rows={4}
            />
          </div>
        </SectionFormItem>
      ))}

      {/* 项目经历 */}
      {(projectabout.length === 0 ? [{}] : projectabout).map((proj, index) => (
        <SectionFormItem
          key={index}
          sectionId="projectabout"
          title="项目经历"
          onAdd={() => addModuleItem('projectabout', { project_title: '', project_role: '', start_time: '', end_time: '', project_detail: '' })}
          onRemove={projectabout.length > 1 ? () => removeModuleItem('projectabout', index) : undefined}
          removable={projectabout.length > 1}
        >
          <FormToolbar />
          <div className="form-field">
            <label>项目名称</label>
            <input
              type="text"
              value={proj.project_title || ''}
              onChange={(e) => updateModuleItem('projectabout', index, 'project_title', e.target.value)}
              placeholder="例如：电商平台用户流失预测"
            />
          </div>
          <div className="form-field">
            <label>项目角色</label>
            <input
              type="text"
              value={proj.project_role || ''}
              onChange={(e) => updateModuleItem('projectabout', index, 'project_role', e.target.value)}
              placeholder="例如：后端开发"
            />
          </div>
          <div className="form-grid-2col">
            <div className="form-field">
              <label>开始时间</label>
              <input
                type="text"
                value={proj.start_time || ''}
                onChange={(e) => updateModuleItem('projectabout', index, 'start_time', e.target.value)}
                placeholder="例如：2023-11"
              />
            </div>
            <div className="form-field">
              <label>结束时间</label>
              <input
                type="text"
                value={proj.end_time || ''}
                onChange={(e) => updateModuleItem('projectabout', index, 'end_time', e.target.value)}
                placeholder="例如：2024-01"
              />
            </div>
          </div>
          <div className="form-field">
            <label>项目描述</label>
            <textarea
              className="form-textarea"
              value={proj.project_detail || ''}
              onChange={(e) => updateModuleItem('projectabout', index, 'project_detail', e.target.value)}
              placeholder="描述项目背景、你的职责和成果..."
              rows={4}
            />
          </div>
        </SectionFormItem>
      ))}

      {/* 专业技能 */}
      <SectionFormItem sectionId="skills" title="专业技能" removable={false}>
        <FormToolbar />
        <textarea
          className="form-textarea"
          value={skills}
          onChange={(e) => {
            const skillsModule = findModule('skills');
            const newChild = skillsModule.child.length > 0
              ? [{ ...skillsModule.child[0], skills: e.target.value }]
              : [{ skills: e.target.value }];
            updateModule('skills', newChild);
          }}
          placeholder="描述你的专业技能..."
          rows={4}
        />
      </SectionFormItem>
    </div>
  );
});

export default ResumeForm;
