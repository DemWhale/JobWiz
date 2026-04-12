import './QuickActions.css';

const quickActionItems = [
  { id: 'resume-diagnosis', icon: '📝', label: '简历诊断' },
  { id: 'resume-translate', icon: '🌐', label: '简历翻译' },
  { id: 'campus-recruit', icon: '🎯', label: '校招推荐' },
  { id: 'interview-guide', icon: '🧠', label: '面试指导' },
  { id: 'career-plan', icon: '📈', label: '职业规划' },
];

const QuickActions = ({ onSelect }) => {
  const handleClick = (actionType) => {
    if (onSelect) {
      onSelect(actionType);
    }
  };

  return (
    <div className="quick-actions">
      {quickActionItems.map((item) => (
        <button
          key={item.id}
          className="quick-action-btn"
          onClick={() => handleClick(item.id)}
        >
          <span className="quick-action-icon">{item.icon}</span>
          <span className="quick-action-label">{item.label}</span>
        </button>
      ))}
    </div>
  );
};

export default QuickActions;
