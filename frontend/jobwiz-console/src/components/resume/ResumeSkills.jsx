/**
 * 专业技能组件 - 对齐新 schema
 * @param {string} htmlContent - skills 模块的 child[0].skills (HTML 字符串)
 */
const ResumeSkills = ({ htmlContent }) => {
  if (!htmlContent) return null;

  return (
    <div
      className="resume-skills-html"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};

export default ResumeSkills;
