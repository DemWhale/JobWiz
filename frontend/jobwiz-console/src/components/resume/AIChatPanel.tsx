import { useState, useEffect, useRef, useCallback } from 'react';
import {
  aguiClient,
  type AguiCallbacks,
  type CustomEvent,
  type ReasoningMessageContentEvent,
  type StateDeltaEvent,
  type StateSnapshotEvent,
  type TextMessageContentEvent,
  type ToolCallArgsEvent,
  type ToolCallEndEvent,
  type ToolCallResultEvent,
  type ToolCallStartEvent,
} from '../../services/agui';
import './AIChatPanel.css';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'error' | 'system';
  content: string;
  streaming?: boolean;
}

interface ResumeModule {
  name: string;
  modulename?: string;
  child?: any[];
  is_open?: boolean;
}

interface ResumeData {
  content: {
    modules: ResumeModule[];
  };
  css_config?: any;
  template_id?: number;
  title?: string;
  user_id?: number;
  share_status?: number;
  [key: string]: any;
}

interface EditTarget {
  section: string;
  itemIndex?: number;
}

interface ResumePatchOperation {
  op: 'replace';
  path: string;
  value: unknown;
}

interface ResumePatch {
  type: 'resume_patch';
  target?: EditTarget;
  summary?: string;
  previewText?: string;
  needsConfirmation?: boolean;
  operations?: ResumePatchOperation[];
  previousResume?: ResumeData;
}

interface ProcessTodoItem {
  label: string;
  status: 'pending' | 'doing' | 'done' | 'error';
}

interface ProcessCard {
  id: string;
  kind: 'thinking' | 'tool' | 'todo' | 'patch' | 'status';
  title: string;
  status?: 'pending' | 'doing' | 'done' | 'error';
  description?: string;
  details?: string;
  items?: ProcessTodoItem[];
  collapsed?: boolean;
}

interface AIChatPanelProps {
  userInfo?: {
    name: string;
    industry: string;
    targetPosition: string;
    targetCity: string;
    prefillMessage?: string;
    autoSend?: boolean;
  };
  resumeData: ResumeData | null;
  persistedResume?: ResumeData | null;
  pendingPatch?: ResumePatch | null;
  activeTarget?: EditTarget | null;
  saveStatus?: 'idle' | 'dirty' | 'saving' | 'saved' | 'error' | 'draft';
  draftPrompt?: string;
  onDraftPromptConsumed?: () => void;
  onPendingPatchChange?: (patch: ResumePatch | null) => void;
  onActiveTargetChange?: (target: EditTarget | null) => void;
  onChangeHistory?: (updater: (prev: ResumePatch[]) => ResumePatch[]) => void;
  onUpdateResumeData: (data: ResumeData) => void;
}

const QUICK_ACTIONS = [
  '按目标岗位强化',
  '补充量化成果',
  '压缩成一屏可读',
  '改成更专业表达',
];

const SECTION_LABELS: Record<string, string> = {
  baseinfo: '基本信息',
  self_comment: '自我评价',
  eduabout: '教育背景',
  workbg: '工作经历',
  projectabout: '项目经历',
  skills: '专业技能',
  awardsabout: '荣誉奖项',
  interestabout: '求职意向',
};

const cloneResume = (resume: ResumeData) => JSON.parse(JSON.stringify(resume)) as ResumeData;

const formatTargetLabel = (target?: EditTarget | null) => {
  if (!target?.section) return '整份简历';
  const sectionLabel = SECTION_LABELS[target.section] || target.section;
  if (typeof target.itemIndex === 'number') {
    return `${sectionLabel} / 第 ${target.itemIndex + 1} 条`;
  }
  return sectionLabel;
};

const parsePatchFromContent = (content: string): ResumePatch | null => {
  const jsonBlock = content.match(/```json\s*([\s\S]*?)```/i)?.[1];
  const fallbackBlock = content.match(/(\{[\s\S]*"type"\s*:\s*"resume_patch"[\s\S]*\})/i)?.[1];
  const candidate = jsonBlock || fallbackBlock;

  if (!candidate) return null;

  try {
    const parsed = JSON.parse(candidate);
    if (parsed?.type === 'resume_patch') {
      return parsed as ResumePatch;
    }
    return null;
  } catch (error) {
    console.warn('解析 resume_patch 失败:', error);
    return null;
  }
};

