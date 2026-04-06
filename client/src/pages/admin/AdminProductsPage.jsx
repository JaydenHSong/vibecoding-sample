// Design Ref: §Stitch _9 — Admin Products management
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { categoryService } from '../../services/productService';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './AdminPages.css';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { categoryService.getAll().then((r) => setCategories(r.data || [])).catch(() => {}); }, []);

  const fetchProducts = (p, q, cat) => {
    setLoading(true);
    const params = { page: p, limit: 20 };
    if (cat) params.category = cat;
    adminService.getProducts(params)
      .then((res) => { setProducts(res.data.data || []); setPagination(res.data.pagination || {}); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(page, search, catFilter); }, [page, catFilter]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    await adminService.deleteProduct(id);
    fetchProducts(page);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="admin-toolbar">
        <h1 className="admin-page-title">Products</h1>
        <Link to="/admin/products/new" className="btn-primary">Add Product</Link>
      </div>
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <form onSubmit={(e) => { e.preventDefault(); setPage(1); fetchProducts(1, search, catFilter); }} className="admin-toolbar__search">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." />
          <button type="submit" className="admin-btn admin-btn--edit">Search</button>
        </form>
        <select value={catFilter} onChange={(e) => { setCatFilter(e.target.value); setPage(1); }} style={{ width: 'auto', minWidth: 140 }}>
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
      </div>
      <div className="admin-dash__orders" style={{ padding: 0 }}>
        <table className="admin-table" style={{ padding: 0 }}>
          <thead>
            <tr>
              <th style={{ paddingLeft: 32 }}></th>
              <th>Name</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Category</th>
              <th style={{ paddingRight: 32 }}></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id}>
                <td style={{ paddingLeft: 32 }}><img className="admin-table__img" src={p.images?.[0] || 'https://placehold.co/48x64/f3f3f3/ccc'} alt="" /></td>
                <td><strong>{p.name}</strong></td>
                <td>${p.price?.toLocaleString()}</td>
                <td>{p.stock}</td>
                <td>{p.category?.name || '—'}</td>
                <td style={{ paddingRight: 32 }}>
                  <Link to={`/admin/products/${p._id}/edit`} className="admin-btn admin-btn--edit">Edit</Link>{' '}
                  <button className="admin-btn admin-btn--delete" onClick={() => handleDelete(p._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={pagination.page || 1} totalPages={pagination.totalPages || 1} onPageChange={setPage} />
    </div>
  );
}
