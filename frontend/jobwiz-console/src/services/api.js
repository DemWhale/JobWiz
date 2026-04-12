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
      const response = await api.get('/user-feature/user', { params: { userId } });
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

// 简历 API 服务
export const resumeApi = {
  /**
   * 根据用户 ID 获取简历列表
   * @param {number|string} userId - 用户 ID
   * @returns {Promise<Array>} 简历列表
   */
  listByUserId: async (userId) => {
    try {
      const response = await api.get('/resume/list', { params: { userId } });
      return response.data;
    } catch (error) {
      console.error('获取简历列表失败:', error);
      throw error;
    }
  },

  /**
   * 根据 ID 获取简历
   * @param {number|string} id - 简历 ID
   * @returns {Promise<Object>} 简历信息
   */
  getById: async (id) => {
    try {
      const response = await api.get(`/resume/${id}`);
      return response.data;
    } catch (error) {
      console.error('获取简历失败:', error);
      throw error;
    }
  },

  /**
   * 创建简历
   * @param {Object} data - 简历数据
   * @returns {Promise<Object>} 创建后的简历
   */
  create: async (data) => {
    try {
      const response = await api.post('/resume/create', data);
      return response.data;
    } catch (error) {
      console.error('创建简历失败:', error);
      throw error;
    }
  },

  /**
   * 更新简历
   * @param {Object} data - 简历数据
   * @returns {Promise<boolean>} 操作结果
   */
  update: async (data) => {
    try {
      const response = await api.put('/resume/update', data);
      return response.data;
    } catch (error) {
      console.error('更新简历失败:', error);
      throw error;
    }
  },

  /**
   * 删除简历
   * @param {number|string} id - 简历 ID
   * @returns {Promise<boolean>} 操作结果
   */
  delete: async (id) => {
    try {
      const response = await api.delete(`/resume/${id}`);
      return response.data;
    } catch (error) {
      console.error('删除简历失败:', error);
      throw error;
    }
  }
};

// 简历模板 API 服务
export const resumeTemplateApi = {
  /**
   * 获取所有模板列表
   * @returns {Promise<Array>} 模板列表
   */
  list: async () => {
    try {
      const response = await api.get('/resume-template/list');
      return response.data;
    } catch (error) {
      console.error('获取模板列表失败:', error);
      throw error;
    }
  },

  /**
   * 根据 ID 获取模板
   * @param {number|string} id - 模板 ID
   * @returns {Promise<Object>} 模板信息
   */
  getById: async (id) => {
    try {
      const response = await api.get(`/resume-template/${id}`);
      return response.data;
    } catch (error) {
      console.error('获取模板失败:', error);
      throw error;
    }
  }
};

export default api;
