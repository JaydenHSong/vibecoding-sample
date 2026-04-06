import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService, categoryService } from '../../services/productService';
import { bannerService } from '../../services/bannerService';
import ProductCard from '../../components/product/ProductCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './HomePage.css';

export default function HomePage() {
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [bestProducts, setBestProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      bannerService.getActive('main').catch(() => ({ data: [] })),
      categoryService.getAll().catch(() => ({ data: [] })),
      productService.getAll({ sort: 'newest', limit: 12 }).catch(() => ({ data: { data: [] } })),
      productService.getAll({ sort: 'popular', limit: 10 }).catch(() => ({ data: { data: [] } })),
    ]).then(([bannersRes, catsRes, newRes, bestRes]) => {
      setBanners(bannersRes.data);
      setCategories(catsRes.data);
      setNewProducts(newRes.data.data || []);
      setBestProducts(bestRes.data.data || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingSpinner />;

  const heroImage = banners[0]?.image || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&h=1200&fit=crop';

  return (
    <div className="home-page">
      {/* Hero Section: Layered & High Density */}
      <section className="hero">
        <div className="hero__layout">
          {/* Left: Main Image */}
          <div className="hero__main">
            <img src={heroImage} alt="Editorial" className="hero__image" />
            <div className="hero__gradient" />
            <div className="hero__content">
              <div className="hero__tags">
                <span className="hero__badge">Editor's Choice</span>
                <span className="hero__vol">Vol. 42 / 2024</span>
              </div>
              <h1 className="hero__title serif">
                Structural <br />Silhouettes <br />& Harmony.
              </h1>
              <div className="hero__actions">
                <Link to="/products" className="hero__cta">
                  View Collection <span className="material-symbols-outlined" style={{ fontSize: 14 }}>east</span>
                </Link>
                <p className="hero__subtitle">Exploring the intersection of<br />brutalism and soft tailoring.</p>
              </div>
            </div>
          </div>

          {/* Right: Trending Sidebar */}
          <div className="hero__sidebar">
            <div className="hero__sidebar-header">
              <span className="label-sm" style={{ color: 'var(--color-on-surface)' }}>Trending Now</span>
              <span style={{ fontSize: 10, fontWeight: 700, opacity: 0.3 }}>01 — {String(Math.min(bestProducts.length, 5)).padStart(2, '0')}</span>
            </div>
            <div className="hero__sidebar-list">
              {bestProducts.slice(0, 5).map((p) => (
                <Link key={p._id} to={`/products/${p._id}`} className="hero__sidebar-item">
                  <div className="hero__sidebar-thumb">
                    <img src={p.images?.[0] || ''} alt={p.name} />
                  </div>
                  <div className="hero__sidebar-info">
                    <p className="hero__sidebar-brand">{p.category?.name || 'Curated'}</p>
                    <h3 className="hero__sidebar-name serif">{p.name}</h3>
                    <p className="hero__sidebar-price">${p.price?.toLocaleString()}</p>
                  </div>
                </Link>
              ))}
            </div>
            <Link to="/products?sort=popular" className="hero__sidebar-cta">
              <span>Shop All Trending</span>
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>arrow_forward</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Real-time Best Rankings */}
      <section className="rankings">
        <div className="rankings__layout">
          <div className="rankings__header">
            <h2 className="rankings__title serif">Real-time <br />Best Rankings</h2>
            <div className="label-sm" style={{ opacity: 0.4 }}>Updated {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
          </div>
          <div className="rankings__scroll no-scrollbar">
            {bestProducts.slice(0, 8).map((p, i) => (
              <Link key={p._id} to={`/products/${p._id}`} className="rankings__item">
                <span className="rankings__number serif">{String(i + 1).padStart(2, '0')}</span>
                <div className="rankings__image">
                  <img src={p.images?.[0] || ''} alt={p.name} />
                </div>
                <p className="rankings__brand">{p.category?.name || 'Curated'}</p>
                <h4 className="rankings__name">{p.name}</h4>
                <div className="rankings__price-row">
                  <span className="rankings__price">${p.price?.toLocaleString()}</span>
                  {p.isNew && <span className="rankings__tag-new">NEW</span>}
                </div>
              </Link>
            ))}
            <div className="rankings__more">
              <Link to="/products?sort=popular" className="rankings__more-link">Show Top 100</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Staff Pick & Weekly Curation: Dense Mixed Grid */}
      <section className="curation">
        <div className="curation__layout tight-grid">
          {/* Sidebar */}
          <div className="curation__sidebar dot-pattern">
            <div>
              <h2 className="curation__sidebar-title serif">Weekly <br />Focus</h2>
              <div className="curation__sidebar-nav">
                {categories.slice(0, 4).map((cat, i) => (
                  <Link key={cat._id} to={`/products?category=${cat._id}`} className="curation__sidebar-link" style={{ opacity: i === 0 ? 1 : 0.3 }}>
                    {String(i + 1).padStart(2, '0')}. {cat.name}
                    {i === 0 && <span className="material-symbols-outlined" style={{ fontSize: 12 }}>north_east</span>}
                  </Link>
                ))}
              </div>
            </div>
            <p className="curation__sidebar-note">Curated by our editorial team.</p>
          </div>

          {/* Main Content */}
          <div className="curation__main tight-grid">
            {/* Featured Card */}
            <div className="curation__featured">
              {newProducts[0] && (
                <Link to={`/products/${newProducts[0]._id}`} className="curation__featured-inner">
                  <span className="curation__featured-badge">Limited Edition</span>
                  <div className="curation__featured-image">
                    <img src={newProducts[0].images?.[0] || ''} alt={newProducts[0].name} />
                  </div>
                  <h3 className="curation__featured-title serif">The Architecture of Time</h3>
                  <p className="curation__featured-desc">A deep dive into artisanal craft.</p>
                  <span className="curation__featured-link">Read Journal <span className="material-symbols-outlined" style={{ fontSize: 14 }}>east</span></span>
                </Link>
              )}
            </div>

            {/* Dense Staff Picks */}
            <div className="curation__picks tight-grid">
              {newProducts.slice(1, 5).map((p) => (
                <Link key={p._id} to={`/products/${p._id}`} className="curation__pick">
                  <div className="curation__pick-image">
                    <img src={p.images?.[0] || ''} alt={p.name} />
                  </div>
                  <div className="curation__pick-info">
                    <p className="curation__pick-brand">{p.category?.name || 'Curated'}</p>
                    <h4 className="curation__pick-name serif">{p.name}</h4>
                    <span className="curation__pick-price">${p.price?.toLocaleString()}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* New Arrivals Grid */}
      <section className="arrivals">
        <div className="arrivals__header">
          <div className="arrivals__header-left">
            <h2 className="arrivals__title serif">Fresh Arrivals</h2>
            <span className="arrivals__season">Autumn / Winter '24 Preview</span>
          </div>
          <Link to="/products?sort=newest" className="arrivals__see-all">
            See Everything <span className="material-symbols-outlined" style={{ fontSize: 14 }}>east</span>
          </Link>
        </div>
        <div className="arrivals__grid">
          {newProducts.slice(0, 6).map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="newsletter">
        <div className="newsletter__dot-overlay" />
        <div className="newsletter__inner">
          <div>
            <p className="newsletter__label">Inside The Gallery</p>
            <h2 className="newsletter__title serif">Curated <br />Intelligence.</h2>
            <p className="newsletter__desc">
              Direct dispatches from the intersection of design, architecture, and luxury fashion. Exclusive early access and members-only stories.
            </p>
          </div>
          <div className="newsletter__form">
            <div className="newsletter__input-wrap">
              <input type="email" placeholder="yourname@domain.com" className="newsletter__input" />
              <button className="newsletter__join">Join</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
