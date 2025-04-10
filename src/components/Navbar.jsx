import React from 'react';
import { Link, useLocation } from 'react-router-dom'
import { Navbar as BootstrapNavbar, Nav, Container } from 'react-bootstrap'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const { user, logout } = useAuth()
  const location = useLocation()

  return (
    <BootstrapNavbar bg="dark" variant="dark" expand="lg" className="mb-4">
      <Container>
        <BootstrapNavbar.Brand as={Link} to="/">
          ATS System
        </BootstrapNavbar.Brand>
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/" active={location.pathname === '/'}>
              Home
            </Nav.Link>
            <Nav.Link as={Link} to="/about" active={location.pathname === '/about'}>
              About
            </Nav.Link>
            {user && (
              <>
                <Nav.Link as={Link} to="/dashboard" active={location.pathname === '/dashboard'}>
                  Dashboard
                </Nav.Link>
                <Nav.Link as={Link} to="/jobs" active={location.pathname.startsWith('/jobs')}>
                  Jobs
                </Nav.Link>
                <Nav.Link as={Link} to="/candidates" active={location.pathname.startsWith('/candidates')}>
                  Candidates
                </Nav.Link>
                {user.role === 'ADMIN' && (
                  <Nav.Link as={Link} to="/admin" active={location.pathname === '/admin'}>
                    Admin Dashboard
                  </Nav.Link>
                )}
              </>
            )}
          </Nav>
          <Nav>
            {user ? (
              <Nav.Link onClick={logout}>Logout</Nav.Link>
            ) : (
              <>
                <Nav.Link as={Link} to="/login" active={location.pathname === '/login'}>
                  Login
                </Nav.Link>
                <Nav.Link as={Link} to="/register" active={location.pathname === '/register'}>
                  Register
                </Nav.Link>
              </>
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  )
}

export default Navbar 