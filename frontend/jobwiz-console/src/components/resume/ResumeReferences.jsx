const ResumeReferences = ({ items }) => {
  if (!items || items.length === 0) return null;

  return (
    <div>
      {items.map((item) => {
        if (!item.visible && item.visible !== undefined) return null;
        return (
          <div key={item.id} className="resume-reference-item">
            <div className="resume-reference-name">{item.name}</div>
            {item.position && (
              <div className="resume-reference-position">{item.position}</div>
            )}
            {item.phone && (
              <div style={{ fontSize: '11px', color: '#666' }}>📞 {item.phone}</div>
            )}
            {item.email && (
              <div style={{ fontSize: '11px', color: '#666' }}>✉ {item.email}</div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ResumeReferences;
