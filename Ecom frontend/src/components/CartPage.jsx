import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Button, Spinner, Alert } from 'react-bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useNavigate } from 'react-router-dom';
import {
  fetchCartItems,
  increaseQuantity,
  decreaseQuantity,
  removeItem,
  fetchProductImage,
} from '../services/cartService';
import { useAuth } from '../contexts/AuthContext';
 
const CartPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [images, setImages] = useState({});
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
 
  const loadCart = async () => {
    if (!user?.id) return;
    try {
      const res = await fetchCartItems(user.id);
      const items = res.data;
      setCartItems(items);
      setLoading(false);
 
      for (const item of items) {
        try {
          const imageUrl = await fetchProductImage(item.productId);
          setImages((prev) => ({ ...prev, [item.productId]: imageUrl }));
        } catch (err) {
          console.error(`Image error for product ${item.productId}`, err);
        }
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      setLoading(false);
    }
  };
 
  useEffect(() => {
    loadCart();
  }, [user?.id]);
 
  const handleQuantityChange = async (productId, action) => {
    try {
      if (action === 'increase') {
        await increaseQuantity(user.id, productId, 1);
      } else {
        await decreaseQuantity(user.id, productId, 1);
      }
      await loadCart();
      setErrors((prev) => ({ ...prev, [productId]: null }));
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'OUT OF STOCK';
      setErrors((prev) => ({ ...prev, [productId]: errorMsg }));
    }
  };
 
  const handleRemove = async (productId) => {
    try {
      await removeItem(user.id, productId);
      await loadCart();
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };
 
  const productSubtotal = cartItems.reduce(
    (sum, item) => sum + item.productPrice * item.quantity,
    0
  );
 
  if (loading || !user?.id) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" />
      </Container>
    );
  }
 
  return (
    <Container fluid className="px-3 px-sm-4 px-md-5 py-4 pt-5" style={{ backgroundColor: '#ffffff' }}>
      <h2 className="text-center mb-5 mt-5">Shopping Cart</h2>
 
      {cartItems.length === 0 ? (
        <Alert variant="info" className="text-center">Your cart is currently empty.</Alert>
      ) : (
        <Row>
          <Col xs={12} lg={8}>
            {cartItems.map((item) => (
              <div key={item.productId} className="mb-4 p-3 border rounded shadow-sm bg-white">
                <Row className="align-items-center gy-3 text-center text-md-start">
                  <Col xs={12} sm={4} md={2}>
                    <div style={{ width: '100%', aspectRatio: '1', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ddd' }}>
                      <img
                        src={images[item.productId] || 'https://dummyimage.com/100x100/cccccc/000000.png&text=No+Image'}
                        alt={item.productName}
                        className="img-fluid h-100 w-100"
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                  </Col>
 
                  <Col xs={12} sm={8} md={4}>
                    <div className="fw-bold">{item.productName}</div>
                    <small className="text-muted">In Stock</small>
                  </Col>
 
                  <Col xs={12} md={2}>
                    <div className="d-flex justify-content-center justify-content-md-start gap-2">
                      <Button size="sm" variant="outline-secondary" onClick={() => handleQuantityChange(item.productId, 'decrease')}>−</Button>
                      <span>{item.quantity}</span>
                      <Button size="sm" variant="outline-secondary" onClick={() => handleQuantityChange(item.productId, 'increase')}>+</Button>
                    </div>
                    {errors[item.productId] && (
                      <div className="text-danger small mt-1">{errors[item.productId]}</div>
                    )}
                  </Col>
 
                  <Col xs={6} md={2}><div>₹{item.productPrice}</div></Col>
                  <Col xs={6} md={1}><div className="fw-semibold">₹{(item.productPrice * item.quantity).toFixed(2)}</div></Col>
                  <Col xs={12} md={1} className="text-end">
                    <Button variant="link" size="sm" className="text-danger p-0" onClick={() => handleRemove(item.productId)}>
                      <i className="bi bi-x-circle-fill fs-5"></i>
                    </Button>
                  </Col>
                </Row>
              </div>
            ))}
          </Col>
 
          <Col xs={12} lg={4}>
            <div className="p-4 border rounded shadow-sm mt-4 mt-lg-0 bg-light">
              <h5 className="mb-4 border-bottom pb-2">Order Summary</h5>
 
              <Row className="mb-2"><Col>Subtotal</Col><Col className="text-end">₹{productSubtotal.toFixed(2)}</Col></Row>
 
              {cartItems.map((item) => (
                <Row key={item.productId} className="mb-2">
                  <Col className="text-muted small">
                    {item.productName} × {item.quantity}
                  </Col>
                  <Col className="text-end text-muted small">
                    ₹{(item.productPrice * item.quantity).toFixed(2)}
                  </Col>
                </Row>
              ))}
 
              <Row className="mb-2"><Col>Shipping Charges</Col><Col className="text-end">Free</Col></Row>
              <hr />
              <Row><Col className="fw-bold">Total</Col><Col className="text-end fw-bold">₹{productSubtotal.toFixed(2)}</Col></Row>
 
              <div className="d-grid mt-4">
                <Button
                  onClick={() => navigate('/cartcheckout', {
                    state: {
                      totalPrice: productSubtotal,
                      cartItems: cartItems, // Pass cartItems
                      images: images // Pass images
                    }
                  })}
                  style={{
                    backgroundColor: '#B57B5B',
                    borderColor: '#B57B5B',
                    color: 'white'
                  }}
                >
                  Proceed to Checkout
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      )}
    </Container>
  );
};
 
export default CartPage;