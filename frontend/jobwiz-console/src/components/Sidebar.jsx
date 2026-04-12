import { useNavigate, useLocation } from 'react-router-dom';
import { Home, FileText, BarChart3, Code, Lightbulb } from 'lucide-react';
import UserAvatar from './UserAvatar';
import './Sidebar.css';

const navItems = [
  { id: 'home', icon: Home, label: '首页', path: '/' },
  { id: 'resume', icon: FileText, label: '简历', path: '/resumes' },
  { id: 'analytics', icon: BarChart3, label: '数据', path: '/analytics' },
  { id: 'code', icon: Code, label: '代码', path: '/code' },
  { id: 'insights', icon: Lightbulb, label: '洞察', path: '/insights' },
];

const Sidebar = ({ userFeature, credits, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveItem = () => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path.startsWith('/resume')) return 'resume';
    if (path.startsWith('/analytics')) return 'analytics';
    if (path.startsWith('/code')) return 'code';
    if (path.startsWith('/insights')) return 'insights';
    return 'home';
  };

  const activeItem = getActiveItem();

  const handleNavigate = (item) => {
    navigate(item.path);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">O</div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;
          return (
            <button
              key={item.id}
              className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => handleNavigate(item)}
              title={item.label}
            >
              <Icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />
            </button>
          );
        })}
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-credits">
          <span className="credits-icon">✦</span>
          <span className="credits-value">{credits || 786}</span>
        </div>
        <UserAvatar
          userFeature={userFeature}
          onLogout={onLogout}
        />
      </div>
    </aside>
  );
};

export default Sidebar;
