import { create } from 'zustand';
import { authService } from '../services/authService';

const useAuthStore = create((set) => ({
  user: (() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } })(),
  token: localStorage.getItem('token'),
  loading: false,
  error: null,

  register: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await authService.register(data);
      const { user, token } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, token, loading: false });
      return true;
    } catch (err) {
      const msg = err.response?.data?.error || (err.message === 'Network Error' ? 'Cannot connect to server. Is the server running?' : 'Registration failed');
      set({ error: msg, loading: false });
      return false;
    }
  },

  login: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await authService.login(data);
      const { user, token } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, token, loading: false });
      return true;
    } catch (err) {
      const msg = err.response?.data?.error || (err.message === 'Network Error' ? 'Cannot connect to server. Is the server running?' : 'Login failed');
      set({ error: msg, loading: false });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null });
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
