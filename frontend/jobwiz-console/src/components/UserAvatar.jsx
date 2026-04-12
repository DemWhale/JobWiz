import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserAvatar.css';

const UserAvatar = ({ userFeature, onLogout }) => {
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  const handleAvatarClick = () => {
    setShowMenu(!showMenu);
  };

  const handleProfile = () => {
    setShowMenu(false);
    navigate('/profile');
  };

  const handleLogout = () => {
    setShowMenu(false);
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <div className="sidebar-avatar-container">
      <div className="sidebar-avatar" onClick={handleAvatarClick}>
        <img src="/avatar.svg" alt="头像" />
      </div>

      {showMenu && (
        <div className="sidebar-avatar-menu">
          <div className="avatar-menu-header">
            <img src="/avatar.svg" alt="头像" className="menu-avatar" />
            <span className="menu-username">
              {userFeature?.nickname || '用户'}
            </span>
          </div>
          <div className="avatar-menu-divider" />
          <button className="avatar-menu-item" onClick={handleProfile}>
            个人设置
          </button>
          <button className="avatar-menu-item logout" onClick={handleLogout}>
            退出登录
          </button>
        </div>
      )}
    </div>
  );
};

export default UserAvatar;
