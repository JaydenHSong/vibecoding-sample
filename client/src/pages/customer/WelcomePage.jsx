import { Link } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';

export default function WelcomePage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div style={{ textAlign: 'center', padding: '96px 24px' }}>
      <span className="label-sm" style={{ display: 'block', marginBottom: 16 }}>Welcome to The Curated Gallery</span>
      <h1 className="serif" style={{ fontSize: 'clamp(3rem, 6vw, 5rem)', fontStyle: 'italic', fontWeight: 300, lineHeight: 0.9, letterSpacing: '-0.04em', marginBottom: 24 }}>
        Hello, {user?.name || 'there'}.
      </h1>
      <p style={{ color: 'var(--color-on-surface-variant)', marginBottom: 48, fontSize: 14, maxWidth: 400, margin: '0 auto 48px' }}>
        Your account has been created successfully. Explore our curated collection of design pieces and timeless archives.
      </p>
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
        <Link to="/products" className="btn-primary">Start Shopping</Link>
        <Link to="/mypage" className="btn-secondary">My Account</Link>
      </div>
    </div>
  );
}
