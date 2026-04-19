import { useState, useEffect, useRef, useCallback } from 'react';
import { aguiClient, type AguiCallbacks, type TextMessageContentEvent } from '../../services/agui';
import './AIChatPanel.css';

/** 消息接口 */
interface Message {
  id: string;
  role: 'user' | 'assistant' | 'error' | 'system';
  content: string;
  streaming?: boolean;
}

/** ResumeData 类型 */
interface ResumeData {
  content: {
    modules: any[];
  };
  css_config?: any;
  template_id?: number;
  title?: string;
  user_id?: number;
  share_status?: number;
  [key: string]: any;
}

/** Props 接口 */
interface AIChatPanelProps {
  /** 初始用户信息(来自表单) */
  userInfo?: {
    name: string;
    industry: string;
    targetPosition: string;
    targetCity: string;
    prefillMessage?: string;  // 预填信息
    autoSend?: boolean;       // 是否自动发送
  };
  /** 当前简历数据 */
  resumeData: ResumeData | null;
  /** 更新简历数据的回调 */
  onUpdateResumeData: (data: ResumeData) => void;
}

/**
 * AI 聊天面板组件
 * 
 * 功能:
 * - 用户发送消息
 * - 调用 AGUI Agent (polish)
 * - 流式接收 AI 回复
 * - 解析 JSON 并更新 resumeData
 */
