import './QuickActions.css';

const QuickActions = ({ onSelect }) => {
  const quickActions = [
    { id: 1, text: '根据专业找适合的工作机会。', icon: '🎯' },
    { id: 2, text: '热门行业有哪些？', icon: '🔥' },
    { id: 3, text: '已有明确岗位意向，给我一些求职建议。', icon: '💡' },
    { id: 4, text: '推荐一些热门校招岗位。', icon: '⭐' },
    { id: 5, text: '对专业要求较低的工作机会。', icon: '✨' }
  ];

  const handleClick = (action) => {
    if (onSelect) {
      onSelect(action);
    }
  };

  return (
    <div className="quick-actions">
      {quickActions.map((action) => (
        <div 
          key={action.id} 
          className="quick-action-item"
          onClick={() => handleClick(action)}
        >
          <span className="action-text">{action.text}</span>
          <span className="action-icon">→</span>
        </div>
      ))}
    </div>
  );
};

export default QuickActions;
