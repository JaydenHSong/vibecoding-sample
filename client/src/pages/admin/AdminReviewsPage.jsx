// Design Ref: §Stitch _9 — Admin Reviews management
import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './AdminPages.css';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchReviews = (p) => {
    setLoading(true);
    adminService.getReviews({ page: p, limit: 20 })
      .then((res) => { setReviews(res.data.data || []); setPagination(res.data.pagination || {}); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchReviews(page); }, [page]);

  const handleApprove = async (id) => { await adminService.approveReview(id); fetchReviews(page); };
  const handleDelete = async (id) => { if (confirm('Delete?')) { await adminService.deleteReview(id); fetchReviews(page); } };

  if (loading) return <LoadingSpinner />;

  const stars = (rating) => Array.from({ length: 5 }, (_, i) => (
    <span key={i} className="material-symbols-outlined" style={{ fontSize: 14, color: i < rating ? 'var(--color-primary)' : 'var(--color-outline-variant)' }}>star</span>
  ));

  return (
    <div>
      <h1 className="admin-page-title">Reviews</h1>
      <div className="admin-dash__orders" style={{ padding: 0 }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ paddingLeft: 32 }}>Product</th>
              <th>User</th>
              <th>Rating</th>
              <th>Content</th>
              <th>Status</th>
              <th style={{ paddingRight: 32 }}></th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((r) => (
              <tr key={r._id}>
                <td style={{ paddingLeft: 32, fontWeight: 500 }}>{r.product?.name || '—'}</td>
                <td style={{ fontSize: 14, color: 'var(--color-on-surface-variant)' }}>{r.user?.name || '—'}</td>
                <td><div style={{ display: 'flex' }}>{stars(r.rating)}</div></td>
                <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 14, color: 'var(--color-on-surface-variant)' }}>{r.content}</td>
                <td>
                  <span className="admin-dash__status" style={{
                    background: r.approved ? '#d1fae5' : 'var(--color-surface-container-high)',
                    color: r.approved ? '#065f46' : 'var(--color-on-surface-variant)',
                  }}>{r.approved ? 'Approved' : 'Pending'}</span>
                </td>
                <td style={{ paddingRight: 32 }}>
                  {!r.approved && <button className="admin-btn admin-btn--approve" onClick={() => handleApprove(r._id)}>Approve</button>}{' '}
                  <button className="admin-btn admin-btn--delete" onClick={() => handleDelete(r._id)}>Delete</button>
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
