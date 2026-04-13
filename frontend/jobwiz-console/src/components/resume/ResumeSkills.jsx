const ResumeSkills = ({ items }) => {
  if (!items || items.length === 0) return null;

  return (
    <div>
      {items.map((item) => {
        if (!item.visible && item.visible !== undefined) return null;
        // level 为 1-5 的整数，换算为百分比
        const levelValue = item.level
          ? typeof item.level === 'number'
            ? item.level
            : parseInt(item.level, 10) || 0
          : 0;
        const levelPercent = (levelValue / 5) * 100;
        return (
          <div key={item.id} className="resume-skill-item">
            <div className="resume-skill-header">
              <span className="resume-skill-name">{item.name}</span>
              {levelValue > 0 && <span className="resume-skill-level">{levelValue}/5</span>}
            </div>
            {levelValue > 0 && (
              <div className="resume-skill-bar">
                <div
                  className="resume-skill-bar-fill"
                  style={{ width: `${Math.min(levelPercent, 100)}%` }}
                />
              </div>
            )}
            {item.keywords && item.keywords.length > 0 && (
              <div className="resume-skill-keywords">
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

export default ResumeSkills;
