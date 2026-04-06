import api from './api';

export const bannerService = {
  getActive: (position) => api.get('/banners', { params: { position } }),
};
