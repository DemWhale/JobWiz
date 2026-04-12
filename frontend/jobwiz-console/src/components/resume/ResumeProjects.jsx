const ResumeProjects = ({ items }) => {
  if (!items || items.length === 0) return null;

  return (
    <div className="resume-timeline">
      {items.map((item) => {
        if (!item.visible && item.visible !== undefined) return null;
        return (
          <div key={item.id} className="resume-timeline-item">
            <div className="resume-timeline-header">
              <span className="resume-timeline-title">{item.name}</span>
              <span className="resume-timeline-date">{item.date}</span>
            </div>
            {item.description && (
              <div className="resume-timeline-subtitle">{item.description}</div>
            )}
            {item.summary && (
              <div
                className="resume-timeline-detail"
                dangerouslySetInnerHTML={{ __html: item.summary }}
              />
            )}
            {item.keywords && item.keywords.length > 0 && (
              <div className="resume-skill-keywords" style={{ marginTop: '4px' }}>
                {item.keywords.map((kw, i) => (
                  <span key={i} className="resume-skill-keyword">{kw}</span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ResumeProjects;
