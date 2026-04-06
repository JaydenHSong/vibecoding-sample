import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productService, categoryService } from '../../services/productService';
import ProductCard from '../../components/product/ProductCard';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './SearchPage.css';

const sortOptions = [
  { value: '', label: 'Relevance' },
  { value: 'price_asc', label: 'Price: Low' },
  { value: 'price_desc', label: 'Price: High' },
  { value: 'popular', label: 'Popular' },
];

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(false);

  const q = searchParams.get('q');
  const page = Number(searchParams.get('page')) || 1;
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || '';

  useEffect(() => {
    categoryService.getAll().then((res) => setCategories(res.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!q) return;
    setLoading(true);
    productService.search({ q, page, limit: 20, category, sort })
      .then((res) => {
        setProducts(res.data.data || []);
        setPagination(res.data.pagination || {});
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [q, page, category, sort]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) setSearchParams({ q: query.trim() });
  };

  const updateParam = (key, value) => {
    const params = Object.fromEntries(searchParams.entries());
    if (value) params[key] = value; else delete params[key];
    params.page = '1';
    setSearchParams(params);
  };

  return (
    <div className="search-page">
      {/* Search bar */}
      <header className="search-page__header">
        <span className="label-sm" style={{ display: 'block', marginBottom: 16 }}>Discovery Archive</span>
        <form onSubmit={handleSearch} className="search-page__bar">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search brands, items..."
            className="search-page__input"
          />
          <button type="submit" className="search-page__submit">
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>search</span>
          </button>
        </form>
      </header>

      {q && (
        <div className="search-page__layout">
          {/* Sidebar filters */}
          <aside className="search-page__sidebar">
            <div className="search-page__sidebar-inner">
              <section>
                <h3 className="search-page__filter-title">Category</h3>
                <ul className="search-page__filter-list">
                  <li>
                    <button className={`search-page__filter-btn ${!category ? 'active' : ''}`} onClick={() => updateParam('category', '')}>
                      All
                    </button>
                  </li>
                  {categories.map((c) => (
                    <li key={c._id}>
                      <button className={`search-page__filter-btn ${category === c._id ? 'active' : ''}`} onClick={() => updateParam('category', c._id)}>
                        {c.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h3 className="search-page__filter-title">Sort By</h3>
                <ul className="search-page__filter-list">
                  {sortOptions.map((o) => (
                    <li key={o.value}>
                      <button className={`search-page__filter-btn ${sort === o.value ? 'active' : ''}`} onClick={() => updateParam('sort', o.value)}>
                        {o.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </aside>

          {/* Results */}
          <main className="search-page__main">
            <div className="search-page__meta">
              <div>
                <h2 className="search-page__results-title">Search Results</h2>
                <p className="search-page__query-display">&lsquo;{q}&rsquo;</p>
              </div>
              <span className="search-page__count">{pagination.total || 0} results &middot; Showing {products.length} specimens</span>
            </div>

            {loading ? (
              <LoadingSpinner />
            ) : products.length === 0 ? (
              <div className="search-page__empty">
                <span className="material-symbols-outlined" style={{ fontSize: 48, opacity: 0.15 }}>search_off</span>
                <p>No results found</p>
              </div>
            ) : (
              <div className="search-page__grid">
                {products.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
            )}

            <Pagination
              page={pagination.page || 1}
              totalPages={pagination.totalPages || 1}
              onPageChange={(p) => {
                const params = Object.fromEntries(searchParams.entries());
                params.page = p;
                setSearchParams(params);
              }}
            />
          </main>
        </div>
      )}
    </div>
  );
}
