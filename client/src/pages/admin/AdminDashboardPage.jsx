// Design Ref: §Stitch _9 — Admin Dashboard (summary cards, chart, inquiries, orders table)
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './AdminPages.css';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [chartPeriod, setChartPeriod] = useState('7d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminService.getDashboard(),
      adminService.getOrders({ page: 1, limit: 4 }),
      adminService.getStats({ period: '7d' }),
      adminService.getInquiries({ page: 1, limit: 3 }),
    ]).then(([dashRes, ordRes, statsRes, inqRes]) => {
      setData(dashRes.data);
      setRecentOrders(ordRes.data.data || []);
      setChartData(statsRes.data.revenueByDate || []);
      setInquiries(inqRes.data.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handlePeriodChange = (period) => {
    setChartPeriod(period);
    adminService.getStats({ period }).then((res) => {
      setChartData(res.data.revenueByDate || []);
    }).catch(() => {});
  };

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
            <span className="admin-dash__badge admin-dash__badge--secondary">Today</span>
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
              <p className="admin-dash__section-sub">Revenue performance over the last {chartPeriod === '7d' ? '7 days' : '30 days'}</p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className={`admin-dash__tab ${chartPeriod === '7d' ? 'admin-dash__tab--active' : ''}`} onClick={() => handlePeriodChange('7d')}>Week</button>
              <button className={`admin-dash__tab ${chartPeriod === '30d' ? 'admin-dash__tab--active' : ''}`} onClick={() => handlePeriodChange('30d')}>Month</button>
            </div>
          </div>
          <div className="admin-dash__bars">
            {(() => {
              const maxRev = Math.max(...chartData.map((d) => d.revenue), 1);
              return chartData.map((d, i) => {
                const label = chartPeriod === '7d'
                  ? ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][new Date(d._id + 'T00:00:00').getUTCDay()]
                  : d._id.slice(5);
                const pct = (d.revenue / maxRev) * 100;
                return (
                  <div key={d._id} className="admin-dash__bar-col">
                    <div className="admin-dash__bar-track" style={{ height: 224 }}>
                      <div
                        className="admin-dash__bar-fill"
                        style={{
                          height: `${pct}%`,
                          background: i === chartData.length - 1 ? 'var(--color-primary)' : 'var(--color-secondary)',
                        }}
                      />
                    </div>
                    <span className="admin-dash__bar-label">{label}</span>
                  </div>
                );
              });
            })()}
            {chartData.length === 0 && (
              <p style={{ color: 'var(--color-on-surface-variant)', fontSize: 14, margin: 'auto' }}>No sales data yet</p>
            )}
          </div>
        </div>

        {/* Recent Inquiries */}
        <div className="admin-dash__inquiries">
          <h4 className="admin-dash__section-title">Recent Inquiries</h4>
          <div className="admin-dash__inquiry-list">
            {inquiries.length === 0 ? (
              <p style={{ color: 'var(--color-on-surface-variant)', fontSize: 14 }}>No inquiries yet</p>
            ) : inquiries.map((inq) => (
              <div key={inq._id} className="admin-dash__inquiry">
                <div className={`admin-dash__inquiry-icon ${!inq.answer ? 'admin-dash__inquiry-icon--primary' : ''}`}>
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                    {!inq.answer ? 'mail' : 'mark_email_read'}
                  </span>
                </div>
                <div>
                  <p className="admin-dash__inquiry-title">{inq.title}</p>
                  <p className="admin-dash__inquiry-text">"{inq.content?.slice(0, 80)}{inq.content?.length > 80 ? '...' : ''}"</p>
                  {!inq.answer ? (
                    <p className="admin-dash__inquiry-action">Respond Now</p>
                  ) : (
                    <p className="admin-dash__inquiry-time">{new Date(inq.createdAt).toLocaleDateString()}</p>
                  )}
                </div>
              </div>
            ))}
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
