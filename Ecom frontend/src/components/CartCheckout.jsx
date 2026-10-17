import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  getAddressesByUser,
  placeOrderFromCartCashOnDelivery,
  startCartOnlinePayment,
} from '../services/serviceapi';
import GoBackButton from './GoBackButton';
import { useAuth } from '../contexts/AuthContext';
 
function CartCheckout() {
  const [paymentMethod, setPaymentMethod] = useState('');
  const [upiId, setUpiId] = useState('');
  const [addresses, setAddresses] = useState([]);
  const [defaultAddress, setDefaultAddress] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [dropdownSelection, setDropdownSelection] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const totalPrice = location.state?.totalPrice || 0;
  const cartItems = location.state?.cartItems || [];
  const images = location.state?.images || {};
  const { user } = useAuth();
  const userId = user?.id;
 
  useEffect(() => {
    if (!userId) return;
    getAddressesByUser(userId)
      .then((res) => {
        const fetched = res.data;
        setAddresses(fetched);
        if (fetched.length > 0) {
          const defaultAddr = fetched.find(addr => addr.default) || fetched[0];
          setDefaultAddress(defaultAddr);
          setSelectedAddress(defaultAddr.id);
          setDropdownSelection('');
        }
      })
      .catch((err) => {
        console.error('Error fetching addresses:', err);
        setError('Could not fetch your addresses.');
      });
  }, [userId]);
 
  const handleDropdownChange = (e) => {
    const val = e.target.value;
    setDropdownSelection(val);
    setSelectedAddress(val);
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAddress) {
      setError('Please select a shipping address.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      if (paymentMethod === 'cod') {
        const res = await placeOrderFromCartCashOnDelivery(userId, selectedAddress);
        navigate(`/cod-order-summary/${res.data.orderId}`);
      } else if (paymentMethod === 'online') {
        if (!upiId.includes('@ybl') && !upiId.includes('@ibl')) {
          setError('Enter a valid UPI ID ending with @ybl or @ibl');
          setLoading(false);
          return;
        }
        const cartOnlineDTO = { userId, addressId: selectedAddress, upiId };
        const res = await startCartOnlinePayment(cartOnlineDTO);
        navigate(`/update-payment-status/${res.data.paymentId}`, {
          state: { orderType: 'cart' },
        });
      } else {
        setError('Please select a payment method.');
        setLoading(false);
      }
    } catch (err) {
      console.error('Order processing failed:', err);
      setError('Something went wrong while placing the order.');
      setLoading(false);
    }
  };
 
  return (
    <div className="container" style={{ fontFamily: 'Georgia, serif', marginTop: '6rem' }}>
      <div className="row align-items-center mb-4">
        <div className="col-md-1 d-flex justify-content-end pe-0">
          <GoBackButton />
        </div>
        <div className="col-md-10 ps-4">
          <h2 className="mb-0">Checkout</h2>
        </div>
      </div>
 
      <div className="row">
        <div className="col-md-8 offset-md-2">
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Order Details</h5>
              {cartItems.length > 0 ? (
                <ul className="list-group list-group-flush">
                  {cartItems.map((item) => (
                    <li key={item.productId} className="list-group-item d-flex justify-content-between align-items-center py-3">
                      <div className="d-flex align-items-center">
                        <img
                          src={images[item.productId] || 'https://dummyimage.com/50x50/cccccc/000000.png&text=No+Image'}
                          alt={item.productName}
                          style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px', marginRight: '15px' }}
                        />
                        <div>
                          <h6 className="my-0">{item.productName}</h6>
                          <small className="text-muted">Quantity: {item.quantity}</small>
                        </div>
                      </div>
                      <span className="text-muted">₹{(item.productPrice * item.quantity).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted">No items in the order details.</p>
              )}
            </div>
          </div>
 
          <div className="card mb-4">
            <div className="card-body">
              <p className="card-text fs-4">
                <strong>Order Total:</strong> ₹{totalPrice.toFixed(2)}
              </p>
            </div>
          </div>
 
          {defaultAddress && dropdownSelection === '' && (
            <div className="card mb-3">
              <div className="card-body bg-light">
                <h6 className="mb-1">Default Address</h6>
                <p className="mb-0">
                  {defaultAddress.street}, {defaultAddress.city}, {defaultAddress.state},{' '}
                  {defaultAddress.country}, {defaultAddress.postalCode}
                </p>
              </div>
            </div>
          )}
 
          <form onSubmit={handleSubmit}>
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
                    {addr.street}, {addr.city}, {addr.state}, {addr.country},{' '}
                    {addr.postalCode}
                  </option>
                ))}
              </select>
            </div>
 
            <div className="mb-3">
              <label className="form-label">Payment Method</label>
              <div>
                <button
                  type="button"
                  className="btn me-2"
                  style={{
                    backgroundColor: paymentMethod === 'cod' ? '#B57B5B' : 'transparent',
                    border: '1px solid #B57B5B',
                    color: paymentMethod === 'cod' ? 'white' : '#B57B5B',
                  }}
                  onClick={() => setPaymentMethod('cod')}
                >
                  Cash on Delivery
                </button>
                <button
                  type="button"
                  className="btn"
                  style={{
                    backgroundColor: paymentMethod === 'online' ? '#B57B5B' : 'transparent',
                    border: '1px solid #B57B5B',
                    color: paymentMethod === 'online' ? 'white' : '#B57B5B',
                  }}
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
 
            {error && <div className="alert alert-danger mt-3">{error}</div>}
 
            <button
              className="btn w-100"
              type="submit"
              disabled={loading || !totalPrice}
              style={{
                backgroundColor: '#B57B5B',
                borderColor: '#B57B5B',
                color: 'white',
              }}
            >
              {loading ? 'Processing...' : 'Place Order'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
 
export default CartCheckout;
 