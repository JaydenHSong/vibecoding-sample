import { useState, useEffect } from 'react';
import { supportService } from '../../services/supportService';
import useAuthStore from '../../store/useAuthStore';
import './SupportPage.css';

export default function SupportPage() {
  const user = useAuthStore((s) => s.user);
  const [faqs, setFaqs] = useState([]);
  const [openFaq, setOpenFaq] = useState(null);
  const [inquiries, setInquiries] = useState([]);
  const [form, setForm] = useState({ title: '', content: '' });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    supportService.getFAQ().then((res) => setFaqs(res.data || [])).catch(() => {});
    if (user) supportService.getMyInquiries().then((res) => setInquiries(res.data || [])).catch(() => {});
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.content) { setError('Please fill in all fields'); return; }
    try {
      await supportService.createInquiry(form);
      setForm({ title: '', content: '' });
      setSuccess('Inquiry submitted successfully!');
      setError('');
      const res = await supportService.getMyInquiries();
      setInquiries(res.data || []);
    } catch { setError('Failed to submit inquiry'); }
  };

  return (
    <div className="support-page">
      {/* Editorial Header */}
      <header className="support-page__header">
        <span className="label-sm" style={{ display: 'block', marginBottom: 8 }}>Customer Support</span>
        <h1 className="support-page__title serif">How can we assist your curation?</h1>
      </header>

      {/* 2-Column Layout: FAQ + Notices/Inquiry */}
      <div className="support-page__layout">
        {/* Left: FAQ */}
        <div className="support-page__left">
          <div className="support-page__section-header">
            <h2 className="support-page__section-title">Frequent Questions</h2>
            <span className="support-page__section-count">{faqs.length} FAQ</span>
          </div>
          {faqs.length === 0 ? (
            <p style={{ color: 'var(--color-on-surface-variant)', padding: '24px 0' }}>No FAQs available yet.</p>
          ) : faqs.map((faq) => (
            <div key={faq._id} className="support-faq__item">
              <button className="support-faq__question" onClick={() => setOpenFaq(openFaq === faq._id ? null : faq._id)}>
                <span>{faq.question}</span>
                <span className="material-symbols-outlined" style={{ fontSize: 18, transition: 'transform 0.2s', transform: openFaq === faq._id ? 'rotate(180deg)' : 'none' }}>expand_more</span>
              </button>
              {openFaq === faq._id && <div className="support-faq__answer">{faq.answer}</div>}
            </div>
          ))}

          {/* Inquiry CTA */}
          <div className="support-page__cta">
            <p className="support-page__cta-text">Need personal assistance?</p>
            <div className="support-page__cta-actions">
              {user ? (
                <a href="#inquiry" className="btn-primary" onClick={() => document.getElementById('inquiry')?.scrollIntoView({ behavior: 'smooth' })}>Submit Inquiry</a>
              ) : (
                <a href="/login" className="btn-primary">Sign In to Contact</a>
              )}
              <span className="support-page__cta-phone">+1 (800) CURATED</span>
            </div>
          </div>
        </div>

        {/* Right: Notices + Inquiry */}
        <div className="support-page__right">
          <h2 className="support-page__section-title">Notices</h2>
          <div className="support-page__notices">
            <div className="support-page__notice">
              <span className="support-page__notice-date">2024</span>
              <p>Updated Privacy Terms and Conditions</p>
            </div>
            <div className="support-page__notice">
              <span className="support-page__notice-date">2024</span>
              <p>New Curator Partnership: Minimalist Masters</p>
            </div>
          </div>

          {/* 1:1 Inquiry */}
          {user && (
            <div id="inquiry" className="support-page__inquiry">
              <h2 className="support-page__section-title">1:1 Inquiry</h2>
              {error && <div className="auth-page__error">{error}</div>}
              {success && <div className="mypage__success">{success}</div>}
              <form onSubmit={handleSubmit} className="support-page__inquiry-form">
                <div className="auth-page__field"><label className="auth-page__label">Subject</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="What do you need help with?" /></div>
                <div className="auth-page__field"><label className="auth-page__label">Message</label><textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Describe your issue..." rows={4} /></div>
                <button type="submit" className="btn-primary">Submit Inquiry</button>
              </form>

              {inquiries.length > 0 && (
                <div style={{ marginTop: 32 }}>
                  <h3 className="support-page__section-title">My Inquiries</h3>
                  {inquiries.map((inq) => (
                    <div key={inq._id} className="support-page__inq-card">
                      <div className="support-page__inq-header">
                        <strong>{inq.title}</strong>
                        <span className={`order-badge order-badge--${inq.answer ? 'delivered' : 'pending'}`}>{inq.answer ? 'Answered' : 'Waiting'}</span>
                      </div>
                      <p className="support-page__inq-content">{inq.content}</p>
                      {inq.answer && (
                        <div className="support-page__inq-reply">
                          <span className="auth-page__label">Reply</span>
                          <p>{inq.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
