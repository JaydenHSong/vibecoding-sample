import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IoHeartOutline, IoHeart, IoStarSharp } from 'react-icons/io5';
import { productService } from '../../services/productService';
import { reviewService } from '../../services/reviewService';
import { userService } from '../../services/userService';
import useAuthStore from '../../store/useAuthStore';
import ReviewForm from '../../components/product/ReviewForm';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './ProductDetailPage.css';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedOption, setSelectedOption] = useState('');
  const [isWished, setIsWished] = useState(false);
  const [tab, setTab] = useState('description');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      productService.getById(id),
      reviewService.getByProduct(id),
    ]).then(([prodRes, revRes]) => {
      setProduct(prodRes.data);
      setReviews(revRes.data.data || []);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) { navigate('/login'); return; }
    const { cartService } = await import('../../services/cartService');
    await cartService.addItem({ product: id, quantity: 1, selectedOption });
    navigate('/cart');
  };

  const handleWishlist = async () => {
    if (!user) { navigate('/login'); return; }
    await userService.toggleWishlist(id);
    setIsWished(!isWished);
  };

  if (loading) return <LoadingSpinner />;
  if (!product) return <p style={{ textAlign: 'center', padding: '96px 0' }}>Product not found</p>;

  const images = product.images?.length ? product.images : ['https://placehold.co/800x1066/f3f3f3/ccc?text=No+Image'];

  return (
    <div className="product-detail">
      {/* Gallery */}
      <div className="product-detail__gallery">
        <div className="product-detail__main-image">
          <img src={images[selectedImage]} alt={product.name} />
        </div>
        {images.length > 1 && (
          <div className="product-detail__thumbs">
            {images.map((img, i) => (
              <button key={i} className={`product-detail__thumb ${i === selectedImage ? 'active' : ''}`} onClick={() => setSelectedImage(i)}>
                <img src={img} alt="" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="product-detail__info">
        <span className="label-sm">{product.category?.name}</span>
        <h1 className="serif" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontStyle: 'italic', fontWeight: 400, lineHeight: 1.1, margin: '8px 0 16px' }}>
          {product.name}
        </h1>
        <p className="product-detail__price">${product.price?.toLocaleString()}</p>

        {product.averageRating > 0 && (
          <div className="product-detail__rating">
            <IoStarSharp size={14} />
            <span>{product.averageRating}</span>
            <span style={{ opacity: 0.5 }}>({product.reviewCount} reviews)</span>
          </div>
        )}

        {/* Options */}
        {product.options?.map((opt) => (
          <div key={opt.name} className="product-detail__option">
            <label className="label-sm">{opt.name}</label>
            <div className="product-detail__option-values">
              {opt.values.map((v) => (
                <button key={v} className={`product-detail__option-btn ${selectedOption === v ? 'active' : ''}`} onClick={() => setSelectedOption(v)}>
                  {v}
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Actions */}
        <div className="product-detail__actions">
          <button className="btn-primary" style={{ flex: 1, padding: '16px' }} onClick={handleAddToCart}>
            Add to Cart
          </button>
          <button className="product-detail__wish-btn" onClick={handleWishlist}>
            {isWished ? <IoHeart size={22} /> : <IoHeartOutline size={22} />}
          </button>
        </div>

        {/* Tabs */}
        <div className="product-detail__tabs">
          <button className={`product-detail__tab ${tab === 'description' ? 'active' : ''}`} onClick={() => setTab('description')}>Description</button>
          <button className={`product-detail__tab ${tab === 'reviews' ? 'active' : ''}`} onClick={() => setTab('reviews')}>Reviews ({product.reviewCount || 0})</button>
        </div>

        {tab === 'description' && (
          <div className="product-detail__description">
            <p>{product.description || 'No description available.'}</p>
          </div>
        )}

        {tab === 'reviews' && (
          <div className="product-detail__reviews">
            {reviews.length === 0 ? (
              <p style={{ color: 'var(--color-on-surface-variant)' }}>No reviews yet.</p>
            ) : (
              reviews.map((r) => (
                <div key={r._id} className="product-detail__review">
                  <div className="product-detail__review-header">
                    <strong>{r.user?.name}</strong>
                    <span className="product-detail__review-stars">
                      {Array.from({ length: 5 }, (_, i) => (
                        <IoStarSharp key={i} size={12} style={{ opacity: i < r.rating ? 1 : 0.2 }} />
                      ))}
                    </span>
                  </div>
                  <p>{r.content}</p>
                </div>
              ))
            )}
            <ReviewForm productId={id} onSubmitted={() => reviewService.getByProduct(id).then((res) => setReviews(res.data.data || []))} />
          </div>
        )}
      </div>
    </div>
  );
}
