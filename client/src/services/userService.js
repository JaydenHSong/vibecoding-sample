import api from './api';

export const userService = {
  getMe: () => api.get('/users/me'),
  updateMe: (data) => api.put('/users/me', data),
  getWishlist: () => api.get('/users/me/wishlist'),
  toggleWishlist: (productId) => api.post(`/users/me/wishlist/${productId}`),
  getAddresses: () => api.get('/users/me/addresses'),
  addAddress: (data) => api.post('/users/me/addresses', data),
  updateAddress: (id, data) => api.put(`/users/me/addresses/${id}`, data),
  deleteAddress: (id) => api.delete(`/users/me/addresses/${id}`),
};
