import QuickActions from './QuickActions';
import './ChatWindow.css';

const ChatWindow = ({ onQuickActionSelect }) => {
  return (
    <div className="chat-window">
      <div className="welcome-section">
        <div className="welcome-message">
          Hi，我是智聘鼠，很高兴见到你！
        </div>
        <div className="subtitle">
          可以直接告诉鼠鼠，你的目标岗位、意向城市，或者点击下方快捷会话～
        </div>
      </div>
      
      <QuickActions onSelect={onQuickActionSelect} />
    </div>
  );
};

export default ChatWindow;
