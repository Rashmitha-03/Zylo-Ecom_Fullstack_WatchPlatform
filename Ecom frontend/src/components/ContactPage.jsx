import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';

const ContactPage = () => {
  const [showAlert, setShowAlert] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowAlert(true);

    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    });

    setTimeout(() => setShowAlert(false), 3000);
  };

  return (
    <div className="pb-5" style={{ backgroundColor: '#ffffff', paddingTop: '100px', fontFamily: 'Georgia, serif' }}>
      <Container>
        <Row className="justify-content-center mb-5">
          <Col lg={8} className="text-center">
            <h2 className="fw-bold mb-2 display-6">Connect With Us</h2>
            <p className="text-muted fs-6">
              Whether you're a customer, collaborator, or just curious — we're here to help.
              Reach out and our team will get back to you within 24 hours.
            </p>
          </Col>
        </Row>

        <Row className="gx-5">
          <Col lg={5} className="mb-4">
            <Card
              className="shadow-sm"
              style={{ border: '2px solid #000', borderRadius: '0.65rem' }}
            >
              <Card.Body>
                <h5 className="mb-3">Zylo Headquarters</h5>
                <p className="mb-2">
                  200 IT Highway<br />
                  Siruseri, Chennai, Tamil Nadu 603103<br />
                  India
                </p>
                <p className="mb-2">
                  <strong>Phone:</strong> +91 98213 45678<br />
                  <strong>Email:</strong> support@zylo.store
                </p>
                <div className="ratio ratio-4x3 rounded overflow-hidden mt-3">
                  <iframe
                    title="Cognizant Siruseri Chennai Map"
                    src="https://maps.google.com/maps?q=cognizant%20siruseri%20chennai&t=&z=14&ie=UTF8&iwloc=&output=embed"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                  ></iframe>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={7}>
            <Card
              className="shadow-sm"
              style={{ border: '2px solid #000', borderRadius: '0.65rem' }}
            >
              <Card.Body>
                <h5 className="mb-3" style={{textAlign:'center'}}>Send Us a Message</h5>

                {showAlert && (
                  <Alert
                    variant="success"
                    onClose={() => setShowAlert(false)}
                    dismissible
                    className="mb-4"
                  >
                     Your message has been sent!
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Row className="mb-3">
                    <Col md={6}>
                      <Form.Group controlId="formName">
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                          type="text"
                          name="name"
                          placeholder="Your name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          style={{ fontFamily: 'Georgia, serif' }}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group controlId="formEmail">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          placeholder="name@example.com"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          style={{ fontFamily: 'Georgia, serif' }}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3" controlId="formSubject">
                    <Form.Label>Subject</Form.Label>
                    <Form.Control
                      type="text"
                      name="subject"
                      placeholder="Subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      style={{ fontFamily: 'Georgia, serif' }}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="formMessage">
                    <Form.Label>Message</Form.Label>
                    <Form.Control
                      as="textarea"
                      name="message"
                      rows={5}
                      placeholder="Write your message..."
                      value={formData.message}
                      onChange={handleChange}
                      required
                      style={{ fontFamily: 'Georgia, serif' }}
                    />
                  </Form.Group>

                  <div className="d-grid">
                    <Button
                      type="submit"
                      style={{
                        backgroundColor: '#B57B5B',
                        borderColor: '#000',
                        fontFamily: 'Georgia, serif'
                      }}
                    >
                      Send Message
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ContactPage;
