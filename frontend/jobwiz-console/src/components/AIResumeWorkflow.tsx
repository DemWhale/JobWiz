/// <reference types="vite/client" />

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { aguiClient, type AguiCallbacks, type RunFinishedEvent, type TextMessageContentEvent, type RunErrorEvent } from '../services/agui';
import { resumeApi } from '../services/api';
import './AIResumeWorkflow.css';

/** 简历数据接口 - 严格对齐 data.json schema */
export interface ResumeDraft {
  /** 简历内容模块 */
  content: {
    modules: ResumeModule[];
  };
  /** CSS 样式配置 */
  css_config?: {
    global?: {
      fontColor?: string;
      fontFamily?: string;
      fontSize?: number;
      is_english?: boolean;
      lineHeight?: number;
      moduleDistance?: number;
      paddingx?: number;
      paddingy?: number;
      textDistance?: number;
      themeColor?: string;
      titleBottom?: number;
    };
  };
  /** 模板 ID */
  template_id?: number;
  /** 简历标题 */
  title?: string;
  /** 用户 ID */
  user_id?: number;
  /** 分享状态 */
  share_status?: number;
}

/** 简历模块 */
export interface ResumeModule {
  /** 模块标识 (baseinfo/interestabout/eduabout/workbg/projectabout/self_comment/skills/awardsabout/productabout) */
  name: string;
  /** 模块名称 (基础信息/求职意向/教育背景等) */
  modulename: string;
  /** 是否展开 */
  is_open: boolean;
  /** 模块内容 */
  child: Array<Record<string, any>>;
}

/** 用户信息接口 */
interface UserInfo {
  name: string;
  industry: string;
  targetPosition: string;
  targetCity: string;
}

/** 工作流步骤类型 */
type WorkflowStep = 'collect_info' | 'ai_generate' | 'polish';

/**
 * AI 简历创建工作流页面
 * 
 * 工作流程:
 * Step 1 (collect_info) - 收集用户基础信息
 * Step 2 (ai_generate)  - AI 生成简历 + 左右分栏预览
 * Step 3 (polish)       - AI 对话润色
 */
