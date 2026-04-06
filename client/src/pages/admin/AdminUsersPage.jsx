// Design Ref: §Stitch _9 — Admin Users/Members management
import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './AdminPages.css';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({});
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchUsers = (p, q) => {
    setLoading(true);
    const params = { page: p, limit: 20 };
    if (q) params.search = q;
    adminService.getUsers(params)
      .then((res) => { setUsers(res.data.data || []); setPagination(res.data.pagination || {}); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(page, search); }, [page]);

  const handleSearch = (e) => { e.preventDefault(); setPage(1); fetchUsers(1, search); };

  const initials = (name) =>
    name ? name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2) : '??';

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="admin-page-title">Members</h1>
      <div className="admin-toolbar">
        <form onSubmit={handleSearch} className="admin-toolbar__search">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email..." />
          <button type="submit" className="admin-btn admin-btn--edit">Search</button>
        </form>
      </div>
      <div className="admin-dash__orders" style={{ padding: 0 }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ paddingLeft: 32 }}>Member</th>
              <th>Email</th>
              <th>Role</th>
              <th style={{ paddingRight: 32 }}>Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td style={{ paddingLeft: 32 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className="admin-dash__avatar-sm">{initials(u.name)}</div>
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{u.name}</span>
                  </div>
                </td>
                <td style={{ fontSize: 14, color: 'var(--color-on-surface-variant)' }}>{u.email}</td>
                <td>
                  <span className="admin-dash__status" style={{
                    background: u.role === 'admin' ? '#d1fae5' : 'var(--color-surface-container-high)',
                    color: u.role === 'admin' ? '#065f46' : 'var(--color-on-surface-variant)',
                  }}>{u.role}</span>
                </td>
                <td style={{ paddingRight: 32, fontSize: 12, color: 'var(--color-on-surface-variant)' }}>
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={pagination.page || 1} totalPages={pagination.totalPages || 1} onPageChange={setPage} />
    </div>
  );
}
