/**
 * 教育背景组件 - 对齐新 schema
 * @param {Array} items - eduabout 模块的 child 数组
 *   [{ school, major, edu, start_time, end_time, school_experience }]
 */
const ResumeEducation = ({ items }) => {
  if (!items || items.length === 0) return null;

  return (
    <div className="resume-timeline">
      {items.map((item, index) => {
        return (
          <div key={item.id || index} className="resume-timeline-item">
            <div className="resume-timeline-header">
              <span className="resume-timeline-title">{item.school}</span>
              <span className="resume-timeline-date">
                {item.start_time}{item.end_time ? ` ~ ${item.end_time}` : ''}
              </span>
            </div>
            <div className="resume-timeline-subtitle">
              {item.major}{item.edu ? ` · ${item.edu}` : ''}
            </div>
            {item.school_experience && (
              <div
                className="resume-timeline-detail"
                dangerouslySetInnerHTML={{ __html: item.school_experience }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ResumeEducation;
