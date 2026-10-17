import { Navbar, Nav, Container } from 'react-bootstrap';
import { FaUser } from 'react-icons/fa';

const CustomNavbar = () => {
  return (
    <Navbar
      expand="lg"
      variant="light"
      style={{
        position: 'fixed',
        top: 0,
        width: '100%',
        zIndex: 10,
        backgroundColor: 'rgba(255,255,255,0.95)',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
      }}
    >
      <Container>
        {/* Brand title */}
        <Navbar.Brand
          href="#"
          style={{
            fontFamily: 'Georgia, serif',
            fontWeight: 'bold',
            letterSpacing: '1px',
            color: '#000',
            fontSize: '1.8rem',
          }}
        >
          ZYLO
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="main-navbar" />

        <Navbar.Collapse id="main-navbar">
          {/* Left-aligned nav items */}
          <Nav className="me-auto" style={{ alignItems: 'center', gap: '1.5rem' }}>
            <Nav.Link href="#home" style={{ color: '#000' }}>Home</Nav.Link>
            <Nav.Link href="#shop" style={{ color: '#000' }}>Shop</Nav.Link>
          </Nav>

          {/* Right-aligned nav items */}
          <Nav className="ms-auto" style={{ alignItems: 'center', gap: '1.5rem' }}>
            <Nav.Link href="#faq" style={{ color: '#000' }}>FAQ</Nav.Link>
            <Nav.Link href="#about" style={{ color: '#000' }}>About Us</Nav.Link>
            <Nav.Link href="#contact" style={{ color: '#000' }}>Contact</Nav.Link>
            <Nav.Link href="#login" style={{ color: '#000', display: 'flex', alignItems: 'center' }}>
              <FaUser style={{ marginRight: '5px' }} /> Login/Register
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default CustomNavbar;
