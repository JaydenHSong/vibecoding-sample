import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import { userService } from '../../services/userService';
import { orderService } from '../../services/orderService';
import OrderStatusBadge from '../../components/order/OrderStatusBadge';
import ProductCard from '../../components/product/ProductCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './MyPage.css';

export default function MyPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [profile, setProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editForm, setEditForm] = useState({ name: '', phone: '', gender: '' });
  const [editSuccess, setEditSuccess] = useState('');

  const [addrForm, setAddrForm] = useState({ label: '', address: '', detail: '', zipCode: '', isDefault: false });
  const [showAddrForm, setShowAddrForm] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    Promise.all([
      orderService.getMyOrders().catch(() => ({ data: { data: [] } })),
      userService.getWishlist().catch(() => ({ data: [] })),
      userService.getMe().catch(() => ({ data: null })),
      userService.getAddresses().catch(() => ({ data: [] })),
    ]).then(([ordRes, wishRes, meRes, addrRes]) => {
      setOrders(ordRes.data.data || []);
      setWishlist(wishRes.data || []);
      setProfile(meRes.data);
      setAddresses(addrRes.data || []);
      if (meRes.data) setEditForm({ name: meRes.data.name || '', phone: meRes.data.phone || '', gender: meRes.data.gender || '' });
      setLoading(false);
    });
  }, [user]);

  const handleLogout = () => { logout(); navigate('/'); };

  const handleProfileSave = async () => {
    try {
      const res = await userService.updateMe(editForm);
      setProfile(res.data);
      setEditSuccess('Profile updated!');
      setTimeout(() => setEditSuccess(''), 3000);
    } catch {}
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!addrForm.label || !addrForm.address || !addrForm.zipCode) return;
    try {
      const res = await userService.addAddress(addrForm);
      setAddresses(res.data || []);
      setAddrForm({ label: '', address: '', detail: '', zipCode: '', isDefault: false });
      setShowAddrForm(false);
    } catch {}
  };

  const handleDeleteAddress = async (id) => {
    const res = await userService.deleteAddress(id);
    setAddresses(res.data || []);
  };

  if (!user) return null;
  if (loading) return <LoadingSpinner />;

  const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];

  return (
    <div className="mypage">
      {/* Header: large serif name */}
      <header className="mypage__header">
        <div>
          <span className="label-sm" style={{ display: 'block', marginBottom: 8 }}>My Account</span>
          <h1 className="mypage__name">{user.name}</h1>
        </div>
        <div className="mypage__header-right">
          <p className="mypage__bio">
            Member since {new Date(user.createdAt || Date.now()).getFullYear()}. Your curated preferences, orders, and wishlist.
          </p>
          <button onClick={handleLogout} className="btn-secondary">Logout</button>
        </div>
      </header>

      {/* 2-Column Layout */}
      <div className="mypage__layout">
        {/* Left: Account Info */}
        <div className="mypage__left">
          {/* Recent Orders */}
          <section className="mypage__section">
            <h3 className="mypage__section-title">Recent Orders</h3>
            {orders.length === 0 ? (
              <p className="mypage__empty">No orders yet.</p>
            ) : orders.slice(0, 5).map((order) => (
              <div key={order._id} className="mypage-order" onClick={() => navigate(`/order-complete/${order._id}`)} style={{ cursor: 'pointer' }}>
                <div className="mypage-order__header">
                  <div>
                    <span className="mypage-order__number">{order.orderNumber}</span>
                    <p className="mypage-order__status">{order.status} — {new Date(order.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</p>
                  </div>
                  <span className="material-symbols-outlined mypage-order__arrow">arrow_forward</span>
                </div>
              </div>
            ))}
          </section>

          {/* Saved Addresses */}
          <section className="mypage__section">
            <h3 className="mypage__section-title">Saved Addresses</h3>
            {addresses.length === 0 ? (
              <p className="mypage__empty">No address saved.</p>
            ) : (
              addresses.map((addr) => (
                <div key={addr._id} className="mypage__address-card" style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <strong>{addr.label}</strong>
                      {addr.isDefault && <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-primary)', marginLeft: 8 }}>Default</span>}
                      <p>{addr.address}{addr.detail && `, ${addr.detail}`}</p>
                      <p>{addr.zipCode}</p>
                    </div>
                    <button onClick={() => handleDeleteAddress(addr._id)} style={{ fontSize: 11, color: '#ef4444', fontWeight: 700, whiteSpace: 'nowrap' }}>Remove</button>
                  </div>
                </div>
              ))
            )}
            {showAddrForm ? (
              <form onSubmit={handleAddAddress} className="mypage__addr-form">
                <div className="auth-page__field"><label className="auth-page__label">Label</label><input value={addrForm.label} onChange={(e) => setAddrForm({ ...addrForm, label: e.target.value })} placeholder="Home, Office..." /></div>
                <div className="auth-page__field"><label className="auth-page__label">Address</label><input value={addrForm.address} onChange={(e) => setAddrForm({ ...addrForm, address: e.target.value })} placeholder="Street address" /></div>
                <div className="auth-page__field"><label className="auth-page__label">Apt / Suite</label><input value={addrForm.detail} onChange={(e) => setAddrForm({ ...addrForm, detail: e.target.value })} /></div>
                <div className="auth-page__field"><label className="auth-page__label">ZIP Code</label><input value={addrForm.zipCode} onChange={(e) => setAddrForm({ ...addrForm, zipCode: e.target.value })} placeholder="90001" /></div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
                  <input type="checkbox" checked={addrForm.isDefault} onChange={(e) => setAddrForm({ ...addrForm, isDefault: e.target.checked })} style={{ width: 'auto', border: 'none' }} /> Set as default
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="submit" className="btn-primary">Add</button>
                  <button type="button" className="btn-secondary" onClick={() => setShowAddrForm(false)}>Cancel</button>
                </div>
              </form>
            ) : (
              <button onClick={() => setShowAddrForm(true)} className="mypage__add-btn">
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>add</span> Add Address
              </button>
            )}
          </section>

          {/* Profile / Preferences */}
          <section className="mypage__section">
            <h3 className="mypage__section-title">Preferences</h3>
            {profile && (
              <div className="mypage__prefs">
                {editSuccess && <div className="mypage__success">{editSuccess}</div>}
                <div className="auth-page__field"><label className="auth-page__label">Email</label><input value={profile.email} disabled style={{ opacity: 0.5 }} /></div>
                <div className="auth-page__field"><label className="auth-page__label">Name</label><input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} /></div>
                <div className="auth-page__field"><label className="auth-page__label">Phone</label><input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} placeholder="(555) 123-4567" /></div>
                <div className="auth-page__field">
                  <label className="auth-page__label">Gender</label>
                  <div className="auth-page__gender-group">
                    {['male', 'female', 'other'].map((g) => (
                      <button key={g} type="button" className={`auth-page__gender-btn ${editForm.gender === g ? 'active' : ''}`} onClick={() => setEditForm({ ...editForm, gender: g })}>
                        {g === 'male' ? 'Male' : g === 'female' ? 'Female' : 'Other'}
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={handleProfileSave} className="btn-primary" style={{ marginTop: 16 }}>Save Changes</button>
              </div>
            )}
          </section>
        </div>

        {/* Right: Curated Wishlist */}
        <div className="mypage__right">
          <h3 className="mypage__section-title">Curated Wishlist</h3>
          {wishlist.length === 0 ? (
            <p className="mypage__empty">Your wishlist is empty.</p>
          ) : (
            <div className="mypage__wishlist-grid">
              {wishlist.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
