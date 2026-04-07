import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useCartStore from '../../store/useCartStore';
import useAuthStore from '../../store/useAuthStore';
import { orderService } from '../../services/orderService';
import { userService } from '../../services/userService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './CheckoutPage.css';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { cart, fetchCart, clearCart } = useCartStore();
  const [addresses, setAddresses] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    detail: '',
    zipCode: '',
    paymentMethod: 'card',
  });

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchCart();
    userService.getAddresses().then((res) => {
      setAddresses(res.data || []);
      const def = res.data?.find((a) => a.isDefault);
      if (def) setForm((f) => ({ ...f, name: def.label, address: def.address, detail: def.detail || '', zipCode: def.zipCode }));
    }).catch(() => {});
  }, [user]);

  const items = cart?.items || [];
  const totalAmount = items.reduce((sum, i) => sum + (i.variant?.price || i.product?.price || 0) * i.quantity, 0);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSelectAddress = (addr) => {
    setForm({ ...form, name: addr.label, address: addr.address, detail: addr.detail || '', zipCode: addr.zipCode });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.address || !form.zipCode) {
      setError('Please fill in all required shipping fields');
      return;
    }
    if (items.length === 0) {
      setError('Your cart is empty');
      return;
    }

    setSubmitting(true);
    try {
      const res = await orderService.create({
        shippingAddress: { name: form.name, phone: form.phone, address: form.address, detail: form.detail, zipCode: form.zipCode },
        paymentMethod: form.paymentMethod,
      });
      clearCart();
      navigate(`/order-complete/${res.data._id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Order failed. Please try again.');
      setSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="checkout-page">
      <header style={{ marginBottom: 48 }}>
        <span className="label-sm" style={{ display: 'block', marginBottom: 16 }}>Secure Checkout</span>
        <h1 className="checkout-page__title serif" style={{ fontStyle: 'italic', fontWeight: 300 }}>Completion</h1>
      </header>

      {error && <div className="auth-page__error">{error}</div>}

      <form onSubmit={handleSubmit} className="checkout-page__layout">
        <div className="checkout-page__form">
          {/* Saved addresses */}
          {addresses.length > 0 && (
            <div className="checkout-page__section">
              <h3 className="auth-page__label">Saved Addresses</h3>
              <div className="checkout-page__addresses">
                {addresses.map((a) => (
                  <button key={a._id} type="button" className={`checkout-page__addr-btn ${form.address === a.address ? 'active' : ''}`} onClick={() => handleSelectAddress(a)}>
                    <strong>{a.label}</strong>
                    <span>{a.address}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Shipping */}
          <div className="checkout-page__section">
            <h3 className="label-sm">Shipping Address</h3>
            <div className="checkout-page__fields">
              <div className="auth-page__field">
                <label className="label-sm">Recipient Name *</label>
                <input name="name" value={form.name} onChange={handleChange} placeholder="Full name" />
              </div>
              <div className="auth-page__field">
                <label className="label-sm">Phone *</label>
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="(555) 123-4567" />
              </div>
              <div className="auth-page__field">
                <label className="label-sm">Address *</label>
                <input name="address" value={form.address} onChange={handleChange} placeholder="Street address" />
              </div>
              <div className="auth-page__field">
                <label className="label-sm">Apt / Suite</label>
                <input name="detail" value={form.detail} onChange={handleChange} placeholder="Apartment, suite, etc." />
              </div>
              <div className="auth-page__field">
                <label className="label-sm">ZIP Code *</label>
                <input name="zipCode" value={form.zipCode} onChange={handleChange} placeholder="90001" />
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="checkout-page__section">
            <h3 className="label-sm">Payment Method</h3>
            <div className="checkout-page__payment">
              {[{ value: 'card', label: 'Credit Card' }, { value: 'bank', label: 'Bank Transfer' }, { value: 'virtual', label: 'Virtual Account' }].map((m) => (
                <label key={m.value} className={`checkout-page__payment-option ${form.paymentMethod === m.value ? 'active' : ''}`}>
                  <input type="radio" name="paymentMethod" value={m.value} checked={form.paymentMethod === m.value} onChange={handleChange} />
                  {m.label}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="checkout-page__summary">
          <h3>Order Summary</h3>
          {items.map((item) => (
            <div key={item._id} className="checkout-page__item">
              <span>{item.product?.name} x {item.quantity}</span>
              <span>${((item.variant?.price || item.product?.price) * item.quantity).toLocaleString()}</span>
            </div>
          ))}
          <div className="checkout-page__item" style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(0,0,0,0.1)', fontWeight: 900, color: 'var(--color-on-surface)', fontSize: 18 }}>
            <span>Total</span>
            <span>${totalAmount.toLocaleString()}</span>
          </div>
          <button type="submit" className="auth-page__submit" style={{ marginTop: 24 }} disabled={submitting}>
            {submitting ? 'Processing...' : `Pay $${totalAmount.toLocaleString()}`}
          </button>
        </div>
      </form>
    </div>
  );
}
