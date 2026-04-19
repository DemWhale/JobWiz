import { useNavigate } from 'react-router-dom';
import ChatWindow from '../components/ChatWindow';
import InputArea from '../components/InputArea';
import './Home.css';

const Home = ({ userId, userFeature }) => {
  const navigate = useNavigate();

  const handleCardClick = (cardType) => {
    if (cardType === 'create-resume') {
      // 跳转到 AI 创建简历工作流
      navigate('/resume/ai-create');
      return;
    }
    console.log('Card clicked:', cardType);
    // TODO: 后续实现其他卡片跳转
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
        <InputArea onSend={handleSendMessage} />
      </div>
    </div>
  );
};

export default Home;
