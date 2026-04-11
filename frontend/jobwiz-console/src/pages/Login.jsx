import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = ({ onLogin }) => {
  const [userId, setUserId] = useState('1001');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 调用登录回调，保存用户 ID
      if (onLogin) {
        await onLogin(userId);
      }
      
      // 登录成功后跳转到主页
      navigate('/');
    } catch (error) {
      console.error('登录失败:', error);
      alert('登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">智聘鼠</h1>
          <p className="login-subtitle">智能招聘助手</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="userId">用户 ID</label>
            <input
              type="text"
              id="userId"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="请输入用户 ID（默认 1001）"
              required
              autoFocus
            />
            <p className="form-tip">测试账号：1001（张明）、1002（李雨欣）</p>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? '登录中...' : '立即登录'}
          </button>
        </form>

        <div className="login-footer">
          <p>首次使用？无需注册，直接登录即可体验</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
