const ResumeInterests = ({ items }) => {
  if (!items || items.length === 0) return null;

  return (
    <div className="resume-tags">
      {items.map((item) => {
        if (!item.visible && item.visible !== undefined) return null;
        return (
          <span key={item.id} className="resume-tag">
            {item.name}
          </span>
        );
      })}
    </div>
  );
};

export default ResumeInterests;
