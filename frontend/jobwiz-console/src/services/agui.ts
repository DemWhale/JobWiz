/**
 * AGUI 协议消费层 - TypeScript 完整实现
 * 
 * 基于官方 AG-UI Protocol 规范:
 * https://docs.ag-ui.com/concepts/events
 * 
 * 支持的事件类型:
 * - Lifecycle: RunStarted, RunFinished, RunError, StepStarted, StepFinished
 * - Text Message: TextMessageStart, TextMessageContent, TextMessageEnd, TextMessageChunk
 * - Tool Call: ToolCallStart, ToolCallArgs, ToolCallEnd
 * - State Management: StateSnapshot, StateDelta
 * - Activity: CustomActivity
 * - Special: CustomEvent
 */

// ==================== 类型定义 ====================

/** AGUI 事件基础类型 */
export interface BaseAguiEvent {
  type: string;
  timestamp?: string;
  rawEvent?: unknown;
}

/** 生命周期事件 - RunStarted */
export interface RunStartedEvent extends BaseAguiEvent {
  type: 'RunStarted';
  threadId: string;
  runId: string;
  parentRunId?: string;
  input?: unknown;
}

/** 生命周期事件 - RunFinished */
export interface RunFinishedEvent extends BaseAguiEvent {
  type: 'RunFinished';
  threadId: string;
  runId: string;
  result?: unknown;
}

/** 生命周期事件 - RunError */
export interface RunErrorEvent extends BaseAguiEvent {
  type: 'RunError';
  message: string;
  code?: string;
}

/** 生命周期事件 - StepStarted */
export interface StepStartedEvent extends BaseAguiEvent {
  type: 'StepStarted';
  stepName: string;
}

/** 生命周期事件 - StepFinished */
export interface StepFinishedEvent extends BaseAguiEvent {
  type: 'StepFinished';
  stepName: string;
}

/** 文本消息事件 - TextMessageStart */
export interface TextMessageStartEvent extends BaseAguiEvent {
  type: 'TextMessageStart';
  messageId: string;
  role: 'developer' | 'system' | 'assistant' | 'user' | 'tool';
}

/** 文本消息事件 - TextMessageContent */
export interface TextMessageContentEvent extends BaseAguiEvent {
  type: 'TextMessageContent';
  messageId: string;
  delta: string;
}

/** 文本消息事件 - TextMessageEnd */
export interface TextMessageEndEvent extends BaseAguiEvent {
  type: 'TextMessageEnd';
  messageId: string;
}

/** 文本消息事件 - TextMessageChunk (便捷事件) */
export interface TextMessageChunkEvent extends BaseAguiEvent {
  type: 'TextMessageChunk';
  messageId?: string;
  role?: 'developer' | 'system' | 'assistant' | 'user';
  delta?: string;
}

/** 工具调用事件 - ToolCallStart */
export interface ToolCallStartEvent extends BaseAguiEvent {
  type: 'ToolCallStart';
  toolCallId: string;
  toolName: string;
}

/** 工具调用事件 - ToolCallArgs */
export interface ToolCallArgsEvent extends BaseAguiEvent {
  type: 'ToolCallArgs';
  toolCallId: string;
  delta: string;
}

/** 工具调用事件 - ToolCallEnd */
export interface ToolCallEndEvent extends BaseAguiEvent {
  type: 'ToolCallEnd';
  toolCallId: string;
}

/** 状态管理事件 - StateSnapshot */
export interface StateSnapshotEvent extends BaseAguiEvent {
  type: 'StateSnapshot';
  snapshot: unknown;
}

/** 状态管理事件 - StateDelta */
export interface StateDeltaEvent extends BaseAguiEvent {
  type: 'StateDelta';
  delta: unknown;
}

/** 活动事件 - CustomActivity */
export interface CustomActivityEvent extends BaseAguiEvent {
  type: 'CustomActivity';
  activityType: string;
  data?: unknown;
}

/** 特殊事件 - CustomEvent */
export interface CustomEvent extends BaseAguiEvent {
  type: 'CustomEvent';
  name: string;
  data?: unknown;
}

/** 所有 AGUI 事件的联合类型 */
export type AguiEvent =
  | RunStartedEvent
  | RunFinishedEvent
  | RunErrorEvent
  | StepStartedEvent
  | StepFinishedEvent
  | TextMessageStartEvent
  | TextMessageContentEvent
  | TextMessageEndEvent
  | TextMessageChunkEvent
  | ToolCallStartEvent
  | ToolCallArgsEvent
  | ToolCallEndEvent
  | StateSnapshotEvent
  | StateDeltaEvent
  | CustomActivityEvent
  | CustomEvent;

