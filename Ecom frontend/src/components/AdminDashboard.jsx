import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  return (
    <div
      className="pb-5"
      style={{
        fontFamily: 'Georgia, serif',
        paddingTop: '6.8rem',
        backgroundColor: '#fff',
        minHeight: '100vh',
      }}
    >
      <Container>
        <h1 className="text-center fw-bold mb-3">Admin Dashboard</h1>
        <p className="text-center text-muted mb-5 fs-5">
          Welcome back. Here's your control center.
        </p>

        <Row className="g-5 justify-content-center">
          {[
            {
              title: '📦 Manage Products',
              description: 'Add, edit, or remove items from the catalog.',
              to: '/adminproduct',
            },
            {
              title: '👥 Manage Users',
              description: 'Control user access and view details.',
              to: '/manageusers',
            },
            {
              title: '🛒 Manage Orders',
              description: 'Track, review, and update customer orders.',
              to: '/admin',
            },
            {
              title: '📈 View Statistics',
              description: 'Monitor performance and sales trends.',
              to: '/admin/product-frequency',
            },
          ].map(({ title, description, to }) => (
            <Col xs={12} md={6} lg={5} key={to}>
              <Card
                className="shadow-lg h-100"
                style={{
                  backgroundColor: '#fefefe',
                  border: '1px solid #ddd',
                  transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,0,0,0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)';
                }}
              >
                <Card.Body className="text-center d-flex flex-column justify-content-between p-4">
                  <div>
                    <Card.Title className="mb-3 fs-5">{title}</Card.Title>
                    <Card.Text className="text-muted mb-4" style={{ minHeight: '60px' }}>
                      {description}
                    </Card.Text>
                  </div>
                  <Button
                    as={Link}
                    to={to}
                    size="lg"
                    className="fw-semibold px-5 py-2"
                    style={{
                      backgroundColor: '#B57B5B',
                      borderColor: '#B57B5B',
                      fontSize: '1rem',
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#a66d4b';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#B57B5B';
                    }}
                  >
                    Go
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
};

export default AdminDashboard;
