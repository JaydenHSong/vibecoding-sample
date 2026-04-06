// Design Ref: §Stitch _9 — Admin Banners management
import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './AdminPages.css';

export default function AdminBannersPage() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', image: '', link: '', position: 'main', order: 0 });
  const [editing, setEditing] = useState(null);

  const fetch = () => { adminService.getBanners().then((res) => setBanners(res.data || [])).catch(() => {}).finally(() => setLoading(false)); };
  useEffect(fetch, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.image) return;
    if (editing) await adminService.updateBanner(editing, form);
    else await adminService.createBanner(form);
    setForm({ title: '', image: '', link: '', position: 'main', order: 0 });
    setEditing(null);
    fetch();
  };

  const handleDelete = async (id) => { if (confirm('Delete?')) { await adminService.deleteBanner(id); fetch(); } };
  const handleEdit = (b) => { setEditing(b._id); setForm({ title: b.title, image: b.image, link: b.link || '', position: b.position, order: b.order || 0 }); };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="admin-page-title">Banners</h1>

      {/* Banner Form */}
      <form onSubmit={handleSubmit} className="admin-dash__orders" style={{ padding: 32, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 24 }}>
        <div style={{ flex: 1, minWidth: 150 }}>
          <label style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--color-on-surface-variant)', display: 'block', marginBottom: 4 }}>Title</label>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div style={{ flex: 2, minWidth: 200 }}>
          <label style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--color-on-surface-variant)', display: 'block', marginBottom: 4 }}>Image URL</label>
          <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
        </div>
        <div style={{ flex: 1, minWidth: 150 }}>
          <label style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--color-on-surface-variant)', display: 'block', marginBottom: 4 }}>Link</label>
          <input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} />
        </div>
        <select value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} style={{ width: 'auto' }}>
          <option value="main">Main</option>
          <option value="popup">Popup</option>
        </select>
        <button type="submit" className="btn-primary">{editing ? 'Update' : 'Add'}</button>
        {editing && <button type="button" className="btn-secondary" onClick={() => { setEditing(null); setForm({ title: '', image: '', link: '', position: 'main', order: 0 }); }}>Cancel</button>}
      </form>

      {/* Banner Table */}
      <div className="admin-dash__orders" style={{ padding: 0 }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ paddingLeft: 32 }}></th>
              <th>Title</th>
              <th>Position</th>
              <th>Active</th>
              <th style={{ paddingRight: 32 }}></th>
            </tr>
          </thead>
          <tbody>
            {banners.map((b) => (
              <tr key={b._id}>
                <td style={{ paddingLeft: 32 }}><img className="admin-table__img" src={b.image} alt="" style={{ width: 96, height: 54 }} /></td>
                <td style={{ fontWeight: 500 }}>{b.title}</td>
                <td>
                  <span className="admin-dash__status" style={{ background: 'var(--color-surface-container-high)', color: 'var(--color-on-surface-variant)' }}>{b.position}</span>
                </td>
                <td>
                  <span className="admin-dash__status" style={{
                    background: b.isActive ? '#d1fae5' : 'var(--color-surface-container-high)',
                    color: b.isActive ? '#065f46' : 'var(--color-on-surface-variant)',
                  }}>{b.isActive ? 'Yes' : 'No'}</span>
                </td>
                <td style={{ paddingRight: 32 }}>
                  <button className="admin-btn admin-btn--edit" onClick={() => handleEdit(b)}>Edit</button>{' '}
                  <button className="admin-btn admin-btn--delete" onClick={() => handleDelete(b._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