export default function AIResumeWorkflow() {
  const navigate = useNavigate();
  
  // 工作流状态
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('collect_info');
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: '',
    industry: '',
    targetPosition: '',
    targetCity: ''
  });
  const [resumeDraft, setResumeDraft] = useState<ResumeDraft | null>(null);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  /**
   * Step 1: 收集用户信息
   */
  const Step1_CollectInfo = () => (
    <div className="workflow-step">
      <h2>📝 填写基础信息</h2>
      <p className="step-description">
        请提供您的基本信息,AI 将为您生成一份专业简历
      </p>
      
      <div className="info-form">
        <div className="form-group">
          <label>姓名 *</label>
          <input
            type="text"
            value={userInfo.name}
            onChange={(e) => setUserInfo({...userInfo, name: e.target.value})}
            placeholder="请输入您的姓名"
          />
        </div>
        
        <div className="form-group">
          <label>行业 *</label>
          <input
            type="text"
            value={userInfo.industry}
            onChange={(e) => setUserInfo({...userInfo, industry: e.target.value})}
            placeholder="例如: 互联网、金融、教育"
          />
        </div>
        
        <div className="form-group">
          <label>期望职位 *</label>
          <input
            type="text"
            value={userInfo.targetPosition}
            onChange={(e) => setUserInfo({...userInfo, targetPosition: e.target.value})}
            placeholder="例如: 后端开发工程师"
          />
        </div>
        
        <div className="form-group">
          <label>期望城市</label>
          <input
            type="text"
            value={userInfo.targetCity}
            onChange={(e) => setUserInfo({...userInfo, targetCity: e.target.value})}
            placeholder="例如: 北京、上海、深圳"
          />
        </div>
      </div>

      <div className="step-actions">
        <button
          className="btn-primary"
          onClick={handleGenerate}
          disabled={!userInfo.name || !userInfo.industry || !userInfo.targetPosition || isGenerating}
        >
          {isGenerating ? '生成中...' : '✨ AI 生成简历'}
        </button>
      </div>
    </div>
  );

  /**
   * Step 2: AI 生成简历 + 预览
   */
  const Step2_AIGenerate = () => (
    <div className="workflow-step step-generate">
      <h2>🤖 AI 正在生成简历...</h2>
      
      {isGenerating && (
        <div className="generating-status">
          <div className="loading-spinner"></div>
          <p>{streamingContent || '正在分析您的信息并生成简历...'}</p>
        </div>
      )}

      {resumeDraft && (
        <div className="resume-preview-container">
          <div className="preview-left">
            <h3>📋 表单预览</h3>
            <ResumeFormPreview draft={resumeDraft} onChange={setResumeDraft} />
          </div>
          
          <div className="preview-right">
            <h3>👁️ 实时预览</h3>
            <ResumeVisualPreview draft={resumeDraft} />
          </div>
        </div>
      )}

      <div className="step-actions">
        <button className="btn-secondary" onClick={() => setCurrentStep('collect_info')}>
          ← 返回修改信息
        </button>
        {resumeDraft && !isGenerating && (
          <button className="btn-primary" onClick={() => setCurrentStep('polish')}>
            继续润色 →
          </button>
        )}
      </div>
    </div>
  );

  /**
   * Step 3: AI 对话润色
   */
  const Step3_Polish = () => (
    <div className="workflow-step step-polish">
      <h2>💬 AI 对话润色</h2>
      <p className="step-description">
        通过对话让 AI 帮您优化简历,可针对特定模块提出修改建议
      </p>
      
      <div className="polish-container">
        <div className="polish-left">
          <AIChatPanel
            threadId={threadId}
            resumeDraft={resumeDraft}
            onUpdateDraft={setResumeDraft}
          />
        </div>
        
        <div className="polish-right">
          <h3>📄 简历预览</h3>
          <ResumeVisualPreview draft={resumeDraft} />
        </div>
      </div>

      <div className="step-actions">
        <button className="btn-secondary" onClick={() => setCurrentStep('ai_generate')}>
          ← 返回上一步
        </button>
        <button className="btn-success" onClick={handleSaveResume}>
          💾 保存简历
        </button>
      </div>
    </div>
  );

  /**
   * 调用 AGUI 生成简历
   * 使用 'default' agent (根据后端 AgentConfiguration)
   */
  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    setError(null);
    setStreamingContent('');
    setResumeDraft(null);

    const message = `请根据以下信息生成一份简历:\n姓名: ${userInfo.name}\n行业: ${userInfo.industry}\n期望职位: ${userInfo.targetPosition}${userInfo.targetCity ? '\n期望城市: ' + userInfo.targetCity : ''}\n\n请返回标准 JSON 格式,符合 ResumeDetailDTO schema。`;

    const callbacks: AguiCallbacks = {
      onRunStarted: (event) => {
        console.log('[AGUI] Run started:', event.runId);
        setThreadId(event.threadId);
      },
      
      onTextMessageContent: (event: TextMessageContentEvent) => {
        // 流式累积文本
        setStreamingContent(prev => prev + event.delta);
      },
      
      onRunFinished: (event: RunFinishedEvent) => {
        console.log('[AGUI] Run finished:', event.runId);
        
        // 尝试从 streamingContent 中解析 JSON
        try {
          // 提取 JSON (可能在文本中)
          const jsonMatch = streamingContent.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]) as ResumeDraft;
            setResumeDraft(parsed);
            setStreamingContent('✅ 生成完成!');
          } else {
            setError('AI 返回的数据格式不正确,未找到 JSON');
          }
        } catch (parseError) {
          console.error('Failed to parse resume JSON:', parseError);
          setError('AI 返回的 JSON 解析失败,请重试');
        }
        
        setIsGenerating(false);
      },
      
      onRunError: (event: RunErrorEvent) => {
        console.error('[AGUI] Run error:', event.message);
        setError(`生成失败: ${event.message}`);
        setIsGenerating(false);
      }
    };

    try {
      await aguiClient.connect({
        agentId: 'default', // 使用后端注册的 default agent
        message,
        forwardedProps: {
          userId: '1', // TODO: 从登录态获取
          templateId: 1,
          currentStep: 'generate',
          extraParams: {
            industry: userInfo.industry,
            targetPosition: userInfo.targetPosition,
            targetCity: userInfo.targetCity
          }
        },
        callbacks
      });
    } catch (error) {
      console.error('AGUI connection failed:', error);
      setError('生成失败: ' + (error instanceof Error ? error.message : '未知错误'));
      setIsGenerating(false);
    }
  }, [userInfo, streamingContent]);

  /**
   * 保存简历到后端
   */
  const handleSaveResume = async () => {
    if (!resumeDraft) {
      setError('简历数据为空,无法保存');
      return;
    }

    try {
      const resumeData = {
        userId: 1, // TODO: 从登录态获取
        title: `${userInfo.name}_${userInfo.targetPosition}_${new Date().toLocaleDateString()}`,
        // 直接存储 content 和 css_config
        content: JSON.stringify(resumeDraft.content || resumeDraft),
        cssConfig: JSON.stringify(resumeDraft.css_config || {}),
        templateId: 1,
        source: 'AI_GENERATED',
        visibility: 'private',
        language: 'CHINESE'
      };

      const response = await resumeApi.create(resumeData) as any;
      
      if (response.code === 200) {
        alert('简历保存成功!');
        navigate('/resumes');
      } else {
        setError('保存失败: ' + response.message);
      }
    } catch (error) {
      console.error('Save resume failed:', error);
      setError('保存失败: ' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  return (
    <div className="ai-resume-workflow">
      {/* 步骤导航 */}
      <div className="workflow-nav">
        <div className={`nav-step ${currentStep === 'collect_info' ? 'active' : ''} ${['ai_generate', 'polish'].includes(currentStep) ? 'completed' : ''}`}>
          <span className="step-number">1</span>
          <span className="step-label">填写信息</span>
        </div>
        <div className={`nav-step ${currentStep === 'ai_generate' ? 'active' : ''} ${currentStep === 'polish' ? 'completed' : ''}`}>
          <span className="step-number">2</span>
          <span className="step-label">AI 生成</span>
        </div>
        <div className={`nav-step ${currentStep === 'polish' ? 'active' : ''}`}>
          <span className="step-number">3</span>
          <span className="step-label">润色修改</span>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="error-banner">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* 当前步骤内容 */}
      {currentStep === 'collect_info' && <Step1_CollectInfo />}
      {currentStep === 'ai_generate' && <Step2_AIGenerate />}
      {currentStep === 'polish' && <Step3_Polish />}
    </div>
  );
}

/** 简历表单预览组件 - 对齐 data.json schema */
interface ResumeFormPreviewProps {
  draft: ResumeDraft;
  onChange: (draft: ResumeDraft) => void;
}

function ResumeFormPreview({ draft, onChange }: ResumeFormPreviewProps) {
  if (!draft.content?.modules) return <p>暂无数据</p>;

  // 辅助函数: 查找模块
  const findModule = (name: string) => 
    draft.content.modules.find(m => m.name === name);

  // 辅助函数: 更新模块
  const updateModule = (name: string, child: Array<Record<string, any>>) => {
    const newModules = draft.content.modules.map(m => 
      m.name === name ? { ...m, child } : m
    );
    onChange({
      ...draft,
      content: { modules: newModules }
    });
  };

  // 基础信息模块
  const baseinfo = findModule('baseinfo');
  const baseinfoData = baseinfo?.child?.[0] || {};

  // 教育背景模块
  const eduabout = findModule('eduabout');

  // 工作经历模块
  const workbg = findModule('workbg');

  return (
    <div className="resume-form-preview">
      {/* 基础信息 */}
      {baseinfo && (
        <div className="form-section">
          <h4>{baseinfo.modulename}</h4>
          <input
            type="text"
            value={baseinfoData.name || ''}
            onChange={(e) => updateModule('baseinfo', [{ ...baseinfoData, name: e.target.value }])}
            placeholder="姓名"
          />
          <input
            type="text"
            value={baseinfoData.phone || ''}
            onChange={(e) => updateModule('baseinfo', [{ ...baseinfoData, phone: e.target.value }])}
            placeholder="电话"
          />
          <input
            type="text"
            value={baseinfoData.email || ''}
            onChange={(e) => updateModule('baseinfo', [{ ...baseinfoData, email: e.target.value }])}
            placeholder="邮箱"
          />
          <input
            type="text"
            value={baseinfoData.major || ''}
            onChange={(e) => updateModule('baseinfo', [{ ...baseinfoData, major: e.target.value }])}
            placeholder="专业"
          />
        </div>
      )}

      {/* 教育背景 */}
      {eduabout && eduabout.child.length > 0 && (
        <div className="form-section">
          <h4>{eduabout.modulename}</h4>
          {eduabout.child.map((edu, index) => (
            <div key={index} className="education-item">
              <input
                type="text"
                value={edu.school || ''}
                onChange={(e) => {
                  const newChild = [...eduabout.child];
                  newChild[index] = { ...newChild[index], school: e.target.value };
                  updateModule('eduabout', newChild);
                }}
                placeholder="学校"
              />
              <input
                type="text"
                value={edu.major || ''}
                onChange={(e) => {
                  const newChild = [...eduabout.child];
                  newChild[index] = { ...newChild[index], major: e.target.value };
                  updateModule('eduabout', newChild);
                }}
                placeholder="专业"
              />
            </div>
          ))}
        </div>
      )}

      {/* 工作经历 */}
      {workbg && workbg.child.length > 0 && (
        <div className="form-section">
          <h4>{workbg.modulename}</h4>
          {workbg.child.map((work, index) => (
            <div key={index} className="experience-item">
              <input
                type="text"
                value={work.company || ''}
                onChange={(e) => {
                  const newChild = [...workbg.child];
                  newChild[index] = { ...newChild[index], company: e.target.value };
                  updateModule('workbg', newChild);
                }}
                placeholder="公司"
              />
              <input
                type="text"
                value={work.position || ''}
                onChange={(e) => {
                  const newChild = [...workbg.child];
                  newChild[index] = { ...newChild[index], position: e.target.value };
                  updateModule('workbg', newChild);
                }}
                placeholder="职位"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** 简历视觉预览组件 - 对齐 data.json schema */
interface ResumeVisualPreviewProps {
  draft: ResumeDraft | null;
}

function ResumeVisualPreview({ draft }: ResumeVisualPreviewProps) {
  if (!draft?.content?.modules) return <p>暂无数据</p>;

  // 辅助函数: 查找模块
  const findModule = (name: string) => 
    draft.content.modules.find(m => m.name === name);

  const baseinfo = findModule('baseinfo');
  const baseinfoData = baseinfo?.child?.[0] || {};
  const eduabout = findModule('eduabout');
  const workbg = findModule('workbg');
  const selfComment = findModule('self_comment');
  const skills = findModule('skills');

  return (
    <div className="resume-visual-preview">
      {/* 基础信息 */}
      <div className="resume-header">
        <h2>{baseinfoData.name || '姓名'}</h2>
        {baseinfoData.intro && <p>{baseinfoData.intro}</p>}
        <p>
          {baseinfoData.phone && <span>{baseinfoData.phone}</span>}
          {baseinfoData.phone && baseinfoData.email && <span> | </span>}
          {baseinfoData.email && <span>{baseinfoData.email}</span>}
        </p>
      </div>

      {/* 自我评价 */}
      {selfComment && selfComment.child.length > 0 && selfComment.child[0].self_comment && (
        <div className="resume-section">
          <h3>{selfComment.modulename}</h3>
          <div dangerouslySetInnerHTML={{ __html: selfComment.child[0].self_comment }} />
        </div>
      )}

      {/* 教育背景 */}
      {eduabout && eduabout.child.length > 0 && (
        <div className="resume-section">
          <h3>{eduabout.modulename}</h3>
          {eduabout.child.map((edu, index) => (
            <div key={index} className="resume-item">
              <h4>{edu.school} - {edu.major} ({edu.edu})</h4>
              <p>{edu.start_time} ~ {edu.end_time}</p>
              {edu.school_experience && <div dangerouslySetInnerHTML={{ __html: edu.school_experience }} />}
            </div>
          ))}
        </div>
      )}

      {/* 工作经历 */}
      {workbg && workbg.child.length > 0 && (
        <div className="resume-section">
          <h3>{workbg.modulename}</h3>
          {workbg.child.map((work, index) => (
            <div key={index} className="resume-item">
              <h4>{work.company} - {work.position}</h4>
              <p>{work.start_time} ~ {work.end_time}</p>
              {work.job_detail && <div dangerouslySetInnerHTML={{ __html: work.job_detail }} />}
            </div>
          ))}
        </div>
      )}

      {/* 项目经历 */}
      {findModule('projectabout')?.child.map((project, index) => (
        project.project_title && (
          <div className="resume-section" key={index}>
            <h3>{findModule('projectabout')!.modulename}</h3>
            <div className="resume-item">
              <h4>{project.project_title} ({project.project_role})</h4>
              <p>{project.start_time} ~ {project.end_time}</p>
              {project.project_detail && <div dangerouslySetInnerHTML={{ __html: project.project_detail }} />}
            </div>
          </div>
        )
      ))}

      {/* 专业技能 */}
      {skills && skills.child.length > 0 && skills.child[0].skills && (
        <div className="resume-section">
          <h3>{skills.modulename}</h3>
          <div dangerouslySetInnerHTML={{ __html: skills.child[0].skills }} />
        </div>
      )}
    </div>
  );
}

/** AI 对话面板组件 */
interface AIChatPanelProps {
  threadId: string | null;
  resumeDraft: ResumeDraft | null;
  onUpdateDraft: (draft: ResumeDraft) => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'error';
  content: string;
  streaming?: boolean;
}

function AIChatPanel({ threadId, resumeDraft, onUpdateDraft }: AIChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentMessageId, setCurrentMessageId] = useState<string | null>(null);

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: input
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsStreaming(true);

    const messageId = `assistant_msg_${Date.now()}`;
    setCurrentMessageId(messageId);

    // 添加 AI 消息占位
    setMessages(prev => [...prev, {
      id: messageId,
      role: 'assistant',
      content: '',
      streaming: true
    }]);

    const callbacks: AguiCallbacks = {
      onTextMessageContent: (event) => {
        // 流式更新消息内容
        setMessages(prev => {
          const newMessages = [...prev];
          const msgIndex = newMessages.findIndex(m => m.id === messageId);
          if (msgIndex !== -1) {
            newMessages[msgIndex] = {
              ...newMessages[msgIndex],
              content: newMessages[msgIndex].content + event.delta
            };
          }
          return newMessages;
        });
      },
      
      onRunFinished: () => {
        setMessages(prev => {
          const newMessages = [...prev];
          const msgIndex = newMessages.findIndex(m => m.id === messageId);
          if (msgIndex !== -1) {
            newMessages[msgIndex] = {
              ...newMessages[msgIndex],
              streaming: false
            };
            
            // 尝试解析 JSON 并更新简历
            const msgContent = newMessages[msgIndex].content;
            const jsonMatch = msgContent.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              try {
                const parsed = JSON.parse(jsonMatch[0]) as ResumeDraft;
                if (parsed && typeof parsed === 'object') {
                  onUpdateDraft(parsed);
                }
              } catch (e) {
                console.warn('Failed to parse resume JSON from polish:', e);
              }
            }
          }
          return newMessages;
        });
        setIsStreaming(false);
        setCurrentMessageId(null);
      },
      
      onRunError: (event) => {
        setMessages(prev => [...prev, {
          id: `error_${Date.now()}`,
          role: 'error',
          content: `错误: ${event.message}`
        }]);
        setIsStreaming(false);
        setCurrentMessageId(null);
      }
    };

    const polishMessage = `请帮我修改简历。当前简历数据:\n${JSON.stringify(resumeDraft, null, 2)}\n\n修改要求: ${input}\n\n请返回修改后的完整 JSON。`;

    try {
      await aguiClient.connect({
        agentId: 'default', // 使用 default agent 进行润色
        message: polishMessage,
        threadId: threadId || undefined, // 复用 threadId 实现多轮对话
        forwardedProps: {
          userId: '1',
          currentStep: 'polish',
          resumeDraft: resumeDraft
        },
        callbacks
      });
    } catch (error) {
      console.error('Polish failed:', error);
      setMessages(prev => [...prev, {
        id: `error_${Date.now()}`,
        role: 'error',
        content: '润色失败: ' + (error instanceof Error ? error.message : '未知错误')
      }]);
      setIsStreaming(false);
      setCurrentMessageId(null);
    }
  };

  return (
    <div className="ai-chat-panel">
      <div className="chat-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.role}`}>
            <div className="message-content">
              {msg.content}
              {msg.streaming && <span className="streaming-cursor">▊</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="请输入润色建议,例如: 加强项目经验描述..."
          disabled={isStreaming}
        />
        <button onClick={handleSend} disabled={isStreaming || !input.trim()}>
          发送
        </button>
      </div>
    </div>
  );
}