export default function AIChatPanel({ userInfo, resumeData, onUpdateResumeData }: AIChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 首次加载时显示欢迎消息
  useEffect(() => {
    if (messages.length === 0) {
      let welcomeContent = '您好！我是您的 AI 简历助手。\n\n';
      
      if (userInfo) {
        welcomeContent += `已收到您的基本信息：\n`;
        welcomeContent += `• 姓名：${userInfo.name}\n`;
        welcomeContent += `• 行业：${userInfo.industry}\n`;
        welcomeContent += `• 期望职位：${userInfo.targetPosition}\n`;
        if (userInfo.targetCity) {
          welcomeContent += `• 期望城市：${userInfo.targetCity}\n`;
        }
        welcomeContent += `\n请告诉我您的具体需求，例如：\n`;
        welcomeContent += `• 帮我生成工作经历描述\n`;
        welcomeContent += `• 优化教育背景部分\n`;
        welcomeContent += `• 添加项目经验\n`;
        welcomeContent += `• 调整技能列表`;
      } else {
        welcomeContent += '请告诉我您的求职意向和工作经历，我将帮您创建一份专业简历。';
      }
      
      const welcomeMsg: Message = {
        id: 'welcome',
        role: 'assistant',
        content: welcomeContent
      };
      setMessages([welcomeMsg]);

      // 如果有预填信息,自动填充到 input
      if (userInfo?.prefillMessage) {
        setInput(userInfo.prefillMessage);
        
        // 如果需要自动发送,延迟 500ms 后自动发送
        if (userInfo.autoSend) {
          // 直接使用 input 值发送,不依赖 handleSend
          setTimeout(() => {
            const prefillContent = userInfo.prefillMessage;
            if (!prefillContent || isStreaming) return;

            const userMessage: Message = {
              id: `msg_${Date.now()}`,
              role: 'user',
              content: prefillContent
            };
            setMessages(prev => [...prev, userMessage]);
            setInput('');
            setIsStreaming(true);

            const messageId = `assistant_msg_${Date.now()}`;
            setMessages(prev => [...prev, {
              id: messageId,
              role: 'assistant',
              content: '',
              streaming: true
            }]);

            // 调用 AGUI
            aguiClient.connect({
              agentId: 'default',
              message: prefillContent,
              forwardedProps: {
                userId: '1',
                currentStep: 'polish',
                resumeDraft: resumeData
              },
              callbacks: {
                onRunStarted: (event) => {
                  console.log('[AGUI] Run started:', event.threadId);
                  setThreadId(event.threadId);
                },
                onTextMessageContent: (event: TextMessageContentEvent) => {
                  console.log('[AGUI] TextMessageContent:', event.delta);
                  setMessages(prev => prev.map(msg => 
                    msg.id === messageId 
                      ? { ...msg, content: msg.content + (event.delta || '') }
                      : msg
                  ));
                },
                onTextMessageChunk: (event) => {
                  setMessages(prev => prev.map(msg => 
                    msg.id === messageId 
                      ? { ...msg, content: msg.content + (event.delta || '') }
                      : msg
                  ));
                },
                onRunFinished: () => {
                  console.log('[AGUI] Run finished');
                  setIsStreaming(false);
                  setMessages(prev => prev.map(msg => 
                    msg.id === messageId 
                      ? { ...msg, streaming: false }
                      : msg
                  ));
                },
                onRunError: (event) => {
                  console.error('[AGUI] Run error:', event.message);
                  setMessages(prev => [...prev, {
                    id: `error_${Date.now()}`,
                    role: 'error',
                    content: '调用失败: ' + (event.message || '未知错误')
                  }]);
                  setIsStreaming(false);
                }
              }
            }).catch(err => {
              console.error('AGUI 调用失败:', err);
              setMessages(prev => [...prev, {
                id: `error_${Date.now()}`,
                role: 'error',
                content: '调用失败: ' + (err instanceof Error ? err.message : '未知错误')
              }]);
              setIsStreaming(false);
            });
          }, 500);
        }
      }
    }
  }, []);

  /**
   * 处理发送消息
   */
  const handleSend = useCallback(async () => {
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

    // 添加 AI 消息占位
    setMessages(prev => [...prev, {
      id: messageId,
      role: 'assistant',
      content: '',
      streaming: true
    }]);

    try {
      const callbacks: AguiCallbacks = {
        onRunStarted: (event) => {
          console.log('[AGUI] Run started:', event.threadId);
          setThreadId(event.threadId);
        },
        
        onTextMessageContent: (event: TextMessageContentEvent) => {
          console.log('[AGUI] TextMessageContent:', event.delta);
          // 流式累积文本
          setMessages(prev => {
            const updated = prev.map(msg => 
              msg.id === messageId 
                ? { ...msg, content: msg.content + (event.delta || '') }
                : msg
            );
            console.log('[AGUI] Updated messages:', updated.find(m => m.id === messageId)?.content);
            return updated;
          });
        },

        onTextMessageChunk: (event) => {
          console.log('[AGUI] TextMessageChunk:', event.delta);
          setMessages(prev => prev.map(msg => 
            msg.id === messageId 
              ? { ...msg, content: msg.content + (event.delta || '') }
              : msg
          ));
        },

        onRunFinished: (event) => {
          console.log('[AGUI] Run finished');
          setIsStreaming(false);
          setMessages(prev => prev.map(msg => 
            msg.id === messageId 
              ? { ...msg, streaming: false }
              : msg
          ));
        },

        onRunError: (event) => {
          console.error('[AGUI] Run error:', event.message);
          setMessages(prev => [...prev, {
            id: `error_${Date.now()}`,
            role: 'error',
            content: '调用失败: ' + (event.message || '未知错误')
          }]);
          setIsStreaming(false);
        }
      };

      // 构建消息内容 - 直接发送用户输入,不需要附加 JSON 格式要求
      let messageContent = input;
      
      // 如果是首次对话且有 userInfo,追加上下文信息
      if (userInfo && messages.length <= 2) {
        messageContent = `请基于以下信息帮我创建/优化简历:\n\n基本信息:\n- 姓名: ${userInfo.name}\n- 行业: ${userInfo.industry}\n- 期望职位: ${userInfo.targetPosition}${userInfo.targetCity ? '\n- 期望城市: ' + userInfo.targetCity : ''}\n\n用户需求: ${input}\n\n请以对话形式回复,告诉我你需要补充哪些信息,或者直接给出建议。`;
      }

      // 调用 AGUI
      await aguiClient.connect({
        agentId: 'default',
        message: messageContent,
        threadId: threadId || undefined,
        forwardedProps: {
          userId: '1',
          currentStep: 'polish',
          resumeDraft: resumeData  // 传递当前简历数据供 Agent 参考
        },
        callbacks
      });
    } catch (error) {
      console.error('AGUI 调用失败:', error);
      setMessages(prev => [...prev, {
        id: `error_${Date.now()}`,
        role: 'error',
        content: '调用失败: ' + (error instanceof Error ? error.message : '未知错误')
      }]);
      setIsStreaming(false);
    }
  }, [input, isStreaming, userInfo, messages.length, threadId, resumeData]);

  return (
    <div className="ai-chat-panel">
      <div className="chat-header">
        <h3>💬 AI 对话</h3>
        <p>通过对话让 AI 帮您优化简历</p>
      </div>

      <div className="chat-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.role}`}>
            <div className="message-content">
              {msg.content}
              {msg.streaming && <span className="streaming-cursor">▊</span>}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="请输入您的需求,例如: 帮我写一段后端开发的工作经验..."
          disabled={isStreaming}
        />
        <button onClick={handleSend} disabled={isStreaming || !input.trim()}>
          {isStreaming ? '生成中...' : '发送'}
        </button>
      </div>
    </div>
  );
}
