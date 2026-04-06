import api from './api';

export const productService = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  search: (params) => api.get('/products/search', { params }),
};

export const categoryService = {
  getAll: () => api.get('/categories'),
};
