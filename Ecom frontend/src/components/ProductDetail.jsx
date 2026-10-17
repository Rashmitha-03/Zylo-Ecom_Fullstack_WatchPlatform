import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import StarRating from './StarRating';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';


import {
  getProductById,
  getFeedbackByProduct,
  getStockAvailability,
  addToCart
} from '../services/productDetailService';

const ProductDetail = () => {
 

  const location = useLocation();
  const navigate = useNavigate();

  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [stock, setStock] = useState(null);
  const [loading, setLoading] = useState(true);
const {
  productId,
  quantity: initialQuantity, // ⬅️ renamed to avoid conflict
  price,
  totalPrice,
  name
} = location.state || {};

const [quantity, setQuantity] = useState(initialQuantity || 1);


  const { user } = useAuth();
  const userId = user?.id;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productRes, feedbackRes, stockRes] = await Promise.all([
          getProductById(id),
          getFeedbackByProduct(id),
          getStockAvailability(id)
        ]);
        setProduct(productRes.data);
        setFeedbacks(feedbackRes.data);
        setStock(stockRes.data.availableStock);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching product details:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleQuantityChange = (delta) => {
    setQuantity((prev) => {
      const updated = prev + delta;
      return updated < 1 ? 1 : Math.min(updated, stock || 1);
    });
  };

  const handleAddToCart = () => {
    if (!userId) {
      alert('Please log in to add products to your cart.');
      return;
    }

    addToCart(userId, id, quantity)
      .then(() => alert('Product added to cart successfully!'))
      .catch(() => alert('Failed to add product to cart.'));
  };

  if (loading) {
    return (
      <div className="container text-center my-5" style={{ fontFamily: 'Georgia, serif' }}>
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-3">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return <p className="text-center text-danger mt-5" style={{ fontFamily: 'Georgia, serif' }}>Product not found.</p>;
  }

  return (
    <>
      <style>{`
        * {
          font-family: Georgia, serif;
        }
        .btn-brown {
          background-color: #B57B5B !important;
          border-color: #B57B5B !important;
          color: white !important;
        }
        .btn-brown.cart-hover:hover {
          background-color: rgb(221, 174, 147) !important;
          border-color: #a66d4b !important;
        }
      `}</style>

      <div className="container my-5" style={{ paddingTop: '60px' }}>
        <div className="row g-5 align-items-center">
          <div className="col-md-5">
            <div className="ratio ratio-1x1">
              <img
                src={product.imageURL}
                alt={product.name}
                className="img-fluid rounded shadow-sm object-fit-cover"
              />
            </div>
          </div>

          <div className="col-md-7">
            <div className="d-flex flex-column justify-content-between h-100">
              <div className="mb-4">
                <h1 className="fw-bold mb-4">{product.name}</h1>
                <div className="mb-4">
                  <StarRating rating={product.avgRating} />
                </div>
                <p className="text-muted mt-3 mb-4 text-start" style={{ fontSize: '1.2rem' }}>
                  {product.longdescription ?? 'This product is a perfect blend of elegance and utility.'}
                </p>
                <p className="text-muted mb-2">
  <strong>Gender:</strong> {product.gender || 'Not specified'}
</p>
<p className="text-muted mb-2">
  <strong>Material:</strong> {product.material || 'Not specified'}
</p>
<p className="text-muted mb-2">
  <strong>Type:</strong> {product.type || 'Not specified'}
</p>

              </div>

              <div className="mb-3">
                <div className="d-flex flex-wrap align-items-center">
                  <h3 className="text-success mb-0 me-3">₹{product.price}</h3>
                  <span className="text-muted small">
                    <strong>In Stock:</strong> {stock ?? 0}
                  </span>
                </div>
              </div>

              <div className="mb-3">
                <div className="d-flex align-items-center">
                  <div className="input-group rounded shadow-sm" style={{ maxWidth: '160px' }}>
                    <button className="btn btn-outline-secondary" onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}>
                      −
                    </button>
                    <input type="text" className="form-control text-center bg-light" value={quantity} readOnly />
                    <button className="btn btn-outline-secondary" onClick={() => handleQuantityChange(1)} disabled={quantity >= stock}>
                      +
                    </button>
                  </div>
                  <button
                    className="btn btn-brown cart-hover flex-grow-1 ms-3 shadow-sm fw-bold"
                    onClick={handleAddToCart}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>

              <button
                className="btn btn-brown btn-lg shadow-sm fw-bold w-100"
                onClick={() => navigate('/StartPayment', {
                  state: {
                    productId: id,
                    quantity,
                    price: product.price,
                    totalPrice: product.price * quantity,
                    name: product.name
                  }
                })}
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>

        <hr className="my-5" />
        <h3 className="mb-4 text-center">User Feedback</h3>

        {feedbacks.length === 0 ? (
          <p className="text-muted text-center" style={{ fontSize: '1.2rem' }}>
            No feedback has been submitted yet for this product.
          </p>
        ) : (
          <div className="list-group">
            {feedbacks.map((fb, idx) => {
              const ratingColor =
                fb.rating >= 4 ? 'text-success' :
                fb.rating >= 2 ? 'text-warning' : 'text-danger';

              return (
                <div key={idx} className="list-group-item py-3">
                  <div className="row align-items-center">
                    <div className="col-2 text-start fw-semibold">
                      {fb.userName || `User #${idx + 1}`}
                    </div>
                    <div className="col-7 ps-4 pe-4" style={{ textAlign: 'justify' }}>
                      <small className="text-muted d-block">
                        {new Date(fb.createdTime).toLocaleString('en-IN', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </small>
                      <p className="mb-1">{fb.reviewText}</p>
                    </div>
                    <div className={`col-3 text-end ${ratingColor}`}>
                      <div className="d-inline-block">
                        <StarRating rating={fb.rating} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default ProductDetail;
