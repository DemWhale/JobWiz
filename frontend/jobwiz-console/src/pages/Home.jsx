import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoaderCircle, Send, X } from 'lucide-react';
import ChatWindow from '../components/ChatWindow';
import InputArea from '../components/InputArea';
import { aguiClient } from '../services/agui';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [activePanel, setActivePanel] = useState(null);
  const [query, setQuery] = useState('');
  const [streamText, setStreamText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const activeThreadRef = useRef(null);
  const resultBodyRef = useRef(null);

  useEffect(() => {
    return () => {
      if (activeThreadRef.current) {
        aguiClient.disconnect(activeThreadRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (resultBodyRef.current) {
      resultBodyRef.current.scrollTop = resultBodyRef.current.scrollHeight;
    }
  }, [streamText, errorMessage]);

  const handleCardClick = (cardType) => {
    if (cardType === 'create-resume') {
      // 跳转到 AI 创建简历工作流
      navigate('/resume/ai-create');
      return;
    }

    if (cardType === 'social-security') {
      setActivePanel('social-security');
      setErrorMessage('');
      return;
    }

    console.log('Card clicked:', cardType);
    // TODO: 后续实现其他卡片跳转
  };

  const handleSendMessage = (message) => {
    console.log('User sent message:', message);
    // TODO: 后续实现 AI 对话功能
  };

  const handleClosePanel = () => {
    if (activeThreadRef.current) {
      aguiClient.disconnect(activeThreadRef.current);
      activeThreadRef.current = null;
    }
    setIsLoading(false);
    setErrorMessage('');
    setQuery('');
    setStreamText('');
    setActivePanel(null);
  };

  const handleSocialSecuritySearch = async () => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery || isLoading) {
      return;
    }

    if (activeThreadRef.current) {
      aguiClient.disconnect(activeThreadRef.current);
    }

    const threadId = `social_security_${Date.now()}`;
    activeThreadRef.current = threadId;
    setStreamText('');
    setErrorMessage('');
    setIsLoading(true);

    try {
      await aguiClient.connect({
        agentId: 'social-security',
        message: trimmedQuery,
        threadId,
        forwardedProps: {
          userId: '1',
          agentContext: {
            scene: 'home-social-security',
          },
        },
        callbacks: {
          onTextMessageContent: (event) => {
            setStreamText((prev) => prev + (event.delta || ''));
          },
          onTextMessageChunk: (event) => {
            setStreamText((prev) => prev + (event.delta || ''));
          },
          onRunError: (event) => {
            setErrorMessage(event.message || '查询失败，请稍后重试。');
            setIsLoading(false);
          },
          onRunFinished: () => {
            setIsLoading(false);
            activeThreadRef.current = null;
          },
        },
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '查询失败，请稍后重试。');
      setIsLoading(false);
      activeThreadRef.current = null;
    }
  };

  const handlePanelKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSocialSecuritySearch();
    }
  };

  return (
    <div className="home">
      <div className="home-content">
        <ChatWindow onCardClick={handleCardClick} />
        {activePanel === 'social-security' && (
          <section className="social-security-panel">
            <div className="social-security-panel-header">
              <div>
                <h3>社保上下限实时查询</h3>
                <p>输入城市、年份和险种诉求，我会通过百炼联网搜索返回流式结果。</p>
              </div>
              <button
                type="button"
                className="social-security-close-btn"
                onClick={handleClosePanel}
                aria-label="收起社保查询面板"
              >
                <X size={16} />
              </button>
            </div>

            <div className="social-security-query-box">
              <textarea
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={handlePanelKeyDown}
                placeholder="例如：查询上海 2025 社保缴费基数上下限，并说明医保是否单独口径"
                rows={3}
              />
              <button
                type="button"
                className="social-security-submit-btn"
                onClick={handleSocialSecuritySearch}
                disabled={isLoading || !query.trim()}
              >
                {isLoading ? <LoaderCircle size={16} className="spin" /> : <Send size={16} />}
                <span>{isLoading ? '查询中' : '开始查询'}</span>
              </button>
            </div>

            <div className="social-security-result-panel">
              <div className="social-security-result-header">
                <span>检索结果</span>
                {isLoading && <span className="social-security-result-status">流式输出中</span>}
              </div>
              <div className="social-security-result-body" ref={resultBodyRef}>
                {!streamText && !errorMessage && !isLoading && (
                  <p className="social-security-empty">
                    先输入城市、年份和险种诉求，然后点击“开始查询”。
                  </p>
                )}
                {streamText && (
                  <pre className="social-security-stream-text">{streamText}</pre>
                )}
                {errorMessage && (
                  <p className="social-security-error">{errorMessage}</p>
                )}
              </div>
            </div>
          </section>
        )}
      </div>
      {activePanel !== 'social-security' && (
        <div className="home-footer">
          <InputArea onSend={handleSendMessage} />
        </div>
      )}
    </div>
  );
};

export default Home;
