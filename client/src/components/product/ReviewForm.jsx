import { useState } from 'react';
import { IoStarSharp, IoStarOutline } from 'react-icons/io5';
import { reviewService } from '../../services/reviewService';
import useAuthStore from '../../store/useAuthStore';

export default function ReviewForm({ productId, onSubmitted }) {
  const user = useAuthStore((s) => s.user);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!user) return null;
  if (success) return <p className="text-sm text-[#065f46] bg-[#d1fae5] p-4 rounded-sm">Review submitted! It will appear after approval.</p>;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) { setError('Please select a rating'); return; }
    if (!content.trim()) { setError('Please write your review'); return; }
    setLoading(true);
    try {
      await reviewService.create({ product: productId, rating, content });
      setSuccess(true);
      if (onSubmitted) onSubmitted();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit review');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 pt-6" style={{ borderTop: '1px solid rgba(207,196,197,0.2)' }}>
      <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Write a Review</h4>
      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
      <div className="flex gap-1 mb-4">
        {[1,2,3,4,5].map((star) => (
          <button key={star} type="button" onMouseEnter={() => setHover(star)} onMouseLeave={() => setHover(0)} onClick={() => { setRating(star); setError(''); }}>
            {star <= (hover || rating) ? <IoStarSharp size={20} /> : <IoStarOutline size={20} className="opacity-30" />}
          </button>
        ))}
      </div>
      <textarea
        value={content}
        onChange={(e) => { setContent(e.target.value); setError(''); }}
        placeholder="Share your experience..."
        rows={3}
        className="w-full p-3 text-sm border-b border-gray-200 focus:border-[#006876] bg-transparent outline-none resize-none"
      />
      <button type="submit" disabled={loading} className="mt-3 px-6 py-2 bg-black text-white text-xs font-semibold uppercase tracking-widest hover:opacity-80 disabled:opacity-40">
        {loading ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
}
