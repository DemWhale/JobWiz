import { useState } from 'react';
import './UserAvatar.css';

const UserAvatar = ({ userId, userFeature, onNavigateToProfile }) => {
  const [showUserInfo, setShowUserInfo] = useState(false);

  const handleAvatarClick = () => {
    // 如果有导航回调，则跳转到个人中心页面
    if (onNavigateToProfile) {
      onNavigateToProfile();
    } else {
      setShowUserInfo(!showUserInfo);
    }
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
              <h3>{userFeature?.nickname || `用户${userId}`}</h3>
              <p>{userFeature?.major || '未设置'} · {userFeature?.education || '未设置'}</p>
            </div>
          </div>
          <div className="user-info-content">
            <div className="info-item">
              <span className="label">意向城市：</span>
              <span className="value">{userFeature?.targetCity || '未设置'}</span>
            </div>
            <div className="info-item">
              <span className="label">期望岗位：</span>
              <span className="value">{userFeature?.targetPosition || '未设置'}</span>
            </div>
            <div className="info-item">
              <span className="label">毕业院校：</span>
              <span className="value">{userFeature?.school || '未设置'}</span>
            </div>
            <div className="info-item">
              <span className="label">专业：</span>
              <span className="value">{userFeature?.major || '未设置'}</span>
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
