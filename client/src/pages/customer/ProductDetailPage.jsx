import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IoHeartOutline, IoHeart, IoStarSharp } from 'react-icons/io5';
import { productService } from '../../services/productService';
import { reviewService } from '../../services/reviewService';
import { userService } from '../../services/userService';
import useAuthStore from '../../store/useAuthStore';
import useCartStore from '../../store/useCartStore';
import ImageGallery from '../../components/product/ImageGallery';
import OptionSelector from '../../components/product/OptionSelector';
import CartConfirmModal from '../../components/product/CartSlidePanel';
import ReviewForm from '../../components/product/ReviewForm';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './ProductDetailPage.css';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [isWished, setIsWished] = useState(false);
  const [tab, setTab] = useState('description');
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [showConfirm, setShowConfirm] = useState(false);
  const [optionError, setOptionError] = useState('');

  useEffect(() => {
    Promise.all([
      productService.getById(id),
      reviewService.getByProduct(id),
    ]).then(([prodRes, revRes]) => {
      setProduct(prodRes.data);
      setReviews(revRes.data.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  // Design Ref: §5.2 — variant-aware add to cart with stock validation
  const handleAddToCart = async () => {
    if (!user) { navigate('/login'); return; }

    const hasVariants = product.variants?.length > 0;
    const hasOptions = product.options?.length > 0;

    if (hasOptions && hasVariants) {
      if (!selectedVariant) {
        const missing = product.options?.filter((opt) => !selectedOptions[opt.name]).map((opt) => opt.name);
        setOptionError(missing?.length ? `Please select ${missing.join(' and ')}` : 'Selected option is unavailable');
        return;
      }
      if (selectedVariant.stock < quantity) {
        setOptionError(`Only ${selectedVariant.stock} items available`);
        return;
      }
    } else if (hasOptions) {
      const missing = product.options?.filter((opt) => !selectedOptions[opt.name]).map((opt) => opt.name);
      if (missing?.length) { setOptionError(`Please select ${missing.join(' and ')}`); return; }
    }

    setOptionError('');
    const { cartService } = await import('../../services/cartService');

    if (hasVariants && selectedVariant) {
      await cartService.addItem({ product: id, variant: selectedVariant._id, quantity });
    } else {
      const optionStr = Object.entries(selectedOptions).map(([k, v]) => `${k}: ${v}`).join(', ');
      await cartService.addItem({ product: id, quantity, selectedOption: optionStr });
    }

    useCartStore.getState().fetchCart();
    setShowConfirm(true);
  };

  const handleWishlist = async () => {
    if (!user) { navigate('/login'); return; }
    await userService.toggleWishlist(id);
    setIsWished(!isWished);
  };

  if (loading) return <LoadingSpinner />;
  if (!product) return <p style={{ textAlign: 'center', padding: '96px 0' }}>Product not found</p>;

  // Plan SC: SC-03 — display variant price when selected
  const displayPrice = selectedVariant ? selectedVariant.price : product.price;
  const hasVariants = product.variants?.length > 0;
  const canAddToCart = hasVariants
    ? selectedVariant && selectedVariant.stock > 0
    : true;

  return (
    <div className="product-detail">
      <ImageGallery images={product.images} name={product.name} />

      <div className="product-detail__info">
        <span className="label-sm">{product.category?.name}</span>
        <h1 className="serif" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontStyle: 'italic', fontWeight: 400, lineHeight: 1.1, margin: '8px 0 16px' }}>
          {product.name}
        </h1>
        <p className="product-detail__price">${displayPrice?.toLocaleString()}</p>

        {product.averageRating > 0 && (
          <div className="product-detail__rating">
            <IoStarSharp size={14} />
            <span>{product.averageRating}</span>
            <span style={{ opacity: 0.5 }}>({product.reviewCount} reviews)</span>
          </div>
        )}

        <OptionSelector
          options={product.options}
          variants={product.variants}
          selectedOptions={selectedOptions}
          onChange={setSelectedOptions}
          onVariantSelect={setSelectedVariant}
        />

        {/* Quantity */}
        <div className="product-detail__quantity">
          <label className="label-sm">Quantity</label>
          <div className="product-detail__qty-control">
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>remove</span>
            </button>
            <span>{quantity}</span>
            <button onClick={() => setQuantity(quantity + 1)}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
            </button>
          </div>
        </div>

        {/* Actions */}
        {optionError && <p style={{ color: 'var(--color-error, #ef4444)', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{optionError}</p>}
        <div className="product-detail__actions">
          <button className="btn-primary" style={{ flex: 1, padding: '16px' }} onClick={handleAddToCart} disabled={!canAddToCart}>
            {hasVariants && selectedVariant?.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
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

      {showConfirm && (
        <CartConfirmModal
          product={{ ...product, price: displayPrice }}
          selectedOptions={selectedOptions}
          quantity={quantity}
          onClose={() => { setShowConfirm(false); setQuantity(1); }}
          onGoToCart={() => navigate('/cart')}
        />
      )}
    </div>
  );
}
