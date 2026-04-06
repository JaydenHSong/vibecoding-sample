// Design Ref: §Stitch _9 — Admin top bar (backdrop blur, search, notifications, user profile)
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import './AdminHeader.css';

export default function AdminHeader() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [search, setSearch] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/admin/orders?q=${encodeURIComponent(search)}`);
  };

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : 'AD';

  return (
    <header className="admin-topbar">
      <div className="admin-topbar__left">
        <h1 className="admin-topbar__title">Dashboard</h1>
        <form onSubmit={handleSearch} className="admin-topbar__search">
          <span className="material-symbols-outlined admin-topbar__search-icon">search</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search orders, products, customers..."
            className="admin-topbar__search-input"
          />
        </form>
      </div>

      <div className="admin-topbar__right">
        <div className="admin-topbar__notif">
          <span className="material-symbols-outlined">notifications</span>
          <span className="admin-topbar__notif-badge">3</span>
        </div>
        <div className="admin-topbar__user">
          <div className="admin-topbar__user-info">
            <p className="admin-topbar__user-name">{user?.name || 'Admin'}</p>
            <p className="admin-topbar__user-role">Lead Curator</p>
          </div>
          <div className="admin-topbar__avatar">{initials}</div>
        </div>
      </div>
    </header>
  );
}
