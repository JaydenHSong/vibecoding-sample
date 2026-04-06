import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import useCartStore from '../../store/useCartStore';
import './Header.css';

export default function Header() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const itemCount = useCartStore((s) => s.cart?.items?.length || 0);

  return (
    <header className="header">
      <div className="header__inner">
        <div className="header__left">
          <Link to="/" className="header__logo serif">The Gallery</Link>
          <nav className="header__nav">
            <Link to="/products">Shop</Link>
            <Link to="/support">Support</Link>
          </nav>
        </div>
        <div className="header__right">
          <div className="header__search" onClick={() => navigate('/search')}>
            <span className="material-symbols-outlined" style={{ fontSize: 16, opacity: 0.5 }}>search</span>
            <span className="header__search-text">Search</span>
          </div>
          <div className="header__icons">
            <button onClick={() => navigate('/cart')} className="header__icon-btn">
              <span className="material-symbols-outlined">shopping_bag</span>
              {itemCount > 0 && <span className="header__badge">{itemCount}</span>}
            </button>
            <button onClick={() => navigate('/mypage')} className="header__icon-btn header__icon-hide-mobile">
              <span className="material-symbols-outlined">favorite</span>
            </button>
            {user ? (
              <>
                <button onClick={() => navigate('/mypage')} className="header__user-btn">
                  <span className="header__user-name">Hello, {user.name}</span>
                </button>
                {user.role === 'admin' && (
                  <Link to="/admin" className="header__admin-btn">Dashboard</Link>
                )}
              </>
            ) : (
              <button onClick={() => navigate('/login')} className="header__user-btn">
                <span className="header__user-name">Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
