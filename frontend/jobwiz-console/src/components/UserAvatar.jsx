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
        {userFeature?.avatarUrl ? (
          <img src={userFeature.avatarUrl} alt="头像" onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
        ) : null}
        <span className="avatar-fallback" style={{ display: userFeature?.avatarUrl ? 'none' : 'flex' }}>
          {userFeature?.nickname ? userFeature.nickname[0] : '用'}
        </span>
      </div>

      {showMenu && (
        <div className="sidebar-avatar-menu">
          <div className="avatar-menu-header">
            <div className="menu-avatar-wrap">
              {userFeature?.avatarUrl ? (
                <img src={userFeature.avatarUrl} alt="头像" className="menu-avatar" onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
              ) : null}
              <span className="menu-avatar-fallback" style={{ display: userFeature?.avatarUrl ? 'none' : 'flex' }}>
                {userFeature?.nickname ? userFeature.nickname[0] : '用'}
              </span>
            </div>
            <span className="menu-username">
              {userFeature?.nickname || '用户'}
            </span>
          </div>
          <div className="avatar-menu-divider" />
          <button className="avatar-menu-item" onClick={handleProfile}>
            查看信息
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
