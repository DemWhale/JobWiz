const ResumeHeader = ({ basics }) => {
  if (!basics) return null;

  return (
    <div className="resume-header">
      {basics.name && <h1 className="resume-header-name">{basics.name}</h1>}
      {basics.headline && <p className="resume-header-headline">{basics.headline}</p>}
      <div className="resume-header-contact">
        {basics.phone && (
          <span className="resume-header-contact-item">
            📞 {basics.phone}
          </span>
        )}
        {basics.email && (
          <span className="resume-header-contact-item">
            ✉ {basics.email}
          </span>
        )}
        {basics.location && (
          <span className="resume-header-contact-item">
            📍 {basics.location}
          </span>
        )}
        {basics.url && (
          <span className="resume-header-contact-item">
            🔗 {basics.url}
          </span>
        )}
      </div>
    </div>
  );
};

export default ResumeHeader;
