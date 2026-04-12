import { Search, PenLine, Target, GraduationCap, Route } from 'lucide-react';
import './ChatWindow.css';

const serviceCards = [
  {
    id: 'resume-diagnosis',
    icon: Search,
    title: '简历诊断',
    desc: '从招聘者的视角分析简历问题',
    color: '#3b82f6',
    bgColor: '#eff6ff',
  },
  {
    id: 'create-resume',
    icon: PenLine,
    title: '创建简历',
    desc: '快速开始一份新的简历',
    color: '#8b5cf6',
    bgColor: '#f5f3ff',
  },
  {
    id: 'campus-recruit',
    icon: Target,
    title: '校招推荐',
    desc: '筛选全网校招信息',
    color: '#f59e0b',
    bgColor: '#fffbeb',
  },
  {
    id: 'interview-prep',
    icon: GraduationCap,
    title: '面试准备',
    desc: '面试真题量身定制',
    color: '#22c55e',
    bgColor: '#f0fdf4',
  },
  {
    id: 'career-planning',
    icon: Route,
    title: '职业规划',
    desc: '行业大牛手把手指导',
    color: '#ec4899',
    bgColor: '#fdf2f8',
  },
];

const ChatWindow = ({ onCardClick }) => {
  const handleCardClick = (cardType) => {
    if (onCardClick) {
      onCardClick(cardType);
    }
  };

  return (
    <div className="chat-window">
      <div className="welcome-hero">
        <h1 className="welcome-brand">Agent</h1>
        <h2 className="welcome-greeting">嗨，我是小橙 🍊 你的求职伙伴</h2>
        <p className="welcome-subtitle">
          从简历打磨到面试准备，陪你从简历到 Offer，每一步都不孤单。
        </p>
      </div>

      <div className="service-cards">
        <div className="service-cards-row">
          {serviceCards.slice(0, 3).map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                className="service-card"
                onClick={() => handleCardClick(card.id)}
              >
                <div
                  className="service-card-icon"
                  style={{ backgroundColor: card.bgColor, color: card.color }}
                >
                  <Icon size={22} />
                </div>
                <div className="service-card-content">
                  <h3 className="service-card-title">{card.title}</h3>
                  <p className="service-card-desc">{card.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="service-cards-row">
          {serviceCards.slice(3).map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                className="service-card"
                onClick={() => handleCardClick(card.id)}
              >
                <div
                  className="service-card-icon"
                  style={{ backgroundColor: card.bgColor, color: card.color }}
                >
                  <Icon size={22} />
                </div>
                <div className="service-card-content">
                  <h3 className="service-card-title">{card.title}</h3>
                  <p className="service-card-desc">{card.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
