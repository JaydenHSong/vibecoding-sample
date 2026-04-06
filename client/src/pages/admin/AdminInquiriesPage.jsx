// Design Ref: §Stitch _9 — Admin Inquiries management
import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './AdminPages.css';

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState([]);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [answering, setAnswering] = useState(null);
  const [answerText, setAnswerText] = useState('');

  const fetchInquiries = (p) => {
    setLoading(true);
    adminService.getInquiries({ page: p, limit: 20 })
      .then((res) => { setInquiries(res.data.data || []); setPagination(res.data.pagination || {}); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchInquiries(page); }, [page]);

  const handleAnswer = async (id) => {
    if (!answerText.trim()) return;
    await adminService.answerInquiry(id, answerText);
    setAnswering(null);
    setAnswerText('');
    fetchInquiries(page);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="admin-page-title">Inquiries</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {inquiries.map((inq) => (
          <div key={inq._id} className="admin-dash__orders" style={{ padding: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <strong style={{ fontSize: 14 }}>{inq.title}</strong>
              <span className="admin-dash__status" style={{
                background: inq.answer ? '#d1fae5' : 'var(--color-surface-container-high)',
                color: inq.answer ? '#065f46' : 'var(--color-on-surface-variant)',
              }}>{inq.answer ? 'Answered' : 'Waiting'}</span>
            </div>
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--color-on-surface-variant)', marginBottom: 8 }}>
              {inq.user?.name} ({inq.user?.email}) — {new Date(inq.createdAt).toLocaleDateString()}
            </p>
            <p style={{ color: 'var(--color-on-surface-variant)', fontSize: 14 }}>{inq.content}</p>

            {inq.answer && (
              <div style={{ marginTop: 16, padding: 16, background: 'var(--color-surface-container-low)' }}>
                <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--color-on-surface-variant)' }}>Reply</span>
                <p style={{ marginTop: 4, fontSize: 14 }}>{inq.answer}</p>
              </div>
            )}

            {!inq.answer && (
              answering === inq._id ? (
                <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                  <textarea value={answerText} onChange={(e) => setAnswerText(e.target.value)} placeholder="Type your reply..." rows={2} style={{ flex: 1 }} />
                  <button className="btn-primary" onClick={() => handleAnswer(inq._id)}>Send</button>
                  <button className="btn-secondary" onClick={() => { setAnswering(null); setAnswerText(''); }}>Cancel</button>
                </div>
              ) : (
                <button className="admin-btn admin-btn--edit" style={{ marginTop: 16 }} onClick={() => setAnswering(inq._id)}>Reply</button>
              )
            )}
          </div>
        ))}
      </div>
      <Pagination page={pagination.page || 1} totalPages={pagination.totalPages || 1} onPageChange={setPage} />
    </div>
  );
}
