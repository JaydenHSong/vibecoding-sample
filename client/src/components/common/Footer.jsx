import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__grid">
          <div className="footer__brand">
            <div className="footer__logo serif">The Gallery</div>
            <p className="footer__desc">
              An aesthetic destination curating the extraordinary for refined living. Established 2024.
            </p>
            <div className="footer__social">
              <a href="#" className="footer__social-link">IG</a>
              <a href="#" className="footer__social-link">PN</a>
              <a href="#" className="footer__social-link">YT</a>
            </div>
          </div>
          <div className="footer__section">
            <h4 className="footer__title">Navigation</h4>
            <Link to="/products">Shop All</Link>
            <Link to="/products?sort=newest">New Arrivals</Link>
            <Link to="/products?sort=popular">Best Sellers</Link>
          </div>
          <div className="footer__section">
            <h4 className="footer__title">Assistance</h4>
            <Link to="/support">Customer Care</Link>
            <Link to="/support">Shipping & Returns</Link>
            <Link to="/terms">Size Guide</Link>
          </div>
          <div className="footer__section">
            <h4 className="footer__title">Legal</h4>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/terms/privacy">Privacy Policy</Link>
          </div>
        </div>
        <div className="footer__bottom">
          <div className="footer__bottom-links">
            <span>&copy; 2024 The Curated Gallery</span>
            <Link to="/terms/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Use</Link>
          </div>
          <span className="footer__tagline serif">Density is Luxury</span>
        </div>
      </div>
    </footer>
  );
}
