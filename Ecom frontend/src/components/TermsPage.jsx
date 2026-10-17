import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const TermsPage = () => {
  return (
    <div className="py-5" style={{ backgroundColor: '#fefefe' ,marginTop: '4rem' }}>
      <Container>
        <Row className="justify-content-center mb-5">
          <Col lg={9} className="text-center">
            <h1 className="fw-bold text-uppercase mb-3">Terms & Conditions</h1>
            <p className="text-muted fs-6">
              Effective Date: July 2025
            </p>
            <p className="text-secondary fs-6">
              By accessing or using the Zylo website, services, or purchasing our products, you agree to the terms outlined below. Please read them carefully.
            </p>
          </Col>
        </Row>

        <Row className="justify-content-center">
          <Col lg={9}>
            <div className="mb-5">
              <h5 className="fw-semibold mb-3">1. General Overview</h5>
              <p>
                Zylo is a curated watch marketplace offering timeless, high-quality timepieces. These terms govern your use of our website, products, and services. By continuing to use Zylo, you acknowledge acceptance of these terms and our Privacy Policy.
              </p>
            </div>

            <div className="mb-5">
              <h5 className="fw-semibold mb-3">2. Product Information</h5>
              <p>
                We strive for accuracy, but product details such as color, texture, and design may vary slightly due to screen displays and limited-edition releases. All listings are subject to availability and may be changed or discontinued without notice.
              </p>
            </div>

            <div className="mb-5">
              <h5 className="fw-semibold mb-3">3. Orders & Payments</h5>
              <p>
                Orders are confirmed via email once payment is received. We accept multiple payment methods through secure gateways. Zylo reserves the right to cancel orders suspected of fraud or typographical pricing errors.
              </p>
            </div>

            <div className="mb-5">
              <h5 className="fw-semibold mb-3">4. Shipping & Returns</h5>
              <p>
                Estimated delivery timelines are shared during checkout. Tracking details are provided post-dispatch. Products may be returned or exchanged within 7 days of receipt, provided they are unused, in original packaging, and not custom-engraved.
              </p>
            </div>

            <div className="mb-5">
              <h5 className="fw-semibold mb-3">5. Warranty</h5>
              <p>
                All watches include a 1-year limited warranty covering manufacturing defects. Damage from misuse, wear-and-tear, or water beyond specified resistance is not covered.
              </p>
            </div>

            <div className="mb-5">
              <h5 className="fw-semibold mb-3">6. Intellectual Property</h5>
              <p>
                All visuals, designs, branding, and written content are the intellectual property of Zylo and may not be replicated or redistributed without prior written consent.
              </p>
            </div>

            <div className="mb-5">
              <h5 className="fw-semibold mb-3">7. Updates to Terms</h5>
              <p>
                These Terms & Conditions may be revised without prior notification. Updates are effective once posted on this page.
              </p>
            </div>

            <div className="mb-4">
              <h5 className="fw-semibold mb-3">8. Contact</h5>
              <p>
                For clarification or inquiries regarding these terms, you may contact us at <a href="mailto:support@zylo.store">support@zylo.store</a>.
              </p>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default TermsPage;
