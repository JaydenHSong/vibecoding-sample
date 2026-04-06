import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import './AuthPage.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loading, error, clearError } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(form);
    if (success) navigate('/');
  };

  return (
    <div className="auth-page">
      <section className="auth-page__hero">
        <img
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80"
          alt="Boutique interior"
          className="auth-page__hero-img"
        />
        <div className="auth-page__hero-content">
          <div>
            <h1 className="auth-page__hero-title">THE<br />CURATED</h1>
          </div>
          <div className="auth-page__hero-footer">
            <p className="auth-page__hero-desc">
              Access an exclusive collection of globally sourced design pieces, architectural fashion, and timeless archives.
            </p>
            <div className="auth-page__hero-vol">
              <span className="auth-page__hero-line" />
              <span>Volume 01: The New Minimal</span>
            </div>
          </div>
        </div>
      </section>

      <section className="auth-page__form-section">
        <div className="auth-page__form-container">
          <div className="auth-page__mobile-logo">CURATED</div>
          <div>
            <h2 className="auth-page__heading">Sign In</h2>
            <p className="auth-page__subtitle">Welcome back to the gallery.</p>
          </div>

          {error && <div className="auth-page__error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-page__form">
            <div className="auth-page__field">
              <label className="auth-page__label">Email Address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="name@studio.com"
                autoComplete="email"
              />
            </div>

            <div className="auth-page__field">
              <div className="auth-page__label-row">
                <label className="auth-page__label">Password</label>
                <button type="button" className="auth-page__forgot">Forgot?</button>
              </div>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <input type="checkbox" id="remember" style={{ width: 16, height: 16, border: '1px solid var(--color-outline-variant)' }} />
              <label htmlFor="remember" className="auth-page__label" style={{ marginBottom: 0 }}>Remember device</label>
            </div>

            <button type="submit" className="auth-page__submit" disabled={loading}>
              {loading ? 'Processing...' : 'Continue'}
            </button>
          </form>

          <div className="auth-page__divider">
            <span>Or authenticate via</span>
          </div>

          <div className="auth-page__social">
            <button className="auth-page__social-btn" disabled>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>phone_iphone</span>
              <span>Apple</span>
            </button>
            <button className="auth-page__social-btn" disabled>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>g_mobiledata</span>
              <span>Google</span>
            </button>
          </div>

          <p className="auth-page__switch">
            New to The Gallery? <Link to="/register">Create Account</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
