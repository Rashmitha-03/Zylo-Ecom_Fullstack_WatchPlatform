import React, { useEffect, useState, useRef } from 'react';
import {
  Container, Row, Col, Image, Button, Spinner, Alert, Form
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

import { fetchOrdersByUser, fetchAllProducts } from '../services/orderService';
import { useAuth } from '../contexts/AuthContext';

const OrdersPage = () => {
    
  const [productCards, setProductCards] = useState([]);
  const [filteredCards, setFilteredCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('All');
  const [dateOptions, setDateOptions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const { user } = useAuth();
  const userId = user?.id;
  const navigate = useNavigate();
  const refs = useRef([]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'placed': return 'dark';
      case 'delivered': return 'dark';
      case 'replaced': return 'dark';
      case 'cancelled': return 'dark';
      case 'returned': return 'dark';
      default: return 'dark';
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;

      try {
        const [orderRes, productRes] = await Promise.all([
          fetchOrdersByUser(userId),
          fetchAllProducts()
        ]);

        const imageMap = {};
        productRes.data.forEach(product => {
          imageMap[product.productID] = product.imageURL;
        });

        const flatProducts = orderRes.data.flatMap(order =>
          (order.products || []).map(product => {
            const orderDate = new Date(order.orderTime);
            const status = (product.status || order.orderStatus || '').toLowerCase();
            return {
              ...product,
              imageUrl: imageMap[product.productId] || 'https://via.placeholder.com/140x140?text=Image',
              orderTime: order.orderTime,
              orderStatus: status,
              orderId: order.orderId,
              orderDate
            };
          })
        );

        flatProducts.sort((a, b) => new Date(b.orderTime) - new Date(a.orderTime));

        const fixedFilters = [
          { label: 'All', value: 'All' },
          { label: 'Past 15 Days', value: '15d' },
          { label: 'Past 30 Days', value: '30d' },
          { label: 'Past 3 Months', value: '3m' },
          { label: 'Past 6 Months', value: '6m' }
        ];

        const dynamicYears = Array.from(
          new Set(flatProducts.map(p => p.orderDate.getFullYear()))
        ).sort((a, b) => b - a).map(y => ({ label: y.toString(), value: y.toString() }));

        setDateOptions([...fixedFilters, ...dynamicYears]);
        setProductCards(flatProducts);
        setFilteredCards(flatProducts);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFilter = () => {
    const now = new Date();
    const filtered = productCards.filter(p => {
      const statusMatch = statusFilter ? p.orderStatus === statusFilter : true;
      let dateMatch = true;

      if (dateFilter === '15d') {
        dateMatch = (now - p.orderDate) / (1000 * 60 * 60 * 24) <= 15;
      } else if (dateFilter === '30d') {
        dateMatch = (now - p.orderDate) / (1000 * 60 * 60 * 24) <= 30;
      } else if (dateFilter === '3m') {
        const past = new Date();
        past.setMonth(now.getMonth() - 3);
        dateMatch = p.orderDate >= past;
      } else if (dateFilter === '6m') {
        const past = new Date();
        past.setMonth(now.getMonth() - 6);
        dateMatch = p.orderDate >= past;
      } else if (!['All', '15d', '30d', '3m', '6m'].includes(dateFilter)) {
        dateMatch = p.orderDate.getFullYear().toString() === dateFilter;
      }

      return statusMatch && dateMatch;
    });

    setCurrentPage(1);
    setFilteredCards(filtered);
  };

  const clearFilters = () => {
    setStatusFilter('');
    setDateFilter('All');
    setFilteredCards(productCards);
    setCurrentPage(1);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCards = filteredCards.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCards.length / itemsPerPage);
  refs.current = currentCards.map((_, i) => refs.current[i] || React.createRef());

  const statusMsgMap = {
    delivered: 'Your order has been delivered successfully!',
    cancelled: 'Your order has been cancelled successfully!',
    returned: 'Your order has been returned and refund has been issued successfully!',
    placed: 'Your order has been placed! We’ll update you once it’s shipped.',
    replaced: 'Your item was replaced as requested. Hope it works better!'
  };

  return (
    <>
      

      <Container fluid style={{  minHeight: '100vh', padding: '2rem', fontFamily: 'Georgia, serif' ,marginTop: '6rem'}}>
        <div className="bg-white p-3 mb-4 rounded shadow-sm border">
          <Row className="mb-3">
            <Col md={6}>
              <label className="form-label">Order Status</label>
              <div className="d-flex flex-wrap gap-2">
  {['placed', 'delivered', 'cancelled', 'returned', 'replaced'].map(status => {
    const isSelected = statusFilter === status;
    return (
      <Button
        key={status}
        onClick={() =>
          setStatusFilter(isSelected ? '' : status)
        }
        size="sm"
        style={{
          backgroundColor: isSelected ? '#B57B5B' : 'transparent',
          borderColor: '#B57B5B',
          color: isSelected ? '#fff' : '#000',
          fontFamily: 'Georgia, serif',
          boxShadow: 'none'
        }}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Button>
    );
  })}
</div>

            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Order Date</Form.Label>
                <Form.Select
                  value={dateFilter}
                  onChange={e => setDateFilter(e.target.value)}
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  {dateOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <div className="d-flex gap-2">
          <Button
  onClick={handleFilter}
  style={{
    backgroundColor: '#B57B5B',
    borderColor: '#B57B5B',
    color: '#fff',
    fontFamily: 'Georgia, serif',
    width: '160px',
    boxShadow: 'none'
  }}
>
  Apply Filters
</Button>

<Button
  onClick={clearFilters}
  style={{
    backgroundColor: '#B57B5B',
    borderColor: '#B57B5B',
    color: '#fff',
    fontFamily: 'Georgia, serif',
    width: '160px',
    boxShadow: 'none'
  }}
>
  Clear Filters
</Button>

          </div>
        </div>

        {loading && <div className="text-center"><Spinner animation="border" /></div>}
        {!loading && currentCards.length === 0 && (
          <Alert variant="info" className="text-center">No products match your filters.</Alert>
        )}

        <TransitionGroup component={null}>
          {currentCards.map((item, idx) => (
            <CSSTransition key={idx} timeout={300} classNames="fade-slide" nodeRef={refs.current[idx]}>
              <div ref={refs.current[idx]} className="mb-4 bg-white rounded shadow-sm border" style={{ borderLeft: '5px solid #0d6efd' }}>
                <div className="d-flex justify-content-between align-items-center px-3 py-2" style={{ backgroundColor: '#f1f1f1', fontWeight: '500', fontSize: '0.9rem' }}>
                  <div>Ordered on: {new Date(item.orderTime).toLocaleDateString()}</div>
                  <div>Order ID: {item.orderId}</div>
                </div>

                

<Row className="align-items-center px-3 py-4">
  <Col xs={12} md={2} className="text-center mb-3 mb-md-0">
    <Image
      src={item.imageUrl}
      rounded
      fluid
      style={{ objectFit: 'cover', width: '140px', height: '140px' }}
    />
  </Col>

  <Col xs={12} md={6} className="text-center text-md-start">
    <div style={{ fontWeight: '600', fontSize: '1.2rem', color: '#000' }}>
      {item.productName}
    </div>
    <div className="mt-2">
      <span
        className={`badge bg-${getStatusColor(item.orderStatus)}`}
        style={{
          fontSize: '1rem',
          color: '#fff',
          fontFamily: 'Georgia, serif'
        }}
      >
        {item.orderStatus}
      </span>
    </div>
    <div className="mt-2" style={{ fontSize: '0.95rem', color: '#000' }}>
      {statusMsgMap[item.orderStatus] || ''}
    </div>
  </Col>

  <Col
    xs={12}
    md={4}
    className="d-flex flex-column align-items-center align-items-md-end gap-2 mt-3 mt-md-0"
  >
    <Button
  size="md"
  className="w-100"
  style={{
    backgroundColor: 'transparent',
    borderColor: '#B57B5B',
    color: '#000',
    fontFamily: 'Georgia, serif',
    boxShadow: 'none'
  }}
  onClick={() => navigate(`/user/orders/${item.orderId}`)}
>
      View Order
    </Button>


    <Button
  size="md"
  className="w-100"
  style={{
    backgroundColor: 'transparent',
    borderColor: '#B57B5B',
    color: '#000',
    fontFamily: 'Georgia, serif',
    boxShadow: 'none'
  }}
  onClick={() => navigate(`/product/${item.productId}`)}
>
  View Item
</Button>


    {['delivered', 'returned', 'replaced'].includes(item.orderStatus) && (
      <Button
      size="md"
      className="w-100"
      style={{
        backgroundColor: 'transparent',
        borderColor: '#B57B5B',
        color: '#000',
        fontFamily: 'Georgia, serif',
        boxShadow: 'none'
      }}
        onClick={() => navigate(`/feedback/${item.productId}`)}
      >
        Give Feedback
      </Button>
    )}
  </Col>
</Row>
</div>
</CSSTransition>
))}
</TransitionGroup>

{totalPages > 1 && (
  <div className="d-flex justify-content-center mt-4 flex-wrap gap-2">
    {/* Previous Button */}
    <Button
      size="md"
      style={{
        backgroundColor: 'transparent',
        borderColor: '#B57B5B',
        color: '#000',
        fontFamily: 'Georgia, serif',
        boxShadow: 'none',
        width: '85px',
        justifyContent: 'center',
        textAlign:'left'
      }}
      disabled={currentPage === 1}
      onClick={() => setCurrentPage(prev => prev - 1)}
    >
      Previous
    </Button>

{[...Array(totalPages)].map((_, i) => (
  <Button
    key={i}
    onClick={() => setCurrentPage(i + 1)}
    style={{
      backgroundColor: currentPage === i + 1 ? '#B57B5B' : 'transparent',
      borderColor: '#B57B5B',
      color: currentPage === i + 1 ? '#fff' : '#000',
      fontFamily: 'Georgia, serif',
      boxShadow: 'none',
      width: '45px' // optional: uniform width for buttons
    }}
  >
    {i + 1}
  </Button>
))}

<Button
  disabled={currentPage === totalPages}
  onClick={() => setCurrentPage(prev => prev + 1)}
  style={{
    backgroundColor: 'transparent',
    borderColor: '#B57B5B',
    color: '#000',
    fontFamily: 'Georgia, serif',
    boxShadow: 'none',
    width: '75px' // adjust for visual alignment
  }}
>
  Next
</Button>

</div>
)}
</Container>
</>
);
};

export default OrdersPage;
