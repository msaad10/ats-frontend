import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Table, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalCandidates: 0,
    activeJobs: 0,
    totalUsers: 0,
    interviewsScheduled: 0
  });
  const [recentJobs, setRecentJobs] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [error, setError] = useState('');

  // Mock data for demonstration
  const mockStats = {
    totalCandidates: 150,
    activeJobs: 25,
    totalUsers: 50,
    interviewsScheduled: 45
  };

  const mockRecentJobs = [
    { id: 1, title: 'Senior Software Engineer', postedDate: '2024-03-20', applications: 25 },
    { id: 2, title: 'Product Manager', postedDate: '2024-03-19', applications: 18 },
    { id: 3, title: 'UX Designer', postedDate: '2024-03-18', applications: 12 }
  ];

  const mockRecentUsers = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'RECRUITER', joinDate: '2024-03-15' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'INTERVIEWER', joinDate: '2024-03-16' },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'ADMIN', joinDate: '2024-03-17' }
  ];

  const mockChartData = [
    { name: 'Jan', applications: 40, interviews: 30 },
    { name: 'Feb', applications: 45, interviews: 35 },
    { name: 'Mar', applications: 50, interviews: 40 },
    { name: 'Apr', applications: 55, interviews: 45 },
    { name: 'May', applications: 60, interviews: 50 }
  ];

  useEffect(() => {
    // Check if user is admin
    if (!user || user.role !== 'ADMIN') {
      navigate('/dashboard');
      return;
    }

    // In a real application, you would fetch this data from your API
    setStats(mockStats);
    setRecentJobs(mockRecentJobs);
    setRecentUsers(mockRecentUsers);
  }, [user, navigate]);

  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  return (
    <Container fluid className="py-4">
      <h1 className="mb-4">Admin Dashboard</h1>
      
      {error && <Alert variant="danger">{error}</Alert>}

      {/* Statistics Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Candidates</Card.Title>
              <Card.Text className="display-4">{stats.totalCandidates}</Card.Text>
              <Button variant="outline-primary" size="sm">View All</Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Active Jobs</Card.Title>
              <Card.Text className="display-4">{stats.activeJobs}</Card.Text>
              <Button variant="outline-primary" size="sm">Manage Jobs</Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Users</Card.Title>
              <Card.Text className="display-4">{stats.totalUsers}</Card.Text>
              <Button variant="outline-primary" size="sm">Manage Users</Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Interviews</Card.Title>
              <Card.Text className="display-4">{stats.interviewsScheduled}</Card.Text>
              <Button variant="outline-primary" size="sm">View Schedule</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row className="mb-4">
        <Col md={8}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Applications & Interviews Trend</Card.Title>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="applications" fill="#8884d8" />
                    <Bar dataKey="interviews" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Quick Actions</Card.Title>
              <div className="d-grid gap-2">
                <Button variant="primary">Post New Job</Button>
                <Button variant="secondary">Generate Reports</Button>
                <Button variant="info">Manage System Settings</Button>
                <Button variant="warning">View Audit Logs</Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Jobs and Users */}
      <Row>
        <Col md={6}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Recent Job Postings</Card.Title>
              <Table striped hover responsive>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Posted Date</th>
                    <th>Applications</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentJobs.map(job => (
                    <tr key={job.id}>
                      <td>{job.title}</td>
                      <td>{new Date(job.postedDate).toLocaleDateString()}</td>
                      <td>{job.applications}</td>
                      <td>
                        <Button variant="outline-primary" size="sm">Edit</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Recent Users</Card.Title>
              <Table striped hover responsive>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Join Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map(user => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.role}</td>
                      <td>{new Date(user.joinDate).toLocaleDateString()}</td>
                      <td>
                        <Button variant="outline-primary" size="sm">Edit</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard; 