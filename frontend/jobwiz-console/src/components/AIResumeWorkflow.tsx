import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AIResumeWorkflow.css';

/** 用户信息接口 */
interface UserInfo {
  name: string;
  industry: string;
  targetPosition: string;
  targetCity: string;
}

/**
 * AI 简历信息收集表单
 * 
 * 新流程:
 * - 用户填写基础信息
 * - 提交后跳转到 /resume/edit/new (mode=ai)
 * - 在编辑页通过聊天流与 Agent 交互
 */
export default function AIResumeWorkflow() {
  const navigate = useNavigate();
  
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: '',
    industry: '',
    targetPosition: '',
    targetCity: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * 处理表单提交: 跳转到编辑页(AI 模式)
   */
  const handleSubmit = async () => {
    if (!userInfo.name || !userInfo.industry || !userInfo.targetPosition) {
      alert('请填写必填字段');
      return;
    }

    setIsSubmitting(true);

    try {
      // 构建初始 resumeData (符合 data.json schema)
      const initialResumeData = {
        content: {
          modules: []  // 初始为空,等待 AI 生成
        },
        css_config: {
          global: {
            fontColor: '#363636',
            fontFamily: 'PingFang SC,Microsoft Yahei',
            fontSize: 12,
            lineHeight: 1.45,
            themeColor: '#001a66'
          }
        },
        template_id: 1,  // 固定模板
        title: `${userInfo.name}_${userInfo.targetPosition}`,
        user_id: 1,  // TODO: 从登录态获取
        share_status: 0
      };

      // 跳转到编辑页,传递 userInfo 和初始数据
      navigate('/resume/edit/new', {
        state: {
          mode: 'ai',
          userInfo,  // 用户填写的信息,用于首次调用 Agent
          resumeData: initialResumeData,
          templateId: 1
        }
      });
    } catch (error) {
      console.error('提交失败:', error);
      alert('提交失败,请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="ai-resume-workflow">
      <div className="workflow-header">
        <button className="back-btn" onClick={() => navigate('/resumes')}>
          ← 返回简历列表
        </button>
        <h1>AI 简历一键生成</h1>
        <p className="workflow-subtitle">
          基于您的个人信息和职业背景,为您量身定制专业简历
        </p>
      </div>

      <div className="workflow-content">
        <div className="info-form">
          <div className="form-group">
            <label>姓名 <span style={{color: '#f44336'}}>*</span></label>
            <input
              type="text"
              value={userInfo.name}
              onChange={(e) => setUserInfo({...userInfo, name: e.target.value})}
              placeholder="请输入您的姓名"
            />
          </div>
          
          <div className="form-group">
            <label>行业 <span style={{color: '#f44336'}}>*</span></label>
            <input
              type="text"
              value={userInfo.industry}
              onChange={(e) => setUserInfo({...userInfo, industry: e.target.value})}
              placeholder="例如: 互联网、金融、教育"
            />
          </div>
          
          <div className="form-group">
            <label>期望职位 <span style={{color: '#f44336'}}>*</span></label>
            <input
              type="text"
              value={userInfo.targetPosition}
              onChange={(e) => setUserInfo({...userInfo, targetPosition: e.target.value})}
              placeholder="例如: 后端开发工程师"
            />
          </div>
          
          <div className="form-group">
            <label>期望城市</label>
            <input
              type="text"
              value={userInfo.targetCity}
              onChange={(e) => setUserInfo({...userInfo, targetCity: e.target.value})}
              placeholder="例如: 北京、上海、深圳"
            />
          </div>
        </div>

        <div className="form-tips">
          <p>• 示例内容仅作参考,请替换成你的真实公司 / 项目 / 成果</p>
          <p>• 已有成熟简历? 复制粘贴关键段落即可,AI 会自动梳理结构与措辞</p>
          <p>• 使用输入法中的语音功能,快速口述录入,稍后再完善关键细节</p>
        </div>

        <button
          className="btn-submit"
          onClick={handleSubmit}
          disabled={!userInfo.name || !userInfo.industry || !userInfo.targetPosition || isSubmitting}
        >
          {isSubmitting ? '提交中...' : '🤖 点击,AI 3 分钟创建简历'}
        </button>
      </div>
    </div>
  );
}
