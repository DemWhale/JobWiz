import './SectionFormItem.css';

const SectionFormItem = ({ title, children, onAdd, onRemove, removable = true }) => {
  return (
    <div className="section-form-item">
      <div className="section-form-header">
        <h3 className="section-form-title">{title}</h3>
        <div className="section-form-actions">
          {onAdd && (
            <button className="action-btn-add" onClick={onAdd} title="添加">
              +
            </button>
          )}
          {removable && onRemove && (
            <button className="action-btn-remove" onClick={onRemove} title="删除">
              ×
            </button>
          )}
        </div>
      </div>
      <div className="section-form-content">
        {children}
      </div>
    </div>
  );
};

export default SectionFormItem;
