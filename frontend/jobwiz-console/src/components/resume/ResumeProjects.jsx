const ResumeProjects = ({ items }) => {
  if (!items || items.length === 0) return null;

  return (
    <div className="resume-timeline">
      {items.map((item, index) => {
        if (!item.visible && item.visible !== undefined) return null;
        const title = item.project_title || item.name;
        const role = item.project_role || item.description;
        const date = item.date || [item.start_time, item.end_time].filter(Boolean).join(' ~ ');
        const detail = item.project_detail || item.summary;

        return (
          <div key={item.id || index} className="resume-timeline-item">
            <div className="resume-timeline-header">
              <span className="resume-timeline-title">{title}</span>
              <span className="resume-timeline-date">{date}</span>
            </div>
            {role && (
              <div className="resume-timeline-subtitle">{role}</div>
            )}
            {detail && (
              <div
                className="resume-timeline-detail"
                dangerouslySetInnerHTML={{ __html: detail }}
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
