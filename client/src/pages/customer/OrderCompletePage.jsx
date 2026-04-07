import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import OrderStatusBadge from '../../components/order/OrderStatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './OrderCompletePage.css';

export default function OrderCompletePage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService.getById(id)
      .then((res) => setOrder(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!order) return <p style={{ textAlign: 'center', padding: '96px 0' }}>Order not found</p>;

  return (
    <div className="order-complete">
      <div className="order-complete__header">
        <span className="material-symbols-outlined" style={{ fontSize: 56, color: 'var(--color-secondary)' }}>check_circle</span>
        <h1 className="order-complete__title">Order Confirmed</h1>
        <p className="order-complete__subtitle">Thank you for your purchase at The Gallery.</p>
      </div>

      <div className="order-complete__card">
        <div className="order-complete__row">
          <span className="order-complete__label">Order Number</span>
          <strong>{order.orderNumber}</strong>
        </div>
        <div className="order-complete__row">
          <span className="order-complete__label">Status</span>
          <OrderStatusBadge status={order.status} />
        </div>
        <div className="order-complete__row">
          <span className="order-complete__label">Payment</span>
          <span>{order.paymentMethod === 'card' ? 'Credit Card' : order.paymentMethod === 'bank' ? 'Bank Transfer' : 'Virtual Account'}</span>
        </div>

        {order.shippingAddress && (
          <div className="order-complete__shipping">
            <span className="order-complete__label" style={{ display: 'block', marginBottom: 8 }}>Shipping Address</span>
            <p style={{ lineHeight: 1.6, fontSize: 14 }}>
              <strong>{order.shippingAddress.name}</strong><br />
              {order.shippingAddress.address}{order.shippingAddress.detail ? `, ${order.shippingAddress.detail}` : ''}<br />
              {order.shippingAddress.zipCode}<br />
              {order.shippingAddress.phone}
            </p>
          </div>
        )}

        <div className="order-complete__items">
          <span className="order-complete__label" style={{ display: 'block', marginBottom: 16 }}>Items</span>
          {order.items.map((item, i) => (
            <div key={i} className="order-complete__item">
              <span>{item.name} x {item.quantity}</span>
              <span>${(item.price * item.quantity).toLocaleString()}</span>
            </div>
          ))}
        </div>

        <div className="order-complete__total">
          <span>Total</span>
          <span>${order.totalAmount.toLocaleString()}</span>
        </div>
      </div>

      <div className="order-complete__actions">
        <Link to="/mypage" className="btn-secondary">View My Orders</Link>
        <Link to="/products" className="btn-primary">Continue Shopping</Link>
      </div>
    </div>
  );
}
