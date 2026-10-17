import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Spinner } from 'react-bootstrap';
import api from '../api';

const OrderModal = ({ order }) => {
  const [items, setItems] = useState([]);
  const [productMap, setProductMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [orderDto, setOrderDto] = useState(null);

  const getStatusColor = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'placed': return '#A8A29E';      // Warm Gray
      case 'delivered': return '#9BAE9E';   // Sage Green
      case 'cancelled': return '#D7A9A3';   // Dusty Rose
      case 'returned': return '#6C9A8B';    // Muted Teal
      case 'replaced': return '#D4C06F';    // Soft Mustard
      default: return '#B0B0B0';            // Neutral Gray fallback
    }
  };

  useEffect(() => {
    const fetchItemsAndImages = async () => {
      try {
        const [orderRes, productRes] = await Promise.all([
          api.get(`/orders/search/${order.userId}/${order.orderId}`),
          api.get(`/api/ecom/getAllProducts`)
        ]);

        const fetchedOrder = orderRes.data;
        setOrderDto(fetchedOrder);

        if (order.updateAmountInPanel && fetchedOrder.orderAmount > 0) {
          order.updateAmountInPanel(fetchedOrder.orderAmount);
        }

        const imageMap = {};
        productRes.data.forEach(p => {
          imageMap[p.productID] = p.imageURL;
        });
        setProductMap(imageMap);

        const flatItems = (fetchedOrder.products || []).map(p => ({
          ...p,
          imageUrl: imageMap[p.productId] || 'https://via.placeholder.com/140x140?text=Image',
          quantity: p.quantity || fetchedOrder.quantity || 1,
          status: p.status || fetchedOrder.orderStatus || 'placed'
        }));

        setItems(flatItems);
      } catch (err) {
        console.error('Error fetching order details:', err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchItemsAndImages();
  }, [order.userId, order.orderId]);

  if (loading) {
    return (
      <div className="text-center py-4" style={{ fontFamily: 'Georgia, serif' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="text-muted text-center my-4" style={{ fontFamily: 'Georgia, serif' }}>
        No items found for this order.
      </div>
    );
  }

  return (
    <Row xs={1} md={2} className="g-4" style={{ fontFamily: 'Georgia, serif' }}>
      {items.map((item, idx) => (
        <Col key={idx}>
          <Card className="shadow-sm h-100">
            <Card.Img
              variant="top"
              src={
                productMap[item.productId]?.startsWith('http')
                  ? productMap[item.productId]
                  : `http://localhost:8015${productMap[item.productId]}`
              }
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/140x140?text=No+Image';
              }}
              style={{ height: '180px', objectFit: 'contain' }}
            />
            <Card.Body>
              <Card.Title style={{ fontFamily: 'Georgia, serif' }}>
                {item.productName || 'Unnamed Product'}
              </Card.Title>
              <Card.Text>
                <div>Quantity: <strong>{item.quantity}</strong></div>
                {orderDto && (
                  <div>Total Order Amount: ₹<strong>{orderDto.orderAmount}</strong></div>
                )}
                <div>
                  Status:
                  <span
                    style={{
                      backgroundColor: getStatusColor(item.status),
                      color: '#fff',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '0.25rem',
                      marginLeft: '0.5rem',
                      fontSize: '0.85rem',
                      display: 'inline-block',
                      fontFamily: 'Georgia, serif'
                    }}
                  >
                    {item.status}
                  </span>
                </div>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default OrderModal;
