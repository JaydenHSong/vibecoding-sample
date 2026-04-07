import { Link } from 'react-router-dom';
import './CartItem.css';

export default function CartItem({ item, onUpdate, onRemove }) {
  const { product, variant, quantity, selectedOption, _id } = item;

  // Use variant price if available, fallback to product price
  const unitPrice = variant?.price || product?.price || 0;
  const optionText = variant?.options
    ? Object.entries(variant.options instanceof Map ? Object.fromEntries(variant.options) : variant.options).map(([k, v]) => `${k}: ${v}`).join(' / ')
    : selectedOption;

  return (
    <article className="cart-item">
      <Link to={`/products/${product?._id}`} className="cart-item__image">
        <img src={product?.images?.[0] || 'https://placehold.co/256x340/f3f3f3/ccc'} alt={product?.name} />
      </Link>
      <div className="cart-item__body">
        <div className="cart-item__top">
          <div>
            <h3 className="cart-item__name">{product?.name}</h3>
            <p className="cart-item__meta">
              {product?.category?.name || 'Curated'}
              {optionText && ` / ${optionText}`}
            </p>
          </div>
          <span className="cart-item__price">${(unitPrice * quantity).toLocaleString()}</span>
        </div>
        <div className="cart-item__bottom">
          <div className="cart-item__quantity">
            <button onClick={() => onUpdate(_id, Math.max(1, quantity - 1))} disabled={quantity <= 1}>
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>remove</span>
            </button>
            <span className="cart-item__qty-value">{quantity}</span>
            <button onClick={() => onUpdate(_id, quantity + 1)}>
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>add</span>
            </button>
          </div>
          <button className="cart-item__remove" onClick={() => onRemove(_id)}>
            Remove Piece
          </button>
        </div>
      </div>
    </article>
  );
}
