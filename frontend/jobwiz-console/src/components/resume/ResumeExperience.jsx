/**
 * 工作经历组件 - 对齐新 schema
 * @param {Array} items - workbg 模块的 child 数组
 *   [{ company, position, department, start_time, end_time, job_detail }]
 */
const ResumeExperience = ({ items, activeIndex, onItemClick }) => {
  if (!items || items.length === 0) return null;

  return (
    <div className="resume-timeline">
      {items.map((item, index) => {
        return (
          <div
            key={item.id || index}
            className={`resume-timeline-item ${activeIndex === index ? 'is-active' : ''}`}
            onClick={(event) => {
              if (!onItemClick) return;
              event.stopPropagation();
              onItemClick(index);
            }}
          >
            <div className="resume-timeline-header">
              <span className="resume-timeline-title">{item.company}</span>
              <span className="resume-timeline-date">
                {item.start_time}{item.end_time ? ` ~ ${item.end_time}` : ''}
              </span>
            </div>
            <div className="resume-timeline-subtitle">
              {item.position}{item.department ? ` · ${item.department}` : ''}
            </div>
            {item.job_detail && (
              <div
                className="resume-timeline-detail"
                dangerouslySetInnerHTML={{ __html: item.job_detail }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ResumeExperience;
