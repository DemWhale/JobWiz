import { useState } from 'react';
import './UserAvatar.css';

const UserAvatar = () => {
  const [showUserInfo, setShowUserInfo] = useState(false);

  const handleAvatarClick = () => {
    setShowUserInfo(!showUserInfo);
  };

  return (
    <div className="user-avatar-container">
      <div className="user-avatar" onClick={handleAvatarClick}>
        <img src="/avatar.svg" alt="用户头像" />
      </div>
      
      {showUserInfo && (
        <div className="user-info-panel">
          <div className="user-info-header">
            <img src="/avatar.svg" alt="用户头像" />
            <div className="user-name">
              <h3>张三</h3>
              <p>计算机科学与技术 · 本科</p>
            </div>
          </div>
          <div className="user-info-content">
            <div className="info-item">
              <span className="label">意向城市：</span>
              <span className="value">北京、上海</span>
            </div>
            <div className="info-item">
              <span className="label">期望岗位：</span>
              <span className="value">Java 开发工程师</span>
            </div>
            <div className="info-item">
              <span className="label">期望薪资：</span>
              <span className="value">15-20k</span>
            </div>
            <div className="info-item">
              <span className="label">工作年限：</span>
              <span className="value">应届毕业生</span>
            </div>
          </div>
          <button className="close-btn" onClick={() => setShowUserInfo(false)}>
            关闭
          </button>
        </div>
      )}
    </div>
  );
};

export default UserAvatar;
