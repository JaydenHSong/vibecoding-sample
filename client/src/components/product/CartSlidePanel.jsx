export default function CartConfirmModal({ product, selectedOptions, quantity, onClose, onGoToCart }) {
  const image = product.images?.[0] || '';
  const optionText = Object.entries(selectedOptions).map(([k, v]) => `${k}: ${v}`).join(' · ');

  return (
    <>
      <div className="cart-modal__overlay" onClick={onClose} />
      <div className="cart-modal">
        <div className="cart-modal__icon">
          <span className="material-symbols-outlined" style={{ fontSize: 32, color: '#20B832' }}>check_circle</span>
        </div>
        <h3 className="cart-modal__title">Added to Cart</h3>
        <div className="cart-modal__product">
          <img src={image} alt={product.name} className="cart-modal__image" />
          <div>
            <p className="cart-modal__name serif">{product.name}</p>
            {optionText && <p className="cart-modal__option">{optionText}</p>}
            <p className="cart-modal__qty">Qty: {quantity} · ${(product.price * quantity).toLocaleString()}</p>
          </div>
        </div>
        <div className="cart-modal__actions">
          <button className="btn-primary" style={{ width: '100%', padding: '14px' }} onClick={onGoToCart}>
            Go to Cart
          </button>
          <button className="btn-secondary" style={{ width: '100%', padding: '14px' }} onClick={onClose}>
            Continue Shopping
          </button>
        </div>
      </div>
    </>
  );
}
