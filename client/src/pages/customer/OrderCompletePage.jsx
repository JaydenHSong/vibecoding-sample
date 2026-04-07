import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderService } from '../../services/orderService';
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

  const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="order-complete">
      {/* Thank You Letter */}
      <div className="order-complete__letter">
        <div className="order-complete__letter-header">
          <div className="order-complete__monogram">TG</div>
          <p className="order-complete__date">{orderDate}</p>
        </div>

        <h1 className="order-complete__greeting">Thank You</h1>
        <p className="order-complete__message">
          Dear {order.shippingAddress?.name || 'Valued Customer'},
        </p>
        <p className="order-complete__message">
          We are truly grateful for your order. Each piece in our collection
          is chosen with care, and we take the same care in preparing yours.
          Your items will be thoughtfully packaged and shipped with priority
          — because you deserve nothing less.
        </p>
        <p className="order-complete__message">
          We hope every piece brings you joy.
        </p>
        <p className="order-complete__signature">
          With appreciation,<br />
          <strong>The Curated Gallery Team</strong>
        </p>
      </div>

      {/* Order Details Card */}
      <div className="order-complete__card">
        <div className="order-complete__card-header">
          <span className="material-symbols-outlined order-complete__check">check_circle</span>
          <div>
            <p className="order-complete__confirmed">Order Confirmed</p>
            <p className="order-complete__order-number">{order.orderNumber}</p>
          </div>
        </div>

        {/* Shipping */}
        {order.shippingAddress && (
          <div className="order-complete__section">
            <span className="order-complete__label">Shipping To</span>
            <p className="order-complete__detail">
              {order.shippingAddress.name}<br />
              {order.shippingAddress.address}{order.shippingAddress.detail ? `, ${order.shippingAddress.detail}` : ''}<br />
              {order.shippingAddress.zipCode} &middot; {order.shippingAddress.phone}
            </p>
          </div>
        )}

        {/* Items */}
        <div className="order-complete__section">
          <span className="order-complete__label">Items</span>
          {order.items.map((item, i) => (
            <div key={i} className="order-complete__item">
              <div>
                <span className="order-complete__item-name">{item.name}</span>
                {item.variantOptions && (
                  <span className="order-complete__item-variant">
                    {' '}&middot; {Object.values(
                      item.variantOptions instanceof Map
                        ? Object.fromEntries(item.variantOptions)
                        : item.variantOptions
                    ).join(' / ')}
                  </span>
                )}
                <span className="order-complete__item-qty"> x {item.quantity}</span>
              </div>
              <span className="order-complete__item-price">${(item.price * item.quantity).toLocaleString()}</span>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="order-complete__total">
          <span>Total</span>
          <span>${order.totalAmount.toLocaleString()}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="order-complete__actions">
        <Link to="/mypage" className="order-complete__btn order-complete__btn--outline">View My Orders</Link>
        <Link to="/products" className="order-complete__btn order-complete__btn--primary">Continue Shopping</Link>
      </div>
    </div>
  );
}
