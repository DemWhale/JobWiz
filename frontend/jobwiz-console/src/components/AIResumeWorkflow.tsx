/// <reference types="vite/client" />

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { aguiClient, type AguiCallbacks, type RunFinishedEvent, type TextMessageContentEvent, type RunErrorEvent } from '../services/agui';
import { resumeApi } from '../services/api';
import './AIResumeWorkflow.css';

/** 简历数据接口 */
interface ResumeDraft {
  basics?: {
    name?: string;
    headline?: string;
    email?: string;
    phone?: string;
    location?: string;
  };
  sections?: {
    summary?: { content: string };
    education?: Array<{
      institution?: string;
      area?: string;
      studyType?: string;
      date?: string;
    }>;
    experience?: Array<{
      company?: string;
      position?: string;
      date?: string;
      summary?: string;
    }>;
    projects?: Array<{
      name?: string;
      date?: string;
      summary?: string;
    }>;
    skills?: Array<{
      name?: string;
      level?: number;
      keywords?: string[];
    }>;
    certifications?: Array<{
      name?: string;
      issuer?: string;
      date?: string;
    }>;
  };
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
        resumeDetail: JSON.stringify(resumeDraft),
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

/** 简历表单预览组件 */
interface ResumeFormPreviewProps {
  draft: ResumeDraft;
  onChange: (draft: ResumeDraft) => void;
}

function ResumeFormPreview({ draft, onChange }: ResumeFormPreviewProps) {
  if (!draft) return <p>暂无数据</p>;

  return (
    <div className="resume-form-preview">
      <div className="form-section">
        <h4>基本信息</h4>
        <input
          type="text"
          value={draft.basics?.name || ''}
          onChange={(e) => onChange({
            ...draft,
            basics: { ...draft.basics, name: e.target.value }
          })}
          placeholder="姓名"
        />
        <input
          type="text"
          value={draft.basics?.phone || ''}
          onChange={(e) => onChange({
            ...draft,
            basics: { ...draft.basics, phone: e.target.value }
          })}
          placeholder="电话"
        />
        <input
          type="text"
          value={draft.basics?.email || ''}
          onChange={(e) => onChange({
            ...draft,
            basics: { ...draft.basics, email: e.target.value }
          })}
          placeholder="邮箱"
        />
      </div>

      {draft.sections?.education && draft.sections.education.length > 0 && (
        <div className="form-section">
          <h4>教育经历</h4>
          {draft.sections.education.map((edu, index) => (
            <div key={index} className="education-item">
              <input
                type="text"
                value={edu.institution || ''}
                onChange={(e) => {
                  const newEdu = [...draft.sections!.education!];
                  newEdu[index] = { ...newEdu[index], institution: e.target.value };
                  onChange({
                    ...draft,
                    sections: { ...draft.sections, education: newEdu }
                  });
                }}
                placeholder="学校"
              />
              <input
                type="text"
                value={edu.area || ''}
                onChange={(e) => {
                  const newEdu = [...draft.sections!.education!];
                  newEdu[index] = { ...newEdu[index], area: e.target.value };
                  onChange({
                    ...draft,
                    sections: { ...draft.sections, education: newEdu }
                  });
                }}
                placeholder="专业"
              />
            </div>
          ))}
        </div>
      )}

      {draft.sections?.experience && draft.sections.experience.length > 0 && (
        <div className="form-section">
          <h4>工作经历</h4>
          {draft.sections.experience.map((exp, index) => (
            <div key={index} className="experience-item">
              <input
                type="text"
                value={exp.company || ''}
                onChange={(e) => {
                  const newExp = [...draft.sections!.experience!];
                  newExp[index] = { ...newExp[index], company: e.target.value };
                  onChange({
                    ...draft,
                    sections: { ...draft.sections, experience: newExp }
                  });
                }}
                placeholder="公司"
              />
              <input
                type="text"
                value={exp.position || ''}
                onChange={(e) => {
                  const newExp = [...draft.sections!.experience!];
                  newExp[index] = { ...newExp[index], position: e.target.value };
                  onChange({
                    ...draft,
                    sections: { ...draft.sections, experience: newExp }
                  });
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

/** 简历视觉预览组件 */
interface ResumeVisualPreviewProps {
  draft: ResumeDraft | null;
}

function ResumeVisualPreview({ draft }: ResumeVisualPreviewProps) {
  if (!draft) return <p>暂无数据</p>;

  return (
    <div className="resume-visual-preview">
      <div className="resume-header">
        <h2>{draft.basics?.name || '姓名'}</h2>
        <p>{draft.basics?.headline || ''}</p>
        <p>{draft.basics?.phone} | {draft.basics?.email}</p>
      </div>

      {draft.sections?.summary && (
        <div className="resume-section">
          <h3>个人总结</h3>
          <p>{draft.sections.summary.content}</p>
        </div>
      )}

      {draft.sections?.education && draft.sections.education.length > 0 && (
        <div className="resume-section">
          <h3>教育经历</h3>
          {draft.sections.education.map((edu, index) => (
            <div key={index} className="resume-item">
              <h4>{edu.institution} - {edu.area} ({edu.studyType})</h4>
              <p>{edu.date}</p>
            </div>
          ))}
        </div>
      )}

      {draft.sections?.experience && draft.sections.experience.length > 0 && (
        <div className="resume-section">
          <h3>工作经历</h3>
          {draft.sections.experience.map((exp, index) => (
            <div key={index} className="resume-item">
              <h4>{exp.company} - {exp.position}</h4>
              <p>{exp.date}</p>
              <p>{exp.summary}</p>
            </div>
          ))}
        </div>
      )}

      {draft.sections?.skills && draft.sections.skills.length > 0 && (
        <div className="resume-section">
          <h3>技能</h3>
          <div className="skills-list">
            {draft.sections.skills.map((skill, index) => (
              <span key={index} className="skill-tag">
                {skill.name}
                {skill.keywords && skill.keywords.length > 0 && ` (${skill.keywords.join(', ')})`}
              </span>
            ))}
          </div>
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
