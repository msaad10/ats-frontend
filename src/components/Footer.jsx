import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark text-light py-4 mt-auto">
      <Container>
        <Row>
          <Col md={4} className="mb-3">
            <h5>About Us</h5>
            <p className="text-muted">
              A modern Applicant Tracking System that helps companies streamline their hiring process
              and candidates find their dream jobs.
            </p>
          </Col>
          <Col md={4} className="mb-3">
            <h5>Quick Links</h5>
            <ul className="list-unstyled">
              <li><Link to="/" className="text-muted">Home</Link></li>
              <li><Link to="/about" className="text-muted">About</Link></li>
              <li><Link to="/jobs" className="text-muted">Jobs</Link></li>
              <li><Link to="/candidates" className="text-muted">Candidates</Link></li>
            </ul>
          </Col>
          <Col md={4} className="mb-3">
            <h5>Contact</h5>
            <ul className="list-unstyled text-muted">
              <li>Email: support@ats.com</li>
              <li>Phone: +1 (555) 123-4567</li>
              <li>Address: 123 Tech Street, Silicon Valley, CA</li>
            </ul>
          </Col>
        </Row>
        <hr className="my-4" />
        <Row>
          <Col className="text-center">
            <p className="mb-0">
              &copy; {currentYear} ATS - Applicant Tracking System. All rights reserved.
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer; 