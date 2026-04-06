import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useCartStore from '../../store/useCartStore';
import useAuthStore from '../../store/useAuthStore';
import CartItem from '../../components/order/CartItem';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './CartPage.css';

export default function CartPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { cart, loading, fetchCart, updateItem, removeItem } = useCartStore();

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchCart();
  }, [user]);

  if (!user) return null;
  if (loading) return <LoadingSpinner />;

  const items = cart?.items || [];
  const totalAmount = items.reduce((sum, i) => sum + (i.product?.price || 0) * i.quantity, 0);

  return (
    <div className="cart-page">
      {/* Editorial Header */}
      <header className="cart-page__header">
        <div>
          <span className="label-sm">Selection / {String(items.length).padStart(2, '0')} Items</span>
          <h1 className="cart-page__title">Your Bag</h1>
        </div>
        <p className="cart-page__desc">
          Review your curated selection. Pieces are held for a limited time during high-demand periods.
        </p>
      </header>

      {items.length === 0 ? (
        <div className="cart-page__empty">
          <span className="material-symbols-outlined" style={{ fontSize: 48, opacity: 0.2 }}>shopping_bag</span>
          <p>Your bag is empty</p>
          <Link to="/products" className="btn-primary">Continue Shopping</Link>
        </div>
      ) : (
        <div className="cart-page__layout">
          <div className="cart-page__items">
            {items.map((item) => (
              <CartItem key={item._id} item={item} onUpdate={updateItem} onRemove={removeItem} />
            ))}
          </div>

          <aside className="cart-page__summary">
            <div className="cart-page__summary-inner">
              <h3 className="cart-page__summary-title">Summary</h3>
              <div className="cart-page__row">
                <span>Subtotal</span>
                <span>${totalAmount.toLocaleString()}</span>
              </div>
              <div className="cart-page__row">
                <span>Shipping</span>
                <span>Complimentary</span>
              </div>
              <div className="cart-page__row cart-page__row--total">
                <span>Total</span>
                <span className="cart-page__total-amount">${totalAmount.toLocaleString()}</span>
              </div>
              <Link to="/checkout" className="cart-page__checkout-btn">
                Continue to Checkout
              </Link>
              <Link to="/products" className="cart-page__continue">
                Continue Browsing
              </Link>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
