// Design Ref: §Stitch _9 — Admin Dashboard (summary cards, chart, inquiries, orders table)
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './AdminPages.css';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const BAR_HEIGHTS = [96, 128, 192, 160, 224, 112, 144]; // Stitch visual heights

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminService.getDashboard(),
      adminService.getOrders({ page: 1, limit: 4 }),
    ]).then(([dashRes, ordRes]) => {
      setData(dashRes.data);
      setRecentOrders(ordRes.data.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const initials = (name) =>
    name ? name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2) : '??';

  const statusStyle = (status) => {
    const map = {
      pending: { bg: 'rgba(88,230,255,0.3)', color: '#006573' },
      paid: { bg: 'rgba(88,230,255,0.3)', color: '#006573' },
      shipping: { bg: '#e2e2e2', color: '#4c4546' },
      delivered: { bg: '#d1fae5', color: '#065f46' },
      cancelled: { bg: '#ffdad6', color: '#ba1a1a' },
    };
    return map[status] || map.pending;
  };

  return (
    <div className="admin-dash">
      {/* Summary Grid — 3 columns */}
      <div className="admin-dash__summary">
        <div className="admin-dash__card admin-dash__card--secondary">
          <div className="admin-dash__card-top">
            <span className="material-symbols-outlined" style={{ fontSize: 28, color: 'var(--color-secondary)' }}>trending_up</span>
            <span className="admin-dash__badge admin-dash__badge--secondary">+12.5%</span>
          </div>
          <p className="admin-dash__card-label">Today's Sales</p>
          <h3 className="admin-dash__card-value">${(data?.revenue?.today || 0).toLocaleString()}.00</h3>
        </div>
        <div className="admin-dash__card admin-dash__card--primary">
          <div className="admin-dash__card-top">
            <span className="material-symbols-outlined" style={{ fontSize: 28, color: 'var(--color-primary)' }}>shopping_bag</span>
            <span className="admin-dash__badge">+{data?.orders?.today || 0}</span>
          </div>
          <p className="admin-dash__card-label">New Orders</p>
          <h3 className="admin-dash__card-value">{data?.orders?.total || 0}</h3>
        </div>
        <div className="admin-dash__card admin-dash__card--outline">
          <div className="admin-dash__card-top">
            <span className="material-symbols-outlined" style={{ fontSize: 28, color: 'var(--color-on-surface-variant)' }}>person_add</span>
            <span className="admin-dash__badge">+{data?.users?.newToday || 0}</span>
          </div>
          <p className="admin-dash__card-label">New Members</p>
          <h3 className="admin-dash__card-value">{data?.users?.total || 0}</h3>
        </div>
      </div>

      {/* Main: Chart + Inquiries */}
      <div className="admin-dash__main">
        {/* Revenue Chart */}
        <div className="admin-dash__chart-card">
          <div className="admin-dash__chart-header">
            <div>
              <h4 className="admin-dash__section-title">Sales Statistics</h4>
              <p className="admin-dash__section-sub">Revenue performance over the last 7 days</p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="admin-dash__tab admin-dash__tab--active">Week</button>
              <button className="admin-dash__tab">Month</button>
            </div>
          </div>
          <div className="admin-dash__bars">
            {DAYS.map((day, i) => (
              <div key={day} className="admin-dash__bar-col">
                <div className="admin-dash__bar-track" style={{ height: BAR_HEIGHTS[i] }}>
                  <div
                    className="admin-dash__bar-fill"
                    style={{
                      height: `${40 + Math.random() * 50}%`,
                      background: i === 3 ? 'var(--color-primary)' : 'var(--color-secondary)',
                    }}
                  />
                </div>
                <span className="admin-dash__bar-label">{day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Inquiries */}
        <div className="admin-dash__inquiries">
          <h4 className="admin-dash__section-title">Recent Inquiries</h4>
          <div className="admin-dash__inquiry-list">
            <div className="admin-dash__inquiry">
              <div className="admin-dash__inquiry-icon admin-dash__inquiry-icon--primary">
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>mail</span>
              </div>
              <div>
                <p className="admin-dash__inquiry-title">Custom Order Request</p>
                <p className="admin-dash__inquiry-text">"Is the 'Nordic Dusk' series available in a larger format?"</p>
                <p className="admin-dash__inquiry-action">Respond Now</p>
              </div>
            </div>
            <div className="admin-dash__inquiry">
              <div className="admin-dash__inquiry-icon">
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>rate_review</span>
              </div>
              <div>
                <p className="admin-dash__inquiry-title">New 5-Star Review</p>
                <p className="admin-dash__inquiry-text">"Exceptional quality and the packaging felt like an event itself."</p>
                <p className="admin-dash__inquiry-time">2 hours ago</p>
              </div>
            </div>
            <div className="admin-dash__inquiry">
              <div className="admin-dash__inquiry-icon">
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>person</span>
              </div>
              <div>
                <p className="admin-dash__inquiry-title">New VIP Application</p>
                <p className="admin-dash__inquiry-text">Sarah Jenkins applied for Collector Tier status.</p>
                <p className="admin-dash__inquiry-time">5 hours ago</p>
              </div>
            </div>
          </div>
          <button className="admin-dash__view-all" onClick={() => navigate('/admin/inquiries')}>
            View All Activity
          </button>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="admin-dash__orders">
        <div className="admin-dash__orders-header">
          <h4 className="admin-dash__section-title">Recent Orders</h4>
          <button className="admin-dash__orders-link" onClick={() => navigate('/admin/orders')}>View All Orders</button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Product</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
                <th style={{ textAlign: 'center' }}>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o) => {
                const st = statusStyle(o.status);
                return (
                  <tr key={o._id} className="admin-table__row--hover" onClick={() => navigate(`/admin/orders/${o._id}`)}>
                    <td className="admin-dash__order-id">{o.orderNumber}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div className="admin-dash__avatar-sm">{initials(o.user?.name)}</div>
                        <span style={{ fontSize: 14, fontWeight: 500 }}>{o.user?.name || '—'}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: 14, color: 'var(--color-on-surface-variant)' }}>
                      {o.items?.[0]?.name || '—'}
                    </td>
                    <td style={{ fontSize: 14, fontWeight: 700, textAlign: 'right' }}>
                      ${o.totalAmount?.toLocaleString()}.00
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span
                        className="admin-dash__status"
                        style={{ background: st.bg, color: st.color }}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className="material-symbols-outlined" style={{ color: 'var(--color-on-surface-variant)', cursor: 'pointer', fontSize: 20 }}>more_vert</span>
                    </td>
                  </tr>
                );
              })}
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: 'var(--color-on-surface-variant)', padding: 32 }}>
                    No orders yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
