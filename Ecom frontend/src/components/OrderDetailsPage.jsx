import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  fetchUserOrders,
  fetchAllProducts,
  cancelOrder,
  fetchAddressById
} from '../services/orderService';
import ActionModal from './ActionModal';
import {
  Container,
  Row,
  Col,
  Card,
  Spinner,
  Alert,
  Button,
  Toast,
  ToastContainer
} from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';

import { useLocation } from 'react-router-dom';

const OrderDetailsPage = () => {

const location = useLocation();
const product = location.state?.product;
const totalPrice = product ? product.price * (product.quantity || 1) : 0;


  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [productMap, setProductMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [actionMode, setActionMode] = useState(null);
  const [shippingAddress, setShippingAddress] = useState(null);

  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id;

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'placed': return 'dark';
      case 'delivered': return 'dark';
      case 'replaced': return 'dark';
      case 'cancelled': return 'dark';
      case 'returned': return 'dark';
      default: return 'dark';
    }
  };

  const statusMessages = {
    delivered: 'Your order has been delivered successfully!!',
    cancelled: 'Your order has been cancelled successfully.',
    returned: 'Your order has been returned and refund has been issued successfully.',
    placed: 'Your order has been placed. We’ll update you once it’s shipped.',
    replaced: 'Your item was replaced as requested. Hope it works better!',
  };

  const handleCancelOrder = async () => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    setCanceling(true);
    try {
      await cancelOrder(userId, order.orderId);
      setOrder(prev => ({
        ...prev,
        orderStatus: 'Cancelled',
        products: prev.products.map(p => ({ ...p, status: 'Cancelled' }))
      }));
      setToastMessage('Order cancelled successfully!');
    } catch (err) {
      console.error(err);
      setToastMessage(err.response?.data?.message || 'Cancellation failed.');
    } finally {
      setShowToast(true);
      setCanceling(false);
    }
  };

  const openActionModal = (product, mode) => {
    console.log('Selected product:', product); 
    
setSelectedProduct({
      productId: product.productId,
       productName: product.productName,
      quantity: product.quantity, // ✅ Explicitly preserve quantity
      status: product.status,
      imageUrl: productMap[product.productId] || 'https://via.placeholder.com/140x140?text=No+Image'
    });
  
    setActionMode(mode);
    setShowActionModal(true);
  };

  const handleActionSuccess = async (productId, quantity, mode) => {
    setToastMessage(
      mode === 'return' ? 'Return processed successfully!' : 'Replacement processed successfully!'
    );
    setShowToast(true);
    try {
      const ordersRes = await fetchUserOrders(userId);
      const updatedOrder = ordersRes.data.find(o => o.orderId === order.orderId);
      setOrder(updatedOrder);
    } catch (err) {
      console.error("❌ Failed to re-fetch updated order:", err);
    }
  };

  useEffect(() => {
    const fetchOrder = async () => {
      if (!userId) return;
      try {
        const [orderRes, productRes] = await Promise.all([
          fetchUserOrders(userId),
          fetchAllProducts()
        ]);
        const productLookup = {};
        productRes.data.forEach(p => {
          productLookup[p.productID] = p.imageURL;
        });
        setProductMap(productLookup);
        const matchingOrder = orderRes.data.find(o => o.orderId === orderId);
        setOrder(matchingOrder || null);
        if (matchingOrder?.addressId) {
          try {
            const addressRes = await fetchAddressById(matchingOrder.addressId);
            setShippingAddress(addressRes.data);
          } catch (err) {
            console.error(' Failed to fetch full address:', err);
          }
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, userId]);

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;
  if (!order) return <Alert variant="danger" className="text-center mt-5">Order not found.</Alert>;

  return (
    
    <Container className="my-5" style={{ fontFamily: 'Georgia, serif', marginTop: '10rem' }}>
      
      <Row className="px-3 py-2 align-items-center justify-content-between mb-3" style={{ backgroundColor: '#f8f9fa',marginTop: '6rem' }}>
        <Col md="auto">
          <span style={{ fontWeight: '500' }}>
            Ordered on: {new Date(order.orderTime).toLocaleDateString()}
          </span>
        </Col>
        <Col md="auto" className="d-flex align-items-center gap-2">
          <span style={{ fontWeight: '500' }}>Order ID: {order.orderId}</span>
          <Button
  variant="outline-primary"
  size="sm"
  style={{
    backgroundColor: 'transparent',
    borderColor: '#B57B5B',
    color: 'black',
    fontFamily: 'Georgia, serif',
    boxShadow: 'none'
  }}
>
  INVOICE
</Button>

        </Col>
      </Row>

      <Row className="g-3 mt-4 mb-4">
        <Col md={4}>
          <CardBlock
            title="Shipping Address"
            body={
              shippingAddress
                ? `${shippingAddress.street}, ${shippingAddress.city},\n${shippingAddress.state} - ${shippingAddress.postalCode}, ${shippingAddress.country}`
                : `Address ID: ${order.addressId}`
            }
          />
        </Col>
        <Col md={4}>
          <CardBlock
            title="Payment Details"
            body={`Method: ${order.paymentMethod}\nStatus: ${order.paymentStatus}`}
          />
        </Col>
        <Col md={4}>
          <CardBlock
            title="Order Summary"
            body={`Quantity: ${order.quantity}\nItem Total: ₹${order.totalPrice}\nShipping: Free\nGrand Total: ₹${order.totalPrice}`}
          />
        </Col>
      </Row>

      {order.orderStatus?.toLowerCase() === 'placed' && (
        <div className="text-end my-4">
         <Button
            disabled={canceling}
            style={{
              backgroundColor: 'transparent',
              borderColor: '#B57B5B',
              color: '#000',
              fontFamily: 'Georgia, serif',
              boxShadow: 'none'
            }}
            onClick={handleCancelOrder}
          >
            {canceling ? 'Cancelling...' : 'Cancel Order'}
          </Button>
        </div>
      )}

      {order.products.map((product, idx) => {
        const finalStatus = (product.status || order.orderStatus || '').toLowerCase();
        const message = statusMessages[finalStatus] || '';
        const orderDate = new Date(order.orderTime);
        const daysSinceOrder = Math.floor((Date.now() - orderDate) / (1000 * 60 * 60 * 24));
        const returnExpired = daysSinceOrder > 10;

        return (
          <Card className="mb-3" key={idx}>
            <Card.Body>
              <Row className="align-items-center">
                <Col md={2}>
                  <img
                    src={productMap[product.productId] || 'https://via.placeholder.com/140x140?text=No+Image'}
                    alt={product.productName}
                    className="img-fluid rounded"
                  />
                </Col>
                <Col md={7}>
                  <h5 style={{ fontWeight: 600 }}>{product.productName}</h5>
                  
                  <div className="mt-2">
                    <span className={`badge bg-${getStatusColor(finalStatus)}`} style={{ fontSize: '1rem' }}>
                      {finalStatus.charAt(0).toUpperCase() + finalStatus.slice(1)}
                    </span>
                  </div>
                  {message && (
                    <div className="mt-2" style={{ fontSize: '0.95rem', color: '#000' }}>
                      {message}
                    </div>
                  )}
                  {finalStatus === 'delivered' && returnExpired && (
                    <div className="text-danger mt-2" style={{ fontSize: '0.9rem' }}>
                      Return/Replace period expired.
                    </div>
                  )}
                </Col>
                <Col md={3} className="d-flex flex-column gap-2 align-items-end">
                

                  <Button
                    size="sm"
                    style={{
                      backgroundColor: 'transparent',
                      borderColor: '#B57B5B',
                      color: '#000',
                      fontFamily: 'Georgia, serif',
                      boxShadow: 'none',
                      width: '160px'
                    }}
                    onClick={() => navigate(`/product/${product.productId}`)}
                  >
                    View your item
                  </Button>
                    {['delivered', 'returned', 'replaced'].includes(finalStatus) && (
  <Button
  size="sm"
  style={{
    backgroundColor: 'transparent',
    borderColor: '#B57B5B',
    color: '#000',
    fontFamily: 'Georgia, serif',
    boxShadow: 'none',
    width: '160px'
  }}
  onClick={() => navigate(`/feedback/${product.productId}`)}
>
  Write a review
</Button>
)}

                  {finalStatus === 'delivered' && !returnExpired && (
                    <>
                      <Button
                        size="sm"
                        style={{
                          backgroundColor: 'transparent',
                          borderColor: '#B57B5B',
                          color: '#000',
                          fontFamily: 'Georgia, serif',
                          boxShadow: 'none',
                          width: '160px'
                        }}
                        onClick={() => openActionModal(product, 'return')}
                      >
                        Return
                      </Button>
                      <Button
                        size="sm"
                        style={{
                          backgroundColor: 'transparent',
                          borderColor: '#B57B5B',
                          color: '#000',
                          fontFamily: 'Georgia, serif',
                          boxShadow: 'none',
                          width: '160px'
                        }}
                        onClick={() => openActionModal(product, 'replace')}
                      >
                        Replace
                      </Button>
                    </>
                  )}
                </Col>
              </Row>
            </Card.Body>
          </Card>
        );
      })}

      <ActionModal
        show={showActionModal}
        handleClose={() => setShowActionModal(false)}
        product={selectedProduct}
        orderId={order.orderId}
        paymentMethod={order.paymentMethod}
        onActionSuccess={handleActionSuccess}
        mode={actionMode}
      />

      <ToastContainer position="bottom-end" className="p-3">
        <Toast
          show={showToast}
          onClose={() => setShowToast(false)}
          delay={3000}
          autohide
          bg="light"
        >
          <Toast.Body>{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
};

//  Reusable subcomponent for address/payment/summary cards
const CardBlock = ({ title, body }) => (
  <Card className="w-100 h-100">
    <Card.Body>
      <Card.Title>{title}</Card.Title>
      <Card.Text style={{ whiteSpace: 'pre-wrap' }}>{body}</Card.Text>
    </Card.Body>
  </Card>
);

export default OrderDetailsPage;
