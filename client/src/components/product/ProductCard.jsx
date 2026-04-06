import { Link } from 'react-router-dom';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const { _id, name, price, images, category, isNew, isBestSeller } = product;

  return (
    <Link to={`/products/${_id}`} className="product-card group">
      <div className="product-card__image-wrap">
        <img
          src={images?.[0] || 'https://placehold.co/400x533/f5f5f5/ccc?text=No+Image'}
          alt={name}
          className="product-card__image"
        />
        {isBestSeller && (
          <div className="product-card__badge">Best</div>
        )}
        {isNew && !isBestSeller && (
          <div className="product-card__badge product-card__badge--new">New</div>
        )}
      </div>
      <div className="product-card__info">
        <p className="product-card__brand">{category?.name || 'Curated'}</p>
        <h3 className="product-card__name serif">{name}</h3>
        <p className="product-card__price">${price?.toLocaleString()}</p>
      </div>
    </Link>
  );
}
