import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const Profile = ({ userId, userFeature, onUpdateUser }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    userId: userId || '',
    nickname: '',
    school: '',
    education: '',
    major: '',
    gender: '男',
    graduationDate: '',
    email: '',
    targetPosition: '',
    targetCity: '',
    description: '',
    avatarUrl: ''
  });

  // 初始化表单数据
  useEffect(() => {
    if (userFeature) {
      setFormData({
        userId: userFeature.userId || userId,
        nickname: userFeature.nickname || '',
        school: userFeature.school || '',
        education: userFeature.education || '',
        major: userFeature.major || '',
        gender: userFeature.gender || '男',
        graduationDate: userFeature.graduationDate || '',
        email: userFeature.email || '',
        targetPosition: userFeature.targetPosition || '',
        targetCity: userFeature.targetCity || '',
        description: userFeature.description || '',
        avatarUrl: userFeature.avatarUrl || ''
      });
    } else if (userId) {
      setFormData(prev => ({
        ...prev,
        userId: userId
      }));
    }
  }, [userFeature, userId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 调用更新用户信息的回调
      if (onUpdateUser) {
        await onUpdateUser(formData);
      }
      
      alert('保存成功！');
      navigate('/');
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          ← 返回
        </button>
        <h1 className="page-title">基本信息</h1>
      </div>

      <div className="profile-card">
        <div className="profile-tip">
          <p>嘿，我是鼠鼠，分享一些你的信息，让我帮你找到心仪工作！</p>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-section">
            <h2 className="section-title">基本信息</h2>

            <div className="form-group">
              <label className="form-label">头像</label>
              <div className="avatar-preview">
                <div className="avatar-placeholder">
                  {formData.nickname ? formData.nickname[0] : '用'}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">姓名</label>
              <input
                type="text"
                name="nickname"
                value={formData.nickname}
                onChange={handleInputChange}
                placeholder="请输入姓名"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">性别</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="form-input"
              >
                <option value="男">男</option>
                <option value="女">女</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">最高学历</label>
              <select
                name="education"
                value={formData.education}
                onChange={handleInputChange}
                className="form-input"
              >
                <option value="">请选择</option>
                <option value="高中">高中</option>
                <option value="专科">专科</option>
                <option value="本科">本科</option>
                <option value="硕士">硕士</option>
                <option value="博士">博士</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">毕业院校</label>
              <input
                type="text"
                name="school"
                value={formData.school}
                onChange={handleInputChange}
                placeholder="请输入毕业院校"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">专业</label>
              <input
                type="text"
                name="major"
                value={formData.major}
                onChange={handleInputChange}
                placeholder="请输入专业"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">毕业时间</label>
              <input
                type="date"
                name="graduationDate"
                value={formData.graduationDate}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">邮箱</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="请输入邮箱"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">意向岗位</label>
              <input
                type="text"
                name="targetPosition"
                value={formData.targetPosition}
                onChange={handleInputChange}
                placeholder="请输入意向岗位"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">意向城市</label>
              <input
                type="text"
                name="targetCity"
                value={formData.targetCity}
                onChange={handleInputChange}
                placeholder="请输入意向城市"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">自我描述</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="简单介绍一下自己（可选）"
                rows="4"
                className="form-textarea"
              />
            </div>
          </div>

          <button type="submit" className="save-btn" disabled={loading}>
            {loading ? '保存中...' : '保存'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