const sanitizeAssistantDisplay = (content: string) => {
  if (!content) return '';
  return content.replace(/```json[\s\S]*$/i, '').trimEnd();
};

const applyPatchToResume = (resume: ResumeData, patch: ResumePatch): ResumeData | null => {
  if (!resume || !patch.operations?.length) return null;

  const nextResume = cloneResume(resume);

  for (const operation of patch.operations) {
    if (operation.op !== 'replace') continue;

    const match = operation.path.match(/^content\.modules\[name=([^\]]+)\]\.child\[(\d+)\]\.([a-zA-Z0-9_]+)$/);
    if (!match) return null;

    const [, sectionName, rawIndex, field] = match;
    const itemIndex = Number(rawIndex);
    const module = nextResume.content?.modules?.find((item) => item.name === sectionName);
    if (!module) return null;

    if (!Array.isArray(module.child)) {
      module.child = [];
    }

    while (module.child.length <= itemIndex) {
      module.child.push({});
    }

    module.child[itemIndex] = {
      ...(module.child[itemIndex] || {}),
      [field]: operation.value,
    };
  }

  return nextResume;
};

const normalizePatch = (payload: unknown): ResumePatch | null => {
  if (!payload || typeof payload !== 'object') return null;
  const candidate = payload as Record<string, unknown>;
  if (candidate.type === 'resume_patch') {
    return candidate as ResumePatch;
  }
  if (candidate.patch && typeof candidate.patch === 'object') {
    const patch = candidate.patch as Record<string, unknown>;
    if (patch.type === 'resume_patch') {
      return patch as ResumePatch;
    }
  }
  return null;
};

const extractEventName = (event: CustomEvent) => {
  const raw = event as unknown as Record<string, unknown>;
  return String(event.name || raw.name || raw.eventName || '');
};

const extractEventPayload = (event: CustomEvent) => {
  const raw = event as unknown as Record<string, unknown>;
  return event.value ?? event.data ?? raw.value ?? raw.data ?? null;
};

const normalizeTodoItems = (items: unknown): ProcessTodoItem[] => {
  if (!Array.isArray(items)) return [];
  return items.map((item) => {
    if (typeof item === 'string') {
      return { label: item, status: 'pending' };
    }
    const row = item as Record<string, unknown>;
    const status = String(row.status || 'pending') as ProcessTodoItem['status'];
    return {
      label: String(row.label || row.title || '待办事项'),
      status: ['pending', 'doing', 'done', 'error'].includes(status) ? status : 'pending',
    };
  });
};

const createLocalTodo = (target?: EditTarget | null): ProcessCard => ({
  id: `todo_${Date.now()}`,
  kind: 'todo',
  title: '本轮编辑计划',
  status: 'doing',
  items: [
    { label: `确认编辑目标: ${formatTargetLabel(target)}`, status: 'done' },
    { label: '读取目标模块原文', status: 'doing' },
    { label: '匹配模块写法和字段约束', status: 'pending' },
    { label: '生成最小范围修改', status: 'pending' },
    { label: '校验排版和可应用性', status: 'pending' },
  ],
});

const toolTitleMap: Record<string, string> = {
  resolveResumeTarget: '确认编辑目标',
  makeResumeEditTodo: '规划本轮编辑',
  getResumeSectionKnowledge: '读取模块写法',
  validateResumePatchPlan: '校验修改方案',
  read_skill: '读取编辑技能',
};

const prettyToolTitle = (toolName?: string) => toolTitleMap[toolName || ''] || toolName || '调用工具';

export default function AIChatPanel({
  userInfo,
  resumeData,
  persistedResume,
  pendingPatch,
  activeTarget,
  saveStatus = 'idle',
  draftPrompt,
  onDraftPromptConsumed,
  onPendingPatchChange,
  onActiveTargetChange,
  onChangeHistory,
  onUpdateResumeData,
}: AIChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [processCards, setProcessCards] = useState<ProcessCard[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const rawAssistantContentRef = useRef<Record<string, string>>({});
  const toolArgsRef = useRef<Record<string, string>>({});

  const saveStatusText = {
    idle: '等待编辑',
    dirty: '草稿未保存',
    saving: '保存中...',
    saved: '已保存',
    error: '保存失败',
    draft: '草稿模式',
  }[saveStatus];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, pendingPatch, processCards]);

  useEffect(() => {
    if (!draftPrompt) return;
    setInput(draftPrompt);
    onDraftPromptConsumed?.();
  }, [draftPrompt, onDraftPromptConsumed]);

  useEffect(() => {
    if (messages.length > 0) return;

    let welcomeContent = '您好！我是您的 AI 简历编辑助手。\n\n';
    welcomeContent += '我可以帮您按模块润色、改写、压缩或补充量化表达。\n';
    welcomeContent += '建议先点右侧某个模块，锁定“当前编辑目标”，再发出修改要求。';

    if (userInfo) {
      welcomeContent += `\n\n当前求职方向：${userInfo.targetPosition || '未设置'}`;
      if (userInfo.industry) {
        welcomeContent += `\n当前行业偏好：${userInfo.industry}`;
      }
    }

    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: welcomeContent,
      },
    ]);
  }, [messages.length, userInfo]);

  const appendAssistantChunk = useCallback((messageId: string, delta: string) => {
    rawAssistantContentRef.current[messageId] = (rawAssistantContentRef.current[messageId] || '') + (delta || '');
    const displayContent = sanitizeAssistantDisplay(rawAssistantContentRef.current[messageId]);
    setMessages((prev) => prev.map((msg) => (
      msg.id === messageId
        ? { ...msg, content: displayContent }
        : msg
    )));
  }, []);

  const applyIncomingPatch = useCallback((patch: ResumePatch) => {
    if (!resumeData) return false;

    const updatedResume = applyPatchToResume(resumeData, patch);
    if (!updatedResume) return false;

    const patchWithPrevious = {
      ...patch,
      previousResume: cloneResume(resumeData),
    };

    onUpdateResumeData(updatedResume);
    onPendingPatchChange?.(patchWithPrevious);
    setProcessCards((prev) => [
      ...prev,
      {
        id: `patch_${Date.now()}`,
        kind: 'patch',
        title: '生成可确认改动',
        status: 'done',
        description: patch.summary || patch.previewText || 'AI 已生成一轮结构化简历修改。',
        details: patch.operations?.map((operation) => operation.path).join('\n'),
      },
    ]);
    return true;
  }, [onPendingPatchChange, onUpdateResumeData, resumeData]);

  const finalizeAssistantMessage = useCallback((messageId: string) => {
    setMessages((prev) => {
      const next = prev.map((msg) => (
        msg.id === messageId ? { ...msg, streaming: false } : msg
      ));

      const rawContent = rawAssistantContentRef.current[messageId] || '';
      if (!rawContent || !resumeData) {
        return next;
      }

      const parsedPatch = parsePatchFromContent(rawContent);
      if (!parsedPatch) {
        return next;
      }

      const applied = applyIncomingPatch(parsedPatch);
      if (!applied) {
        return [
          ...next,
          {
            id: `system_${Date.now()}`,
            role: 'system',
            content: '检测到结构化 patch，但当前前端无法安全应用，请继续沿用文本建议。',
          },
        ];
      }

      return [
        ...next,
        {
          id: `system_${Date.now()}`,
          role: 'system',
          content: parsedPatch.summary || 'AI 已生成一轮可确认的改动，右侧预览已更新。',
        },
      ];
    });
  }, [applyIncomingPatch, resumeData]);

  const upsertProcessCard = useCallback((card: ProcessCard) => {
    setProcessCards((prev) => {
      const index = prev.findIndex((item) => item.id === card.id);
      if (index < 0) return [...prev, card];
      return prev.map((item, currentIndex) => (
        currentIndex === index ? { ...item, ...card } : item
      ));
    });
  }, []);

  const handleProcessCustomEvent = useCallback((event: CustomEvent) => {
    const name = extractEventName(event);
    const payload = extractEventPayload(event);

    if (name === 'resume_todo' && payload && typeof payload === 'object') {
      const data = payload as Record<string, unknown>;
      upsertProcessCard({
        id: 'server_todo',
        kind: 'todo',
        title: String(data.title || '本轮编辑待办'),
        status: 'doing',
        items: normalizeTodoItems(data.items),
      });
      return;
    }

    if (name === 'resume_thinking' && payload && typeof payload === 'object') {
      const data = payload as Record<string, unknown>;
      upsertProcessCard({
        id: `thinking_${Date.now()}`,
        kind: 'thinking',
        title: String(data.title || '分析修改意图'),
        status: String(data.status || 'done') as ProcessCard['status'],
        description: String(data.description || ''),
        collapsed: true,
      });
    }
  }, [upsertProcessCard]);

  const sendMessage = useCallback(async (rawInput: string) => {
    const trimmed = rawInput.trim();
    if (!trimmed || isStreaming) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: trimmed,
    };

    const messageId = `assistant_msg_${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      userMessage,
      {
        id: messageId,
        role: 'assistant',
        content: '',
        streaming: true,
      },
    ]);
    setInput('');
    setIsStreaming(true);
    setProcessCards([
      createLocalTodo(activeTarget),
      {
        id: `thinking_${Date.now()}`,
        kind: 'thinking',
        title: '理解你的修改意图',
        status: 'doing',
        description: `目标锁定为「${formatTargetLabel(activeTarget)}」，接下来会结合模块规则生成可确认改动。`,
      },
    ]);

    const targetHint = activeTarget ? `当前编辑目标：${formatTargetLabel(activeTarget)}` : '当前编辑目标：整份简历';
    let messageContent = `${targetHint}\n用户需求：${trimmed}`;

    if (userInfo && messages.length <= 2) {
      messageContent = `请在 AI 简历编辑模式下协助修改简历。\n${targetHint}\n求职方向：${userInfo.targetPosition || ''}\n行业：${userInfo.industry || ''}\n用户需求：${trimmed}\n请优先输出解释文本；若你能返回结构化 patch，请使用 \`\`\`json\`\`\` 包裹。`;
    }

    try {
      const callbacks: AguiCallbacks = {
        onRunStarted: (event) => {
          setThreadId(event.threadId);
          upsertProcessCard({
            id: 'run_status',
            kind: 'status',
            title: `正在处理 ${formatTargetLabel(activeTarget)}`,
            status: 'doing',
            description: 'AI 正在读取当前简历草稿并规划修改步骤。',
          });
        },
        onStepStarted: (event) => {
          upsertProcessCard({
            id: `step_${event.stepName}`,
            kind: 'status',
            title: event.stepName || '执行编辑步骤',
            status: 'doing',
          });
        },
        onStepFinished: (event) => {
          upsertProcessCard({
            id: `step_${event.stepName}`,
            kind: 'status',
            title: event.stepName || '执行编辑步骤',
            status: 'done',
          });
        },
        onTextMessageContent: (event: TextMessageContentEvent) => {
          appendAssistantChunk(messageId, event.delta || '');
        },
        onReasoningMessageContent: (event: ReasoningMessageContentEvent) => {
          const delta = event.delta || '';
          if (!delta) return;
          upsertProcessCard({
            id: 'reasoning_stream',
            kind: 'thinking',
            title: '思考摘要',
            status: 'doing',
            description: delta,
            collapsed: true,
          });
        },
        onToolCallStart: (event: ToolCallStartEvent) => {
          toolArgsRef.current[event.toolCallId] = '';
          upsertProcessCard({
            id: `tool_${event.toolCallId}`,
            kind: 'tool',
            title: prettyToolTitle(event.toolName),
            status: 'doing',
            description: '正在调用简历编辑工具。',
            collapsed: true,
          });
        },
        onToolCallArgs: (event: ToolCallArgsEvent) => {
          toolArgsRef.current[event.toolCallId] = (toolArgsRef.current[event.toolCallId] || '') + (event.delta || '');
          upsertProcessCard({
            id: `tool_${event.toolCallId}`,
            kind: 'tool',
            title: '准备工具参数',
            status: 'doing',
            details: toolArgsRef.current[event.toolCallId],
            collapsed: true,
          });
        },
        onToolCallResult: (event: ToolCallResultEvent) => {
          upsertProcessCard({
            id: `tool_${event.toolCallId}`,
            kind: 'tool',
            title: '工具返回结果',
            status: 'done',
            details: typeof event.result === 'string' ? event.result : JSON.stringify(event.result, null, 2),
            collapsed: true,
          });
        },
        onToolCallEnd: (event: ToolCallEndEvent) => {
          upsertProcessCard({
            id: `tool_${event.toolCallId}`,
            kind: 'tool',
            title: '工具调用完成',
            status: 'done',
            details: toolArgsRef.current[event.toolCallId],
            collapsed: true,
          });
        },
        onStateDelta: (event: StateDeltaEvent) => {
          const patch = normalizePatch(event.delta);
          if (patch && applyIncomingPatch(patch)) {
            setMessages((prev) => [
              ...prev,
              {
                id: `system_${Date.now()}`,
                role: 'system',
                content: patch.summary || '已收到结构化 patch，右侧简历草稿已更新。',
              },
            ]);
          }
        },
        onStateSnapshot: (event: StateSnapshotEvent) => {
          const patch = normalizePatch(event.snapshot);
          if (patch && applyIncomingPatch(patch)) {
            setMessages((prev) => [
              ...prev,
              {
                id: `system_${Date.now()}`,
                role: 'system',
                content: patch.summary || '已收到结构化 patch 快照，右侧简历草稿已更新。',
              },
            ]);
          }
        },
        onCustomEvent: (event: CustomEvent) => {
          handleProcessCustomEvent(event);
          const patch = normalizePatch(event.value ?? event.data);
          if (patch && applyIncomingPatch(patch)) {
            setMessages((prev) => [
              ...prev,
              {
                id: `system_${Date.now()}`,
                role: 'system',
                content: patch.summary || '已收到 AI 改动建议，等待你确认或撤销。',
              },
            ]);
          }
        },
        onRunFinished: () => {
          setIsStreaming(false);
          upsertProcessCard({
            id: 'run_status',
            kind: 'status',
            title: '本轮编辑完成',
            status: 'done',
            description: '请检查右侧预览，确认满意后接受改动并点击保存。',
          });
          finalizeAssistantMessage(messageId);
        },
        onRunError: (event) => {
          setMessages((prev) => [
            ...prev,
            {
              id: `error_${Date.now()}`,
              role: 'error',
              content: `调用失败: ${event.message || '未知错误'}`,
            },
          ]);
          setIsStreaming(false);
        },
      };

      await aguiClient.connect({
        agentId: 'resume-edit',
        message: messageContent,
        threadId: threadId || undefined,
        forwardedProps: {
          userId: String(resumeData?.user_id || '1'),
          currentStep: 'ai_edit',
          activeTarget,
          resumeDraft: resumeData,
          persistedResume,
        },
        callbacks,
      });
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: `error_${Date.now()}`,
          role: 'error',
          content: `调用失败: ${error instanceof Error ? error.message : '未知错误'}`,
        },
      ]);
      setIsStreaming(false);
    }
  }, [
    activeTarget,
    appendAssistantChunk,
    finalizeAssistantMessage,
    handleProcessCustomEvent,
    isStreaming,
    messages.length,
    persistedResume,
    resumeData,
    threadId,
    upsertProcessCard,
    userInfo,
  ]);

  const handleSend = useCallback(async () => {
    await sendMessage(input);
  }, [input, sendMessage]);

  const handleQuickAction = useCallback((action: string) => {
    const sectionText = activeTarget ? `针对${formatTargetLabel(activeTarget)}` : '针对当前简历';
    setInput(`${sectionText}${action}`);
  }, [activeTarget]);

  const handleAcceptPendingPatch = useCallback(() => {
    if (!pendingPatch) return;
    onChangeHistory?.((prev) => [...prev, pendingPatch]);
    onPendingPatchChange?.(null);
    setMessages((prev) => [
      ...prev,
      {
        id: `system_${Date.now()}`,
        role: 'system',
        content: '本轮改动已接受，你可以继续让 AI 深化优化，或点击保存写入后端。',
      },
    ]);
  }, [onChangeHistory, onPendingPatchChange, pendingPatch]);

  const handleRevertPendingPatch = useCallback(() => {
    if (!pendingPatch?.previousResume) return;
    onUpdateResumeData(cloneResume(pendingPatch.previousResume));
    onPendingPatchChange?.(null);
    setMessages((prev) => [
      ...prev,
      {
        id: `system_${Date.now()}`,
        role: 'system',
        content: '已撤销本轮 AI 改动，右侧简历已恢复到上一版本草稿。',
      },
    ]);
  }, [onPendingPatchChange, onUpdateResumeData, pendingPatch]);

  const renderProcessCard = (card: ProcessCard) => {
    const statusText = {
      pending: '待处理',
      doing: '进行中',
      done: '完成',
      error: '异常',
    }[card.status || 'pending'];

    return (
      <details key={card.id} className={`agui-process-card ${card.kind} status-${card.status || 'pending'}`} open={!card.collapsed}>
        <summary>
          <span className="agui-process-icon" />
          <span className="agui-process-title">{card.title}</span>
          <span className="agui-process-status">{statusText}</span>
        </summary>
        {card.description && <p className="agui-process-description">{card.description}</p>}
        {!!card.items?.length && (
          <ul className="agui-todo-list">
            {card.items.map((item, index) => (
              <li key={`${item.label}-${index}`} className={`todo-${item.status}`}>
                <span />
                {item.label}
              </li>
            ))}
          </ul>
        )}
        {card.details && <pre className="agui-process-details">{card.details}</pre>}
      </details>
    );
  };

  return (
    <div className="ai-chat-panel">
      <div className="chat-header">
        <h3>AI 编辑工作区</h3>
        <div className="chat-header-meta">
          <p>通过对话编辑简历，右侧将实时展示草稿变化</p>
          <span className={`chat-save-status status-${saveStatus}`}>{saveStatusText}</span>
        </div>
      </div>

      <div className="chat-target-bar">
        <div className="chat-target-label">
          正在编辑：<strong>{formatTargetLabel(activeTarget)}</strong>
        </div>
        <div className="chat-target-actions">
          <span className="chat-target-hint">点右侧简历模块可切换目标</span>
          {activeTarget && (
            <button
              type="button"
              className="chat-target-chip ghost"
              onClick={() => onActiveTargetChange?.(null)}
            >
              清空目标
            </button>
          )}
        </div>
      </div>

      {pendingPatch && (
        <div className="pending-patch-card">
          <div className="pending-patch-title">待确认改动</div>
          <div className="pending-patch-summary">
            {pendingPatch.summary || pendingPatch.previewText || 'AI 已生成一轮新的草稿修改。'}
          </div>
          <div className="pending-patch-actions">
            <button type="button" className="primary" onClick={handleAcceptPendingPatch}>
              接受本次修改
            </button>
            <button type="button" onClick={handleRevertPendingPatch}>
              撤销本次修改
            </button>
          </div>
        </div>
      )}

      <div className="chat-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.role}`}>
            <div className="message-content">
              {msg.content}
              {msg.streaming && <span className="streaming-cursor">▊</span>}
            </div>
          </div>
        ))}
        {!!processCards.length && (
          <div className="agui-process-stack">
            {processCards.map(renderProcessCard)}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-quick-actions">
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action}
            type="button"
            className="quick-action-pill"
            onClick={() => handleQuickAction(action)}
          >
            {action}
          </button>
        ))}
      </div>

      <div className="chat-input">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="例如：把这一段项目经历改得更像后端开发岗位，突出性能优化成果"
          disabled={isStreaming}
          rows={3}
        />
        <button onClick={handleSend} disabled={isStreaming || !input.trim()}>
          {isStreaming ? '生成中...' : '发送'}
        </button>
      </div>
    </div>
  );
}
