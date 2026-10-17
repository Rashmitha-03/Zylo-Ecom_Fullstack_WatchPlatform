import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Card,
  Container,
  Row,
  Col,
  Form,
  Button,
  Modal
} from 'react-bootstrap';
import {
  fetchAllProducts,
  submitFeedback
} from '../services/orderService';
import { useAuth } from '../contexts/AuthContext';

const FeedbackPage = () => {
  const { productId } = useParams();
  const { user } = useAuth();
  const [productList, setProductList] = useState([]);
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetchAllProducts();
        setProductList(res.data);
      } catch (err) {
        console.error('Error fetching product list:', err);
      }
    };

    fetchProducts();
  }, [productId]);

  const matchedProduct = productList.find(
    (p) => String(p.productID) === String(productId)
  );

  const getImageSource = () => {
    if (!matchedProduct || !matchedProduct.imageURL) {
      return 'https://via.placeholder.com/300x300?text=No+Image';
    }
    return matchedProduct.imageURL.startsWith('http')
      ? matchedProduct.imageURL
      : `http://localhost:8015${matchedProduct.imageURL}`;
  };

  const handleSubmit = async () => {
    if (!rating || !reviewText.trim()) return;

    setSubmitting(true);
    try {
      await submitFeedback(productId, {
        rating,
        reviewText,
        userId: user?.id
      });
      setRating(0);
      setReviewText('');
      setShowModal(true);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = () =>
    [...Array(5)].map((_, i) => {
      const isFilled = i < (hoveredStar || rating);
      return (
        <span
          key={i}
          onMouseEnter={() => setHoveredStar(i + 1)}
          onMouseLeave={() => setHoveredStar(0)}
          onClick={() => setRating(i + 1)}
          style={{
            fontSize: '2rem',
            cursor: 'pointer',
            color: isFilled ? '#ffc107' : '#e4e5e9',
            transition: 'color 0.2s ease'
          }}
        >
          ★
        </span>
      );
    });

  return (
    <div style={{ paddingTop: '4rem', background: '#fff', minHeight: '100vh', fontFamily: 'Georgia, serif' }}>
      <Container className="my-5">
        <Row className="justify-content-center">
          <Col md={7} lg={6}>
            <Card
              className="text-center p-4 shadow-sm border-0"
              style={{ background: '#f2f2f2', borderRadius: '12px' }}
            >
              {matchedProduct && (
                <>
                  <div
                    className="mb-4"
                    style={{
                      height: '260px',
                      overflow: 'hidden',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderRadius: '8px'
                    }}
                  >
                   <img
  src={getImageSource()}
  alt={matchedProduct.productName}
  className="img-fluid rounded shadow"
  style={{
    height: '260px',
    overflow: 'hidden',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '8px'
  }}
  
/>

                  </div>
                  <h5 className="mb-3">{matchedProduct.productName}</h5>
                </>
              )}

              <h6 className="mb-2">How was the item?</h6>
              <div className="mb-3 d-flex justify-content-center gap-2">
                {renderStars()}
              </div>

              <Form.Control
                as="textarea"
                rows={4}
                placeholder="What should other customers know?"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="mb-3"
                style={{ resize: 'none', fontFamily: 'Georgia, serif' }}
              />

              <Button
                onClick={handleSubmit}
                disabled={!reviewText || rating === 0 || submitting}
                className="w-100"
                style={{
                  backgroundColor: 'transparent',
                  borderColor: '#B57B5B',
                  color: 'black',
                  fontFamily: 'Georgia, serif',
                  boxShadow: 'none',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#B57B5B';
                  e.target.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = 'black';
                }}
              >
                {submitting ? 'Submitting...' : 'Submit'}
              </Button>
            </Card>
          </Col>
        </Row>

        <Modal show={showModal} onHide={() => setShowModal(false)} centered>
          <Modal.Body className="text-center" style={{ fontFamily: 'Georgia, serif' }}>
            <h5 className="mb-3">Feedback submitted successfully!</h5>
            <Button
              variant="success"
              onClick={() => setShowModal(false)}
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Close
            </Button>
          </Modal.Body>
        </Modal>
      </Container>
    </div>
  );
};

export default FeedbackPage;
