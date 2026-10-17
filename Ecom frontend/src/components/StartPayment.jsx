import React, { useState, useEffect } from 'react';
import {
  getAddressesByUser,
  getProductById,
  startPayment,
  placeCashOnDelivery
} from '../services/serviceapi';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
 
function StartPayment() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
 
  const { productId, quantity: initialQuantity } = location.state || {};
  const [quantity, setQuantity] = useState(initialQuantity || 1);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [upiId, setUpiId] = useState('');
  const [addresses, setAddresses] = useState([]);
  const [defaultAddress, setDefaultAddress] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [dropdownSelection, setDropdownSelection] = useState('');
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
 
  const userId = user?.id;
 
  useEffect(() => {
    if (!productId) {
      setError('Product information is missing. Please go back and select a product.');
      setLoading(false);
      return;
    }
 
    const fetchCheckoutData = async () => {
      setLoading(true);
      try {
        const [addressRes, productRes] = await Promise.all([
          getAddressesByUser(userId),
          getProductById(productId)
        ]);
        const addrData = addressRes.data;
        setAddresses(addrData);
 
        if (addrData.length > 0) {
          const defaultAddr = addrData.find(addr => addr.default) || addrData[0];
          setDefaultAddress(defaultAddr);
          setSelectedAddress(defaultAddr.id);
          setDropdownSelection('');
        }
 
        setProduct(productRes.data);
      } catch (err) {
        console.error('Error fetching checkout data:', err);
        setError('Failed to load checkout details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
 
    if (userId) {
      fetchCheckoutData();
    }
  }, [userId, productId]);
 
  const handleDropdownChange = (e) => {
    const val = e.target.value;
    setDropdownSelection(val);
    setSelectedAddress(val);
  };
 
  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
 
    try {
      if (!selectedAddress) {
        setError('Please select a shipping address.');
        setLoading(false);
        return;
      }
 
      if (paymentMethod === 'online') {
        const dto = {
          userId,
          productId,
          quantity,
          addressId: Number(selectedAddress),
          upiId: upiId.trim()
        };
 
        if (!/@(ybl|ibl)$/i.test(dto.upiId)) {
          setError('UPI must end with @ybl or @ibl');
          setLoading(false);
          return;
        }
 
        const res = await startPayment(dto);
        const paymentId = res.data.paymentDetails.paymentId;
        navigate(`/update-payment-status/${paymentId}`, {
          state: { orderType: 'single' }
        });
 
      } else if (paymentMethod === 'cod') {
        const dto = {
          userId,
          productId,
          quantity,
          addressId: Number(selectedAddress)
        };
 
        const res = await placeCashOnDelivery(userId, dto);
        const orderId = res.data.orderDetails.orderId;
        navigate(`/cod-order-summary/${orderId}`);
      } else {
        setError('Please select a payment method.');
        setLoading(false);
        return;
      }
    } catch (err) {
      console.error('Order processing failed:', err);
      setError('Something went wrong while placing the order.');
      setLoading(false);
    }
  };
 
  if (loading) {
    return <div className="text-center my-5"><h4>Loading Checkout...</h4></div>;
  }
 
  return (
    <div className="row">
      <style>{`
        .btn-theme {
          background-color: #B57B5B;
          color: #fff;
          border: none;
        }
        .btn-theme:hover {
          background-color: #c08a6a;
        }
        .btn-outline-theme {
          color: #B57B5B;
          border: 1px solid #B57B5B;
          background-color: transparent;
        }
        .btn-outline-theme:hover {
          background-color: #f2e8e1;
          color: #B57B5B;
        }
      `}</style>
 
      <div className="col-md-8 offset-md-2">
        <div className="mb-3" style={{ marginTop: '110px' }}>
          <h2>Check Out</h2>
        </div>
 
        {error && !product && <div className="alert alert-danger">{error}</div>}
 
        {product && (
          <form onSubmit={handleSubmit}>
            <div className="card mb-4">
              <div className="card-body text-center">
                <img
                  src={product.imageURL}
                  alt={product.name}
                  style={{ width: 120, height: 120, objectFit: 'contain' }}
                  className="mb-3"
                />
                <h5>{product.name}</h5>
                <div className="d-flex justify-content-center align-items-center mb-3">
                  <button
                    type="button"
                    className="btn btn-outline-theme me-2"
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  >
                    –
                  </button>
                  <input
                    type="number"
                    min="1"
                    className="form-control text-center w-25"
                    value={quantity}
                    onChange={e => setQuantity(Math.max(1, Number(e.target.value)))}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-theme ms-2"
                    onClick={() => setQuantity(q => q + 1)}
                  >
                    +
                  </button>
                </div>
                <p className="text-muted">{product.description}</p>
                <p><strong>Subtotal:</strong> ₹{product.price * quantity}</p>
              </div>
            </div>
 
            {defaultAddress && dropdownSelection === '' && (
              <div className="card mb-3">
                <div className="card-body bg-light">
                  <h6 className="mb-1">Default Address</h6>
                  <p className="mb-0">
                    {defaultAddress.street}, {defaultAddress.city}, {defaultAddress.state}, {defaultAddress.country}, {defaultAddress.postalCode}
                  </p>
                </div>
              </div>
            )}
 
            <div className="mb-3">
              <label className="form-label">Select Address</label>
              <select
                className="form-select"
                value={dropdownSelection}
                onChange={handleDropdownChange}
              >
                <option value="">-- Select Address --</option>
                {addresses.map((addr) => (
                  <option key={addr.id} value={addr.id}>
                    {addr.street}, {addr.city}, {addr.state}, {addr.country}, {addr.postalCode}
                  </option>
                ))}
              </select>
            </div>
 
            <div className="mb-3">
              <label className="form-label">Payment Method</label>
              <div>
                <button
                  type="button"
                  className={`btn me-2 ${paymentMethod === 'cod' ? 'btn-theme' : 'btn-outline-theme'}`}
                  onClick={() => setPaymentMethod('cod')}
                >
                  Cash on Delivery
                </button>
                <button
                  type="button"
                  className={`btn ${paymentMethod === 'online' ? 'btn-theme' : 'btn-outline-theme'}`}
                  onClick={() => setPaymentMethod('online')}
                >
                  Online Payment
                </button>
              </div>
            </div>
 
            {paymentMethod === 'online' && (
              <div className="mb-3">
                <label className="form-label">UPI ID</label>
                <input
                  type="text"
                  className="form-control"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  required
                />
              </div>
            )}
 
            {error && <div className="alert alert-danger">{error}</div>}
 
            <button
              type="submit"
              className="btn btn-theme w-100"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Place Order'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
 
export default StartPayment;