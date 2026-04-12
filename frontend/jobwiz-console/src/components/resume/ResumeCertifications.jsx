const ResumeCertifications = ({ items }) => {
  if (!items || items.length === 0) return null;

  return (
    <div className="resume-item-list">
      {items.map((item) => {
        if (!item.visible && item.visible !== undefined) return null;
        return (
          <div key={item.id} className="resume-item">
            <div>
              <span className="resume-item-name">{item.name}</span>
              {item.issuer && (
                <span style={{ color: '#888', fontSize: '11px', marginLeft: '6px' }}>
                  {item.issuer}
                </span>
              )}
            </div>
            {item.date && <span className="resume-item-date">{item.date}</span>}
          </div>
        );
      })}
    </div>
  );
};

export default ResumeCertifications;
