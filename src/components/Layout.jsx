import React from 'react';
import { Container, Navbar, Nav, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaSignOutAlt } from 'react-icons/fa';
import { theme } from '../styles/theme';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardPath = () => {
    switch (user?.role) {
      case 'RECRUITER':
        return '/recruiter/dashboard';
      case 'INTERVIEWER':
        return '/interviewer/dashboard';
      case 'CANDIDATE':
        return '/candidate/dashboard';
      default:
        return '/login';
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100" style={{ background: theme.colors.background.app }}>
      {/* Header */}
      <Navbar 
        expand="lg" 
        className="shadow-sm"
        style={{ background: theme.colors.primary.gradient }}
      >
        <Container>
          <Navbar.Brand 
            href={getDashboardPath()} 
            className="fw-bold text-white"
            style={{ cursor: 'pointer' }}
          >
            ATS Portal
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto align-items-center">
              {user && (
                <>
                  <Nav.Item className="text-light me-3">
                    <FaUser className="me-2" />
                    {user.name}
                  </Nav.Item>
                  <Button
                    variant="outline-light"
                    size="sm"
                    onClick={handleLogout}
                  >
                    <FaSignOutAlt className="me-2" />
                    Logout
                  </Button>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Main Content */}
      <main className="flex-grow-1 py-4">
        <Container>
          {children}
        </Container>
      </main>

      {/* Footer */}
      <footer className="py-3 mt-auto" style={{ 
        background: theme.colors.primary.gradient,
        color: theme.colors.text.light 
      }}>
        <Container>
          <div className="text-center">
            <p className="mb-0">
              © {new Date().getFullYear()} ATS Portal. All rights reserved.
            </p>
          </div>
        </Container>
      </footer>
    </div>
  );
};

export default Layout; 