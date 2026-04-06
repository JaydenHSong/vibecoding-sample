import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { productService, categoryService } from '../../services/productService';
import ProductCard from '../../components/product/ProductCard';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './ProductListPage.css';

const sortOptions = [
  { value: '', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low' },
  { value: 'price_desc', label: 'Price: High' },
  { value: 'popular', label: 'Popular' },
  { value: 'rating', label: 'Top Rated' },
];

export default function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);

  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || '';
  const page = Number(searchParams.get('page')) || 1;

  useEffect(() => {
    categoryService.getAll().then((res) => setCategories(res.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = { page, limit: 24 };
    if (category) params.category = category;
    if (sort) params.sort = sort;

    productService.getAll(params)
      .then((res) => {
        setProducts(res.data.data || []);
        setPagination(res.data.pagination || {});
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [category, sort, page]);

  const updateParam = (key, value) => {
    const params = Object.fromEntries(searchParams.entries());
    if (value) params[key] = value; else delete params[key];
    params.page = '1';
    setSearchParams(params);
  };

  const activeCategory = categories.find((c) => c._id === category);

  return (
    <div className="plp">
      <div className="plp__layout">
        {/* Sidebar */}
        <aside className="plp__sidebar">
          <div className="plp__sidebar-inner">
            <section>
              <h3 className="plp__sidebar-title">Categories</h3>
              <ul className="plp__sidebar-list">
                <li>
                  <button
                    className={`plp__cat-link ${!category ? 'plp__cat-link--active' : ''}`}
                    onClick={() => updateParam('category', '')}
                  >
                    All
                  </button>
                </li>
                {categories.map((cat) => (
                  <li key={cat._id}>
                    <button
                      className={`plp__cat-link ${category === cat._id ? 'plp__cat-link--active' : ''}`}
                      onClick={() => updateParam('category', cat._id)}
                    >
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
            </section>

            <section className="plp__sidebar-sort">
              <h3 className="plp__sidebar-title">Sort By</h3>
              <ul className="plp__sidebar-list">
                {sortOptions.map((opt) => (
                  <li key={opt.value}>
                    <button
                      className={`plp__cat-link ${sort === opt.value ? 'plp__cat-link--active' : ''}`}
                      onClick={() => updateParam('sort', opt.value)}
                    >
                      {opt.label}
                    </button>
                  </li>
                ))}
              </ul>
            </section>

            <div className="plp__sidebar-quote">
              <p className="serif" style={{ fontStyle: 'italic', fontSize: 18, lineHeight: 1.3, marginBottom: 16 }}>
                Curating the subtle, for those who notice.
              </p>
              <Link to="/support" className="plp__sidebar-journal">Read the Journal</Link>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="plp__main">
          {/* Header */}
          <header className="plp__header">
            <div>
              <span className="label-sm">Collections</span>
              <h1 className="plp__title">{activeCategory?.name || 'All'} <span className="serif" style={{ fontStyle: 'italic', fontWeight: 300, fontSize: '0.85em', marginLeft: 8 }}>Collection</span></h1>
            </div>
            <span className="plp__count">{pagination.total || 0} pieces</span>
          </header>

          {loading ? (
            <LoadingSpinner />
          ) : (
            <div className="plp__grid-asym">
              {products.map((p, i) => (
                <div key={p._id} className={`plp__grid-item ${i % 5 === 0 ? 'plp__grid-item--lg' : ''}`}>
                  <ProductCard product={p} />
                </div>
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
    </div>
  );
}
