import { authAPI as mockAuth, projectAPI as mockProject, taskAPI as mockTask, commentAPI as mockComment } from './mock-api';
import axios from 'axios';

const useMock = process.env.REACT_APP_USE_MOCK === 'true' || (
  typeof window !== 'undefined' && (
    window.location.hostname.includes('github.io') ||
    window.location.hostname.includes('vercel.app') ||
    window.location.hostname.includes('netlify.app')
  )
);

let authAPI, projectAPI, taskAPI, commentAPI;

if (useMock) {
  authAPI = mockAuth;
  projectAPI = mockProject;
  taskAPI = mockTask;
  commentAPI = mockComment;
} else {
  const API = axios.create({ baseURL: process.env.REACT_APP_API_URL || '/api' });

  API.interceptors.request.use((req) => {
    try {
      const parsed = JSON.parse(localStorage.getItem('user') || '{}');
      if (parsed.token) req.headers.Authorization = `Bearer ${parsed.token}`;
    } catch {}
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

  authAPI = {
    register: (data) => API.post('/auth/register', data),
    login: (data) => API.post('/auth/login', data),
    getMe: () => API.get('/auth/me'),
    updateProfile: (data) => API.put('/auth/profile', data),
    searchUsers: (query) => API.get('/auth/search', { params: { q: query } }),
  };

  projectAPI = {
    create: (data) => API.post('/projects', data),
    getAll: () => API.get('/projects'),
    getOne: (id) => API.get(`/projects/${id}`),
    update: (id, data) => API.put(`/projects/${id}`, data),
    delete: (id) => API.delete(`/projects/${id}`),
    addMember: (id, userId) => API.post(`/projects/${id}/members`, { userId }),
    removeMember: (id, memberId) => API.delete(`/projects/${id}/members/${memberId}`),
  };

  taskAPI = {
    getByProject: (projectId) => API.get(`/tasks/project/${projectId}`),
    create: (projectId, data) => API.post(`/tasks/project/${projectId}`, data),
    getOne: (id) => API.get(`/tasks/${id}`),
    update: (id, data) => API.put(`/tasks/${id}`, data),
    delete: (id) => API.delete(`/tasks/${id}`),
    reorder: (tasks) => API.put('/tasks/reorder', { tasks }),
  };

  commentAPI = {
    getByTask: (taskId) => API.get(`/comments/task/${taskId}`),
    create: (taskId, message) => API.post(`/comments/task/${taskId}`, { message }),
    delete: (id) => API.delete(`/comments/${id}`),
  };
}

export { authAPI, projectAPI, taskAPI, commentAPI };
