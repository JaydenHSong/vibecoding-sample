// Design Ref: §Stitch _9 — Admin Product Form (Add/Edit) + §5.3 Variant Matrix
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { categoryService } from '../../services/productService';
import VariantMatrix from '../../components/admin/VariantMatrix';
import './AdminPages.css';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'domq6fisj';

const PRESET_OPTIONS = {
  Size: { clothing: ['XS', 'S', 'M', 'L', 'XL'], shoes: ['7', '8', '9', '10', '11', '12'] },
  Color: ['Black', 'White', 'Navy', 'Grey', 'Charcoal', 'Khaki', 'Camel', 'Olive', 'Tan', 'Brown'],
};

export default function AdminProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [images, setImages] = useState([]);
  const [options, setOptions] = useState([]);
  const [variants, setVariants] = useState([]);
  const [form, setForm] = useState({
    name: '', price: '', description: '', category: '', stock: '', isBestSeller: false, isNew: false,
  });

  useEffect(() => {
    categoryService.getAll().then((res) => setCategories(res.data || [])).catch(() => {});
    if (isEdit) {
      import('../../services/productService').then(({ productService }) => {
        productService.getById(id).then((res) => {
          const p = res.data;
          setForm({ name: p.name, price: p.price, description: p.description || '', category: p.category?._id || '', stock: p.stock, isBestSeller: p.isBestSeller, isNew: p.isNew });
          setImages(p.images || []);
          setOptions(p.options || []);
          // Load existing variants with options converted from Map
          const loadedVariants = (p.variants || []).map(v => ({
            ...v,
            options: v.options instanceof Map ? Object.fromEntries(v.options) : v.options
          }));
          setVariants(loadedVariants);
        });
      });
    }
  }, [id]);

  const openWidget = () => {
    if (!window.cloudinary) { setError('Cloudinary widget not loaded'); return; }
    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: CLOUD_NAME, uploadPreset: 'ml_default', sources: ['local', 'url', 'camera'],
        multiple: true, maxFiles: 10, folder: 'products', cropping: true, croppingAspectRatio: 3 / 4,
        resourceType: 'image', clientAllowedFormats: ['jpg', 'png', 'webp'], maxImageFileSize: 5000000,
      },
      (err, result) => { if (!err && result.event === 'success') setImages((prev) => [...prev, result.info.secure_url]); }
    );
    widget.open();
  };

  const removeImage = (index) => setImages((prev) => prev.filter((_, i) => i !== index));
  const moveImage = (index, direction) => {
    setImages((prev) => {
      const arr = [...prev];
      const target = index + direction;
      if (target < 0 || target >= arr.length) return arr;
      [arr[index], arr[target]] = [arr[target], arr[index]];
      return arr;
    });
  };

  // Option management
  const addOption = (type) => {
    if (options.find((o) => o.name === type)) return;
    const defaults = type === 'Size' ? PRESET_OPTIONS.Size.clothing : PRESET_OPTIONS.Color.slice(0, 4);
    setOptions([...options, { name: type, values: defaults }]);
  };
  const removeOption = (name) => setOptions(options.filter((o) => o.name !== name));
  const toggleValue = (optName, value) => {
    setOptions(options.map((o) => {
      if (o.name !== optName) return o;
      const has = o.values.includes(value);
      return { ...o, values: has ? o.values.filter((v) => v !== value) : [...o.values, value] };
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.category) { setError('Name, price, and category are required'); return; }
    const data = { ...form, price: Number(form.price), stock: Number(form.stock) || 0, images, options, variants };
    try {
      if (isEdit) {
        await adminService.updateProduct(id, data);
        // Save variants via bulk upsert
        if (variants.length > 0) {
          await adminService.bulkUpsertVariants(id, variants);
        }
      } else {
        const res = await adminService.createProduct(data);
        // Save variants for new product
        if (variants.length > 0 && res.data?._id) {
          await adminService.bulkUpsertVariants(res.data._id, variants);
        }
      }
      navigate('/admin/products');
    } catch (err) { setError(err.response?.data?.error || 'Failed to save product'); }
  };

  const labelStyle = { fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--color-on-surface-variant)', display: 'block', marginBottom: 4 };
  const chipStyle = (active) => ({ padding: '6px 14px', fontSize: 11, fontWeight: 700, border: active ? '2px solid var(--color-primary)' : '1px solid rgba(0,0,0,0.1)', background: active ? 'var(--color-primary)' : 'transparent', color: active ? '#fff' : 'inherit', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em', transition: 'all 0.15s' });

  return (
    <div>
      <h1 className="admin-page-title">{isEdit ? 'Edit' : 'Add'} Product</h1>
      {error && <div style={{ background: 'var(--color-error-container)', color: 'var(--color-error)', padding: '12px 16px', marginBottom: 24, fontSize: 14 }}>{error}</div>}
      <form onSubmit={handleSubmit} className="admin-dash__orders" style={{ maxWidth: 600, padding: 32, display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div><label style={labelStyle}>Name *</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
        <div><label style={labelStyle}>Price *</label><input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
        <div><label style={labelStyle}>Description</label><textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>

        {/* Cloudinary Image Upload */}
        <div>
          <label style={labelStyle}>Product Images</label>
          <button type="button" onClick={openWidget} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px', background: 'var(--color-surface-container-low)', border: '1px dashed rgba(0,0,0,0.2)', cursor: 'pointer', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>cloud_upload</span>
            Upload Images
          </button>
          {images.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12, marginTop: 16 }}>
              {images.map((url, i) => (
                <div key={i} style={{ position: 'relative', aspectRatio: '3/4', background: 'var(--color-surface-container-lowest)', overflow: 'hidden' }}>
                  <img src={url} alt={`Product ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {i === 0 && <span style={{ position: 'absolute', top: 4, left: 4, background: 'var(--color-primary)', color: '#fff', fontSize: 8, fontWeight: 900, padding: '2px 6px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Main</span>}
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 2, padding: 4, background: 'rgba(0,0,0,0.5)' }}>
                    <button type="button" onClick={() => moveImage(i, -1)} disabled={i === 0} style={{ color: '#fff', fontSize: 14, opacity: i === 0 ? 0.3 : 1 }}><span className="material-symbols-outlined" style={{ fontSize: 14 }}>chevron_left</span></button>
                    <button type="button" onClick={() => removeImage(i)} style={{ color: '#ff4444', fontSize: 14 }}><span className="material-symbols-outlined" style={{ fontSize: 14 }}>delete</span></button>
                    <button type="button" onClick={() => moveImage(i, 1)} disabled={i === images.length - 1} style={{ color: '#fff', fontSize: 14, opacity: i === images.length - 1 ? 0.3 : 1 }}><span className="material-symbols-outlined" style={{ fontSize: 14 }}>chevron_right</span></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label style={labelStyle}>Category *</label>
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            <option value="">Select category</option>
            {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>
        <div><label style={labelStyle}>Stock</label><input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} /></div>

        {/* Options: Size & Color */}
        <div>
          <label style={labelStyle}>Product Options</label>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {['Size', 'Color'].map((type) => (
              <button key={type} type="button" onClick={() => addOption(type)} disabled={options.some((o) => o.name === type)}
                style={{ padding: '8px 16px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', border: '1px dashed rgba(0,0,0,0.2)', background: options.some((o) => o.name === type) ? 'rgba(0,0,0,0.05)' : 'transparent', cursor: options.some((o) => o.name === type) ? 'default' : 'pointer', opacity: options.some((o) => o.name === type) ? 0.4 : 1 }}>
                + {type}
              </button>
            ))}
          </div>
          {options.map((opt) => (
            <div key={opt.name} style={{ marginBottom: 20, padding: 16, background: 'var(--color-surface-container-lowest)', border: '1px solid rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{opt.name}</span>
                <button type="button" onClick={() => removeOption(opt.name)} style={{ fontSize: 11, color: '#ef4444', fontWeight: 700 }}>Remove</button>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {(opt.name === 'Size' ? PRESET_OPTIONS.Size.clothing : PRESET_OPTIONS.Color).map((v) => (
                  <button key={v} type="button" onClick={() => toggleValue(opt.name, v)} style={chipStyle(opt.values.includes(v))}>
                    {v}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Variant Matrix — after option toggles */}
          {options.length > 0 && options.some(o => o.values?.length > 0) && (
            <VariantMatrix options={options} variants={variants} onChange={setVariants} basePrice={Number(form.price) || 0} />
          )}
        </div>

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
