import React from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { FaUser, FaShoppingCart } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom'; 
import { HashLink } from 'react-router-hash-link';
import { useAuth } from '../contexts/AuthContext'; // ✅ Import the Auth context

const CustomNavbarLogin = ({ onCartClick }) => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // From context
  };

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
        <Navbar.Brand
          as={Link}
          to="/"
          style={{
            fontFamily: 'Georgia, serif',
            fontWeight: 'bold',
            letterSpacing: '1px',
            color: '#000',
            fontSize: '1.8rem',
            textDecoration: 'none',
          }}
        >
          ZYLO
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="main-navbar" />
        <Navbar.Collapse id="main-navbar">
          <Nav className="me-auto" style={{ alignItems: 'center', gap: '1.5rem' }}>
            <Nav.Link as={Link} to="/" style={{ color: '#000' }}>Home</Nav.Link>
            <Nav.Link as={Link} to="/products" style={{ color: '#000' }}>Shop</Nav.Link>
          </Nav>

          <Nav className="ms-auto" style={{ alignItems: 'center', gap: '1.5rem' }}>
            <Nav.Link as={Link} to="/faq" style={{ color: '#000' }}>FAQ</Nav.Link>
            <Nav.Link as={HashLink} smooth to="/#about" style={{ color: '#000' }}>
              About Us
            </Nav.Link>
            <Nav.Link as={Link} to="/contact" style={{ color: '#000' }}>Contact</Nav.Link>

            {isAuthenticated && (
              <>
                <NavDropdown
                  title={<><FaUser className="me-1" /> Profile</>}
                  id="profile-dropdown"
                  align="end"
                >
                  <NavDropdown.Item as={Link} to="/userprofile">View Profile</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/addresses">Addresses</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/orders">My Orders</NavDropdown.Item>
                </NavDropdown>

                <Nav.Link
                  onClick={handleLogout}
                  className="text-dark text-decoration-none"
                  style={{ fontWeight: '400' }}
                >
                  Logout
                </Nav.Link>
              </>
            )}

            <Nav.Link style={{ cursor: 'pointer' }} onClick={onCartClick}>
              <FaShoppingCart />
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default CustomNavbarLogin;