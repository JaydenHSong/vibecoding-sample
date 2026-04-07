import api from './api';

export const adminService = {
  // Dashboard
  getDashboard: () => api.get('/admin/dashboard'),
  getStats: (params) => api.get('/admin/dashboard/stats', { params }),

  // Products
  getProducts: (params) => api.get('/products', { params }),
  createProduct: (data) => api.post('/products', data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/${id}`),
  bulkUpsertVariants: (productId, variants) => api.post(`/admin/products/${productId}/variants`, { variants }),

  // Categories
  createCategory: (data) => api.post('/categories', data),
  updateCategory: (id, data) => api.put(`/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/categories/${id}`),

  // Orders
  getOrders: (params) => api.get('/orders/admin/all', { params }),
  getOrder: (id) => api.get(`/orders/admin/${id}`),
  updateOrderStatus: (id, status) => api.put(`/orders/admin/${id}/status`, { status }),

  // Users
  getUsers: (params) => api.get('/users', { params }),
  getUser: (id) => api.get(`/users/${id}`),

  // Banners
  getBanners: () => api.get('/banners/all'),
  createBanner: (data) => api.post('/banners', data),
  updateBanner: (id, data) => api.put(`/banners/${id}`, data),
  deleteBanner: (id) => api.delete(`/banners/${id}`),

  // Reviews
  getReviews: (params) => api.get('/reviews', { params }),
  approveReview: (id) => api.put(`/reviews/${id}/approve`),
  deleteReview: (id) => api.delete(`/reviews/${id}`),

  // Inquiries
  getInquiries: (params) => api.get('/inquiries/all', { params }),
  answerInquiry: (id, answer) => api.put(`/inquiries/${id}/answer`, { answer }),
};
