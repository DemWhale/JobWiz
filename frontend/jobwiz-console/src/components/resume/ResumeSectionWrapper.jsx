import { useRef } from 'react';

const ResumeSectionWrapper = ({ sectionId, name, visible = true, active = false, onAnchorClick, children }) => {
  const ref = useRef(null);

  if (!visible) return null;

  const handleClick = () => {
    if (onAnchorClick) {
      onAnchorClick(sectionId);
    }
  };

  return (
    <div
      ref={ref}
      className={`resume-section-wrapper ${active ? 'is-active' : ''}`}
      data-section-id={sectionId}
      onClick={handleClick}
    >
      <div className="resume-section">
        {name && <div className="resume-section-title">{name}</div>}
        {children}
      </div>
    </div>
  );
};

export default ResumeSectionWrapper;
