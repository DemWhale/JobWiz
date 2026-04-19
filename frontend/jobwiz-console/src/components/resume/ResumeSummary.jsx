/**
 * 自我评价组件 - 对齐新 schema
 * @param {string} htmlContent - self_comment 模块的 child[0].self_comment (HTML)
 */
const ResumeSummary = ({ htmlContent }) => {
  if (!htmlContent) return null;

  return (
    <div
      className="resume-rich-text"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};

export default ResumeSummary;
