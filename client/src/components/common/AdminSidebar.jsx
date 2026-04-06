// Design Ref: §Stitch _9 — Admin sidebar navigation (w-64, bg-#f3f3f3)
import { NavLink, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import './AdminSidebar.css';

const menuItems = [
  { to: '/admin', icon: 'dashboard', label: 'Dashboard', end: true },
  { to: '/admin/products', icon: 'inventory_2', label: 'Products' },
  { to: '/admin/orders', icon: 'shopping_cart', label: 'Orders' },
  { to: '/admin/users', icon: 'group', label: 'Members' },
  { to: '/admin/banners', icon: 'ad_units', label: 'Banners' },
  { to: '/admin/reviews', icon: 'rate_review', label: 'Reviews' },
  { to: '/admin/inquiries', icon: 'help_center', label: 'Inquiries' },
  { to: '/admin/stats', icon: 'bar_chart', label: 'Statistics' },
];

export default function AdminSidebar() {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar__brand">
        <div className="admin-sidebar__logo">Admin Console</div>
        <div className="admin-sidebar__subtitle">System Curator</div>
      </div>

      <nav className="admin-sidebar__nav">
        {menuItems.map(({ to, icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `admin-sidebar__item ${isActive ? 'admin-sidebar__item--active' : ''}`
            }
          >
            <span className="material-symbols-outlined">{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="admin-sidebar__bottom">
        <button
          className="admin-sidebar__cta"
          onClick={() => navigate('/admin/products/new')}
        >
          Create New Listing
        </button>
        <button className="admin-sidebar__link" onClick={() => navigate('/')}>
          <span className="material-symbols-outlined">storefront</span>
          <span>Go to Shop</span>
        </button>
        <button className="admin-sidebar__link" onClick={handleLogout}>
          <span className="material-symbols-outlined">logout</span>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
