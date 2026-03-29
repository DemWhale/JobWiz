import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Profile from './pages/Profile';
import UserAvatar from './components/UserAvatar';
import ChatWindow from './components/ChatWindow';
import InputArea from './components/InputArea';
import { userFeatureApi } from './services/api';
import './App.css';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userFeature, setUserFeature] = useState(null);
  const navigate = useNavigate();

  // 处理登录
  const handleLogin = async (loginUserId) => {
    try {
      // 保存用户 ID 到本地存储
      localStorage.setItem('userId', loginUserId);
      setUserId(loginUserId);
      setIsLoggedIn(true);

      // 获取用户信息（失败也不影响登录）
      try {
        const feature = await userFeatureApi.getUserFeature(loginUserId);
        if (feature) {
          setUserFeature(feature);
        }
      } catch (error) {
        console.log('用户信息不存在或无法获取，首次登录或后端未启动');
      }
      
      return true;
    } catch (error) {
      console.error('登录失败:', error);
      alert('登录失败：' + error.message);
      throw error;
    }
  };

  // 处理更新用户信息
  const handleUpdateUser = async (formData) => {
    try {
      await userFeatureApi.saveOrUpdate(formData);
      // 更新本地用户信息
      const updatedFeature = await userFeatureApi.getUserFeature(formData.userId);
      setUserFeature(updatedFeature);
      return true;
    } catch (error) {
      console.error('更新用户信息失败:', error);
      throw error;
    }
  };

  // 处理登出
  const handleLogout = () => {
    localStorage.removeItem('userId');
    setUserId(null);
    setUserFeature(null);
    setIsLoggedIn(false);
    navigate('/login');
  };

  // 页面加载时检查登录状态
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const savedUserId = localStorage.getItem('userId');
        if (savedUserId) {
          setUserId(savedUserId);
          setIsLoggedIn(true);
          // 获取用户信息（失败也不影响登录状态）
          try {
            const feature = await userFeatureApi.getUserFeature(savedUserId);
            if (feature) {
              setUserFeature(feature);
            }
          } catch (err) {
            console.log('获取用户信息失败，但不影响登录', err);
          }
        }
      } catch (error) {
        console.error('检查登录状态失败:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkLoginStatus();
  }, []);

  // 主页组件（需要登录）
  const HomePage = () => {
    const handleQuickActionSelect = (action) => {
      console.log('Selected quick action:', action.text);
      // TODO: 后续实现 AI 对话功能
    };

    const handleSendMessage = (message) => {
      console.log('User sent message:', message);
      // TODO: 后续实现 AI 对话功能
    };

    return (
      <div className="app-container">
        <header className="app-header">
          <div className="header-left">
            <UserAvatar userId={userId} userFeature={userFeature} onNavigateToProfile={() => navigate('/profile')} />
            <h1 className="app-title">智聘鼠</h1>
          </div>
          <nav className="header-nav">
            <a href="#" className="nav-item">校招</a>
            <a href="#" className="nav-item">简历</a>
            <div className="nav-dots" onClick={handleLogout} style={{ cursor: 'pointer' }}>
              <span>退出</span>
            </div>
          </nav>
        </header>

        <main className="app-main">
          <ChatWindow onQuickActionSelect={handleQuickActionSelect} />
        </main>

        <footer className="app-footer">
          <InputArea onSend={handleSendMessage} />
        </footer>
      </div>
    );
  };

  // 路由守卫
  const ProtectedRoute = ({ children }) => {
    if (isLoading) {
      return <div className="loading">加载中...</div>;
    }
    
    if (!isLoggedIn || !userId) {
      navigate('/login', { replace: true });
      return null;
    }
    return children;
  };

  if (isLoading) {
    return <div className="app-loading">正在加载...</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login onLogin={handleLogin} />} />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <Profile 
              userId={userId} 
              userFeature={userFeature}
              onUpdateUser={handleUpdateUser}
            />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

export default App;
