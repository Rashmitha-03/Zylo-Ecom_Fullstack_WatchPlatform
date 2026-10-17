import React from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';





const AdminNavbar = () => {

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
        {/* Brand title */}
        <Navbar.Brand
          as={Link}
          to="/"
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

        <Navbar.Toggle aria-controls="admin-navbar" />
        <Navbar.Collapse id="admin-navbar">
          {/* Left-aligned nav */}
          <Nav className="me-auto" style={{ alignItems: 'center', gap: '1.5rem' }}>
            
          </Nav>

          {/* Right-aligned nav */}
          <Nav className="ms-auto" style={{ alignItems: 'center', gap: '1.5rem' }}>
            
              
              <Nav.Link as={Link} to="/userprofile" style={{ color: '#000' }}>
              Profile
            </Nav.Link>
            

            
            
            {isAuthenticated && (
                            <Nav.Link
                              onClick={handleLogout}
                              className="text-dark text-decoration-none"
                              style={{ fontWeight: '400' }}
                            >
                              Logout
                            </Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AdminNavbar;
