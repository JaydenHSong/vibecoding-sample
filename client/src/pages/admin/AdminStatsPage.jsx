// Design Ref: §Stitch _9 — Admin Sales & Statistics
import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './AdminPages.css';

export default function AdminStatsPage() {
  const [period, setPeriod] = useState('7d');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    adminService.getStats({ period })
      .then((res) => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [period]);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="admin-toolbar">
        <h1 className="admin-page-title" style={{ marginBottom: 0 }}>Sales & Statistics</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          {['7d', '30d', '90d'].map((p) => (
            <button key={p} className={`admin-btn ${period === p ? 'admin-btn--approve' : 'admin-btn--edit'}`} onClick={() => setPeriod(p)}>
              {p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="admin-dash__chart-card" style={{ marginBottom: 32 }}>
        <h4 className="admin-dash__section-title" style={{ marginBottom: 24 }}>Revenue by Date</h4>
        {stats?.revenueByDate?.length ? (
          <div className="admin-dash__bars" style={{ height: 200 }}>
            {stats.revenueByDate.map((d) => {
              const max = Math.max(...stats.revenueByDate.map((r) => r.revenue));
              const pct = max > 0 ? (d.revenue / max) * 100 : 0;
              return (
                <div key={d._id} className="admin-dash__bar-col">
                  <div className="admin-dash__bar-track" style={{ height: '100%' }}>
                    <div className="admin-dash__bar-fill" style={{ height: `${pct}%`, background: 'var(--color-secondary)' }} />
                  </div>
                  <span className="admin-dash__bar-label">{d._id.slice(5)}</span>
                </div>
              );
            })}
          </div>
        ) : <p style={{ color: 'var(--color-on-surface-variant)', fontSize: 14 }}>No data for this period.</p>}
      </div>

      {/* Top Products */}
      <div className="admin-dash__orders" style={{ marginBottom: 32 }}>
        <h4 className="admin-dash__section-title" style={{ padding: 32, paddingBottom: 0, marginBottom: 24 }}>Top Selling Products</h4>
        {stats?.topProducts?.length ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ paddingLeft: 32 }}>#</th>
                <th>Product</th>
                <th>Sold</th>
                <th style={{ paddingRight: 32, textAlign: 'right' }}>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {stats.topProducts.map((p, i) => (
                <tr key={p._id}>
                  <td style={{ paddingLeft: 32, fontWeight: 700 }}>{i + 1}</td>
                  <td style={{ fontWeight: 500 }}>{p._id}</td>
                  <td style={{ color: 'var(--color-on-surface-variant)' }}>{p.totalSold}</td>
                  <td style={{ paddingRight: 32, textAlign: 'right', fontWeight: 700 }}>${p.totalRevenue?.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p style={{ padding: '0 32px 32px', color: 'var(--color-on-surface-variant)', fontSize: 14 }}>No sales data.</p>}
      </div>

      {/* Member Growth */}
      <div className="admin-dash__chart-card">
        <h4 className="admin-dash__section-title" style={{ marginBottom: 24 }}>Member Growth</h4>
        {stats?.userGrowth?.length ? (
          <div className="admin-dash__bars" style={{ height: 120 }}>
            {stats.userGrowth.map((d) => {
              const max = Math.max(...stats.userGrowth.map((r) => r.count));
              const pct = max > 0 ? (d.count / max) * 100 : 0;
              return (
                <div key={d._id} className="admin-dash__bar-col">
                  <div className="admin-dash__bar-track" style={{ height: '100%' }}>
                    <div className="admin-dash__bar-fill" style={{ height: `${pct}%`, background: 'var(--color-primary)' }} />
                  </div>
                  <span className="admin-dash__bar-label">{d._id.slice(5)}</span>
                </div>
              );
            })}
          </div>
        ) : <p style={{ color: 'var(--color-on-surface-variant)', fontSize: 14 }}>No growth data.</p>}
      </div>
    </div>
  );
}
