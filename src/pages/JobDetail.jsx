import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Button, Row, Col, Alert, Badge } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import jobService from '../services/jobService';
import { theme } from '../styles/theme';

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applied, setApplied] = useState(false);
  const [applying, setApplying] = useState(false);
  const [showJobModal, setShowJobModal] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const data = await jobService.getJobById(id);
        setJob(data);
        // Check if user has already applied
        if (user && data.applications) {
          setApplied(data.applications.some(app => app.userId === user.id));
        }
      } catch (err) {
        setError('Failed to load job details');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id, user]);

  const handleApply = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setApplying(true);
    try {
      await jobService.applyForJob(id);
      setApplied(true);
    } catch (err) {
      setError('Failed to apply for the job');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <Container className="mt-4">
        <div className="text-center">Loading...</div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (!job) {
    return (
      <Container className="mt-4">
        <Alert variant="warning">Job not found</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Card>
        <Card.Body>
          <Row>
            <Col md={8}>
              <h2>{job.title}</h2>
              <p className="text-muted">{job.department}</p>
              <div className="mb-3">
                <Badge style={{ 
                  background: theme.colors.primary.gradientButton,
                  padding: '0.5rem 1rem'
                }}>
                  {job.location}
                </Badge>
              </div>
            </Col>
            <Col md={4} className="text-md-end">
              {user?.role === 'CANDIDATE' && (
                <Button
                  className={`btn-gradient ${applied ? 'disabled' : ''}`}
                  onClick={handleApply}
                  disabled={applied || applying}
                  style={{
                    border: 'none',
                    padding: '0.5rem 1rem',
                    fontWeight: 500,
                    opacity: applied ? 0.7 : 1
                  }}
                >
                  {applied ? 'Applied' : applying ? 'Applying...' : 'Apply Now'}
                </Button>
              )}
            </Col>
          </Row>

          <Row className="mt-4">
            <Col md={8}>
              <h4>Job Requirements</h4>
              <p>{job.description}</p>

            </Col>
            <Col md={4}>
              <Card className="mb-3">
                <Card.Body>
                  <h5>Job Details</h5>
                  <p><strong>Posted:</strong> {new Date(job.createdAt).toLocaleDateString()}</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      {/* <Button variant="primary" onClick={() => setShowJobModal(true)}>
        Create New Job
      </Button> */}
    </Container>
  );
};

export default JobDetail; 