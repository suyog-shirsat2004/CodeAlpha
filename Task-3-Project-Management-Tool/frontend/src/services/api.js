import axios from 'axios';

const API = axios.create({ baseURL: process.env.REACT_APP_API_URL || '/api' });

API.interceptors.request.use((req) => {
  const user = localStorage.getItem('user');
  if (user) {
    const parsed = JSON.parse(user);
    if (parsed.token) {
      req.headers.Authorization = `Bearer ${parsed.token}`;
    }
  }
  return req;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/profile', data),
  searchUsers: (query) => API.get(`/auth/search?q=${query}`),
};

export const projectAPI = {
  create: (data) => API.post('/projects', data),
  getAll: () => API.get('/projects'),
  getOne: (id) => API.get(`/projects/${id}`),
  update: (id, data) => API.put(`/projects/${id}`, data),
  delete: (id) => API.delete(`/projects/${id}`),
  addMember: (id, userId) => API.post(`/projects/${id}/members`, { userId }),
  removeMember: (id, memberId) => API.delete(`/projects/${id}/members/${memberId}`),
};

export const taskAPI = {
  getByProject: (projectId) => API.get(`/tasks/project/${projectId}`),
  create: (projectId, data) => API.post(`/tasks/project/${projectId}`, data),
  getOne: (id) => API.get(`/tasks/${id}`),
  update: (id, data) => API.put(`/tasks/${id}`, data),
  delete: (id) => API.delete(`/tasks/${id}`),
  reorder: (tasks) => API.put('/tasks/reorder', { tasks }),
};

export const commentAPI = {
  getByTask: (taskId) => API.get(`/comments/task/${taskId}`),
  create: (taskId, message) => API.post(`/comments/task/${taskId}`, { message }),
  delete: (id) => API.delete(`/comments/${id}`),
};

export default API;
