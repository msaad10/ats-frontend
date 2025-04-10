import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, Button, Container, Row, Col } from 'react-bootstrap';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  return (
    <div className="dashboard-container">
      <Container fluid>
        <Row className="mb-4">
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <h1 className="mb-0">Dashboard</h1>
              <Button variant="danger" onClick={logout}>
                Logout
              </Button>
            </div>
          </Col>
        </Row>
        <Row>
          <Col md={8} className="mb-4">
            <Card className="h-100">
              <Card.Body>
                <h2>Welcome to your Dashboard</h2>
                <p className="text-muted">You are successfully logged in</p>
                <div className="mt-4">
                  <h5>Your Session Information:</h5>
                  <div className="bg-light p-3 rounded">
                    <pre className="mb-0">
                      {JSON.stringify({ token: user?.token }, null, 2)}
                    </pre>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="h-100">
              <Card.Body>
                <h5>Quick Actions</h5>
                <div className="d-grid gap-2 mt-3">
                  <Button variant="outline-primary">View Profile</Button>
                  <Button variant="outline-secondary">Settings</Button>
                  <Button variant="outline-info">Help & Support</Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Dashboard; 