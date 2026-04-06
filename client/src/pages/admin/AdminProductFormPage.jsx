// Design Ref: §Stitch _9 — Admin Product Form (Add/Edit)
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { categoryService } from '../../services/productService';
import './AdminPages.css';

export default function AdminProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '', price: '', description: '', images: '', category: '', stock: '', isBestSeller: false, isNew: false,
  });

  useEffect(() => {
    categoryService.getAll().then((res) => setCategories(res.data || [])).catch(() => {});
    if (isEdit) {
      import('../../services/productService').then(({ productService }) => {
        productService.getById(id).then((res) => {
          const p = res.data;
          setForm({ name: p.name, price: p.price, description: p.description || '', images: p.images?.join(', ') || '', category: p.category?._id || '', stock: p.stock, isBestSeller: p.isBestSeller, isNew: p.isNew });
        });
      });
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.category) { setError('Name, price, and category are required'); return; }
    const data = { ...form, price: Number(form.price), stock: Number(form.stock) || 0, images: form.images ? form.images.split(',').map((s) => s.trim()) : [] };
    try {
      if (isEdit) await adminService.updateProduct(id, data);
      else await adminService.createProduct(data);
      navigate('/admin/products');
    } catch (err) { setError(err.response?.data?.error || 'Failed to save product'); }
  };

  const labelStyle = { fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--color-on-surface-variant)', display: 'block', marginBottom: 4 };

  return (
    <div>
      <h1 className="admin-page-title">{isEdit ? 'Edit' : 'Add'} Product</h1>
      {error && <div style={{ background: 'var(--color-error-container)', color: 'var(--color-error)', padding: '12px 16px', marginBottom: 24, fontSize: 14 }}>{error}</div>}
      <form onSubmit={handleSubmit} className="admin-dash__orders" style={{ maxWidth: 600, padding: 32, display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div><label style={labelStyle}>Name *</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
        <div><label style={labelStyle}>Price *</label><input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
        <div><label style={labelStyle}>Description</label><textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
        <div><label style={labelStyle}>Image URLs (comma separated)</label><input value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} /></div>
        <div>
          <label style={labelStyle}>Category *</label>
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            <option value="">Select category</option>
            {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>
        <div><label style={labelStyle}>Stock</label><input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} /></div>
        <div style={{ display: 'flex', gap: 24 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
            <input type="checkbox" checked={form.isBestSeller} onChange={(e) => setForm({ ...form, isBestSeller: e.target.checked })} style={{ width: 'auto', border: 'none' }} /> Best Seller
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
            <input type="checkbox" checked={form.isNew} onChange={(e) => setForm({ ...form, isNew: e.target.checked })} style={{ width: 'auto', border: 'none' }} /> New Arrival
          </label>
        </div>
        <button type="submit" className="btn-primary">Save Product</button>
      </form>
    </div>
  );
}
