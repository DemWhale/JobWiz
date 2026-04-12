const ResumeProfiles = ({ items }) => {
  if (!items || items.length === 0) return null;

  return (
    <div className="resume-profile-list">
      {items.map((item) => {
        if (!item.visible && item.visible !== undefined) return null;
        return (
          <a
            key={item.id}
            href={item.url || item.username}
            className="resume-profile-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            {item.network || item.username}
          </a>
        );
      })}
    </div>
  );
};

export default ResumeProfiles;
