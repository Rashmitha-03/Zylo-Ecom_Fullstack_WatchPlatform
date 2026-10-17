import React from 'react';

const CartItem = ({ item, image, onIncrease, onDecrease, onRemove }) => (
  <div className="position-relative border rounded px-3 py-3 shadow-sm bg-white d-flex align-items-start gap-3">
    {/* Product Image */}
    <img
      src={image || 'https://dummyimage.com/50x50/cccccc/000000&text=No+Image'}
      alt={item.productName}
      width="70"
      height="70"
      className="rounded"
      style={{ objectFit: 'cover' }}
    />

    {/* Product Info */}
    <div className="flex-grow-1">
      <div className="fw-medium">{item.productName}</div>

      {/* Subtotal */}
      <div className="text-muted small mt-1 mb-2">
        Subtotal: ₹{(item.productPrice * item.quantity).toFixed(2)}
      </div>

      {/* Quantity Controls aligned with subtotal */}
      <div className="d-flex align-items-center gap-2">
        <button
          className="btn btn-outline-secondary px-1 py-0"
          style={{
            width: '24px',
            height: '24px',
            fontSize: '14px',
            borderRadius: '6px',
            opacity: item.quantity <= 0 ? 0.5 : 1,
            pointerEvents: item.quantity <= 0 ? 'none' : 'auto'
          }}
          disabled={item.quantity <= 0}
          title={item.quantity <= 0 ? 'Nothing to decrease' : 'Decrease quantity'}
          onClick={() => onDecrease(item.productId)}
        >–</button>

        <span>{item.quantity}</span>

        <button
          className="btn btn-outline-secondary px-1 py-0"
          style={{
            width: '24px',
            height: '24px',
            fontSize: '14px',
            borderRadius: '6px'
          }}
          onClick={() => onIncrease(item.productId)}
        >+</button>
      </div>
    </div>

    {/* Remove Button - Top Right */}
    <button
      className="btn btn-danger position-absolute"
      style={{
        top: '6px',
        right: '6px',
        width: '22px',
        height: '22px',
        fontSize: '12px',
        padding: 0,
        borderRadius: '50%'
      }}
      onClick={() => onRemove(item.productId)}
    >×</button>
  </div>
);

export default CartItem;
