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
      <div className="input-wrapper">
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="告诉 OfferShow AI 你的需求..."
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
