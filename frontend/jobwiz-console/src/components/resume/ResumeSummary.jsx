const ResumeSummary = ({ items }) => {
  if (!items || items.length === 0) return null;

  return (
    <div>
      {items.map((item) => {
        if (!item.visible && item.visible !== undefined) return null;
        return (
          <div
            key={item.id || 'summary'}
            className="resume-rich-text"
            dangerouslySetInnerHTML={{ __html: item.content || '' }}
          />
        );
      })}
    </div>
  );
};

export default ResumeSummary;
