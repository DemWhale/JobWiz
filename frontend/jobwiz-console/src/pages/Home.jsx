import ChatWindow from '../components/ChatWindow';
import QuickActions from '../components/QuickActions';
import InputArea from '../components/InputArea';
import './Home.css';

const Home = ({ userId, userFeature }) => {
  const handleCardClick = (cardType) => {
    console.log('Card clicked:', cardType);
    // TODO: 后续实现各卡片跳转
  };

  const handleQuickActionSelect = (actionType) => {
    console.log('Quick action selected:', actionType);
    // TODO: 后续实现快捷操作
  };

  const handleSendMessage = (message) => {
    console.log('User sent message:', message);
    // TODO: 后续实现 AI 对话功能
  };

  return (
    <div className="home">
      <div className="home-content">
        <ChatWindow onCardClick={handleCardClick} />
      </div>
      <div className="home-footer">
        <QuickActions onSelect={handleQuickActionSelect} />
        <InputArea onSend={handleSendMessage} />
      </div>
    </div>
  );
};

export default Home;
