const ResumeVolunteer = ({ items }) => {
  if (!items || items.length === 0) return null;

  return (
    <div className="resume-timeline">
      {items.map((item) => {
        if (!item.visible && item.visible !== undefined) return null;
        return (
          <div key={item.id} className="resume-timeline-item">
            <div className="resume-timeline-header">
              <span className="resume-timeline-title">{item.organization}</span>
              <span className="resume-timeline-date">{item.date}</span>
            </div>
            {item.position && (
              <div className="resume-timeline-subtitle">{item.position}</div>
            )}
            {item.summary && (
              <div
                className="resume-timeline-detail"
                dangerouslySetInnerHTML={{ __html: item.summary }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ResumeVolunteer;
