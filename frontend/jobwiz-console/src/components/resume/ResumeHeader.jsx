/**
 * 简历头部组件 - 对齐新 schema
 * @param {Object} baseinfoData - baseinfo 模块的 child[0] 数据
 */
const ResumeHeader = ({ baseinfoData }) => {
  if (!baseinfoData) return null;

  return (
    <div className="resume-header">
      {baseinfoData.name && <h1 className="resume-header-name">{baseinfoData.name}</h1>}
      {baseinfoData.intro && <p className="resume-header-intro">{baseinfoData.intro}</p>}
      <div className="resume-header-contact">
        {baseinfoData.phone && (
          <span className="resume-header-contact-item">
            📞 {baseinfoData.phone}
          </span>
        )}
        {baseinfoData.email && (
          <span className="resume-header-contact-item">
            ✉ {baseinfoData.email}
          </span>
        )}
        {baseinfoData.edu && (
          <span className="resume-header-contact-item">
            🎓 {baseinfoData.edu}
          </span>
        )}
        {baseinfoData.major && (
          <span className="resume-header-contact-item">
            📚 {baseinfoData.major}
          </span>
        )}
      </div>
    </div>
  );
};

export default ResumeHeader;
