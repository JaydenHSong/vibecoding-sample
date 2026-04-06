// Design Ref: §Stitch _9 — Admin Order Detail
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './AdminPages.css';

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getOrder(id).then((res) => setOrder(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  const handleStatus = async (status) => {
    await adminService.updateOrderStatus(id, status);
    setOrder({ ...order, status });
  };

  if (loading) return <LoadingSpinner />;
  if (!order) return <p style={{ padding: 32, color: 'var(--color-on-surface-variant)' }}>Order not found</p>;

  const statusStyle = (s) => {
    const map = {
      pending: { bg: 'rgba(88,230,255,0.3)', color: '#006573' },
      paid: { bg: 'rgba(88,230,255,0.3)', color: '#006573' },
      shipping: { bg: '#e2e2e2', color: '#4c4546' },
      delivered: { bg: '#d1fae5', color: '#065f46' },
      cancelled: { bg: '#ffdad6', color: '#ba1a1a' },
    };
    return map[s] || map.pending;
  };

  const labelStyle = { fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--color-on-surface-variant)' };
  const st = statusStyle(order.status);

  return (
    <div>
      <h1 className="admin-page-title">Order {order.orderNumber}</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Order Info */}
        <div className="admin-dash__orders" style={{ padding: 32 }}>
          <h3 style={{ ...labelStyle, marginBottom: 16 }}>Order Info</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={labelStyle}>Status</span>
              <span className="admin-dash__status" style={{ background: st.bg, color: st.color }}>{order.status}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={labelStyle}>Total</span>
              <strong>${order.totalAmount?.toLocaleString()}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={labelStyle}>Payment</span>
              <span>{order.paymentMethod}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={labelStyle}>Date</span>
              <span style={{ fontSize: 14 }}>{new Date(order.createdAt).toLocaleString()}</span>
            </div>
          </div>
          <div style={{ marginTop: 24 }}>
            <span style={labelStyle}>Change Status</span>
            <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
              {['pending', 'paid', 'shipping', 'delivered', 'cancelled'].map((s) => (
                <button key={s} className={`admin-btn ${order.status === s ? 'admin-btn--approve' : 'admin-btn--edit'}`} onClick={() => handleStatus(s)}>{s}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Shipping + Customer */}
        <div className="admin-dash__orders" style={{ padding: 32 }}>
          <h3 style={{ ...labelStyle, marginBottom: 16 }}>Shipping</h3>
          <p style={{ fontWeight: 500 }}>{order.shippingAddress?.name}</p>
          <p style={{ color: 'var(--color-on-surface-variant)', fontSize: 14 }}>{order.shippingAddress?.phone}</p>
          <p style={{ color: 'var(--color-on-surface-variant)', fontSize: 14 }}>{order.shippingAddress?.address} {order.shippingAddress?.detail}</p>
          <p style={{ color: 'var(--color-on-surface-variant)', fontSize: 14 }}>ZIP: {order.shippingAddress?.zipCode}</p>
          <h3 style={{ ...labelStyle, marginTop: 24, marginBottom: 12 }}>Customer</h3>
          <p style={{ fontWeight: 500 }}>{order.user?.name} <span style={{ color: 'var(--color-on-surface-variant)', fontWeight: 400 }}>({order.user?.email})</span></p>
        </div>
      </div>

      {/* Items */}
      <div className="admin-dash__orders" style={{ marginTop: 24 }}>
        <h3 style={{ ...labelStyle, padding: '32px 32px 0', marginBottom: 16 }}>Items</h3>
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ paddingLeft: 32 }}>Product</th>
              <th>Option</th>
              <th>Qty</th>
              <th>Price</th>
              <th style={{ textAlign: 'right', paddingRight: 32 }}>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {order.items?.map((item, i) => (
              <tr key={i}>
                <td style={{ paddingLeft: 32, fontWeight: 500 }}>{item.name}</td>
                <td style={{ color: 'var(--color-on-surface-variant)' }}>{item.selectedOption || '—'}</td>
                <td>{item.quantity}</td>
                <td>${item.price?.toLocaleString()}</td>
                <td style={{ textAlign: 'right', paddingRight: 32, fontWeight: 700 }}>${(item.price * item.quantity).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
