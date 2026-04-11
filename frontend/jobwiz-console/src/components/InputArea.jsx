import { useState } from 'react';
import './InputArea.css';

const InputArea = ({ onSend }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSend = () => {
    if (inputValue.trim() && onSend) {
      onSend(inputValue);
      setInputValue('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="input-area">
      <div className="function-buttons">
        <button className="func-btn">
          <span className="btn-icon">🧠</span>
          <span>深度思考</span>
        </button>
        <button className="func-btn">
          <span className="btn-icon">📄</span>
          <span>新建</span>
        </button>
        <button className="func-btn highlight">
          <span className="btn-icon">⚡</span>
          <span>59 积分</span>
        </button>
        <button className="func-btn">
          <span className="btn-icon">🕐</span>
          <span>历史</span>
        </button>
      </div>
      
      <div className="input-wrapper">
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="请输入..."
          rows={1}
        />
        <button className="send-btn" onClick={handleSend}>
          ↑
        </button>
      </div>
    </div>
  );
};

export default InputArea;