/** AGUI 请求体 */
export interface AguiRequest {
  threadId: string;
  runId: string;
  messages: Array<{
    id: string;
    role: string;
    content: string;
  }>;
  forwardedProps?: Record<string, unknown>;
}

/** 事件回调接口 */
export interface AguiCallbacks {
  onRunStarted?: (event: RunStartedEvent) => void;
  onRunFinished?: (event: RunFinishedEvent) => void;
  onRunError?: (event: RunErrorEvent) => void;
  onStepStarted?: (event: StepStartedEvent) => void;
  onStepFinished?: (event: StepFinishedEvent) => void;
  onTextMessageStart?: (event: TextMessageStartEvent) => void;
  onTextMessageContent?: (event: TextMessageContentEvent) => void;
  onTextMessageEnd?: (event: TextMessageEndEvent) => void;
  onTextMessageChunk?: (event: TextMessageChunkEvent) => void;
  onToolCallStart?: (event: ToolCallStartEvent) => void;
  onToolCallArgs?: (event: ToolCallArgsEvent) => void;
  onToolCallEnd?: (event: ToolCallEndEvent) => void;
  onStateSnapshot?: (event: StateSnapshotEvent) => void;
  onStateDelta?: (event: StateDeltaEvent) => void;
  onCustomActivity?: (event: CustomActivityEvent) => void;
  onCustomEvent?: (event: CustomEvent) => void;
}

/** 连接选项 */
export interface AguiConnectOptions {
  /** Agent ID (必填,例如 'default', 'chat', 'calculator') */
  agentId: string;
  /** 用户消息 */
  message: string;
  /** 额外参数 */
  forwardedProps?: Record<string, unknown>;
  /** 事件回调 */
  callbacks: AguiCallbacks;
  /** 会话 ID (可选,用于多轮对话) */
  threadId?: string;
}

// ==================== AGUI 客户端类 ====================

export class AguiClient {
  private baseUrl: string;
  private activeControllers: Map<string, AbortController>;

  constructor(baseUrl: string = 'http://localhost:8080') {
    this.baseUrl = baseUrl;
    this.activeControllers = new Map();
  }

