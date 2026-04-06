import api from './api';

export const reviewService = {
  getByProduct: (productId, params) => api.get(`/reviews/product/${productId}`, { params }),
  create: (data) => api.post('/reviews', data),
};
