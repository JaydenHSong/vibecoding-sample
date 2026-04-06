import api from './api';

export const supportService = {
  getFAQ: (params) => api.get('/faq', { params }),
  createInquiry: (data) => api.post('/inquiries', data),
  getMyInquiries: () => api.get('/inquiries'),
};
