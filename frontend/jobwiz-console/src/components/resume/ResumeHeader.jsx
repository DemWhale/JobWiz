const ResumeHeader = ({ basics }) => {
  if (!basics) return null;

  // 兼容 url 为对象 {label, href} 或字符串
  const urlDisplay = basics.url
    ? (typeof basics.url === 'object' ? (basics.url.href || basics.url.label) : basics.url)
    : '';

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
        {urlDisplay && (
          <span className="resume-header-contact-item">
            🔗 {urlDisplay}
          </span>
        )}
      </div>
    </div>
  );
};

export default ResumeHeader;
