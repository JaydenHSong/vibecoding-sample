import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import useCartStore from '../../store/useCartStore';
import useAuthStore from '../../store/useAuthStore';
import { orderService } from '../../services/orderService';
import { userService } from '../../services/userService';
import StripeCardForm from '../../components/checkout/StripeCardForm';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './CheckoutPage.css';

let stripePromise = null;

export default function CheckoutPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { cart, fetchCart, clearCart } = useCartStore();
  const [addresses, setAddresses] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [activeStep, setActiveStep] = useState(1); // 1: shipping, 2: payment
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    detail: '',
    zipCode: '',
  });

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchCart();
    orderService.getPaymentConfig().then((res) => {
      stripePromise = loadStripe(res.data.publishableKey);
    }).catch(() => {});
    userService.getAddresses().then((res) => {
      setAddresses(res.data || []);
      const def = res.data?.find((a) => a.isDefault);
      if (def) setForm((f) => ({ ...f, name: def.label, address: def.address, detail: def.detail || '', zipCode: def.zipCode }));
    }).catch(() => {});
  }, [user]);

  const items = cart?.items || [];
  const totalAmount = items.reduce((sum, i) => sum + (i.variant?.price || i.product?.price || 0) * i.quantity, 0);

  // Create PaymentIntent when cart is ready
  useEffect(() => {
    if (totalAmount > 0 && !clientSecret) {
      orderService.createPaymentIntent(totalAmount * 100)
        .then((res) => setClientSecret(res.data.clientSecret))
        .catch(() => {});
    }
  }, [totalAmount]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSelectAddress = (addr) => {
    setForm({ ...form, name: addr.label, address: addr.address, detail: addr.detail || '', zipCode: addr.zipCode });
  };

  const handleContinueToPayment = () => {
    if (!form.name || !form.phone || !form.address || !form.zipCode) {
      setError('Please fill in all required shipping fields');
      return;
    }
    setError('');
    setActiveStep(2);
  };

  const handlePaymentSuccess = async (paymentIntentId) => {
    try {
      const res = await orderService.create({
        shippingAddress: { name: form.name, phone: form.phone, address: form.address, detail: form.detail, zipCode: form.zipCode },
        paymentMethod: 'card',
        paymentIntentId,
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
      <header className="checkout-page__header">
        <div className="checkout-page__header-label">
          <span className="label-sm">Secure Checkout</span>
          <div className="checkout-page__divider" />
        </div>
        <h1 className="checkout-page__title">COMPLETION</h1>
      </header>

      {error && <div className="auth-page__error">{error}</div>}

      <div className="checkout-page__layout">
        {/* Left: Accordion Form */}
        <div className="checkout-page__form">
          {/* Saved addresses */}
          {addresses.length > 0 && activeStep === 1 && (
            <div style={{ marginBottom: -32 }}>
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

          {/* Step 1: Shipping */}
          <section className={`checkout-page__accordion ${activeStep >= 1 ? 'checkout-page__accordion--active' : ''}`}>
            <button
              type="button"
              className="checkout-page__accordion-header"
              onClick={() => setActiveStep(1)}
            >
              <div className="checkout-page__accordion-left">
                <span className={`checkout-page__step-number ${activeStep > 1 ? 'checkout-page__step-number--done' : ''}`}>
                  {activeStep > 1 ? (<span className="material-symbols-outlined" style={{ fontSize: 16 }}>check</span>) : '1'}
                </span>
                <h2 className="checkout-page__section-title">Shipping Information</h2>
              </div>
              {activeStep > 1 && (
                <span className="checkout-page__accordion-edit">Edit</span>
              )}
            </button>

            {activeStep === 1 && (
              <div className="checkout-page__accordion-body">
                <div className="checkout-page__fields checkout-page__fields--grid">
                  <div className="auth-page__field">
                    <label className="label-sm">Recipient Name *</label>
                    <input name="name" value={form.name} onChange={handleChange} placeholder="Full name" />
                  </div>
                  <div className="auth-page__field">
                    <label className="label-sm">Phone *</label>
                    <input name="phone" value={form.phone} onChange={handleChange} placeholder="(555) 123-4567" />
                  </div>
                  <div className="auth-page__field checkout-page__field--full">
                    <label className="label-sm">Street Address *</label>
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
                <button type="button" className="checkout-page__continue-btn" onClick={handleContinueToPayment}>
                  Continue to Payment
                </button>
              </div>
            )}

            {activeStep > 1 && (
              <div className="checkout-page__accordion-summary">
                <p>{form.name} &middot; {form.phone}</p>
                <p>{form.address}{form.detail ? `, ${form.detail}` : ''} &middot; {form.zipCode}</p>
              </div>
            )}
          </section>

          {/* Step 2: Payment */}
          <section className={`checkout-page__accordion ${activeStep >= 2 ? 'checkout-page__accordion--active' : ''}`}>
            <div className="checkout-page__accordion-header">
              <div className="checkout-page__accordion-left">
                <span className="checkout-page__step-number">2</span>
                <h2 className="checkout-page__section-title">Payment Method</h2>
              </div>
            </div>

            {activeStep === 2 && (
              <div className="checkout-page__accordion-body">
                {clientSecret && stripePromise ? (
                  <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe', variables: { fontFamily: 'Inter, sans-serif', borderRadius: '2px' } } }}>
                    <StripeCardForm
                      onSuccess={handlePaymentSuccess}
                      onError={(msg) => setError(msg)}
                      submitting={submitting}
                      setSubmitting={setSubmitting}
                    />
                  </Elements>
                ) : (
                  <div className="checkout-page__loading-payment">
                    <LoadingSpinner />
                  </div>
                )}
              </div>
            )}
          </section>
        </div>

        {/* Right: Summary */}
        <div className="checkout-page__sidebar">
          <div className="checkout-page__summary">
            <div className="checkout-page__section-header" style={{ marginBottom: 24 }}>
              <h2 className="checkout-page__section-title">Order Summary</h2>
            </div>

            <div className="checkout-page__product-list">
              {items.map((item) => (
                <div key={item._id} className="checkout-page__product">
                  {item.product?.images?.[0] && (
                    <div className="checkout-page__product-img">
                      <img src={item.product.images[0]} alt={item.product.name} />
                    </div>
                  )}
                  <div className="checkout-page__product-info">
                    <div>
                      <p className="checkout-page__product-name">{item.product?.name}</p>
                      {item.variant?.options && (
                        <p className="checkout-page__product-variant">
                          {Object.values(item.variant.options).join(' / ')}
                        </p>
                      )}
                    </div>
                    <div className="checkout-page__product-bottom">
                      <span className="checkout-page__product-qty">Qty: {String(item.quantity).padStart(2, '0')}</span>
                      <span className="checkout-page__product-price">${((item.variant?.price || item.product?.price) * item.quantity).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="checkout-page__totals">
              <div className="checkout-page__total-row">
                <span>Subtotal</span>
                <span className="checkout-page__total-value">${totalAmount.toLocaleString()}</span>
              </div>
              <div className="checkout-page__total-row">
                <span>Shipping</span>
                <span className="checkout-page__total-free">Complimentary</span>
              </div>
              <div className="checkout-page__total-row checkout-page__total-row--final">
                <span>Total</span>
                <span className="checkout-page__total-grand">${totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>
          <div className="checkout-page__security">
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>verified_user</span>
            <p>Encrypted Transaction. Secure processing via Stripe.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
