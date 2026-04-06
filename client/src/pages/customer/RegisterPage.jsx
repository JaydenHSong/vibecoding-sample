import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import './AuthPage.css';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, loading, error, clearError } = useAuthStore();
  const [form, setForm] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    name: '',
    phone: '',
    gender: '',
  });
  const [validationError, setValidationError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setValidationError('');
    clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (!form.email || !form.password || !form.name) {
      setValidationError('Email, password, and name are required');
      return;
    }
    if (form.password.length < 6) {
      setValidationError('Password must be at least 6 characters');
      return;
    }
    if (form.password !== form.passwordConfirm) {
      setValidationError('Passwords do not match');
      return;
    }

    const { passwordConfirm, ...data } = form;
    const success = await register(data);
    if (success) navigate('/welcome');
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
              Join a community of design-conscious individuals discovering globally sourced pieces and timeless archives.
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
            <h2 className="auth-page__heading">Create Account</h2>
            <p className="auth-page__subtitle">Join the gallery.</p>
          </div>

          {(error || validationError) && (
            <div className="auth-page__error">{validationError || error}</div>
          )}

          <form onSubmit={handleSubmit} className="auth-page__form">
            <div className="auth-page__field">
              <label className="auth-page__label">Email Address</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="name@studio.com" autoComplete="email" />
            </div>

            <div className="auth-page__field">
              <label className="auth-page__label">Password</label>
              <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Min 6 characters" autoComplete="new-password" />
            </div>

            <div className="auth-page__field">
              <label className="auth-page__label">Confirm Password</label>
              <input type="password" name="passwordConfirm" value={form.passwordConfirm} onChange={handleChange} placeholder="Confirm password" autoComplete="new-password" />
            </div>

            <div className="auth-page__field">
              <label className="auth-page__label">Full Name</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Your name" autoComplete="name" />
            </div>

            <div className="auth-page__field">
              <label className="auth-page__label">Phone</label>
              <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="(555) 123-4567" autoComplete="tel" />
            </div>

            <div className="auth-page__field">
              <label className="auth-page__label">Gender</label>
              <div className="auth-page__gender-group">
                {['male', 'female', 'other'].map((g) => (
                  <button
                    key={g}
                    type="button"
                    className={`auth-page__gender-btn ${form.gender === g ? 'active' : ''}`}
                    onClick={() => setForm({ ...form, gender: g })}
                  >
                    {g === 'male' ? 'Male' : g === 'female' ? 'Female' : 'Other'}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" className="auth-page__submit" disabled={loading}>
              {loading ? 'Processing...' : 'Create Account'}
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
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
