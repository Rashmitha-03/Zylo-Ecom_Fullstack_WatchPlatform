import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import CartItem from './CartItem';
import {
  fetchCartItems,
  increaseQuantity,
  decreaseQuantity,
  removeItem,
  clearCart,
  fetchProductImage,
  fetchStockAvailability
} from '../services/cartService';
 
const CartDrawer = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
 
  const [items, setItems] = useState([]);
  const [images, setImages] = useState({});
  const [stockMap, setStockMap] = useState({});
  const [subTotal, setSubTotal] = useState(0);
 
  const calculateSubTotal = (cartItems) => {
    const total = cartItems.reduce(
      (acc, item) => acc + item.productPrice * item.quantity,
      0
    );
    setSubTotal(total);
  };
 
  const loadCart = useCallback(async () => {
    if (!user?.id) return;
 
    try {
      const res = await fetchCartItems(user.id);
      const cartData = res.data;
      setItems(cartData);
      calculateSubTotal(cartData);
 
      // Create promises for all image and stock fetches
      const imagePromises = cartData.map(item => fetchProductImage(item.productId));
      const stockPromises = cartData.map(item => fetchStockAvailability(item.productId));
 
      const [resolvedImages, resolvedStocks] = await Promise.all([
        Promise.all(imagePromises.map(p => p.catch(e => console.error(e) || null))), // Handle individual promise rejections
        Promise.all(stockPromises.map(p => p.catch(e => console.error(e) || null)))
      ]);
 
      const newImages = {};
      const newStockMap = {};
      cartData.forEach((item, index) => {
        newImages[item.productId] = resolvedImages[index];
        newStockMap[item.productId] = resolvedStocks[index];
      });
 
      setImages(newImages);
      setStockMap(newStockMap);
 
    } catch (err) {
      console.error('Error loading cart:', err);
    }
  }, [user?.id]);
 
  const handleRemove = async (pid) => {
    await removeItem(user.id, pid);
    loadCart();
  };
 
  const handleIncrease = async (pid) => {
    try {
      await increaseQuantity(user.id, pid, 1);
      loadCart();
    } catch (err) {
      console.error('Increase failed:', err?.response?.data || err.message);
    }
  };
 
  const handleDecrease = async (pid) => {
    await decreaseQuantity(user.id, pid, 1);
    loadCart();
  };
 
  const handleClearCart = async () => {
    await clearCart(user.id);
    loadCart();
  };
 
  useEffect(() => {
    if (isOpen) loadCart();
  }, [isOpen, loadCart]);
 
  return (
    <>
      <style>{`
        * {
          font-family: Georgia, serif;
        }
        .btn-brown {
          background-color: #B57B5B !important;
          border-color: #B57B5B !important;
          color: white;
        }
        /* Checkout button – no hover effect */
        .btn-brown:hover {
          background-color: #B57B5B !important;
          border-color: #B57B5B !important;
        }
        .btn-outline-brown {
          color: #B57B5B;
          border-color: #B57B5B;
        }
        .btn-outline-brown:hover {
          background-color: rgb(200, 162, 142);
          color: white;
          border-color: #B57B5B;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
 
      <div
        className={`offcanvas offcanvas-end ${isOpen ? 'show' : ''}`}
        tabIndex="-1"
        style={{
          visibility: isOpen ? 'visible' : 'hidden',
          width: '370px',
          zIndex: 1050
        }}
      >
        <div className="offcanvas-header d-flex justify-content-between w-100 px-3 pt-3">
          <h5 className="offcanvas-title">Your Cart</h5>
          <div className="d-flex gap-2 align-items-center">
            {items.length > 0 && (
              <button className="btn btn-sm btn-outline-brown" onClick={handleClearCart}>
                CLEAR
              </button>
            )}
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
        </div>
 
        <div className="offcanvas-body d-flex flex-column px-3">
          {items.length === 0 ? (
            <div className="text-center mt-5">
              <div style={{ fontSize: '3rem', animation: 'bounce 1s infinite' }}>🛒</div>
              <div className="mt-2 fw-semibold">Your cart is feeling lonely...</div>
              <div className="text-muted small">Add something nice and give it some company!</div>
            </div>
          ) : (
            <>
              <div className="flex-grow-1 overflow-auto no-scrollbar" style={{ paddingRight: '4px' }}>
                {items.map((item) => (
                  <div className="mb-3" key={item.productId}>
                    <CartItem
                      item={item}
                      image={images[item.productId]}
                      stockQuantity={stockMap[item.productId]}
                      onIncrease={handleIncrease}
                      onDecrease={handleDecrease}
                      onRemove={handleRemove}
                    />
                  </div>
                ))}
              </div>
 
              <div
                className="border-top bg-white pt-3"
                style={{
                  position: 'sticky',
                  bottom: 0,
                  zIndex: 20,
                  paddingBottom: '1rem'
                }}
              >
                <div className="d-grid gap-3">
                  <div className="d-flex justify-content-between fw-bold fs-6 mb-2">
                    <span>Total</span>
                    <span>₹{subTotal.toFixed(2)}</span>
                  </div>
 
                  <button
                    className="btn btn-outline-brown"
                    onClick={() => {
                      onClose();
                      navigate('/CartPage');
                    }}
                  >
                    View Cart
                  </button>
 
                  <button
                    className="btn btn-brown"
                    onClick={() => {
                      onClose();
                      // *** IMPORTANT CHANGE HERE ***
                      navigate('/cartcheckout', {
                        state: {
                          totalPrice: subTotal,
                          cartItems: items, // Pass the cart items
                          images: images   // Pass the images map
                        }
                      });
                    }}
                  >Checkout</button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};
 
export default CartDrawer;
 