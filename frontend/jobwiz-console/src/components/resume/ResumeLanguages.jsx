const ResumeLanguages = ({ items }) => {
  if (!items || items.length === 0) return null;

  return (
    <div className="resume-tags">
      {items.map((item) => {
        if (!item.visible && item.visible !== undefined) return null;
        return (
          <span key={item.id} className="resume-tag">
            {item.name}{item.fluency ? ` (${item.fluency})` : ''}
          </span>
        );
      })}
    </div>
  );
};

export default ResumeLanguages;
