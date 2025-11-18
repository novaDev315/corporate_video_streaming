import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: any) => api.post('/auth/register', data),
  getCurrentUser: () => api.get('/users/me'),
};

// Videos API
export const videosApi = {
  getAll: (params?: any) => api.get('/videos', { params }),
  getById: (id: string) => api.get(`/videos/${id}`),
  create: (data: any) => api.post('/videos', data),
  update: (id: string, data: any) => api.put(`/videos/${id}`, data),
  delete: (id: string) => api.delete(`/videos/${id}`),
  process: (id: string) => api.post(`/videos/${id}/process`),
  trackView: (id: string, data: any) => api.post(`/videos/${id}/track`, data),
};

// Streams API
export const streamsApi = {
  getAll: () => api.get('/streams'),
  getById: (id: string) => api.get(`/streams/${id}`),
  create: (data: any) => api.post('/streams', data),
  start: (id: string) => api.put(`/streams/${id}/start`),
  end: (id: string) => api.put(`/streams/${id}/end`),
  delete: (id: string) => api.delete(`/streams/${id}`),
};

// Upload API
export const uploadApi = {
  getPresignedUrl: (fileName: string, fileType: string) =>
    api.post('/upload/presigned-url', { fileName, fileType }),
  completeUpload: (videoId: string, s3Key: string) =>
    api.post('/upload/complete', { videoId, s3Key }),
};

// Analytics API
export const analyticsApi = {
  getVideoAnalytics: (videoId: string) =>
    api.get(`/analytics/videos/${videoId}`),
  getOrgAnalytics: (orgId: string, params?: any) =>
    api.get(`/analytics/organization/${orgId}`, { params }),
  getUserAnalytics: (userId: string) => api.get(`/analytics/users/${userId}`),
};
