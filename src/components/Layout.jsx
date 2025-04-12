import React from 'react';
import { Container, Navbar, Nav, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaSignOutAlt } from 'react-icons/fa';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  console.log(user, "user");

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
    <div className="d-flex flex-column min-vh-100">
      {/* Header */}
      <Navbar bg="dark" variant="dark" expand="lg" className="shadow-sm">
        <Container>
          <Navbar.Brand 
            href={getDashboardPath()} 
            className="fw-bold"
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
                    {user.userName}
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
      <footer className="bg-dark text-light py-3 mt-auto">
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