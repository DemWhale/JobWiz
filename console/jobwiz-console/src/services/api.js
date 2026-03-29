import axios from 'axios';

// 创建 axios 实例
const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: false // 禁用跨域凭证
});

// 请求拦截器
api.interceptors.request.use(
  config => {
    console.log('API Request:', config.method, config.url);
    return config;
  },
  error => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  response => {
    console.log('API Response:', response.status, response.data);
    return response;
  },
  error => {
    if (error.message.includes('Network Error')) {
      console.error('网络错误：无法连接到后端服务');
    } else {
      console.error('API Error:', error.response?.status, error.message);
    }
    return Promise.reject(error);
  }
);

// 用户特征 API 服务
export const userFeatureApi = {
  /**
   * 根据用户 ID 获取用户特征
   * @param {number|string} userId - 用户 ID
   * @returns {Promise<Object>} 用户特征信息
   */
  getUserFeature: async (userId) => {
    try {
      const response = await api.get(`/user-feature/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('获取用户信息失败:', error);
      throw error;
    }
  },

  /**
   * 保存或更新用户特征
   * @param {Object} data - 用户特征数据
   * @returns {Promise<boolean>} 操作结果
   */
  saveOrUpdate: async (data) => {
    try {
      const response = await api.post('/user-feature/save-or-update', data);
      return response.data;
    } catch (error) {
      console.error('保存用户信息失败:', error);
      throw error;
    }
  },

  /**
   * 查询用户特征列表
   * @param {Object} params - 查询参数
   * @returns {Promise<Array>} 用户特征列表
   */
  list: async (params = {}) => {
    try {
      const response = await api.get('/user-feature/list', { params });
      return response.data;
    } catch (error) {
      console.error('查询用户列表失败:', error);
      throw error;
    }
  }
};

export default api;