  /**
   * 连接 AGUI Agent,启动 SSE 流
   * 
   * @param options 连接选项
   * @returns threadId - 会话 ID
   */
  async connect(options: AguiConnectOptions): Promise<string> {
    const { agentId, message, forwardedProps, callbacks, threadId: providedThreadId } = options;

    // 生成 threadId 和 runId
    const threadId = providedThreadId || `thread_${Date.now()}`;
    const runId = `run_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // 构建请求体 (符合 AGUI 协议)
    const requestBody: AguiRequest = {
      threadId,
      runId,
      messages: [
        {
          id: `msg_${Date.now()}`,
          role: 'user',
          content: message
        }
      ],
      forwardedProps
    };

    // 构建 URL (支持路径参数)
    const url = `${this.baseUrl}/agui/run/${agentId}`;

    // 创建 AbortController 用于取消
    const controller = new AbortController();
    this.activeControllers.set(threadId, controller);

    try {
      // 发起 POST 请求
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Accept': 'text/event-stream'
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // 验证 Content-Type
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('text/event-stream')) {
        throw new Error(`Invalid content type: ${contentType}, expected text/event-stream`);
      }

      // 解析 SSE 流
      await this.parseSSEStream(response.body, callbacks);

      return threadId;
    } catch (error) {
      console.error('[AGUI] Connection failed:', error);
      if (callbacks.onRunError && error instanceof Error) {
        callbacks.onRunError({
          type: 'RunError',
          message: error.message,
          code: 'CONNECTION_FAILED'
        });
      }
      throw error;
    } finally {
      this.activeControllers.delete(threadId);
    }
  }

  /**
   * 解析 SSE 事件流
   * 
   * @param body ReadableStream
   * @param callbacks 事件回调
   */
  private async parseSSEStream(
    body: ReadableStream<Uint8Array> | null,
    callbacks: AguiCallbacks
  ): Promise<void> {
    if (!body) {
      throw new Error('Response body is null');
    }

    const reader = body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // 解码并追加到缓冲区
        buffer += decoder.decode(value, { stream: true });

        // 按行分割
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // 保留不完整的最后一行

        // 解析每一行
        for (const line of lines) {
          const trimmedLine = line.trim();
          
          // 跳过空行和注释
          if (!trimmedLine || trimmedLine.startsWith(':')) continue;

          // 解析 data 行
          if (trimmedLine.startsWith('data:')) {
            const dataStr = trimmedLine.substring(5).trim();
            if (!dataStr) continue;

            try {
              const event = JSON.parse(dataStr) as AguiEvent;
              this.dispatchEvent(event, callbacks);
            } catch (parseError) {
              console.warn('[AGUI] Failed to parse event:', dataStr, parseError);
            }
          }
        }
      }
    } catch (error) {
      console.error('[AGUI] Stream reading failed:', error);
      if (callbacks.onRunError && error instanceof Error) {
        callbacks.onRunError({
          type: 'RunError',
          message: `Stream reading failed: ${error.message}`,
          code: 'STREAM_ERROR'
        });
      }
      throw error;
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * 分发 AGUI 事件到对应回调
   * 
   * @param event AGUI 事件
   * @param callbacks 事件回调
   */
  private dispatchEvent(event: AguiEvent, callbacks: AguiCallbacks): void {
    const eventType = (event as any).type;
    
    // 匹配后端 @JsonSubTypes 定义的事件类型
    switch (eventType) {
      // Lifecycle events
      case 'RUN_STARTED':
        callbacks.onRunStarted?.(event as RunStartedEvent);
        break;

      case 'RUN_FINISHED':
        callbacks.onRunFinished?.(event as RunFinishedEvent);
        break;

      case 'RUN_ERROR':
        callbacks.onRunError?.(event as RunErrorEvent);
        break;

      // Text message events
      case 'TEXT_MESSAGE_START':
        callbacks.onTextMessageStart?.(event as TextMessageStartEvent);
        break;

      case 'TEXT_MESSAGE_CONTENT':
        callbacks.onTextMessageContent?.(event as TextMessageContentEvent);
        break;

      case 'TEXT_MESSAGE_END':
        callbacks.onTextMessageEnd?.(event as TextMessageEndEvent);
        break;

      // Tool call events
      case 'TOOL_CALL_START':
        callbacks.onToolCallStart?.(event as ToolCallStartEvent);
        break;

      case 'TOOL_CALL_ARGS':
        callbacks.onToolCallArgs?.(event as ToolCallArgsEvent);
        break;

      case 'TOOL_CALL_END':
        callbacks.onToolCallEnd?.(event as ToolCallEndEvent);
        break;

      case 'TOOL_CALL_RESULT':
        // ToolCallResult 事件(目前不需要处理)
        break;

      // State management events
      case 'STATE_SNAPSHOT':
        callbacks.onStateSnapshot?.(event as StateSnapshotEvent);
        break;

      case 'STATE_DELTA':
        callbacks.onStateDelta?.(event as StateDeltaEvent);
        break;

      // Special events
      case 'RAW':
        // RAW 事件(目前不需要处理)
        break;

      case 'CUSTOM':
        callbacks.onCustomEvent?.(event as CustomEvent);
        break;

      // Reasoning events
      case 'REASONING_START':
        // ReasoningStart 事件(目前不需要处理)
        break;

      case 'REASONING_MESSAGE_START':
        // ReasoningMessageStart 事件(目前不需要处理)
        break;

      case 'REASONING_MESSAGE_CONTENT':
        // ReasoningMessageContent 事件(目前不需要处理)
        break;

      case 'REASONING_MESSAGE_END':
        // ReasoningMessageEnd 事件(目前不需要处理)
        break;

      case 'REASONING_MESSAGE_CHUNK':
        // ReasoningMessageChunk 事件(目前不需要处理)
        break;

      case 'REASONING_END':
        // ReasoningEnd 事件(目前不需要处理)
        break;

      default:
        console.warn('[AGUI] Unknown event type:', eventType, event);
    }
  }

  /**
   * 取消活跃的 SSE 连接
   * 
   * @param threadId 会话 ID
   */
  disconnect(threadId: string): void {
    const controller = this.activeControllers.get(threadId);
    if (controller) {
      controller.abort();
      this.activeControllers.delete(threadId);
      console.log('[AGUI] Disconnected:', threadId);
    }
  }

  /**
   * 取消所有活跃连接
   */
  disconnectAll(): void {
    this.activeControllers.forEach((controller, threadId) => {
      controller.abort();
      console.log('[AGUI] Disconnected:', threadId);
    });
    this.activeControllers.clear();
  }
}

/// <reference types="vite/client" />

// 导出单例
export const aguiClient = new AguiClient(
  (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8080'
);
