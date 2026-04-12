import './FormToolbar.css';

const FormToolbar = () => {
  const buttons = [
    { icon: '↶', label: '撤销' },
    { icon: '↷', label: '重做' },
    { icon: 'B', label: '加粗', style: { fontWeight: 'bold' } },
    { icon: 'I', label: '斜体', style: { fontStyle: 'italic' } },
    { icon: '•', label: '无序列表' },
    { icon: '1.', label: '有序列表' },
    { icon: '≡', label: '左对齐' },
    { icon: '☰', label: '居中' },
    { icon: '≡', label: '右对齐', style: { transform: 'rotate(180deg)' } },
    { icon: '🔗', label: '链接' },
  ];

  const handleClick = (label) => {
    console.log('Toolbar button clicked:', label);
    // TODO: 后续对接富文本编辑器
  };

  return (
    <div className="form-toolbar">
      {buttons.map((btn) => (
        <button
          key={btn.label}
          className="toolbar-btn"
          title={btn.label}
          onClick={() => handleClick(btn.label)}
          style={btn.style}
        >
          {btn.icon}
        </button>
      ))}
    </div>
  );
};

export default FormToolbar;
