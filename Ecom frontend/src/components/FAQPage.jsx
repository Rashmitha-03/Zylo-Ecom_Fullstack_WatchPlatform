import React from 'react';
import { Container, Accordion, Row, Col } from 'react-bootstrap';

const faqs = [
  {
    section: 'Orders',
    questions: [
      {
        q: 'When do I receive my order?',
        a: 'When placing the order, a day of shipment is indicated. After the order has been placed, the same delivery time will also be stated on the order confirmation.'
      },
      {
        q: 'I now see a longer delivery time. How can I cancel it?',
        a: 'If the delivery time is longer than expected, you can contact our customer service to cancel all or part of the order. The refunded amount will be returned to your bank account within two working days. Orders that have already shipped cannot be canceled.'
      },
      {
        q: 'When will I receive the invoice?',
        a: 'Invoices are not automatically sent. You can download them from your account under "My Orders" or request one via our customer service.'
      }
    ]
  },
  {
    section: 'Shipment',
    questions: [
      {
        q: 'When do I receive my order?',
        a: 'The estimated shipping date is shown when you place your order and confirmed in your order confirmation email.'
      },
      {
        q: 'Can I cancel part of my order due to a delay?',
        a: 'Yes. If there is a delay, contact customer service to cancel. If your order has already shipped, cancellation is no longer possible.'
      },
      {
        q: 'How do I get the invoice?',
        a: 'Log into your account and view your orders to download the invoice. Alternatively, contact our support team.'
      }
    ]
  },
  {
    section: 'Returns & Complaints',
    questions: [
      {
        q: 'How do I cancel or exchange an order?',
        a: 'Contact our customer support to initiate a return or exchange. If the order has already shipped, it cannot be canceled but may be returned after delivery depending on our policy.'
      },
      {
        q: 'How will I receive the refund?',
        a: 'Once we receive and inspect the returned item, the refund will be processed to your original payment method within 2 business days.'
      },
      {
        q: 'How do I file a complaint?',
        a: 'Please contact our customer support with your order number and a description of the issue. We’ll work to resolve it quickly.'
      }
    ]
  }
];

const FAQPage = () => {
  return (
    <div
      className="pb-5"
      style={{
        backgroundColor: '#ffffff',
        paddingTop: '100px',
        fontFamily: 'Georgia, serif'
      }}
    >
      <Container>
        <Row className="justify-content-center mb-5">
          <Col lg={8} className="text-center">
            <h2 className="fw-bold mb-3">Frequently Asked Questions</h2>
            <p className="text-muted fs-6">
              Find answers to common questions about your orders, shipping, and returns.
            </p>
          </Col>
        </Row>

        {faqs.map((section, index) => (
          <Row key={index} className="justify-content-center mb-4">
            <Col lg={10} xl={9}>
              <h5
                className={`${
                  index !== 0 ? 'mt-5' : ''
                } mb-3 text-capitalize border-bottom pb-1`}
              >
                {section.section}
              </h5>
              <Accordion defaultActiveKey="0" flush>
                {section.questions.map((faq, i) => (
                  <Accordion.Item eventKey={i.toString()} key={i}>
                    <Accordion.Header>{faq.q}</Accordion.Header>
                    <Accordion.Body
                      style={{
                        backgroundColor: '#f3ebe1',
                        borderRadius: '0 0 5px 5px',
                        lineHeight: '1.65',
                        fontSize: '1.05rem'
                      }}
                    >
                      {faq.a}
                    </Accordion.Body>
                  </Accordion.Item>
                ))}
              </Accordion>
            </Col>
          </Row>
        ))}
      </Container>
    </div>
  );
};

export default FAQPage;
