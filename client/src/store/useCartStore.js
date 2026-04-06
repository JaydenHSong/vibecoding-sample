import { create } from 'zustand';
import { cartService } from '../services/cartService';

const useCartStore = create((set, get) => ({
  cart: null,
  loading: false,

  fetchCart: async () => {
    set({ loading: true });
    try {
      const res = await cartService.getCart();
      set({ cart: res.data, loading: false });
    } catch {
      set({ cart: null, loading: false });
    }
  },

  addItem: async (data) => {
    const res = await cartService.addItem(data);
    set({ cart: res.data });
  },

  updateItem: async (itemId, quantity) => {
    const res = await cartService.updateItem(itemId, { quantity });
    set({ cart: res.data });
  },

  removeItem: async (itemId) => {
    const res = await cartService.removeItem(itemId);
    set({ cart: res.data });
  },

  clearCart: () => set({ cart: null }),

  get itemCount() {
    return get().cart?.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;
  },

  get totalAmount() {
    return get().cart?.items?.reduce((sum, i) => sum + (i.product?.price || 0) * i.quantity, 0) || 0;
  },
}));

export default useCartStore;
