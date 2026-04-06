// Design Ref: §Stitch _9 — Admin Orders management
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './AdminPages.css';

const STATUSES = ['', 'pending', 'paid', 'shipping', 'delivered', 'cancelled'];

export default function AdminOrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({});
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchOrders = (p, status) => {
    setLoading(true);
    const params = { page: p, limit: 20 };
    if (status) params.status = status;
    adminService.getOrders(params)
      .then((res) => { setOrders(res.data.data || []); setPagination(res.data.pagination || {}); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(page, statusFilter); }, [page, statusFilter]);

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
    <div>
      <h1 className="admin-page-title">Orders</h1>
      <div className="admin-toolbar">
        <div style={{ display: 'flex', gap: 8 }}>
          {STATUSES.map((s) => (
            <button
              key={s}
              className={`admin-btn ${statusFilter === s ? 'admin-btn--approve' : 'admin-btn--edit'}`}
              onClick={() => { setStatusFilter(s); setPage(1); }}
            >
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>
      {loading ? <LoadingSpinner /> : (
        <div className="admin-dash__orders" style={{ padding: 0 }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ paddingLeft: 32 }}>Order ID</th>
                <th>Customer</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
                <th style={{ textAlign: 'center' }}>Status</th>
                <th style={{ paddingRight: 32 }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const st = statusStyle(o.status);
                return (
                  <tr key={o._id} className="admin-table__row--hover" onClick={() => navigate(`/admin/orders/${o._id}`)}>
                    <td style={{ paddingLeft: 32, fontFamily: "'Courier New', monospace", fontSize: 12, fontWeight: 700 }}>{o.orderNumber}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div className="admin-dash__avatar-sm">{initials(o.user?.name)}</div>
                        <span style={{ fontSize: 14, fontWeight: 500 }}>{o.user?.name || '—'}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: 14, fontWeight: 700, textAlign: 'right' }}>${o.totalAmount?.toLocaleString()}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="admin-dash__status" style={{ background: st.bg, color: st.color }}>{o.status}</span>
                    </td>
                    <td style={{ paddingRight: 32, fontSize: 12, color: 'var(--color-on-surface-variant)' }}>
                      {new Date(o.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <Pagination page={pagination.page || 1} totalPages={pagination.totalPages || 1} onPageChange={setPage} />
    </div>
  );
}
