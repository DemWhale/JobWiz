import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Profile from './pages/Profile';
import ResumeList from './pages/ResumeList';
import ResumeEdit from './pages/ResumeEdit';
import Home from './pages/Home';
import Sidebar from './components/Sidebar';
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
            console.log('获取用户信息失败，后端未启动或用户不存在', err);
          }
        }
        // 没有 savedUserId 时，不自动 Mock 登录，由路由守卫跳转 /login
      } catch (error) {
        console.error('检查登录状态失败:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkLoginStatus();
  }, []);

  // 布局外壳（需要登录）— 左侧边栏 + 右侧内容
  const AppLayout = ({ children }) => {
    return (
      <div className="app-layout">
        <Sidebar
          userFeature={userFeature}
          credits={59}
          onLogout={handleLogout}
        />
        <main className="app-main">
          {children}
        </main>
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
    return <AppLayout>{children}</AppLayout>;
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
        path="/resumes"
        element={
          <ProtectedRoute>
            <ResumeList userId={userId} />
          </ProtectedRoute>
        }
      />
      <Route 
        path="/resume/new" 
        element={
          <ProtectedRoute>
            <div className="placeholder-page">新建简历（Spec C）</div>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/resume/edit/:id" 
        element={
          <ProtectedRoute>
            <ResumeEdit userId={userId} />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <Home userId={userId} userFeature={userFeature} />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

export default App;
