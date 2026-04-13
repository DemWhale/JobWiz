const ResumeSummary = ({ items, sectionData }) => {
  // 兼容两种数据格式：
  // 1. sectionData 是对象 {content: "...", visible: true}（来自预填充数据）
  // 2. items 是数组 [{id, content: "..."}]（来自通用 renderSection 逻辑）
  if (sectionData && !Array.isArray(sectionData) && sectionData.content) {
    const visible = sectionData.visible !== undefined ? sectionData.visible : true;
    if (!visible) return null;
    return (
      <div
        className="resume-rich-text"
        dangerouslySetInnerHTML={{ __html: sectionData.content || '' }}
      />
    );
  }

  if (!items || items.length === 0) return null;

  return (
    <div>
      {items.map((item) => {
        if (!item.visible && item.visible !== undefined) return null;
        return (
          <div
            key={item.id || 'summary'}
            className="resume-rich-text"
            dangerouslySetInnerHTML={{ __html: item.content || '' }}
          />
        );
      })}
    </div>
  );
};

export default ResumeSummary;
